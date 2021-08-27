'use strict';

const bweb = require('bweb');
const fs = require('bfile');
const WSProxy = require('./wsproxy');

// const index = fs.readFileSync(`${__dirname}/index.html`); // 自定义的主页
const index = fs.readFileSync(`${__dirname}/_index.html`); // 官方提供的示例主页

// const app = fs.readFileSync(`${__dirname}/app.js`); // 自定义的
const app = fs.readFileSync(`${__dirname}/src/_app.js`); // 官方提供的

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

server.get('/app.js', (req, res) => {
  res.send(200, app, 'js');
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
