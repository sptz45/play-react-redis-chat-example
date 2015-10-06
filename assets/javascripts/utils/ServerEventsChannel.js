
import assign from 'object-assign';

class ServerEventChannel {

    constructor() {
        this.socket = null;
        this.callback = function(){};
    }

    connectTo(url) {
        this.socket = new WebSocket(url);
        this.socket.onopen = () => console.log('we are open');
        this.socket.onerror = (error) => console.log('An error occurred: ' + error);
        this.socket.onmessage = (msg) => this.callback(JSON.parse(msg.data));
    }

    sendEvent(event, data) {
        let msg = assign({ event: event }, data);
        this.socket.send(JSON.stringify(msg));
    }

    receiveEventsWith(callback) {
        this.callback = callback;
    }

    onReady(callback) {
        this.socket.onopen = callback;
    }

    close() {
        this.socket.close();
    }
}

export default new ServerEventChannel();
