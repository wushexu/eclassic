const {JSDOM} = require("jsdom");
const EventEmitter = require('events');
const config = require('../config');
const {pagesToProcess} = require('./parse-pages');
let request = require('request');

request = request.defaults({
    //keepAlive
    forever: true
});

let {dictUrl} = config;


function parsePhrases(dataBaseDir, pageParser, eventEmitter) {

    let pageBaseDir = `${dataBaseDir}/word-pages`;
    let pageGenerator = pagesToProcess(pageBaseDir);

    let wordCount = 0;
    let startMs = Date.now();

    function parsePage() {

        let {value, done} = pageGenerator.next();
        if (!value) {
            return;
        }
        let {word, pagePath} = value;

        JSDOM.fromFile(pagePath).then(dom => {
            wordCount++;
            let doc = dom.window.document;
            // let basicEl = doc.querySelector('ul.dict-basic-ul');
            // if (basicEl) {
            //     return parsePage();
            // }
            let meanings = pageParser.parseBasic(doc);
            if (meanings && meanings.length > 0) {
                eventEmitter.emit('simple', word, meanings);
                let elapseMs = Date.now() - startMs;
                console.log(`${word}, ${wordCount} words, ${elapseMs} ms.`);
            }
            parsePage();
        }).catch(err => {
            console.error(value);
            console.error(err);
        });
    }

    parsePage();
}

function parseLoadSimple(dataBaseDir, pageParser, simplePostfix) {

    let eventEmitter = new EventEmitter();

    parsePhrases(dataBaseDir, pageParser, eventEmitter);

    eventEmitter.on('simple', (word, meanings) => {

        let dictItem = {word};

        // dictItem.explain = meanings.map(mi => `${mi.pos}${mi.exp}`).join('\n');
        if (simplePostfix) {
            dictItem['simple' + simplePostfix] = meanings;
        } else {
            dictItem.simple = meanings;
        }

        // console.log(dictItem);

        request.post(dictUrl, {json: dictItem}, (err, res, body) => {
            if (err) {
                console.log(err);
            } else {
                // console.log(body);
            }
        });
    });
}


module.exports = {parseLoadSimple};
