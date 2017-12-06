// const {JSDOM} = require("jsdom");

function parseBasic(doc) {
    let meanings = [];
    let basicEl = doc.querySelector('div.word > div.basic > ul');
    if (!basicEl) {
        // console.log('no Basic');
        return meanings;
    }
    for (let li of basicEl.children) {
        if (!li) {
            // console.log('no LI');
            continue;
        }
        let vs = li.children;
        if (vs.length === 0 || vs.length > 2) {
            continue;
        }
        let pos = '';
        if (vs.length === 2) {
            let span = vs[0];
            if (span.tagName !== 'SPAN') {
                break;
            }
            pos = span.textContent.trim();
        }
        let strong = vs[vs.length - 1];
        if (strong.tagName !== 'STRONG') {
            break;
        }
        let exp = strong.textContent.trim();
        meanings.push({pos, exp});
    }
    return meanings;
}


function parseDetail(doc) {
    let detailMeanings = [];
    let detailEl = doc.querySelector('div.layout.detail');
    if (!detailEl) {
        // console.log('no Detail');
        return detailMeanings;
    }
    let cs = detailEl.children;
    for (let i = 0; i < cs.length; i += 2) {
        let span = cs[i], ol = cs[i + 1];
        if (!ol) {
            // console.log('no OL');
            continue;
        }
        if (span.tagName !== 'SPAN' || ol.tagName !== 'OL') {
            break;
        }
        let pos = span.childNodes[0].textContent.trim();
        let items = [];
        for (let li of ol.children) {
            let item = li.textContent.trim();
            items.push(item);
        }
        // console.log(items);
        detailMeanings.push({pos, items});
    }
    return detailMeanings;
}


function parseWordForms(doc) {
    let formsEl = doc.querySelector('div.word > div.shape');
    if (!formsEl) {
        return null;
    }
    let forms = [];
    let cs = formsEl.children;
    for (let i = 0; i < cs.length; i += 2) {
        let label = cs[i], link = cs[i + 1];
        if (label.tagName !== 'LABEL' || link.tagName !== 'A') {
            break;
        }
        let name = label.textContent.trim();
        let form = link.textContent.trim();
        forms.push([name, form]);
    }
    return forms;
}

function parsePhonetics(doc) {
    let spans = doc.querySelectorAll('div.word > div.phonetic > span');
    let phonetics = [];
    for (let span of spans) {
        let phName = span.childNodes[0].textContent.trim();
        let bdo = span.children[0];
        if (!bdo || bdo.tagName !== 'BDO') {
            continue;
        }
        let ph = bdo.textContent.trim();
        if (ph[0] !== '[' || ph[ph.length - 1] !== ']') {
            continue;
        }
        phonetics.push([phName, ph]);
    }
    return phonetics;
}

// const phrasePattern = /^[a-zA-Z][a-zA-Z '.-]+$/;
const phrasePattern = /^[a-z][a-z ]+$/;

function parsePhrases(doc) {
    let phrases = [];
    let phbs = doc.querySelectorAll('div.phrase > dl > dt > b');
    for (let phb of phbs) {
        // word<sup>1</sup>
        let pht = phb.childNodes[0];
        if (!pht) {
            continue;
        }
        let ph = pht.textContent;
        if (ph.indexOf('(') > 0) {
            ph = ph.substring(0, ph.indexOf('('));
        }
        ph = ph.trim();
        if (!phrasePattern.test(ph)) {
            continue;
        }
        if (ph.indexOf(' ') === -1) {
            continue;
        }
        phrases.push(ph);
    }
    return phrases;
}

module.exports = {parseBasic, parseDetail, parseWordForms, parsePhonetics, parsePhrases};
