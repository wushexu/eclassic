const fs = require('fs-extra');
const config = require('../config');
const {fetchPages} = require('../lib/fetch-pages');

let {
    vocabularyDir,
    hcDataBaseDir, hcBaseUrl
} = config;

let coca = fs.readFileSync(`${vocabularyDir}/COCA2w-hc2w.txt`, 'utf8');
let wordList = coca.split('\n');
// wordList = wordList.slice(7100);

fetchPages(wordList, hcBaseUrl, hcDataBaseDir);
