const fs = require('fs-extra');
const readline = require('readline');
const config = require('../config');

let {vocabularyDir} = config;


let ancInput = fs.createReadStream(`${vocabularyDir}/ANC-all-count.txt`);
let rl = readline.createInterface(ancInput);

let ancWordsMap = {};
let lineCount = 0;

rl.on('line', line => {

    lineCount++;
    // if (lineCount > 10) {
    //     return;
    // }

    let [_a, word, _p, count] = line.split('\t');

    if (!word || word.length > 15) {
        return;
    }
    if (!/^[a-z]+$/.test(word)) {
        return;
    }
    if (/([a-z])\1\1/.test(word)) {
        return;
    }

    // console.log(word, count);
    let sum = ancWordsMap[word];
    if (!sum) {
        sum = 0;
    }
    sum += parseInt(count);
    ancWordsMap[word] = sum;

    // if (lineCount === 10) {
    //     rl.close();
    // }
});


let ancOutput = fs.createWriteStream(`${vocabularyDir}/ANC-gt1.txt`);

rl.on('close', () => {
    let finalCount = 0;
    let wordList = [];
    for (let word in ancWordsMap) {
        let count = ancWordsMap[word];
        if (count === 1) {
            continue;
        }
        wordList.push([word, count]);
        finalCount++;
    }
    wordList = wordList.sort(([w1, c1], [w2, c2]) => c2 - c1);
    for (let [word, count] of wordList) {
        ancOutput.write(`${word}\t${count}\n`);
    }
    console.log(lineCount, finalCount);
});
