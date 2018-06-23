let express = require('express');
let router = express.Router();

let Dict = require('../models/dict');
let WordCategory = require('../models/word_category');
let {wrapAsync, getLimit} = require('../common/helper');


function allCategories(req, res, next) {
    WordCategory.coll()
        .find({})
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
    let wc = await WordCategory.coll().findOne({code});
    if (!wc) {
        res.json([]);
    }

    let filter = WordCategory.buildFilter(wc);
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

async function allWords(req, res, next) {
    let code = req.params.code;

    let categories = ['junior1', 'junior2', 'basic', 'cet4', 'cet6', 'cet', 'gre', 'yasi'];
    if (categories.indexOf(code) === -1) {
        return res.json([]);
    }

    let wc = await WordCategory.coll().findOne({code});
    if (!wc) {
        return res.json([]);
    }

    let filter = WordCategory.buildFilter(wc);
    let entries = await Dict.coll().find(filter,
        {_id: 0, word: 1})
        .toArray();
    let words = entries.map(e => e.word);
    res.json(words);
}

router.get('/', allCategories);
router.get('/:code', getOne);
router.post('/:code/sample', wrapAsync(sampleWords));
router.post('/:code/loadAll', wrapAsync(allWords));

module.exports = router;
