const config = require('../config');
const hcParser = require('../lib/page-parser-hc');
const {parseLoadSimple} = require('../lib/parse-load-simple');

parseLoadSimple(config.hcDataBaseDir, hcParser, 'Hc');
