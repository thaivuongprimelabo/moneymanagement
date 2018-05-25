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
  TextInput,
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Keyboard,
  Picker,
  Image,
  Modal
} from 'react-native';

import Constants from './constants/Constants';
import Styles from './constants/Styles';
import GridView from 'react-native-super-grid';
import CommonUtils from './utils/CommonUtils';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', location: '~sqliteexample.db'});

export default class  AddType extends Component<Props> {


  constructor(props) {
    super(props);
    this.doRegisterType = this.doRegisterType.bind(this);
    this.doClearType = this.doClearType.bind(this);
    this.state = {
      type_name: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      icon: {
        value : Constants.EMPTY,
        style : Styles.inputText
      }
    };
  }

  onChange(text, type) {
    if(type === 0) {
      this.setState({
        type_input: {
          value : text,
          style : Styles.inputText
        }
      });
    }

    if(type === 1) {
      this.setState({
        icon: {
          value : text,
          style : Styles.inputText
        }
      });
    }
    
  }

  doRegisterType() {
    let name = this.state.type_name.value;
    let color = Constants.DEFAULT_COLOR;
    let icon = this.state.icon.value;
    let sql = 'INSERT INTO types(value,"' + name + '","' + color + '",icon) VALUES()';
    db.transaction((tx) => {
        tx.executeSql(sql, [], (tx, results) => {
        });
    });
  }

  doClearType() {
    this.props.closeTypeModal(false);
  }

  render() {

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={Styles.addTypeContainer}>
            <View style={{flexDirection:'row'}}>
              <TextInput
                underlineColorAndroid='transparent'
                style={this.state.type_name.style}
                value={this.state.type_name.value}
                onChangeText={ (text) => this.onChange(text, 0) }
                placeholder="Tên loại hoạt động"
              />
            </View>
            <View style={{flexDirection:'row'}}>
              <TextInput
                underlineColorAndroid='transparent'
                style={this.state.icon.style}
                value={this.state.icon.value}
                onChangeText={ (text) => this.onChange(text, 1) }
                placeholder="Url icon"
              />
            </View>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:0.35, marginTop:10, marginRight:5 }} >
                <Button
                onPress={this.doRegisterType}
                title={ Constants.REGISTER_BTN }
                color={ Constants.DEFAULT_COLOR }
                accessibilityLabel="Learn more about this purple button"
                />
              </View>
              <View style={{flex:0.35, marginTop:10 }} >
                <Button
                onPress={this.doClearType}
                title="Hủy"
                color={ Constants.DEFAULT_COLOR }
                accessibilityLabel="Learn more about this purple button"
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
    );
  }
}