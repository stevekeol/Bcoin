/*!
 * bcoin.js - a javascript bitcoin library.
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License).
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

/**
 * A bcoin "environment" which exposes all
 * constructors for primitives, the blockchain,
 * mempool, wallet, etc. It also exposes a
 * global worker pool.
 *
 * @exports bcoin
 * @type {Object}
 */

const bcoin = exports;

/**
 * Set the default network.
 * @param {String} network
 */
bcoin.set = function set(network) {
  bcoin.Network.set(network);
  return bcoin;
};

/*
 * Expose
 */

// Logger
bcoin.logger = require('blgr');

// Blockchain(5350 lines)
bcoin.blockchain = require('./blockchain');
bcoin.Chain = require('./blockchain/chain');
bcoin.ChainEntry = require('./blockchain/chainentry');

// Blockstore(1476 lines)
bcoin.blockstore = require('./blockstore');

// BTC(669 lines)
bcoin.btc = require('./btc');
bcoin.Amount = require('./btc/amount');
bcoin.URI = require('./btc/uri');

// Client(1447 lines)
bcoin.client = require('./client');
bcoin.NodeClient = require('./client/node');
bcoin.WalletClient = require('./client/wallet');

// Coins(1571 lines)
bcoin.coins = require('./coins');
bcoin.Coins = require('./coins/coins');
bcoin.CoinEntry = require('./coins/coinentry');
bcoin.CoinView = require('./coins/coinview');

// HD(17124 lines)
bcoin.hd = require('./hd');
bcoin.HDPrivateKey = require('./hd/private');
bcoin.HDPublicKey = require('./hd/public');
bcoin.Mnemonic = require('./hd/mnemonic');

// Index(1476 lines)
bcoin.indexer = require('./indexer');
bcoin.Indexer = require('./indexer/indexer');
bcoin.TXIndexer = require('./indexer/txindexer');
bcoin.AddrIndexer = require('./indexer/addrindexer');

/**
 * Mempool(4007 lines)
 * 注: mempool(memmory pool)也被称为交易池。由区块链网络中最近产生且未解决的交易组成。
 *     这些交易在队列中等待矿工的验证和纳入下一个区块。
 */
bcoin.mempool = require('./mempool');
bcoin.Fees = require('./mempool/fees');
bcoin.Mempool = require('./mempool/mempool');
bcoin.MempoolEntry = require('./mempool/mempoolentry');

// Miner(2163 lines)
bcoin.mining = require('./mining');
bcoin.Miner = require('./mining/miner');

// Net(14461 lines)
bcoin.net = require('./net');
bcoin.packets = require('./net/packets');
bcoin.Peer = require('./net/peer');
bcoin.Pool = require('./net/pool'); // 网络节点池

// Node(5077 lines)
bcoin.node = require('./node');
bcoin.Node = require('./node/node');
bcoin.FullNode = require('./node/fullnode');
bcoin.SPVNode = require('./node/spvnode');

// Primitives(11434 lines)
bcoin.primitives = require('./primitives');
bcoin.Address = require('./primitives/address');
bcoin.Block = require('./primitives/block');
bcoin.Coin = require('./primitives/coin');
bcoin.Headers = require('./primitives/headers');
bcoin.Input = require('./primitives/input');
bcoin.InvItem = require('./primitives/invitem');
bcoin.KeyRing = require('./primitives/keyring');
bcoin.MerkleBlock = require('./primitives/merkleblock');
bcoin.MTX = require('./primitives/mtx');
bcoin.Outpoint = require('./primitives/outpoint');
bcoin.Output = require('./primitives/output');
bcoin.TX = require('./primitives/tx');

// Protocol(2384 lines)
bcoin.protocol = require('./protocol');
bcoin.consensus = require('./protocol/consensus');
bcoin.Network = require('./protocol/network');
bcoin.networks = require('./protocol/networks');
bcoin.policy = require('./protocol/policy');

// Script(6576 lines)
bcoin.script = require('./script');
bcoin.Opcode = require('./script/opcode');
bcoin.Program = require('./script/program');
bcoin.Script = require('./script/script');
bcoin.ScriptNum = require('./script/scriptnum');
bcoin.SigCache = require('./script/sigcache');
bcoin.Stack = require('./script/stack');
bcoin.Witness = require('./script/witness');

// Utils(552 lines)
bcoin.utils = require('./utils');
bcoin.util = require('./utils/util');

// Wallet(14280 lines)
bcoin.wallet = require('./wallet');
bcoin.WalletDB = require('./wallet/walletdb');

// Workers(2917 lines)
bcoin.workers = require('./workers');
bcoin.WorkerPool = require('./workers/workerpool');

// Package Info
bcoin.pkg = require('./pkg');
