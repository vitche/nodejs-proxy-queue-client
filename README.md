# Node.js Proxy Queue Client
Proxy Queue Client is a solution providing proxy infrastructure integration event model working over Onion Redis servers
through TOR.

## Message Queue API
The following operations are supported:
 - proxy.add.publish - publish information about a new proxy to be added to the system;
 - proxy.add.subscribe - subscribe to information about a new proxy which was added to the system.

The following proxy types are supported:
 - HTTP proxy, type equals 1;
 - HTTPS proxy, type equals 2;
 - SOCKS5 proxy, type equals 3.
 
The following proxy description format is used:
```sh
var proxy = {
    ipv4: '127.0.0.1',
    port: 9050,
    type: 3
};
```

## Sample Code
To publish a new proxy server description:
```sh
var client = new proxyQueueClient();
client.connect(function (publisherError) {
    test.ok(undefined == publisherError, 'testAddPublish should connect to Onion Redis');
    var proxy = {
        ipv4: '127.0.0.1',
        port: 9050,
        type: 3
    };
    client.proxy.add.publish(proxy);
    client.disconnect();
    test.done();
});
```

To subscribe to newly published proxy descriptions:
```sh
var client = new proxyQueueClient();
client.connect(function (publisherError) {
    test.ok(undefined == publisherError, 'testAddSubscribe should connect to Onion Redis');
    // Sample proxy record
    var proxy = {
        ipv4: '127.0.0.1',
        port: 9050,
        type: 3
    };
    // Subscribe to the "proxy.add" event
    client.proxy.add.subscribe(function (value) {
        var sameProxy = JSON.stringify(proxy) == JSON.stringify(value);
        if (sameProxy) {
            client.disconnect();
            test.ok(sameProxy, 'testAddSubscribe should receive the same proxy');
            test.done();
        }
    });
    // Publish a sample proxy description
    client.proxy.add.publish(proxy);
});
```
