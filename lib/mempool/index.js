/*!
 * mempool/index.js - mempool for bcoin
 * 注: mempool(memmory pool)也被称为交易池。由区块链网络中最近产生且未解决的交易组成。
 *     这些交易在队列中等待矿工的验证和纳入下一个区块。
 */

'use strict';

/**
 * @module mempool
 *
 * 注: 以下都是挂载在bcoin.mempool上，如bcoin.mempool.Fees等(这里的mempool是小写)
 *     而bcoin-browser.js中的Fees,Mempool,MempoolEntry都是直接挂载在bcoin上。
 */

exports.Fees = require('./fees');
exports.layout = require('./layout');
exports.MempoolEntry = require('./mempoolentry');
exports.Mempool = require('./mempool');
