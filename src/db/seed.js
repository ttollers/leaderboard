"use strict";

var usersJson = require("./users.json");
var config = require("../config/default");
console.log(config);

var lb = require("../leaderboard")(config.redis);

lb.delList("leaderboard")
  .flatMap(() => {
    return usersJson.map(x => {
      return lb.add("leaderboard", x);
    })
  })
  .merge()
  .collect()
  .flatMap(() => lb.getByRange("leaderboard", 0, -1))
  .collect()
  .toArray((res) => {
    console.log(res);
  });
