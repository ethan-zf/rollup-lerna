# rollup-lerna

## 项目背景

基于原有项目的重构，为充分解耦、公共代码复用，将一个项目拆分为多个npm包，基础包 `kmap-base` 实现脱离业务的基础 功能
`package-app1`及`package-app2`基于`kmap-base`实现业务功能包装

## 概述
Typescript + rollup + lerna 实现的多包开发模式，项目实践中的一些记录。

**常用插件介绍**

> 踩坑记录

@rollup/plugin-commonjs ：


**完整的rollup.config：**

```
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
// import visualizer from 'rollup-plugin-visualizer';
import { terser } from 'rollup-plugin-terser';

let version = require('../version');
let fileName = './dist/app1.js';
export default {
  input: './index.ts',
  output: {
    file: fileName,
    format: 'umd',
    name: 'kmapBase',
    banner: `/* @KMap: app1 version ${version} */`,
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
      'process.env.KMAP_BASE_VERSION': JSON.stringify(version),
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
             return /@Version/i.test(comment.value);
           }
         },
       },
     }),
  ],
  external: ['kmap-core'],
};
```
