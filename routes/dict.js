let express = require('express');
let router = express.Router();
const {extractFields, sendMgResult, wrapAsync, wrapAsyncOne} = require('../helper/helper');

let Dict = require('../models/dict');
let restful = require('./common/rest');
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

function guestStems(word) {
    let stems = [];
    let len = word.length;
    if (word.endsWith('s')) {
        if (word.endsWith('es')) {
            if (word.endsWith('ies')) {
                stems.push(word.substring(0, len - 3) + 'y');
            } else {
                stems.push(word.substring(0, len - 2));
            }
        }
        stems.push(word.substring(0, len - 1));
        return stems;
    }

    if (word.endsWith('ed')) {
        if (word[len - 3] === word[len - 4]) {
            stems.push(word.substring(0, len - 3));
        } else {
            stems.push(word.substring(0, len - 2));
        }
        if (word.endsWith('ied')) {
            stems.push(word.substring(0, len - 3) + 'y');
        } else {
            stems.push(word.substring(0, len - 1));
        }
        return stems;
    }

    if (word.endsWith('ing')) {
        if (word[len - 4] === word[len - 5]) {
            stems.push(word.substring(0, len - 4));
        } else {
            let st = word.substring(0, len - 3);
            stems.push(st);
            stems.push(st + 'e');
        }
    }
    return stems;
}

async function showAsync(req, res, next) {
    let idOrWord = req.params._id;
    let dictItem;
    if (isId(idOrWord)) {
        dictItem = await Dict.getById(idOrWord);
        res.json(dictItem);
        return;
    }
    let word = idOrWord;
    dictItem = await Dict.coll().findOne({word});
    if (dictItem) {
        if (!dictItem.explain && dictItem.formOf) {
            for (let stemWord in dictItem.formOf) {
                dictItem = await Dict.coll().findOne({word: stemWord});
                if (dictItem) {
                    break;
                }
            }
        }
        return res.json(dictItem);
    }
    let loadOnTheFly = req.query.lotf;
    if (typeof loadOnTheFly !== 'undefined') {
        dictItem = await loadAWord(word);
        if (dictItem) {
            res.json(dictItem);
            return;
        }
    }
    let stem = req.query.stem;
    if (typeof stem !== 'undefined') {
        let stems = guestStems(word);
        // console.log(stems);
        for (let stem of stems) {
            dictItem = await Dict.coll().findOne({word: stem});
            if (dictItem) {
                res.json(dictItem);
                return;
            }
        }
    }
    res.json(dictItem);
}

async function createAsync(req, res, next) {
    let dictItem = extractFields(req, Dict.fields.createFields);
    let word = dictItem.word;
    if (!word) {
        // sendError(req, res)('missing WORD');
        // return;
        throw new Error('missing WORD');
    }
    let existed = await Dict.coll().findOne({word}, {word: 1});
    if (existed) {
        await Dict.update(existed._id, dictItem);
        res.send({_id: existed._id});
    } else {
        if (typeof dictItem.explain === 'undefined') {
            dictItem.explain = '';
        }
        await Dict.create(dictItem);
        res.send(dictItem);
    }
}

async function updateAsync(req, res, next) {
    let dictItem = extractFields(req, Dict.fields.updateFields);
    let idOrWord = req.params._id;
    let result;
    if (isId(idOrWord)) {
        result = await Dict.update(req.params._id, dictItem);
    } else {
        result = await Dict.coll().updateOne({word: idOrWord}, dictItem);
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
    let dictItem = await loadAWordOnTheFly(word);
    console.log('fetched', word);
    let existed = await Dict.coll().findOne({word}, {word: 1, categories: 1});
    if (existed) {
        await Dict.update(existed._id, dictItem);
        dictItem._id = existed._id;
    } else {
        await Dict.create(dictItem);
    }
    return dictItem;
}

async function getBasicAsync(req, res, next) {
    let fields = {_id: 0, word: 1, categories: 1};

    if (typeof req.query._id !== 'undefined') {
        fields._id = 1;
    }
    if (typeof req.query.explain !== 'undefined') {
        fields.explain = 1;
    }
    if (typeof req.query.nextItemId !== 'undefined') {
        fields.nextItemId = 1;
    }
    let word = req.params.word;
    let dictItem = await Dict.coll().findOne({word},
        {fields: fields});
    if (!dictItem) {
        let loadOnTheFly = req.query.lotf;
        if (typeof loadOnTheFly !== 'undefined') {
            dictItem = await loadAWord(word);
            if (dictItem) {
                dictItem = {
                    word,
                    _id: dictItem._id,
                    explain: dictItem.explain,
                    categories: dictItem.categories
                };
            }
        }
    }
    res.json(dictItem);
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
router.patch('/:word/categories', updateCategories);

let [show, create, update, destroy] =
    wrapAsync(showAsync, createAsync, updateAsync, destroyAsync);
restful.restful(router, {index, create, show, update, destroy});

module.exports = router;
