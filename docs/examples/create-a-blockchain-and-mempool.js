'use strict';

//Use: browser

/**
 * 在内存中创建区块链和交易池
 */
const bcoin = require('../..');

// Default network (so we can avoid passing
// the `network` option into every object below.)
// 设置bcoin的环境为`回归测试`
bcoin.set('regtest');

/** 1. Bcoin.blockstore在合适的存储空间中创建区块(此处是说明在内存中/而非硬盘以红黑树创建blockchain,mempool,miner) 
 *  Start up a blockchain, mempool, and miner using in-memory databases (stored in a red-black tree instead of on-disk).
 *  注: 感悟1、2、3、4的依赖关系和空间画面
 */
const blocks = Taiki.blockstore.create({
  memory: true
});

/** 2. Bcoin.Chain基于这些区块创建链 */
const chain = new bcoin.Chain({
  network: 'regtest',
  memory: true,
  blocks: blocks
});

/** 3. Bcoin.Mempool基于这条链创建交易池 */
const mempool = new bcoin.Mempool({
  chain: chain
});

/** 4. Bcoin.Miner基于这条链和交易池创建矿工 */
const miner = new bcoin.Miner({
  chain: chain,
  mempool: mempool,
  useWorkers: true // 确保矿工不会阻塞主线程
});

(async () => {
  /** 打开chain */
  await blocks.open();
  await chain.open();

  /** 打开Miner(初始化数据库等)(矿工将隐含的调用mempool.open()) */
  await miner.open();

  /** 创建一个CPU型的矿工作业 */
  const job = await miner.createJob();

  /** 异步执行该作业 */
  const block = await job.mineAsync();

  /** 将该块缀连到链上 */
  await chain.add(block);
  console.log('Adding %s to the blockchain.', block.rhash());
})().catch((err) => {
  console.error(err.stack);
  /**
   * 此处的process.exit(1)在Browser环境下需要fixout(process是NodeJS环境下全局变量)
   */
  process.exit(1);
});