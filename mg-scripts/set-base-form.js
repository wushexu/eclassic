// load('xxx.js')

db.dict.find(
    {baseForms: {'$exists': true}, baseForm: {'$exists': false}},
    {word: 1, baseForms: 1})
    .forEach(function (de) {
        // printjson(de);
        let {word, baseForms} = de;
        const len = baseForms.length;
        if (len === 0) {
            return;
        }

        let cond = {_id: de._id};
        if (len === 1) {
            let bf = baseForms[0];
            if (bf.length > word.length + 2) {
                if (word.length > 2) {
                    print(word + ': ' + bf);
                }
                return;
            }
            db.dict.update(cond, {$set: {baseForm: bf}});
            return;
        }

        baseForms = baseForms.sort((a, b) => a.length - b.length);

        let bf0 = baseForms[0];
        if (baseForms.every(bf => bf.startsWith(bf0))) {
            db.dict.update(cond, {$set: {baseForm: bf0}});
            return;
        }

        baseForms = baseForms.filter(bf => !bf.endsWith('ing'));
        if (baseForms.length === 0) {
            return;
        }

        bf0 = baseForms[0];
        if (baseForms.every(bf => bf.startsWith(bf0))) {
            db.dict.update(cond, {$set: {baseForm: bf0}});
        }

    });
