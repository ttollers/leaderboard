"use strict";

const { curry, reduce, last, assoc, merge } = require("ramda");
const hl = require("highland");


module.exports = {


  "byId": curry((db, req, res) => {
    const { key, id } = req.params;
    return db.getStream(`${key}_${id}`)
      .map(JSON.parse)
      .toCallback((err, result) => {
        if (err) console.log(err);
        res.send(result)
      })

  }),

  "byRank": curry((db, req, res) => {
    const key = req.params.key || "leaderboard";
    const start = Number(req.query.start) || 0;
    const stop = Number(req.query.stop) || 10;
    
    db.zrevrangeStream(key, start, stop, "WITHSCORES")
      .map(reduce((acc, value) => {
        if (acc.length && Object.keys(last(acc)).length % 2) {
          acc[acc.length - 1] = assoc("score", value, last(acc));
        } else {
          acc.push({"id": value})
        }
        return acc;
      }, []))
      .flatMap(hl)
      .flatMap(leader => {
        return db.getStream(`${key}_${leader.id}`)
          .map(JSON.parse)
          .map(merge(leader))
      })
      .collect()
      .toCallback((e, leaders) => {
        if (e) {
          res.send(e);
        } else {
          res.send(leaders);
        }
      })
  }),

  "getAround": curry((db, req, res) => {

    const key = req.params.key;
    const userId = req.params.userId;
    const below = Number(req.query.below) || 5;
    const above = Number(req.query.above) || 5;

    Lb.getRank(key, {"id": userId})
      .flatMap(rank => {
        var start = rank - below;
        var stop = rank + above;
        if (start < 0) {
          stop = stop + Math.abs(start);
          start = 0;
        }
        return db.zrevrangeStream(key, start, stop, "WITHSCORES")
          .map(reduce(valueScoreToPairReduce, []))
          .flatMap(hl);
      })
      .flatMap(Lb.getById)
      .collect()
      .toCallback((e, leaders) => {
        if (e) {
          res.send(500, e);
        } else {
          res.send(200, leaders);
        }
      })
  })
};
