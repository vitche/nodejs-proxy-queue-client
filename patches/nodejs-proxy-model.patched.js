var patch = require('patch');
var mongoose = require('mongoose');
var proxyModel = require('nodejs-proxy-model');
patch.append(proxyModel, 'entities', {
    Proxy: mongoose.model('Proxy', {
        ipv4: String,
        ipv6: String,
        port: Number,
        type: {
            type: Number,
            enum: [
                1, // HTTPProxy
                2, // HTTPSProxy
                3, // SOCKS4Proxy
                4  // SOCKS5Proxy
            ]
        }
    })
});
module.exports = proxyModel;