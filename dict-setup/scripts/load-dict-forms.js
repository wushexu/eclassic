const config = require('../config');
const {loadForms} = require('../lib/load-dict-forms');

loadForms(config.hcDataBaseDir);
