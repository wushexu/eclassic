const config = require('../config');
const ydParser = require('../lib/page-parser-yd');
const {parseLoadPhrases} = require('../lib/parse-load-phrases');

parseLoadPhrases(config.ydDataBaseDir, ydParser, '2');
