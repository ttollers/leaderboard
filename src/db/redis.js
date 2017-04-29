"use strict";

const hl = require("highland");
const redis = require("redis");
const { merge } = require("ramda");

module.exports = (config = {}) => {
  const defautlRedisConfig = {
    "host": process.env.REDIS_HOST || "localhost",
    "port": process.env.REDIS_PORT || 6379,
    "connect_timeout": 3000
  };
  const redisClient = redis.createClient(merge(defautlRedisConfig, config));
  return hl.streamifyAll(redisClient);
};

