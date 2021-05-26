/*!
 * blockstore/index.js - bitcoin blockstore for bcoin
 * Copyright (c) 2019, Braydon Fuller (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const {join} = require('path');

const AbstractBlockStore = require('./abstract');
const LevelBlockStore = require('./level');
const FileBlockStore = require('./file');

/**
 * @module blockstore
 */

exports.create = (options) => {
  /**
   * 如果开启了内存，则在内存中创建blockchain,mempool,miner(在内存中使用红黑树，而非在硬盘上存储)
   */
  if (options.memory) {
    return new LevelBlockStore({
      network: options.network,
      logger: options.logger,
      cacheSize: options.cacheSize,
      memory: options.memory
    });
  }

  const location = join(options.prefix, 'blocks');

  return new FileBlockStore({
    network: options.network,
    logger: options.logger,
    location: location,
    cacheSize: options.cacheSize
  });
};

exports.AbstractBlockStore = AbstractBlockStore;
exports.FileBlockStore = FileBlockStore;
exports.LevelBlockStore = LevelBlockStore;
