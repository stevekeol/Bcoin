/*!
 * parser.js - worker parser for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const assert = require('bsert');
const EventEmitter = require('events');
const packets = require('./packets');

/**
 * Parser
 * @alias module:workers.Parser
 * @extends EventEmitter
 */

class Parser extends EventEmitter {
  /**
   * Create a parser.
   * @constructor
   */

  constructor() {
    super();

    /**
     * [错误描述]: 一批一批的处理(但每个chunk不是9个data，而是约9个字节)
     * [正确描述]: 上述描述真是轻率! 此处的标志9是因为每个frame的前9个字节是frame.header(4+1+4)
     */
    this.waiting = 9;
    this.header = null;
    // 暂存待处理的流式数据
    this.pending = [];
    // 表征当前待处理的data的累积长度(随时增减的)
    this.total = 0;
  }

  feed(data) {
    // data.length 是整个数据帧frame的长度
    this.total += data.length;
    this.pending.push(data);

    while (this.total >= this.waiting) {
      const chunk = this.read(this.waiting);
      this.parse(chunk);
    }
  }

  /**
   * 每次读取大小为size(字节)的数据作为一次待处理的chunk(并动态调整pending和total)
   * @param  {number} size 读取的数据的字节数
   * @return {buffer?}      取出的数据
   */
  read(size) {
    assert(this.total >= size, 'Reading too much.');

    if (size === 0)
      return Buffer.alloc(0);

    const pending = this.pending[0];

    /**
     * 情况1: 该frame帧除了header，还有真正待处理的数据
     */
    if (pending.length > size) {
      const chunk = pending.slice(0, size);
      this.pending[0] = pending.slice(size);
      this.total -= chunk.length;
      return chunk;
    }

    /**
     * 情况1: 该frame帧只有header
     */
    if (pending.length === size) {
      const chunk = this.pending.shift();
      this.total -= chunk.length;
      return chunk;
    }

    /**
     * 下面这一段代码的功能和作用是?
     * @TODO Buffer.allocUnsafe()是NodeJS中的内置方法;待改写成browser适用的;
     */
    const chunk = Buffer.allocUnsafe(size);
    let off = 0;

    while (off < chunk.length) {
      const pending = this.pending[0];
      const len = pending.copy(chunk, off);
      if (len === pending.length)
        this.pending.shift();
      else
        this.pending[0] = pending.slice(len);
      off += len;
    }

    assert.strictEqual(off, chunk.length);

    this.total -= chunk.length;

    return chunk;
  }

  parse(data) {
    let header = this.header;

    /**
     * 什么情况下会没有帧率header呢?
     */
    if (!header) {
      try {
        header = this.parseHeader(data);
      } catch (e) {
        this.emit('error', e);
        return;
      }

      this.header = header;
      /**
       * 此处加1是因为:this.waiting要准备的表征尚未处理的数据字节数,
       * 该字节数=真正的数据大小 + 帧结束标志符号(1字节)
       */
      this.waiting = header.size + 1;

      return;
    }

    this.waiting = 9;
    this.header = null;

    let packet;
    try {
      packet = this.parsePacket(header, data);
    } catch (e) {
      this.emit('error', e);
      return;
    }

    if (data[data.length - 1] !== 0x0a) {
      this.emit('error', new Error('No trailing newline.'));
      return;
    }

    packet.id = header.id;

    /**
     * this.emit()是将packet消息发送至this所在的类(parser)对应的实例化的对象身上
     * 如 ./master.js中的构造函数中的parser.
     */
    this.emit('packet', packet);
  }

  parseHeader(data) {
    const id = data.readUInt32LE(0, true);
    const cmd = data.readUInt8(4, true);
    const size = data.readUInt32LE(5, true);
    return new Header(id, cmd, size);
  }

  /**
   * 根据framer.cmd的不同构建不同的packet
   */
  parsePacket(header, data) {
    switch (header.cmd) {
      case packets.types.ENV:
        return packets.EnvPacket.fromRaw(data);
      case packets.types.EVENT:
        return packets.EventPacket.fromRaw(data);
      case packets.types.LOG:
        return packets.LogPacket.fromRaw(data);
      case packets.types.ERROR:
        return packets.ErrorPacket.fromRaw(data);
      case packets.types.ERRORRESULT:
        return packets.ErrorResultPacket.fromRaw(data);
      case packets.types.CHECK:
        return packets.CheckPacket.fromRaw(data);
      case packets.types.CHECKRESULT:
        return packets.CheckResultPacket.fromRaw(data);
      case packets.types.SIGN:
        return packets.SignPacket.fromRaw(data);
      case packets.types.SIGNRESULT:
        return packets.SignResultPacket.fromRaw(data);
      case packets.types.CHECKINPUT:
        return packets.CheckInputPacket.fromRaw(data);
      case packets.types.CHECKINPUTRESULT:
        return packets.CheckInputResultPacket.fromRaw(data);
      case packets.types.SIGNINPUT:
        return packets.SignInputPacket.fromRaw(data);
      case packets.types.SIGNINPUTRESULT:
        return packets.SignInputResultPacket.fromRaw(data);
      case packets.types.ECVERIFY:
        return packets.ECVerifyPacket.fromRaw(data);
      case packets.types.ECVERIFYRESULT:
        return packets.ECVerifyResultPacket.fromRaw(data);
      case packets.types.ECSIGN:
        return packets.ECSignPacket.fromRaw(data);
      case packets.types.ECSIGNRESULT:
        return packets.ECSignResultPacket.fromRaw(data);
      case packets.types.MINE:
        return packets.MinePacket.fromRaw(data);
      case packets.types.MINERESULT:
        return packets.MineResultPacket.fromRaw(data);
      case packets.types.SCRYPT:
        return packets.ScryptPacket.fromRaw(data);
      case packets.types.SCRYPTRESULT:
        return packets.ScryptResultPacket.fromRaw(data);
      default:
        throw new Error('Unknown packet.');
    }
  }
}

/**
 * Header
 * @ignore
 */

class Header {
  /**
   * Create a header.
   * @constructor
   */

  constructor(id, cmd, size) {
    this.id = id;
    this.cmd = cmd;
    this.size = size;
  }
}

/*
 * Expose
 */

module.exports = Parser;
