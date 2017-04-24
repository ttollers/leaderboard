"use strict";

var request = require("supertest");
var app = require("../src/server");
var db = require("../src/db/redis")();
var assert = require("chai").assert;
var server = request(app(db));
var lb = require("../src/leaderboard")(db);
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
        lb.delList("leaderboard")
            .flatMap(() => lb.add("leaderboard", user1))
            .flatMap(() => lb.add("leaderboard", user2))
            .flatMap(() => lb.add("leaderboard", user3))
            .flatMap(() => lb.add("leaderboard", user4))
            .flatMap(() => lb.add("leaderboard", user5))
            .pull(done);
    });

    it("gets all 5 top leaders", (done) => {
        server
            .get("/leaderboard")
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
            .get("/leaderboard?start=0&stop=1")
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
            .get("/leaderboard?start=3&stop=4")
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
            .get("/leaderboard/around/id_3?above=1&below=1")
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
            .get("/leaderboard/around/id_5?above=1&below=1")
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
