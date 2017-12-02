const config = require('../config');
const {wordsToProcess} = require('./load-dict');
const {setForms} = require('./set-dict-item');
let request = require('request');

request = request.defaults({
    //keepAlive
    forever: true
});

let {dictUrl} = config;


function loadPhrases(dataBaseDir, phrasesPostfix) {

    let wordCount = 0;
    let startMs = Date.now();

    let wordObjectBaseDir = `${dataBaseDir}/word-objects`;
    let wordGenerator = wordsToProcess(wordObjectBaseDir);

    function loadWord() {
        let {value: wordObj, done} = wordGenerator.next();
        if (!wordObj) {
            return;
        }
        // console.log(wordObj);

        let {word, phrases} = wordObj;
        let dictItem = {word};

        if (phrasesPostfix) {
            dictItem['phrases' + phrasesPostfix] = phrases;
        } else {
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

    loadWord();
}


module.exports = {loadPhrases};
