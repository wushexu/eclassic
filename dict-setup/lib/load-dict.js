const fs = require('fs-extra');
const config = require('../config');
const {setMeanings, setForms, setPhonetics} = require('./set-dict-item');
const eachOfSeries = require('async/eachOfSeries');
const ensureAsync = require('async/ensureAsync');
let request = require('request');
let uniq = require('lodash/uniq');

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

function loadDict(dataBaseDir, options) {

    let {
        meaningFieldPostfix, nextItemId,
        loadPhonetics, loadWordForms,
        loadPhrases, phrasesPostfix
    } = options;

    let wordCount = 0;
    let startMs = Date.now();

    let wordObjectBaseDir = `${dataBaseDir}/word-objects`;
    let wordGenerator = wordsToProcess(wordObjectBaseDir);

    let baseFormsMap = {};

    function loadWord() {
        let {value: wordObj, done} = wordGenerator.next();
        if (!wordObj) {
            loadBaseForms(baseFormsMap);
            return;
        }
        // console.log(wordObj);

        let {word, simple, complete, wordForms, phonetics, phrases} = wordObj;
        let dictItem = {word};

        setMeanings(dictItem, simple, complete, meaningFieldPostfix, nextItemId);
        if (loadWordForms !== false) {
            setForms(dictItem, wordForms, baseFormsMap);
        }
        if (loadPhonetics !== false) {
            setPhonetics(dictItem, phonetics);
        }
        if (phrases && loadPhrases !== false) {
            if (phrasesPostfix) {
                dictItem['phrases' + phrasesPostfix] = phrases;
            } else {
                dictItem.phrases = phrases;
            }
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

    loadWord();
}


function loadBaseForms(baseFormsMap) {
    let startMs = Date.now();
    eachOfSeries(baseFormsMap, ensureAsync(function (baseForms, word, callback) {
        baseForms = uniq(baseForms);
        request.post(dictUrl, {json: {word, baseForms}}, (err, res, body) => {
            if (err) {
                callback(err);
            } else {
                let elapseMs = Date.now() - startMs;
                console.log(word, baseForms, elapseMs, 'ms.');
                callback();
            }
        });
    }), function (err) {
        if (err) console.error(err.message);
    });
}

module.exports = {loadDict, wordsToProcess, loadBaseForms};
