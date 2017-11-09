let testSuit = require('./common/rest');

describe('para CRUD',
    testSuit('para',
        {content: 'Richard decided to ',
            trans: '理查德决定要'},
        {content: 'Richard decided to attend jump school and become a para.',
            trans: '理查德决定要进入跳伞学校学习，成为一名伞兵'},
        '/paras',
        '/chaps/59e0241456ee701e520a74e6/paras'));
