import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import cleanup from 'rollup-plugin-cleanup';

import pkg from './package.json';

const { PRODUCTION } = process.env;
const input = 'sources/index.js';

export default [
  {
    input,
    watch: false,
    plugins: [babel({ babelHelpers: 'bundled' }), cleanup()],
    output: {
      name: 'ShowMore',
      format: 'iife',
      file: pkg.main,
      sourcemap: true,
    },
  },
  {
    input,
    watch: false,
    plugins: [babel({ babelHelpers: 'bundled' }), cleanup()],
    output: {
      name: 'ShowMore',
      format: 'iife',
      sourcemap: false,
      file: 'dist/js/showMore.min.js',
      plugins: [terser()],
    },
  },
  {
    input,
    plugins: [babel({ babelHelpers: 'bundled' })],
    output: {
      name: 'ShowMore',
      format: 'iife',
      sourcemap: true,
      file: 'docs/showMore.min.js',
      plugins: [
        PRODUCTION &&
          terser({
            mangle: true,
            compress: { drop_console: true, drop_debugger: true },
          }),
        !PRODUCTION && serve({ open: true, contentBase: ['docs'] }),
        !PRODUCTION && livereload(),
      ],
    },
  },
  {
    input,
    watch: false,
    plugins: [babel({ babelHelpers: 'bundled' }), cleanup()],
    output: [
      {
        name: 'ShowMore',
        format: 'umd',
        sourcemap: true,
        file: 'dist/js/showMore.umd.js',
      },
      {
        name: 'ShowMore',
        format: 'umd',
        sourcemap: false,
        file: 'dist/js/showMore.umd.min.js',
        plugins: [
          terser({
            mangle: true,
            compress: { drop_console: true, drop_debugger: true },
          }),
        ],
      },
    ],
  },
  {
    input,
    watch: false,
    plugins: [babel({ babelHelpers: 'bundled' }), cleanup()],
    output: [
      {
        name: 'ShowMore',
        format: 'es',
        sourcemap: true,
        file: 'dist/js/showMore.esm.js',
      },
      {
        name: 'ShowMore',
        format: 'es',
        sourcemap: false,
        file: 'dist/js/showMore.esm.min.js',
        plugins: [
          terser({
            mangle: true,
            compress: { drop_console: true, drop_debugger: true },
          }),
        ],
      },
    ],
  },
];
