/*!
 * master.js - master process for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

/**
 * 基于事件触发器的worker.js的"镜像"，用来实例化为一个worker，内部根据packet的类型，来调用jobs执行任务。
 * [错误说法]注意，master.js仅仅就是一个"镜像"，需要实例化后使用(并不是能力上的不可以，而是代码逻辑上的要求)(错错错!!!!!!)
 * [正确说法]: master.js确实是master，实例化后创建的worker是worker，后者中监听到的消息在分门别类处理并framer化后会发回给master。
 *            造成上述误解是因为: master将自身监听worker侧消息的逻辑 和 待实例化的worker逻辑 都放在master.js一个文件里。
 */

const assert = require('bsert');
const EventEmitter = require('events');
const { format } = require('util');
const Network = require('../protocol/network');
const jobs = require('./jobs');
const Parser = require('./parser');
const Framer = require('./framer');
const packets = require('./packets');
const Parent = require('./parent'); // 此时为nodejs版本
// const Parent = require('./parent-browser'); // 此时为browser版本

/**
 * Master
 * Represents the master process.
 * @alias module:workers.Master
 * @extends EventEmitter
 */

class Master extends EventEmitter {
  /**
   * Create the master process.
   * @constructor
   */

  constructor() {
    super();

    this.parent = new Parent();
    this.framer = new Framer();
    this.parser = new Parser();
    this.listening = false;
    this.color = false;

    this.init();
  }

  /**
   * Initialize master. Bind events.
   * @private
   */

  init() {
    /**
     * data消息的处理逻辑:
     * 因为这里的data是数据帧frame.因此这里是将数据data流式进入this.parser进行解析，
     * parser会将一批data作为一个chunk解析后发送个this.parser
     * 
     */
    this.parent.on('data', (data) => {
      this.parser.feed(data);
    });

    this.parent.on('error', (err) => {
      this.emit('error', err);
    });

    this.parent.on('exception', (err) => {
      this.send(new packets.ErrorPacket(err));
      setTimeout(() => this.destroy(), 1000);
    });

    // 这里是this.parser解析过程中发送回来的error事件
    this.parser.on('error', (err) => {
      this.emit('error', err);
    });

    /**
     * packet消息的处理逻辑:
     * 注意，这里是this.parser解析过程中发送回来的packet事件
     */
    this.parser.on('packet', (packet) => {
      this.emit('packet', packet);
    });
  }

  /**
   * Set environment.
   * @param {Object} env
   */

  setEnv(env) {
    /**
     * this.color的作用???
     */
    this.color = env.BCOIN_WORKER_ISTTY === '1';
    this.set(env.BCOIN_WORKER_NETWORK);
  }

  /**
   * Set primary network.
   * @param {NetworkType|Network} network
   */

  set(network) {
    return Network.set(network);
  }

  /**
   * Send data to worker.
   * @param {Buffer} data
   * @returns {Boolean}
   */

  write(data) {
    /**
     * @TODO send data to master acturlly??
     */
    return this.parent.write(data);
  }

  /**
   * Frame and send a packet.
   * @param {Packet} packet
   * @returns {Boolean}
   */

  send(packet) {
    return this.write(this.framer.packet(packet));
  }

  /**
   * Emit an event on the worker side.
   * @param {String} event
   * @param {...Object} arg
   * @returns {Boolean}
   */

  sendEvent(...items) {
    return this.send(new packets.EventPacket(items));
  }

  /**
   * Destroy the worker.
   */

  destroy() {
    return this.parent.destroy();
  }

  /**
   * Write a message to stdout in the master process.
   * @param {Object|String} obj
   * @param {...String} args
   */

  log() {
    const text = format.apply(null, arguments);
    this.send(new packets.LogPacket(text));
  }

  /**
   * Listen for messages from master process (only if worker).
   */

  listen() {
    assert(!this.listening, 'Already listening.');

    this.listening = true;

    this.on('error', (err) => {
      this.send(new packets.ErrorPacket(err));
    });

    this.on('packet', (packet) => {
      try {
        this.handlePacket(packet);
      } catch (e) {
        this.emit('error', e);
      }
    });
  }

  /**
   * Handle packet.
   * @private
   * @param {Packet}
   */

  handlePacket(packet) {
    let result;

    switch (packet.cmd) {
      case packets.types.ENV:
        this.setEnv(packet.env);
        break;
      case packets.types.EVENT:
        this.emit('event', packet.items);
        this.emit(...packet.items);
        break;
      case packets.types.ERROR:
        this.emit('error', packet.error);
        break;
      default:
        result = jobs.execute(packet);
        result.id = packet.id;
        this.send(result);
        break;
    }
  }
}

/*
 * Expose
 */

module.exports = Master;
