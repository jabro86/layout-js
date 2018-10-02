import * as React from "react";
import * as ReactDOM from "react-dom";

import DockLocation from "../DockLocation";
import DragDrop from "../DragDrop";
import Action from "../model/Action";
import Actions from "../model/Actions";
import BorderNode from "../model/BorderNode";
import BorderSet from "../model/BorderSet";
import IDraggable from "../model/IDraggable";
import Model from "../model/Model";
import Node from "../model/Node";
import RowNode from "../model/RowNode";
import SplitterNode from "../model/SplitterNode";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import Rect from "../Rect";
import { JSMap } from "../Types";
import { BorderTabSet } from "./BorderTabSet";
import { Splitter } from "./Splitter";
import { Tab } from "./Tab";
import { TabSet } from "./TabSet";

export interface ILayoutProps {
  model: Model;
  factory: (node: TabNode) => React.ReactNode;
  onAction?: (action: Action) => void;
  onRenderTab?: (
    node: TabNode,
    renderValues: { leading: React.ReactNode; content: React.ReactNode }
  ) => void;
  onRenderTabSet?: (
    tabSetNode: TabSetNode | BorderNode,
    renderValues: { headerContent?: React.ReactNode; buttons: Array<React.ReactNode> }
  ) => void;
  onModelChange?: (model: Model) => void;
}

/**
 * A React component that hosts a multi-tabbed layout
 */
export class Layout extends React.Component<ILayoutProps, any> {
  selfRef?: HTMLDivElement;

  private model?: Model;
  private rect: Rect;
  private centerRect?: Rect;
  private tabIds: Array<string>;
  private newTabJson: any;
  private firstMove: boolean = false;
  private dragNode?: Node & IDraggable;
  private dragDiv?: HTMLDivElement;
  private dragDivText: string = "";
  private dropInfo: any;
  private outlineDiv?: HTMLDivElement;
  private edgeRightDiv?: HTMLDivElement;
  private edgeBottomDiv?: HTMLDivElement;
  private edgeLeftDiv?: HTMLDivElement;
  private edgeTopDiv?: HTMLDivElement;
  private fnNewNodeDropped?: (() => void);

  constructor(props: ILayoutProps) {
    super(props);
    this.model = this.props.model;
    this.rect = new Rect(0, 0, 0, 0);
    this.model._setChangeListener(this.onModelChange.bind(this));
    this.updateRect = this.updateRect.bind(this);
    this.tabIds = [];
  }

  onModelChange() {
    this.forceUpdate();
    if (this.props.onModelChange) {
      this.props.onModelChange(this.model!);
    }
  }

  doAction(action: Action): void {
    if (this.props.onAction !== undefined) {
      this.props.onAction(action);
    } else {
      this.model!.doAction(action);
    }
  }

  componentWillReceiveProps(newProps: ILayoutProps) {
    if (this.model !== newProps.model) {
      if (this.model !== undefined) {
        this.model._setChangeListener(undefined); // stop listening to old model
      }
      this.model = newProps.model;
      this.model._setChangeListener(this.onModelChange.bind(this));
      this.forceUpdate();
    }
  }

  componentDidMount() {
    this.updateRect();

    // need to re-render if size changes
    window.addEventListener("resize", this.updateRect);
  }

  componentDidUpdate() {
    this.updateRect();
  }

  updateRect() {
    const domRect = (this.selfRef as HTMLDivElement).getBoundingClientRect();
    const rect = new Rect(0, 0, domRect.width, domRect.height);
    if (!rect.equals(this.rect)) {
      this.rect = rect;
      this.forceUpdate();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateRect);
  }

  render() {
    const borderComponents: Array<React.ReactNode> = [];
    const tabSetComponents: Array<React.ReactNode> = [];
    const tabComponents: JSMap<React.ReactNode> = {};
    const splitterComponents: Array<React.ReactNode> = [];

    this.centerRect = this.model!._layout(this.rect);

    this.renderBorder(
      this.model!.getBorderSet(),
      borderComponents,
      tabComponents,
      splitterComponents
    );
    this.renderChildren(this.model!.getRoot(), tabSetComponents, tabComponents, splitterComponents);

    const nextTopIds: Array<string> = [];
    const nextTopIdsMap: JSMap<string> = {};

    // Keep any previous tabs in the same DOM order as before, removing any that have been deleted
    this.tabIds.forEach(t => {
      if (tabComponents[t]) {
        nextTopIds.push(t);
        nextTopIdsMap[t] = t;
      }
    });
    this.tabIds = nextTopIds;

    // Add tabs that have been added to the DOM
    Object.keys(tabComponents).forEach(t => {
      if (!nextTopIdsMap[t]) {
        this.tabIds.push(t);
      }
    });

    return (
      <div
        ref={self => (this.selfRef = self === null ? undefined : self)}
        className="flexlayout__layout"
      >
        {tabSetComponents}
        {this.tabIds.map(t => {
          return tabComponents[t];
        })}
        {borderComponents}
        {splitterComponents}
      </div>
    );
  }

  renderBorder(
    borderSet: BorderSet,
    borderComponents: Array<React.ReactNode>,
    tabComponents: JSMap<React.ReactNode>,
    splitterComponents: Array<React.ReactNode>
  ) {
    for (let i = 0; i < borderSet.getBorders().length; i++) {
      const border = borderSet.getBorders()[i];
      if (border.isShowing()) {
        borderComponents.push(
          <BorderTabSet
            key={"border_" + border.getLocation().getName()}
            border={border}
            layout={this}
          />
        );
        const drawChildren = border._getDrawChildren();
        for (let i = 0; i < drawChildren.length; i++) {
          const child = drawChildren[i];

          if (child instanceof SplitterNode) {
            splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child} />);
          } else if (child instanceof TabNode) {
            tabComponents[child.getId()] = (
              <Tab
                key={child.getId()}
                layout={this}
                node={child}
                selected={i === border.getSelected()}
                factory={this.props.factory}
              />
            );
          }
        }
      }
    }
  }

  renderChildren(
    node: RowNode | TabSetNode,
    tabSetComponents: Array<React.ReactNode>,
    tabComponents: JSMap<React.ReactNode>,
    splitterComponents: Array<React.ReactNode>
  ) {
    const drawChildren = node._getDrawChildren();

    for (let i = 0; i < drawChildren!.length; i++) {
      const child = drawChildren![i];

      if (child instanceof SplitterNode) {
        splitterComponents.push(<Splitter key={child.getId()} layout={this} node={child} />);
      } else if (child instanceof TabSetNode) {
        tabSetComponents.push(<TabSet key={child.getId()} layout={this} node={child} />);
        this.renderChildren(child, tabSetComponents, tabComponents, splitterComponents);
      } else if (child instanceof TabNode) {
        const selectedTab = child.getParent()!.getChildren()[
          (child.getParent() as TabSetNode).getSelected()
        ];
        if (selectedTab === undefined) {
          debugger; // this should not happen!
        }
        tabComponents[child.getId()] = (
          <Tab
            key={child.getId()}
            layout={this}
            node={child}
            selected={child === selectedTab}
            factory={this.props.factory}
          />
        );
      } else {
        // is row
        this.renderChildren(child as RowNode, tabSetComponents, tabComponents, splitterComponents);
      }
    }
  }

  /**
   * Adds a new tab to the given tabset
   * @param tabsetId the id of the tabset where the new tab will be added
   * @param json the json for the new tab node
   */
  addTabToTabSet(tabsetId: string, json: any) {
    const tabsetNode = this.model!.getNodeById(tabsetId);
    if (tabsetNode !== undefined) {
      this.doAction(Actions.addNode(json, tabsetId, DockLocation.CENTER, -1));
    }
  }

  /**
   * Adds a new tab to the active tabset (if there is one)
   * @param json the json for the new tab node
   * @hidden @internal
   */
  addTabToActiveTabSet(json: any) {
    const tabsetNode = this.model!.getActiveTabset();
    if (tabsetNode !== undefined) {
      this.doAction(Actions.addNode(json, tabsetNode.getId(), DockLocation.CENTER, -1));
    }
  }

  /**
   * Adds a new tab by dragging a labeled panel to the drop location, dragging starts immediatelly
   * @param dragText the text to show on the drag panel
   * @param json the json for the new tab node
   * @param onDrop a callback to call when the drag is complete
   */
  addTabWithDragAndDrop(dragText: string, json: any, onDrop: () => void) {
    this.fnNewNodeDropped = onDrop;
    this.newTabJson = json;
    this.dragStart(
      undefined,
      dragText,
      TabNode._fromJson(json, this.model!),
      true,
      undefined,
      undefined
    );
  }

  /**
   * Adds a new tab by dragging a labeled panel to the drop location, dragging starts when you
   * mouse down on the panel
   *
   * @param dragText the text to show on the drag panel
   * @param json the json for the new tab node
   * @param onDrop a callback to call when the drag is complete
   */
  addTabWithDragAndDropIndirect(dragText: string, json: any, onDrop: () => void) {
    this.fnNewNodeDropped = onDrop;
    this.newTabJson = json;

    DragDrop.instance.addGlass(this.onCancelAdd.bind(this));

    this.dragDivText = dragText;
    this.dragDiv = document.createElement("div");
    this.dragDiv.className = "flexlayout__drag_rect";
    this.dragDiv.innerHTML = this.dragDivText;
    this.dragDiv.addEventListener("mousedown", this.onDragDivMouseDown.bind(this));
    this.dragDiv.addEventListener("touchstart", this.onDragDivMouseDown.bind(this));

    const r = new Rect(10, 10, 150, 50);
    r.centerInRect(this.rect);
    this.dragDiv.style.left = r.x + "px";
    this.dragDiv.style.top = r.y + "px";

    const rootdiv = ReactDOM.findDOMNode(this);
    if (rootdiv !== null && rootdiv instanceof Element) {
      rootdiv.appendChild(this.dragDiv);
    }
  }

  onCancelAdd() {
    const rootdiv = ReactDOM.findDOMNode(this);
    if (rootdiv !== null && rootdiv instanceof Element) {
      rootdiv.removeChild(this.dragDiv!);
    }
    this.dragDiv = undefined;
    if (this.fnNewNodeDropped !== undefined) {
      this.fnNewNodeDropped();
      this.fnNewNodeDropped = undefined;
    }
    DragDrop.instance.hideGlass();
    this.newTabJson = undefined;
  }

  onCancelDrag(wasDragging: boolean) {
    if (wasDragging) {
      const rootdiv = ReactDOM.findDOMNode(this) as HTMLDivElement;

      try {
        rootdiv.removeChild(this.outlineDiv!);
      } catch (e) {
        /* do nothing */
      }

      try {
        rootdiv.removeChild(this.dragDiv!);
      } catch (e) {
        /* do nothing */
      }

      this.dragDiv = undefined;
      this.hideEdges(rootdiv);
      if (this.fnNewNodeDropped !== undefined) {
        this.fnNewNodeDropped();
        this.fnNewNodeDropped = undefined;
      }
      DragDrop.instance.hideGlass();
      this.newTabJson = undefined;
    }
  }

  onDragDivMouseDown(event: Event) {
    event.preventDefault();
    this.dragStart(
      event,
      this.dragDivText,
      TabNode._fromJson(this.newTabJson, this.model!),
      true,
      undefined,
      undefined
    );
  }

  dragStart(
    event: Event | undefined,
    dragDivText: string,
    node: Node & IDraggable,
    allowDrag: boolean,
    onClick?: (event: Event) => void,
    onDoubleClick?: (event: Event) => void
  ) {
    if (this.model!.getMaximizedTabset() !== undefined || !allowDrag) {
      DragDrop.instance.startDrag(
        event,
        undefined,
        undefined,
        undefined,
        undefined,
        onClick,
        onDoubleClick
      );
    } else {
      this.dragNode = node;
      this.dragDivText = dragDivText;
      DragDrop.instance.startDrag(
        event,
        this.onDragStart.bind(this),
        this.onDragMove.bind(this),
        this.onDragEnd.bind(this),
        this.onCancelDrag.bind(this),
        onClick,
        onDoubleClick
      );
    }
  }

  onDragStart(event: React.FormEvent<Element>) {
    this.dropInfo = undefined;
    const rootdiv = ReactDOM.findDOMNode(this) as HTMLElement;
    this.outlineDiv = document.createElement("div");
    this.outlineDiv.className = "flexlayout__outline_rect";
    rootdiv.appendChild(this.outlineDiv);

    if (this.dragDiv === undefined) {
      this.dragDiv = document.createElement("div");
      this.dragDiv.className = "flexlayout__drag_rect";
      this.dragDiv.innerHTML = this.dragDivText;
      rootdiv.appendChild(this.dragDiv);
    }
    // add edge indicators
    this.showEdges(rootdiv);

    if (
      this.dragNode !== undefined &&
      this.dragNode instanceof TabNode &&
      this.dragNode.getTabRect() !== undefined
    ) {
      this.dragNode.getTabRect()!.positionElement(this.outlineDiv);
    }
    this.firstMove = true;

    return true;
  }

  onDragMove(event: React.MouseEvent<Element>) {
    if (this.firstMove === false) {
      this.outlineDiv!.style.transition = "top .3s, left .3s, width .3s, height .3s";
    }
    this.firstMove = false;
    const clientRect = this.selfRef!.getBoundingClientRect();
    const pos = {
      x: event.clientX - clientRect.left,
      y: event.clientY - clientRect.top
    };

    this.dragDiv!.style.left = pos.x - this.dragDiv!.getBoundingClientRect().width / 2 + "px";
    this.dragDiv!.style.top = pos.y + 5 + "px";

    const dropInfo = this.model!._findDropTargetNode(this.dragNode!, pos.x, pos.y);
    if (dropInfo) {
      this.dropInfo = dropInfo;
      this.outlineDiv!.className = dropInfo.className;
      dropInfo.rect.positionElement(this.outlineDiv!);
    }
  }

  onDragEnd(event: React.FormEvent<Element>) {
    const rootdiv = ReactDOM.findDOMNode(this) as HTMLElement;
    rootdiv.removeChild(this.outlineDiv!);
    rootdiv.removeChild(this.dragDiv!);
    this.dragDiv = undefined;
    this.hideEdges(rootdiv);
    DragDrop.instance.hideGlass();

    if (this.dropInfo) {
      if (this.newTabJson !== undefined) {
        this.doAction(
          Actions.addNode(
            this.newTabJson,
            this.dropInfo.node.getId(),
            this.dropInfo.location,
            this.dropInfo.index
          )
        );

        if (this.fnNewNodeDropped !== undefined) {
          this.fnNewNodeDropped();
          this.fnNewNodeDropped = undefined;
        }
        this.newTabJson = undefined;
      } else if (this.dragNode !== undefined) {
        this.doAction(
          Actions.moveNode(
            this.dragNode.getId(),
            this.dropInfo.node.getId(),
            this.dropInfo.location,
            this.dropInfo.index
          )
        );
      }
    }
  }

  showEdges(rootdiv: HTMLElement) {
    if (this.model!.isEnableEdgeDock()) {
      const domRect = rootdiv.getBoundingClientRect();
      const r = this.centerRect!;
      const size = 100;
      const length = size + "px";
      const radius = "50px";
      const width = "10px";

      this.edgeTopDiv = document.createElement("div");
      this.edgeTopDiv.className = "flexlayout__edge_rect";
      this.edgeTopDiv.style.top = r.y + "px";
      this.edgeTopDiv.style.left = r.x + (r.width - size) / 2 + "px";
      this.edgeTopDiv.style.width = length;
      this.edgeTopDiv.style.height = width;
      this.edgeTopDiv.style.borderBottomLeftRadius = radius;
      this.edgeTopDiv.style.borderBottomRightRadius = radius;

      this.edgeLeftDiv = document.createElement("div");
      this.edgeLeftDiv.className = "flexlayout__edge_rect";
      this.edgeLeftDiv.style.top = r.y + (r.height - size) / 2 + "px";
      this.edgeLeftDiv.style.left = r.x + "px";
      this.edgeLeftDiv.style.width = width;
      this.edgeLeftDiv.style.height = length;
      this.edgeLeftDiv.style.borderTopRightRadius = radius;
      this.edgeLeftDiv.style.borderBottomRightRadius = radius;

      this.edgeBottomDiv = document.createElement("div");
      this.edgeBottomDiv.className = "flexlayout__edge_rect";
      this.edgeBottomDiv.style.bottom = domRect.height - r.getBottom() + "px";
      this.edgeBottomDiv.style.left = r.x + (r.width - size) / 2 + "px";
      this.edgeBottomDiv.style.width = length;
      this.edgeBottomDiv.style.height = width;
      this.edgeBottomDiv.style.borderTopLeftRadius = radius;
      this.edgeBottomDiv.style.borderTopRightRadius = radius;

      this.edgeRightDiv = document.createElement("div");
      this.edgeRightDiv.className = "flexlayout__edge_rect";
      this.edgeRightDiv.style.top = r.y + (r.height - size) / 2 + "px";
      this.edgeRightDiv.style.right = domRect.width - r.getRight() + "px";
      this.edgeRightDiv.style.width = width;
      this.edgeRightDiv.style.height = length;
      this.edgeRightDiv.style.borderTopLeftRadius = radius;
      this.edgeRightDiv.style.borderBottomLeftRadius = radius;

      rootdiv.appendChild(this.edgeTopDiv);
      rootdiv.appendChild(this.edgeLeftDiv);
      rootdiv.appendChild(this.edgeBottomDiv);
      rootdiv.appendChild(this.edgeRightDiv);
    }
  }

  hideEdges(rootdiv: HTMLElement) {
    if (this.model!.isEnableEdgeDock()) {
      try {
        rootdiv.removeChild(this.edgeTopDiv!);
        rootdiv.removeChild(this.edgeLeftDiv!);
        rootdiv.removeChild(this.edgeBottomDiv!);
        rootdiv.removeChild(this.edgeRightDiv!);
      } catch (e) {
        /* do nothing */
      }
    }
  }

  maximize(tabsetNode: TabSetNode) {
    this.doAction(Actions.maximizeToggle(tabsetNode.getId()));
  }

  customizeTab(
    tabNode: TabNode,
    renderValues: { leading: React.ReactNode; content: React.ReactNode }
  ) {
    if (this.props.onRenderTab) {
      this.props.onRenderTab(tabNode, renderValues);
    }
  }

  customizeTabSet(
    tabSetNode: TabSetNode | BorderNode,
    renderValues: { headerContent?: React.ReactNode; buttons: Array<React.ReactNode> }
  ) {
    if (this.props.onRenderTabSet) {
      this.props.onRenderTabSet(tabSetNode, renderValues);
    }
  }
}

export default Layout;
