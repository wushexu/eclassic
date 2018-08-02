let express = require('express');
let router = express.Router();

let UserWord = require('../models/user_word');
let {sendMgResult, modelIdString, wrapAsync} = require('../common/helper');

function getOne(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json(null);
    }
    let word = req.params.word;
    UserWord.coll()
        .findOne({userId, word})
        .then(userWord => res.json(userWord))
        .catch(next);
}

function getAll(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json([]);
    }
    UserWord.find({userId}, {userId: 0})
        .then(voca => res.json(voca))
        .catch(next);
}

async function addWord(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let {word, bookId, chapId, paraId, familiarity} = req.body;
    if (!word) {
        return res.json({ok: 0});
    }

    if (typeof familiarity !== "number") {
        familiarity = parseInt(familiarity);
    }

    let newWord = {bookId, chapId, paraId, familiarity};

    let existed = await UserWord.coll().findOne({userId, word}, {_id: 1});
    let result = {ok: 1};
    if (existed) {
        await UserWord.update(existed._id, newWord);
    } else {
        newWord.userId = userId;
        newWord.word = word;
        await UserWord.create(newWord);
        result._id = newWord._id;
    }
    res.json(result);
}

function updateWord(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let word = req.params.word;
    let {familiarity} = req.body;
    if (!familiarity) {
        return res.json({ok: 0});
    }

    if (typeof familiarity !== "number") {
        familiarity = parseInt(familiarity);
    }
    let updater = {
        '$set': {familiarity},
        $currentDate: {updatedAt: true}
    };
    UserWord.coll()
        .updateOne({userId, word}, updater)
        .then(r => sendMgResult(res, r))
        .catch(next);
}

function removeWord(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let word = req.params.word;
    UserWord.coll().deleteOne({userId, word})
        .then(r => sendMgResult(res, r))
        .catch(next);
}

async function syncWords(req, res, next) {
    let userId = modelIdString(req.user);
    if (!userId) {
        return res.json({ok: 0});
    }
    let userWords = req.body;
    if (typeof voca.length === 'undefined'
        || voca.length === 0
        || voca.length > 5000) {
        return res.json({ok: 0});
    }

    for (let userWord of userWords) {
        let {word, familiarity, removeFlag} = userWord;
        if (!word) {
            continue;
        }

        if (removeFlag === true) {
            await UserWord.coll().deleteOne({userId, word});
            continue;
        }

        let model = {familiarity};
        for (let attr of ['bookId', 'chapId', 'paraId']) {
            if (userWord[attr]) {
                model[attr] = userWord[attr];
            }
        }

        let existed = await UserWord.coll().findOne({userId, word}, {_id: 1});

        if (existed) {
            if (userWord.updatedAt) {
                model.updatedAt = new Date(userWord.updatedAt);
            }
            await UserWord.update(existed._id, model);
            continue;
        }

        model.userId = userId;
        if (userWord.createdAt) {
            model.createdAt = new Date(userWord.createdAt);
        }
        await UserWord.create(model);
    }

    return res.json({ok: 1});
}

router.get('/', getAll);
router.post('/', wrapAsync(addWord));
router.get('/:word', getOne);
router.put('/:word', updateWord);
router.delete('/:word', removeWord);
router.post('/sync', wrapAsync(syncWords));

module.exports = router;
