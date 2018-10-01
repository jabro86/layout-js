import * as React from "react";
import TabNode from "../model/TabNode";
import TabSetNode from "../model/TabSetNode";
import BorderNode from "../model/BorderNode";
import Action from "../model/Action";
import Model from "../model/Model";
export interface ILayoutProps {
    model: Model;
    factory: (node: TabNode) => React.ReactNode;
    onAction?: (action: Action) => void;
    onRenderTab?: (node: TabNode, renderValues: {
        leading: React.ReactNode;
        content: React.ReactNode;
    }) => void;
    onRenderTabSet?: (tabSetNode: (TabSetNode | BorderNode), renderValues: {
        headerContent?: React.ReactNode;
        buttons: Array<React.ReactNode>;
    }) => void;
    onModelChange?: (model: Model) => void;
}
/**
 * A React component that hosts a multi-tabbed layout
 */
export declare class Layout extends React.Component<ILayoutProps, any> {
    constructor(props: ILayoutProps);
    /**
     * Adds a new tab to the given tabset
     * @param tabsetId the id of the tabset where the new tab will be added
     * @param json the json for the new tab node
    */
    addTabToTabSet(tabsetId: string, json: any): void;
    /**
     * Adds a new tab by dragging a labeled panel to the drop location, dragging starts immediatelly
     * @param dragText the text to show on the drag panel
     * @param json the json for the new tab node
     * @param onDrop a callback to call when the drag is complete
     */
    addTabWithDragAndDrop(dragText: string, json: any, onDrop: () => void): void;
    /**
     * Adds a new tab by dragging a labeled panel to the drop location, dragging starts when you
     * mouse down on the panel
     *
     * @param dragText the text to show on the drag panel
     * @param json the json for the new tab node
     * @param onDrop a callback to call when the drag is complete
     */
    addTabWithDragAndDropIndirect(dragText: string, json: any, onDrop: () => void): void;
}
export default Layout;
