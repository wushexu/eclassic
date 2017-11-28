const config = require('../config');
const hcParser = require('../lib/page-parser-yd');
const {parsePages} = require('../lib/parse-pages');


parsePages(config.hcDataBaseDir, hcParser);
