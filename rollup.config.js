import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import compiler from '@ampproject/rollup-plugin-closure-compiler';

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
    compiler({
      languageIn: 'ECMASCRIPT6',
      language_out: 'ECMASCRIPT5',
      compilation_level: 'ADVANCED',
      externs: './sources/externs/externs.js',
      // compilation_level: 'WHITESPACE_ONLY',
      // compilation_level: 'SIMPLE',
      // debug: true,
      // source_map_format: 'V3'
    }),
    (!PRODUCTION && serve({ open: true, contentBase: 'docs' })),
    (!PRODUCTION && livereload())
  ]
};