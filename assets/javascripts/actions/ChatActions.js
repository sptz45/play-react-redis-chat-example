
var AppDispatcher = require('../dispatcher/AppDispatcher'),
    ActionTypes = require('../constants/ActionTypes');

var ChatActions = {

    createChatRoom: function(firstUser) {
        AppDispatcher.dispatch({
            actionType: ActionTypes.CHAT_CREATE_ROOM,
            firstUser: firstUser
        });
    },

    joinChatRoom: function(username, chatRoom) {
        AppDispatcher.dispatch({
            actionType: ActionTypes.CHAT_JOIN_ROOM,
            username: username,
            chatRoom: chatRoom
        });
    },

    closeChatRoom: function() {
        AppDispatcher.dispatch({ actionType: ActionTypes.CHAT_CLOSE });
    },

    sendMessage: function(message) {
        AppDispatcher.dispatch({
            actionType: ActionTypes.CHAT_SEND_MESSAGE,
            message: message
        });
    }

};

module.exports = ChatActions;