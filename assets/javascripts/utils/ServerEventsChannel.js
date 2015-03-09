
var assign = require('object-assign');

var ServerEventsChannel = function() {

    var socket = null;
    var _callback = function(){};

    function init() {
        socket.onopen = function () {
            console.log('we are open');
        };
        socket.onerror = function (error) {
            console.log('An error occurred: ' + error);
        };
        socket.onmessage = function (msg) {
            var data = JSON.parse(msg.data);
            _callback(data);
        };
    }

    return {

        connectTo: function(url) {
            socket = new WebSocket(url);
            init();
        },

        sendEvent: function(event, data) {
            var msg = assign({ event: event }, data);
            socket.send(JSON.stringify(msg));
        },

        receiveEventsWith: function(callback) {
            _callback = callback;
        },

        onReady: function(callback) {
            socket.onopen = callback;
        },

        close: function() {
            socket.close();
        }
    };
};

module.exports = ServerEventsChannel();