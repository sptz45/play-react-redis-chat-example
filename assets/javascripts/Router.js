
var React = require('react'),
    Homepage = require('./Homepage'),
    ChatRoom = require('./ChatRoom');

var Router = function(rootElement) {

    function render(component) {
        React.render(component, document.getElementById(rootElement));
    }

    function getRoomIdFromPath(path) {
        return path.substring(1);
    }

    function getPathFromRoomId(roomId) {
        return '/' + roomId;
    }

    return {

        navigateToHome: function(path) {
            var roomId = getRoomIdFromPath(path);
            render(<Homepage router={this} roomId={roomId}/>);
        },

        navigateToRoom: function(username, roomId) {
            render(<ChatRoom roomId={roomId} username={username}/>);
            var path = getPathFromRoomId(roomId);
            if (window.location.path !== path) {
                history.pushState({ roomId: roomId }, "My Chat", path);
            }
        }
    };
};

module.exports = Router;