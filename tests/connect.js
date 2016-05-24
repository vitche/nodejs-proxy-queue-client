var proxyQueueClient = require('../main');
var configuration = require('../configuration');
module.exports = {
    testConnectWithManualConfiguration: function (test) {
        configuration.load(function (error, data) {
            if (undefined != error) {
                test.ok(false, 'testConnect should load configuration');
                test.done();
                return;
            }
            var client = new proxyQueueClient(data);
            client.connect(function (error) {
                test.ok(undefined == error, 'testConnect should connect to Onion Redis');
                client.disconnect();
                test.done();
            });
        });
    },
    testConnectWithAutomaticConfiguration: function (test) {
        var client = new proxyQueueClient();
        client.connect(function (error) {
            test.ok(undefined == error, 'testConnect should connect to Onion Redis');
            client.disconnect();
            test.done();
        });
    }
};