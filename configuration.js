var request = require('request');
var clusterUri = require('nodejs-cluster-uri');
module.exports = {
    load: function (callback) {
        var cluster = new clusterUri.Cluster(['https://dl.dropboxusercontent.com/u/46226853/nodejs-proxy/nodejs-proxy-queue-client.json']);
        cluster.firstGood(function (error, uri) {
            if (undefined != error) {
                callback(error);
                return;
            }
            request(uri, function (error, response, body) {
                if (error) {
                    callback(error);
                    return;
                }
                var content = JSON.parse(body);
                callback(undefined, content);
            });
        });
    }
};