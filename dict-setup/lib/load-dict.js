const fs = require('fs-extra');
const config = require('../config');
const {setMeanings, setForms, setPhonetics} = require('./set-dict-item');
const eachOfSeries = require('async/eachOfSeries');
const ensureAsync = require('async/ensureAsync');
let request = require('request');

request = request.defaults({
    //keepAlive
    forever: true
});

let {dictUrl} = config;

function* wordsToProcess(wordObjectBaseDir) {

    let dirs = fs.readdirSync(wordObjectBaseDir);
    // dirs = dirs.slice(1, 4);
    for (let dir of dirs) {
        if (!/^[a-z][a-z]$/.test(dir)) {
            continue;
        }
        let objectDir = `${wordObjectBaseDir}/${dir}`;
        let objectFiles = fs.readdirSync(objectDir);
        // objectFiles = objectFiles.slice(0, 2);
        for (let objectFile of objectFiles) {
            if (!objectFile.endsWith('.json')) {
                continue;
            }
            let wordObj = fs.readJsonSync(`${objectDir}/${objectFile}`);
            yield wordObj;
        }
    }
}

function loadDict(dataBaseDir) {

    let wordCount = 0;
    let startMs = Date.now();

    let wordObjectBaseDir = `${dataBaseDir}/word-objects`;
    let wordGenerator = wordsToProcess(wordObjectBaseDir);

    let wordsFormOf = {};

    function loadWord() {
        let {value: wordObj, done} = wordGenerator.next();
        if (!wordObj) {
            afterLoadWord();
            return;
        }
        // console.log(wordObj);

        let {word, simple, complete, wordForms, phonetics, phrases} = wordObj;
        let dictItem = {word};

        setMeanings(dictItem, simple, complete);
        setForms(dictItem, wordForms, wordsFormOf);
        setPhonetics(dictItem, phonetics);
        if (phrases) {
            dictItem.phrases = phrases;
        }

        // console.log(dictItem);
        wordCount++;
        let elapseMs = Date.now() - startMs;
        console.log(word, wordCount, 'words.', elapseMs, 'ms.');

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
        eachOfSeries(wordsFormOf, ensureAsync(function (formOf, word, callback) {
            request.post(dictUrl, {json: {word, formOf}}, (err, res, body) => {
                if (err) {
                    callback(err);
                } else {
                    let elapseMs = Date.now() - startMs;
                    console.log(word, formOf, elapseMs, 'ms.');
                    callback();
                }
            });
        }), function (err) {
            if (err) console.error(err.message);
        });
    }

    loadWord();
}


module.exports = {loadDict};
