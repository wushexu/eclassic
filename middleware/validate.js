const {reqParam} = require('../common/helper');

function parseField(field) {
    return field.split(/\[|]/).filter(s => s);
}

function getField(req, field) {
    if (field.length === 1) {
        return reqParam(req, field[0]);
    }
    let val = req.body;
    field.forEach((prop) => {
        val = val[prop];
    });
    return val;
}

function required(field) {
    if (field instanceof Array) {
        return field.map(required);
    }
    field = parseField(field);
    return (req, res, next) => {
        if (getField(req, field)) {
            next();
        } else {
            throw new Error(`${field.join(' ')} is required`);
            //res.redirect('back');
        }
    }
}

function lengthAbove(field, len) {
    field = parseField(field);
    return (req, res, next) => {
        let val = getField(req, field);
        if (val && val.length > len) {
            next();
        } else {
            throw new Error(`${field.join(' ')} must have more than ${len} characters`);
            //res.redirect('back');
        }
    }
}

function appendValidator(validator, handle) {
    if (handle instanceof Array) {
        let service = handle.pop();
        if (validator instanceof Array) {
            handle = handle.concat(validator);
        } else {
            handle.push(validator);
        }
        handle.push(service);
    } else {
        if (validator instanceof Array) {
            handle = validator.concat(handle);
        } else {
            handle = [validator, handle];
        }
    }
    return handle;
}

module.exports = {required, lengthAbove, appendValidator};
