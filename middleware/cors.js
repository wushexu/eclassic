module.exports = (req, res, next) => {
    //if(req.xhr){
    if (req.ip === '127.0.0.1' || req.ip === '::1') {
        res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    }
    //}
    next();
};
