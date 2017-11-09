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

function modelHelper() {
    let modelId = null;

    function checkModel(done) {
        return function (err, res) {
            if (err) return done(err);
            let model = res.body;
            if (!model || !model._id) {
                throw new Error('fail.');
            }
            if (!modelId) {
                modelId = model._id;
            }
            done();
        }
    }

    function getModelId() {
        return modelId;
    }

    return {
        checkModel, getModelId
    };
}

module.exports = {app, checkResult, modelHelper};
