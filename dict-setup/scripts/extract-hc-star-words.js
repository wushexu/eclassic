const fs = require('fs-extra');
const config = require('../config');
const {JSDOM} = require("jsdom");
let request = require('request');


let {defaultCrawlHeader, hcDataBaseDir, hcBaseUrl} = config;

function fetchDirPages() {
    let levelPageCounts = [[5, 5], [4, 7], [3, 10], [2, 14], [1, 32]];

    request = request.defaults({
        headers: defaultCrawlHeader
    });

    let pagesDir = `${hcDataBaseDir}/dir-pages`;
    fs.ensureDirSync(pagesDir);

    for (let [level, pageCount] of levelPageCounts) {
        for (let page = 0; page < pageCount; page++) {
            let fileName = `base${level}-${page}.html`;
            let url = `${hcBaseUrl}/dir/${fileName}`;
            let saveToPath = `${pagesDir}/${fileName}`;
            request(url).pipe(fs.createWriteStream(saveToPath));
        }
    }
}

function extractWords() {

    let extractOnePage = (doc) => {
        let wordGroups = [];
        let groups = doc.querySelectorAll('div.hub-group');
        for (let group of groups) {
            let wordLinks = group.querySelectorAll('ul > li > a');
            let words = [];
            for (let wordLink of wordLinks) {
                let word = wordLink.getAttribute('href');
                words.push(word.substr(1));
            }
            wordGroups.push(words.join(','));
        }
        return wordGroups;
    };

    let streams = {};

    fs.readdir(`${hcDataBaseDir}/dir-pages`).then(files => {
        // files = files.slice(1, 2);
        for (let file of files) {
            if (!file.startsWith('base')) {
                continue;
            }
            // base5-4.html
            let level = file.substr(4, 1);
            let streamKey = 'level' + level;
            let wordsStream = streams[streamKey];
            if (!wordsStream) {
                let wordsPath = `${hcDataBaseDir}/words/level${level}.txt`;
                wordsStream = fs.createWriteStream(wordsPath);
                streams[streamKey] = wordsStream;
            }

            let dirPath = `${hcDataBaseDir}/dir-pages/${file}`;
            JSDOM.fromFile(dirPath).then(dom => {
                let doc = dom.window.document;
                let wordGroups = extractOnePage(doc);
                let wordsString = wordGroups.join('\n');

                wordsStream.write(wordsString);
            });
        }
    });
}


// fetchDirPages();

extractWords();
