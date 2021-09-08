'use strict';

/*
 * Usage:(Node)
 *  Run another Bitcoin node on local regtest network, for example
 *    $ ../../bin/bcoin --network=regtest
 *  Execute this script with the other node's address and port
 *    $ node connect-to-peer.js 127.0.0.1:48444
 */

/**
 * Usage: (Node)
 * 在本地测试网络上运行另一个Node(可以以--network=regtest为参数开启)
 */

const bcoin = require('../..');
const network = bcoin.Network.get('regtest');

/**
 * 根据传入的options
 */
const peer = bcoin.Peer.fromOptions({
  // regtest网络对象作为键
  network: 'regtest',
  /**
   * agent: ???
   */
  agent: 'my-subversion',
  /**
   * hasWitness: ???
   */
  hasWitness: () => {
    return false;
  }
});

const addr = bcoin.net.NetAddress.fromHostname(process.argv[2], 'regtest');

console.log(`Connecting to ${addr.hostname}`);

peer.connect(addr);
peer.tryOpen();

peer.on('error', (err) => {
  console.error(err);
});

peer.on('packet', (msg) => {
  console.log(msg);

  if (msg.cmd === 'block') {
    console.log('Block!');
    console.log(msg.block.toBlock());
    return;
  }

  if (msg.cmd === 'inv') {
    peer.getData(msg.items);
    return;
  }
});

peer.on('open', () => {
  peer.getBlock([network.genesis.hash]);
});
