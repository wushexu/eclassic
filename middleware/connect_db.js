const {connectDb} = require('../models/db');
const {sendError} = require('../helper/helper');

module.exports = (req, res, next) => {
    console.log("------------");
    let eh = sendError(req, res);
    connectDb().then(next,eh).catch(eh);
};
