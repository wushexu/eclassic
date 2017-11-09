let express = require('express');
let router = express.Router();

let Dict = require('../models/dict');
let restful = require('./common/rest');

let handles = restful.simpleHandles(Dict);

restful.restful(router, handles);


module.exports = router;
