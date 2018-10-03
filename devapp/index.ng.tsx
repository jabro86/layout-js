import * as React from "react";
import * as ReactDOM from "react-dom";

import { Layout } from "../src/ng";

const json: any = {
  global: {},
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 25,
        selected: 0,
        children: [
          {
            type: "tab",
            name: "Things to try",
            component: "text"
          }
        ]
      },
      {
        type: "tabset",
        weight: 25,
        selected: 0,
        children: [
          {
            type: "tab",
            name: "two",
            component: "text"
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
