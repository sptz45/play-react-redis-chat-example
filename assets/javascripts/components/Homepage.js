
import '../../stylesheets/main.less';

import React from 'react';
import { Link } from 'react-router';
import { autobind } from 'core-decorators';
import ChatActions from '../actions/ChatActions';
import ChatStore from '../stores/ChatStore';


export const Menu = (props) => {
    return (<div>
        <h1>
            <small className="icon-left glyphicon glyphicon-comment" aria-hidden="true"></small>
            Welcome to mychat
        </h1>
        <p>Here you can create a chat room to chat with your friends and colleagues or join an existing chat room.</p>
        <p>
            <Link to="/join"className="btn btn-primary btn-lg" role="button">Join</Link>&nbsp;or&nbsp;
            <Link to="/create" className="btn btn-primary btn-lg" role="button">Create</Link>
        </p>
    </div>);
}


export class JoinMenu extends React.Component {

    @autobind
    handleSubmit(event) {
        event.preventDefault();
        var username = this.refs.username.value.trim();
        var roomId = this.refs.roomId.value.trim();
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
                            <input className="form-control" placeholder="e.g. 4928489" name="roomId" ref="roomId" defaultValue={this.props.params.roomId}/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">Your urername</label>
                            <input className="form-control" placeholder="e.g. spiros" name="username" ref="username"/>
                        </div>
                        <button type="submit" className="btn btn-primary">Join</button>&nbsp;or&nbsp;
                        <Link to="/">Cancel</Link>
                    </form>
                </div>
            </div>
        );
    }
}

export class CreateMenu extends React.Component {

    @autobind
    handleSubmit(event) {
        event.preventDefault();
        var username = this.refs.username.value.trim();
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
                        <Link to="/">Cancel</Link>
                    </form>
                </div>
            </div>
        );
    }
}

export class Homepage extends React.Component {

    componentDidMount() {
        ChatStore.addChangeListener(this._onChange);
    }

    componentWillUnmount() {
        ChatStore.removeChangeListener(this._onChange);
    }

    @autobind
    _onChange() {
        const roomId = ChatStore.getJoinedChatRoom();
        this.props.history.pushState({ roomId: roomId }, `/room/${roomId}`);
    }

    render() {
        return (
            <div>
                <div className="jumbotron">
                    {this.props.children}
                </div>
            </div>
        );
    }
}