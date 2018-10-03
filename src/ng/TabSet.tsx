import * as React from "react";
import styled from "react-emotion";

import { Rect, toStyle } from "./Rect";

const OuterDiv = styled("div")`
  overflow: hidden;
  background-color: #222;
  box-sizing: border-box;
`;

const TabSetHeader = styled("div")`
  position: absolute;
  left: 0;
  right: 0;
  color: #eee;
  background-color: #212121;
  padding: 3px 3px 3px 5px;
  /*box-shadow: inset 0px 0px 3px 0px rgba(136, 136, 136, 0.54);*/
  box-sizing: border-box;
`;

interface TabSetHeaderOuterProps {
  tabStripHeight: number;
  headerHeight: number;
}

const TabSetHeaderOuter = styled("div")`
  background-color: black;
  position: absolute;
  left: 0;
  right: 0;
  overflow: hidden;
  height: ${(props: TabSetHeaderOuterProps) => props.tabStripHeight}px
  top: ${(props: TabSetHeaderOuterProps) => props.headerHeight}px
`;

const TabSetHeaderInner = styled("div")`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10000px;
`;

interface Props {
  id: number;
  rect: Rect;
}

export function TabSet(props: Props): JSX.Element {
  const style = toStyle(props.rect);

  return (
    <OuterDiv style={style}>
      <TabSetHeader>
        {`TabSet ${props.id}`}
        <TabSetHeaderOuter tabStripHeight={30} headerHeight={30}>
          <TabSetHeaderInner>{`tab`}</TabSetHeaderInner>
        </TabSetHeaderOuter>
      </TabSetHeader>
    </OuterDiv>
  );
}
