
var React = require('react'),
    moment = require('moment'),
    classNames = require('classnames'),
    ChatActions = require('../actions/ChatActions'),
    UserActions = require('../actions/UserActions'),
    ChatStore = require('../stores/ChatStore'),
    UserActivityStore = require('../stores/UserActivityStore');

var UserList = React.createClass({

    propTypes: {
        users: React.PropTypes.array.isRequired,
        currentUser: React.PropTypes.string.isRequired
    },

    render: function() {
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
});

var MessageList = React.createClass({

    propTypes: {
        messages: React.PropTypes.array.isRequired
    },

    render: function() {
        var messageNodes = this.props.messages.map(function(msg) {
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
});

var ChatInput = React.createClass({

    propTypes: {
        onNewMessage: React.PropTypes.func.isRequired
    },

    onNewMessage: function(event) {
        event.preventDefault();
        var msg = this.refs.message.getDOMNode().value.trim();
        if (msg) {
            this.props.onNewMessage(msg);
            this.refs.message.getDOMNode().value = '';
        }
    },

    render: function() {
        return (
            <div>
                <form onSubmit={this.onNewMessage}>
                    <input ref="message" className="chatInput"/>
                    <button type="button" className="btn btn-large btn-primary">Send</button>
                </form>
            </div>
        );
    }
});

var ChatRoom = React.createClass({

    propTypes: {
        username: React.PropTypes.string.isRequired,
        roomId: React.PropTypes.string.isRequired
    },

    addMessage: function(message) {
        ChatActions.sendMessage(message);
    },

    userActivityTimestamp: new Date().getTime(),

    trackUserActivity: function(event) {
        this.userActivityTimestamp = new Date().getTime();
        if (this.state.userStatus !== 'online') {
            this.setState({ userStatus: 'online' });
            UserActions.trackActivity();
        }
    },

    scheduleActivityTracking: function() {
        var timeout = 30000; // 30 secs for interval, 60 secs for away timeout
        this.intervalHandle =  setInterval(function() {
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
    },

    getInitialState: function() {
        return { users: [], messages: [], userStatus: 'online' };
    },

    componentDidMount: function() {
        ChatStore.addChangeListener(this._onChange);
        this.scheduleActivityTracking();
    },

    componentWillUnmount: function() {
        ChatActions.closeChatRoom();
        ChatStore.removeChangeListener(this._onChange);
        clearTimeout(this.intervalHandle);
    },

    _onChange: function() {
        this.setState({
            users: ChatStore.getUsers(),
            messages: ChatStore.getMessages()
        });
    },

    render: function() {
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
});


module.exports = ChatRoom;
