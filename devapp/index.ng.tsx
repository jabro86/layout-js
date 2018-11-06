import * as React from "react";
import * as ReactDOM from "react-dom";

import { Layout } from "../src/ng";
import { Model } from "../src/ng/Model";

const json: Model = {
  global: {},
  layout: {
    id: "row-1",
    type: "row",
    weight: 100,
    children: [
      {
        id: "tabset-1",
        type: "tabset",
        weight: 25,
        selected: "tab-1",
        children: [
          {
            id: "tab-1",
            type: "tab",
            name: "Things to try",
            component: "text"
          },
          {
            id: "tab-2",
            type: "tab",
            name: "Another thing",
            component: "text"
          }
        ]
      },
      {
        id: "tabset-2",
        type: "tabset",
        weight: 25,
        selected: "tab-3",
        children: [
          {
            id: "tab-3",
            type: "tab",
            name: "two",
            component: "text"
          }
        ]
      },
      {
        id: "tabset-3",
        type: "tabset",
        weight: 50,
        selected: "tab-4",
        children: [
          {
            id: "tab-4",
            type: "tab",
            name: "three",
            component: "text"
          }
        ]
      }
    ]
  }
};

class Main extends React.Component {
  render() {
    return (
      <div className="outer">
        <div className="inner">
          <Layout model={json} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Main />, document.getElementById("container"));
