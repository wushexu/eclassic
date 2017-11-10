let express = require('express');
let router = express.Router();

let Dict = require('../models/dict');
let restful = require('./common/rest');


function getLimit(req, defaultLimit) {
    let limit = req.query['limit'];
    if (!limit || isNaN(limit)) {
        return defaultLimit;
    }
    return Math.min(parseInt(limit), defaultLimit);
}


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
    let limit = getLimit(req, 50);
    p.limit(limit).toArray()
        .then(ms => res.send(ms)).catch(next);
}

function show(req, res, next) {
    let idOrWord = req.params._id;
    let prom;
    if (/^[0-9a-z]{24}$/.test(idOrWord)) {
        prom = Dict.getById(idOrWord);
    } else {
        prom = Dict.coll().findOne({word: idOrWord});
    }
    prom.then(m => res.send(m)).catch(next);
}

let handles = restful.simpleHandles(Dict);
handles.index = index;
handles.show = show;

restful.restful(router, handles);


function search(req, res, next) {
    let key = req.params.key;
    if (!key) {
        res.send([]);
        return;
    }
    let regex = `^${key}.*`;
    let limit = getLimit(req, 8);
    Dict.coll().find({word: {$regex: regex}})
        .project({word: 1, meaning: 1})
        .limit(limit).toArray()
        .then(ms => res.send(ms)).catch(next);
}

router.get('/search/:key', search);

module.exports = router;
