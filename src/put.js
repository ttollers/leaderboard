"use strict";

const { curry } = require("ramda");
const validate = require("./validate");

module.exports = curry((db, req, res) => {
  const key = req.params.key;
  const item = req.body;

  validate.stream(item)
    .flatMap(item => db.zaddStream(key, item.score, item.id))
    .flatMap(() => db.setStream(`${key}_${item.id}`, JSON.stringify(item)))
    .toCallback(err => {
      if(err) {
        if(err.name === "ValidationError") res.status(400).send(err.details);
        else res.status(500).send(err);
      }
      else res.sendStatus(204);
    });
});
