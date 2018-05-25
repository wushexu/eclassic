const {JSDOM} = require("jsdom");
const config = require('../config');
const hcParser = require('./page-parser-hc');
const ydParser = require('./page-parser-yd');
const {setMeanings, setForms, setPhonetics, mergeDictItems} = require('./set-dict-item');

let {hcBaseUrl, ydBaseUrl} = config;

function loadAWord(word, baseUrl, parser) {
    return new Promise(function (resolve, reject) {
        let url = `${baseUrl}/${word}`;
        JSDOM.fromURL(url).then(dom => {
            let doc = dom.window.document;
            let meanings = parser.parseBasic(doc);
            let detailMeanings = parser.parseDetail(doc, word);
            let wordForms = parser.parseWordForms(doc);
            let phonetics = parser.parsePhonetics(doc);
            let phrases = parser.parsePhrases(doc, word);

            let dictItem = {word};

            setMeanings(dictItem, meanings, detailMeanings, null);

            setForms(dictItem, wordForms);
            setPhonetics(dictItem, phonetics);
            dictItem.phrases = phrases;

            resolve(dictItem);
        }).catch(err => {
            reject(err);
        });
    });
}


function loadAWordOnTheFly(word) {

    let hcPromise = loadAWord(word, hcBaseUrl, hcParser);
    let ydPromise = loadAWord(word, ydBaseUrl, ydParser);

    return Promise.all([hcPromise, ydPromise])
        .then(([dictItemHc, dictItemYd]) => {
            return mergeDictItems(dictItemHc, dictItemYd);
        });
}

// loadAWordOnTheFly('Carleton').then(dictItem => {
//     console.log(dictItem);
// }).catch(err => {
//     console.error(err);
// });

module.exports = {loadAWordOnTheFly};
