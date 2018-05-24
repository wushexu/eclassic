let express = require('express');
let router = express.Router();

let Dict = require('../models/dict');
let WordCategory = require('../models/word_categories');
let {wrapAsyncOne} = require('../common/helper');


function allCategories(req, res, next) {
    WordCategory.find({}, {_id: 0}).then(wcs => res.json(wcs)).catch(next);
}

function getOne(req, res, next) {
    let code = req.params.code;
    WordCategory.coll().findOne({code}).then(w => res.json(w)).catch(next);
}

async function sampleWords(req, res, next) {
    //TODO:
}

async function wordList(req, res, next) {
    let code = req.params.code;
    let wc = await WordCategory.coll().findOne({code},
        {_id: 0, dictCategoryKey: 1, dictCategoryValue: 1});
    if (!wc) {
        return res.json([]);
    }

    let entries = await Dict.find({['categories.' + wc.dictCategoryKey]: wc.dictCategoryValue},
        {_id: 0, word: 1});
    let words = entries.map(e => e.word);
    res.json(words);
}


router.get('/', allCategories);
router.get('/:code', getOne);
router.get('/:code/sampleWords', wrapAsyncOne(sampleWords));
router.post('/:code/allWords', wrapAsyncOne(wordList));

module.exports = router;
