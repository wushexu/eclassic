const {JSDOM} = require("jsdom");
const config = require('./config');
const hcParser = require('./lib/page-parser-hc');
const ydParser = require('./lib/page-parser-yd');
const {setMeanings, setForms, setPhonetics} = require('./lib/set-dict-item');

let {hcBaseUrl, ydBaseUrl} = config;

function loadAWord(word, baseUrl, parser, nextItemId) {
    return new Promise(function (resolve, reject) {
        let url = `${baseUrl}/${word}`;
        JSDOM.fromURL(url).then(dom => {
            let doc = dom.window.document;
            let meanings = parser.parseBasic(doc);
            let detailMeanings = parser.parseDetail(doc);
            let wordForms = parser.parseWordForms(doc);
            let phonetics = parser.parsePhonetics(doc);
            let phrases = parser.parsePhrases(doc);

            let dictItem = {word};

            setMeanings(dictItem, meanings, detailMeanings, null, nextItemId);

            let wordsFormOf = {};
            setForms(dictItem, wordForms, wordsFormOf);
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
    let ydPromise = loadAWord(word, ydBaseUrl, ydParser, 101);

    return Promise.all([hcPromise, ydPromise])
        .then(([dictItemHc, dictItemYd]) => {
            if (!dictItemHc.explain) {
                return dictItemYd;
            }
            if (!dictItemYd.explain) {
                return dictItemHc;
            }
            let dictItem = dictItemHc;
            dictItem.simpleHc = dictItem.simple;
            dictItem.completeHc = dictItem.complete;
            delete dictItem.simple;
            delete dictItem.complete;
            dictItem.simpleYd = dictItemYd.simple;
            dictItem.completeYd = dictItemYd.complete;
            return dictItem;
        });

}

// loadAWordOnTheFly('Carleton').then(dictItem => {
//     console.log(dictItem);
// }).catch(err => {
//     console.error(err);
// });

module.exports = {loadAWordOnTheFly};
