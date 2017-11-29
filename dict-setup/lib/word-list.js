const fs = require('fs-extra');
const readline = require('readline');

function loadList(input) {
    let data = fs.readFileSync(input, 'utf8');
    return data.split(/\r?\n/);
}

function loadAsMap(input) {
    let list = loadList(input);
    let wordMap = {};
    for (let word of list) {
        if (word === '') {
            continue;
        }
        wordMap[word] = true;
    }
    return wordMap;
}

function uniqueLines(input, output) {
    let wordMap = loadAsMap(input);
    let os = fs.createWriteStream(output);
    for (let word in wordMap) {
        os.write(word + '\n');
    }
}

function transformLines(input, output, options) {
    let {
        append,
        lineSkipPattern,
        linePattern,
        splitter,
        wordIndex,
        wordSkipPattern,
        wordPattern,
        wordGroupPattern,
        callback
    } = options;

    let lp = lineSkipPattern || linePattern;
    let wp = wordSkipPattern || wordPattern || wordGroupPattern;

    let is = fs.createReadStream(input);
    let rl = readline.createInterface(is);

    let os;
    if (append) {
        os = fs.createWriteStream(output, {flags: 'a+'});
    } else {
        os = fs.createWriteStream(output);
    }


    rl.on('line', line => {

        if (lp) {
            if (lineSkipPattern && lineSkipPattern.test(line)) {
                return;
            }
            if (linePattern && !linePattern.test(line)) {
                return;
            }
        }
        let word = line.trim();
        if (splitter) {
            let fields = line.split(splitter);
            word = fields[wordIndex];
            if (!word) {
                return;
            }
            word = word.trim();
        }
        if (wp) {
            if (wordSkipPattern && wordSkipPattern.test(word)) {
                return;
            }
            if (wordPattern && !wordPattern.test(word)) {
                return;
            }
            if (wordGroupPattern) {
                let match = line.match(wordGroupPattern);
                if (!match) {
                    return;
                }
                word = match[1];
            }
        }
        os.write(word + '\n');
    });

    if (callback) {
        rl.on('close', callback);
    }
}

module.exports = {transformLines, loadList, loadAsMap, uniqueLines};
