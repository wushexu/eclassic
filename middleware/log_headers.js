let debug = require('debug')('cr:headers');

module.exports = (req, res, next) => {
    console.log(typeof req.headers);
    debug(JSON.stringify(req.headers, null, 2));
    next();
};
