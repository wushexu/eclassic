const config = require('../config');
const {transformLines, uniqueLines, loadAsMap} = require('../lib/word-list');


let {vocabularyDir} = config;
let wordPattern = /^[a-zA-Z][a-zA-Z -]+$/;

// transformLines(
//     `${vocabularyDir}/junior.txt`,
//     `${vocabularyDir}/wl-junior-1.txt`, {
//         splitter: '\t',
//         wordIndex: 0,
//         wordPattern: /^[a-zA-Z][a-zA-Z -]*$/
//     });

// transformLines(
//     `${vocabularyDir}/senior.txt`,
//     `${vocabularyDir}/wl-junior-2.txt`, {
//         splitter: ' ',
//         wordIndex: 0,
//         wordPattern: wordPattern
//     });


// transformLines(
//     `${vocabularyDir}/cet4.csv`,
//     `${vocabularyDir}/wl-cet4.txt`, {
//         splitter: ',',
//         wordIndex: 0,
//         wordPattern: wordPattern
//     });

// transformLines(
//     `${vocabularyDir}/cet6.txt`,
//     `${vocabularyDir}/wl-cet6.txt`, {
//         splitter: ' ',
//         wordIndex: 0,
//         wordPattern: wordPattern
//     });

// transformLines(
//     `${vocabularyDir}/gre.txt`,
//     `${vocabularyDir}/wl-gre.txt`, {
//         wordPattern: wordPattern
//     });

// transformLines(
//     `${vocabularyDir}/yasi.txt`,
//     `${vocabularyDir}/wl-yasi.txt`, {
//         linePattern: /^\d+ [a-zA-Z]+$/,
//         splitter: ' ',
//         wordIndex: 1,
//         wordPattern: wordPattern
//     });

// transformLines(
//     `${vocabularyDir}/z4z8.txt`,
//     `${vocabularyDir}/z4z8-.txt`, {
//         wordGroupPattern: /^([a-z]+)'? ?\//
//     });

// transformLines(
//     `${vocabularyDir}/z8.txt`,
//     `${vocabularyDir}/z4z8-.txt`, {
//         append: true,
//         splitter: ' ',
//         wordIndex: 0,
//         wordPattern: /^[a-z]+$/
//     });


// uniqueLines(
//     `${vocabularyDir}/z4z8-.txt`,
//     `${vocabularyDir}/wl-pro.txt`);

