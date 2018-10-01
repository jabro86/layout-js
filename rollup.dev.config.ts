import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import sourceMaps from "rollup-plugin-sourcemaps";
import typescript from "rollup-plugin-typescript2";
import json from "rollup-plugin-json";
import serve from "rollup-plugin-serve";
import replace from "rollup-plugin-replace";

export default {
  input: `devapp/index.tsx`,
  output: [{ file: "./build/devapp.bundle.js", format: "es", sourcemap: true }],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: ["src/**", "devapp/**", "style/**"]
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      namedExports: {
        "node_modules/react/index.js": ["createElement", "Component"],
        "node_modules/react-dom/index.js": ["render", "findDOMNode", "unmountComponentAtNode"]
      }
    }),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),
    serve({
      open: true,
      contentBase: ["build", "static", "style"],
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("development")
    })
  ]
};
