import * as React from "react";
import styled from "react-emotion";

import { Rect, toStyle } from "./Rect";
import { TabNode } from "./Model";
import { TabButton } from "./TabButton";

const Container = styled("div")`
  overflow: hidden;
  background-color: #222;
  box-sizing: border-box;
`;

interface OuterHeaderProps {
  selected: boolean;
}

const OuterHeader = styled("div")`
  background-color: black;
  position: absolute;
  left: 0;
  right: 0;
  overflow: hidden;
  background-image: ${(props: OuterHeaderProps) =>
    props.selected ? "linear-gradient(#111, #444)" : undefined};
`;

const InnerHeader = styled("div")`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10000px;
`;

interface PropsType {
  id: number;
  rect: Rect;
  children: TabNode[];
  selected: string;
  isActive?: boolean;
  onTabButtonClicked(id: string): void;
}

export class TabSet extends React.Component<PropsType> {
  handleOnTabButtonClicked = (id: string) => {
    this.props.onTabButtonClicked(id);
  };

  render() {
    const style = toStyle(this.props.rect);
    const tabStripHeight = 30;

    const tabs = this.props.children.map(tabNode => {
      const isSelected = this.props.selected === tabNode.id;
      return (
        <TabButton
          key={`${tabNode.id}`}
          node={tabNode}
          height={tabStripHeight}
          show={true}
          selected={isSelected}
          onTabButtonClicked={this.handleOnTabButtonClicked}
        />
      );
    });

    return (
      <Container style={style}>
        <OuterHeader
          selected={this.props.isActive || false}
          style={{ height: `${tabStripHeight}px` }}
        >
          <InnerHeader>{tabs}</InnerHeader>
        </OuterHeader>
      </Container>
    );
  }
}
