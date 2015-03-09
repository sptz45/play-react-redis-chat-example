
var EventEmitter = require('events').EventEmitter,
    assign = require('object-assign');

var AbstractStore = assign({}, EventEmitter.prototype, {

    changeEventName: 'change',

    emitChange: function() {
        this.emit(this.changeEventName);
    },

    addChangeListener: function(callback) {
        this.on(this.changeEventName, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(this.changeEventName, callback);
    }
});

module.exports = AbstractStore;