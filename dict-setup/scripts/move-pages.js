const config = require('../config');
const {movePages} = require("../lib/fetch-pages");


let baseDir = config.hcDataBaseDir;
let pageBaseDir = `${baseDir}/word-pages-`;
let targetBaseDir = `${baseDir}/word-pages`;
movePages(pageBaseDir, targetBaseDir);
