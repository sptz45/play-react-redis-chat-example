
import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

export default {

    createChatRoom(firstUser) {
        AppDispatcher.dispatch({ actionType: ActionTypes.CHAT_CREATE_ROOM, firstUser });
    },

    joinChatRoom(username, chatRoom) {
        AppDispatcher.dispatch({ actionType: ActionTypes.CHAT_JOIN_ROOM, username, chatRoom });
    },

    closeChatRoom() {
        AppDispatcher.dispatch({ actionType: ActionTypes.CHAT_CLOSE });
    },

    sendMessage(message) {
        AppDispatcher.dispatch({ actionType: ActionTypes.CHAT_SEND_MESSAGE, message });
    }

};