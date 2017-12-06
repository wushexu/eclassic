// load('xxx.js')

db.dict.find(
    {baseForms: {'$exists': true}},
    {word: 1, baseForms: 1})//.limit(10)
    .forEach(function (de) {//dict entry
        // printjson(de);
        let {word, baseForms} = de;
        if (baseForms === null) {
            return;
        }
        if (baseForms.indexOf(word) === -1) {
            return;
        }
        print(word);
        // print(baseForms);
        baseForms = baseForms.filter(f => f !== word);

        db.dict.update({_id: de._id}, {$set: {baseForms}});
    });
