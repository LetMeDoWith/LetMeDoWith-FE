import React, { Dispatch, SetStateAction } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

import { KakaoLoginButton } from 'components/Login/KakaoLoginButton';
import { GoogleLoginButton } from 'components/Login/GoogleLoginButton';
import { AppleLoginButton } from 'components/Login/AppleLoginButton';

export interface Props {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
}

const Login = ({ setIsLoggedIn }: Props) => {
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
        <KakaoLoginButton setIsLoggedIn={setIsLoggedIn} />
        <GoogleLoginButton setIsLoggedIn={setIsLoggedIn} />
        {Platform.OS === 'ios' && <AppleLoginButton setIsLoggedIn={setIsLoggedIn} />}
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
