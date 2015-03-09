var AppDispatcher = require('../dispatcher/AppDispatcher'),
    ActionTypes = require('../constants/ActionTypes');

var UserActions = {

    trackActivity: function() {
        AppDispatcher.dispatch({ actionType: ActionTypes.USER_ACTIVITY });
    },

    userWentAway: function(lastAccessTime) {
        AppDispatcher.dispatch({
            actionType: ActionTypes.USER_WENT_AWAY,
            lastAccessTime: lastAccessTime
        });
    }
};

module.exports = UserActions;