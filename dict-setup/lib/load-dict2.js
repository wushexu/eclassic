const fs = require('fs-extra');
const config = require('../config');
const {setMeanings, setForms, setPhonetics, mergeDictItems} = require('./set-dict-item');
let request = require('request');
const {loadBaseForms} = require('./load-dict');

request = request.defaults({
    //keepAlive
    forever: true
});

let {dictUrl} = config;

function* wordsToProcess2(wordObjectDirHc, wordObjectDirYd) {

    let dirs = fs.readdirSync(wordObjectDirHc);
    dirs = dirs.slice(11, 14);
    for (let dir of dirs) {
        if (!/^[a-z][a-z]$/.test(dir)) {
            continue;
        }
        let objectDir = `${wordObjectDirHc}/${dir}`;
        let objectFiles = fs.readdirSync(objectDir);
        // objectFiles = objectFiles.slice(0, 2);
        for (let objectFile of objectFiles) {
            if (!objectFile.endsWith('.json')) {
                continue;
            }
            let wordObjHc = fs.readJsonSync(`${objectDir}/${objectFile}`);
            let wordObjYd = null;
            let ydPath = `${wordObjectDirYd}/${dir}/${objectFile}`;
            if (fs.pathExistsSync(ydPath)) {
                wordObjYd = fs.readJsonSync(ydPath);
            }
            yield [wordObjHc, wordObjYd];
        }
    }
}

function loadDict2(hcDataBaseDir, ydDataBaseDir) {


    let wordCount = 0;
    let startMs = Date.now();

    let wordGenerator = wordsToProcess2(`${hcDataBaseDir}/word-objects`, `${ydDataBaseDir}/word-objects`);

    let baseFormsMap = {};

    let buildDictItem = (wordObj) => {
        if (!wordObj) {
            return null;
        }
        let {word, simple, complete, wordForms, phonetics, phrases} = wordObj;
        let dictItem = {word};
        setMeanings(dictItem, simple, complete);
        setForms(dictItem, wordForms, baseFormsMap);
        setPhonetics(dictItem, phonetics);
        dictItem.phrases = phrases;
        return dictItem;
    };

    function loadWord() {
        let {value, done} = wordGenerator.next();
        if (!value) {
            loadBaseForms(baseFormsMap);
            return;
        }

        let [wordObjHc, wordObjYd] = value;

        let dictItemHc = buildDictItem(wordObjHc);
        let dictItemYd = buildDictItem(wordObjYd);

        let dictItem = mergeDictItems(dictItemHc, dictItemYd);

        // console.log(dictItem);
        wordCount++;
        let elapseMs = Date.now() - startMs;
        console.log(dictItem.word, wordCount, 'words.', elapseMs, 'ms.');

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


module.exports = {loadDict2, loadBaseForms};
