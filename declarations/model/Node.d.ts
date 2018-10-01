import Rect from "../Rect";
import Model from "./Model";
import Orientation from "../Orientation";
declare abstract class Node {
    getId(): string;
    getModel(): Model;
    getType(): string;
    getParent(): Node | undefined;
    getChildren(): Node[];
    getRect(): Rect;
    isVisible(): boolean;
    getOrientation(): Orientation;
    setEventListener(event: string, callback: (params: any) => void): void;
    removeEventListener(event: string): void;
}
export default Node;
