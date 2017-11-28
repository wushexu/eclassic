const fs = require('fs-extra');
const {JSDOM} = require("jsdom");
const config = require('../config');

function* pagesToProcess(pageBaseDir) {
    let dirs = fs.readdirSync(pageBaseDir);
    // dirs = dirs.slice(3, 4);
    for (let dir of dirs) {
        if (!/^[a-z][a-z]$/.test(dir)) {
            continue;
        }
        let pageDir = `${pageBaseDir}/${dir}`;
        let wordPages = fs.readdirSync(pageDir);
        // wordPages = wordPages.slice(0, 2);
        for (let wordPage of wordPages) {
            if (!wordPage.endsWith('.html')) {
                continue;
            }
            let word = wordPage.substr(0, wordPage.length - 5);
            let pagePath = `${pageDir}/${wordPage}`;
            yield {word, pagePath};
        }
    }
}

function extractPhrases(dataBaseDir, pageParser) {

    let phrasesStream = fs.createWriteStream(`${config.vocabularyDir}/phrases.txt`);

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
        // console.log(word);

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
