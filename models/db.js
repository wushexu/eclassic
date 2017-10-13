const {MongoClient, ObjectID} = require('mongodb');
let {emptyObject, simpleReject} = require('../helper/helper');

let db;

module.exports.connectDb = () => {
    return MongoClient
        .connect('mongodb://localhost:27017/articles')
        .then((cli) => {
            db = cli;
        }, simpleReject);
};

module.exports.getDb = () => {
    return db;
};

module.exports.simpleCurd = (collectionName) => {

    function coll() {
        return db.collection(collectionName);
    }

    function find(criteria) {
        return coll().find(criteria).toArray();
    }

    function exists(criteria) {
        return coll().findOne(criteria, {_id: 1}).then((m) => {
            return new Promise(function (resolve, reject) {
                return resolve(!!m);
            });
        }, simpleReject);
    }

    function getById(_id) {
        if (typeof _id !== 'object') _id = ObjectID(_id);
        return coll().findOne({_id});
    }

    function getByName(name) {
        return coll().findOne({name});
    }

    function create(entity) {
        if (emptyObject(entity)) {
            throw new Error("empty object.");
        }
        return coll().insertOne(entity);
    }

    function update(_id, values) {
        if (emptyObject(values)) {
            throw new Error("empty object.");
        }
        if (typeof _id !== 'object') _id = ObjectID(_id);
        return coll().updateOne({'_id': _id}, {'$set': values});
    }

    function remove(_id) {
        if (typeof _id !== 'object') _id = ObjectID(_id);
        return coll().deleteOne({_id});
    }

    return {
        coll,
        find,
        exists,
        getById,
        getByName,
        create,
        update,
        remove
    };

};
