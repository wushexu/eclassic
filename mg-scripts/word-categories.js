function buildFilter(wordCategory) {
    let fk = 'categories.' + wordCategory.dictKey;
    let val = wordCategory.dictValue;
    let op = wordCategory.dictOperator;
    let filter = {};
    if (!op) {
        filter[fk] = val;
    } else if (['gt', 'gte', 'lt', 'lte', 'ne'].indexOf(op) >= 0) {
        filter[fk] = {['$' + op]: val}
    } else if (op === 'exist') {
        filter[fk] = {$exist: true};
    } else if (op === 'not-exist') {
        filter[fk] = {$exist: false};
    } else {
        console.log('unknown key: ' + fk);
        filter[fk] = val;
    }
    return filter;
}


function createRecords() {

    let categories = [];
    let no = 1;

    let addCategory = (dictKey, dictValue, code, name, extendTo = null) => {
        let wc = {code, name, dictKey, dictValue, extendTo};
        wc.description = '';
        wc.wordCount = 0;
        wc.extendedWordCount = 0;
        wc.isFrequency = dictValue === 1000;
        wc.useAsUserBase = !wc.isFrequency && dictKey !== 'haici';
        wc.version = 1;
        wc.no = no++;
        categories.push(wc);
        return wc;
    };

    addCategory('junior', 1, 'junior1', '初级');
    addCategory('junior', 2, 'junior2', '中级', 'junior1');
    let basic = addCategory('junior', 0, 'basic', '基础');
    basic.dictOperator = 'gt';
    addCategory('cet', 4, 'cet4', 'CET4', 'junior2');
    addCategory('cet', 6, 'cet6', 'CET6', 'cet4');
    let cet = addCategory('cet', 0, 'cet', 'CET');
    cet.dictOperator = 'gt';
    addCategory('gre', 1, 'gre', 'GRE', 'junior2');
    addCategory('yasi', 1, 'yasi', '雅思', 'junior2');
    addCategory('pro', 1, 'pro', '专英', 'cet6');
    addCategory('haici', 5, 'haici5', '海词5星');
    addCategory('haici', 4, 'haici4', '海词4星', 'haici5');
    addCategory('haici', 3, 'haici3', '海词3星', 'haici4');
    addCategory('haici', 2, 'haici2', '海词2星', 'haici3');
    addCategory('haici', 1, 'haici1', '海词1星', 'haici2');
    addCategory('coca', 1000, 'coca', '当代美国英语语料库');
    addCategory('bnc', 1000, 'bnc', '英国国家语料库');
    addCategory('anc', 1000, 'anc', '美国国家语料库');

    let bulkOperations = categories.map(cat => {
        return {insertOne: {document: cat}};
    });

    db.word_categories.drop();
    db.word_categories.createIndex({code: 1}, {unique: true});

    db.word_categories.bulkWrite(bulkOperations);
}

function evaluateWordCount() {
    db.word_categories.find({isFrequency: false}).forEach(function (wc) {
        let filter = buildFilter(wc);
        let wordCount = db.dict.find(filter).count();
        db.word_categories.update({code: wc.code}, {$set: {wordCount}});
    });
}

function evaluateExtendedWordCount() {
    let wcs = db.word_categories.find({isFrequency: false}, {
        _id: 0,
        code: 1,
        extendTo: 1,
        wordCount: 1,
        extendedWordCount: 1
    }).toArray();
    let wcMap = {};
    for (let wc of wcs) {
        wc.extendedWordCount = null;
        wcMap[wc.code] = wc;
    }

    let setExtendedWordCount;
    setExtendedWordCount = (wc) => {
        if (!wc.extendTo) {
            wc.extendedWordCount = wc.wordCount;
            return;
        }
        let extend = wcMap[wc.extendTo];
        if (!extend) {
            print("not exist, " + wc.extendTo);
            wc.extendedWordCount = wc.wordCount;
            return;
        }

        if (extend.extendedWordCount === null) {
            setExtendedWordCount(extend);
        }
        wc.extendedWordCount = extend.extendedWordCount + wc.wordCount;
    };

    for (let wc of wcs) {
        setExtendedWordCount(wc);
        print(wc.code + ": " + wc.wordCount + ": " + wc.extendedWordCount);
        db.word_categories.update({code: wc.code}, {$set: {extendedWordCount: wc.extendedWordCount}});
    }

}

// createRecords();
// evaluateWordCount();
evaluateExtendedWordCount();
