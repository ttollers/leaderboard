"use strict";

const hl = require("highland");

let fakeRedis = require("fakeredis");
fakeRedis.fast = true;
hl.streamifyAll(fakeRedis.RedisClient.prototype);
module.exports = fakeRedis.createClient();
