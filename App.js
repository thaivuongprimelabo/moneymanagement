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
  createStackNavigator,
} from 'react-navigation';

import Login from './src/Login';
import Home from './src/Home';
import Test from './src/Test';
import Month from './src/Month';
import Action from './src/Action';
import ActionModal from './src/ActionModal';
import Day from './src/Day';
import Settings from './src/Settings';
import Welcome from './src/Welcome';
import ScreenA from './src/ScreenA';
import ScreenB from './src/ScreenB';

class App extends Component<Props> {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
      </View>
    );
  }
}

export default createStackNavigator(
  {
    Login: { screen: Login },
    Home: {screen: Home },
    Test: {screen: Test},
    Month: {screen: Month},
    Action: {screen: Action},
    Day: {screen: Day},
    Settings: {screen: Settings},
    Welcome: {screen: Welcome},
    ScreenA: {screen: ScreenA},
    ScreenB: {screen: ScreenB},
    ActionModal: {screen: ActionModal},
  },
  {
    initialRouteName: 'Welcome'
  }
);
