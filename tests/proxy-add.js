var proxyQueueClient = require('../main');
module.exports = {
    testAddPublish: function (test) {
        var client = new proxyQueueClient();
        client.connected = false;
        client.connect(function (error) {
            test.ok(undefined == error, 'testAddPublish should connect to Onion Redis');
            if (false === client.connected) {
                client.connected = true;
                var proxy = {
                    ipv4: '127.0.0.1',
                    port: 9050,
                    type: 3
                };
                client.proxy.add.publish(proxy);
                client.disconnect();
                test.done();
            }
        });
    },
    testAddSubscribe: function (test) {
        var client = new proxyQueueClient();
        client.connected = false;
        client.connect(function (publisherError) {
            test.ok(undefined == publisherError, 'testAddSubscribe should connect to Onion Redis');
            if (false === client.connected) {
                client.connected = true;
                // Sample proxy record
                var proxy = {
                    ipv4: '127.0.0.1',
                    port: 9050,
                    type: 3
                };
                // Subscribe to the "proxy.add" event
                client.proxy.add.subscribe(function (error, value) {
                    test.ok(undefined == error, 'testAddSubscribe should process subscribed messages');
                    var sameProxy = JSON.stringify(proxy) == JSON.stringify(value);
                    if (sameProxy) {
                        client.disconnect();
                        test.ok(sameProxy, 'testAddSubscribe should receive the same proxy');
                        test.done();
                    }
                });
                // Publish a sample proxy description
                client.proxy.add.publish(proxy);
            }
        });
    },
    testAddSubscribeN: function (test) {
        var N = 100;
        var client = new proxyQueueClient();
        client.connected = false;
        client.connect(function (publisherError) {
            test.ok(undefined == publisherError, 'testAddSubscribeN should connect to Onion Redis');
            if (false === client.connected) {
                client.connected = true;
                // Sample proxy record
                var proxy = {
                    ipv4: '127.0.0.1',
                    port: 9050,
                    type: 3
                };
                test.receiveCount = 0;
                // Subscribe to the "proxy.add" event
                client.proxy.add.subscribe(function (error, value) {
                    test.ok(undefined == error, 'testAddSubscribeN should process subscribed messages');
                    var sameProxy = JSON.stringify(proxy) == JSON.stringify(value);
                    if (sameProxy) {
                        if (N === ++test.receiveCount) {
                            client.disconnect();
                            test.ok(sameProxy, 'testAddSubscribeN should receive the same proxy twice');
                            test.done();
                        }
                    }
                });
                // Publish a sample proxy description
                for (var i = 0; i < N; i++) {
                    client.proxy.add.publish(proxy);
                }
            }
        });
    }
};