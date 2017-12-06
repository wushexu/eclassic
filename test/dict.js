let testSuit = require('./common/rest');

describe.only('dict CRUD',
    testSuit('dict',
        {
            word: 'nuisance',
            simple: [{pos: 'adj.', exp: '讨厌的人；讨厌的东西'}],
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
            simple: [{pos: 'adj.', exp: '讨厌的人；讨厌的东西；伤害'}],
            phonetic: [{UK: 'njuːsns'}, {US: 'nuːsns'}]
        },
        '/dict'));
