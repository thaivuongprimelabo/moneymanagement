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
import AddType from '../src/AddType';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', location: '~sqliteexample.db'});

export default class  ActionModal extends Component<Props> {


  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.doRegister = this.doRegister.bind(this);
    this.doClear = this.doClear.bind(this);
    this.setTypeModalVisible = this.setTypeModalVisible.bind(this);
    this.state = { 
      action: {
        value : CommonUtils.cnvNull(this.props.action_detail.name),
        style : Styles.inputText
      },
      type: {
        value : this.props.action_detail.type_id,
        style : Styles.inputText
      },
      cost: {
        value : CommonUtils.cnvNull(this.props.action_detail.cost),
        style : Styles.inputText
      },
      location: {
        value : this.props.action_detail.location_id,
        style : Styles.inputText
      },
      comment: {
        value : CommonUtils.cnvNull(this.props.action_detail.comment),
        style : Styles.inputText
      },
      detail_id : Constants.EMPTY,
      types : this.props.types,
      locations: this.props.locations,
      action_detail: this.props.action_detail,
      validate : [],
      checked: true,
      secureTextEntry: true,
      text : Constants.REGISTER_BTN,
      modalVisible: false,
      type_input: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
    };
  }

  componentDidMount() {
    console.log('componentDidMount:Action.js');
  }

  componentWillMount() {
    console.log('componentWillMount:Action.js');
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

        });
    });
    this.props.closeModal(false, true);
  }

  doClear() {
    this.props.closeModal(false, false);
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

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={Styles.registerContainer}>
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
              <View style={{flex:0.35, marginTop:10, marginRight:5 }} >
                
                <Button
                onPress={this.doRegister}
                title={this.state.text}
                color={ Constants.DEFAULT_COLOR }
                accessibilityLabel="Learn more about this purple button"
                />
              </View>
              <View style={{flex:0.35, marginTop:10 }} >
                <Button
                onPress={this.doClear}
                title="Hủy"
                color={ Constants.DEFAULT_COLOR }
                accessibilityLabel="Learn more about this purple button"
                />
              </View>
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
  }
}