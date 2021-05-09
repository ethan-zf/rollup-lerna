# rollup-lerna

## 项目背景

基于原有项目的重构，为充分解耦、公共代码复用，将一个项目拆分为多个npm包，基础包 `kmap-base` 实现脱离业务的基础 功能
`package-app1`及`package-app2`基于`kmap-base`实现业务功能包装

## 概述
Typescript + rollup + lerna 实现的多包开发模式，项目实践中的一些记录。

**常用插件介绍**

> 踩坑记录

- **@rollup/plugin-commonjs** 

 默认情况下rollup只能处理es6模块，但是npm中的大多数包都是以CommonJS模块的形式出现的，所以需要使用这个插件将CommonJS模块转换为 ES2015

- **@rollup/plugin-node-resolve**

rollup 默认是不支持从 node_modules 里面查找模块的，使用 @rollup/plugin-node-resolve 可以解决这个问题。

值得一提的是，如果应用运行在浏览器端，需要将browser参数设置为true,这样插件将使用package.json中的浏览器模块解析，否则一些三方库可能存在环境变量问题，如axios。

- @rollup/plugin-json 

支持import的形式引入json




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
