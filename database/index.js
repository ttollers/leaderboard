"use strict";

var R = require("ramda");
var hl = require("highland");

module.exports = function(config) {
  return R.isNil(config) ? initFakeRedis() : initRealRedis(config);
};

function initFakeRedis() {
  var fakeRedis = require("fakeredis");
  fakeRedis.fast = true;
  hl.streamifyAll(fakeRedis.RedisClient.prototype);
  return fakeRedis.createClient();
}

function initRealRedis(config) {
  var redis = require('redis');
  hl.streamifyAll(redis.RedisClient.prototype);
  hl.streamifyAll(redis.Multi.prototype);
  const PORT = config.port;
  const HOST = config.host;
  console.log('connected to redis at', HOST, PORT);
  return redis.createClient(PORT, HOST);
}
