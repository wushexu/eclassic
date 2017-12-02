let uniq = require('lodash/uniq');

// let {regularPl, regularTPS, regularPast, regularPresentP} = require('./word-forms');

function setMeanings(dictItem, simple, complete, fieldPostfix, nextItemId) {

    dictItem.explain = simple.map(mi => `${mi.pos}${mi.exp}`).join('\n');

    if (!nextItemId) {
        nextItemId = 1;
    }
    let completeMeanings = [];

    for (let {pos, items} of complete) {
        let itemObjs = [];
        for (let meaningItem of items) {
            itemObjs.push({id: nextItemId, exp: meaningItem});
            nextItemId++;
        }
        completeMeanings.push({pos, items: itemObjs});
    }
    if (fieldPostfix) {
        dictItem['simple' + fieldPostfix] = simple;
        dictItem['complete' + fieldPostfix] = completeMeanings;
    } else {
        dictItem.simple = simple;
        dictItem.complete = completeMeanings;
    }
    dictItem.nextItemId = nextItemId;
}

function setForms(dictItem, wordForms, baseFormsMap) {

    if (!wordForms) {
        return;
    }
    let word = dictItem.word;
    let forms = wordForms.map(([name, form]) => form);
    if (forms.length > 0) {
        dictItem.forms = uniq(forms);
    }
    if (baseFormsMap) {
        // name:
        // 副词:
        // 过去式:
        // 过去分词:
        // 现在分词:
        // 第三人称单数:
        // 名词复数:
        // 形容词:
        // 异体字:
        // 名词:
        // 比较级:
        // 最高级:
        // 动词:
        // 简写符号:
        // 原形:
        for (let [name, form] of wordForms) {
            let baseForms = baseFormsMap[form];
            if (!(baseForms instanceof Array)) {
                baseForms = baseFormsMap[form] = [];
            }
            baseForms.push(word);
        }
    }
}


function setPhonetics(dictItem, phonetics) {
    if (phonetics) {
        let phObj = {};
        for (let [name, ph] of phonetics) {
            let key = (name === '美') ? 'US' : 'UK';
            phObj[key] = ph;
        }
        dictItem.phonetics = phObj;
    }
}

module.exports = {setMeanings, setForms, setPhonetics};
