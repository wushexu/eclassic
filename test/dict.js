let testSuit = require('./common/rest');

describe.only('dict CRUD',
    testSuit('dict',
        {
            word: 'nuisance',
            phonetic: [{UK: 'njuːsns'}],
            categories: {cet: 4, haici: 3, pro: 4},
            complete: [
                {
                    pos: 'n',
                    items: [{id: 1, exp: '讨厌的人'}]
                }
            ],
            //forms: {plural: '', past: '', pastp: '', presentp: ''},
            phrases: []
        },
        {
            phonetic: [{UK: 'njuːsns'}, {US: 'nuːsns'}]
        },
        '/dict'));
