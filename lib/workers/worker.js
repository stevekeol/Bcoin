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

/**
 * worker.js仅仅是此处抽象出来的一个工作者worker。并不是w3c标准中的webworker。
 * 因此并没有使用new Worker('./file.js')的形式来创建worker；而是实例化一个master，该实例作为worker的主体.
 *
 * @TODO 可以改写成webworker
 */

const Master = require('./master');
const server = new Master();

/**
 * 全局的process用于描述系统信息
 * argv: 当前进程的所有命令行参数的数组
 * env: 当前shell环境变量的对象
 * installPrefix: NodeJS安装路径
 * pid: 进程id
 * platform: 操作系统，如linux
 * title: 默认node，可自定义该值
 * version: Node版本
 */
process.title = 'bcoin-worker';

server.listen();