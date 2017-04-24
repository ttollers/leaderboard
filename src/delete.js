"use strict";

const { curry } = require("ramda");

module.exports = {
  "byId": curry((db, req, res) => {
    const { key, id } = req.params;

    zrevrankStream(key, id)
      .flatMap(db.delStream(`${key}_${id}`))
      .toCallback((err, result) => {
        console.log(err, result);
        res.sendStatus(204);
      });
  })
};
