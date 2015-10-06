
import AppDispatcher from '../dispatcher/AppDispatcher';
import AbstractStore from './AbstractStore';
import ActionTypes from '../constants/ActionTypes';
import ChatEvents from '../constants/ChatEvents';
import ServerEventsChannel from '../utils/ServerEventsChannel';
import assign from 'object-assign';

const UserActivityStore = new AbstractStore();

AppDispatcher.register(action => {
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

export default UserActivityStore;