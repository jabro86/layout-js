import * as React from "react";
import * as ReactDOM from "react-dom";

import { Layout } from "../src/ng";
import { Model } from "../src/ng/Model";

const json: Model = {
  global: {},
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        id: "1",
        type: "tabset",
        weight: 25,
        selected: 0,
        children: [
          {
            id: "1",
            type: "tab",
            name: "Things to try",
            component: "text"
          },
          {
            id: "2",
            type: "tab",
            name: "Another thing",
            component: "text"
          }
        ]
      },
      {
        id: "2",
        type: "tabset",
        weight: 25,
        selected: 0,
        children: [
          {
            id: "3",
            type: "tab",
            name: "two",
            component: "text"
          }
        ]
      },
      {
        id: "3",
        type: "tabset",
        weight: 50,
        selected: 0,
        children: [
          {
            id: "4",
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
