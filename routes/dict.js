let express = require('express');
let router = express.Router();

let Dict = require('../models/dict');
let {wrapAsync, isId, getLimit} = require('../common/helper');
let {guestBaseForms, guestStem} = require('../dict-setup/lib/word-forms');


async function getEntry(req, res, next) {

    let fields = {word: 1, categories: 1, phonetics: 1, baseForm: 1, forms: 1, simple: 1, version: 1};
    if (typeof req.query.complete !== 'undefined') {
        fields.complete = 1;
    }

    let entry;

    let idOrWord = req.params.idOrWord;
    if (isId(idOrWord)) {
        entry = await Dict.getById(idOrWord, fields);
        return res.json(entry);
    }

    let word = idOrWord;
    entry = await Dict.coll().findOne({word}, fields);
    if (!entry && /[A-Z]/.test(word)) {
        word = word.toLowerCase();
        entry = await Dict.coll().findOne({word}, fields);
    }
    if (entry) {
        if (!entry.simple || entry.simple.length === 0) {
            if (entry.baseForm) {
                let bfe = await Dict.coll().findOne({word: entry.baseForm}, fields);
                if (bfe) {
                    entry = bfe;
                }
            }
        }
        return res.json(entry);
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

async function getComplete(req, res, next) {
    let fields = {_id: 0, complete: 1};

    let entry;

    let idOrWord = req.params.idOrWord;
    if (isId(idOrWord)) {
        entry = await Dict.getById(idOrWord, fields);
    } else {
        entry = await Dict.coll().findOne({word: idOrWord}, fields);
    }

    let complete;
    if (entry) {
        complete = entry.complete;
    }
    if (!complete) {
        complete = [];
    }
    res.json(complete);
}


function search(req, res, next) {
    let key = req.params.key;

    let filter = {word: {$regex: `^${key}.*`}};

    let query = req.query;
    if (typeof query.phraseOnly !== 'undefined') {
        filter.isPhrase = true;
    } else if (typeof query.phrase === 'undefined') {
        filter.isPhrase = false;
    }
    if (filter.isPhrase !== true) {
        if (typeof query.basic !== 'undefined') {
            filter['categories.junior'] = {$gt: 0};
        }
        if (typeof query.cet !== 'undefined') {
            filter['categories.cet'] = {$gt: 0};
        }
        if (typeof query.gre !== 'undefined') {
            filter['categories.gre'] = 1;
        }
    }

    let fields = {_id: 0, word: 1};

    let limit = getLimit(req, 8);
    Dict.coll().find(filter)
        .project(fields)
        .limit(limit)
        .toArray()
        .then(ms => {
            res.json(ms);
        }).catch(next);
}

// irregular base form
async function loadBaseForms(req, res, next) {

    console.log('loadBaseForms ....');
    let entries = [];
    let total = 0;

    let cetAndBelow = new Set();

    let ws = await Dict.coll().find(
        {
            $or: [{'categories.junior': {$gt: 0}},
                {'categories.cet': {$gt: 0}}]
        },
        {_id: 0, word: 1}
    ).toArray();

    for (let w of ws) {
        cetAndBelow.add(w.word);
    }

    console.log('cetAndBelow size: ' + cetAndBelow.size);

    Dict.coll().find(
        {baseForm: {$exists: true}},
        {_id: 0, word: 1, baseForm: 1}
    ).forEach(function (entry) {
        total++;
        let {word, baseForm} = entry;

        if (!baseForm) {
            return;
        }

        if (!cetAndBelow.has(baseForm)) {
            console.log('> ' + baseForm);
            return;
        }

        let bases = guestBaseForms(word);
        if (bases.indexOf(baseForm) >= 0) {
            return;
        }
        let stem = guestStem(word);
        if (baseForm === stem) {
            return;
        }

        entries.push([word, baseForm]);
    }, function (err) {
        console.log('done. total: ' + total + ', forms: ' + entries.length);
        res.json(entries);
    });
}

router.get('/:idOrWord', wrapAsync(getEntry));
router.get('/:idOrWord/complete', wrapAsync(getComplete));
router.get('/search/:key', search);
router.post('/loadBaseForms', wrapAsync(loadBaseForms));

module.exports = router;
