const fs = require('fs-extra');
// const eachOf = require('async/eachOf');
const eachOfSeries = require('async/eachOfSeries');
const ensureAsync = require('async/ensureAsync');
const config = require('../config');
const {connectDb, getDb} = require('../../models/db');
const {loadList} = require('./word-list');


let {vocabularyDir} = config;


function loadCategory1(loadSetting, dictColl, onDone) {

    let wordCount = 0;
    let startMs = Date.now();

    let file = `${vocabularyDir}/${loadSetting.file}`;
    let lines = loadList(file);

    // lines = lines.slice(0, 10);

    eachOfSeries(lines, async function (line, index) {
        // if (index > 30) {
        //     return;
        // }
        let word = loadSetting.extractWord(line);
        if (word === null) {
            return;
        }
        if (word.split(' ').length > 3) {
            return;
        }
        // console.log('-', word);

        let updatedCategory = loadSetting.categories;
        if (typeof updatedCategory === 'function') {
            updatedCategory = updatedCategory(index);
        }
        wordCount++;

        if (!loadSetting.skipCondition) {
            await updateCategories(dictColl, word, updatedCategory);
            return;
        }
        let entry = await dictColl.findOne({word}, {_id: 0, categories: 1});
        if (entry === null) {
            await updateCategories(dictColl, word, updatedCategory);
            return;
        }
        let categories = entry.categories;
        if (!categories) {
            await updateCategories(dictColl, word, updatedCategory);
            return;
        }
        // console.log(categories);
        let skip = loadSetting.skipCondition(categories);
        if (skip) {
            wordCount--;
            return;
        }

        for (let key in updatedCategory) {
            if (updatedCategory[key] !== categories[key]) {
                await updateCategories(dictColl, word, updatedCategory);
                return;
            }
        }
    }, function (err) {
        let elapseMs = Date.now() - startMs;
        console.log(`${wordCount} words. ${elapseMs} ms.`);
        if (err) console.error(err.message);
        if (onDone) {
            onDone();
        }
    });

}

async function updateCategories(dictColl, word, categories) {
    let updateObj = {};
    for (let name in categories) {
        updateObj[`categories.${name}`] = categories[name];
    }
    console.log(word, categories);
    await dictColl.updateOne({word}, {$set: updateObj});
}

function loadCategory2(loadSetting) {

    connectDb().then(() => {
        let db = getDb();
        let dictColl = db.collection('dict');
        loadCategory1(loadSetting, dictColl, db.close.bind(db));
    });
}

function loadAllCategories2(loadSettings) {

    connectDb().then(() => {
        let db = getDb();
        let dictColl = db.collection('dict');
        eachOfSeries(loadSettings, ensureAsync(function (loadSetting, name, callback) {
            loadCategory1(loadSetting, dictColl, callback);
        }), function (err) {
            if (err) console.error(err.message);
            db.close();
        });
    });
}


module.exports = {loadCategory2, loadAllCategories2};
