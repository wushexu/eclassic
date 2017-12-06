// load('xxx.js')

db.dict.find()//{$where: 'this.completeYd.length>0'}
    // .skip(10).limit(1)
    .forEach(function (de) {//dict entry
        // printjson(de);
        if (de.wordLength) {
            return;
        }

        let {simpleYd, simpleHc, completeYd, completeHc} = de;

        let nextItemId = 1;
        let complete = [];
        let posMap = new Map();

        if (simpleHc) {
            for (let {pos, exp} of simpleHc) {
                posMap.set(pos, exp);
            }
        }
        if (simpleYd) {
            for (let {pos, exp} of simpleYd) {
                let exp0 = posMap.get(pos);
                if (!exp0 || exp0.length > exp.length) {
                    posMap.set(pos, exp);
                }
            }
        }

        let completeRef = completeHc || completeYd;
        for (let poses of completeRef) {
            // let pos = poses.pos;
        }
        // printjson(de);
        // db.dict.save(de);
        db.dict.update({_id: de._id}, {$set: {complete}});
    });
