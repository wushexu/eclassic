const assert = require('assert');
let {checkResult} = require('./helper');

function loginFn(agent, credentials) {
    return function (done) {
        agent
            .post('/login')
            .accept('json')
            .send(credentials)
            .expect(200)
            .end(checkResult(done));
    }
}

function logoutFn(agent) {
    return function (done) {
        agent
            .post('/login')
            .accept('json')
            .send({_method: 'DELETE'})
            .expect(200)
            .end(checkResult(done));
    };
}

function checkUserinfoFn(agent, predict) {

    return function (done) {
        agent
            .get('/userinfo')
            .accept('json')
            .expect(200)
            .end((err, res) => {
                if (err)return done(err);
                assert(predict(res.body));
                done();
            });
    }
}

module.exports = {loginFn, logoutFn, checkUserinfoFn};