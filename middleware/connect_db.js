const {connectDb} = require('../models/db');

module.exports = (req, res, next) => {
    connectDb().then(next);
};
