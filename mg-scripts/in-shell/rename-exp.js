// load('xxx.js')

db.dict.find()//{$where: 'this.completeYd.length>0'}
    // .skip(10).limit(1)
    .forEach(function (de) {//dict entry
        // printjson(de);
        let simples = [de.simpleYd, de.simpleHc];
        for (let simple of simples) {
            if (!simple || simple.length === 0) {
                continue;
            }
            for (let posexp of simple) {
                let exp = posexp.explain;
                if (!exp) {
                    continue;
                }
                if (exp.endsWith('：')) {
                    exp = exp.substring(0, exp.length - 1);
                }
                posexp.exp = exp;
                delete posexp.explain;
            }
        }

        let completes = [de.completeYd, de.completeHc];
        for (let complete of completes) {
            if (!complete || complete.length === 0) {
                continue;
            }
            for (let poses of complete) {
                // let pos = poses.pos;
                for (let item of poses.items) {
                    let exp = item.explain;
                    if (!exp) {
                        continue;
                    }
                    if (exp.endsWith('：')) {
                        exp = exp.substring(0, exp.length - 1);
                    }
                    item.exp = exp;
                    delete item.explain;
                }
            }
        }
        // printjson(de);
        // db.dict.save(de);
        db.dict.update({_id: de._id}, de);
    });
