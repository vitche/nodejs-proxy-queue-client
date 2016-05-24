var configuration = require('./configuration');
var onionRedisClient = require('nodejs-onion-redis-client');
module.exports = function (data) {
    var self = this;
    if (undefined != data) {
        self.configuration = data;
    }
    self.connect = function (callback) {
        function _connect() {
            self.publisher = new onionRedisClient(self.configuration.torProxyUri, self.configuration.onionRedisUri);
            self.publisher.connect(function (error) {
                if (undefined != error) {
                    callback(error);
                    return;
                }
                self.subscriber = new onionRedisClient(self.configuration.torProxyUri, self.configuration.onionRedisUri);
                self.subscriber.connect(function (error) {
                    if (undefined != error) {
                        callback(error);
                        return;
                    }
                    callback();
                });
            });
        }

        if (undefined == self.configuration) {
            // Load configuration and connect
            configuration.load(function (error, data) {
                if (undefined != error) {
                    callback(error);
                    return;
                }
                self.configuration = data;
                _connect();
            });
        } else {
            // Connect with the current configuration
            _connect();
        }
    };
    self.disconnect = function () {
        self.publisher.disconnect();
        self.subscriber.disconnect();
    };
    self.proxy = {
        add: {
            eventName: function () {
                return self.configuration.onionRedisSchema + '.proxy.add';
            },
            publish: function (value) {
                self.publisher.publish(self.proxy.add.eventName(), JSON.stringify(value));
            },
            subscribe: function (callback) {
                self.subscriber.on('message', function (message) {
                    self._filterEvent(message, self.proxy.add.eventName(), callback);
                });
                self.subscriber.subscribe(self.proxy.add.eventName());
            }
        },
        list: {
            eventName: function () {
                return self.configuration.onionRedisSchema + '.proxy.list'
            },
            publish: function (value) {
                self.publisher.publish(self.proxy.list.eventName(), JSON.stringify(value));
            },
            subscribe: function (callback) {
                self.subscriber.on(self.proxy.list.eventName(), function (message) {
                    self._filterEvent(message, self.proxy.list.eventName(), callback);
                });
                self.subscriber.subscribe(self.proxy.list.eventName());
            }
        }
    };
    self._filterEvent = function (message, eventName, callback) {
        if (message.channel == eventName) {
            callback(JSON.parse(message.message));
        }
    };
    return self;
};