const fs = require('fs-extra');
const config = require('../config');
const {fetchPages} = require('../lib/fetch-pages');


let {
    vocabularyDir,
    ydDataBaseDir, ydBaseUrl
} = config;


let hc2w = fs.readFileSync(`${vocabularyDir}/hc2w.txt`, 'utf8');
let wordList = hc2w.split('\n');
// wordList = wordList.slice(0, 3);

fetchPages(wordList, ydBaseUrl, ydDataBaseDir);
