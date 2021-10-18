/*!
 * workers.js - worker processes for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */

'use strict';

const bio = require('bufio'); // Buffer and serialization utilities for javascript

/**
 * Framer
 * @alias module:workers.Framer
 */

class Framer {
  /**
   * Create a framer.
   * @constructor
   */

  constructor() {}

  packet(payload) {
    const size = 10 + payload.getSize();
    const bw = bio.write(size); // 构建长度为size的buffer可写入对象

    bw.writeU32(payload.id); // 写入4字节的id
    bw.writeU8(payload.cmd); // 写入1字节的cmd
    bw.seek(4); // 待后面写入msg的长度

    payload.toWriter(bw); // 写入要填充的正式数据

    bw.writeU8(0x0a); // 写入1字节的结束符

    const msg = bw.render(); // ???
    msg.writeUInt32LE(msg.length - 10, 5, true); // 偏移5个字节写入msg的长度(4字节)

    return msg;
  }
}

/*
 * Expose
 */

module.exports = Framer;
