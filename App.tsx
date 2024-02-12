import React, { useEffect } from 'react';
import { Alert, Button, SafeAreaView } from 'react-native';
import Config from 'react-native-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { login } from '@react-native-seoul/kakao-login';

const signInWithKakao = async () => {
  return await login()
    .then(result => {
      console.log('result: ', result);
      Alert.alert('result', JSON.stringify(result, null, 2));
      return result;
    })
    .catch(error => {
      console.log('Error: ', error);
      throw error;
    });
};

const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  Alert.alert('google result', JSON.stringify(result, null, 2));
};

function App(): React.JSX.Element {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  return (
    <SafeAreaView>
      <Button title="카카오 로그인" onPress={signInWithKakao} />
      <Button title="구글 로그인" onPress={signInWithGoogle} />
      <Button title="애플 로그인(구현 예정)" />
    </SafeAreaView>
  );
}

export default App;
