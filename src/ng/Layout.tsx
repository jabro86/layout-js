import * as React from "react";

import { Model, RowNode, TabSetNode } from "./Model";
import { Rect } from "./Rect";
import { TabSet } from "./TabSet";

interface Props {
  model: Model;
}

interface State {
  rect: Rect;
  model: Model;
  activeTabSet: TabSetNode | undefined;
}

export class Layout extends React.Component<Props, State> {
  private ref: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.ref = React.createRef<HTMLDivElement>();
    this.state = {
      rect: { x: 0, y: 0, width: 0, height: 0 },
      model: props.model,
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
    const { children } = this.props.model.layout;
    const totalWeight = calcTotalWeight(children);
    let p = 0;
    return children.map((child, i) => {
      let currentWidth = 0;
      if (totalWeight !== 0) {
        currentWidth = Math.floor(this.state.rect.width * (child.weight / totalWeight));
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

      switch (child.type) {
        case "row":
          return <h1>Row</h1>;
        case "tabset":
          return (
            <TabSet
              key={`tabset-${i}`}
              id={i}
              rect={rect}
              selected={child.selected}
              isActive={this.state.activeTabSet && this.state.activeTabSet.id === child.id}
              onTabButtonClicked={this.handleTabButtonClicked}
            >
              {child.children}
            </TabSet>
          );
      }
    });
  };

  handleTabButtonClicked = (id: string): void => {
    const newModel = { ...this.state.model };
    newModel.layout.children.forEach(child => {
      if (child.type === "tabset") {
        let idx = child.selected;
        child.children.forEach((tab, i) => {
          if (tab.id === id) {
            idx = i;
            this.setState({ activeTabSet: child });
          }
        });
        child.selected = idx;
      }
    });
    this.setState({ model: newModel });
  };
}

function calcTotalWeight(nodes: (TabSetNode | RowNode)[]): number {
  return nodes.reduce((totalWeight, node) => (totalWeight += node.weight), 0);
}
