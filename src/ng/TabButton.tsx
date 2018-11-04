import * as React from "react";
import { TabNode } from "./Model";
import { Layout } from "./Layout";
import styled from "react-emotion";

const OuterDiv = styled("div")`
  overflow: hidden;
  background-color: #222;
  box-sizing: border-box;
`;

export interface PropsType {
  node: TabNode;
  height: number;
  show: boolean;
  selected: boolean;
  onTabButtonClicked(id: string): void;
}

export class TabButton extends React.Component<PropsType> {
  private selfRef: HTMLDivElement | undefined;
  private contentRef: HTMLDivElement | undefined;

  handleOnClick = () => {
    this.props.onTabButtonClicked(this.props.node.id);
  };

  render() {
    const { name } = this.props.node;
    return (
      <div
        ref={ref => (this.selfRef = ref === null ? undefined : ref)}
        onClick={this.handleOnClick}
        style={{
          visibility: this.props.show ? "visible" : "hidden",
          height: this.props.height,
          cursor: "pointer",
          padding: "2px 8px 3px 8px",
          margin: "2px",
          float: "left",
          verticalAlign: "top",
          boxSizing: "border-box",
          color: this.props.selected ? "#ddd" : "gray",
          backgroundColor: this.props.selected ? "#222" : undefined
        }}
      >
        <div
          ref={ref => (this.contentRef = ref === null ? undefined : ref)}
          style={{ float: "left", display: "inline-block" }}
        >
          {name}
        </div>
      </div>
    );
  }
}
