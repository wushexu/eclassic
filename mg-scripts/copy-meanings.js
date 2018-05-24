// load('xxx.js')

db.dict.find()
    // .skip(20).limit(50)
    .forEach(function (de) {//dict entry
        // printjson(de);

        let {completeYd, completeHc} = de;

        let complete = completeHc || completeYd;
        if (!complete) {
            return;
        }

        let id = 1;

        for (let posMeanings of complete) {
            let items = [];
            for (let exp of posMeanings.items) {
                ++id;
                items.push({id, exp});
            }
            posMeanings.items = items;
        }

        db.dict.update({_id: de._id}, {$set: {complete}});
    });
