const config = require('../config');
const hcParser = require('../lib/page-parser-hc');
const {extractPhrases} = require('../lib/extract-phrases');

extractPhrases(config.hcDataBaseDir, hcParser);
