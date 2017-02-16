/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Image,
  TouchableOpacity
} from 'react-native';

import { Container, Content, ListItem, Card, Spinner, Header, Left, Right, Body, Title, CardItem, H1, H2, H3, Thumbnail, Text, Button, Icon } from 'native-base';

var PushNotification = require('react-native-push-notification');

class Event extends React.Component {
  constructor(props) {
    super(props);
    this.state = {fullText: false};
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    console.log("Old : ");
    console.log(this.state);
    this.setState((prevState) => ({
      fullText: !prevState.fullText
    }));
    console.log("New : ");
    console.log(this.state);
  }
  render() {
    var description = this.state.fullText?this.props.longdesc:this.props.shortdesc;
    return (            
          <Card style={styles.card}>
                <CardItem header>
                    <H2>{this.props.cleanTitle} </H2>
                </CardItem>
                <CardItem>
                        <Text note>{this.props.date} &bull; {this.props.location}</Text>
                </CardItem>
                <CardItem>
                  <TouchableOpacity onPress={this.handleClick}>
                  <Text>
                    {description}
                  </Text>
                  </TouchableOpacity>
                </CardItem>
          </Card>
        )
  }
}


export default class SliceLocator extends Component {
  constructor(props) {
    super(props);
    this.state = {movies: undefined};
  }

  componentDidMount() {
    fetch('http://gharbi.me/slicelocator/events.js')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({movies: responseJson});



        PushNotification.configure({

            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function(token) {
                console.log( 'TOKEN:', token );
            },

            // (required) Called when a remote or local notification is opened or received
            onNotification: function(notification) {
                console.log( 'NOTIFICATION:', notification );
            },

            // IOS ONLY (optional): default: all - Permissions to register.
            permissions: {
                alert: true,
                badge: true,
                sound: true
            },

            // Should the initial notification be popped automatically
            // default: true
            popInitialNotification: true,

            /**
              * (optional) default: true
              * - Specified if permissions (ios) and token (android and ios) will requested or not,
              * - if not, you must call PushNotificationsHandler.requestPermissions() later
              */
            requestPermissions: true,
        });

        PushNotification.cancelAllLocalNotifications();

        for(var key in this.state.movies){

          PushNotification.localNotificationSchedule({
            message: "Wanna save a swipe? An event with free pizza is nearby : " +  this.state.movies[key].title + " !", // (required)
            date: new Date(parseInt(this.state.movies[key].date) * 1000 - 15*60*1000)
          });
        }
      }).catch(function(error) {
        console.log('There has been a problem with the fetch operation: ' + error.message);
       // ADD THIS THROW error
        throw error;

      });
    
  }

  unixToDate(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  render() {
    var header = (
        <Header>
            <Left>
                <Image style={{ height: 35, width:35, marginLeft:10}} resizeMode='contain' source={require('./img/logo.png')} />
            </Left>
            <Body>
                <Title>SliceLocator</Title>
            </Body>
            <Right />
        </Header>
    );
    if ( !this.state.movies ) {
      return (
          <Container style={styles.container}>
          {header}
            <Content>
              <Spinner color='blue' />
            </Content>
          </Container>
      );
    }
    var events = [];
    for(var key in this.state.movies){
      var date = this.unixToDate(this.state.movies[key].date);
      var cleanTitle = this.state.movies[key].title.replace(/&amp;/g, '&');
      var shortdesc = this.state.movies[key].description.substring(0, 200) + "...";
      events.push(
          <ListItem style={styles.listItem}>
            <Event date={date} cleanTitle={cleanTitle} location={this.state.movies[key].location} shortdesc={shortdesc} longdesc={this.state.movies[key].description}></Event>
          </ListItem>
      );
    }

    return (
            <Container style={styles.container}>
                {header}
                <Content>
                    {events}
                </Content>
            </Container>

    );
  }
}

const styles = {
    listItem: {
      borderBottomWidth: 0,
    },
    card: {

    },
	container: {
		backgroundColor: '#F5F5F5',
	},
};

AppRegistry.registerComponent('SliceLocator', () => SliceLocator);