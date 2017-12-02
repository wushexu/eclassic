// load('xxx.js')

db.dict.find({
        $or: [
            {forms: {'$exists': true}},
            {formOf: {'$exists': true}}]
    },
    {word: 1})
    // .skip(10).limit(1)
    .forEach(function (de) {//dict entry
        // printjson(de);
        // db.dict.save(de);
        db.dict.update({_id: de._id}, {$unset: {forms: '', formOf: ''}});
    });

// db.dict.updateMany({
//     $or: [
//         {forms: {'$exists': true}},
//         {formOf: {'$exists': true}}]
// }, {$unset: {forms: '', formOf: ''}});
