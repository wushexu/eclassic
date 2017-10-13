function emptyObject(obj) {
    if (typeof obj !== 'object') {
        return true;
    }
    let has = Object.prototype.hasOwnProperty;
    for (let key in obj) {
        if (has.call(obj, key)) return false;
    }
    return true;
}

function reqParam(req, name, defaultValue) {
    let params = req.params || {};
    let body = req.body || {};
    let query = req.query || {};

    if (null != params[name] && params.hasOwnProperty(name)) return params[name];
    if (null != body[name]) return body[name];
    if (null != query[name]) return query[name];

    return defaultValue;
}

function extractFields(req, fields) {
    let pairs = {};
    fields.forEach((field) => {
        let value = reqParam(req, field);
        if (typeof value !== 'undefined') {
            pairs[field] = value;
        }
    });
    return pairs;
}

function simpleReject(err) {
    console.error("OMG :(");
    console.error(err);
    //throw err;
}

function sendError(req, res) {

    return function (err) {
        console.error(err);

        // render the error page
        res.status(err.status || 500);
        res.format({
            json: () => {
                res.send({ok: 0, message: err.message});
            },
            html: () => {
                res.locals.message = err.message;
                res.locals.error = req.app.get('env') === 'development' ? err : {};
                res.render('error');
            }
        });
    };
}

function sendMgResult(res) {
    return (r) => {
        if (r.result) {
            r = r.result;
        }
        console.log("Mongo Result: " + r);
        res.send({ok: r.ok});
    };
}

module.exports = {
    reqParam,
    extractFields,
    emptyObject,
    simpleReject,
    sendError,
    sendMgResult
};