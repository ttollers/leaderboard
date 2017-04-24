"use strict";

var redis = require("./db/redis");
const hl = require("highland");
const express = require("express");
const bodyParser = require('body-parser');

const Post = require("./post");
const Get = require("./get");
const Delete = require("./delete");


const app = (db) => {

  const server = express();
  server.use(bodyParser.json());
  server.get('/:key/around/:userId', Get.getAround(db));
  server.get('/:key', Get.byRank(db));
  server.get("/:key/:id", Get.byId(db));
  server.post("/:key", Post(db));
  server.delete("/:key/:id", Delete.byId(db));

  return server;
};

if (require.main === module) {

  const db = redis();
  const server = app(db);

  server.get('/healthcheck', (req, res) => res.json(200));
  server.listen(process.env.PORT || 8080);
}

module.exports = app;
