
import React from 'react';
import Homepage from './components/Homepage';
import ChatRoom from './components/ChatRoom';

export default function(rootElement) {

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

        navigateToHome(path) {
            let roomId = getRoomIdFromPath(path);
            render(<Homepage router={this} roomId={roomId}/>);
        },

        navigateToRoom(username, roomId) {
            render(<ChatRoom roomId={roomId} username={username}/>);
            let path = getPathFromRoomId(roomId);
            if (window.location.path !== path) {
                history.pushState({ roomId: roomId }, "My Chat", path);
            }
        }
    };
};