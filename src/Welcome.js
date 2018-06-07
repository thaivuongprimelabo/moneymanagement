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
  ActivityIndicator,
  Modal
} from 'react-native';

import Constants from './constants/Constants';
import Styles from './constants/Styles';
import CommonUtils from './utils/CommonUtils';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', createFromLocation: '~sqliteexample.db'});

export default class  Welcome extends Component<Props> {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);

    this.state = {
      'loading_text': 'Đang tải dữ liệu...0%'
    }
  }

  componentDidMount() {
    this.setState({
      'loading_text': 'Đang tải dữ liệu...10%'
    });
    var url = Constants.DEFAULT_SERVER + Constants.DEFAULT_SETTING_URI;
    fetch(url, {
      method: 'GET'
    })
    .then((response) => response.json())
    .then((responseJson) => {
        if(responseJson.code === 200) {

          this.setState({
            'loading_text': 'Đang tải dữ liệu...30%'
          });
          var json = JSON.parse(responseJson.data);

          var length = json.settings.length;
          var sql = '';
          for(var i = 0; i < length; i++) {
            var obj = json.settings[i];
            if(sql == '') {
              sql = 'INSERT INTO ' + Constants.SETTINGS_TBL + ' VALUES';
              sql += '(\"' + obj.key + '\",\"' + obj.value + '\")';
            } else {
              sql += ',(\"' + obj.key + '\",\"' + obj.value + '\")';
            }
          }

          this.setState({
            'loading_text': 'Đang tải dữ liệu...50%'
          });
          
          db.transaction((tx) => {
            tx.executeSql('DELETE FROM ' + Constants.SETTINGS_TBL, [], (tx, results) => {
                
            });

            if(sql !== '') {
              tx.executeSql(sql, [], (tx, results) => {
                
              });

              tx.executeSql('SELECT * FROM ' + Constants.SETTINGS_TBL, [], (tx, results) => {
                var len = results.rows.length;
                if(len > 0) {
                  this.setState({
                    'loading_text': 'Đang tải dữ liệu...100%'
                  });
                  this.navigateToLogin();
                }
              });
            }
          });
        }

    })
    .catch((error) =>{
      this.setState({
        'loading_text': 'Không thể kết nối đến server.Trạng thái offline.'
      });
      this.navigateToLogin();
    });
  }

  navigateToLogin() {
    var sql = 'SELECT id FROM ' + Constants.USERS_TBL;
    db.transaction((tx) => {
      tx.executeSql(sql, [], (tx, results) => {
        var len = results.rows.length;
        if(len > 0) {
          this.props.navigation.navigate('Home', {user_id : results.rows.item(0).id});
        } else {
          this.props.navigation.navigate('Login', {});
        }
      });
    });
  }

  render() {

    return (
        <View style={{ flex: 1, flexDirection:'column', backgroundColor: Constants.DEFAULT_COLOR, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{flexDirection:'row'}}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
          <View style={{flexDirection:'row'}}>
            <Text style={{ color:'#ffffff' }}>{ this.state.loading_text }</Text>
          </View>
        </View>
          
    );
  }
}