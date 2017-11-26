const fs = require('fs-extra');
const config = require('../config');
const {JSDOM} = require("jsdom");
const {
    parseBasic, parseDetail,
    parseWordForms, parsePhonetics
} = require('../lib/yd-parser');

let {ydDataBaseDir} = config;

let pagesDir = `${ydDataBaseDir}`;


function processWord(word) {
    let pagePath = `${pagesDir}/${word}.html`;
    JSDOM.fromFile(pagePath).then(dom => {
        let doc = dom.window.document;
        let meanings = parseBasic(doc);
        let detailMeanings = parseDetail(doc);
        let wordForms = parseWordForms(doc);
        let phonetics = parsePhonetics(doc);
        // console.log(wordForms);
        // console.log(phonetics);

        let wordObj = {
            word,
            simple: meanings,
            complete: detailMeanings,
            wordForms,
            phonetics
        };
        console.log(wordObj);
    }).catch(err => {
        console.error(err);
    });
}

processWord('lath');
