const config = require('../config');
const {fetchPages} = require('../lib/fetch-pages');
const {loadList} = require('../lib/word-list');

let {
    vocabularyDir,
    hcDataBaseDir, hcBaseUrl,
    ydDataBaseDir, ydBaseUrl
} = config;


// let wordFile='wl-pro.txt';
let wordFile='wl-anc30000.txt';

let wordList = loadList(`${vocabularyDir}/${wordFile}`);
// wordList = wordList.slice(0, 3);

// fetchPages(wordList, hcBaseUrl, hcDataBaseDir);

fetchPages(wordList, ydBaseUrl, ydDataBaseDir);
