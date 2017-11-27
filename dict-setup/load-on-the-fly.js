const config = require('./config');
const {JSDOM} = require("jsdom");
const hcParser = require('./lib/hc-parser');
const ydParser = require('./lib/yd-parser');
const {setMeanings, setForms, setPhonetics} = require('./lib/set-dict-item');

let {hcBaseUrl, ydBaseUrl} = config;

function loadAWord(word, baseUrl, parser) {
    return new Promise(function (resolve, reject) {

        let url = `${baseUrl}/${word}`;
        JSDOM.fromURL(url).then(dom => {
            let doc = dom.window.document;
            let meanings = parser.parseBasic(doc);
            let detailMeanings = parser.parseDetail(doc);
            let wordForms = parser.parseWordForms(doc);
            let phonetics = parser.parsePhonetics(doc);

            let dictItem = {word};

            setMeanings(dictItem, meanings, detailMeanings);

            let wordsFormOf = {};
            setForms(dictItem, wordForms, wordsFormOf);
            setPhonetics(dictItem, phonetics);

            resolve(dictItem);
        }).catch(err => {
            reject(err);
        });
    });
}

function loadAWordHc(word) {
    return loadAWord(word, hcBaseUrl, hcParser);
}

function loadAWordYd(word) {
    return loadAWord(word, ydBaseUrl, ydParser);
}

// ventilation
// versed
// whiting
// wording

// loadAWordYd('yacht').then(dictItem => {
//     console.log(dictItem);
// }).catch(err => {
//     console.error(err);
// });

module.exports = {loadAWordHc, loadAWordYd};
