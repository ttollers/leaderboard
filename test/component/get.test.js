"use strict";

const request = require("supertest");
const app = require("../../src/server");
const db = require("../../src/db/fakeRedis")();
const assert = require("chai").assert;
const server = request(app(db));
const R = require("ramda");
const hl = require("highland");

describe.only("Get Component tests", () => {

  // only necessary if using local redis instance
  //const flushAll = done => db.flushallStream().done(done);
  //before(flushAll);
  //afterEach(flushAll);

  describe("GET /:key/:id", () => {

    const user = {
      id: "abc_1",
      score: 10,
      foo: "bar"
    };

    before(done => db.setStream(`leaderboard_${user.id}`, JSON.stringify(user)).done(done));

    it("should get a user by id", done => {
      server
        .get("/leaderboard/abc_1")
        .expect(200)
        .end((err, res) => {
          const item = res.body;
          assert.equal(item.id, "abc_1");
          assert.equal(item.score, 10);
          assert.equal(item.foo, "bar");
          done();
        });
    });
  });

  describe("GET /:key", () => {

    before(done => {
      const streams = R.range(0, 6).map(num => {
        const item = {
          id: `abc_${num}`,
          score: num * 10,
          foo: "bar"
        };
        return db.setStream(`leaderboard_${item.id}`, JSON.stringify(item))
          .flatMap(() => db.zaddStream(`leaderboard`, item.score, item.id))
      });
      hl(streams)
        .merge()
        .done(done);
    });

    it("gets all 5 top leaders", (done) => {
      server
        .get("/leaderboard?start=0&stop=4")
        .expect(200)
        .end((err, res) => {
          const items = res.body;
          assert.equal(items.length, 5);
          assert.equal(items[0].id, "abc_5");
          assert.equal(items[0].score, 50);
          assert.equal(items[0].foo, "bar");
          done();
        })
    });
  });

  describe("GET /:key/around/:id", () => {

    before(done => {
      const streams = R.range(0, 6).map(num => {
        const item = {
          id: `abc_${num}`,
          score: num * 10,
          foo: "bar"
        };
        return db.setStream(`leaderboard_${item.id}`, JSON.stringify(item))
          .flatMap(() => db.zaddStream(`leaderboard`, item.score, item.id))
      });
      hl(streams)
        .merge()
        .done(done);
    });

    it("should get items surrounding by rank", (done) => {
      server
        .get("/leaderboard/around/abc_3?below=2&above=1")
        .expect(200)
        .end((err, res) => {
          const items = res.body;
          assert.equal(items.length, 4);
          assert.equal(items[0].id, "abc_4");

          // returns the item's id in the requested position
          assert.equal(items[1].id, "abc_3");

          assert.equal(items[2].id, "abc_2");
          assert.equal(items[3].id, "abc_1");
          done();
        })
    });
  });
});
