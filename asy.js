const eachOf = require('async/eachOf');
// const eachOf = require('async/eachOfSeries');


let lines = [1, 2, 3];
console.log(lines.length);
eachOf(lines, function (value, index, callback) {
    console.log(value, index);
    callback();
}, function (err) {
    if (err) console.error(err.message);
    console.log('done.')
});
