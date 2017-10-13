let debug = require('debug')('cr:p');
let stringify = require('stringify-object');
let {emptyObject} = require('../helper/helper');


module.exports = (req, res, next) => {
    if (!emptyObject(req.query)) {
        debug("query: " + stringify(req.query));
    }
    if (!emptyObject(req.body)) {
        debug("body: " + stringify(req.body));
    }
    next();
};
