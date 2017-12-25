let testSuit = require('./common/rest');

describe.only('user_book CRUD',
    testSuit('user_book',
        {userId: '23211', bookId: '111222', isAllChaps: false},
        {chaps: [{chapId: '23414'}], role: 'editor'}));
