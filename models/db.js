const {MongoClient, ObjectID} = require('mongodb');
let {emptyObject} = require('../helper/helper');

let db = null;

module.exports.connectDb = () => {
    if (db) {
        return Promise.resolve();
    }
    return MongoClient
        .connect('mongodb://localhost:27017/articles')
        .then((cli) => {
            db = cli;
        });
};

module.exports.getDb = () => {
    return db;
};

module.exports.simpleCurd = (collectionName) => {

    function coll() {
        return db.collection(collectionName);
    }

    function find(criteria, project = null) {
        if (project) {
            return coll().find(criteria, project).toArray();
        } else {
            return coll().find(criteria).toArray();
        }
    }

    async function exists(criteria) {
        let m = await coll().findOne(criteria, {_id: 1});
        return !!m;
    }

    function getById(_id, project = null) {
        if (typeof _id !== 'object') _id = ObjectID(_id);
        if (project) {
            return coll().findOne({_id}, project);
        } else {
            return coll().findOne({_id});
        }
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
