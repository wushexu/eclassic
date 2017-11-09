let testSuit = require('./common/rest');

describe.only('dict CRUD',
    testSuit('dict',
        {
            word: 'nuisance',
            meaning: '讨厌的人；讨厌的东西',
            phonetic: [{uk: 'njuːsns'}],
            categories: {cet: 4, haici: 3, pro: 4},
            complete: [
                {id: 1, pos: 'n', meaning: '讨厌的人'}
            ],
            //forms: {plural: '', past: '', pastp: '', presentp: ''},
            phrases: [],
            //collocations: [],
            sentences: [],
            usageTips: []
        },
        {
            meaning: '讨厌的人；讨厌的东西；伤害',
            phonetic: [{uk: 'njuːsns'}, {us: 'nuːsns'}]
        },
        '/dict'));
