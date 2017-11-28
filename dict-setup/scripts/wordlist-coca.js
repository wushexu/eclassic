const fs = require('fs-extra');
const config = require('../config');

let {vocabularyDir} = config;


let hc2wData = fs.readFileSync(`${vocabularyDir}/hc2w.txt`, 'utf8');
let hc2wWords = hc2wData.split(/\r?\n/);
let hc2wWordsMap = {};

for (let word of hc2wWords) {
    hc2wWordsMap[word] = true;
}

let cocaData = fs.readFileSync(`${vocabularyDir}/COCA20000.txt`, 'utf8');
let cocaWords = cocaData.split(/\r?\n/);
let cocaStream = fs.createWriteStream(`${vocabularyDir}/COCA2w-hc2w.txt`);

for (let word of cocaWords) {
    if (hc2wWordsMap[word]) {
        continue;
    }
    if (!/^[a-zA-Z][a-zA-Z -]*$/.test(word)) {
        continue;
    }
    cocaStream.write(word + '\n');
}
