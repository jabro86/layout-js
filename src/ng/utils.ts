import { RowNode, TabSetNode, TabNode } from "./Model";

export interface FlatDataFromTreeConfig {
  treeData: Node[];
  getNodeKey({
    node,
    treeIndex
  }: {
    node: RowNode | TabSetNode | TabNode;
    treeIndex: number;
  }): string | number;
  ignoreCollapsed?: boolean;
}

export interface FlatDataNode {
  node: RowNode | TabSetNode | TabNode;
  path: string[];
  lowerSiblingCounts: number[];
  treeIndex: number;
  parentNode: RowNode | TabSetNode | undefined;
}

export function getFlatDataFromTree({
  treeData,
  getNodeKey,
  ignoreCollapsed = true
}: FlatDataFromTreeConfig): FlatDataNode[] {
  if (!treeData || treeData.length < 1) {
    return [];
  }

  const flattened = new Array<FlatDataNode>();
  walk({
    treeData,
    getNodeKey,
    ignoreCollapsed,
    callback: (nodeInfo: FlatDataNode) => {
      flattened.push(nodeInfo);
    }
  });

  return flattened;
}

export interface WalkConfig {
  treeData: Node[];
  getNodeKey({ node, treeIndex }: { node: Node; treeIndex: number }): string | number;
  callback: Function;
  ignoreCollapsed: boolean;
}

export function walk({ treeData, getNodeKey, callback, ignoreCollapsed = true }: WalkConfig): void {
  if (!treeData || treeData.length < 1) {
    return;
  }

  walkDescendants({
    callback,
    getNodeKey,
    ignoreCollapsed,
    isPseudoRoot: true,
    node: { children: treeData, node: undefined! },
    currentIndex: -1,
    path: [],
    lowerSiblingCounts: []
  });
}

interface RootNode {
  node: RowNode;
  children: RowOrTabsetNode[];
  expanded?: boolean;
}

interface RowOrTabsetNode {
  children?: Node[];
  expanded?: boolean;
  node: RowNode | TabSetNode;
}

interface Node {
  children?: Node[];
  expanded?: boolean;
  node?: RowNode | TabSetNode | TabNode;
}

interface WalkDescendantsConfig {
  callback: Function;
  getNodeKey({ node, treeIndex }: { node: Node; treeIndex: number }): string | number;
  ignoreCollapsed: Boolean;
  node: Node;
  parentNode?: object | null;
  currentIndex: number;
  path: (number | string)[];
  lowerSiblingCounts: number[];
  isPseudoRoot?: Boolean;
}

function walkDescendants({
  callback,
  getNodeKey,
  ignoreCollapsed,
  isPseudoRoot = false,
  node,
  parentNode = null,
  currentIndex,
  path = [],
  lowerSiblingCounts = []
}: WalkDescendantsConfig): number | boolean {
  // The pseudo-root is not considered in the path
  const selfPath = isPseudoRoot ? [] : [...path, getNodeKey({ node, treeIndex: currentIndex })];
  const selfInfo = isPseudoRoot
    ? null
    : {
        node,
        parentNode,
        path: selfPath,
        lowerSiblingCounts,
        treeIndex: currentIndex
      };
  if (!isPseudoRoot) {
    const callbackResult = callback(selfInfo);

    // Cut walk short if the callback returned false
    if (callbackResult === false) {
      return false;
    }
  }

  // Return self on nodes with no children or hidden children
  if (!node.children || (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)) {
    return currentIndex;
  }

  // Get all descendants
  let childIndex = currentIndex;
  const childCount = node.children.length;
  if (typeof node.children !== "function") {
    for (let i = 0; i < childCount; i += 1) {
      const result = walkDescendants({
        callback,
        getNodeKey,
        ignoreCollapsed,
        node: node.children[i],
        parentNode: isPseudoRoot ? null : node,
        currentIndex: childIndex + 1,
        lowerSiblingCounts: [...lowerSiblingCounts, childCount - i - 1],
        path: selfPath
      });

      if (typeof result === "boolean") {
        if (result === false) {
          return false;
        }
      } else {
        childIndex = result;
      }
    }
  }

  return childIndex;
}

export interface TreeFromFlatDataConfig {
  flatData: object[];
  getKey?: Function;
  getParentKey?: Function;
  rootKey?: string | number;
}
export function getTreeFromFlatData({
  flatData,
  getKey = (node: any) => node.id,
  getParentKey = (node: any) => node.parentId,
  rootKey = "0"
}: TreeFromFlatDataConfig): RootNode[] {
  if (!flatData) {
    return [];
  }

  const childrenToParents: { [key: string]: object[] } = {};
  flatData.forEach(child => {
    const parentKey = getParentKey(child);
    if (parentKey in childrenToParents) {
      childrenToParents[parentKey].push(child);
    } else {
      childrenToParents[parentKey] = [child];
    }
  });

  if (!(rootKey in childrenToParents)) {
    return [];
  }

  const trav = (parent: object): any => {
    const parentKey = getKey(parent);
    if (parentKey in childrenToParents) {
      return {
        ...parent,
        children: childrenToParents[parentKey].map(child => trav(child))
      };
    }

    return { ...parent };
  };

  return childrenToParents[rootKey].map(child => trav(child));
}
