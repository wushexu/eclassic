const fs = require('fs-extra');
const config = require('../config');
const {wordDir} = require("../lib/fetch-pages");


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

let baseDir = config.ydDataBaseDir;
let pageBaseDir = `${baseDir}/word-pages-`;
let targetBaseDir = `${baseDir}/word-pages`;
movePages(pageBaseDir, targetBaseDir);
