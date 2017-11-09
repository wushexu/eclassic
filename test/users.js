let testSuit = require('./common/rest');

describe('user CRUD',
    testSuit('user',
        {name: 'test099', pass: '111222', gender: 'F'},
        {gender: 'F', role: 'gen'}));
