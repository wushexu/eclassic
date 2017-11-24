let debug = require('debug')('cr:headers');

module.exports = (req, res, next) => {
    debug(JSON.stringify(req.headers,null,2));
    next();
};
