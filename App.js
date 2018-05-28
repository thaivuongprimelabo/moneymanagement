/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {
  StackNavigator,
} from 'react-navigation';

import Login from './src/Login';
import Home from './src/Home';
import Test from './src/Test';
import Month from './src/Month';
import Action from './src/Action';
import Day from './src/Day';
import Settings from './src/Settings';
import Welcome from './src/Welcome';

const RootStack = StackNavigator(
  {
    Login: { screen: Login },
    Home: {screen: Home },
    Test: {screen: Test},
    Month: {screen: Month},
    Action: {screen: Action},
    Day: {screen: Day},
    Settings: {screen: Settings},
    Welcome: {screen: Welcome}
  },
  {
    initialRouteName: 'Welcome'
  }
);

export default class App extends Component<Props> {
  render() {
    return <RootStack />;
  }
}
