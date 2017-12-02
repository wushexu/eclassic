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
    let phraseCount = 0;
    let startMs = Date.now();

    function parsePage() {

        let {value, done} = pageGenerator.next();
        if (!value) {
            return;
        }
        let {word, pagePath} = value;

        JSDOM.fromFile(pagePath).then(dom => {
            let doc = dom.window.document;
            let phrases = pageParser.parsePhrases(doc);

            wordCount++;
            if (phrases && phrases.length > 0) {
                eventEmitter.emit('phrases', word, phrases);
                phraseCount += phrases.length;
                let elapseMs = Date.now() - startMs;
                console.log(`${word}, ${wordCount} words, ${phraseCount} phrases, ${elapseMs} ms.`);
            }

            parsePage();
        }).catch(err => {
            console.error(value);
            console.error(err);
        });
    }

    parsePage();
}


function parseLoadPhrases(dataBaseDir, pageParser, phrasesPostfix) {

    let eventEmitter = new EventEmitter();

    parsePhrases(dataBaseDir, pageParser, eventEmitter);

    eventEmitter.on('phrases', (word, phrases) => {

        let dictItem = {word};

        if (phrasesPostfix) {
            dictItem['phrases' + phrasesPostfix] = phrases;
        } else {
            dictItem.phrases = phrases;
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


module.exports = {parseLoadPhrases};
