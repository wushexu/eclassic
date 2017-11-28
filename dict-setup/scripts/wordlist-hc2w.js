const fs = require('fs-extra');
const config = require('../config');

let {vocabularyDir, hcDataBaseDir} = config;

let allWordsStream = fs.createWriteStream(`${vocabularyDir}/hc2w.txt`);
let levelFiles = fs.readdirSync(`${hcDataBaseDir}/words`);
for (let levelFile of levelFiles) {
    if (!levelFile.startsWith('level')) {
        continue;
    }
    let level = levelFile[5];
    let levelWordsStream = fs.createWriteStream(`${vocabularyDir}/hc2w-${level}.txt`);
    let levelWords = fs.readFileSync(`${hcDataBaseDir}/words/${levelFile}`, 'utf8');
    let wordLines = levelWords.split('\n');
    for (let wordLine of wordLines) {
        let words = wordLine.split(',');
        for (let word of words) {
            let wl = word + '\n';
            levelWordsStream.write(wl);
            allWordsStream.write(wl);
        }
    }
}
