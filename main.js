var q = require('q');
var configuration = require('./configuration');
var onionRedisClient = require('nodejs-onion-redis-client');
module.exports = function (data) {
    var self = this;
    if (undefined != data) {
        self.configuration = data;
    }
    self.connect = function (callback) {
        function _connect() {
            var connectPromises = [];
            // Publisher connect promise
            connectPromises.push(q.Promise(function (resolve, reject) {
                self.publisher = new onionRedisClient(self.configuration.onionRedisUri, self.configuration.torProxyUri);
                self.publisher.connect(function (error) {
                    if (undefined != error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            }));
            // Subscriber connect promise
            connectPromises.push(q.Promise(function (resolve, reject) {
                self.subscriber = new onionRedisClient(self.configuration.onionRedisUri, self.configuration.torProxyUri);
                self.subscriber.connect(function (error) {
                    if (undefined != error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            }));
            q.all(connectPromises)
                .then(function () {
                    callback();
                })
                .catch(function (error) {
                    callback(error)
                })
                .done();
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
    self._buildOperationDefinition = function (entityName, operationName) {
        return {
            publish: function (value) {
                self.publisher.publish(self[entityName][operationName]._eventName(), JSON.stringify(value));
            },
            publishStatus: function (value) {
                self.publisher.publish(self[entityName][operationName]._statusName(), JSON.stringify(value));
            },
            subscribe: function (callback) {
                self.subscriber.on('message', function (message) {
                    self._filterEvent(message, self[entityName][operationName]._eventName(), callback);
                });
                self.subscriber.subscribe(self[entityName][operationName]._eventName());
            },
            _eventName: function () {
                return self.configuration.onionRedisSchema + '.' + entityName + '.' + operationName;
            },
            _statusName: function () {
                return self.configuration.onionRedisSchema + '.' + entityName + '.' + operationName + '.status';
            }
        };
    };
    self._filterEvent = function (message, eventName, callback) {
        if (message.channel == eventName) {
            try {
                var response = JSON.parse(message.message);
                callback(undefined, response);
            } catch (error) {
                callback(error);
            }
        }
    };
    self.proxy = {
        add: self._buildOperationDefinition("proxy", "add"),
        list: self._buildOperationDefinition("proxy", "list")
    };
    return self;
};
