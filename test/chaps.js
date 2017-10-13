let testSuit = require('./helper/rest');

describe('chap CRUD',
    testSuit('chap',
        {name: 'Chapter 1', status: 'F'},
        {name: 'ST', status: 'D'},
        '/chaps',
        '/books/59dda2a639017ddc593b4324/chaps'));

// sort