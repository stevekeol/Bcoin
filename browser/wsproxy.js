'use strict';

const assert = require('assert');
/**
 * net: NodeJS核心模块
 */
const net = require('net');
const EventEmitter = require('events');
/**
 * bsock: Minimal implementation of the socket.io protocol.
 */
const bsock = require('bsock');
/**
 * binet: IP address tools for javascript
 * - xxx
 * - xxx
 */
const IP = require('binet');

/**
 * 
 */
class WSProxy extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.ports = new Set(options.ports || []);
    /**  */
    this.io = bsock.server();
    /** 每个与代理服务器的websocket连接作为key，该socket的状态作为value */
    this.sockets = new WeakMap();

    this.init();
  }

  init() {
    this.io.on('error', (err) => {this.emit('error', err)});
    this.io.on('socket', (ws) => {this.handleSocket(ws)});
  }

  /**
   * 1. 提取出ws的连接状态详情;
   * 2. 将(ws, state)作为键/值存入Map
   * 3. 注册错误事件;
   * 4. 绑定tcp连接事件(???) ws.bind/ws.fire/ws.destory/...
   * @param  {[type]} ws [description]
   * @return {[type]}    [description]
   */
  handleSocket(ws) {
    /** 传入的参数: 该代理服务器、每一个创建的websocket连接对象 */
    const state = new SocketState(this, ws);
    this.sockets.set(ws, state);
    ws.on('error', (err) => {this.emit('error', err)});
    ws.bind('tcp connect', (port, host) => {this.handleConnect(ws, port, host)});
  }

  handleConnect(ws, port, host) {
    const state = this.sockets.get(ws);
    assert(state);

    if (state.socket) {
      this.log('Client is trying to reconnect (%s).', state.host);
      return;
    }

    if ((port & 0xffff) !== port
        || typeof host !== 'string'
        || host.length === 0) {
      this.log('Client gave bad arguments (%s).', state.host);
      ws.fire('tcp close');
      ws.destroy();
      return;
    }

    let raw, addr;
    try {
      raw = IP.toBuffer(host);
      addr = IP.toString(raw);
    } catch (e) {
      this.log('Client gave a bad host: %s (%s).', host, state.host);
      ws.fire('tcp error', {
        message: 'EHOSTUNREACH',
        code: 'EHOSTUNREACH'
      });
      ws.destroy();
      return;
    }

    if (!IP.isRoutable(raw) || IP.isOnion(raw)) {
      this.log(
        'Client is trying to connect to a bad ip: %s (%s).',
        addr, state.host);
      ws.fire('tcp error', {
        message: 'ENETUNREACH',
        code: 'ENETUNREACH'
      });
      ws.destroy();
      return;
    }

    if (!this.ports.has(port)) {
      this.log('Client is connecting to non-whitelist port (%s).', state.host);
      ws.fire('tcp error', {
        message: 'ENETUNREACH',
        code: 'ENETUNREACH'
      });
      ws.destroy();
      return;
    }

    let socket;
    try {
      /**
       * 根据暂存的state尝试ws连接
       * 诸如 Connecting to 83.58.134.138:8333 (127.0.0.1).
       * 疑问： 上面传入的ws连接和此处要尝试建立的socket，有何异同????
       */
      socket = state.connect(port, addr);
      this.log('Connecting to %s (%s).', state.remoteHost, state.host);
    } catch (e) {
      this.log(e.message);
      this.log('Closing %s (%s).', state.remoteHost, state.host);
      ws.fire('tcp error', {
        message: 'ENETUNREACH',
        code: 'ENETUNREACH'
      });
      ws.destroy();
      return;
    }

    socket.on('connect', () => {ws.fire('tcp connect', socket.remoteAddress, socket.remotePort)});
    socket.on('data', (data) => {ws.fire('tcp data', data.toString('hex'))});
    socket.on('error', (err) => {
      ws.fire('tcp error', {message: err.message,code: err.code || null});
    });
    socket.on('timeout', () => {ws.fire('tcp timeout')});
    socket.on('close', () => {
      this.log('Closing %s (%s).', state.remoteHost, state.host);
      ws.fire('tcp close');
      ws.destroy();
    });


    /**
     * ws.bing() 和 socket.on() 的区别是?
     * @param  {[type]} 'tcp  data'         [description]
     * @param  {[type]} (data [description]
     * @return {[type]}       [description]
     */
    ws.bind('tcp data', (data) => {
      if (typeof data !== 'string') return;
      socket.write(Buffer.from(data, 'hex'));
    });
    ws.bind('tcp keep alive', (enable, delay) => {socket.setKeepAlive(enable, delay)});
    ws.bind('tcp no delay', (enable) => {socket.setNoDelay(enable)});
    ws.bind('tcp set timeout', (timeout) => {socket.setTimeout(timeout)});
    ws.bind('tcp pause', () => {socket.pause()});
    ws.bind('tcp resume', () => {socket.resume()});
    ws.on('disconnect', () => {socket.destroy()});
  }

  log(...args) {
    process.stdout.write('wsproxy: ');
    console.log(...args);
  }

  attach(server) {
    this.io.attach(server);
  }
}

class SocketState {
  constructor(server, socket) {
    this.socket = null;
    this.host = socket.host;
    this.remoteHost = null;
  }

  /**
   * [connect description]
   * @param  {[type]} port [description]
   * @param  {[type]} host 可类比于 IP Address
   * @return {[type]}      [description]
   */
  connect(port, host) {
    /**
     * net.connect(net.createConnection): 
     */
    this.socket = net.connect(port, host);
    this.remoteHost = IP.toHostname(host, port);
    return this.socket;
  }
}

module.exports = WSProxy;