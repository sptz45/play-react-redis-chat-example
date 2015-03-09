
var AppDispatcher = require('../dispatcher/AppDispatcher'),
    AbstractStore = require('./AbstractStore'),
    assign = require('object-assign'),
    ActionTypes = require('../constants/ActionTypes'),
    ChatEvents = require('../constants/ChatEvents'),
    Fetch = require('whatwg-fetch'),
    ServerEventsChannel = require('../utils/ServerEventsChannel');

var data = {
    currentUser: null,
    joinedChatRoom: null,
    messages: [],
    users: []
};

function getServerChannelUrl() {
    var location = window.location;
    return 'ws://'+location.hostname+':'+location.port+'/chat/'+data.joinedChatRoom+'/'+data.currentUser;
}

function createChatRoom(firstUser) {
    return window.fetch('/create?username='+firstUser, { method: 'post' })
        .then(function(response){ return response.json(); })
        .then(function(json) {
            return { username: firstUser, chatRoom: json.roomId };
        });
}

function joinChatRoom(username, chatRoom) {
    data.currentUser = username;
    data.joinedChatRoom = chatRoom;

    ServerEventsChannel.connectTo(getServerChannelUrl());
    ServerEventsChannel.receiveEventsWith(function(event) {
        switch (event.event) {
            case ChatEvents.NEW_MESSAGES:
                data.messages = data.messages.concat(event.messages);
                ChatStore.emitChange();
                break;
            case ChatEvents.NEW_MEMBERS:
                receiveMembers(event.members);
                ChatStore.emitChange();
                break;
            case ChatEvents.MEMBER_STATUS_UPDATE:
                receiveMembers([event.member]);
                ChatStore.emitChange();
                break;
            default:
            // no-op
        }
    });
    ServerEventsChannel.onReady(function() {
        ServerEventsChannel.sendEvent(ChatEvents.JOIN_GROUP);
    });
}

function receiveMembers(newMembers) {
    var otherUsers = data.users.filter(function(user) {
        for (var i = 0; i < newMembers.length; i++) {
            if (user.username === newMembers[i].username) {
                return false;
            }
        }
        return true;
    });
    data.users = otherUsers.concat(newMembers);
}

var ChatStore = assign({}, AbstractStore, {

    getCurrentUser: function() {
        return data.currentUser;
    },

    getJoinedChatRoom: function() {
        return data.joinedChatRoom;
    },

    getMessages: function() {
        return data.messages;
    },

    getUsers: function() {
        return data.users;
    }
});

AppDispatcher.register(function(action) {
    switch (action.actionType) {
        case ActionTypes.CHAT_CREATE_ROOM:
            createChatRoom(action.firstUser)
                .then(function(r) {
                    joinChatRoom(r.username, r.chatRoom);
                    ChatStore.emitChange();
                });
            break;
        case ActionTypes.CHAT_JOIN_ROOM:
            joinChatRoom(action.username, action.chatRoom);
            ChatStore.emitChange();
            break;
        case ActionTypes.CHAT_SEND_MESSAGE:
            ServerEventsChannel.sendEvent(ChatEvents.SEND_MESSAGE, { message: action.message });
            break;
        case ActionTypes.CHAT_CLOSE:
            ServerEventsChannel.close();
            break;
        default:
        // no-op
    }
});


module.exports = ChatStore;