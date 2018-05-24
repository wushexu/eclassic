let express = require('express');
let router = express.Router();

let {idString} = require('../../common/helper');
let restful = require('./common/rest');
let sorter = require('./common/sorter');
let Book = require('../../models/book');
let Chap = require('../../models/chap');
let Para = require('../../models/para');

let handles = restful.simpleHandles(Book,
    {
        ChildModel: Chap,
        parentFieldInChild: 'bookId',
        childExistsMsg: 'Chapter Exists'
    });


restful.restful(router, handles);

router.param('_id', function (req, res, next, _id) {
    req.params.bookId = _id;
    next();
});


let {list: listChaps, create: createChap} = sorter.childResource(Chap, 'bookId');

router.route('/:_id/chaps')
    .get(listChaps)
    .post(createChap);

router.get('/:_id/detail', function (req, res, next) {
    const bookId = req.params.bookId;
    const bp = Book.getById(bookId);
    const cp = Chap.coll()
        .find({bookId})
        .project({bookId: 0})
        .sort({no: 1})
        .toArray();
    Promise.all([bp, cp])
        .then(function ([book, chaps]) {
            book.chaps = chaps;
            res.send(book);
        }).catch(next);
});

let actions = sorter.sortable(Book);
sorter.sort(router, actions);


const StatusBackup = 'B';


async function backupAChap(sourceChap, targetBookId) {
    if (sourceChap.status === StatusBackup) {
        return;
    }
    if (targetBookId) {
        targetBookId = idString(targetBookId);
    } else {
        targetBookId = sourceChap.bookId;
    }
    let chapId = idString(sourceChap._id);

    let clonedChap = Object.assign({}, sourceChap);
    delete clonedChap._id;
    clonedChap.bookId = targetBookId;
    clonedChap.originalId = chapId;
    clonedChap.status = StatusBackup;
    console.log('create Chap: ' + clonedChap.name);
    await Chap.create(clonedChap);
    console.log('id: ' + clonedChap._id);

    const paras = await Para.coll().find({chapId}).toArray();
    console.log('paras size: ' + paras.length);
    if (!paras || paras.length === 0) {
        return;
    }

    let clonedChapId = idString(clonedChap._id);

    let clonedParas = paras.map(para => {
        let cloned = Object.assign({}, para);
        delete cloned._id;
        cloned.chapId = clonedChapId;
        cloned.bookId = clonedChap.bookId;
        cloned.originalId = idString(para._id);
        return cloned;
    });

    let bulkOperations = clonedParas.map(clonedPara => {
        console.log('create para: ' + clonedPara.content);
        return {insertOne: {document: clonedPara}};
    });

    await Para.coll().bulkWrite(bulkOperations);
}


async function backupABook(req, res, next) {

    const bookId = req.params.bookId;
    const book = await Book.getById(bookId);
    if (!book) {
        return res.json(null);
    }

    let clonedBook = Object.assign({}, book);
    delete clonedBook._id;
    clonedBook.originalId = bookId;
    clonedBook.status = StatusBackup;
    await Book.create(clonedBook);

    const chaps = await Chap.coll().find({bookId}).toArray();
    console.log('chaps size: ' + chaps.length);

    for (let chap of chaps) {
        console.log('source chap id: ' + chap._id);
        await backupAChap(chap, clonedBook._id);
    }

    return res.json(clonedBook);
}

router.post('/:_id/backup', backupABook);

module.exports = router;
