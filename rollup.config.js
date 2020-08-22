
import babel from '@rollup/plugin-babel';
import pkg from "./package.json";
import { terser } from 'rollup-plugin-terser';

const { PRODUCTION } = process.env;

export default {
  input: 'sources/index.js',
  output: {
    file: pkg.main,
    format: 'iife',
    name: 'ShowMore',
    sourcemap: !PRODUCTION,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    terser()
  ]
};