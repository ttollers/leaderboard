"use strict";

const { curry, max } = require("ramda");

module.exports = {

  "byId": curry((db, req, res) => {
    const { key, id } = req.params;
    return db.getStream(`${key}_${id}`)
      .map(JSON.parse)
      .toCallback((err, result) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send(result);
        }
      });
  }),

  "byRank": curry((db, req, res) => {
    const key = req.params.key;
    const start = Number(req.query.start) || 0;
    const stop = Number(req.query.stop) || 10;

    db.zrevrangeStream(key, start, stop)
      .sequence()
      .map(id => db.getStream(`${key}_${id}`))
      .parallel(10)
      .map(JSON.parse)
      .collect()
      .toCallback((e, leaders) => {
        if (e) {
          res.send(e);
        } else {
          res.send(leaders);
        }
      });
  }),

  "getAround": curry((db, req, res) => {

    const key = req.params.key;
    const userId = req.params.userId;
    const below = Number(req.query.below) || 5;
    const above = Number(req.query.above) || 5;

    db.zrevrankStream(key, userId)
      .flatMap(rank => {
        const start = max(rank - above, 0);
        const stop = rank + below;
        return db.zrevrangeStream(key, start, stop);
      })
      .sequence()
      .map(id => db.getStream(`${key}_${id}`))
      .merge()
      .map(JSON.parse)
      .collect()
      .toCallback((e, leaders) => {
        if (e) {
          res.send(500, e);
        } else {
          res.send(leaders);
        }
      });
  })
};
