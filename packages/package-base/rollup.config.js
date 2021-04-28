import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import rjson from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import url from 'postcss-url';
import del from 'rollup-plugin-delete';
// import visualizer from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';

let version = require('../version');
let fileName = './dist/base.js';
export default {
  input: './index.ts',
  output: {
    file: fileName,
    format: 'umd',
    name: 'kmapCore',
    banner: `/* @KMap: base version ${version} */`,
  },
  plugins: [
    del({ targets: fileName }),
    // visualizer(),
    resolve({
      browser: true,
    }),
    commonjs({ transformMixedEsModules: true }),
    rjson(),
    postcss({
      plugins: [url({ url: 'inline' })],
      extensions: ['.css'],
    }),
    typescript({
      abortOnError: false,
      check: false,
    }),
    image(),
    replace({
      exclude: 'node_modules/**',
      'process.env.MAP_TYPE': JSON.stringify(process.env.NODE_ENV),
      'process.env.KMAP_CORE_VERSION': JSON.stringify(version),
      preventAssignment: true,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: ['node_modules/**', '../../node_modules/**', /.*mapbox-gl.*/, /.*minemap.*/],
    }),
    // terser({
    //   output: {
    //     comments: function (node, comment) {
    //       if (comment.type == 'comment2') {
    //         return /@KMap/i.test(comment.value);
    //       }
    //     },
    //   },
    // }),
  ],
};
