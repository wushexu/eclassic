let User = require('../models/user');
let Book = require('../models/book');
let UserBook = require('../models/user_book');
let {modelIdString} = require('./helper');


async function evaluateUserContents(user) {

    let bookIds = [];
    let chapIds = [];

    let books = await Book.coll()
        .find({status: 'R'})
        .sort({no: 1})
        .project({isFree: 1})
        .toArray();

    if (User.adminOrEditor(user)) {
        bookIds = books.map(b => b._id);
        return {bookIds, chapIds};
    }

    let userId = modelIdString(user);
    if (!userId) {
        bookIds = books.filter(b => b.isFree).map(b => b._id);
        return {bookIds, chapIds};
    }

    let userBooks = await UserBook.find({userId},
        {bookId: 1, isAllChaps: 1, chaps: 1});
    let ubMap = {};
    for (let ub of userBooks) {
        ubMap[ub.bookId] = ub;
    }

    for (let book of books) {
        let ub = ubMap[book._id];
        if (!ub) {
            continue;
        }
        if (UserBook.ownerOrEditor(ub) || ub.isAllChaps) {
            bookIds.push(book._id);
            continue;
        }

        if (!ub.chaps) {
            continue;
        }
        for (let cp of ub.chaps) {
            chapIds.push(cp.chapId);
        }
    }

    return {bookIds, chapIds};
}


async function canReadChap(user, chap /*released Chap*/) {
    if (!chap) {
        return false;
    }
    let book = await Book.releasedBook(chap.bookId, {_id: 0, isFree: 1});
    if (!book) {
        return false;
    }
    if (User.adminOrEditor(user)) {
        return true;
    }

    if (book.isFree || chap.isFree) {
        return true;
    }

    let userId = modelIdString(user);
    if (!userId) {
        return false;
    }
    let userBook = await UserBook.coll()
        .findOne({userId, bookId: chap.bookId},
            {role: 1, isAllChaps: 1, chaps: 1});

    if (!userBook) {
        return false;
    }
    if (UserBook.ownerOrEditor(userBook)) {
        return true;
    }
    if (userBook.isAllChaps) {
        return true;
    }

    let userChaps = userBook.chaps;
    if (!userChaps || userChaps.length === 0) {
        return false;
    }
    return userChaps.find(uc => uc.chapId === chapId);
}


// async function resourcePermission(action, modelType, model, currentUser) {
//     //TODO:
// }

module.exports = {canReadChap, evaluateUserContents};
