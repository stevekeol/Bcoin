import resolve from '@rollup/plugin-node-resolve'; // `wq` 利用 `节点解析算法` 定位 `第三方模块`
import commonjs from '@rollup/plugin-commonjs'; // 一款`rollup` 插件：将commonjs转换成ES6，以便集成进入 `Rollup bundle`
import json from '@rollup/plugin-json'; // 用于rollup在打包过程中，读取.json文件
// import livereload from 'rollup-plugin-livereload'; // 当不在 `production` 模式时，监视 `src` 文件夹的变动，并刷新至浏览器
// import { terser } from 'rollup-plugin-terser'; // `production` 模式下，`minify` 生成的 `bundle`

const production = !process.env.ROLLUP_WATCH;

// function serve() {
//   let server;
  
//   function toExit() {
//     if (server) server.kill(0);
//   }

//   return {
//     writeBundle() {
//       if (server) return;
//       server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
//         stdio: ['ignore', 'inherit', 'inherit'],
//         shell: true
//       });

//       process.on('SIGTERM', toExit);
//       process.on('exit', toExit);
//     }
//   };
// }

export default {
  // input: 'lib/bcoin.js',
  // input: 'demo/fullnode.js',
  input: 'docs/examples/fullnode.js',
  // input: ''
  output: {
    sourcemap: false,
    format: 'cjs', // cjs,iife, es,amd,umd
    name: 'bcoin',
    file: 'dist/bundle.js'
  },
  plugins: [

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    
    // resolve({
    //   browser: true,
    //   dedupe: ['svelte']
    // }),
    json(),
    resolve(),
    commonjs({
      dynamicRequireTargets: [
        // include using a glob pattern (either a string or an array of strings)
        'lib/blockchain/index.js',

        // exclude files that are known to not be required dynamically, this allows for better optimizations
        '!node_modules/logform/index.js',
        '!node_modules/logform/format.js',
        '!node_modules/logform/levels.js',
        '!node_modules/logform/browser.js'
      ]      
    }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    
    // !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    
    // !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    
    // production && terser()
    // terser()
  ],
  watch: {
    clearScreen: false
  }
};
