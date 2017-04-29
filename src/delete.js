"use strict";

const { curry } = require("ramda");

module.exports = {
  "byId": curry((db, req, res) => {
    const { key, id } = req.params;

    db.zremStream(key, id)
      .flatMap(() => db.delStream(`${key}_${id}`))
      .done(() => {
        res.sendStatus(204);
      });
  })
};
