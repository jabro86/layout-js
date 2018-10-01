import Rect from "./Rect";
import Node from "./model/Node";
import DockLocation from "./DockLocation";
import IDropTarget from "./model/IDropTarget";
declare class DropInfo {
    node: (Node & IDropTarget);
    rect: Rect;
    location: DockLocation;
    index: number;
    className: string;
    constructor(node: (Node & IDropTarget), rect: Rect, location: DockLocation, index: number, className: string);
}
export default DropInfo;
