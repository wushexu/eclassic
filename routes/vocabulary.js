let express = require('express');
let router = express.Router();

let UserVocabulary = require('../models/user_vocabulary');
let {wrapAsyncOne, currentUserId, sendMgResult} = require('../common/helper');

function getOne(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.json(null);
    }
    let word = req.params.word;
    UserVocabulary.coll()
        .findOne({userId, word})
        .then(userWord => res.json(userWord))
        .catch(next);
}

function getAll(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.json([]);
    }
    UserVocabulary.find({userId}, {userId: 0})
        .then(voca => res.json(voca))
        .catch(next);
}

function addWord(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.json({ok: 0});
    }
    let {word, bookId, chapId, paraId, familiarity} = req.body;
    if (!word) {
        return res.json({ok: 0});
    }
    if (!familiarity) {
        familiarity = 1;
    }
    let newWord = {bookId, chapId, paraId, familiarity};

    let updater = {
        '$set': newWord,
        $currentDate: {updatedAt: true}
    };
    UserVocabulary.coll()
        .updateOne({userId, word}, updater, {upsert: true})
        .then(r => {
            let result = {ok: 0};
            if (r.upsertedId) {
                result._id = r.upsertedId._id;
            }
            res.json(result);
        })
        .catch(next);
}

function syncVocubulary(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.json({ok: 0});
    }
    let voca = req.body;
    if (typeof voca.length === 'undefined'
        || voca.length === 0
        || voca.length > 10000) {
        return res.json({ok: 0});
    }

    let bulk = [];
    for (let userWord of voca) {
        let {word, familiarity} = userWord;
        if (!word) {
            continue;
        }
        if (!familiarity) {
            familiarity = 1;
        }
        let newWord = {familiarity};
        for (let attr of ['bookId', 'chapId', 'paraId']) {
            if (userWord[attr]) {
                newWord[attr] = userWord[attr];
            }
        }
        let filter = {userId, word};
        let updater = {
            '$set': newWord,
            $currentDate: {updatedAt: true}
        };
        let op = {
            updateOne:
                {filter: filter, update: updater, upsert: true}
        };
        bulk.push(op);
    }
    if (bulk.length === 0) {
        return res.json({ok: 0});
    }
    UserVocabulary.coll()
        .bulkWrite(bulk)
        .then(r => sendMgResult(res, r))
        .catch(next);
}

function updateWord(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.json({ok: 0});
    }
    let word = req.params.word;
    let {familiarity} = req.body;
    if (!familiarity) {
        return res.json({ok: 0});
    }
    let updater = {
        '$set': {familiarity},
        $currentDate: {updatedAt: true}
    };
    UserVocabulary.coll()
        .updateOne({userId, word}, updater)
        .then(r => sendMgResult(res, r))
        .catch(next);
}

function removeWord(req, res, next) {
    let userId = currentUserId(req);
    if (!userId) {
        return res.json({ok: 0});
    }
    let word = req.params.word;
    UserVocabulary.coll().deleteOne({userId, word})
        .then(r => sendMgResult(res, r))
        .catch(next);
}

router.get('/', getAll);
router.post('/', addWord);
router.get('/:word', getOne);
router.put('/:word', updateWord);
router.delete('/:word', removeWord);
router.post('/sync', syncVocubulary);

module.exports = router;
