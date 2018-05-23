function checkChapterPermission(userBook, chapId) {
    if (!userBook) {
        return false;
    }
    if (userBook.isAllChaps) {
        return true;
    }
    // TODO:
    // if (userBook.role === 'Admin' || userBook.role === 'Editor') {
    //     return true;
    // }
    let userChaps = userBook.chaps;
    if (!userChaps || userChaps.length === 0) {
        return false;
    }
    return userChaps.find(uc => uc.chapId === chapId);
}


module.exports = {checkChapterPermission};
