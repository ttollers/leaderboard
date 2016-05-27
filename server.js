"use strict";

const restify = require('restify');
var controller = require("./controller");
var config = require("./config/default.js");
var lb = require("./leaderboard")(config.redis);

var server = restify.createServer();
server.use(restify.queryParser());
server.pre(restify.pre.sanitizePath());

server.get('/:key/around/:userId', controller.getAround(lb));
server.get('/:key', controller.get(lb));


server.listen(config.server.port, function () {
    console.log('server listening', {
        server_url: config.server.host + ":" + config.server.port
    });
});

server.on('uncaughtException', function (req, res, route, err) {
    console.log(err);
    
    res.send(new restify.InternalServerError());
    res.end();
});

module.exports = server;