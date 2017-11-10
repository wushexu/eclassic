let express = require('express');
let router = express.Router();

const restful = require('./common/rest');
const User = require('../models/user');
const validate = require('../middleware/validate');
const {extractFields, sendError} = require('../helper/helper');

let handles = restful.simpleHandles(User);

let nameValidator = validate.lengthAbove('name', 5);
let passValidator = validate.lengthAbove('pass', 5);

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

restful.restful(router, handles);

module.exports = router;
