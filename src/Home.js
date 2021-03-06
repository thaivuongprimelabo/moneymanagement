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
  Alert,
  AppState,
  BackHandler,
  ToastAndroid,
  FlatList
} from 'react-native';

import ActionSheet from 'react-native-actionsheet';

import Constants from './constants/Constants';
import CommonUtils from './utils/CommonUtils';
import Styles from './constants/Styles';
import Loading from './Loading';
import Layout from './Layout';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', createFromLocation: '~sqliteexample.db'});

export default class  Home extends Component<Props> {

  

  constructor(props) {
    console.log('constructor');
    super(props);
    this.setLoadingVisible = this.setLoadingVisible.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);

    var date = new Date();
    var year = date.getFullYear();
    var months = [
            { ym: year + '01', name: '1', code: '#1abc9c', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg')  },  
            { ym: year + '02', name: '2', code: '#2ecc71', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg')  },
            { ym: year + '03', name: '3', code: '#3498db', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg')  },  
            { ym: year + '04', name: '4', code: '#9b59b6', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg')  },
            { ym: year + '05', name: '5', code: '#34495e', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg')  },  
            { ym: year + '06', name: '6', code: '#16a085', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg')  },
            { ym: year + '07', name: '7', code: '#27ae60', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg')  },  
            { ym: year + '08', name: '8', code: '#2980b9', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg')  },
            { ym: year + '09', name: '9', code: '#8e44ad', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg')  },  
            { ym: year + '10', name: '10', code: '#2c3e50', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg') },
            { ym: year + '11', name: '11', code: '#f1c40f', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg') }, 
            { ym: year + '12', name: '12', code: '#e67e22', budget: '0', 'used': '0', remain: '0', image: require('./images/january.jpg') }
          ];

    this.state = {
      year: year,
      months: months,
      loading: false,
      user_id: 0,
      data_backup: 0,
      appState: AppState.currentState
    }
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    if(params.screenNext === 'Month') {
      this.calculateCost();
    }
    return {
      title: 'Năm 2018',
      headerStyle: {
        backgroundColor: Constants.DEFAULT_COLOR 
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: null,
      headerRight: (
          <TouchableOpacity  style={{ marginRight:10 }} onPress={() => params.handleSave()} >
              <Image source={require('./images/config.png')} style={{width: 25, height: 25}} />
          </TouchableOpacity >
      ),
    };
  };

  componentDidMount() {
    console.log('componentWillMount:Home.js');
    
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillMount() {
    console.log('componentDidMount:Home.js');
    this.getInfo();
    this.checkExistDataBackup();
    this.calculateCost();
    this.props.navigation.setParams({ handleSave: this.showActionSheet });
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton() {
    console.log('handleBackButton');
    return true;
  }

  getInfo() {
    // Lấy thông tin từ table settings
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

    this.setState({user_id: userId});
  }

  calculateCost() {
    console.log('calculateCost');
    var months = this.state.months;

    db.transaction((tx) => {
        var sql = 'SELECT substr(act.time,1,4) || substr(act.time,5,2) as ym, sum(act.cost) as used FROM actions act ';
        sql    += 'GROUP BY substr(act.time,1,4) || substr(act.time,5,2) ';
        sql    += 'ORDER BY act.created_at DESC';
        tx.executeSql(sql, [], (tx, results) => {
            var len = results.rows.length;
            if(len > 0) {
              for(var i = 0; i < len; i++) {
                for(var j = 0; j < months.length; j++) {
                  var month = months[j];
                  if(results.rows.item(i).ym === month.ym) {
                    month.used = results.rows.item(i).used;
                    month.budget = month.budget !== '0' ? month.budget : this.state.BUDGET;
                    month.remain = parseInt(month.budget) - parseInt(month.used);
                    break;
                  }
                }
              }
              this.setState({
                months: months
              });
            }
        });
    });
  }

  checkExistDataBackup() {
    // Lấy số lượng record chưa đồng bộ từ table types
    var sql = 'SELECT SUM(CNT) AS total FROM';
    sql    += ' (SELECT COUNT(id) AS CNT FROM actions WHERE is_sync = 0';
    sql    += ' UNION ALL';
    sql    += ' SELECT COUNT(value) AS CNT FROM types WHERE is_sync = 0) ABC';
    db.transaction((tx) => {
      tx.executeSql(sql, [], (tx, results) => {
          var len = results.rows.length;
          if(len > 0 && results.rows.item(0).total > 0) {
            this.setState({
              data_backup: results.rows.item(0).total
            });
          }
      });
    });
  }

  backupData() {
    var output = {types: [], actions: []};

    db.transaction((tx) => {
        tx.executeSql('SELECT * FROM ' + Constants.ACTIONS_TBL + ' WHERE is_sync = 0', [], (tx, results) => {
            var len = results.rows.length;
            if(len > 0) {
              for(var i = 0; i < len; i++) {
                var obj = {id: results.rows.item(i).id, name : results.rows.item(i).name, cost: results.rows.item(i).cost, time: results.rows.item(i).time, location_id: results.rows.item(i).location_id, comment: results.rows.item(i).comment, type_id: results.rows.item(i).type_id, is_sync: 1, created_at: results.rows.item(i).created_at, updated_at: results.rows.item(i).updated_at, user_id: this.state.user_id };
                output.actions.push(obj);
              }
              console.log(output);
              this.postToBackup(output);
              tx.executeSql('UPDATE ' + Constants.ACTIONS_TBL + ' SET is_sync = 1', [], (tx, results) => {});
            } else {
              Alert.alert(Constants.ALERT_INFO, Constants.BACKUP_FINISH);
            }
        });
    });
  }

  postToBackup(data) {
    this.setLoadingVisible(true);
    var url = Constants.DEFAULT_SERVER + Constants.DEFAULT_BACKUP_URI;
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
          this.checkExistDataBackup();
        }

    })
    .catch((error) =>{
      this.setLoadingVisible(false);
      Alert.alert(Constants.ALERT_INFO, Constants.SERVER_ERROR);
    });
  }

  syncFromServer(clear) {
      this.setLoadingVisible(true);
      var url = Constants.DEFAULT_SERVER + Constants.DEFAULT_SYNC_URI + '?user_id=' + this.state.user_id;
      if(clear) {
        url = url + '&clear=1';
      }
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
            var idTypes = '';
            for(var i = 0; i < length; i++) {
              var obj = json.types[i];

              if(sql == '') {
                idTypes += ' value = ' + obj.value;
                sql = 'INSERT INTO ' + Constants.TYPES_TBL + ' VALUES';
                sql += '(' + obj.value + ',\"' + obj.name + '\",\"' + obj.color + '\",\"' + obj.icon + '\", 1, ' + obj.order + ', \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              } else {
                idTypes += ' OR value = ' + obj.value;
                sql += ',(' + obj.value + ',\"' + obj.name + '\",\"' + obj.color + '\",\"' + obj.icon + '\", 1, ' + obj.order + ', \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              }
            }

            var length1 = json.actions.length;
            var sql1 = '';
            var idActions = '';
            for(var i = 0; i < length1; i++) {
              var obj = json.actions[i];
              if(sql1 == '') {
                idActions += ' id = ' + obj.id;
                sql1 = 'INSERT INTO ' + Constants.ACTIONS_TBL + ' VALUES';
                sql1 += '(' + obj.id + ',\"' + obj.name + '\",\"' + obj.cost + '\",\"' + obj.time + '\",\"' + obj.location_id + '\", \"' + obj.comment + '\", ' + obj.type_id + ', 1, \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              } else {
                idActions += ' OR id = ' + obj.id;
                sql1 += ',(' + obj.id + ',\"' + obj.name + '\",\"' + obj.cost + '\",\"' + obj.time + '\",\"' + obj.location_id + '\", \"' + obj.comment + '\", ' + obj.type_id + ', 1, \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              }
            }

            var length2 = json.locations.length;
            var sql2 = '';
            var idLocations = '';
            for(var i = 0; i < length2; i++) {
              var obj = json.locations[i];
              if(sql2 == '') {
                idLocations += ' id = ' + obj.id;
                sql2 = 'INSERT INTO ' + Constants.LOCATIONS_TBL + ' VALUES';
                sql2 += '(' + obj.id + ',\"' + obj.name + '\",\"' + obj.latlong + '\",1, \"' + obj.address + '\", \"' + obj.desc_image + '\", \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              } else {
                idLocations += ' OR id = ' + obj.id;
                sql2 += ',(' + obj.id + ',\"' + obj.name + '\",\"' + obj.latlong + '\",1, \"' + obj.address + '\", \"' + obj.desc_image + '\", \"' + obj.created_at + '\", \"' + obj.updated_at + '\")';
              }
              
            }
            
            db.transaction((tx) => {
              var sqlDelType = '';
              var sqlDelAction = '';
              var sqlDelLocation = '';
              if(!clear) {
                  if(idTypes !== '') {
                    sqlDelType = 'DELETE FROM ' + Constants.TYPES_TBL + ' WHERE ' + idTypes;
                  }
                  if(idActions !== '') {
                    sqlDelAction = 'DELETE FROM ' + Constants.ACTIONS_TBL + ' WHERE ' + idActions;
                  }
                  if(idLocations !== '') {
                    sqlDelLocation = 'DELETE FROM ' + Constants.LOCATIONS_TBL + ' WHERE ' + idLocations;
                  }
              } else {
                sqlDelType = 'DELETE FROM ' + Constants.TYPES_TBL;
                sqlDelAction = 'DELETE FROM ' + Constants.ACTIONS_TBL;
                sqlDelLocation = 'DELETE FROM ' + Constants.LOCATIONS_TBL;
              }
              

              if(sqlDelType !== '') {
                tx.executeSql(sqlDelType, [], (tx, results) => {
                  console.log(sqlDelType);
                  if(sql !== '') {
                    tx.executeSql(sql, [], (tx, results) => {
                      console.log(sql);
                    });
                  }
                });
              }
              
              if(sqlDelAction !== '') {
                tx.executeSql(sqlDelAction, [], (tx, results) => {
                  console.log(sqlDelAction);
                  if(sql1 !== '') {
                    tx.executeSql(sql1, [], (tx, results) => {
                      console.log(sql1);
                    });
                  }
                });
              }

              if(sqlDelLocation !== '') {
                tx.executeSql(sqlDelLocation, [], (tx, results) => {
                  console.log(sqlDelLocation);
                  if(sql2 !== '') {
                    tx.executeSql(sql2, [], (tx, results) => {
                      console.log(sql2);
                    });
                  }    
                });
              }

              this.calculateCost();

            });
            var total = parseInt(length) + parseInt(length1) + parseInt(length2);
            if(total === 0) {
              Alert.alert(Constants.ALERT_INFO, Constants.SYNC_SUCCESS);
            } else {
              var msg = Constants.SYNC_COUNT_SUCCESS;
              msg = msg.replace('{0}', length);
              msg = msg.replace('{1}', length1);
              msg = msg.replace('{2}', length2);
              Alert.alert(Constants.ALERT_INFO, msg);
            }
            

          }

      })
      .catch((error) =>{
        this.setLoadingVisible(false);
        Alert.alert(Constants.ALERT_INFO, Constants.SERVER_ERROR);
      });
  }

  setLoadingVisible(visible) {
    this.setState({loading: visible});
  }

  showActionSheet() {
    this.ActionSheet.show();
  }

  doMonthClick(month, color) {
    this.props.navigation.navigate('Month', {month: month, year: this.state.year, color: color, onRefresh: this.handleOnNavigateBack });
  }

  handleOnNavigateBack = (foo) => {
    this.calculateCost();
    this.checkExistDataBackup();
  }

  onClickOption(index) {
    if(index === 0) {
      this.backupData();
    } else if(index === 1) {
      this.syncFromServer(false);
    } else if(index === 2) {
      this.syncFromServer(true);
    } else if(index === 3) {
      this.props.navigation.navigate('Action');
    }
  }

  render() {
    const resizeMode = 'center';

    return (
        <View style={{ flex:1, paddingTop:7 }}>
          <FlatList
            contentContainerStyle={styles.list}
            data={this.state.months}
            extraData={this.state}
            numColumns={2}
            keyExtractor={(item, index) => index}
            renderItem={({item}) => 
              
              <TouchableOpacity  onPress={ () => this.doMonthClick(item.name, item.code) }>
                <View style={{
                    flex: 1,
                    minWidth: 170,
                    maxWidth: 170,
                    height: 170,
                    maxHeight:170,
                    backgroundColor: item.code,
                    marginLeft:7, 
                    marginBottom: 7,
                    borderRadius:4,
                    paddingLeft:5,
                    paddingTop:5
                  }}>
                    <Text style={styles.itemName}>{Constants.MONTH} {item.name}</Text>
                    <Text style={styles.itemCode}>Định mức: { CommonUtils.formatCurrency(item.budget, '.', '.') }</Text>
                    <Text style={styles.itemCode}>Đã sử dụng: { CommonUtils.formatCurrency(item.used, '.', '.') }</Text>
                    <Text style={styles.itemCode}>Còn lại: { CommonUtils.formatCurrency(item.remain, '.', '.') }</Text>
                </View>
              </TouchableOpacity> 

          } />
          
          <View  style={{marginTop: 22}}>
            <ActionSheet
              ref={o => this.ActionSheet = o}
              options={['Sao lưu dữ liệu (' + this.state.data_backup + ')', 'Đồng bộ dữ liệu', 'Xóa và đồng bộ lại tất cả', 'Đăng ký hoạt động', 'Đăng ký loại', 'Đăng ký địa điểm', Constants.ALERT_CLOSE]}
              cancelButtonIndex={6}
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
  list: {
    justifyContent: 'center',
    flexDirection: 'column',
  }
});