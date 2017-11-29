const fs = require('fs-extra');
const config = require('../config');
const {loadList, loadAsMap,uniqueLines} = require('../lib/word-list');

let {vocabularyDir} = config;

// let hc2wWordsMap = loadAsMap(`${vocabularyDir}/wl-hc2w.txt`);
//
// let cocaWords = loadList(`${vocabularyDir}/wl-COCA20000.txt`);
// let cocaStream = fs.createWriteStream(`${vocabularyDir}/wl-COCA2w-hc2w.txt`);
//
// for (let word of cocaWords) {
//     if (hc2wWordsMap[word]) {
//         continue;
//     }
//     if (!/^[a-zA-Z][a-zA-Z -]*$/.test(word)) {
//         continue;
//     }
//     cocaStream.write(word + '\n');
// }

uniqueLines(
    `${vocabularyDir}/wl-COCA20000.txt`,
    `${vocabularyDir}/wl-COCA20000-uniq.txt`);
