export interface TabNode {
  type: "tab";
  name: string;
  component: string;
}

export interface TabSetNode {
  type: "tabset";
  weight: number;
  selected: number;
  children: Array<TabNode>;
}

export interface RowNode {
  type: "row";
  weight: number;
  children: Array<RowNode | TabSetNode>;
}

export interface Model {
  global: any;
  layout: RowNode;
}
