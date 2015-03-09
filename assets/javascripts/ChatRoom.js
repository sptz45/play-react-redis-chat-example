
var React = require('react'),
    moment = require('moment'),
    classNames = require('classnames');

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

var ServerChannel = function(roomId, username) {

    var socket = new WebSocket('ws://'+window.location.hostname+':'+window.location.port+'/chat/'+roomId+'/'+username);
    var callbacks = {};

    socket.onopen = function() {
        console.log('we are open');
    };

    socket.onerror = function(error) {
        console.log('An error occurred: '+ error);
    };

    socket.onmessage = function(msg) {
        var data = JSON.parse(msg.data);
        var callback = callbacks[data.event];
        if (callback) { callback(data); }
    };

    return {
        send: function(msg) {
            socket.send(JSON.stringify(msg));
        },
        setEventCallback: function(event, callback) {
            callbacks[event] = callback;
        },
        onReady: function(callback) {
            socket.onopen = callback;
        },
        close: function() {
            socket.close();
        }
    };
};

var serverChannel = null;


var ChatRoom = React.createClass({

    propTypes: {
        username: React.PropTypes.string.isRequired,
        roomId: React.PropTypes.string.isRequired
    },

    join: function() {
        var event = { event: 'JoinGroup' };
        serverChannel.send(event);
    },

    addMessage: function(message) {
        serverChannel.send({ event: 'SendMessage', message: message });
    },

    receiveMessages: function(newMessages) {
        var allMessages = this.state.messages.concat(newMessages);
        this.setState({ messages: allMessages });
    },

    receiveMembers: function(newMembers) {
        var otherUsers = this.state.users.filter(function(user) {
            for (var i = 0; i < newMembers.length; i++) {
                if (user.username === newMembers[i].username) {
                    return false;
                }
            }
            return true;
        });
        var allUsers = otherUsers.concat(newMembers);
        this.setState({ users: allUsers });
    },

    updateMemberStatus: function(updatedMember) {
        this.receiveMembers([updatedMember]);
    },

    userActivityTimestamp: new Date().getTime(),

    trackUserActivity: function(event) {
        this.userActivityTimestamp = new Date().getTime();
        if (this.state.userStatus !== 'online') {
            this.setState({ userStatus: 'online' });
            serverChannel.send({ event: 'UserActivity' });
        }
    },


    scheduleActivityTracking: function() {
        var timeout = 30000; // 30 secs for interval, 60 secs for away timeout
        this.intervalHandle =  setInterval(function() {
            var now = new Date().getTime();
            if (now - this.userActivityTimestamp > timeout) {
                if (this.state.userStatus === 'online') {
                    serverChannel.send({event: 'UserWentAway', lastAccessTime: this.userActivityTimestamp});
                    this.setState({ userStatus: 'away' });
                }
            } else {
                serverChannel.send({ event: 'UserActivity' });
            }
        }.bind(this), timeout);
    },

    getInitialState: function() {
        return { users: [], messages: [], userStatus: 'online' };
    },

    componentDidMount: function() {
        serverChannel = ServerChannel(this.props.roomId, this.props.username);
        serverChannel.setEventCallback('NewMessages', function(data) {
            this.receiveMessages(data.messages);
        }.bind(this));
        serverChannel.setEventCallback('NewMembers', function(data) {
            this.receiveMembers(data.members);
        }.bind(this));
        serverChannel.setEventCallback('MemberStatusUpdate', function(data) {
            this.updateMemberStatus(data.member);
        }.bind(this));
        serverChannel.onReady(this.join);
        this.scheduleActivityTracking();
    },

    componentWillUnmount: function() {
        serverChannel.close();
        clearTimeout(this.intervalHandle);
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
