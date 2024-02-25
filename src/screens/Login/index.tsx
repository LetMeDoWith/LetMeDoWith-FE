import React from 'react';
import { Alert, Button, Dimensions, StyleSheet, Text, View } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { KakaoLoginButton } from '@components/Login/KakaoLoginButton';

const Login = () => {
  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();
    Alert.alert('google result', JSON.stringify(result, null, 2));
  };

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
        <Button title="구글 로그인" onPress={signInWithGoogle} />
        <Button title="애플 로그인(구현 예정)" />
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
