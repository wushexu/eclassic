const fs = require('fs-extra');
const {JSDOM} = require("jsdom");
const {wordDir} = require("./fetch-pages");

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

function parsePages(dataBaseDir, pageParser) {

    let pageBaseDir = `${dataBaseDir}/word-pages`;
    let pageGenerator = pagesToProcess(pageBaseDir);

    let wordCount = 0;
    let startMs = Date.now();

    function parsePage() {

        let {value, done} = pageGenerator.next();
        // console.log('---\n\n');
        // console.log(value, done);
        if (!value) {
            return;
        }
        let {word, pagePath} = value;
        // console.log(word);

        JSDOM.fromFile(pagePath).then(dom => {
            let doc = dom.window.document;
            let meanings = pageParser.parseBasic(doc);
            let detailMeanings = pageParser.parseDetail(doc);
            let wordForms = pageParser.parseWordForms(doc);
            let phonetics = pageParser.parsePhonetics(doc);

            let wordObj = {
                word,
                simple: meanings,
                complete: detailMeanings,
                wordForms,
                phonetics
            };
            let wd = wordDir(word);
            let wordObjFile = `${dataBaseDir}/word-objects/${wd}/${word}.json`;
            fs.outputJsonSync(wordObjFile, wordObj, {spaces: 2});

            wordCount++;
            let elapseMs = Date.now() - startMs;
            console.log(word, wordCount, 'words.', elapseMs, 'ms.');
            parsePage();
        }).catch(err => {
            console.error(value);
            console.error(err);
        });
    }

    parsePage();
}


module.exports = {parsePages};
