const request = require('supertest');
let {app, checkResult} = require('./helper');
let modelHelper = require('./model');


function testSuit(resourceName, toCreate, toUpdate, path, collectionPath) {

    let {checkModel, getModelId} = modelHelper();

    return function () {

        if (!path) {
            path = '/' + resourceName + 's';
        }
        if (!collectionPath) {
            collectionPath = path;
        }

        before(function (done) {
            request(app)
                .post(collectionPath)
                .accept('json')
                .send(toCreate)
                .expect(200)
                .end(checkModel(done));
        });

        it('create ' + resourceName, function (done) {
            if (getModelId()) {
                done();
            } else {
                done(new Error('Failed.'));
            }
        });

        it('list ' + resourceName + 's', function (done) {
            request(app)
                .get(collectionPath)
                .accept('json')
                .expect(200, done);
        });

        it('get ' + resourceName, function (done) {
            request(app)
                .get(path + '/' + getModelId())
                .accept('json')
                .expect(200)
                .end(checkModel(done));
        });

        it('update ' + resourceName, function (done) {
            request(app)
                .post(path + '/' + getModelId())
                .accept('json')
                .send(toUpdate)
                .send({_method: 'PUT'})
                .expect(200)
                .end(checkResult(done));
        });

        it('delete ' + resourceName, function (done) {
            request(app)
                .post(path + '/' + getModelId())
                .accept('json')
                .send({_method: 'DELETE'})
                .expect(200)
                .end(checkResult(done));
        });
    };

}

module.exports = testSuit;