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
  View,
  Button
} from 'react-native';

import { createStackNavigator } from 'react-navigation';

export default class  ScreenB extends Component<Props> {

  render() {

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Screen B</Text>
          <Button
            title="Go to Details"
            onPress={() => this.props.navigation.goBack()}
          />
        </View>
    );
  }
}