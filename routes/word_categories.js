let express = require('express');
let router = express.Router();

let Dict = require('../models/dict');
let WordCategory = require('../models/word_category');
let {wrapAsyncOne, getLimit} = require('../common/helper');


function allCategories(req, res, next) {
    let filter = {};
    let ub = req.query.userBase;
    if (typeof ub !== 'undefined') {
        filter.useAsUserBase = true;
    }
    WordCategory.coll()
        .find(filter, {_id: 0})
        .sort({no: 1})
        .toArray()
        .then(wcs => res.json(wcs)).catch(next);
}

function getOne(req, res, next) {
    let code = req.params.code;
    WordCategory.coll().findOne({code}).then(w => res.json(w)).catch(next);
}


async function sampleWords(req, res, next) {
    let code = req.params.code;
    let wc = await WordCategory.coll().findOne({code},
        {_id: 0, dictCategoryKey: 1, dictCategoryValue: 1});
    if (!wc) {
        res.json([]);
    }

    let filter = {['categories.' + wc.dictCategoryKey]: wc.dictCategoryValue};
    let limit = getLimit(req, 20, 100);

    let wordCount = wc.wordCount || 800;
    let skip = Math.floor((wordCount - limit) * Math.random());

    let entries = await Dict.coll().find(filter,
        {_id: 0, word: 1})
        .skip(skip)
        .limit(limit)
        .toArray();
    let words = entries.map(e => e.word);
    res.json(words);
}

async function wordList(req, res, next) {
    let code = req.params.code;
    let wc = await WordCategory.coll().findOne({code},
        {_id: 0, dictCategoryKey: 1, dictCategoryValue: 1});
    if (!wc) {
        res.json([]);
    }

    let entries = await Dict.find({['categories.' + wc.dictCategoryKey]: wc.dictCategoryValue},
        {_id: 0, word: 1});
    let words = entries.map(e => e.word);
    res.json(words);
}


router.get('/', allCategories);
router.get('/:code', getOne);
router.post('/:code/sample', wrapAsyncOne(sampleWords));
router.post('/:code/all', wrapAsyncOne(wordList));

module.exports = router;
