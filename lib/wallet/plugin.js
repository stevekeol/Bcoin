/*!
 * plugin.js - wallet plugin for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

/**
 * wallet/plugin.js: 钱包插件
 */

'use strict';

const EventEmitter = require('events');
const WalletDB = require('./walletdb');
const NodeClient = require('./nodeclient');
const HTTP = require('./http');
const RPC = require('./rpc');

/**
 * @exports wallet/plugin
 * 导出方式: wallet/plugin,然后利用plugin.init()来创建一个Plugin实例
 */

const plugin = exports;

/**
 * Plugin(该类并没有直接导出): 利用节点的属性来创建一个钱包插件(即钱包工作对象)
 * @extends EventEmitter
 */

class Plugin extends EventEmitter {
  /**
   * Create a plugin.
   * @constructor
   * @param {Node} node
   */

  constructor(node) {
    super();

    this.config = node.config.filter('wallet');

    if (node.config.options.file)
      this.config.open('wallet.conf');

    this.network = node.network;
    this.logger = node.logger;
    this.client = new NodeClient(node);

    this.wdb = new WalletDB({
      network: this.network,
      logger: this.logger,
      workers: this.workers,
      client: this.client,
      prefix: this.config.prefix,
      memory: this.config.bool('memory', node.memory),
      maxFiles: this.config.uint('max-files'),
      cacheSize: this.config.mb('cache-size'),
      witness: this.config.bool('witness'),
      wipeNoReally: this.config.bool('wipe-no-really'),
      spv: node.spv
    });

    this.rpc = new RPC(this);

    this.http = new HTTP({
      network: this.network,
      logger: this.logger,
      node: this,
      ssl: this.config.bool('ssl'),
      keyFile: this.config.path('ssl-key'),
      certFile: this.config.path('ssl-cert'),
      host: this.config.str('http-host'),
      port: this.config.uint('http-port'),
      apiKey: this.config.str('api-key', node.config.str('api-key')),
      walletAuth: this.config.bool('wallet-auth'),
      noAuth: this.config.bool('no-auth'),
      cors: this.config.bool('cors'),
      adminToken: this.config.str('admin-token')
    });

    this.init();
  }

  /**
   * init()和plugin.init = function init(node){ return new Plugin(node) } 的区别
   * 前者使用: p = new Plugin(); p.init()
   * 后者使用: 因为该文件导出的是plugin. 利用plugin.init来创建一个Plugin实例
   */
  init() {
    this.wdb.on('error', err => this.emit('error', err));
    this.http.on('error', err => this.emit('error', err));
  }

  async open() {
    await this.wdb.open();
    this.rpc.wallet = this.wdb.primary;
    await this.http.open();
  }

  async close() {
    await this.http.close();
    this.rpc.wallet = null;
    await this.wdb.close();
  }
}

/**
 * Plugin name.
 * @const {String}
 */

plugin.id = 'walletdb';

/**
 * Plugin initialization.
 * @param {Node} node
 * @returns {WalletDB}
 */

plugin.init = function init(node) {
  return new Plugin(node);
};
