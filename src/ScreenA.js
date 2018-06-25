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
  Button,
  FlatList,
  Dimensions,
  TouchableOpacity
} from 'react-native';

import { createStackNavigator } from 'react-navigation';

const ITEM_WIDTH = Dimensions.get('window').width;

export default class  ScreenA extends Component<Props> {

  doMonthClick() {
    this.props.navigation.navigate('ScreenB');
  }

  renderItem({ item, index }) {
    return <TouchableOpacity  onPress={ () => this.doMonthClick() }>
              <View style={{
                  flex: 1,
                  margin: 5,
                  minWidth: 170,
                  maxWidth: 170,
                  height: 170,
                  maxHeight:170,
                  backgroundColor: '#CCC',
                }}  />
            </TouchableOpacity>
  }

  render() {

    return (<FlatList
          contentContainerStyle={styles.list}
          data={[{key: 'a'}, {key: 'b'},{key: 'c'},{key: 'd'}, {key: 'e'},{key: 'f'},{key: 'g'}, {key: 'h'},{key: 'i'},{key: 'j'}]}
          numColumns={2}
          renderItem={item => (
              <TouchableOpacity  onPress={ () => this.doMonthClick() }>
              <View style={{
                  flex: 1,
                  margin: 5,
                  minWidth: 170,
                  maxWidth: 170,
                  height: 170,
                  maxHeight:170,
                  backgroundColor: '#CCC',
                }}  />
            </TouchableOpacity>
            )}
    />);
  }
}

const styles = StyleSheet.create({
  list: {
    justifyContent: 'center',
    flexDirection: 'column',
  }
});