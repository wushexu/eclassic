const fs = require('fs-extra');
const config = require('../config');
const {fetchPages} = require('../lib/fetch-pages');

let {
    vocabularyDir,
    hcDataBaseDir, hcBaseUrl
} = config;

let phData = fs.readFileSync(`${vocabularyDir}/phrases.txt`, 'utf8');
let wordList = phData.split('\n');
// wordList = wordList.slice(6000);

fetchPages(wordList, hcBaseUrl, hcDataBaseDir);
