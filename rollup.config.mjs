import { readFileSync } from "node:fs";
import resolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

const { PRODUCTION } = process.env;
const input = "sources/index.ts";

// SWC config for modern browsers
const swcConfig = {
  jsc: {
    target: "es2015",
    parser: {
      syntax: "typescript",
    },
  },
  env: {
    targets: "defaults, not IE 11, maintained node versions",
  },
};

// Terser minify config
const terserConfig = {
  compress: {
    drop_console: true,
    drop_debugger: true,
  },
  mangle: {
    properties: {
      regex: /^_/,
    },
  },
};

// Build configurations
const builds = [
  // IIFE build (main)
  {
    input,
    plugins: [resolve({ extensions: [".ts", ".js"] }), swc(swcConfig)],
    output: {
      name: "ShowMore",
      format: "iife",
      file: pkg.main,
      sourcemap: true,
    },
  },
  // IIFE minified
  {
    input,
    plugins: [
      resolve({ extensions: [".ts", ".js"] }),
      swc(swcConfig),
      terser(terserConfig),
    ],
    output: {
      name: "ShowMore",
      format: "iife",
      file: "dist/js/showMore.min.js",
      sourcemap: false,
    },
  },
  // IIFE for docs (with dev server)
  {
    input,
    plugins: [
      resolve({ extensions: [".ts", ".js"] }),
      swc(swcConfig),
      PRODUCTION && terser(terserConfig),
      !PRODUCTION && serve({ open: true, contentBase: ["docs"] }),
      !PRODUCTION && livereload(),
    ].filter(Boolean),
    output: {
      name: "ShowMore",
      format: "iife",
      file: "docs/showMore.min.js",
      sourcemap: true,
    },
  },
  // UMD builds
  {
    input,
    plugins: [resolve({ extensions: [".ts", ".js"] }), swc(swcConfig)],
    output: {
      name: "ShowMore",
      format: "umd",
      file: "dist/js/showMore.umd.js",
      sourcemap: true,
    },
  },
  {
    input,
    plugins: [
      resolve({ extensions: [".ts", ".js"] }),
      swc(swcConfig),
      terser(terserConfig),
    ],
    output: {
      name: "ShowMore",
      format: "umd",
      file: "dist/js/showMore.umd.min.js",
      sourcemap: false,
    },
  },
  // ESM builds
  {
    input,
    plugins: [resolve({ extensions: [".ts", ".js"] }), swc(swcConfig)],
    output: {
      format: "es",
      file: "dist/js/showMore.esm.js",
      sourcemap: true,
    },
  },
  {
    input,
    plugins: [
      resolve({ extensions: [".ts", ".js"] }),
      swc(swcConfig),
      terser(terserConfig),
    ],
    output: {
      format: "es",
      file: "dist/js/showMore.esm.min.js",
      sourcemap: false,
    },
  },
  // TypeScript declarations
  {
    input,
    plugins: [dts()],
    output: {
      format: "es",
      file: "dist/types/index.d.ts",
    },
  },
];

export default builds;
