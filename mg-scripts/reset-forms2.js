// load('xxx.js')

db.dict.find(
    {
        $and: [
            {baseForm: {'$exists': true}},
            {
                $where: function () {
                    return this.word.indexOf('/') >= 0
                }
            }]
    },
    {word: 1, baseForm: 1})
    .forEach(function (de) {
        // printjson(de);
        let {word, baseForm} = de;
        if (!baseForm) {
            return;
        }
        print(word);
        let forms = word.split('/');
        for (let form of forms) {
            let fe = db.dict.findOne({word: form}, {word: 1, baseForm: 1});
            if (fe) {
                if (!fe.baseForm) {
                    print('U ' + form + ' -> ' + baseForm);
                    db.dict.update({_id: fe._id}, {$set: {baseForm: baseForm}});
                }
            } else {
                print('I ' + form + ' -> ' + baseForm);
                db.dict.insertOne({word: form, baseForm: baseForm, createdAt: new Date(), version: 1});
            }
        }

        print('D ' + word);
        db.dict.deleteOne({_id: de._id});
    });
