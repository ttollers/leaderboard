"use strict";

const { curry } = require("Ramda");

module.exports = curry((db, req, res) => {
  const key = req.params.key;
  const item = req.body;
  
  return db.zaddStream(key, item.score, item.id)
    .flatMap(() => db.setStream(`${key}_${item.id}`, JSON.stringify(item)))
    .toCallback(() => res.sendStatus(204));
});
