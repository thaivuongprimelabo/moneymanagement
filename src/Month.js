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
  Alert,
  Image
} from 'react-native';

import Constants from './constants/Constants';
import Styles from './constants/Styles';
import GridView from 'react-native-super-grid';
import CommonUtils from './utils/CommonUtils';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', location: '~sqliteexample.db'});

export default class Month extends Component<Props> {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    
    return {
      title: params ? Constants.MONTH + ' ' + params.month + '/' + params.year: '',
      headerStyle: {
        backgroundColor: params.color
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
          fontWeight: 'bold',
      }
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      currentMonth : '',
      currentYear : '',
      daysInMonth : [],
      color: ''
    }
  }

  componentDidMount() {
    console.log('componentWillMount:Month.js');
  }

  componentWillMount() {
    console.log('componentWillMount:Month.js');
    var date = new Date();
    const { navigation } = this.props;
    var year  = navigation.getParam('year',date.getYear());
    var month = navigation.getParam('month',date.getMonth());
    var color = navigation.getParam('color', '#00BF6F');

    var daysInMonth = [];

    date = new Date(year, month, 0);
    y = date.getFullYear(); 
    m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);
    var start = firstDay.getDate();
    var end = lastDay.getDate();

    for(var i = start; i <= end; i++) {
        var day = { name: i, code: color };
        daysInMonth.push(day);
    }

    this.setState({
      daysInMonth: daysInMonth,
      currentMonth : month,
      currentYear : year,
      color: color
    });
  }

  doDayClick(day) {
    day = JSON.stringify(day);
    day = day.length === 1 ? '0' + day : day;
    this.props.navigation.navigate('Day', {month: this.state.currentMonth, year: this.state.currentYear, day: day, color: this.state.color});
  }

  usedInDay(day) {
    day = JSON.stringify(day);
    day = day.length === 1 ? '0' + day : day;
    var time = CommonUtils.formatDatetime(this.state.currentYear, this.state.currentMonth, day, 'YYYYMMDD');
    var currentTime = CommonUtils.getCurrentDate('YYYYMMDD');
    var header = Constants.HEADER_TODAY_ALERT;
    if(time !== currentTime) {
      header = Constants.HEADER_DATE_ALERT;
      var timeWithSpec = CommonUtils.formatDatetime(this.state.currentYear, this.state.currentMonth, day, 'DD/MM/YYYY');
      header = header.replace('{0}', timeWithSpec);
    }
    db.transaction((tx) => {
        var sql = 'SELECT SUM(cost) AS sum_cost FROM actions WHERE time = "' + time + '"';
        tx.executeSql(sql, [], (tx, results) => {
            var len = results.rows.length;
            Alert.alert(
              header,
              CommonUtils.formatCurrency(results.rows.item(0).sum_cost, '.', '.'),
              [
                {text: Constants.ALERT_CLOSE, onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              ],
              { cancelable: false }
            )
            
        });
    });
  }

  render() {

    return (
        <GridView
          itemDimension={60}
          items={this.state.daysInMonth}
          style={styles.gridView}
          renderItem={item => (
            <TouchableOpacity onPress={() => this.doDayClick(item.name ) } onLongPress= { () => this.usedInDay(item.name) }>
              <View style={[styles.itemContainer, { backgroundColor: item.code }]}>
                <Text style={styles.itemName}>{ item.name }</Text>
              </View>
            </TouchableOpacity>
          )}
        />
    );
  }
}

const styles = StyleSheet.create({
  gridView: {
    paddingTop: 25,
    flex: 1,
  },
  itemContainer: {
    justifyContent: 'center',
    borderRadius: 100,
    padding: 10,
    height: 60,
    alignItems: 'center'
  },
  itemName: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 12,
    color: '#fff',
  },
});