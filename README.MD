# Mongoose之Express中实现ORM

## Mongoose 介绍
来自官网 https://mongoosejs.com/ 的介绍：
> elegant mongodb object modeling for node.js

Node.js中，关系型数据库的ORM框架有 TypeOrm、Sequelize、Prisma等，而MongoDB的ORM框架mongoose应该为首选。Mongoose提供了基于Schema结构定义的数据模型，以及开箱即用的内置数据验证、查询构建等功能，如果你是一个Java开发者，那么mongoose提供了类似Spring Data JPA、Mybatis Plus的开发体验。

## 初始化工程
我们创建一个用于小猫（kitten）信息维护的ExpressJS工程mongoose-kitten，数据结构如下：

|kittens| | | |
| :-----: | ----- | ----- | ----- |
|\_id|ObjectId| | |
|name|String| | |
|age|Number| | |
|colors|\[Color\]|\_id|ObjectId|
| | |name|String|

1. 初始化工程
   *Terminal*中执行：

```bash
mkdir mongoose-kitten
cd mongoose-kitten
npm init
```
2. 添加依赖

```bash
npm install express mongoose dotenv
npm install nodemon prettier -D
```
`express: 轻量、灵活的 Node.js web 应用框架`
`mongoose：Node.js 中 MongoDB 的 Object 与 Model 映射框架`
`dotenv: 一个从 .env 文件中加载环境变量到 prosess.env 中的工具`
`nodemon: 监听源代码的更改并重启服务（for development）`

3. 调整工程结构

```Plain Text
├── bin
├── .env
├── .node-version
├── package.json
├── package-lock.json
├── public
└── src
    ├── app.js
    ├── config
    │   └── index.js
    ├── db
    │   ├── index.js
    │   ├── model
    │   │   ├── index.js
    │   └── schema
    │       ├── index.js
    ├── router
    │   └── index.js
    └── service
        ├── index.js
```
4. 编辑工程入口文件 src/app.js，启动web service application:

```javascript
const express = require("express")
const app = express()
const port = 3000

app.listen(port, () => {
    console.log("service started on port: ", port)
})
```
5. package.json scripts中添加 ` "serve" : "nodemon src/app.js"`

package.json：

```json
{
  "name": "mongoose-kitten",
  "version": "1.0.0",
  "description": "start mongoose with express",
  "main": "src/app.js",
  "scripts": {
    "serve": "nodemon src/app.js"
  },
  "keywords": [
    "mongoose",
    "express"
  ],
  "author": "https://github.com/louie-001",
  "license": "ISC",
  "dependencies": {
    "dotenv": "^16.0.0",
    "express": "^4.17.3",
    "mongoose": "^6.2.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.15",
    "prettier": "^2.5.1"
  }
}
```
6. 启动服务

```bash
npm run serve
```
## 使用配置文件
编辑 `.env` ，写入配置信息：

```Plain Text
SERVER_PORT=3000

DB_HOST=127.0.0.1
DB_PORT=27017
DB_NAME=test
```
编辑 `src/config/index.js`

```javascript
require('dotenv').config()

const port = process.env.SERVER_PORT
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dataBase: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
}

module.exports = {
    port,
    dbConfig
}
```
## 使用mongoose连接mongoDB
根据config信息，在server启动时创建数据库connection, 当服务退出时 close connection。

### Database connect
1. src/db/index.js:

```javascript
const mongoose = require("mongoose");
const { host, port, dataBase, user, pass } = require("../config").dbConfig;

// connect mongoDB and get connection
const connection = mongoose.connection;
const uri = `mongodb://${host}:${port}`;
const options = {
  dbName: dataBase,
  user,
  pass,
  autoIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

mongoose.connect(uri, options);

connection.on("connecting", () => {
  console.log("database connecting ...");
});

connection.on("connected", () => {
  console.log("database connected !");
});

connection.on("error", (error) => {
  console.error(error);
});

connection.on("close", () => {
  console.log("database closed !");
});

// close mongoDB connection when process exit
const close = () => {
  console.log("database connection closing ...");
  if (connection) {
    connection.close();
  }
};

process.on("exit", close);
```
### 数据库连接随服务一同创建

1. 修改 src/app.js，添加database：

```javascript
require("./db")
const express = require("express")
const app = express()
const {port} = require("./config")

app.listen(port, () => {
    console.log("service started on port: ", port)
})
```
启动服务，Terminal 输出 `database connected !`

## mongoose 使用
现在我们为小猫咪们提供一些API，这些API包括小猫咪们的增删改查以及指定小猫咪颜色的增删改查。为此，首先我们要添加Router Middleware，以及小猫咪们（kittens）的router。

### 编辑业务路由
1. router/kitten.router.js

```javascript
const express = require("express");
const router = express.Router();
const { kittenService } = require("../service");

router.use(express.json());

/**
 * 获取小猫咪
 * id: String, kitten's primary key
 * return: id ? kitten详细信息 : kittens 列表
 */
router.get("/(:id)?", (req, res) => {
  kittenService.getKitten(req.params.id).then((result) => {
    res.send(result);
  });
});

/**
 * 新增小猫咪信息
 * return：新增后的小猫咪信息
 */
router.post("", (req, res) => {
  kittenService.save(req.body).then((result) => {
    res.send(result);
  });
});

/**
 * 修改小猫咪信息
 */
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const kitten = req.body;
  kittenService.modify(id, kitten).then((result) => {
    res.send(result);
  });
});

/**
 * 小猫咪被领养了
 * id: String kitten's primary key
 * return: the removed kitten
 */
router.delete("/:id", (req, res) => {
  const kittenId = req.params.id;
  kittenService.remove(kittenId).then((result) => {
    res.send(result);
  });
});

/**
 * 给小猫咪添加颜色
 * id: String kitten's primary key
 * color: new color name
 * return: the updated kitten
 */
router.post("/color", (req, res) => {
  const { id, color } = req.body;
  kittenService.setColor(id, color).then((result) => {
    res.send(result);
  });
});

/**
 * 删除小猫咪的颜色
 * id: String kitten's primary key
 * colorId: String color's primary key
 * return: the updated kitten
 */
router.delete("/color", (req, res) => {
  const { id, colorId } = req.body;
  kittenService.removeColor(id, colorId).then((result) => {
    res.send(result);
  });
});

/**
 * 修改小猫咪颜色
 */
router.put("/color/:id", (req, res) => {
  const kittenId = req.params.id;
  const color = req.body;
  kittenService.modifyColor(kittenId, color).then((result) => {
    res.send(result);
  });
});

module.exports = router;
```
2. src/router/index.js

```javascript
const kittenRouter = require("./kitten.router");

module.exports = {
  kittenRouter,
};
```
### 配置路由
将 kittenRouter加入 src/app.js:

```javascript
require("./db");
const express = require("express");
const { port } = require("./config");
const { kittenRouter } = require("./router");
const app = express();

app.use("/api/v1/kittens", kittenRouter);

app.listen(port, () => {
  console.log("service started on port: ", port);
});
```
### Schema
一只小猫咪有名字、年龄和多种毛色，src/schema/kitten.schema.js：

```javascript
const { Schema } = require("mongoose");

const colorSchema = new Schema({ name: String }, { timestamps: true });

const kittenSchema = new Schema(
  {
    name: String,
    age: Number,
    colors: {
      type: [colorSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = kittenSchema;
```
src/schema/index.js

```javascript
const kittenSchema = require("./kitten.schema.js")

module.exports = {
    kittenSchema
}
```


### Model
使用mongoose.Model 进行数据库操作，src/model/kitten.model.js：

```javascript
const { model } = require("mongoose");
const { kittenSchema } = require("../schema");
const {kittenModel} = require("./index");

const KittenModel = model("kitten", kittenSchema);

const find = (filter = {}) => KittenModel.find(filter).exec();

const findOne = (filter = {}) => KittenModel.findOne(filter).exec();

const findById = (id) => KittenModel.findById(id).exec();

const save = (kitten) => new KittenModel(kitten).save();

const remove = (id) => KittenModel.findByIdAndRemove(id).exec()

const modify = (id, kitten) => KittenModel.findByIdAndUpdate(id, kitten).exec()

module.exports = {
    find,
    findOne,
    findById,
    save,
    remove,
    modify
};
```
以上为对MongoDB库中 kittens 进行基础的CRUD操作。

## 业务实现
src/router/kitten.router.js中的 `kittenService` 为Kitten业务实现，其中包括通过KittenModel进行基础的增删改查操作和对 SubSchema的操作实现，src/service/kitten.service.js：

1. CRUD

```javascript
const { kittenModel } = require("../db/model");

const save = (kitten) => kittenModel.save(kitten);

const listAll = () => kittenModel.find();

const detail = (id) => kittenModel.findById(id);

const getKitten = (id) => (id ? detail(id) : listAll());

const remove = (id) => kittenModel.remove()

const modify = (id, kitten) => kittenModel.modify(id, kitten)
```
2. Sub Schema 的 CRUD

```javascript
/**
 * 捡到了一只小猫咪，记录它的颜色信息
 * @param {String} id kitten's primary key 
 * @param {Object} color kitten's color info
 * @return {Promise<Document>} updated kitten's document
 */
const setColor = (id, color) =>
  kittenModel.findById(id).then((kitten) => {
    kitten.colors.push({ name: color });
    return kitten.save();
  });

/**
 * 一个颜色是脏东西，洗干净后没有了
 * @param {String} id kitten's primary key
 * @param {String} colorId color's primary key
 * @return {Promise<Document>} updated kitten's document
 */
const removeColor = (id, colorId) =>
  kittenModel.findById(id).then((kitten) => {
    const color = kitten.colors.id(colorId);
    if (color) {
      color.remove();
    }
    return kitten.save();
  });

/**
 * 长大后毛色加深，灰色变成了黑色
 * @param {String} id kitten's primary key
 * @param {String} colorId color's primary key
 * @param {String} name new color's name
 * @return {Promise<Document>} updated kitten's document
 */
const modifyColor = (id, { id: colorId, name }) =>
  kittenModel.findById(id).then((kitten) => {
    kitten.colors.id(colorId).name = name
    return kitten.save();
  });
```
3. src/service/kitten.service.js 对外导出

```javascript
module.exports = {
  getKitten,
  save,
  modify,
  remove,
  setColor,
  removeColor,
  modifyColor,
};
```
src/service/index.js

```javascript
const kittenService = require('./kitten.service')

module.exports = {
    kittenService
}
```
---
以上，完成了kittens的信息维护API，启动服务，通过 `http://localhost:3000/kittens` 进行API访问。

1. 该内容中的所有逻辑、代码均以演示为目的，严谨性和可靠性不在考虑范围
2. 所有demo代码已上传github：[https://github.com/louie-001/mongoose-kitten.git](https://github.com/louie-001/mongoose-kitten.git)
3. 博客一同步 https://juejin.cn/post/7069689169349443591
