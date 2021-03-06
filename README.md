# rollup-lerna

## 项目背景

基于原有项目的重构，为充分解耦、公共代码复用，将一个项目拆分为多个npm包，基础包 `kmap-base` 实现脱离业务的基础 功能
`package-app1`及`package-app2`基于`kmap-base`实现业务功能包装

## 概述
由于项目本身为类库性质，静态资源少，且工程较大，对打包速度和pkg体积有一定要求，并且需要实现多包的拆分，
因此最终选择了 Typescript + rollup + lerna 的方式。

借助Typescript强类型校验增强程序的健壮性，相比webpack，rollup更加快速，出包体积更小，成为项目首选。

lerna是monorepo管理方式的一个成熟的实现，简单理解就是lerna为我们提供了
多包之间依赖的管理，多线程同步的执行命令，同步发布版本等等。

**rollup常用插件介绍**

> 踩坑记录

- **@rollup/plugin-commonjs** 

 默认情况下rollup只能处理es6模块，但是npm中的大多数包都是以CommonJS模块的形式出现的，所以需要使用这个插件将CommonJS模块转换为 ES2015
 

> 踩坑：项目中自己开发或者本地直接引入了三方文件库（不在node_modules中），仍然存在一些.js文件，在基于typescript配置的环境下，编译可能报错。
> 查看@rollup/plugin-commonjs文档可以看到 extensions默认为.js，即.js文件都是@rollup/plugin-commonjs编译处理的对象
> 但有些js文件可能并不是commonjs规范的文件，按照commonjs的方式来处理必然产生异常。
> 这种情况下，commonjs规范的文件仍保持.js格式，非commonjs规范的文件改为.ts格式，按照typescript的方式来编译，即可解决，
 

- **@rollup/plugin-node-resolve**

rollup 默认是不支持从 node_modules 里面查找模块的，使用 @rollup/plugin-node-resolve 可以解决这个问题。

值得一提的是，如果应用运行在浏览器端，需要将browser参数设置为true,这样插件将使用package.json中的浏览器模块解析，否则一些三方库可能存在环境变量问题，如axios。

- **@rollup/plugin-json** 

支持import的形式引入json

- **@rollup/plugin-babel **
 babel相关的一些插件，根据项目情况按需使用
 @babel/core //babel 核心文件
 @babel/preset-env //自动转化语法
 @babel/plugin-proposal-decorators//装饰器
 @babel/proposal-object-rest-spread//对象展开操作符
 @babel/plugin-syntax-dynamic-import//支持动态import

- **rollup-plugin-typescript2**
参考了其他大佬的方案，放弃了官方提供的 @rollup/plugin-typescript和babel的 @babel/preset-typescript。自己测试下来的确问题比较多
最终的方案是 rollup-plugin-typescript2 ，这个是社区提供的一种解决方案，集成了 tslib，没有抛弃类型检查，不需要额外安装包（除了 typescript 本身），速度也很快
不要犹豫，就是它！

- **rollup-plugin-postcss**
css样式处理插件
如css中background-image等涉及图片的样式，则需要引入一个postcss的插件postcss-url（注意，不是rollup的插件）,'inline'模式会将url对应的图片替换为base64

```
postcss({
      plugins: [url({ url: 'inline' })],
      extensions: ['.css']
})
```

> 踩坑：postcss安装在packages外层的node_modules中，编译时会报错。如下，在子项目的package.json中安装依赖，报错解除。
> 原因暂时不明

 ```
 //packages/package-app1/package.json
 
  "dependencies": {
    "postcss": "8.2.8",
    "rollup-plugin-postcss": "4.0.0",
    "postcss-url": "10.1.3"
  }
 ```

- **@rollup/plugin-image**
如果js文件中通过require加载图片，如require('*/img-path'); 则rollup无法直接处理

需要借助@rollup/plugin-image 将图片转成base64。使用时在文件头部直接用import的方式引入图片即可

```
// 修改前
let img = require('*/img-path'); 

//修改后

import img from '*/img-path';

```


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
