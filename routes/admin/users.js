let express = require('express');
let router = express.Router();

const restful = require('./common/rest');
const User = require('../../models/user');
const UserBook = require('../../models/user_book');
const validate = require('../../middleware/validate');
const {
    reqParam, extractFields, getLimit,
    sendError, wrapAsyncOne
} = require('../../common/helper');

let handles = restful.simpleHandles(User, {
    ChildModel: UserBook,
    parentFieldInChild: 'userId',
    childExistsMsg: 'This User Has Books'
});


async function index(req, res, next) {
    let filter = {};
    let fields = {pass: 0, salt: 0};
    let name = req.query.name;
    if (name) {
        filter.name = {$regex: `.*${name}.*`};
    }
    if (typeof req.query.manager !== 'undefined') {
        filter.role = {$in: ['Admin', 'Editor']};
    }

    let cursor = User.coll().find(filter, fields);
    let from = req.query.from;
    if (from) {
        from = parseInt(from) || 1;
        if (from > 1) {
            cursor = cursor.skip(from - 1);
        }
    }
    let limit = getLimit(req, 20);
    cursor = cursor.limit(limit);
    let users = await cursor.toArray();

    res.send(users);
}

async function show(req, res, next) {
    let _id = req.params._id;
    let m = await User.getById(_id, {pass: 0, salt: 0});
    res.json(m);
}

let nameValidator = validate.lengthAbove('name', 4);
let passValidator = validate.lengthAbove('pass', 4);

function checkExists(req, res, next) {
    let name = req.body.name;
    let hd = function (exists) {
        if (exists) {
            let err = new Error(`User ${name} was existed`);
            err.status = 400;
            sendError(req, res)(err);
        } else {
            next();
        }
    };
    User.exists({name})
        .then(hd)
        .catch(sendError(req, res));
}

handles.index = wrapAsyncOne(index);
handles.show = wrapAsyncOne(show);

handles.create = validate.appendValidator(
    [nameValidator, passValidator, checkExists],
    handles.create);

router.all('/find', (req, res, next) => {
    let pairs = extractFields(req, ['name', 'role', 'gender']);
    User.find(pairs)
        .then((users) => {
            res.send(users);
        })
        .catch(next);
});

async function resetPass(req, res, next) {
    let userId = req.params._id;
    let newPass = reqParam(req, 'newPass');
    if (!newPass) {
        res.json({ok: 0, message: 'Missing New Pass'});
    }
    let user = User.getById(userId);
    if (!user) {
        res.json({ok: 0, message: 'User Not Found'});
    }
    user.salt = null;
    user.pass = newPass;
    User.hashPassword(user);
    await User.coll()
        .updateOne({_id: userId},
            {$set: {pass: newPass, salt: user.salt}});

    res.json({ok: 1});
}

function userBooks(req, res, next) {
    let userId = req.params._id;
    UserBook.find({userId}, {userId: 0, chaps: 0})
        .then(userBooks => {
            res.send(userBooks);
        }).catch(next);
}

router.get('/:_id/books', userBooks);

restful.restful(router, handles);
router.post('/:_id/reset_pass', wrapAsyncOne(resetPass));

module.exports = router;
