"use strict";

const hl = require("highland");
const fakeRedis = require("fakeredis");

module.exports = () => {
  fakeRedis.fast = true;
  const client = fakeRedis.createClient();
  return hl.streamifyAll(client);
};
