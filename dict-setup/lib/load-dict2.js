const fs = require('fs-extra');
const {setMeanings, setForms, setPhonetics, mergeDictItems} = require('./set-dict-item');
const {connectDb, getDb} = require('../../models/db');
const eachOfSeries = require('async/eachOfSeries');
const ensureAsync = require('async/ensureAsync');
let uniq = require('lodash/uniq');


function* wordsToProcess2(wordObjectDirHc, wordObjectDirYd) {

    let dirs = fs.readdirSync(wordObjectDirHc);
    // dirs = dirs.slice(22, 24);
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


function loadBaseForms2(baseFormsMap, onDone) {
    let startMs = Date.now();
    eachOfSeries(baseFormsMap, async function (baseForms, word) {
        baseForms = uniq(baseForms);
        await createAsync({word, baseForms});
        let elapseMs = Date.now() - startMs;
        console.log(word, baseForms, elapseMs, 'ms.');
    }, function (err) {
        if (err) console.error(err.message);
        if (onDone) onDone();
    });
}

function loadDict1(hcDataBaseDir, ydDataBaseDir, onDone) {

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

    async function loadWord() {
        let {value, done} = wordGenerator.next();
        if (!value) {
            loadBaseForms2(baseFormsMap, onDone);
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

        await createAsync(dictItem);
        loadWord();
    }

    loadWord();
}


let dictColl = null;

async function createAsync(entry) {
    let word = entry.word;
    if (!word) {
        throw new Error('missing WORD');
    }
    let existed = await dictColl.findOne({word}, {word: 1});
    if (existed) {
        await dictColl.updateOne({'_id': existed._id}, {'$set': entry});
    } else {
        await dictColl.insertOne(entry);
    }
}

function loadDict2(hcDataBaseDir, ydDataBaseDir) {

    connectDb().then(() => {
        let db = getDb();
        dictColl = db.collection('dict');
        loadDict1(hcDataBaseDir, ydDataBaseDir, db.close.bind(db));
    });
}

module.exports = {loadDict2};
