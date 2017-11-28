const config = require('../config');
const hcParser = require('../lib/page-parser-hc');
const {parsePages} = require('../lib/parse-pages');


parsePages(config.hcDataBaseDir, hcParser);
