let testSuit = require('./common/rest');

describe('book CRUD',
    testSuit('book',
        {name: 'book021', zhName: '正在找', author: '111', zhAuthor: '曹操', status: 'F'},
        {zhName: '中外', author: 'CQX', status: 'R'}));
