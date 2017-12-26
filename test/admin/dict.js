let testSuit = require('./rest');

describe('dict CRUD',
    testSuit('dict',
        {
            word: 'nuisance',
            phonetics: [{UK: 'njuːsns'}],
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
            phonetics: [{UK: 'njuːsns'}, {US: 'nuːsns'}]
        },
        '/dict'));
