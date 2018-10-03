export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function toStyle(rect: Rect): React.CSSProperties {
  return {
    left: rect.x + "px",
    top: rect.y + "px",
    width: Math.max(0, rect.width) + "px",
    height: Math.max(0, rect.height) + "px",
    position: "absolute"
  };
}
