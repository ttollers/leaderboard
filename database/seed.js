"use strict";

var hl = require("highland");
var clue = require("../../app/models/clue");
var cluesJson = require("./clues.json");
var usersJson = require("./users.json");
var user = require("../../app/models/user");
var lb = require("../../app/models/leaderboard");


var streams = cluesJson.map(x => {
  return clue.create(x);
});
hl(streams)
  .merge()
  .collect()
  .pull((err, res) => {
    console.log("Seeded Clues in redis");
  });


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
