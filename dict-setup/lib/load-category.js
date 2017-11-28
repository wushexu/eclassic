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

        let setCategory = () => {
            wordCount++;
            let patchUrl = `${dictUrl}/${word}/categories`;
            request.patch(patchUrl, {json: loadSetting.categories}, (err, res, body) => {
                if (err) {
                    console.log(':(', word);
                    console.log(err);
                    return callback(err);
                }
                // console.log('>', word);
                if (body.n === 0) {
                    console.log('?', word);
                }
                callback();
            });
        };

        if (loadSetting.skipCondition) {
            let getOpt = {url: `${dictUrl}/${word}/basic?lotf`, json: true};
            request(getOpt, (err, res, body) => {
                if (body === null) {
                    // console.log('skip 0');
                    return callback();
                }
                let {explain, categories} = body;
                if (!categories) {
                    return setCategory();
                }
                // console.log(categories);
                let skip = loadSetting.skipCondition(categories);
                if (skip) {
                    // console.log('skip 1');
                    return callback();
                }

                for (let key in loadSetting.categories) {
                    if (loadSetting.categories[key] !== categories[key]) {
                        return setCategory();
                    }
                }
                // identical, skip
                console.log('skip 2');
                callback();
            });
        } else {
            setCategory();
        }
    }, function (err) {
        let elapseMs = Date.now() - startMs;
        console.log(wordCount, 'words.', elapseMs, 'ms.');
        if (err) console.error(err.message);
    });

}


module.exports = {loadCategory};
