const fs = require('fs-extra');
// const eachOfSeries = require('async/eachOfSeries');
const eachOfLimit = require('async/eachOfLimit');
const ensureAsync = require('async/ensureAsync');
let request = require('request');
const config = require('../config');

request = request.defaults({
    headers: config.defaultCrawlHeader
});

function wordDir(word) {
    let dir;
    if (word.length === 1 || word[1] === ' ') {
        if (word[2] && word[2] !== ' ') {
            dir = word[0] + word[2];
        } else {
            dir = word[0] + word[0];
        }
    } else {
        dir = word.substring(0, 2);
    }
    return dir.toLowerCase();
}

function fetchPages(wordList, baseUrl, pageBaseDir, doneCallback) {

    console.log(wordList.length);

    let wordCount = 0;
    let startMs = Date.now();

    eachOfLimit(wordList, 2, ensureAsync(function (word, index, callback) {
        if (!/^[a-zA-Z][a-zA-Z -]*$/.test(word)) {
            return callback();
        }

        let wd = wordDir(word);
        let pageDir = `${pageBaseDir}/word-pages/${wd}`;
        fs.ensureDirSync(pageDir);
        let pagePath = `${pageDir}/${word}.html`;
        if (fs.existsSync(pagePath) && fs.statSync(pagePath).size > 10 * 1024) {
            return callback();
        }
        let ws = fs.createWriteStream(pagePath);
        ws.on('close', callback);
        let url = `${baseUrl}/${word}`;
        request(url).pipe(ws);

        wordCount++;
        let elapseMs = Date.now() - startMs;
        console.log(`${index} ${word}, ${elapseMs} ms. ${wordCount} words.`);
    }), function (err) {
        if (err) {
            if (doneCallback) {
                doneCallback(err);
            } else {
                console.error(err);
            }
        } else {
            if (doneCallback) {
                doneCallback();
            }
        }
    });

}

function movePages(sourceDir, targetDir) {
    let dirs = fs.readdirSync(sourceDir);
// dirs = dirs.slice(3, 4);
    for (let dir of dirs) {
        if (dir.startsWith('.')) {
            continue;
        }
        let pageDir = `${sourceDir}/${dir}`;
        let wordPages = fs.readdirSync(pageDir);
        // wordPages = wordPages.slice(0, 2);
        for (let wordPage of wordPages) {
            if (!wordPage.endsWith('.html')) {
                continue;
            }
            let pagePath = `${pageDir}/${wordPage}`;
            let word = wordPage.substr(0, wordPage.length - 5);
            let wd = wordDir(word);
            let targetPath = `${targetDir}/${wd}/${wordPage}`;
            try {
                fs.moveSync(pagePath, targetPath);
            } catch (e) {
                console.error(e.code);
            }
        }
    }
}

module.exports = {fetchPages, wordDir, movePages};
