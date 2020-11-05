/*
 * fullnode.js
 * 
 */


console.time('Require Bcoin time');
// const Bcoin = require('../../lib/bcoin-browser.js'); //
const Bcoin = require('../..'); //在该路径下会默认读取package.json中main标识的文件作为入口
console.timeEnd('Require Bcoin time');

console.time('create Bcoin fullNode');
const node = new Bcoin.FullNode({
  memory: true,
  network: 'testnet',
  workers: true
});
console.timeEnd('create Bcoin fullNode');

(async () => {
  console.time('node.open');
  await node.open();
  console.timeEnd('node.open');

  console.time('node.connect');
  await node.connect();
  console.timeEnd('node.connect');

  console.time('node.on.connect');
  node.on('connect', (entry, block) => {
    console.log('%s (%d) added to chain.', entry.rhash(), entry.height);
    console.log(block);
  });
  console.timeEnd('node.on.connect');

  node.on('tx', (tx) => {
    console.log('%s added to mempool.', tx.txid());
  });

  console.time('node.startSync');
  node.startSync();
  console.timeEnd('node.startSync');
})().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});