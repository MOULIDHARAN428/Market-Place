import React, { Component } from 'react';
// import Header from './HeaderComponent';
// import Home from './HomeComponent'
// import Footer from './FooterComponent';
import Post from './PostComponent';
import { Switch, Route, Redirect } from 'react-router-dom';

class Main extends Component {

    render(){
        return (
            <div>
                {/* <Header /> */}
                    <Switch>
                        {/* <Route path="/home" component={ Home } /> */}
                        <Route path="/post" component={ Post } />
                        
                        <Redirect to="/home" />

                    </Switch>
                {/* <Footer /> */}
            </div>
        );
    }
}
export default Main;
