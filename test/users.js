let testSuit = require('./helper/rest');

describe('chap CRUD',
    testSuit('user',
        {name: 'test021q', pass: '111222', gender: 'F'},
        {gender: 'F', role: 'gen'}));
