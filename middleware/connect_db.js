const {connectDb} = require('../models/db');
const {sendError} = require('../common/helper');

module.exports = (req, res, next) => {
    // console.log("------------");
    let eh = sendError(req, res);
    connectDb().then(next).catch(eh);
};
