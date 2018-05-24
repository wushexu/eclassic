let express = require('express');
let router = express.Router();

let Dict = require('../models/dict');
let {wrapAsyncOne} = require('../common/helper');
let {guestBaseForms, guestStem} = require('../dict-setup/lib/word-forms');

async function getEntry(req, res, next) {
    let fields = {_id: 0, word: 1, categories: 1, phonetics: 1, baseForms: 1, forms: 1, complete: 1};
    let word = req.params.word;
    let entry = await Dict.coll().findOne({word}, fields);
    if (!entry && word.toLowerCase() !== word) {
        entry = await Dict.coll().findOne({word: word.toLowerCase()}, fields);
    }
    if (entry) {
        let {complete, simpleHc} = entry;
        if ((!complete || complete.length === 0) && (!simpleHc || simpleHc.length === 0)) {
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


router.get('/:word', wrapAsyncOne(getEntry));

module.exports = router;
