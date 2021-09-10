'use strict';

/**
 * client-api.js
 * 钱包/钱包客户端的使用
 * 关键词: 全节点、钱包插件、钱包客户端、节点客户端、钱包数据库
 */

const bcoin = require('../..');
/** 注意Bcoin中插件系统的使用 */
const plugin = bcoin.wallet.plugin;
/** 
 * bcoin.Network.get() 只一个静态方法
 * 当入参是内置网络类型时，直接返回该网络类型字符串或网络类型对象;
 * 当入参不是内置网络类型时，相当于注册一个新的网络类型
 */
const network = bcoin.Network.get('regtest');

/** 创建基于内存的测试网全节点 */
const node = new bcoin.FullNode({
  network: 'regtest',
  memory: true
});

/** 
 * 节点使用插件的方式
 * use是fullnode的基类node提供的
 * use(plugin) { 
 *   ...
 *   const instance = plugin.init(this);
 *   ...
 *   this.plugins[plugin.id] = instance;
 * }
 *
 * plugin.init(this/node) {
 *   return new Plugin(node);
 * }
 */
node.use(plugin);

/**
 * 创建钱包客户端
 * port: network.walletPort 钱包专用客户端
 */
const walletClient = new bcoin.WalletClient({
  port: network.walletPort
});

/**
 * 创建节点客户端
 * 节点客户端和节点的异同:
 * 1.
 * 2.
 *
 * 节点客户端和钱包客户端的异同
 */
const nodeClient = new bcoin.NodeClient({
  port: network.rpcPort
});

async function fundWallet(wdb, addr) {
  // Coinbase
  const mtx = new bcoin.MTX();
  mtx.addOutpoint(new bcoin.Outpoint(bcoin.consensus.ZERO_HASH, 0));
  mtx.addOutput(addr, 50460);
  mtx.addOutput(addr, 50460);
  mtx.addOutput(addr, 50460);
  mtx.addOutput(addr, 50460);

  const tx = mtx.toTX();

  /**
   * walletClient.bind()中bind的实现原理:
   * bind是walletclient的基类Client(bcurl提供的Client——是一个HTTP客户端，但最终还是bsock中的socket.js提供的)
   * 即: bind(event, handler) { this.events.on(event, handler) }
   *
   * balance: 余额事件
   * address: 地址事件(?)
   * tx: 交易事件
   */
  walletClient.bind('balance', (walletID, balance) => {
    console.log('New Balance:');
    console.log(walletID, balance);
  });

  walletClient.bind('address', (walletID, receive) => {
    console.log('New Receiving Address:');
    console.log(walletID, receive);
  });

  walletClient.bind('tx', (walletID, details) => {
    console.log('New Wallet TX:');
    console.log(walletID, details);
  });

  await wdb.addTX(tx);
  await new Promise(r => setTimeout(r, 300));
}

async function sendTX(addr, value) {
  const options = {
    rate: 10000,
    outputs: [{
      value: value,
      address: addr
    }]
  };

  // API call: walletClient.send('test', options)
  const tx = await walletClient.request('POST', '/wallet/test/send', options);

  return tx.hash;
}

async function callNodeApi() {
  // API call: nodeClient.getInfo()
  const info = await nodeClient.request('GET', '/');

  console.log('Server Info:');
  console.log(info);

  const json = await nodeClient.execute(
    'getblocktemplate',
    [{rules: ['segwit']}]
  );

  console.log('Block Template (RPC):');
  console.log(json);
}

(async () => {

  /** 
   * 动态加载全节点提供的"钱包数据库"插件功能
   * node.require(){ const plugin = this.get(name); return plugin; }
   */
  const wdb = node.require('walletdb').wdb;

  await node.open();

  // API call: walletClient.createWallet('test')
  const testWallet = await walletClient.request('PUT', '/wallet/test');

  console.log('Wallet:');
  console.log(testWallet);

  // open socket to listen for events
  await walletClient.open();

  // subscribe to events from all wallets
  walletClient.all();

  // Fund default account.
  // API call: walletClient.createAddress('test', 'default')
  const receive = await walletClient.request(
    'POST',
    '/wallet/test/address',
    {account: 'default'}
  );
  await fundWallet(wdb, receive.address);


  // API call: walletClient.getBalance('test', 'default')
  const balance = await walletClient.request(
    'GET',
    '/wallet/test/balance',
    {account: 'default'}
  );

  console.log('Balance:');
  console.log(balance);


  // API call: walletClient.createAccount('test', 'foo')
  const acct = await walletClient.request('PUT', '/wallet/test/account/foo');

  console.log('Account:');
  console.log(acct);


  // Send to our new account.
  const hash = await sendTX(acct.receiveAddress, 10000);

  console.log('Sent TX:');
  console.log(hash);
  

  // API call: walletClient.getTX('test', hash)
  const tx = await walletClient.request('GET', `/wallet/test/tx/${hash}`);

  console.log('Sent TX details:');
  console.log(tx);

  await callNodeApi();
  await walletClient.close();
  await node.close();
})().catch((err) => {
  console.error(err.stack);
  process.exit(1);
});
