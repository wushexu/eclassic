const fs = require('fs-extra');
const {JSDOM} = require("jsdom");
const {pagesToProcess} = require('./parse-pages');

function extractPhrases(dataBaseDir, pageParser, output) {

    let phrasesStream = fs.createWriteStream(output);

    let pageBaseDir = `${dataBaseDir}/word-pages`;
    let pageGenerator = pagesToProcess(pageBaseDir);

    let phraseCount = 0;
    let startMs = Date.now();
    let phrasesMap = {};

    function parsePage() {

        let {value, done} = pageGenerator.next();
        if (!value) {
            return;
        }
        let {word, pagePath} = value;

        JSDOM.fromFile(pagePath).then(dom => {
            let doc = dom.window.document;
            let phrases = pageParser.parsePhrases(doc);

            for (let ph of phrases) {
                if (phrasesMap[ph]) {
                    continue;
                }
                phrasesMap[ph] = true;
                phrasesStream.write(ph + '\n');
            }

            phraseCount += phrases.length;
            let elapseMs = Date.now() - startMs;
            console.log(word, phraseCount, 'phrases.', elapseMs, 'ms.');
            parsePage();
        }).catch(err => {
            console.error(value);
            console.error(err);
        });
    }

    parsePage();
}


module.exports = {extractPhrases};
