import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

import { KakaoLoginButton } from 'components/Login/KakaoLoginButton';
import { GoogleLoginButton } from 'components/Login/GoogleLoginButton';
import { AppleLoginButton } from 'components/Login/AppleLoginButton';

const Login = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Let Me Do</Text>
          <Text style={titleHighlight}>With</Text>
        </View>
        <View style={styles.subTitleWrap}>
          <Text style={styles.subTitle}>함께 갓생사는</Text>
          <Text style={styles.subTitle}>데일리 투두리스트 케어 서비스</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <KakaoLoginButton />
        <GoogleLoginButton />
        {Platform.OS === 'ios' && <AppleLoginButton />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: Dimensions.get('window').height,
    gap: 70,
  },
  titleContainer: {
    gap: 10,
  },
  buttonContainer: {
    gap: 10,
  },
  titleWrap: {
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
  },
  titleHighlight: {
    color: 'red',
  },
  subTitleWrap: {
    alignItems: 'center',
  },
  subTitle: {
    fontWeight: 'bold',
  },
});

const titleHighlight = StyleSheet.compose(styles.title, styles.titleHighlight);

export { Login };
