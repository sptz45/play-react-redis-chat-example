
var React = require('react');
var Fetch = require('whatwg-fetch');

var Menu = React.createClass({

    propTypes: {
        onNavigate: React.PropTypes.func.isRequired
    },

    joinChat: function() {
        this.props.onNavigate('join');
    },

    createChat: function() {
       this.props.onNavigate('create');
    },

    render: function() {
        return (
            <p>
                <a className="btn btn-primary btn-lg" href="#" onClick={this.joinChat} role="button">Join</a>
                &nbsp;or&nbsp;
                <a className="btn btn-primary btn-lg" href="#" onClick={this.createChat} role="button">Create</a>
            </p>
        );
    }
});

var JoinMenu = React.createClass({

    propTypes: {
        router: React.PropTypes.object.isRequired,
        roomId: React.PropTypes.string.isRequired,
        onBack: React.PropTypes.func.isRequired
    },

    handleSubmit: function(event) {
        event.preventDefault();
        var username = this.refs.username.getDOMNode().value.trim();
        var roomId = this.refs.roomId.getDOMNode().value.trim();
        if (!username || !roomId) {
            return;
        }
        this.props.router.navigateToRoom(username, roomId)
    },

    render: function() {
        return(
            <div>
                <h1>
                    <small className="icon-left glyphicon glyphicon-comment" aria-hidden="true"></small>
                    Join a chat room
                </h1>
                <div className="form-box">
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="roomId">The ID of the chat room</label>
                            <input className="form-control" placeholder="e.g. 4928489" name="roomId" ref="roomId" defaultValue={this.props.roomId}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Your urername</label>
                            <input className="form-control" placeholder="e.g. spiros" name="username" ref="username"/>
                        </div>
                        <button type="submit" className="btn btn-primary">Join</button>
                        &nbsp;or&nbsp;
                        <a href="#" onClick={this.props.onBack}>Cancel</a>
                    </form>
                </div>
            </div>
        );
    }
});

var CreateMenu = React.createClass({

    propTypes: {
        router: React.PropTypes.object.isRequired,
        onBack: React.PropTypes.func.isRequired
    },

    handleSubmit: function(event) {
        event.preventDefault();
        var username = this.refs.username.getDOMNode().value.trim();
        if (!username) {
            return;
        }
        window.fetch('/create?username='+username, { method: 'post' })
            .then(function(response){ return response.json(); })
            .then(function(json) {
                this.props.router.navigateToRoom(username, json.roomId)
            }.bind(this));
    },

    render: function() {
        return(
            <div>
                <h1>
                    <small className="icon-left glyphicon glyphicon-comment" aria-hidden="true"></small>
                    Create a new chat room
                </h1>
                <div className="form-box">
                    <form onSubmit={this.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Your username</label>
                            <input className="form-control" ref="username" name="username" placeholder="e.g. spiros"/>
                        </div>
                        <button type="submit" className="btn btn-primary">Create &amp; Join</button>
                        &nbsp;or&nbsp;
                        <a href="#" onClick={this.props.onBack}>Cancel</a>
                    </form>
                </div>
            </div>
        );
    }
});

var Homepage = React.createClass({

    propTypes: {
        router: React.PropTypes.object.isRequired,
        roomId: React.PropTypes.string
    },

    getInitialState: function() {
        var action = this.props.roomId ? 'join' : 'welcome';
        return { action: action };
    },

    navigate: function(action) {
        this.setState({ action: action });
    },

    displayWelcomeMsg: function() {
        this.navigate('welcome');
    },

    render: function() {
        var component = (
            <div>
                <h1>
                    <small className="icon-left glyphicon glyphicon-comment" aria-hidden="true"></small>
                    Welcome to mychat
                </h1>
                <p>Here you can create a chat room to chat with your friends and colleagues or join an existing chat room.</p>
                <Menu onNavigate={this.navigate}/>
            </div>
        );
        if (this.state.action === 'join') {
            component = <JoinMenu router={this.props.router} onBack={this.displayWelcomeMsg} roomId={this.props.roomId}/>;
        } else if (this.state.action === 'create') {
            component = <CreateMenu router={this.props.router} onBack={this.displayWelcomeMsg}/>
        }

        return (
            <div>
                <div className="jumbotron">
                    {component}
                </div>
            </div>
        );
    }
});

module.exports = Homepage;