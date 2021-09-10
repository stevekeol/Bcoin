/**
 * Reference: create-a-blockchain-and-mempool.js
 * 在内存中创建区块链和交易池
 * Use: browser
 */

/**
 * 默认: const bcoin = require('../../');
 * 当使用bpkg打包并设置全局变量Bcoin时: const Taiki = Bcoin; 可用Taiki替换下面的bcoin
 * 
 * Reflect.set(self, 'bfsprocess', () => console.log('jiege'))
 * Reflect.set(self, 'Taiki', Bcoin) // 业务中就可以使用Taiki!(此时Bcoin/bcoin/Taiki均可用)  
 */
const bcoin = require('../..');
// const Taiki = Bcoin;

/** 设置bcoin的环境为`回归测试`(这样设置可以避免给下面每一个工作对象设置类型) */
bcoin.set('regtest');

/** 1. Bcoin.blockstore在合适的存储空间中创建区块(此处是说明在内存中以红黑树创建blockchain,mempool,miner) */
const blocks = bcoin.blockstore.create({
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

/** Bcoin.Miner基于这条链和交易池创建矿工 */
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
  process.exit(1);
});