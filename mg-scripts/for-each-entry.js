// load('xxx.js')

db.dict.find()
    // .skip(20).limit(50)
    .forEach(function (de) {//dict entry
        // printjson(de);

        let {simpleYd, simpleHc, completeYd, completeHc} = de;

        if (!completeYd && !completeHc) {
            return;
        }

        let toUpdate = {};
        if (simpleHc && completeHc) {
            for (let posMeanings of completeHc) {
                let pos = posMeanings.pos;
                let si = simpleHc.find(si => si.pos === pos);
                if (si) {
                    posMeanings.exp = si.exp;
                } else if (pos === 'v.') {
                    si = simpleHc.find(si => si.pos === 'vt.');
                    if (si) {
                        posMeanings.exp = si.exp;
                    }
                }
            }
            toUpdate.completeHc = completeHc;
        }
        if (simpleYd && completeYd) {
            for (let posMeanings of completeYd) {
                let pos = posMeanings.pos;
                let si = simpleYd.find(si => si.pos === pos);
                if (si) {
                    posMeanings.exp = si.exp;
                }
            }
            toUpdate.completeYd = completeYd;
        }

        // printjson(de);
        db.dict.update({_id: de._id}, {$set: toUpdate});
    });
