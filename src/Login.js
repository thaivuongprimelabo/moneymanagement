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
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      password: {
        value : Constants.EMPTY,
        style : Styles.inputText
      },
      validate : [],
      checked: true,
      secureTextEntry: true
    };
  }

  doLogin() {
    
    var error = this.checkError(this.state.username.value, this.state.password.value, true, false);
    if(!error) {
      this.props.navigation.navigate('Home', {increaseCount: null});
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

    if(!error) {
      if(onLoginClick && !onRegisterClick && (username !== Constants.DEFAULT_USER || password != Constants.DEFAULT_PASSWORD)) {
        error = true;
        var error = {key: 'invalid_account'};
        validate.push(error);
      }
    }

    this.setState({
      validate : validate
    });

    return error;
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
          </View>
        </TouchableWithoutFeedback>
    );
  }
}

