const config = require('../config');
const ydParser = require('../lib/page-parser-yd');
const {parsePages} = require('../lib/parse-pages');


parsePages(config.ydDataBaseDir, ydParser);
