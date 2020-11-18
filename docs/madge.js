/*
 madge.js: 分析源码依赖关系
 */
const madge = require('madge');

madge('./examples/wallet.js')
  .then((res) => res.svg())
  .then((output) => {
    console.log(output.toString());
  });