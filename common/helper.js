// let debug = require('debug')('cr:m');
const {ParamNames} = require('./config');

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
    let body = req.body || {};
    let params = req.params || {};
    let query = req.query || {};

    if (typeof body[name] !== 'undefined') return body[name];
    if (typeof params[name] !== 'undefined') return params[name];
    if (typeof query[name] !== 'undefined') return query[name];

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

function getLimit(req, defaultLimit, threshold) {
    let limit = req.query[ParamNames.PageLimit];
    if (!limit || isNaN(limit)) {
        return defaultLimit;
    }
    limit = parseInt(limit);
    if (!threshold) {
        return limit;
    }
    return Math.min(limit, threshold);
}

function readModels(req, fields) {
    let modelParameters = req.body;
    if (typeof modelParameters.length === 'undefined') {
        console.error('Must Be an Array');
        return [];
    }
    return modelParameters.map(modelParameter => {
        let model = {};
        fields.forEach(field => {
            let value = modelParameter[field];
            if (typeof value !== 'undefined') {
                model[field] = value;
            }
        });
        return model;
    });
}

function simpleReject(err) {
    console.error("OMG :(");
    console.error(err);
    //throw err;
}

function errorHandler(req, res) {

    return function (err) {
        console.error(err);

        // render the error page
        res.status(err.status || 500);
        res.format({
            json: () => {
                res.json({ok: 0, message: err.message});
            },
            html: () => {
                res.locals.message = err.message;
                res.locals.error = req.app.get('env') === 'development' ? err : {};
                res.render('error');
            }
        });
    };
}

function sendMgResult(res, r) {
    if (r.result) {
        r = r.result;
    }
    console.log(r);
    // console.log('Mongo Result: ' + JSON.stringify(r));
    res.json({ok: r.ok, n: r.n});
}

function wrapAsyncs(...asyncFns) {
    return asyncFns.map(fn => function (req, res, next) {
            fn(req, res, next).catch(next);
        }
    );
}

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
}


function isId(str) {
    return /^[0-9a-z]{24}$/.test(str);
}

function idString(id) {
    if (typeof id === 'object') {
        //ObjectID
        return id.toHexString();
    }
    return id;
}

function modelIdString(model) {
    if (!model) {
        return null;
    }
    return idString(model._id);
}

module.exports = {
    reqParam,
    extractFields,
    getLimit,
    readModels,
    emptyObject,
    errorHandler,
    sendMgResult,
    wrapAsyncs,
    wrapAsync,
    isId,
    idString,
    modelIdString
};
