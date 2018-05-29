const {connectDb} = require('../models/db');
const {errorHandler} = require('../common/helper');

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    let eh = errorHandler(req, res);
    connectDb().then(next).catch(eh);
};
