
import '../../stylesheets/main.less';

import React from 'react';
import ChatActions from '../actions/ChatActions';
import ChatStore from '../stores/ChatStore';


class Menu extends React.Component {

    static propTypes = { onNavigate: React.PropTypes.func.isRequired };

    joinChat() {
        this.props.onNavigate('join');
    }

    createChat() {
        this.props.onNavigate('create');
    }

    render() {
        return (
            <p>
                <a className="btn btn-primary btn-lg" href="#" onClick={this.joinChat.bind(this)} role="button">Join</a>&nbsp;or&nbsp;
                <a className="btn btn-primary btn-lg" href="#" onClick={this.createChat.bind(this)} role="button">Create</a>
            </p>
        );
    }
}

class JoinMenu extends React.Component {

    static propTypes = {
        roomId: React.PropTypes.string.isRequired,
        onBack: React.PropTypes.func.isRequired
    };

    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        var username = this.refs.username.getDOMNode().value.trim();
        var roomId = this.refs.roomId.getDOMNode().value.trim();
        if (!username || !roomId) {
            return;
        }
        ChatActions.joinChatRoom(username, roomId);
    }

    render() {
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
                        <button type="submit" className="btn btn-primary">Join</button>&nbsp;or&nbsp;
                        <a href="#" onClick={this.props.onBack}>Cancel</a>
                    </form>
                </div>
            </div>
        );
    }
}

class CreateMenu extends React.Component {

    static propTypes = { onBack: React.PropTypes.func.isRequired };

    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        var username = this.refs.username.getDOMNode().value.trim();
        if (!username) {
            return;
        }
        ChatActions.createChatRoom(username);
    }

    render() {
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
                        <button type="submit" className="btn btn-primary">Create &amp; Join</button>&nbsp;or&nbsp;
                        <a href="#" onClick={this.props.onBack}>Cancel</a>
                    </form>
                </div>
            </div>
        );
    }
}

class Homepage extends React.Component {

    static propTypes = {
        router: React.PropTypes.object.isRequired,
        roomId: React.PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = { action: this.props.roomId ? 'join' : 'welcome' };
        this._onChange = this._onChange.bind(this);
    }

    navigate(action) {
        this.setState({ action: action });
    }

    displayWelcomeMsg() {
        this.navigate('welcome');
    }

    componentDidMount() {
        ChatStore.addChangeListener(this._onChange);
    }

    componentWillUnmount() {
        ChatStore.removeChangeListener(this._onChange);
    }

    _onChange() {
        this.props.router.navigateToRoom(ChatStore.getCurrentUser(), ChatStore.getJoinedChatRoom());
    }

    render() {
        var component = (
            <div>
                <h1>
                    <small className="icon-left glyphicon glyphicon-comment" aria-hidden="true"></small>
                    Welcome to mychat
                </h1>
                <p>Here you can create a chat room to chat with your friends and colleagues or join an existing chat room.</p>
                <Menu onNavigate={this.navigate.bind(this)}/>
            </div>
        );
        if (this.state.action === 'join') {
            component = <JoinMenu router={this.props.router} onBack={this.displayWelcomeMsg.bind(this)} roomId={this.props.roomId}/>;
        } else if (this.state.action === 'create') {
            component = <CreateMenu router={this.props.router} onBack={this.displayWelcomeMsg.bind(this)}/>
        }

        return (
            <div>
                <div className="jumbotron">
                    {component}
                </div>
            </div>
        );
    }
}

export default Homepage;