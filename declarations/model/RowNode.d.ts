import Node from "./Node";
import IDropTarget from "./IDropTarget";
declare class RowNode extends Node implements IDropTarget {
    static readonly TYPE = "row";
    getWeight(): number;
    getWidth(): number | undefined;
    getHeight(): number | undefined;
    isEnableDrop(): boolean;
}
export default RowNode;
