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
  TouchableOpacity ,
  Image,
  Modal,
  TouchableHighlight,
  Alert,
  FlatList
} from 'react-native';

import Constants from './constants/Constants';
import Styles from './constants/Styles';
import ActionModal from '../src/ActionModal';
import CommonUtils from './utils/CommonUtils';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', location: '~sqliteexample.db'});

export default class Day extends Component<Props> {

  constructor(props) {
    super(props);
    this.setModalVisible = this.setModalVisible.bind(this);
    this.setTypeModalVisible = this.setTypeModalVisible.bind(this);
    var date = new Date();

    const { navigation } = this.props;
    var year  = navigation.getParam('year',date.getYear());
    var month = navigation.getParam('month',date.getMonth());
    var day = navigation.getParam('day', date.getDay());
    var color = navigation.getParam('color', '#00BF6F');
    this.state = {
      currentMonth : month,
      currentYear : year,
      currentDay : day,
      actionInDay : [],
      fullTime: CommonUtils.formatDatetime(year, month, day, 'YYYYMMDD'),
      color: color,
      modalVisible: false,
      actionInDay:[],
      types:[],
      locations: [],
      action_detail: [],
      loading: false
    }
  }

  

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    
    return {
      title: params ? Constants.DAY + ' ' + params.day + '/' + params.month + '/' + params.year: '',
      headerStyle: {
        backgroundColor: params.color
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
          fontWeight: 'bold',
      },
      headerRight: (
        <TouchableOpacity  style={{ marginRight:10 }} onPress={ navigation.getParam('openActionModal') }>
            <Image source={require('./images/add_icon.png')} style={{width: 40, height: 40}} />
        </TouchableOpacity >
      ),
    }
  };

  componentWillMount() {
    console.log('componentWillMount:Day.js');
    
  }

  componentDidMount() {
    console.log('componentDidMount:Day.js');
    this.props.navigation.setParams({ openActionModal: this._openActionModal });
    this.getActionList();
    this.getTypesLocations();
    
  }

  _openActionModal = () => {
    this._getDetailInfo(0); 
  }

  _getDetailInfo(id) {
    
    if(id !== 0) {
      db.transaction((tx) => {
          
          tx.executeSql('SELECT * FROM ' + Constants.ACTIONS_TBL + ' WHERE id = ?', [id], (tx, results) => {
            len = results.rows.length;
            this.setState({
                action_detail: results.rows.item(0)
            });
            this.setModalVisible(!this.state.modalVisible, false);
          });
          
      });
    } else {
      this.setState({
        action_detail: []
      });
      this.setModalVisible(!this.state.modalVisible, false);
    }

  }

  getActionList() {
    db.transaction((tx) => {

        var sql = 'SELECT actions.*, types.color AS color, types.icon AS icon, locations.name as location_name FROM actions ';
        sql += 'LEFT JOIN '+ Constants.LOCATIONS_TBL +' ON actions.location_id = locations.id ';
        sql += 'LEFT JOIN ' + Constants.TYPES_TBL + ' ON actions.type_id = types.value WHERE actions.time="' + this.state.fullTime + '"';
        tx.executeSql(sql, [], (tx, results) => {
            var len = results.rows.length;
            if(len > 0) {
              var actionInDay = [];
                for(var i = 0; i < len; i++) {
                   var row = results.rows.item(i);
                   var obj = {id: row.id, name: row.name, type: row.type_id, cost: CommonUtils.formatCurrency(row.cost, '.', '.'), color: row.color, icon: row.icon, location: row.location_name, created_at: row.created_at};
                   actionInDay.push(obj);
                }

                this.setState({
                    actionInDay : actionInDay
                 });
            }
        });
    });
  }

  getTypesLocations() {
    db.transaction((tx) => {

        tx.executeSql('SELECT value, name, color, icon FROM ' + Constants.TYPES_TBL, [], (tx, results) => {
            var types = [];
            var len = results.rows.length;
            for(var i = 0; i < len; i++) {
               var row = results.rows.item(i);
               var obj = {value: row.value, name: row.name, color: row.color, icon: ''};
               types.push(obj);
               this.setState({
                  types : types
               });
            }
            
        });

        tx.executeSql('SELECT id, name FROM ' + Constants.LOCATIONS_TBL + ' ORDER BY created_at DESC', [], (tx, results) => {
            var locations = [];
            var len = results.rows.length;
            for(var i = 0; i < len; i++) {
               var row = results.rows.item(i);
               var obj = {id: row.id, name: row.name};
               locations.push(obj);
               this.setState({
                  locations : locations
               });
            }
        });
    });
  }

  setModalVisible(visible, refresh) {
    this.setState({modalVisible: visible});

    if(refresh) {
      this.getActionList();
    }
  }

  setTypeModalVisible(visible) {
    alert(1);
  }

  doDayClick(id) {
    this._getDetailInfo(id);
  }

  deleteAction(id, name) {
    Alert.alert(
      'Thông báo',
      'Bạn có chắc chắn xóa \'' + name + '\'',
      [
        {text: Constants.ALERT_CLOSE, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: Constants.ALERT_OK, onPress: () => this.doDelete(id)},
      ],
      { cancelable: false }
    )

    
  }

  setLoadingVisible(visible) {
    this.setState({loading: visible});
  }

  doDelete(id) {
    db.transaction((tx) => {
        tx.executeSql('DELETE FROM actions WHERE id = ' + id, [], (tx, results) => {
            this.getActionList();
        });
    });
  }

  render() {

    return (
        <View style={{ flex:1, paddingTop: 7, paddingLeft:7, paddingRight:7 }}>
          
          <FlatList
              contentContainerStyle={styles.list}
              data={this.state.actionInDay}
              extraData={this.state}
              numColumns={1}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => 
                
                <TouchableOpacity onPress={() => this.doDayClick(item.id) } onLongPress={() => this.deleteAction(item.id, item.name) }>
                  <View style={{
                      flex: 1,
                      height: 100,
                      maxHeight:100,
                      backgroundColor: this.state.color,
                      marginBottom: 7,
                      borderRadius:4,
                      paddingLeft:5,
                      paddingTop:5,
                      paddingRight:5,
                      flexDirection: 'row'
                    }}>
                      <View style={ {flex: 0.8, flexDirection: 'column'} }>
                        <Text style={styles.itemName}>{ item.name }</Text>
                        <Text style={styles.itemName}>{ item.cost }</Text>
                        <Text style={styles.itemName}>{ CommonUtils.cnvNull(item.location) }</Text>
                        <Text style={styles.itemName}>{ CommonUtils.cnvNull(item.created_at) }</Text>
                      </View>
                      <View style={ {flex: 0.2, flexDirection: 'column'} }>
                        <Image style={{width: 66, height: 66, marginTop:5}} source={{ uri:item.icon }}></Image>
                      </View>
                  </View>
                </TouchableOpacity> 

            } />
          <View  style={{marginTop: 22}}>
            <Modal
              animationType="fade"
              transparent={true}
              visible={this.state.modalVisible}
              onRequestClose={() => this.setModalVisible(false, false) }>

                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(51,51,51,0.7)' }}>
                    <View style={{
                            width: 300,
                            height: 400}}>
                      <ActionModal closeModal={ this.setModalVisible } time={ this.state.fullTime } types= { this.state.types } locations = { this.state.locations } action_detail = { this.state.action_detail } />
                    </View>
                </View>
            </Modal>
          </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  gridView: {
    paddingTop: 10,
    flex: 1,
  },
  itemContainer: {
    justifyContent: 'flex-start',
    borderRadius: 5,
    padding: 10,
    height: 100,
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