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
import Layout from './Layout';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', createFromLocation: '~sqliteexample.db'});

export default class  Home extends Component<Props> {

  

  constructor(props) {
    super(props);
    this.setLoadingVisible = this.setLoadingVisible.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
    this.state = {
      year: 2018,
      month: [
              { name: '1', code: '#1abc9c', budget: '3.000.000', 'used': '1.300.000' },  
              { name: '2', code: '#2ecc71', budget: '3.000.000', 'used': '1.300.000'  },
              { name: '3', code: '#3498db', budget: '3.000.000', 'used': '1.300.000'  },  
              { name: '4', code: '#9b59b6', budget: '3.000.000', 'used': '1.300.000'  },
              { name: '5', code: '#34495e', budget: '3.000.000', 'used': '1.300.000'  },  
              { name: '6', code: '#16a085', budget: '3.000.000', 'used': '1.300.000'  },
              { name: '7', code: '#27ae60', budget: '3.000.000', 'used': '1.300.000'  },  
              { name: '8', code: '#2980b9', budget: '3.000.000', 'used': '1.300.000'  },
              { name: '9', code: '#8e44ad', budget: '3.000.000', 'used': '1.300.000'  },  
              { name: '10', code: '#2c3e50', budget: '3.000.000', 'used': '1.300.000'  },
              { name: '11', code: '#f1c40f', budget: '3.000.000', 'used': '1.300.000'  }, 
              { name: '12', code: '#e67e22', budget: '3.000.000', 'used': '1.300.000'  }
            ],
      loading: false
    }

    
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: 'Năm 2018',
      headerStyle: {
        backgroundColor: Constants.DEFAULT_COLOR 
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: (
          <TouchableOpacity  style={{ marginRight:10 }} onPress={() => params.handleSave()} >
              <Image source={require('./images/config.png')} style={{width: 40, height: 40}} />
          </TouchableOpacity >
        )
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({ handleSave: this.showActionSheet });
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM ' + Constants.SETTINGS_TBL, [], (tx, results) => {
          var len = results.rows.length;
          for(var i = 0; i < len; i++) {
            var str =  '{\"' + results.rows.item(i).key +'\":\"' + results.rows.item(i).value + '\"}';
            var obj = JSON.parse(str);
            this.setState(obj);
          }
      });
    });
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

  syncFromServer() {
      this.setLoadingVisible(true);
      var server = this.state.server_url;
      var url = server + '/api/sync';
      if(this.state.is_first === '0') {
        db.transaction((tx) => {
          tx.executeSql('UPDATE ' + Constants.SETTINGS_TBL + ' SET value = \"1\" WHERE key = \"is_first\"', [], (tx, results) => {
              this.setState({
                is_first: 1
              });
          });
        });
      } else {
        url = server + '/api/sync/0';
      }
      // alert(url);
      
      fetch(url, {
        method: 'GET',
      })
      .then((response) => response.json())
      .then((responseJson) => {
          if(responseJson.code === 200) {
            this.setLoadingVisible(false);
            var json = JSON.parse(responseJson.data);

            var sql = '';
            var length = json.types.length;
            for(var i = 0; i < length; i++) {
              var obj = json.types[i];
              if(sql == '') {
                sql = 'INSERT INTO ' + Constants.TYPES_TBL + ' VALUES';
                sql += '(' + obj.id + ',' + obj.value + ',\"' + obj.name + '\",\"' + obj.color + '\",\"' + obj.icon + '\", ' + obj.is_sync + ', ' + obj.order + ')';
              } else {
                sql += ',(' + obj.id + ',' + obj.value + ',\"' + obj.name + '\",\"' + obj.color + '\",\"' + obj.icon + '\", ' + obj.is_sync + ', ' + obj.order + ')';
              }
            }

            var length1 = json.actions.length;
            var sql1 = '';
            for(var i = 0; i < length1; i++) {
              var obj = json.actions[i];
              if(sql1 == '') {
                sql1 = 'INSERT INTO ' + Constants.ACTIONS_TBL + ' VALUES';
                sql1 += '(' + obj.id + ',\"' + obj.name + '\",\"' + obj.cost + '\",\"' + obj.time + '\",\"' + obj.location + '\", \"' + obj.create_at + '\", \"' + obj.comment + '\", ' + obj.type_id + ', ' + obj.is_sync + ')';
              } else {
                sql1 += ',(' + obj.id + ',\"' + obj.name + '\",\"' + obj.cost + '\",\"' + obj.time + '\",\"' + obj.location + '\", \"' + obj.create_at + '\", \"' + obj.comment + '\", ' + obj.type_id + ', ' + obj.is_sync + ')';
              }
            }
            
            db.transaction((tx) => {
              // tx.executeSql('DELETE FROM ' + Constants.TYPES_TBL, [], (tx, results) => {
                  
              // });

              // tx.executeSql('DELETE FROM ' + Constants.ACTIONS_TBL, [], (tx, results) => {
                  
              // });

              if(sql !== '') {
                tx.executeSql(sql, [], (tx, results) => {
                  
                });
              }
              
              if(sql1 !== '') {
                tx.executeSql(sql1, [], (tx, results) => {
                    
                });
              }
            });
            var total = parseInt(length) + parseInt(length1);
            if(total === 0) {
              Alert.alert(Constants.ALERT_INFO, Constants.SYNC_SUCCESS);
            } else {
              var msg = Constants.SYNC_COUNT_SUCCESS;
              msg = msg.replace('{0}', total);
              Alert.alert(Constants.ALERT_INFO, msg);
            }
            
          }

      })
      .catch((error) =>{
        this.setLoadingVisible(false);
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
    } else if(index === 1) {
      this.syncFromServer();
    }
  }

  render() {

    return (
        <View style={{ flex:1 }}>
          <GridView
            itemDimension={130}
            items={this.state.month}
            style={styles.gridView}
            renderItem={item => (
              <TouchableOpacity  onPress={ () => this.doMonthClick(item.name, item.code) }>
                <View style={[styles.itemContainer, { backgroundColor: item.code }]} >
                <Text style={styles.itemName}>{Constants.MONTH} {item.name}</Text>
                <Text style={styles.itemCode}>Định mức: {item.budget}</Text>
                <Text style={styles.itemCode}>Đã sử dụng: {item.used}</Text>
                <Text style={styles.itemCode}>Còn lại: 1.700.000</Text>
                </View>
              </TouchableOpacity >
            )}
          />
          <View  style={{marginTop: 22}}>
            <ActionSheet
              ref={o => this.ActionSheet = o}
              title={Constants.ACTIONSHEET_SETTING_TITLE}
              options={['Sao lưu dữ liệu', 'Đồng bộ dữ liệu', this.state.server_url, Constants.ALERT_CLOSE]}
              cancelButtonIndex={3}
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