const fs = require('fs-extra');
const config = require('../config');
const {fetchPages} = require('../lib/fetch-pages');


let {
    vocabularyDir,
    ydDataBaseDir, ydBaseUrl
} = config;


let bnc = fs.readFileSync(`${vocabularyDir}/bnc15000.txt`, 'utf8');
let wordList = bnc.split(/\r?\n/);
wordList = wordList.slice(3000);

fetchPages(wordList, ydBaseUrl, ydDataBaseDir);
