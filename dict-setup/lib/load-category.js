const fs = require('fs-extra');
let request = require('request');
// const eachOf = require('async/eachOf');
const eachOf = require('async/eachOfSeries');
const config = require('../config');


request = request.defaults({
    //keepAlive
    forever: true,
    pool: {maxSockets: 1}
});

let {vocabularyDir, dictUrl} = config;


function loadCategory(loadSetting) {

    let wordCount = 0;
    let startMs = Date.now();

    let file = `${vocabularyDir}/${loadSetting.file}`;

    let data = fs.readFileSync(file, 'utf-8');

    let lines = data.split(/\r?\n/);
    eachOf(lines, function (line, index, callback) {
        // if (index > 30) {
        //     return;
        // }
        let word = loadSetting.extractWord(line);
        if (word === null) {
            return callback();
        }
        if (word.split(' ').length > 3) {
            return callback();
        }
        // console.log('-', word);

        let updatedCategory = loadSetting.categories;
        if (typeof updatedCategory === 'function') {
            updatedCategory = updatedCategory(index);
        }

        let setCategory = () => {
            wordCount++;
            console.log(word, updatedCategory);
            let patchUrl = `${dictUrl}/${word}/categories`;
            request.patch(patchUrl, {json: updatedCategory}, (err, res, body) => {
                if (err) {
                    console.log(':(', word);
                    console.log(err);
                    return callback(err);
                }
                // console.log('>', word);
                // if (body.n === 0) {
                //     console.log('?', word);
                // }
                callback();
            });
        };

        if (loadSetting.skipCondition) {
            let getOpt = {url: `${dictUrl}/${word}/categories`, json: true};
            request(getOpt, (err, res, body) => {
                if (body === null) {
                    return callback();
                }
                let categories = body;
                if (!categories) {
                    return setCategory();
                }
                // console.log(categories);
                let skip = loadSetting.skipCondition(categories);
                if (skip) {
                    return callback();
                }

                for (let key in updatedCategory) {
                    if (updatedCategory[key] !== categories[key]) {
                        return setCategory();
                    }
                }
                // identical, skip
                callback();
            });
        } else {
            setCategory();
        }
    }, function (err) {
        let elapseMs = Date.now() - startMs;
        console.log(`${wordCount} words. ${elapseMs} ms.`);
        if (err) console.error(err.message);
    });

}


module.exports = {loadCategory};
