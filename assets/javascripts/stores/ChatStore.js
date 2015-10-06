
import AppDispatcher from '../dispatcher/AppDispatcher';
import AbstractStore from './AbstractStore';
import assign from 'object-assign';
import ActionTypes from '../constants/ActionTypes';
import ChatEvents from '../constants/ChatEvents';
import Fetch from 'whatwg-fetch';
import ServerEventsChannel from '../utils/ServerEventsChannel';

var data = {
    currentUser: null,
    joinedChatRoom: null,
    messages: [],
    users: []
};

function getServerChannelUrl() {
    var location = window.location;
    return `ws://${location.hostname}:${location.port}/chat/${data.joinedChatRoom}/${data.currentUser}`;
}

function createChatRoom(firstUser) {
    return window.fetch('/create?username='+firstUser, { method: 'post' })
        .then(response => response.json())
        .then(json => ({ username: firstUser, chatRoom: json.roomId }));
}

function joinChatRoom(username, chatRoom) {
    data.currentUser = username;
    data.joinedChatRoom = chatRoom;

    ServerEventsChannel.connectTo(getServerChannelUrl());
    ServerEventsChannel.receiveEventsWith(function(event) {
        switch (event.event) {
            case ChatEvents.NEW_MESSAGES:
                data.messages = data.messages.concat(event.messages);
                chatStore.emitChange();
                break;
            case ChatEvents.NEW_MEMBERS:
                receiveMembers(event.members);
                chatStore.emitChange();
                break;
            case ChatEvents.MEMBER_STATUS_UPDATE:
                receiveMembers([event.member]);
                chatStore.emitChange();
                break;
            default:
            // no-op
        }
    });
    ServerEventsChannel.onReady(() => ServerEventsChannel.sendEvent(ChatEvents.JOIN_GROUP));
}

function receiveMembers(newMembers) {
    var otherUsers = data.users.filter(user => {
        for (var i = 0; i < newMembers.length; i++) {
            if (user.username === newMembers[i].username) {
                return false;
            }
        }
        return true;
    });
    data.users = otherUsers.concat(newMembers);
}

class ChatStore extends AbstractStore {

    getCurrentUser() {
        return data.currentUser;
    }

    getJoinedChatRoom() {
        return data.joinedChatRoom;
    }

    getMessages() {
        return data.messages;
    }

    getUsers() {
        return data.users;
    }
}

AppDispatcher.register((action) => {
    switch (action.actionType) {
        case ActionTypes.CHAT_CREATE_ROOM:
            createChatRoom(action.firstUser)
                .then(r => {
                    joinChatRoom(r.username, r.chatRoom);
                    chatStore.emitChange();
                });
            break;
        case ActionTypes.CHAT_JOIN_ROOM:
            joinChatRoom(action.username, action.chatRoom);
            chatStore.emitChange();
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

let chatStore = new ChatStore();

export default chatStore;