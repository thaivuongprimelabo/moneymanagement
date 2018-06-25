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
  Modal,
  DeviceEventEmitter,
  Dimensions
} from 'react-native';
import {HideWithKeyboard, ShowWithKeyboard} from 'react-native-hide-with-keyboard';

import Constants from './constants/Constants';
import Styles from './constants/Styles';
import GridView from 'react-native-super-grid';
import CommonUtils from './utils/CommonUtils';
import AddType from '../src/AddType';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', location: '~sqliteexample.db'});

export default class  Action extends Component<Props> {


  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.doRegister = this.doRegister.bind(this);
    this.setTypeModalVisible = this.setTypeModalVisible.bind(this);
    this.state = { 
      action: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      type: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      cost: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      location: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      comment: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      created_at: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      detail_id : Constants.EMPTY,
      types : [],
      locations: [],
      action_detail: [],
      validate : [],
      checked: true,
      secureTextEntry: true,
      text : Constants.REGISTER_BTN,
      modalVisible: false,
      type_input: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      showForm: false
    };
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    if(params.screenNext === 'Month') {
      this.calculateCost();
    }
    return {
      title: 'Đăng ký hoạt động',
      headerStyle: {
        backgroundColor: Constants.DEFAULT_COLOR 
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: (
          <TouchableOpacity  style={{ marginRight:10 }} onPress={ navigation.getParam('addAction') } >
              <Image source={require('./images/add_record_icon.png')} style={{width: 25, height: 25}} />
          </TouchableOpacity >
      )
    };
  };

  componentDidMount() {
    console.log('componentDidMount:Action.js');
    this.props.navigation.setParams({ addAction: this._addAction });
    this.getTypesLocations();

  }

  componentWillMount() {
    console.log('componentWillMount:Action.js');
  }

  _addAction() {
    this.doRegister();
  }

  getTypesLocations() {
    db.transaction((tx) => {

        tx.executeSql('SELECT * FROM ' + Constants.TYPES_TBL, [], (tx, results) => {
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

        tx.executeSql('SELECT * FROM ' + Constants.LOCATIONS_TBL + ' ORDER BY created_at DESC', [], (tx, results) => {
            var locations = [];
            var len = results.rows.length;
            for(var i = 0; i < len; i++) {
               var row = results.rows.item(i);
               var obj = {id: row.id, name: row.name};
               locations.push(obj);
               this.setState({
                  locations : locations,
                  showForm: true
               });
            }
        });
    });
  }

  onChange(text, type) {
    if(type === 0) {
      this.setState({
        action: {
          value : text,
          style : Styles.inputText
        }
      });
    }

    if(type === 1) {
      this.setState({
        type: {
          value : text,
          style : Styles.inputText
        }
      });
    }

    if(type === 2) {
      this.setState({
        cost: {
          value : text,
          style : Styles.inputText
        }
      });
    }

    if(type === 3) {
      this.setState({
        location: {
          value : text,
          style : Styles.inputText
        }
      });
    }

    if(type === 4) {
      this.setState({
        comment: {
          value : text,
          style : Styles.inputText
        }
      });
    }

    if(type === 5) {
      this.setState({
        location: {
          value : text,
          style : Styles.inputText
        }
      });
    }

    if(type === 6) {
      this.setState({
        created_at: {
          value : text,
          style : Styles.inputText
        }
      });
    }
    
  }

  doRegister() {

    let time = this.props.time;
    let action = this.state.action.value;
    let cost = this.state.cost.value;
    let type = this.state.type.value;
    let comment = this.state.comment.value;
    let location = this.state.location.value;
    let created_at = CommonUtils.getCurrentDate('YYYY/MM/DD HH:II:SS');
    let updated_at = CommonUtils.getCurrentDate('YYYY/MM/DD HH:II:SS');
    let sql = 'INSERT INTO actions(name,cost,time,location_id,comment,type_id,is_sync,created_at,updated_at) VALUES("' + action + '","' + cost + '","' + time + '","' + location + '","' + comment + '","' + type + '",0,"' + created_at + '","' + updated_at + '")';
    if(this.state.detail_id !== Constants.EMPTY) {
      sql = 'UPDATE actions SET name = "' + action + '", cost = "' + cost + '", location_id = "' + location + '", comment = "' + comment + '", type_id = ' + type + ', is_sync = 0, updated_at = "' + updated_at + '" WHERE id = ' + this.state.detail_id;
    }
    db.transaction((tx) => {
        tx.executeSql(sql, [], (tx, results) => {
          Alert.alert(Constants.ALERT_INFO, Constants.REGISTER_SUCCESS);
        });
    });
  }

  addType() {
    this.setState({
      modalVisible: true
    });
  }

  setTypeModalVisible(visible) {
    this.setState({
      modalVisible: visible
    });
  }

  render() {

    var types = this.state.types.map((type, index) => {
        let item = <Picker.Item label={type.name} value={type.value} key={index} />;
        
        return item;
    });

    var locations = this.state.locations.map((location, index) => {
        let item = <Picker.Item label={location.name} value={location.id} key={index} />;
        
        return item;
    });
    if(this.state.showForm) {
      return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={[Styles.registerContainer, {height: this.state.visibleHeight} ]}>
                <View style={{flexDirection:'row'}}>
                  <TextInput
                  underlineColorAndroid='transparent'
                  style={this.state.action.style}
                  onChangeText={ (text) => this.onChange(text, 0) }
                  value={this.state.action.value}
                  placeholder="Hoạt động"
                  />
                </View>
                <View style={{flexDirection:'row'}}>
                  <Picker
                    selectedValue={this.state.type.value}
                    style={Styles.inputText}
                    onValueChange={(itemValue, itemIndex) => this.onChange(itemValue, 1) }>
                    <Picker.Item label="Vui lòng chọn" value=""/>
                    {types}
                  </Picker>
                  <TouchableHighlight onPress={ () => this.addType() } style= {{ marginTop:15 }}>
                    <Image source={require('./images/add_icon.png')} style={{width: 40, height: 40}} />
                  </TouchableHighlight>
                </View>
                <View style={{flexDirection:'row'}}>
                  <Picker
                    selectedValue={this.state.location.value}
                    style={Styles.inputText}
                    onValueChange={(itemValue, itemIndex) => this.onChange(itemValue, 5) }>
                    <Picker.Item label="Vui lòng chọn" value="" />
                    {locations}
                  </Picker>
                </View>
                <View style={{flexDirection:'row'}}>
                  <TextInput
                  underlineColorAndroid='transparent'
                  style={this.state.cost.style}
                  onChangeText={ (text) => this.onChange(text, 2) }
                  value={this.state.cost.value}
                  placeholder="Chi phí"
                  />
                </View>
                <View style={{flexDirection:'row'}}>
                  <TextInput
                  underlineColorAndroid='transparent'
                  style={this.state.comment.style}
                  onChangeText={ (text) => this.onChange(text, 4) }
                  value={this.state.comment.value}
                  placeholder="Bình luận"
                  />
                </View>

                <View style={{flexDirection:'row'}}>
                    <TextInput
                    underlineColorAndroid='transparent'
                    style={this.state.created_at.style}
                    onChangeText={ (text) => this.onChange(text, 6) }
                    value={this.state.created_at.value}
                    placeholder="Thời gian"
                    />
                </View>
                
                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={this.state.modalVisible}
                  onRequestClose={() => this.setModalVisible(false, false) }>

                    <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center', }}>
                        <View style={{
                                width: 300,
                                height: 300}}>
                          <AddType closeTypeModal = { this.setTypeModalVisible } />
                      </View>
                  </View>
                  
                </Modal>
              </View>
              

            </TouchableWithoutFeedback>
        );
      } else {
        return null;
      }
  }
}

