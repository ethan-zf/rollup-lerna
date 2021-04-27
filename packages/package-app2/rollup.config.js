// import serve from 'rollup-plugin-serve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import rjson from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';
import url from 'postcss-url';
import replace from '@rollup/plugin-replace';
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser';

let version = require('../common/version');
let fileName = './dist/kmap-lbs.js';
export default {
  input: './index.ts',
  output: {
    file: fileName,
    format: 'umd',
    name: 'kmapLbs',
    banner: `/* @KMap: kmap-lbs version ${version} */`,
  },
  plugins: [
    del({ targets: fileName }),
    resolve({ browser: true }),
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
      'process.env.KMAP_LBS_VERSION': JSON.stringify(version),
      preventAssignment: true,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: ['node_modules/**', '../../node_modules/**', /.*mapbox-gl.*/, /.*minemap.*/],
    }),
    terser({
      output: {
        comments: function (node, comment) {
          if (comment.type == 'comment2') {
            return /@KMap/i.test(comment.value);
          }
        },
      },
    }),
  ],
  external: ['kmap-core'],
};
