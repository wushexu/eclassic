let debug = require('debug')('cr:params');
let {emptyObject} = require('../common/helper');


module.exports = (req, res, next) => {
    if (!emptyObject(req.query)) {
        debug("query: " + JSON.stringify(req.query, null, 2));
    }
    if (!emptyObject(req.body)) {
        debug("body: " + JSON.stringify(req.body, null, 2));
    }
    next();
};
