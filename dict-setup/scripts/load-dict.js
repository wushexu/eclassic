const config = require('../config');
const {loadDict} = require('../lib/load-dict');

loadDict(config.hcDataBaseDir, {meaningFieldPostfix: 'Hc'});

// loadDict(config.ydDataBaseDir, {
//     meaningFieldPostfix: 'Yd',
//     loadPhonetics: true, loadWordForms: false,
//     loadPhrases: true, phrasesPostfix: '2'
// });
