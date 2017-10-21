module.exports = (req, res, next) => {
    if (req.ip === '127.0.0.1' || req.ip === '::1') {
        res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.set('Access-Control-Allow-Credentials', 'true');
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Headers',
                'X-Requested-With,withCredentials,Content-Type');
            res.set('Access-Control-Allow-Methods','GET, POST, PUT, DELETE');
            req.session=null;
        }
    }
    next();
};
