const request = require('supertest');
const assert = require('assert');
let {app} = require('./helper/helper');
let {loginFn, logoutFn, checkUserinfoFn} = require('./helper/session');


const agent = request.agent(app);

describe('session', function () {

    before(loginFn(agent, {name: 'zzz', pass: 'hh'}));

    it('userinfo (login)',
        checkUserinfoFn(agent, (userinfo) => {
            return userinfo.login === true;
        }));

    it('logout', logoutFn(agent));

    it('userinfo (not login)',
        checkUserinfoFn(agent, (userinfo) => {
            return userinfo.login === false;
        }));

});
