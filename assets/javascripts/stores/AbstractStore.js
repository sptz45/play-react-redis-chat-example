
import {EventEmitter} from 'events';
import assign from 'object-assign';

export default class AbstractStore extends EventEmitter {

    constructor() {
        super();
        this.changeEventName = 'change';
    }

    emitChange() {
        this.emit(this.changeEventName);
    }

    addChangeListener(callback) {
        this.on(this.changeEventName, callback);
    }

    removeChangeListener(callback) {
        this.removeListener(this.changeEventName, callback);
    }
}