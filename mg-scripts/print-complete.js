const {connectDb, getDb} = require('../models/db');
let Dict = require('../models/dict');

connectDb().then(() => {
    Dict.coll()
        .find({$where: 'this.completeYd.length>0'})
        .limit(1)
        .forEach(function (d) {
            let c = d.completeYd;
            console.log(JSON.stringify(c));
        });

    getDb().close();
});
