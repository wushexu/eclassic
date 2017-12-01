function regularPl(word) {
    let len = word.length;
    let last1 = word[len - 1];
    if (last1 === 's' || last1 === 'x') {
        return word + 'es';
    }
    let last2 = word.substr(len - 2);
    if (last2 === 'ch' || last2 === 'sh') {
        return word + 'es';
    }
    if (/[^aeiou]y/.test(last2)) {
        return word.substring(0, len - 1) + 'ies';
    }
    if (last1 === 'o') {
        // if (/[aeiou]/.test(word[len - 2])) {
        //     return word + 's';
        // }
        return word + 'es';
    }
    // if (last1 === 'f' || last2 === 'fe') {
    //     word = word.substring(0, (last1 === 'f') ? len - 1 : len - 2);
    //     return word + 'ves';
    // }
    return word + 's';
}

function regularTPS(word) {
    let len = word.length;
    let last1 = word[len - 1];
    if (last1 === 's' || last1 === 'x' || last1 === 'o') {
        return word + 'es';
    }
    let last2 = word.substr(len - 2);
    if (last2 === 'ch' || last2 === 'sh') {
        return word + 'es';
    }
    if (/[^aeiou]y/.test(last2)) {
        return word.substring(0, len - 1) + 'ies';
    }
    return word + 's';
}

function regularPast(word) {
    let len = word.length;
    let last1 = word[len - 1];
    if (last1 === 'e') {
        return word + 'd';
    }
    let last2 = word.substr(len - 2);
    if (/[^aeiou]y/.test(last2)) {
        return word.substring(0, len - 1) + 'ied';
    }
    // if (last1 === 'x') {
    //     return word + 'ed';
    // }
    // if (last1 === 'l' && /[aeiou][aeiou]l$/.test(word)) {
    //     return word + 'ed';
    // }
    // if (/[aeiou][^aeiou]$/.test(word)) {
    //     // if 重读
    //     return word + last1 + 'ed';
    // }
    return word + 'ed';
}


function regularPresentP(word) {
    let len = word.length;
    let last1 = word[len - 1];
    if (last1 === 'e') {
        return word.substring(0, len - 1) + 'ing';
    }
    // if (/[aeiou][^aeiou]$/.test(word)) {
    //     // if 重读
    //     return word + last1 + 'ing';
    // }

    return word + 'ing';
}

const WordFormNames = {
    '名词复数:': 'Pl',
    '过去式:': 'past',
    '过去分词:': 'pastP',
    '现在分词:': 'presentP',
    '第三人称单数': 'TPS'
};

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

function setForms(dictItem, wordForms, wordsFormOf) {

    if (!wordForms) {
        return;
    }
    let word = dictItem.word;
    let irregularForms = [];
    for (let [formName, form] of wordForms) {
        let key = WordFormNames[formName];
        let regular;
        switch (key) {
            case 'Pl':
                regular = regularPl(word);
                break;
            case 'past':
            case 'pastP':
                regular = regularPast(word);
                break;
            case 'presentP':
                regular = regularPresentP(word);
                break;
            case 'TPS':
                regular = regularTPS(word);
                break;
        }
        if (regular && form !== regular) {
            irregularForms.push([key, form]);

            let formOf = wordsFormOf[form];
            if (!formOf) {
                formOf = wordsFormOf[form] = {};
            }
            formOf[word] = key;
        }
    }
    if (irregularForms.length > 0) {
        let irregularFormObj = {};
        for (let [key, form] of irregularForms) {
            irregularFormObj[key] = form;
        }
        dictItem.forms = irregularFormObj;
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
