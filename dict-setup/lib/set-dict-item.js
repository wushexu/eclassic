let uniq = require('lodash/uniq');
let union = require('lodash/union');

function setMeanings(dictItem, simple, complete, fieldPostfix) {

    // dictItem.explain = simple.map(mi => `${mi.pos}${mi.exp}`).join('\n');

    if (simple.length === 0) {
        simple = null;
    }
    if (complete.length === 0) {
        complete = null;
    }

    if (fieldPostfix) {
        dictItem['simple' + fieldPostfix] = simple;
        dictItem['complete' + fieldPostfix] = complete;
    } else {
        dictItem.simple = simple;
        dictItem.complete = complete;
    }
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
            if (form === word) {
                continue;
            }
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

function setBaseForm(dictItem) {
    let {word, baseForms} = dictItem;
    if (!baseForms) {
        return;
    }
    const len = baseForms.length;
    if (len === 0) {
        return;
    }

    if (len === 1) {
        let bf = baseForms[0];
        if (bf.length > word.length + 2) {
            return;
        }
        dictItem.baseForm = bf;
        return;
    }

    baseForms = baseForms.sort((a, b) => a.length - b.length);

    let bf0 = baseForms[0];
    if (baseForms.every(bf => bf.startsWith(bf0))) {
        dictItem.baseForm = bf0;
        return;
    }

    baseForms = baseForms.filter(bf => !bf.endsWith('ing'));
    if (baseForms.length === 0) {
        return;
    }

    bf0 = baseForms[0];
    if (baseForms.every(bf => bf.startsWith(bf0))) {
        dictItem.baseForm = bf0;
    }
}

function mergeDictItems(dictItemHc, dictItemYd) {
    if (!dictItemHc || !dictItemHc.simple) {
        return dictItemYd;
    }
    if (!dictItemYd || !dictItemYd.simple) {
        console.log(dictItemHc.word, 'missing Yd');
        return dictItemHc;
    }
    let dictItem = dictItemHc;
    if (!dictItem.phonetics) {
        dictItem.phonetics = dictItemYd.phonetics;
    }
    dictItem.simpleHc = dictItem.simple;
    dictItem.completeHc = dictItem.complete;
    dictItem.complete = null;
    dictItem.simpleYd = dictItemYd.simple;
    dictItem.completeYd = dictItemYd.complete;
    dictItem.phrases = union(dictItem.phrases, dictItemYd.phrases);
    dictItem.phraseCount = dictItem.phrases.length;
    if (dictItem.phrases.length === 0) {
        dictItem.phrases = null;
    }

    let word = dictItem.word;
    dictItem.wordLength = word.length;
    let wordCount = word.split(' ').length;
    dictItem.wordCount = wordCount;
    dictItem.isPhrase = wordCount > 1;

    setBaseForm(dictItem);

    return dictItem;
}

module.exports = {setMeanings, setForms, setPhonetics, mergeDictItems};
