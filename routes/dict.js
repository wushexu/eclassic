let express = require('express');
let router = express.Router();
const {extractFields, sendMgResult, wrapAsync, wrapAsyncOne} = require('../common/helper');

let Dict = require('../models/dict');
let restful = require('./common/rest');
let {guestBaseForms, guestStem} = require('../dict-setup/lib/word-forms');
let {loadAWordOnTheFly} = require('../dict-setup/load-on-the-fly');


function getLimit(req, defaultLimit) {
    let limit = req.query['limit'];
    if (!limit || isNaN(limit)) {
        return defaultLimit;
    }
    return Math.min(parseInt(limit), defaultLimit);
}


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

function isId(idOrWord) {
    return /^[0-9a-z]{24}$/.test(idOrWord);
}

async function showAsync(req, res, next) {
    let idOrWord = req.params._id;
    let entry;
    if (isId(idOrWord)) {
        entry = await Dict.getById(idOrWord);
        return res.json(entry);
    }
    let word = idOrWord;
    entry = await Dict.coll().findOne({word});
    if (!entry && word.toLowerCase() !== word) {
        entry = await Dict.coll().findOne({word: word.toLowerCase()});
    }
    if (entry) {
        if (!entry.simple || entry.simple.length === 0) {
            let bfs = entry.baseForms;
            if (bfs && bfs.length === 1) {
                let baseForm = bfs[0];
                let bfe = await Dict.coll().findOne({word: baseForm});
                if (bfe) {
                    entry = bfe;
                }
            }
        }
        return res.json(entry);
    }
    let loadOnTheFly = req.query.lotf;
    if (typeof loadOnTheFly !== 'undefined') {
        entry = await loadAWord(word);
        if (entry) {
            return res.json(entry);
        }
    }
    let getBase = req.query.base;
    if (typeof getBase !== 'undefined') {
        let bases = guestBaseForms(word);
        // console.log(bases);
        for (let base of bases) {
            entry = await Dict.coll().findOne({word: base});
            if (entry) {
                return res.json(entry);
            }
        }
    }
    let getStem = req.query.stem;
    if (typeof getStem !== 'undefined') {
        let stem = guestStem(word);
        if (stem) {
            entry = await Dict.coll().findOne({word: stem});
        }
    }

    res.json(entry);
}

async function createAsync(req, res, next) {
    let entry = extractFields(req, Dict.fields.createFields);
    let word = entry.word;
    if (!word) {
        // sendError(req, res)('missing WORD');
        // return;
        throw new Error('missing WORD');
    }
    let existed = await Dict.coll().findOne({word}, {word: 1});
    if (existed) {
        await Dict.update(existed._id, entry);
        res.send({_id: existed._id});
    } else {
        if (typeof entry.simple === 'undefined') {
            entry.simple = null;
        }
        await Dict.create(entry);
        res.send(entry);
    }
}

async function updateAsync(req, res, next) {
    let entry = extractFields(req, Dict.fields.updateFields);
    let idOrWord = req.params._id;
    let result;
    if (isId(idOrWord)) {
        result = await Dict.update(req.params._id, entry);
    } else {
        result = await Dict.coll().updateOne({word: idOrWord}, entry);
    }
    sendMgResult(res, result);
}


async function destroyAsync(req, res, next) {
    let idOrWord = req.params._id;
    let result;
    if (isId(idOrWord)) {
        result = await Dict.remove(req.params._id);
    } else {
        result = await Dict.coll().removeOne({word: idOrWord});
    }
    sendMgResult(res, result);
}


async function loadAWord(word) {
    let entry = await loadAWordOnTheFly(word);
    console.log('fetched', word);
    let existed = await Dict.coll().findOne({word});
    if (existed) {
        await Dict.update(existed._id, entry);
        entry._id = existed._id;
    } else {
        await Dict.create(entry);
    }
    return entry;
}

async function getBasicAsync(req, res, next) {
    let fields = {_id: 0, word: 1, simple: 1, categories: 1, baseForms: 1};

    let loadId = typeof req.query._id !== 'undefined';
    let loadNextItemId = typeof req.query.nextItemId !== 'undefined';
    if (loadId) {
        fields._id = 1;
    }
    if (loadNextItemId) {
        fields.nextItemId = 1;
    }
    let word = req.params.word;
    let entry = await Dict.coll().findOne({word}, {fields});
    if (entry) {
        return res.json(entry);
    }
    let loadOnTheFly = req.query.lotf;
    if (typeof loadOnTheFly !== 'undefined') {
        entry = await loadAWord(word);
        if (entry) {
            let odi = entry;
            entry = {
                word,
                simple: odi.simple,
                categories: odi.categories,
                baseForms: odi.baseForms
            };
            if (loadId) {
                entry._id = odi._id;
            }
            if (loadNextItemId) {
                entry.nextItemId = odi.nextItemId;
            }
            return res.json(entry);
        }
    }
    res.json(entry);
}

async function getCategories(req, res, next) {
    let word = req.params.word;
    let entry = await Dict.coll().findOne({word}, {_id: 0, categories: 1});
    res.json(entry ? entry.categories : null);
}

function updateCategories(req, res, next) {
    let word = req.params.word;
    let categories = req.body;
    let updateObj = {};
    for (let name in categories) {
        updateObj[`categories.${name}`] = categories[name];
    }
    Dict.coll().updateOne({word}, {$set: updateObj}).then(r => {
        sendMgResult(res, r);
    }).catch(next);
}


router.get('/search/:key', search);
router.get('/:word/basic', wrapAsyncOne(getBasicAsync));
router.get('/:word/categories', wrapAsyncOne(getCategories));
router.patch('/:word/categories', updateCategories);

let [show, create, update, destroy] =
    wrapAsync(showAsync, createAsync, updateAsync, destroyAsync);
restful.restful(router, {index, create, show, update, destroy});

module.exports = router;
