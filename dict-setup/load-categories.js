const fs = require('fs-extra');
const config = require('./config');
let request = require('request');
// const eachOf = require('async/eachOf');
const eachOf = require('async/eachOfSeries');


let {vocabularyFileDir, dictUrl} = config;

let wordPattern = /^[a-zA-Z][a-zA-Z -]+$/;

let loadSettings = {
    junior: {
        file: 'junior.txt',
        categories: {junior: 1},
        skipCondition: null,
        extractWord: (line) => {
            let word = line.split('\t')[0];
            word = word.trim();
            if (!/^[a-zA-Z][a-zA-Z -]*$/.test(word)) {
                return null;
            }
            return word;
        }
    },
    senior: {
        file: 'senior.txt',
        categories: {junior: 2},
        skipCondition: (categories) => categories.junior === 1,
        extractWord: (line) => {
            line = line.trimLeft();
            let word = line.split(' ')[0];
            if (!wordPattern.test(word)) {
                return null;
            }
            return word;
        }

    },
    cet4: {
        file: 'cet4.csv',
        categories: {cet4: true},
        skipCondition: (categories) => categories.junior,
        extractWord: (line) => {
            let word = line.split(',')[0];
            if (!wordPattern.test(word)) {
                return null;
            }
            return word;
        }
    },
    cet6: {
        file: 'cet6.txt',
        categories: {cet6: true},
        skipCondition: (categories) => categories.junior || categories.cet4,
        extractWord: (line) => {
            let word = line.split(' ')[0];
            if (!wordPattern.test(word)) {
                return null;
            }
            return word;
        }
    },
    gre: {
        file: 'gre.txt',
        categories: {gre: true},
        skipCondition: null,
        extractWord: (line) => {
            if (!wordPattern.test(line)) {
                return null;
            }
            return line;
        }
    },
    yasi: {
        file: 'yasi.txt',
        categories: {yasi: true},
        skipCondition: null,
        extractWord: (line) => {
            if (!/^\d+ [a-zA-Z]+$/.test(line)) {
                return null;
            }
            return line.split(' ')[1];
        }
    }
};


request = request.defaults({
    //keepAlive
    forever: true,
    pool: {maxSockets: 1}
});

let wordCount = 0;
let startMs = Date.now();


let loadSetting = loadSettings.yasi;

let file = `${vocabularyFileDir}/${loadSetting.file}`;

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
        let getOpt = {url: `${dictUrl}/${word}/basic`, json: true};
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
