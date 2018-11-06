import * as React from "react";

import { Model, RowNode, TabSetNode } from "./Model";
import { Rect } from "./Rect";
import { TabSet } from "./TabSet";
import { FlatDataNode, getFlatDataFromTree, getTreeFromFlatData } from "./utils";

interface Props {
  model: Model;
}

interface State {
  rect: Rect;
  nodes: FlatDataNode[];
  activeTabSet: TabSetNode | undefined;
}

export class Layout extends React.Component<Props, State> {
  private ref: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.ref = React.createRef<HTMLDivElement>();

    const nodes = getFlatDataFromTree({
      treeData: [props.model.layout],
      getNodeKey: ({ node }) => node.id,
      ignoreCollapsed: false
    });

    this.state = {
      rect: { x: 0, y: 0, width: 0, height: 0 },
      nodes,
      activeTabSet: undefined
    };
  }

  componentDidMount = () => {
    if (this.ref.current) {
      const { width, height } = this.ref.current.getBoundingClientRect();
      const rect: Rect = {
        x: 0,
        y: 0,
        width,
        height
      };
      this.setState({ rect });
    }
  };

  render() {
    return (
      // FIXME: cannot use styled element with ref
      // maybe forwardRef solves the issue
      <div
        ref={this.ref}
        style={{
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          position: "absolute",
          overflow: "hidden"
        }}
      >
        {this.renderChildren()}
      </div>
    );
  }

  renderChildren = () => {
    const rootNode = getTreeFromFlatData({
      flatData: this.state.nodes,
      getKey: (node: FlatDataNode) => {
        return node.node.id;
      },
      getParentKey: (node: FlatDataNode) => {
        if (node.parentNode) {
          return node.parentNode.id;
        }
        return "root";
      },
      rootKey: "root"
    })[0];

    const { children } = rootNode;
    const nodes = children.map(child => child.node);
    const totalWeight = calcTotalWeight(nodes);
    let p = 0;
    return children.map((child, i) => {
      const nodeValue = child.node;
      let currentWidth = 0;
      if (totalWeight !== 0) {
        currentWidth = Math.floor(this.state.rect.width * (nodeValue.weight / totalWeight));
      }

      // TODO: think about adjusting sizes to exactly fit the screen
      // e.g. if totalSizeGiven < pixelSize (= parentRect.width)
      const rect: Rect = {
        x: this.state.rect.x + p,
        y: this.state.rect.y,
        width: currentWidth,
        height: this.state.rect.height
      };

      p += currentWidth;

      switch (nodeValue.type) {
        case "row":
          return <h1>Row</h1>;
        case "tabset":
          return (
            <TabSet
              key={`tabset-${i}`}
              id={i}
              rect={rect}
              selected={nodeValue.selected}
              isActive={this.state.activeTabSet && this.state.activeTabSet.id === nodeValue.id}
              onTabButtonClicked={this.handleTabButtonClicked}
            >
              {nodeValue.children}
            </TabSet>
          );
      }
    });
  };

  handleTabButtonClicked = (id: string): void => {
    const currentTab = this.state.nodes.find(node => node.node.id === id);
    if (currentTab) {
      const { parentNode: activeTabSet } = currentTab;
      if (activeTabSet === undefined || activeTabSet.type !== "tabset") {
        throw Error(`No parent not found for ${id}!`);
      }
      const nodes = this.state.nodes.map(node => {
        if (node.node.id === activeTabSet.id) {
          if (node.node.type !== "tabset") {
            throw Error(`Node ${node.node.id} not a tabset!`);
          }
          node.node.selected = id;
        }
        return node;
      });
      this.setState({ activeTabSet, nodes });
    }
  };
}

function calcTotalWeight(nodes: (TabSetNode | RowNode)[]): number {
  return nodes.reduce((totalWeight, node) => (totalWeight += node.weight), 0);
}
