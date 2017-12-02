const config = require('../config');
const hcParser = require('../lib/page-parser-hc');
const ydParser = require('../lib/page-parser-yd');
const {parsePages} = require('../lib/parse-pages');


parsePages(config.hcDataBaseDir, hcParser);
// parsePages(config.ydDataBaseDir, ydParser);
