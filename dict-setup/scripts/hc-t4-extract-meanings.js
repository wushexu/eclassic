const fs = require('fs-extra');
const config = require('../config');
const {
    parseBasic, parseDetail,
    parseWordForms, parsePhonetics
} = require('../lib/hc-parser');
const {JSDOM} = require("jsdom");


let {hcDataBaseDir} = config;


function* pagesToProcess() {
    let pageBaseDir = hcDataBaseDir + '/word-pages';
    let levelDirs = fs.readdirSync(pageBaseDir);
    // levelDirs = levelDirs.slice(1, 2);
    for (let levelDir of levelDirs) {
        if (!levelDir.startsWith('level')) {
            continue;
        }
        let level = levelDir.substr(5, 1);
        let groupDirs = fs.readdirSync(pageBaseDir + '/' + levelDir);
        // groupDirs = groupDirs.slice(1, 2);
        for (let groupDir of groupDirs) {
            if (!groupDir.startsWith('group')) {
                continue;
            }
            let group = groupDir.substr(5);
            let wordPageDir = `${pageBaseDir}/${levelDir}/${groupDir}`;
            let wordPages = fs.readdirSync(wordPageDir);
            // wordPages = wordPages.slice(0, 2);
            for (let wordPage of wordPages) {
                if (!wordPage.endsWith('.html')) {
                    continue;
                }
                let word = wordPage.substr(0, wordPage.length - 5);
                let pagePath = wordPageDir + '/' + wordPage;
                yield {level, group, word, pagePath};
            }
        }
    }
}


let wordCount = 0;
let startMs = Date.now();

let lastLevel = null, lastGroup = null;
let wordObjs = null;
let wordObjsFile = null;

let saveWordObjs = () => {
    // console.log('save', wordObjsFile);
    fs.outputJsonSync(wordObjsFile, wordObjs, {spaces: 2});
    wordObjsFile = null;
};

let pageGenerator = pagesToProcess();

function parsePage() {

    let {value, done} = pageGenerator.next();
    // console.log('---\n\n');
    // console.log(value, done);
    if (!value) {
        if (wordObjsFile) {
            saveWordObjs();
        }
        return;
    }
    let {level, group, word, pagePath} = value;
    // console.log(word);

    JSDOM.fromFile(pagePath).then(dom => {
        let doc = dom.window.document;
        let meanings = parseBasic(doc);
        let detailMeanings = parseDetail(doc);
        let wordForms = parseWordForms(doc);
        let phonetics = parsePhonetics(doc);
        // console.log(wordForms);
        // console.log(phonetics);

        let wordObj = {
            word,
            simple: meanings,
            complete: detailMeanings,
            wordForms,
            phonetics
        };
        // console.log(wordObj);
        if (level !== lastLevel || group !== lastGroup) {
            lastLevel = level;
            lastGroup = group;
            if (wordObjsFile) {
                saveWordObjs();
            }
            wordObjsFile = `${hcDataBaseDir}/word-objects/level${level}/group${group}.json`;
            wordObjs = [];
        }
        wordObjs.push(wordObj);

        wordCount++;
        let elapseMs = Date.now() - startMs;
        console.log(word, wordCount, 'words.', elapseMs, 'ms.');
        parsePage();
    }).catch(err => {
        console.error(value);
        console.error(err);
    });
}

parsePage();
