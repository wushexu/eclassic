let express = require('express');
let router = express.Router();

let Dict = require('../models/dict');
let {wrapAsync, isId, getLimit} = require('../common/helper');
let {guestBaseForms, guestStem} = require('../dict-setup/lib/word-forms');


async function getEntry(req, res, next) {

    let fields = {word: 1, categories: 1, phonetics: 1, baseForms: 1, forms: 1, simple: 1};
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
            let bfs = entry.baseForms;
            if (bfs && bfs.length === 1 && bfs[0].length <= word.length) {
                let baseForm = bfs[0];
                let bfe = await Dict.coll().findOne({word: baseForm}, fields);
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

async function loadBaseForms(req, res, next) {
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

    // console.log('cetAndBelow size: ' + cetAndBelow.size);

    Dict.coll().find(
        {baseForms: {$exists: true}},
        {_id: 0, word: 1, baseForms: 1}
    ).forEach(function (entry) {
        total++;
        let {word, baseForms} = entry;

        if (!baseForms) {
            return;
        }

        let wordLen = word.length;
        baseForms = baseForms.filter(form => {
            if (form.length > wordLen + 2) {
                return false;
            }
            return cetAndBelow.has(form);
        });

        if (baseForms.length === 0) {
            return;
        }

        let bases = guestBaseForms(word);
        for (let base of bases) {
            if (baseForms.indexOf(base) >= 0) {
                return;
            }
        }
        let stem = guestStem(word);
        if (baseForms.indexOf(stem) >= 0) {
            return;
        }
        let base = baseForms[0];
        entries.push([word, base]);
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
