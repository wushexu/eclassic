// load('xxx.js')

db.dict2.find(
    {phrases2: {'$exists': true}},
    {word: 1, phrases: 1, phrases2: 1})//.limit(10)
    .forEach(function (de) {//dict entry
        // printjson(de);
        let {phrases, phrases2} = de;
        if (phrases2 === null) {
            db.dict2.update({_id: de._id}, {$unset: {phrases2: ''}});
            return;
        }
        if (!phrases || phrases.length === 0) {
            phrases = phrases2;
        } else {
            for (let ph of phrases2) {
                if (phrases.indexOf(ph) === -1) {
                    phrases.push(ph);
                }
            }
        }
        // printjson({phrases});

        db.dict2.update({_id: de._id}, {$set: {phrases}, $unset: {phrases2: ''}});
        //$unset: {phrases2: ''}
    });
