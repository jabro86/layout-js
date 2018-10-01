declare class DragDrop {
    static instance: DragDrop;
    addGlass(fCancel: (() => void) | undefined): void;
    hideGlass(): void;
    startDrag(event: Event | undefined, fDragStart: ((pos: {
        clientX: number;
        clientY: number;
    }) => boolean) | undefined, fDragMove: ((event: Event) => void) | undefined, fDragEnd: ((event: Event) => void) | undefined, fDragCancel?: (() => void) | undefined, fClick?: ((event: Event) => void) | undefined, fDblClick?: ((event: Event) => void) | undefined): void;
    isDragging(): boolean;
    toString(): string;
}
export default DragDrop;
