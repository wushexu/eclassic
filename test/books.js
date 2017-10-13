let testSuit = require('./helper/rest');

describe('chap CRUD',
    testSuit('book',
        {name: 'book021', author: '111', status: 'F'},
        {author: 'CQX', status: 'R'}));
