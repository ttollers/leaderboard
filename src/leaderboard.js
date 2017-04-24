"use strict";

var R = require("ramda");
var hl = require("highland");

const valueScoreToPairReduce = (acc, value) => {
    if(acc.length && Object.keys(R.last(acc)).length % 2) {
        acc[acc.length - 1] = R.assoc("score", value, R.last(acc));
    } else {
        acc.push({"id": value})
    }
    return acc;
};

module.exports = db => {

    return {
        "getByScore": R.curry((key, min, max, limit) => {
            return db.zrevrangebyscoreStream(key, max, min, "WITHSCORES", "LIMIT", 0, limit)
                .map(R.reduce(valueScoreToPairReduce, []))
                .flatMap(hl)
        }),

        "getByRange": R.curry((key, start, stop) => {
            return db.zrevrangeStream(key, start, stop, "WITHSCORES")
                .map(R.reduce(valueScoreToPairReduce, []))
                .flatMap(hl)
        }),

        "getById": leader => {
            return db.getStream(leader.id)
                .map(JSON.parse)
                .map(R.merge(leader))
        },

        "add": (key, data) => {
            return db.zaddStream(key, data.score, data.id)
                .flatMap(db.setStream(data.id, `{"username": "${data.username}"}`))
        },

        "delList": key => db.delStream(key),

        "getRank": (key, leader) => {
            return db.zrevrankStream(key, leader.id);
        }
    }
};
