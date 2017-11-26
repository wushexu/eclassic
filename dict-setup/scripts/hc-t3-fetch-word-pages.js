const fs = require('fs-extra');
const config = require('../config');
let request = require('request');

let {defaultCrawlHeader, hcDataBaseDir, hcBaseUrl} = config;

request = request.defaults({
    headers: defaultCrawlHeader
});


function* wordsToProcess() {
    let levelFiles = fs.readdirSync(`${hcDataBaseDir}/words`);
    // levelFiles = levelFiles.slice(1, 2);

    for (let levelFile of levelFiles) {
        if (!levelFile.startsWith('level')) {
            continue;
        }
        let level = levelFile.substr(5, 1);
        let allWords = fs.readFileSync(`${hcDataBaseDir}/words/${levelFile}`, 'utf8');
        let group = 0;
        let wordLines = allWords.split('\n');
        // wordLines = wordLines.slice(1, 2);
        for (let wordLine of wordLines) {
            group++;
            let pageDir = `${hcDataBaseDir}/word-pages/level${level}/group${group}`;
            fs.ensureDirSync(pageDir);
            let words = wordLine.split(',');
            // words = words.slice(1, 2);
            // console.log('yield', words);
            for (let word of words) {
                yield {words: [word], pageDir};
            }
        }

    }
}


let wordCount = 0;
let startMs = Date.now();


let wordGenerator = wordsToProcess();

function fetchPages() {

    let {value: yieldValue, done: generatorDone} = wordGenerator.next();
    if (typeof yieldValue === 'undefined') {
        return;
    }
    let {words, pageDir} = yieldValue;

    let promises = [];
    for (let word of words) {
        let url = `${hcBaseUrl}/${word}`;
        let pagePath = pageDir + '/' + word + '.html';
        if (fs.existsSync(pagePath) && fs.statSync(pagePath).size > 5 * 1024) {
            continue;
        }
        let ws = fs.createWriteStream(pagePath);
        let p = new Promise(function (resolve, reject) {
            ws.on('close', resolve);
            ws.on('error', reject);
            request(url).pipe(ws);
        });
        promises.push(p);
    }
    Promise.all(promises).then(() => {
        wordCount += words.length;
        let elapseMs = Date.now() - startMs;
        console.log('fetch', words);
        console.log(elapseMs, 'ms.', wordCount, 'words.');
        if (!generatorDone) {
            fetchPages();
        }
    });
}

fetchPages();
