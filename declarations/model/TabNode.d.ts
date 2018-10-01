import Node from "./Node";
import Rect from "../Rect";
import IDraggable from "./IDraggable";
import { JSMap } from "../Types";
declare class TabNode extends Node implements IDraggable {
    static readonly TYPE = "tab";
    getTabRect(): Rect | undefined;
    getName(): string;
    getComponent(): string | undefined;
    /**
     * Returns the config attribute that can be used to store node specific data that
     * WILL be saved to the json. The config attribute should be changed via the action Actions.updateNodeAttributes rather
     * than directly, for example:
     * this.state.model.doAction(
     *   FlexLayout.Actions.updateNodeAttributes(node.getId(), {config:myConfigObject}));
     */
    getConfig(): any;
    /**
     * Returns an object that can be used to store transient node specific data that will
     * NOT be saved in the json.
     */
    getExtraData(): JSMap<any>;
    getIcon(): string | undefined;
    isEnableClose(): boolean;
    isEnableDrag(): boolean;
    isEnableRename(): boolean;
    getClassName(): string | undefined;
    isRenderOnDemand(): boolean;
}
export default TabNode;
