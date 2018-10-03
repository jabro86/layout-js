import * as React from "react";

import { Model, RowNode, TabSetNode } from "./Model";
import { Rect } from "./Rect";
import { TabSet } from "./TabSet";

interface Props {
  model: Model;
}

interface State {
  rect: Rect;
}

export class Layout extends React.Component<Props, State> {
  private ref: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.ref = React.createRef<HTMLDivElement>();
    this.state = {
      rect: { x: 0, y: 0, width: 0, height: 0 }
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
        {renderChildren(this.props.model, this.state.rect)}
      </div>
    );
  }
}

function renderChildren(model: Model, parentRect: Rect): JSX.Element[] {
  const { children } = model.layout;
  const totalWeight = calcTotalWeight(children);
  let p = 0;
  return children.map((child, i) => {
    let currentWidth = 0;
    if (totalWeight !== 0) {
      currentWidth = Math.floor(parentRect.width * (child.weight / totalWeight));
    }

    // TODO: think about adjusting sizes to exactly fit the screen
    // e.g. if totalSizeGiven < pixelSize (= parentRect.width)

    const rect: Rect = {
      x: parentRect.x + p,
      y: parentRect.y,
      width: currentWidth,
      height: parentRect.height
    };

    p += currentWidth;

    switch (child.type) {
      case "row":
        return <h1>Row</h1>;
      case "tabset":
        return <TabSet key={`tabset-${i}`} id={i} rect={rect} />;
    }
  });
}

function calcTotalWeight(nodes: (TabSetNode | RowNode)[]): number {
  return nodes.reduce((totalWeight, node) => (totalWeight += node.weight), 0);
}
