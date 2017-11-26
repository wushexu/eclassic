const fs = require('fs-extra');
const config = require('../config');
let request = require('request');

let {defaultCrawlHeader, ydDataBaseDir, ydBaseUrl} = config;

let pagesDir = `${ydDataBaseDir}`;
fs.ensureDirSync(pagesDir);

request = request.defaults({
    headers: defaultCrawlHeader
});

function fetchWordPage(word) {
    let url=`${ydBaseUrl}/${word}`;
    let pagePath = `${pagesDir}/${word}.html`;
    let ws = fs.createWriteStream(pagePath);
    request(url).pipe(ws);
}

fetchWordPage('lath');
