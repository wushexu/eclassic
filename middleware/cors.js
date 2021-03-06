const {HeaderNames} = require('../common/config');

const allowHeaders = [
    'X-Requested-With',
    'withCredentials',
    'Content-Type',
    HeaderNames.Client,
    HeaderNames.UserToken,
    HeaderNames.AppVersion
].join(',');

module.exports = (req, res, next) => {
    console.log("------------");
    let ip = req.ip;
    if (!ip) {
        next();
        return;
    }
    if (
        ip === '127.0.0.1'
        || ip.startsWith('192.')
        || ip.startsWith('10.')
        || req.app.get('env') === 'development'
        || (ip.startsWith('::') && (
            ip === '::1'
            || ip === '::ffff:127.0.0.1'
            || ip.startsWith('::ffff:192.')
            || ip.startsWith('::ffff:10.')
        ))
    ) {
        let origin = req.headers['origin']/* || 'http://localhost:4200'*/;
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Credentials', 'true');
        if (req.method === 'OPTIONS') {
            res.set('Access-Control-Allow-Headers',
                allowHeaders);
            res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            req.session = null;
        }
    }
    next();
};
