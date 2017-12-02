const config = require('../config');
const hcParser = require('../lib/page-parser-hc');
const ydParser = require('../lib/page-parser-yd');
const {extractPhrases} = require('../lib/extract-phrases');

let vocaDir=config.vocabularyDir;

// extractPhrases(config.hcDataBaseDir, hcParser, `${vocaDir}/phrasesHc.txt`);
extractPhrases(config.ydDataBaseDir, ydParser, `${vocaDir}/phrasesYd.txt`);
