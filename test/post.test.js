"use strict";

var request = require("supertest");
var app = require("../src/server");
var db = require("../src/db/redis")();
var assert = require("chai").assert;
var server = request(app(db));
var lb = require("../src/leaderboard")(db);
var R = require("ramda");

describe.only("POST /:key", () => {

  it("Adds an item", (done) => {
    
    const given = {
      id: "abc_1",
      score: 20,
      foo: "bar"
    };
    
    server
      .post("/leaderboard")
      .send(given)
      .expect(204)
      .end((err, res) => {
        done();
      })
  });
});
