import * as React from "react";
import * as ReactDOM from "react-dom";

import { Layout, Model } from "../src";

const json = {
  global: {}, // {tabSetEnableTabStrip:false}, // to have just splitters
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 50,
        selected: 0,
        children: [
          {
            type: "tab",
            name: "Things to try",
            component: "text",
            config: {
              text:
                "<ul><li>drag tabs</li><li>drag splitters</li><li>double click on tab to rename</li><li>double click on tabstrip to maximize</li><li>use the Add button to add another tab</li></ul>"
            }
          }
        ]
      },
      {
        type: "tabset",
        weight: 50,
        selected: 0,
        children: [
          {
            type: "tab",
            name: "two",
            component: "text",
            config: { text: "" }
          }
        ]
      },
      {
        type: "tabset",
        weight: 50,
        selected: 0,
        children: [
          {
            type: "tab",
            name: "three",
            component: "text",
            config: { text: "" }
          }
        ]
      }
    ]
  }
};

class Main extends React.Component<{}, { model: Model }> {
  private layoutRef: Layout | null = null;
  state = { model: Model.fromJson(json) };

  factory = (node: any) => {
    const component = node.getComponent();
    if (component === "text") {
      return <div dangerouslySetInnerHTML={{ __html: node.getConfig().text }} />;
    }
  };

  onAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.layoutRef &&
      this.layoutRef.addTabWithDragAndDropIndirect(
        "Add panel<br>(Drag to location)",
        {
          component: "text",
          name: "added",
          config: { text: "i was added" }
        },
        () => {
          /* do nothing */
        }
      );
  };

  render() {
    return (
      <div className="outer">
        <button onClick={this.onAdd}>Add</button>
        <div className="inner">
          <Layout
            ref={ref => {
              this.layoutRef = ref;
            }}
            model={this.state.model}
            factory={this.factory}
          />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Main />, document.getElementById("container"));
