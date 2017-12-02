// const {JSDOM} = require("jsdom");

function parseBasic(doc) {
    let meanings = [];
    let lis = doc.querySelectorAll('#phrsListTab .trans-container li');
    for (let li of lis) {
        let exp = li.textContent.trim();
        let pos = '';
        if (/^[a-z]{1,5}\./.test(exp)) {
            let di = exp.indexOf('.');
            pos = exp.substring(0, di + 1);
            exp = exp.substr(di + 1);
        }
        meanings.push({pos, exp});
    }
    return meanings;
}

function parseDetail(doc) {
    let detailMeanings = [];
    let posLis = doc.querySelectorAll('#authDictTrans > ul > li');
    for (let posLi of posLis) {
        let posSpan = posLi.children[0];
        if (!posSpan || posSpan.tagName !== 'SPAN') {
            continue;
        }
        let pos = posSpan.textContent.trim();
        if (!pos.endsWith('.')) {
            continue;
        }
        let meaningsUl = posLi.children[1];
        if (!meaningsUl || meaningsUl.tagName !== 'UL') {
            continue;
        }
        let meaningSpans = meaningsUl.querySelectorAll('li span');
        let items = [];
        for (let ms of meaningSpans) {
            let item = ms.textContent.trim();
            items.push(item);
        }
        detailMeanings.push({pos, items});
    }
    return detailMeanings;
}


function parseWordForms(doc) {
    return null;
}

function parsePhonetics(doc) {
    let spans = doc.querySelectorAll('#phrsListTab span.pronounce');
    let phonetics = [];
    for (let span of spans) {
        let spTextNode = span.childNodes[0];
        if (!spTextNode) {
            continue;
        }
        let phName = spTextNode.textContent.trim();
        let phSpan = span.querySelector('span.phonetic');
        if (!phSpan) {
            continue;
        }
        let ph = phSpan.textContent.trim();
        if (ph[0] !== '[' || ph[ph.length - 1] !== ']') {
            continue;
        }
        phonetics.push([phName, ph]);
    }
    return phonetics;
}

function parsePhrases(doc) {
    let phrases = [];
    let posLis = doc.querySelectorAll('#authDictTrans > ul > li');
    for (let posLi of posLis) {
        let posSpan = posLi.children[0];
        if (!posSpan || posSpan.tagName !== 'SPAN') {
            continue;
        }
        let pos = posSpan.textContent.trim();
        if (pos !== '短语:') {
            continue;
        }
        let phrasesUl = posLi.children[1];
        if (!phrasesUl || phrasesUl.tagName !== 'UL') {
            continue;
        }
        let phraseLis = phrasesUl.children;
        for (let li of phraseLis) {
            let phraseExp = li.textContent.trim();
            if (phraseExp.indexOf('\n') >= 0) {
                phraseExp = phraseExp.substring(0, phraseExp.indexOf('\n'));
            }
            if (phraseExp.indexOf('(') >= 0) {
                phraseExp = phraseExp.replace(/\([^)]+\)/g, ' ');
                phraseExp = phraseExp.replace(/  +/g, ' ');
            }
            let matcher = phraseExp.match(/^([a-zA-Z ]+)/);
            if (matcher) {
                let phrase = matcher[1];
                if (phrase) {
                    phrase = phrase.trim();
                    let words = phrase.split(' ');
                    if (words.length >= 2) {
                        phrases.push(phrase);
                    }
                }
            }
        }
    }
    return phrases;
}

module.exports = {parseBasic, parseDetail, parseWordForms, parsePhonetics, parsePhrases};
