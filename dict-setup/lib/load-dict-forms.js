const config = require('../config');
const {wordsToProcess, loadBaseForms} = require('./load-dict');
const {setForms} = require('./set-dict-item');
let request = require('request');

request = request.defaults({
    //keepAlive
    forever: true
});

let {dictUrl} = config;


function loadForms(dataBaseDir) {

    let wordCount = 0;
    let startMs = Date.now();

    let wordObjectBaseDir = `${dataBaseDir}/word-objects`;
    let wordGenerator = wordsToProcess(wordObjectBaseDir);

    let baseFormsMap = {};

    function loadWord() {
        // for (; wordCount < 7224; wordCount++) {
        //     wordGenerator.next();
        // }
        // if (wordCount > 7226) {
        //     return;
        // }
        let {value: wordObj, done} = wordGenerator.next();
        if (!wordObj) {
            loadBaseForms(baseFormsMap);
            return;
        }
        // console.log(wordObj);

        let {word, wordForms} = wordObj;
        let dictItem = {word};

        setForms(dictItem, wordForms, baseFormsMap);

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


module.exports = {loadForms};
