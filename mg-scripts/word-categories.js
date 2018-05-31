function buildFilter(wordCategory) {
    let fk = 'categories.' + wordCategory.dictKey;
    let val = wordCategory.dictValue;
    let op = wordCategory.dictOperator;
    let filter = {};
    if (!op) {
        filter[fk] = val;
    } else if (['gt', 'lt', 'ne'].indexOf(op) >= 0) {
        filter[fk] = {['$' + op]: val}
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
        if (dictValue === 0) {
            wc.dictOperator = 'gt';
        }
        wc.version = 1;
        wc.no = no++;
        categories.push(wc);
        return wc;
    };

    addCategory('junior', 1, 'junior1', '初级');
    addCategory('junior', 2, 'junior2', '中级', 'junior1');
    addCategory('junior', 0, 'basic', '基础');
    addCategory('cet', 4, 'cet4', 'CET4', 'junior2');
    addCategory('cet', 6, 'cet6', 'CET6', 'cet4');
    addCategory('cet', 0, 'cet', 'CET');
    addCategory('gre', 1, 'gre', 'GRE', 'junior2');
    addCategory('yasi', 1, 'yasi', '雅思', 'junior2');
    addCategory('pro', 1, 'pro', '专英', 'cet6');
    // addCategory('haici', 5, 'haici5', '海词5星');
    // addCategory('haici', 4, 'haici4', '海词4星', 'haici5');
    // addCategory('haici', 3, 'haici3', '海词3星', 'haici4');
    // addCategory('haici', 2, 'haici2', '海词2星', 'haici3');
    // addCategory('haici', 1, 'haici1', '海词1星', 'haici2');
    addCategory('haici', 0, 'haici', '海词');
    addCategory('coca', 0, 'coca', '当代美国英语语料库');
    addCategory('bnc', 0, 'bnc', '英国国家语料库');
    addCategory('anc', 0, 'anc', '美国国家语料库');

    let bulkOperations = categories.map(cat => {
        return {insertOne: {document: cat}};
    });

    db.word_categories.drop();
    db.word_categories.createIndex({code: 1}, {unique: true});

    db.word_categories.bulkWrite(bulkOperations);
}

function evaluateWordCount() {
    db.word_categories.find({}).forEach(function (wc) {
        let filter = buildFilter(wc);
        let wordCount = db.dict.find(filter).count();
        db.word_categories.update({code: wc.code}, {$set: {wordCount}});
    });
}

function evaluateExtendedWordCount() {
    let wcs = db.word_categories.find({}, {
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
