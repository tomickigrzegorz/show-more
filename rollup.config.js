import { babel } from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import cleanup from "rollup-plugin-cleanup";

import pkg from "./package.json";

const { PRODUCTION } = process.env;
const input = "sources/index.js";

const targets = {
  targets: {
    browsers: ["defaults", "not IE 11", "maintained node versions"],
  },
};

const targetsIE = {
  targets: {
    browsers: [">0.2%", "not dead", "not op_mini all"],
  },
};

const pluginsConfig = (target) => [
  babel({
    babelHelpers: "bundled",
    presets: [
      [
        "@babel/preset-env",
        {
          // debug: true,
          // useBuiltIns: 'usage',
          useBuiltIns: "entry",
          corejs: 3,
          loose: true,
          ...target,
        },
      ],
    ],
  }),
  cleanup(),
];

const terserConfig = {
  mangle: {
    properties: {
      regex: /^_/,
    },
  },
};

export default [
  {
    input,
    plugins: pluginsConfig(targets),
    watch: false,
    output: {
      name: "ShowMore",
      format: "iife",
      file: pkg.main,
      sourcemap: true,
    },
  },
  {
    input,
    plugins: pluginsConfig(targets),
    watch: false,
    output: {
      name: "ShowMore",
      format: "iife",
      sourcemap: false,
      file: "dist/js/showMore.min.js",
      plugins: [
        terser({
          ...terserConfig,
          compress: { drop_console: true, drop_debugger: true },
        }),
      ],
    },
  },
  {
    input,
    plugins: pluginsConfig(targets),
    output: {
      name: "ShowMore",
      format: "iife",
      sourcemap: true,
      file: "docs/showMore.min.js",
      plugins: [
        PRODUCTION &&
          terser({
            ...terserConfig,
            compress: { drop_console: true, drop_debugger: true },
          }),
        !PRODUCTION && serve({ open: true, contentBase: ["docs"] }),
        !PRODUCTION && livereload(),
      ],
    },
  },
  {
    input,
    plugins: pluginsConfig(targets),
    watch: false,
    output: [
      {
        name: "ShowMore",
        format: "umd",
        sourcemap: true,
        file: "dist/js/showMore.umd.js",
      },
      {
        name: "ShowMore",
        format: "umd",
        sourcemap: false,
        file: "dist/js/showMore.umd.min.js",
        plugins: [
          terser({
            ...terserConfig,
            compress: { drop_console: true, drop_debugger: true },
          }),
        ],
      },
    ],
  },
  {
    input,
    plugins: pluginsConfig(targets),
    watch: false,
    output: [
      {
        name: "ShowMore",
        format: "es",
        sourcemap: true,
        file: "dist/js/showMore.esm.js",
      },
      {
        name: "ShowMore",
        format: "es",
        sourcemap: false,
        file: "dist/js/showMore.esm.min.js",
        plugins: [
          terser({
            ...terserConfig,
            compress: { drop_console: true, drop_debugger: true },
          }),
        ],
      },
    ],
  },
  {
    input,
    plugins: pluginsConfig(targetsIE),
    watch: false,
    output: [
      {
        name: "ShowMore",
        format: "iife",
        sourcemap: false,
        file: "dist/js/showMore.ie.min.js",
        plugins: [
          terser({
            ...terserConfig,
            compress: { drop_console: true, drop_debugger: true },
          }),
        ],
      },
    ],
  },
];
