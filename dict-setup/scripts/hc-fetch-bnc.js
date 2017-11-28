const fs = require('fs-extra');
const config = require('../config');
const {fetchPages} = require('../lib/fetch-pages');


let {
    vocabularyDir,
    hcDataBaseDir, hcBaseUrl
} = config;


let bnc = fs.readFileSync(`${vocabularyDir}/bnc15000.txt`, 'utf8');
let wordList = bnc.split(/\r?\n/);

fetchPages(wordList, hcBaseUrl, hcDataBaseDir);
