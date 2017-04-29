"use strict";

const request = require("supertest");
const app = require("../../src/server");
const db = require("../../src/db/fakeRedis")();
const assert = require("chai").assert;
const server = request(app(db));

describe("Put Component Tests", () => {

  // Only necessary if using local redis instance
  //const flushAll = done => db.flushallStream().done(done);
  //before(flushAll);
  //afterEach(flushAll);

  describe("PUT create /:key", () => {

    const item = {
      id: "abc_1",
      score: 10,
      foo: "bar"
    };
    const key = "leaderboard";

    it("Should create an item", done => {
      server
        .put("/leaderboard")
        .send(item)
        .expect(204)
        .end(() => {
          db.getStream(`${key}_${item.id}`)
            .tap(result => assert.deepEqual(JSON.parse(result), item))
            .flatMap(() => db.zrevrangeStream(key, 0, 20, "WITHSCORES"))
            .tap(result => {
              assert.equal(result[0], item.id);
              assert.equal(result[1], item.score);
            })
            .done(done);
        });
    });

    it("fails if item is invalid (no score)", done => {
      server
        .put("/leaderboard")
        .send({
          id: "abc_1"
        })
        .expect(400)
        .end((err, res) => {
          assert.ok(res.error);
          assert.equal(res.body[0].message, "\"score\" is required");
          done();
        });
    });
  });
});
