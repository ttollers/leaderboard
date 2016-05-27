"use strict";

module.exports = {
    "get": lb => (req, res) => {
        const key = req.params.key;
        const start = req.query.start || 0;
        const stop = req.query.stop || 10;
        
        lb.getByRange(key, start, stop)
            .flatMap(lb.getById)
            .collect()
            .toCallback((e, leaders) => {
                if (e) {
                    res.send(e);
                } else {
                    res.send(leaders);
                }
            })
    },

    "getAround": lb => (req, res) => {
        const key = req.params.key;
        const userId = req.params.userId;
        const below = Number(req.query.below) || 5;
        const above = Number(req.query.above) || 5;

        lb.getRank(key, {"id": userId})
            .flatMap(rank => {
                var start = rank - below;
                var stop = rank + above;
                if (start < 0) {
                    stop = stop + Math.abs(start);
                    start = 0;
                }
                return lb.getByRange(key, start, stop)
            })
            .flatMap(lb.getById)
            .toArray(leaders => {
                res.send(leaders);
            })
    }
};