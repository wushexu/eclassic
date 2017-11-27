const {
    regularPl, regularTPS,
    regularPast, regularPresentP
} = require('./regular-forms');

const WordFormNames = {
    '名词复数:': 'Pl',
    '过去式:': 'past',
    '过去分词:': 'pastP',
    '现在分词:': 'presentP',
    '第三人称单数': 'TPS'
};

function setMeanings(dictItem, simple, complete) {

    dictItem.explain = simple.map(mi => `${mi.pos}${mi.explain}`).join(';');

    let nextItemId = 1;
    let completeMeanings = [];

    for (let {pos, items} of complete) {
        let itemObjs = [];
        for (let meaningItem of items) {
            itemObjs.push({id: nextItemId, explain: meaningItem});
            nextItemId++;
        }
        completeMeanings.push({pos, items: itemObjs});
    }
    dictItem.complete = completeMeanings;
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
