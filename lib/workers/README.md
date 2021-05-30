# workers 

> [/workers](../workers): 区块链网络中的当前节点内部，触发而来的Activity(各种事件等)对应的处理机制

## 各文件的功能定位
|              File              |      Description       |
| :----------------------------- | :-------------------:  |
| [child-browser.js](./child-browser.js)       |  基于传入的worker（默认worker.js）创建子线程  |
| [child.js](./child.js)                       |  基于传入的worker（默认worker.js）创建子进程  |
| [framer.js](./framer.js)                     |  将线程间要传递的各种packet基于buffer序列化为固定格式的frame  |
| [index.js](./index.js)                       |  入口文件 |
| [jobs.js](./jobs.js)                         |  根据packet类型来执行对应的具体任务(执行的数据和操作，都在packet中) |
| [master.js](./master.js)                     |  worker.js的"镜像"，用来实例化为一个worker，内部根据packet的类型，来调用jobs执行任务 |
| [packets.js](./packets.js)                   |  封装各种packet，用以在线程间传递一个事件处理所需要的全部要素:数据+操作 |
| [parent-browser.js](./parent-browser.js)     |  与child.js对应的主线程 |
| [parent.js](./parent.js)                     |  与child.js对应的主进程 |
| [parser.js](./parser.js)                     |  将序列化的packet中的数据解析出来 |
| [worker.js](./worker.js)                     |  实例化master，并等待消息  |
| [workerpool.js](./workerpool.js)             |  工作线程/进程池: 线程的创建，均衡，销毁等 |

## 文件的依赖关系树

workers
├──index
│  ├──workerpool
│  │  └──child.js
│  └──workerpool.js
├──shared
│  ├──framer.js
│  ├──jobs.js
│  ├──packets.js
│  └──parser.js
├──worker
│  ├──master
│  │  └──parent.js
│  └──master.js
├──child-browser.js
├──index.js
├──parent-browser.js
├──README.md
└──worker.js

## 文件详解

#### packet.js
+ packet的header包括: id, cmd, size
