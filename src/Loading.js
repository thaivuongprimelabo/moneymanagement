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
  ActivityIndicator,
  Modal
} from 'react-native';

import Constants from './constants/Constants';
import Styles from './constants/Styles';
import CommonUtils from './utils/CommonUtils';

export default class  Loading extends Component<Props> {


  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
  }

  close() {
    this.props.closeLoading(false);
  }

  render() {

    return (
          <Modal
            animationType="fade"
            transparent={true}
            visible={this.props.visible}
            onRequestClose={ this.close }>

              <View style={{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(51,51,51,0.7)' }}>
                  <View style={{
                          width: 100,
                          height: 100}}>
                    <View style={Styles.loadingContainer}>
                      <View style={{flexDirection:'row'}}>
                        <ActivityIndicator size="large" color="#333333" />
                      </View>
                      <View style={{flexDirection:'row'}}>
                        <Text>Đang xử lý...</Text>
                      </View>
                    </View>
                  </View>
              </View>
          </Modal>
          
    );
  }
}