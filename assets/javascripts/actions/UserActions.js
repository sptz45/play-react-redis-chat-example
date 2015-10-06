import AppDispatcher from '../dispatcher/AppDispatcher';
import ActionTypes from '../constants/ActionTypes';

export default {

    trackActivity() {
        AppDispatcher.dispatch({ actionType: ActionTypes.USER_ACTIVITY });
    },

    userWentAway(lastAccessTime) {
        AppDispatcher.dispatch({ actionType: ActionTypes.USER_WENT_AWAY, lastAccessTime });
    }
};