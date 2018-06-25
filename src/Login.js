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
  Image,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert, Keyboard, FlatList, CheckBox 
} from 'react-native';

import {
  StackNavigator,
} from 'react-navigation';
import Constants from './constants/Constants';
import Styles from './constants/Styles';
import Loading from './Loading';

var SQLite = require('react-native-sqlite-storage')
var db = SQLite.openDatabase({name: 'test.db', createFromLocation: '~sqliteexample.db'});

export default class Login extends Component<Props> {

  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.doLogin = this.doLogin.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onChangeShowPassword = this.onChangeShowPassword.bind(this);
    this.doRegister = this.doRegister.bind(this);
    this.doAccept = this.doAccept.bind(this);
    this.state = { 
      username: {
        value : Constants.DEFAULT_USER,
        style : Styles.inputText
      },
      password: {
        value : Constants.DEFAULT_PASSWORD,
        style : Styles.inputText
      },
      validate : [],
      checked: true,
      secureTextEntry: true,
      loading: false
    };
  }

  componentDidMount() {
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

  doLogin() {
    
    var error = this.checkError(this.state.username.value, this.state.password.value, true, false);
    if(!error) {
      this.setLoadingVisible(true);
      var info = {loginid: this.state.username.value, password: this.state.password.value};
      var url = Constants.DEFAULT_SERVER + Constants.DEFAULT_AUTH_URI;
      fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(info),
      })
      .then((response) => response.json())
      .then((responseJson) => {
          if(responseJson.code === 200) {
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

              // tx.executeSql('DELETE FROM ' + Constants.TYPES_TBL, [], (tx, results) => {
                  
              // });

              // tx.executeSql('DELETE FROM ' + Constants.ACTIONS_TBL, [], (tx, results) => {
                  
              // });

              if(sql !== '') {
                tx.executeSql(sql, [], (tx, results) => {
                  console.log(results);
                });
              }
              
              if(sql1 !== '') {
                tx.executeSql(sql1, [], (tx, results) => {
                  console.log(results);
                });
              }

              var sql2 = 'INSERT INTO ' + Constants.USERS_TBL + ' VALUES(' + json.user_info.id + ', "' + json.user_info.loginid + '", "' + json.user_info.password + '")';
              tx.executeSql(sql2, [], (tx, results) => {
                console.log(results);
              });
            });
            this.setLoadingVisible(false);
            
            this.props.navigation.navigate('Home', {user_id : json.user_info.id});
          }

      })
      .catch((error) =>{
        this.setLoadingVisible(false);
        alert('error:' + error);
      });
    }
    
    return false;
  }

  doRegister() {
    Keyboard.dismiss();
    var error = this.checkError(this.state.username.value, this.state.password.value, true, true);
    if(!error) {
      Alert.alert(
        'Xác nhận',
        'Bạn có đồng ý đăng ký tài khoản dựa vào thông tin đã nhập không?',
        [
          {text: 'Bỏ qua', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'Đồng ý', onPress: this.doAccept },
        ],
        { cancelable: false }
      )
    }
    
    return false;
    
  }

  doAccept() {
    db.transaction((tx) => {
      tx.executeSql('INSERT INTO users(username, password) VALUES(\"' + this.state.username.value + '\",\"' + this.state.password.value + '\")', [], (tx, results) => {
          alert(results);
      });
    });
  }

  onChangeUsername(text) {
    this.setState({
      username : {
        value : text,
        style : Styles.inputText
      }
    });

    this.checkError(text, this.state.password.value, false, false);

  }

  onChangePassword(text) {
    this.setState({
      password : {
        value : text,
        style : Styles.inputText
      }
    });

    this.checkError(this.state.username.value, text, false, false);
  }

  checkError(username, password, onLoginClick, onRegisterClick) {
    var error = false;
    var validate = [];
    if(username === '') {
      this.setState({
        username : {
          value : '',
          style : Styles.errInput
        }
      });

      var error = {key: 'username_required'};
      validate.push(error);
      error = true;
    }

    if(password === '') {
      this.setState({
        password : {
          value : '',
          style : Styles.errInput
        }
      });
      var error = {key: 'password_required'};
      validate.push(error);
      error = true;
    }

    this.setState({
      validate : validate
    });

    return error;
  }

  setLoadingVisible(visible) {
    this.setState({loading: visible});
  }

  onChangeShowPassword() {
    this.setState({
      checked: !this.state.checked,
      secureTextEntry: !this.state.checked
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={Styles.container}>
            <View style={{flexDirection:'row'}}>
                <Image source={require('./images/logo.png')} style={{width: 70, height: 70}} />
            </View>
            <View style={{flexDirection:'row'}}>
              <TextInput
              underlineColorAndroid='transparent'
              style={this.state.username.style}
              onChangeText={ this.onChangeUsername }
              value={this.state.username.value}
              placeholder="Tên đăng nhập"
              />
            </View>
            <View style={{flexDirection:'row'}}>
              <TextInput
              underlineColorAndroid='transparent'
              style={this.state.password.style}
              onChangeText={ this.onChangePassword }
              value={this.state.password.value}
              placeholder="Mật khẩu"
              secureTextEntry={ this.state.secureTextEntry } 
              />
            </View>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:0.8, marginTop:10 }} >
                <View style={{ flexDirection: 'column'}}>
                  <View style={{ flexDirection: 'row' }}>
                    <CheckBox
                      value={this.state.checked}
                      onValueChange={ this.onChangeShowPassword }
                    />
                    <Text style={{marginTop: 5}}> Hiển thị mật khẩu</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={{flexDirection:'row'}}>
              <View style={{flex:0.8, marginTop:10, marginRight:5 }} >
                <TouchableOpacity onPress={this.doLogin}>
                  <Button
                  onPress={this.doLogin}
                  title="Đăng nhập"
                  color={ Constants.DEFAULT_COLOR }
                  accessibilityLabel="Learn more about this purple button"
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={{flexDirection:'row'}}>
              <View style={{flex:0.8, marginTop:10 }} >
                <FlatList
                  data={ this.state.validate }
                  renderItem={({item}) => <Text style={Styles.item}>*{ Constants.VALIDATE[item.key]}</Text>}
                />
              </View>
            </View>

            <View  style={{marginTop: 22}}>
              <Loading closeLoading= { this.setLoadingVisible  } visible = { this.state.loading } ></Loading>
            </View>
          </View>
        </TouchableWithoutFeedback>
    );
  }
}

