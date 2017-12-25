let express = require('express');
let router = express.Router();
let reverse = require('lodash/reverse');
const {
    extractFields, getLimit, sendMgResult,
    wrapAsync, wrapAsyncOne
} = require('../common/helper');
let Dict = require('../models/dict');
let restful = require('./common/rest');
let {guestBaseForms, guestStem} = require('../dict-setup/lib/word-forms');
let {loadAWordOnTheFly} = require('../dict-setup/load-on-the-fly');


function search(req, res, next) {
    let key = req.params.key;

    let searchPrevious = key.startsWith('_');
    let searchNext = key.endsWith('_');
    let filter = {word: {}};
    if (searchPrevious) {
        key = key.substring(1, key.length);
        filter.word['$lt'] = key;
    } else if (searchNext) {
        key = key.substring(0, key.length - 1);
        filter.word['$gt'] = key;
    } else {
        filter.word['$regex'] = `^${key}.*`;
    }

    let query = req.query;

    if (typeof query.phraseOnly !== 'undefined') {
        filter.isPhrase = true;
    } else if (typeof query.phrase === 'undefined') {
        filter.isPhrase = false;
    }

    if (query.hc) {
        filter['categories.hc'] = parseInt(query.hc);
    }
    if (typeof query.junior !== 'undefined') {
        let junior = parseInt(query.junior);
        if (isNaN(junior)) {
            filter['categories.junior'] = {$exists: true};
        } else {
            filter['categories.junior'] = junior;
        }
    }
    if (typeof query.cet !== 'undefined') {
        let cet = parseInt(query.cet);
        if (isNaN(cet)) {
            filter['categories.cet'] = {$exists: true};
        } else {
            filter['categories.cet'] = cet;
        }
    }

    let fields = null;
    if (typeof query.allFields === 'undefined') {
        fields = {_id: 0, word: 1};
        if (typeof query._id !== 'undefined') {
            fields._id = 1;
        }
    }

    let limit = getLimit(req, 8);
    let cursor = Dict.coll().find(filter)
        .project(fields)
        .limit(limit);
    if (searchPrevious) {
        cursor = cursor.sort({word: -1});
    }
    cursor.toArray().then(ms => {
        if (searchPrevious) {
            ms = reverse(ms);
        }
        res.send(ms);
    }).catch(next);
}

function index(req, res, next) {

    let p = Dict.coll().find()
        .project({word: 1, categories: 1, baseForms: 1});
    let from = req.query['from'];
    if (from) {
        from = parseInt(from) || 1;
        if (from > 1) {
            p = p.skip(from - 1);
        }
    }
    let limit = getLimit(req, 10, 100);
    p.limit(limit).toArray()
        .then(ms => res.send(ms)).catch(next);
}

function isId(idOrWord) {
    return /^[0-9a-z]{24}$/.test(idOrWord);
}

async function showAsync(req, res, next) {
    let fields = {};
    if (typeof req.query.noref !== 'undefined') {
        fields = {simpleHc: 0, simpleYd: 0, completeHc: 0, completeYd: 0, phrases: 0};
    }
    let idOrWord = req.params._id;
    let entry;
    if (isId(idOrWord)) {
        entry = await Dict.getById(idOrWord, fields);
        return res.json(entry);
    }
    let word = idOrWord;
    entry = await Dict.coll().findOne({word}, fields);
    if (!entry && word.toLowerCase() !== word) {
        entry = await Dict.coll().findOne({word: word.toLowerCase()}, fields);
    }
    if (entry) {
        if (!entry.simpleHc || entry.simpleHc.length === 0) {
            let bfs = entry.baseForms;
            if (bfs && bfs.length === 1) {
                let baseForm = bfs[0];
                let bfe = await Dict.coll().findOne({word: baseForm}, fields);
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
            entry = await Dict.coll().findOne({word: base}, fields);
            if (entry) {
                return res.json(entry);
            }
        }
    }
    let getStem = req.query.stem;
    if (typeof getStem !== 'undefined') {
        let stem = guestStem(word);
        if (stem) {
            entry = await Dict.coll().findOne({word: stem}, fields);
        }
    }

    res.json(entry);
}

async function createAsync(req, res, next) {
    let entry = extractFields(req, Dict.fields.createFields);
    let word = entry.word;
    if (!word) {
        throw new Error('missing WORD');
    }
    let existed = await Dict.coll().findOne({word}, {word: 1});
    if (existed) {
        await Dict.update(existed._id, entry);
        res.send({_id: existed._id});
    } else {
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
        let updater = {
            '$set': entry,
            $currentDate: {updatedAt: true}
        };
        result = await Dict.coll().updateOne({word: idOrWord}, updater);
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
    let fields = {_id: 0, word: 1, categories: 1, baseForms: 1};

    let loadId = typeof req.query._id !== 'undefined';
    if (loadId) {
        fields._id = 1;
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
                categories: odi.categories,
                baseForms: odi.baseForms
            };
            if (loadId) {
                entry._id = odi._id;
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
