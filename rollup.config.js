import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import babel from '@rollup/plugin-babel';
import { terser } from "rollup-plugin-terser";

const { PRODUCTION } = process.env;

export default {
  input: 'sources/index.js',
  output: {
    file: 'docs/showMore.min.js',
    format: 'iife',
    name: 'ShowMore',
    sourcemap: PRODUCTION ? false : true
  },
  plugins: [
    babel({ exclude: 'node_modules/**' }),
    terser(),
    copy({
      targets: [
        { src: 'sources/index.html', dest: 'docs/' }
      ]
    }),
    (!PRODUCTION && serve({ open: true, contentBase: 'docs' })),
    (!PRODUCTION && livereload())
  ]
};