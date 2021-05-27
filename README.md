# Bcoin

> [自己的重点笔记](https://github.com/stevekeol/marktext-articles/blob/master/bcoin%E7%9A%84%E6%B2%89%E8%BF%B7%E4%B9%8B%E8%B7%AF.md)

## 基于Bcoin的 `Taiki` 总体规划路线

#### 在浏览器端运行起单个bcoin.bundle.js
  - [√] 已经成功运行(以create-a-blockchain-and-mempool.js为例)

#### 在浏览器端运行起wsProxy的功能，能监听链上事件，并做出反应
  - [] 实现代理服务器的功能
  - [] 用react实现简易前端: 功能页面和对应的逻辑模块，隶属同一组件
  - [] examples中所有示例，拆分成可嵌入的模块

#### 根据官方核心机制，API，Events把玩各个接口和功能，完整的写在example-demo.html中
  > [bcoin/guides.html](https://bcoin.io/guides.html)
  - [] 交易操作：使用bcoin和MTX,TX对象进行交易操作;
  - [] 构建Web应用：使用bcoin库中的各个模块来构建Web应用程序;
  - [] 钱包账户钥匙：使用bcoin创建和使用钱包
  - [] 跨链原子交易：使用bcoin和bcash库，在两条链上的两个用户之间执行币的交换。创建一个哈希时间锁合约来安全的执行交易;
  - [] 隔离见证：隔离见证和bcoin的配合使用;
  - [] 区块链上存储数据：创建一个交易，其输出包含一个空数据脚本;
  - [] 创建多重签名交易：使用内置的bcoin组件和钱包api来创建和处理多重签名交易;
  - [] 命令行中多重签名：
  - [] 生成地址：使用内置的bcoin组件从0开始构建交易;
  - [] 事件和sockets：所有事件的清单，哪些函数调用他们，它们又返回哪些数据，哪些对象捕获并重新触发它们，及通过websocket连接可以使用哪些事件;
  - [] 创建一个众筹交易：通过构建自定义的众筹交易，让任何人将自己的输入添加到具有固定输出的交易中，来了解SIGHASH标志在比特币中的工作方式;
  - [] 连接两个本地节点：在单个脚本中启动并手动连接两个regtest节点;
  - [] 事件锁定的比特币交易：了解如何使用带有bcoin的比特币脚本进行和赎回时间锁定交易。将提供一个函数来创建一个脚本，该脚本在预定的时间内锁定UTXO，并分别学习如何对这些类型的特殊输入进行签名;
  - [] 构建很棒的bcoin插件：通过构建bcoin插件来扩展功能;
  - [] 在浏览器中运行bcoin全节点：通过使用一个代理服务器，我们能将客户端连接到真实的比特币网络;
  > 真的必须要一个代理服务器吗? 虽然说基于安全考虑，浏览器不允许在脚本中向别的服务器创建TCP连接。
  - [] 在树莓派等linux设备上运行bcoin：运行bcoin节点并使用尽可能少的资源尽快与比特币网络进行交互。

#### 设计一些页面(React，可参考一些比特币/区块链应用的优秀页面)，利用Bcoin的一些接口完成一些功能；
  - [] 参考对象: Blockchain, Polkawallet, Wallet, Status, MetaMask, 麦子钱包, BFChain等App
  - [] 参考网站: [比特币数据可视化](https://bitcoinvisuals.com/), [实时状态的展示](https://mempool.space/zh/)等

#### 改造该Bcoin，使之能用在BFT上的共识协议上；（可插拔的共识协议...）

#### 基于ReactNative + Telegram + Wallet + Status做一款移动端安全聊天+点对点转账+交易上链的应用

#### 将Bcoin改造成TON白皮书的那种设想（Telegram + Wallet + 工作链/分片链，需要参考TON的C++源码）

------------------------------------------------------------------

[![Build Status][circleci-status-img]][circleci-status-url]
[![Coverage Status][coverage-status-img]][coverage-status-url]

**Bcoin** is an alternative implementation of the Bitcoin protocol, written in
JavaScript and C/C++ for Node.js.

Bcoin is well tested and aware of all known consensus rules. It is currently
used in production as the consensus backend and wallet system for
[purse.io][purse].

## Uses

- Full Node
- SPV Node
- Wallet Backend
- Mining Backend (getblocktemplate support)
- Layer 2 Backend (lightning)
- General Purpose Bitcoin Library

Try it in the browser: [https://bcoin.io/browser/](https://bcoin.io/browser/)

## Install

```
$ git clone git://github.com/bcoin-org/bcoin.git
$ cd bcoin
$ npm rebuild
$ ./bin/bcoin
```

See the [Getting started][guide] guide for more in-depth installation
instructions, including verifying releases. If you're upgrading, see the
latest changes via the [Changelog][changelog].

## Documentation

- General docs: [docs/](docs/README.md)
- Wallet and node API docs: https://bcoin.io/api-docs/
- Library API docs: https://bcoin.io/docs/

## Support

Join us on [freenode][freenode] in the [#bcoin][irc] channel.

## Disclaimer

Bcoin does not guarantee you against theft or lost funds due to bugs, mishaps,
or your own incompetence. You and you alone are responsible for securing your
money.

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`

## License

- Copyright (c) 2014-2015, Fedor Indutny (MIT License).
- Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).

See LICENSE for more info.

[purse]: https://purse.io
[guide]: docs/getting-started.md
[freenode]: https://freenode.net/
[irc]: irc://irc.freenode.net/bcoin
[changelog]: CHANGELOG.md

[coverage-status-img]: https://codecov.io/gh/bcoin-org/bcoin/badge.svg?branch=master
[coverage-status-url]: https://codecov.io/gh/bcoin-org/bcoin?branch=master
[circleci-status-img]: https://circleci.com/gh/bcoin-org/bcoin/tree/master.svg?style=shield
[circleci-status-url]: https://circleci.com/gh/bcoin-org/bcoin/tree/master
