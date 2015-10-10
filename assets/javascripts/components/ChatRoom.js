
import React from "react";
import moment from 'moment';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import ChatActions from '../actions/ChatActions';
import UserActions from '../actions/UserActions';
import ChatStore from '../stores/ChatStore';
import UserActivityStore from '../stores/UserActivityStore';

class UserList extends React.Component {

    static propTypes = {
        users: React.PropTypes.array.isRequired,
        currentUser: React.PropTypes.string.isRequired
    };

    render() {
        var userNodes = this.props.users.map(function(user) {
            var classes = classNames('user-' + user.status, {'currentUser': this.props.currentUser === user.username});
            if (user.status === 'online') {
                return <li className={classes} key={user.username}>{user.username}</li>;
            } else {
                return (
                    <li className={classes} key={user.username}>
                       {user.username} <small>({user.status} since: {moment(user.lastActive).fromNow()})</small>
                    </li>
                );
            }
        }.bind(this));
        return (
            <div className="userList">
                <ul>
                    {userNodes}
                </ul>
            </div>
        );
    }
}

class MessageList extends React.Component {

    static propTypes = { messages: React.PropTypes.array.isRequired };

    render() {
        var messageNodes = this.props.messages.map(msg => {
            return (
                <li key={msg.timestamp}>
                    <b>{msg.user}</b>&nbsp;
                    <i>({moment(msg.timestamp).fromNow()})</i>:&nbsp;
                    {msg.message}
                </li>
            );
        });
        return (
            <div className="messageList">
                <ul>
                    {messageNodes}
                </ul>
            </div>
        );
    }
}

class ChatInput extends React.Component {

    static propTypes = { onNewMessage: React.PropTypes.func.isRequired };

    constructor() {
        super();
    }

    @autobind
    onNewMessage(event) {
        event.preventDefault();
        var msg = this.refs.message.value.trim();
        if (msg) {
            this.props.onNewMessage(msg);
            this.refs.message.value = '';
        }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.onNewMessage}>
                    <input ref="message" className="chatInput"/>
                    <button type="button" className="btn btn-large btn-primary">Send</button>
                </form>
            </div>
        );
    }
}

class ChatRoom extends React.Component {

    static propTypes = {
        username: React.PropTypes.string.isRequired,
        roomId: React.PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        this.userActivityTimestamp = new Date().getTime();
        this.state = { users: [], messages: [], userStatus: 'online' };
    }

    @autobind
    addMessage(message) {
        ChatActions.sendMessage(message);
    }

    @autobind
    trackUserActivity(event) {
        this.userActivityTimestamp = new Date().getTime();
        if (this.state.userStatus !== 'online') {
            this.setState({ userStatus: 'online' });
            UserActions.trackActivity();
        }
    }

    scheduleActivityTracking() {
        var timeout = 30000; // 30 secs for interval, 60 secs for away timeout
        this.intervalHandle =  setInterval(() => {
            var now = new Date().getTime();
            if (now - this.userActivityTimestamp > timeout) {
                if (this.state.userStatus === 'online') {
                    UserActions.userWentAway(this.userActivityTimestamp);
                    this.setState({ userStatus: 'away' });

                }
            } else {
                UserActions.trackActivity();
            }
        }.bind(this), timeout);
    }

    componentDidMount() {
        ChatStore.addChangeListener(this._onChange);
        this.scheduleActivityTracking();
    }

    componentWillUnmount() {
        ChatActions.closeChatRoom();
        ChatStore.removeChangeListener(this._onChange);
        clearTimeout(this.intervalHandle);
    }

    @autobind
    _onChange() {
        this.setState({
            users: ChatStore.getUsers(),
            messages: ChatStore.getMessages()
        });
    }

    render() {
        return (
            <div className="row" onMouseMove={this.trackUserActivity} onKeyPress={this.trackUserActivity}>
                <div className="row chatRoomHeader">
                    <div className="col-md-12">
                        <h1>Chat room {this.props.roomId}</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        <div className="row">
                            <div className="col-md-12">
                                <MessageList messages={this.state.messages}/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <ChatInput onNewMessage={this.addMessage}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <UserList users={this.state.users} currentUser={this.props.username}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default ChatRoom;
