let testSuit = require('./helper/rest');

describe('book CRUD',
    testSuit('book',
        {name: 'book021', author: '111', status: 'F'},
        {author: 'CQX', status: 'R'}));