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
  Alert
} from 'react-native';

import Constants from './constants/Constants';
import Styles from './constants/Styles';
import GridView from 'react-native-super-grid';
import Action from '../src/Action';
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
      detail_id: 0,
      actionInDay:[]
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
        <TouchableOpacity  style={{ marginRight:10 }} onPress={ params.increaseCount }>
            <Image source={require('./images/add_icon.png')} style={{width: 40, height: 40}} />
        </TouchableOpacity >
      ),
    }
  };

  componentWillMount() {
  }

  componentDidMount() {
    this.props.navigation.setParams({ increaseCount: this.doAction });
    this.getActionList();
  }

  doAction = () => {
    //this.props.navigation.navigate('Action', {month: this.state.currentMonth, year: this.state.currentYear, day: this.state.currentDay, color: this.state.color});
    this.setState({
      detail_id : Constants.EMPTY
    });
    this.setModalVisible(!this.state.modalVisible, false);
  }

  getActionList() {
    db.transaction((tx) => {
        tx.executeSql('SELECT actions.*, types.color AS color, types.icon AS icon FROM actions INNER JOIN types ON actions.type_id = types.value WHERE actions.time=?', [this.state.fullTime], (tx, results) => {
            var len = results.rows.length;
            if(len > 0) {
              var actionInDay = [];
                for(var i = 0; i < len; i++) {
                   var row = results.rows.item(i);
                   var obj = {id: row.id, name: row.name, type: row.type_id, cost: CommonUtils.formatCurrency(row.cost, '.', '.'), color: row.color, icon: row.icon, location: row.location, created_at: row.created_at};
                   actionInDay.push(obj);
                }

                this.setState({
                    actionInDay : actionInDay
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
    this.setState({
      detail_id : id
    });
    this.setModalVisible(true);
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

  doDelete(id) {
    db.transaction((tx) => {
        tx.executeSql('DELETE FROM actions WHERE id = ' + id, [], (tx, results) => {
            this.getActionList();
        });
    });
  }

  render() {

    return (
        <View style={{ flex:1 }}>
          <GridView
            itemDimension={260}
            items={this.state.actionInDay}
            style={styles.gridView}
            renderItem={(item,index) => (
              <TouchableOpacity onPress={() => this.doDayClick(item.id) } onLongPress={() => this.deleteAction(item.id, item.name) }>
                <View style={[styles.itemContainer, { backgroundColor: this.state.color }]}>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
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
                </View>
              </TouchableOpacity>
            )}
          >
          </GridView>
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
                      <Action closeModal={ this.setModalVisible } time={ this.state.fullTime } id = { this.state.detail_id } />
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
});