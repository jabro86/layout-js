import AttributeDefinitions from "../AttributeDefinitions";
import DockLocation from "../DockLocation";
import DropInfo from "../DropInfo";
import Orientation from "../Orientation";
import Rect from "../Rect";
import { JSMap } from "../Types";
import IDraggable from "./IDraggable";
import Model from "./Model";

abstract class Node {
  protected _model: Model;
  protected _attributes: JSMap<any>;
  protected _parent?: Node;
  protected _children: Array<Node>;
  protected _fixed: boolean;
  protected _rect: Rect;
  protected _visible: boolean;
  protected _listeners: JSMap<(params: any) => void>;
  protected _dirty: boolean = false;
  protected _tempSize: number = 0;

  protected constructor(model: Model) {
    this._model = model;
    this._attributes = {};
    this._children = [];
    this._fixed = false;
    this._rect = Rect.empty();
    this._visible = false;
    this._listeners = {};
  }

  protected _getAttributeAsStringOrUndefined(attr: string) {
    const value = this._attributes[attr];
    if (value !== undefined) {
      return value as string;
    }
    return undefined;
  }

  protected _getAttributeAsNumberOrUndefined(attr: string) {
    const value = this._attributes[attr];
    if (value !== undefined) {
      return value as number;
    }
    return undefined;
  }

  getId() {
    let id = this._attributes["id"];
    if (id !== undefined) {
      return id as string;
    }

    id = this._model._nextUniqueId();
    this._setId(id);

    return id as string;
  }

  getModel() {
    return this._model;
  }

  getType() {
    return this._attributes["type"] as string;
  }

  getParent() {
    return this._parent;
  }

  getChildren() {
    return this._children;
  }

  getRect() {
    return this._rect;
  }

  isVisible() {
    return this._visible;
  }

  getOrientation(): Orientation {
    if (this._parent === undefined) {
      return Orientation.HORZ;
    } else {
      return Orientation.flip(this._parent.getOrientation());
    }
  }

  // event can be: resize, visibility, maximize (on tabset), close
  setEventListener(event: string, callback: (params: any) => void) {
    this._listeners[event] = callback;
  }

  removeEventListener(event: string) {
    delete this._listeners[event];
  }

  _setId(id: string) {
    this._attributes["id"] = id;
  }

  _fireEvent(event: string, params: any) {
    // console.log(this._type, " fireEvent " + event + " " + JSON.stringify(params));
    if (this._listeners[event] !== undefined) {
      this._listeners[event](params);
    }
  }

  _getAttr(name: string) {
    let val = this._attributes[name];

    if (val === undefined) {
      let modelName = this._getAttributeDefinitions().getModelName(name);
      if (modelName !== undefined) {
        val = this._model._getAttribute(modelName);
      }
    }

    // console.log(name + "=" + val);
    return val;
  }

  _forEachNode(fn: (node: Node, level: number) => void, level: number) {
    fn(this, level);
    level++;
    this._children.forEach(node => {
      node._forEachNode(fn, level);
    });
  }

  _setVisible(visible: boolean) {
    if (visible !== this._visible) {
      this._fireEvent("visibility", { visible: visible });
      this._visible = visible;
    }
  }

  _getDrawChildren(): Array<Node> | undefined {
    return this._children;
  }

  _setParent(parent: Node) {
    this._parent = parent;
  }

  _setRect(rect: Rect) {
    this._rect = rect;
  }

  _setWeight(weight: number) {
    this._attributes["weight"] = weight;
  }

  _setSelected(index: number) {
    this._attributes["selected"] = index;
  }

  _isFixed() {
    return this._fixed;
  }

  _layout(rect: Rect) {
    this._rect = rect;
  }

  _findDropTargetNode(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
    let rtn: DropInfo | undefined = undefined;
    if (this._rect.contains(x, y)) {
      rtn = this.canDrop(dragNode, x, y);
      if (rtn === undefined) {
        if (this._children.length !== 0) {
          for (let i = 0; i < this._children.length; i++) {
            const child = this._children[i];
            rtn = child._findDropTargetNode(dragNode, x, y);
            if (rtn !== undefined) {
              break;
            }
          }
        }
      }
    }

    return rtn;
  }

  canDrop(dragNode: Node & IDraggable, x: number, y: number): DropInfo | undefined {
    return undefined;
  }

  _canDockInto(dragNode: Node & IDraggable, dropInfo: DropInfo | undefined): boolean {
    if (dropInfo !== undefined) {
      if (dropInfo.location === DockLocation.CENTER && dropInfo.node.isEnableDrop() === false) {
        return false;
      }

      // prevent named tabset docking into another tabset, since this would lose the header
      if (
        dropInfo.location === DockLocation.CENTER &&
        dragNode.getType() === "tabset" &&
        dragNode.getName() !== undefined
      ) {
        return false;
      }

      if (dropInfo.location !== DockLocation.CENTER && dropInfo.node.isEnableDivide() === false) {
        return false;
      }

      // finally check model callback to check if drop allowed
      if (this._model._getOnAllowDrop()) {
        return (this._model._getOnAllowDrop() as (dragNode: Node, dropInfo: DropInfo) => boolean)(
          dragNode,
          dropInfo
        );
      }
    }
    return true;
  }

  _removeChild(childNode: Node) {
    const pos = this._children.indexOf(childNode);
    if (pos !== -1) {
      this._children.splice(pos, 1);
    }
    this._dirty = true;
    return pos;
  }

  _addChild(childNode: Node, pos?: number) {
    if (pos !== undefined) {
      this._children.splice(pos, 0, childNode);
    } else {
      this._children.push(childNode);
      pos = this._children.length - 1;
    }
    childNode._parent = this;
    this._dirty = true;
    return pos;
  }

  _removeAll() {
    this._children = [];
    this._dirty = true;
  }

  _styleWithPosition(style?: JSMap<any>) {
    if (style === undefined) {
      style = {};
    }
    return this._rect.styleWithPosition(style);
  }

  _getTempSize() {
    return this._tempSize;
  }

  _setTempSize(value: number) {
    this._tempSize = value;
  }

  isEnableDivide() {
    return true;
  }

  _toAttributeString() {
    return JSON.stringify(this._attributes, undefined, "\t");
  }

  // implemented by subclasses

  abstract _updateAttrs(json: any): void;

  abstract _getAttributeDefinitions(): AttributeDefinitions;

  abstract _toJson(): any;
}

export default Node;
