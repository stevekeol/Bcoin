'use strict';

const bweb = require('bweb');
const fs = require('bfile');
const WSProxy = require('./wsproxy');

const index = fs.readFileSync(`${__dirname}/index.html`);
const bundle = fs.readFileSync(`${__dirname}/bundle.js`);
// const worker = fs.readFileSync(`${__dirname}/worker.js`);

const server = bweb.server({
  port: Number(process.argv[2]) || 5000,
  sockets: false
});

server.use(server.router());

server.on('error', (err) => {
  console.error(err.stack);
});

server.get('/', (req, res) => {
  res.send(200, index, 'html');
});

server.get('/bundle.js', (req, res) => {
  res.send(200, bundle, 'js');
});

// server.get('/worker.js', (req, res) => {
//   res.send(200, worker, 'js');
// });

const proxy = new WSProxy({
  ports: [8333, 18333, 18444, 28333, 28901]
});

proxy.on('error', (err) => {
  console.error(err.stack);
});

/**
 * 将代理服务器proxy附着在server.http(http服务器)上
 */
proxy.attach(server.http);

server.open();
