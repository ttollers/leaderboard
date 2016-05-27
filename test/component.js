"use strict";

var request = require("supertest");
var assert = require("chai").assert;
var rewire = require("rewire");
var app = rewire("../server");
var server = request.agent(app);
var config = require("../config/default.js");
var lb = app.__get__("lb");
var R = require("ramda");

describe("/leaderboard", () => {

  const user1 = {
    "id": "id_1",
    "score": 301,
    "username": "Batman"
  };

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
    lb.delList("test-leaderboard")
      .flatMap(lb.add("test-leaderboard", user1))
      .flatMap(() => lb.add("test-leaderboard", user2))
      .flatMap(() => lb.add("test-leaderboard", user3))
      .flatMap(() => lb.add("test-leaderboard", user4))
      .flatMap(() => lb.add("test-leaderboard", user5))
      .pull(done);
  });

  describe("gets the test-leaderboard", () => {

    it("gets all 5 top leaders", (done) => {
      server
        .get("/test-leaderboard")
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 5);
          assert.isTrue(R.all(R.has("id"), res.body));
          assert.isTrue(R.all(R.has("score"), res.body));
          assert.isTrue(R.all(R.has("username"), res.body));
          assert.equal(res.body[0].username, "Joker");
          done();
        })
    });

    it("gets the top x leaders", (done) => {
      server
        .get("/test-leaderboard?start=0&stop=1")
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 2);
          assert.equal(res.body[0].username, "Joker");
          assert.equal(res.body[1].username, "Superman");
          done();
        })
    });

    it("gets leaders in middle", done => {
      server
        .get("/test-leaderboard?start=3&stop=4")
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 2);
          assert.equal(res.body[0].username, "Robin");
          assert.equal(res.body[1].username, "Batman");
          done();
        })
    });

    it("gets leaders around a user", done => {
      server
        .get("/test-leaderboard/around/id_3?below=1&above=1")
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 3);
          assert.equal(res.body[0].id, "id_4");
          assert.equal(res.body[1].id, "id_3");
          assert.equal(res.body[2].id, "id_2");
          done();
        })
    });

    it("gets leaders around correctly when user is at the top of the leaderboad", done => {
      server
        .get("/test-leaderboard/around/id_5?below=1&above=1")
        .expect(200)
        .end((err, res) => {
          assert.equal(res.body.length, 3);
          assert.equal(res.body[0].id, "id_5");
          assert.equal(res.body[1].id, "id_4");
          assert.equal(res.body[2].id, "id_3");
          done();
        })
    });
  });
});
