export interface TabNode {
  id: string;
  type: "tab";
  name: string;
  component: string;
  expanded?: boolean;
}

export interface TabSetNode {
  id: string;
  type: "tabset";
  weight: number;
  selected: string;
  children: Array<TabNode>;
}

export interface RowNode {
  id: string;
  type: "row";
  weight: number;
  children: Array<RowNode | TabSetNode>;
}

export interface Model {
  global: any;
  layout: RowNode;
}
