let express = require('express');
let router = express.Router();

let {wrapAsyncOne, getLimit} = require('../../common/helper');
let restful = require('./common/rest');
let sorter = require('./common/sorter');
let Dict = require('../../models/dict');
let WordCategory = require('../../models/word_category');


let handles = restful.simpleHandles(WordCategory);
restful.restful(router, handles);

let actions = sorter.sortable(WordCategory);
sorter.sort(router, actions);


async function sampleWords(req, res, next) {
    let code = req.params.code;
    let wc = await WordCategory.coll().findOne({code});
    if (!wc) {
        res.json([]);
    }

    let filter = WordCategory.buildFilter(wc);
    let limit = getLimit(req, 20, 100);

    let skip;
    if (req.query.offset && !isNaN(req.query.offset)) {
        skip = parseInt(req.query.offset);
    } else {
        let wordCount = wc.wordCount || 800;
        skip = Math.floor((wordCount - limit) * Math.random());
    }

    let entries = await Dict.coll().find(filter,
        {_id: 0, word: 1})
        .skip(skip)
        .limit(limit)
        .toArray();
    let words = entries.map(e => e.word);
    res.json(words);
}

router.post('/:code/sample', wrapAsyncOne(sampleWords));

module.exports = router;
