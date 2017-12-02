const config = require('../config');
const {loadDict} = require('../lib/load-dict');

loadDict(config.hcDataBaseDir, {meaningFieldPostfix: 'Hc', nextItemId: 1});

// loadDict(config.ydDataBaseDir, {
//     meaningFieldPostfix: 'Yd', nextItemId: 71,
//     loadPhonetics: true, loadWordForms: false,
//     loadPhrases: true, phrasesPostfix: '2'
// });
