"use strict";

const request = require("supertest");
const app = require("../../src/server");
const db = require("../../src/db/redis")();
const assert = require("chai").assert;
const server = request(app(db));

describe("Delete Component Tests", () => {

  // only necessary if using local redis instance
  const flushAll = done => db.flushallStream().done(done);
  before(flushAll);
  afterEach(flushAll);

  describe("DELETE /:key/:id", () => {

    const item = {
      id: "abc_1",
      score: 10,
      foo: "bar"
    };
    const key = "leaderboard";

    before(done =>
      db.zaddStream(key, item.score, item.id)
        .flatMap(() => db.setStream(`${key}_${item.id}`, JSON.stringify(item)))
        .done(done));

    it("should get a user by id", done => {
      server
        .delete("/leaderboard/abc_1")
        .expect(204)
        .end(() => {
          db.getStream(`${key}_${item.id}`)
            .tap(item => assert.isNull(item))
            .flatMap(() => db.zrevrangeStream(key, 0, 20, "WITHSCORES"))
            .tap(item => assert.equal(item.length, 0))
            .done(done);
        });
    });
  });
});
