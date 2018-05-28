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
      loading: false,
      user_id: 0
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

    const { navigation } = this.props;
    var userId = navigation.getParam('user_id', '0');

    this.setState({
      user_id: userId
    });
  }

  backupData() {
    

    var output = {types: [], actions: []};

    db.transaction((tx) => {
        tx.executeSql('SELECT * FROM ' + Constants.ACTIONS_TBL + ' WHERE is_sync = 0', [], (tx, results) => {
            var len = results.rows.length;
            for(var i = 0; i < len; i++) {
              var obj = {id: results.rows.item(i).id, name : results.rows.item(i).name, cost: results.rows.item(i).cost, time: results.rows.item(i).time, location: results.rows.item(i).location, comment: results.rows.item(i).comment, type_id: results.rows.item(i).type_id, is_sync: 1, created_at: results.rows.item(i).created_at, updated_at: results.rows.item(i).updated_at, user_id: this.state.user_id };
              output.actions.push(obj);
            }
            //this.postToBackup(output);
        });

        // tx.executeSql('SELECT * FROM ' + Constants.TYPES_TBL  + ' WHERE is_sync = 0', [], (tx, results) => {
        //     var len = results.rows.length;
        //     for(var i = 0; i < len; i++) {
        //       var obj = {value : results.rows.item(i).value, name: results.rows.item(i).name, color: '', icon: '', 0, order: results.rows.item(i).order, created_at: results.rows.item(i).created_at, updated_at: results.rows.item(i).updated_at, user_id: this.state.user_id};
        //       output.types.push(obj);
        //     }
        // });
        //console.log(output);
        this.postToBackup(output);
    });
  }

  postToBackup(data) {
    this.setLoadingVisible(true);
    var url = this.state.SERVER_URL + this.state.BACKUP_URI;
    console.log(url);
    fetch(url, {
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
          var msg = Constants.BACKUP_SUCCESS;
          msg = msg.replace('{0}', data.types.length);
          msg = msg.replace('{1}', data.actions.length);
          Alert.alert(Constants.ALERT_INFO, msg);
        }

    })
    .catch((error) =>{
      alert('error:' + error);
    });
  }

  syncFromServer(clear) {
      this.setLoadingVisible(true);
      var url = this.state.SERVER_URL + this.state.SYNC_URI;
      if(clear) {
        url = url + '?clear=1&user_id=' + this.state.user_id;
      }
      console.log(url);
      // if(this.state.is_first === '0') {
      //   db.transaction((tx) => {
      //     tx.executeSql('UPDATE ' + Constants.SETTINGS_TBL + ' SET value = \"1\" WHERE key = \"is_first\"', [], (tx, results) => {
      //         this.setState({
      //           is_first: 1
      //         });
      //     });
      //   });
      // } else {
      //   url = server + '/api/sync/0';
      // }
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
                sql += '(' + obj.value + ',\"' + obj.name + '\",\"' + obj.color + '\",\"' + obj.icon + '\", 1, ' + obj.order + ', \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              } else {
                sql += ',(' + obj.value + ',\"' + obj.name + '\",\"' + obj.color + '\",\"' + obj.icon + '\", 1, ' + obj.order + ', \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              }
            }

            var length1 = json.actions.length;
            var sql1 = '';
            for(var i = 0; i < length1; i++) {
              var obj = json.actions[i];
              if(sql1 == '') {
                sql1 = 'INSERT INTO ' + Constants.ACTIONS_TBL + ' VALUES';
                sql1 += '(' + obj.id + ',\"' + obj.name + '\",\"' + obj.cost + '\",\"' + obj.time + '\",\"' + obj.location + '\", \"' + obj.comment + '\", ' + obj.type_id + ', 1, \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              } else {
                sql1 += ',(' + obj.id + ',\"' + obj.name + '\",\"' + obj.cost + '\",\"' + obj.time + '\",\"' + obj.location + '\", \"' + obj.comment + '\", ' + obj.type_id + ', 1, \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              }
            }
            
            db.transaction((tx) => {
              if(clear) {
                tx.executeSql('DELETE FROM ' + Constants.TYPES_TBL, [], (tx, results) => {
                  
                });

                tx.executeSql('DELETE FROM ' + Constants.ACTIONS_TBL, [], (tx, results) => {
                    
                });
              }
              

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
              msg = msg.replace('{0}', length);
              msg = msg.replace('{1}', length1);
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
      this.syncFromServer(false);
    } else if(index === 2) {
      this.syncFromServer(true);
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
              options={['Sao lưu dữ liệu', 'Đồng bộ dữ liệu', 'Xóa và đồng bộ lại tất cả', this.state.SERVER_URL, Constants.ALERT_CLOSE]}
              cancelButtonIndex={4}
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