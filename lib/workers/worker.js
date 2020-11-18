/*!
 * worker.js - worker thread/process for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

/*
 webpack.node.js编译后的 app.js包含整个bcoin库以及实际Web界面的基本功能。
 webpack.node.js编译后的 worker.js是一个脚本，它允许主线程生成子进程来并行处理某些任务。
 */
'use strict';

const Master = require('./master');
const server = new Master();

process.title = 'bcoin-worker';

server.listen();
