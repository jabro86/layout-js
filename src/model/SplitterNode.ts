import Node from "./Node";
import Model from "./Model";
import AttributeDefinitions from "../AttributeDefinitions";
import Orientation from "../Orientation";

class SplitterNode extends Node {
  public static readonly TYPE = "splitter";

  constructor(model: Model) {
    super(model);
    this._fixed = true;
    this._attributes["type"] = SplitterNode.TYPE;
    model._addNode(this);
  }

  getWidth() {
    return this._model.getSplitterSize();
  }

  getHeight() {
    return this._model.getSplitterSize();
  }

  getWeight(): number {
    return 0;
  }

  _setWeight(value: number): void {
    /* do nothing */
  }

  _getPrefSize(orientation: Orientation): number {
    return this._model.getSplitterSize();
  }

  _updateAttrs(json: any): void {
    /* do nothing */
  }

  _getAttributeDefinitions(): AttributeDefinitions {
    return new AttributeDefinitions();
  }

  _toJson(): any {
    return undefined;
  }
}

export default SplitterNode;
