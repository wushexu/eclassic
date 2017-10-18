//let app = require('../app');
let app = 'http://localhost:3000/api';

function checkResult(done) {
    return function (err, res) {
        if (err) return done(err);
        let result = res.body;
        if (!result || result.ok !== 1) {
            throw new Error('Failed. res.body: ' + result);
        }
        done();
    }
}

module.exports = {app, checkResult};
