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
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Image,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';

import ActionSheet from 'react-native-actionsheet';

import Constants from './constants/Constants';
import Styles from './constants/Styles';
import GridView from 'react-native-super-grid';
import Loading from './Loading';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', createFromLocation: '~sqliteexample.db'});

export default class  Home extends Component<Props> {

  

  constructor(props) {
    super(props);
    this.backupData = this.backupData.bind(this);
    this.setLoadingVisible = this.setLoadingVisible.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.state = {
      loading: false
    }

    
  }

  componentDidMount() {
    this.props.navigation.setParams({ handleSave: this.showActionSheet });
  }

  backupData() {
    var output = {types: [], actions: []};

    db.transaction((tx) => {
        tx.executeSql('SELECT * FROM ' + Constants.ACTIONS_TBL, [], (tx, results) => {
            var len = results.rows.length;
            
            for(var i = 0; i < len; i++) {
              var obj = {id: results.rows.item(i).id, name : results.rows.item(i).name, cost: results.rows.item(i).cost, time: results.rows.item(i).time, location: results.rows.item(i).location, create_at: results.rows.item(i).create_at, comment: results.rows.item(i).comment, type_id: results.rows.item(i).type_id };
              output.actions.push(obj);
            }

            
        });
    });


    db.transaction((tx) => {
        tx.executeSql('SELECT * FROM ' + Constants.TYPES_TBL, [], (tx, results) => {
            var len = results.rows.length;
            for(var i = 0; i < len; i++) {
              var obj = {id: results.rows.item(i).id, value : results.rows.item(i).value, name: results.rows.item(i).name, color: results.rows.item(i).color, icon: '' };
              output.types.push(obj);
            }

            this.postToBackup(output);
        });
    });

    
    

  }

  postToBackup(data) {
    this.setLoadingVisible(true);
    fetch('http://d7e21f64.ngrok.io/api/backup', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: data}),
    })
    .then((response) => response.json())
    .then((responseJson) => {
        if(responseJson.code === 200) {
          this.setLoadingVisible(false);
          Alert.alert(Constants.ALERT_INFO, Constants.BACKUP_SUCCESS);
        }

    })
    .catch((error) =>{
      alert('error:' + error);
    });
  }

  setLoadingVisible(visible) {
    this.setState({loading: visible});
  }

  showActionSheet() {
    this.ActionSheet.show();
  }

  doMonthClick(month, color) {
    this.props.navigation.navigate('Month', {month: month, year: this.state.year, color: color});
  }

  onClickOption(index) {
    if(index === 0) {
      this.backupData();
    }
  }

  render() {

    return (
        <View style={{ flex:1 }}>
          { this.props.children }
          <View  style={{marginTop: 22}}>
            <ActionSheet
              ref={o => this.ActionSheet = o}
              title={Constants.ACTIONSHEET_SETTING_TITLE}
              options={['Sao lưu dữ liệu', 'Đồng bộ dữ liệu', Constants.ALERT_CLOSE]}
              cancelButtonIndex={2}
              destructiveButtonIndex={1}
              onPress={(index) => this.onClickOption(index) }
            />
            <Loading closeLoading= { this.setLoadingVisible  } visible = { this.state.loading } ></Loading>
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  gridView: {
    paddingTop: 25,
    flex: 1,
  },
  itemContainer: {
    justifyContent: 'flex-start',
    borderRadius: 5,
    padding: 10,
    height: 150,
  },
  itemName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 12,
    color: '#fff',
  },
});