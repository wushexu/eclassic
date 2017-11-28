const fs = require('fs-extra');
const config = require('../config');
const {fetchPages} = require('../lib/fetch-pages');

let {
    vocabularyDir,
    ydDataBaseDir, ydBaseUrl
} = config;

let phData = fs.readFileSync(`${vocabularyDir}/phrases.txt`, 'utf8');
let wordList = phData.split('\n');
// wordList = wordList.slice(9000);

fetchPages(wordList, ydBaseUrl, ydDataBaseDir);
