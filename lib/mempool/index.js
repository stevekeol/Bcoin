/*!
 * mempool/index.js - mempool for bcoin
 * 注: mempool(memmory pool)也被称为交易池。由区块链网络中最近产生且未解决的交易组成。
 *     这些交易在队列中等待矿工的验证和纳入下一个区块。
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

/**
 * @module mempool
 */

exports.Fees = require('./fees');
exports.layout = require('./layout');
exports.MempoolEntry = require('./mempoolentry');
exports.Mempool = require('./mempool');
