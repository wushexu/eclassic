let express = require('express');
let router = express.Router();

let restful = require('./common/rest');
let WordCategory = require('../../models/word_category');


let handles = restful.simpleHandles(WordCategory);
restful.restful(router, handles);


module.exports = router;
