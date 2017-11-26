const fs = require('fs-extra');
const config = require('../config');
let request = require('request');

let {defaultCrawlHeader, hcDataBaseDir, hcBaseUrl} = config;

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
