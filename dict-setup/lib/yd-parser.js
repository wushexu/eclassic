// const {JSDOM} = require("jsdom");

function parseBasic(doc) {
    let meanings = [];
    let lis = doc.querySelectorAll('#phrsListTab .trans-container li');
    for (let li of lis) {
        let explain = li.textContent.trim();
        let pos = '';
        if (/^[a-z]{1,5}\./.test(explain)) {
            let di = explain.indexOf('.');
            pos = explain.substring(0, di + 1);
            explain = explain.substr(di + 1);
        }
        meanings.push({pos, explain});
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
        let phName = span.childNodes[0].textContent.trim();
        let phSpan = span.querySelector('span.phonetic');
        let ph = phSpan.textContent.trim();
        if (ph[0] !== '[' || ph[ph.length - 1] !== ']') {
            continue;
        }
        phonetics.push([phName, ph]);
    }
    return phonetics;
}

module.exports = {parseBasic, parseDetail, parseWordForms, parsePhonetics};