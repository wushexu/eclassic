module.exports = function () {
    let modelId = null;

    function checkModel(done) {
        return function (err, res) {
            if (err)return done(err);
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
};
