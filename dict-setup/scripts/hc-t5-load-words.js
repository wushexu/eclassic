const fs = require('fs-extra');
const config = require('../config');
const {setMeanings, setForms, setPhonetics} = require('../lib/set-dict-item');
const eachOfSeries = require('async/eachOfSeries');
let request = require('request');


let {hcDataBaseDir, dictUrl} = config;

function* wordsToProcess() {
    let wordObjectBaseDir = `${hcDataBaseDir}/word-objects`;
    let levelDirs = fs.readdirSync(wordObjectBaseDir);
    // levelDirs = levelDirs.slice(1, 2);
    for (let levelDir of levelDirs) {
        if (!levelDir.startsWith('level')) {
            continue;
        }
        let level = levelDir.substr(5, 1);
        let groupFiles = fs.readdirSync(`${wordObjectBaseDir}/${levelDir}`);
        // groupFiles = groupFiles.slice(1, 2);
        for (let groupFile of groupFiles) {
            if (!/group\d+\.json/.test(groupFile)) {
                continue;
            }
            let group = groupFile.substring(5, groupFile.length - 5);
            let groupFilePath = `${wordObjectBaseDir}/${levelDir}/${groupFile}`;
            let wordObjs = fs.readJsonSync(groupFilePath);
            // wordObjs = wordObjs.slice(1, 2);
            for (let wordObj of wordObjs) {
                yield {level, group, wordObj};
            }
        }
    }
}


let wordCount = 0;
let startMs = Date.now();

let wordGenerator = wordsToProcess();

request = request.defaults({
    //keepAlive
    forever: true
});


let wordsFormOf = {};


function loadWord() {
    let {value, done} = wordGenerator.next();
    if (!value) {
        afterLoadWord();
        return;
    }
    let {level, group, wordObj} = value;
    // console.log(wordObj);

    let {word, simple, complete, wordForms, phonetics} = wordObj;
    let dictItem = {word};

    let levelInt = parseInt(level);
    dictItem.categories = {haici: levelInt};

    setMeanings(dictItem, simple, complete);
    setForms(dictItem, wordForms, wordsFormOf);
    setPhonetics(dictItem, phonetics);

    // console.log(dictItem);
    wordCount++;
    let elapseMs = Date.now() - startMs;
    console.log(level, group, word, wordCount, 'words.', elapseMs, 'ms.');

    request.post(dictUrl, {json: dictItem}, (err, res, body) => {
        if (err) {
            console.log(value);
            console.log(err);
        } else {
            // console.log(body);
            loadWord();
        }
    });
}

function afterLoadWord() {
    eachOfSeries(wordsFormOf, function (formOf, word, callback) {
        request.post(dictUrl, {json: {word, formOf}}, (err, res, body) => {
            if (err) {
                callback(err);
            } else {
                let elapseMs = Date.now() - startMs;
                console.log(word, formOf, elapseMs, 'ms.');
                callback();
            }
        });
    }, function (err) {
        if (err) console.error(err.message);
    });
}

loadWord();
