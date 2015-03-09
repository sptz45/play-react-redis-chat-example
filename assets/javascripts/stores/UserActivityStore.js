
var AppDispatcher = require('../dispatcher/AppDispatcher'),
    AbstractStore = require('./AbstractStore'),
    ActionTypes = require('../constants/ActionTypes'),
    ChatEvents = require('../constants/ChatEvents'),
    ServerEventsChannel = require('../utils/ServerEventsChannel'),
    assign = require('object-assign');

var UserActivityStore = assign({}, AbstractStore, { });

AppDispatcher.register(function(action) {
    switch (action.actionType) {
        case ActionTypes.USER_ACTIVITY:
            ServerEventsChannel.sendEvent(ChatEvents.USER_ACTIVITY);
            break;
        case ActionTypes.USER_WENT_AWAY:
            ServerEventsChannel.sendEvent(ChatEvents.USER_WENT_AWAY, { lastAccessTime: action.lastAccessTime });
            break;
        default:
        // no-op
    }
});

module.exports = UserActivityStore;