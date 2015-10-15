
import React from 'react';
import { Router, Route, Link, IndexRoute } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'
import {Homepage, JoinMenu, CreateMenu, Menu} from './components/Homepage';
import ChatRoom from './components/ChatRoom';


export default
    <Router history={createBrowserHistory()}>
        <Route path="/" component={Homepage}>
            <IndexRoute component={Menu} />
            <Route path="/join(/:roomId)" component={JoinMenu} />
            <Route path="/create" component={CreateMenu} />
        </Route>
        <Route path="/room/:roomId" component={ChatRoom} />
    </Router>