let debug = require('debug')('cr:headers');
let stringify = require('stringify-object');

module.exports = (req, res, next) => {
    debug(stringify(req.headers));
    // req.headers.forEach((h)=>{
    //     debug(stringify(h));
    // });
    next();
};
