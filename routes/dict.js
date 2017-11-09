let express = require('express');
let router = express.Router();

let Dict = require('../models/dict');
let restful = require('./common/rest');

function index(req, res, next) {

    let p = Dict.coll().find()
        .project({word: 1, meaning: 1});
    let from = req.query['from'];
    if (from) {
        from = parseInt(from) || 1;
        if (from > 1) {
            p = p.skip(from - 1);
        }
    }
    let limit = req.query['limit'];
    if (limit) {
        limit = parseInt(limit) || 100;
        limit = Math.min(limit, 100);
        p = p.limit(limit);
    }
    p.toArray().then(ms => res.send(ms)).catch(next);
}

let handles = restful.simpleHandles(Dict);
handles.index = index;

restful.restful(router, handles);


module.exports = router;
