var dotenv = require('dotenv');
module.exports = {
    load: function (callback) {
        dotenv.config({
            path: process.cwd() + '/.env'
        });
        var configuration = {
            "torProxyUri": process.env.nodejs_proxy_queue_client__torProxyUri,
            "onionRedisSchema": process.env.nodejs_proxy_queue_client__onionRedisSchema,
            "onionRedisUri": process.env.nodejs_proxy_queue_client__onionRedisUri
        };
        callback(undefined, configuration);
    }
};