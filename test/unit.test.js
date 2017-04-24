"use strict";

var db = require("../src/db/redis")();
var lb = require("../src/leaderboard")(db);
var assert = require("chai").assert;
var R = require("ramda");

describe("leaderboards", () => {

  const batman = {
    "id": "id_1",
    "score": 301,
    "username": "Batman"
  };

  describe("add()", () => {

    before(done => lb.delList("leaderboard").pull(done));

    it("adds a user to the leaderboard", (done) => {
      lb.add("leaderboard", batman)
        .flatMap(() => lb.getByScore("leaderboard", 0, 500, 10))
        .toArray((res) => {
          assert.equal(res[0].id, "id_1");
          assert.equal(res[0].score, 301);
          assert.equal(res.length, 1);
          done();
        });
    });
  });

  describe("get()", () => {

    const user2 = {
      "id": "id_2",
      "score": 302,
      "username": "Robin"
    };
    const user3 = {
      "id": "id_3",
      "score": 303,
      "username": "CatWoman"
    };
    const user4 = {
      "id": "id_4",
      "score": 304,
      "username": "Superman"
    };
    const user5 = {
      "id": "id_5",
      "score": 305,
      "username": "Joker"
    };

    before(done => {
      lb.delList("leaderboard")
        .flatMap(lb.add("leaderboard", batman))
        .flatMap(() => lb.add("leaderboard", user2))
        .flatMap(() => lb.add("leaderboard", user3))
        .flatMap(() => lb.add("leaderboard", user4))
        .flatMap(() => lb.add("leaderboard", user5))
        .pull(done);
    });

    it("gets all users from the leaderboard", (done) => {
      lb.getByRange("leaderboard", 0, -1)
        .toArray((res) => {
          assert.equal(res.length, 5);
          assert.isTrue(R.all(R.has("id"), res));
          assert.isTrue(R.all(R.has("score"), res));
          done();
        });
    });

    it("gets only the top 2 leaders", done => {
      lb.getByRange("leaderboard", 0, 1)
        .toArray((res) => {
            assert.equal(res.length, 2);
            assert.equal(res[0].id, "id_5");
            assert.equal(res[0].score, 305);
            done();
        })
    });

    it("gets other stored data about a user such as username", (done) => {
      lb.getByRange("leaderboard", 4, 4)
        .flatMap(lb.getById)
        .toArray((res) => {
            assert.equal(res[0].username, "Batman");
            done();
        })
    });

    it("changes the score of a leader and hence their position", (done) => {
      const robin = {
        "id": "id_2",
        "score": 306,
        "username": "Robin"
      };
      lb.add("leaderboard", robin)
        .flatMap(() => lb.getByRange("leaderboard", 0, -1))
        .flatMap(lb.getById)
        .toArray((res) => {
          assert.equal(res.length, 5);
          assert.equal(res[0].score, 306);
          assert.equal(res[0].id, "id_2");
          done();
        });
    });

  });
});
