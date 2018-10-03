import * as React from "react";
import styled from "react-emotion";

import { TabSet } from "./TabSet";

const Container = styled("div")`
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  overflow: hidden;
`;

interface Props {
  model: Model;
}

interface TabNode {
  type: "tab";
  name: string;
  component: string;
}

interface TabSetNode {
  type: "tabset";
  weight: number;
  selected: number;
  children: Array<TabNode>;
}

interface RowNode {
  type: "row";
  weight: number;
  children: Array<TabSetNode | TabNode>;
}

interface Model {
  global: any;
  layout: RowNode;
}

export function Layout(props: Props): JSX.Element {
  const { model } = props;

  return <Container>{renderChildren(model)}</Container>;
}

function Tab(props: { name: string }): JSX.Element {
  return <h1>{`Tab "${props.name}"`}</h1>;
}

function renderChildren(model: Model): JSX.Element[] {
  const root = model.layout;
  return root.children.map((child, i) => {
    switch (child.type) {
      case "tab":
        return <Tab key={`tab-${i}`} name={child.name} />;
      case "tabset":
        return <TabSet key={`tabset-${i}`} id={i} />;
    }
  });
}
