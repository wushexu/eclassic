const config = require('../config');
const {loadDict} = require('../lib/load-dict');


loadDict(config.hcDataBaseDir);
