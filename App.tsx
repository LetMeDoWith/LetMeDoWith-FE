import React from 'react';
import { Alert, Button, SafeAreaView } from 'react-native';

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

function App(): React.JSX.Element {
  return (
    <SafeAreaView>
      <Button title="카카오 로그인" onPress={signInWithKakao} />
      <Button title="구글 로그인(구현 예정)" />
      <Button title="애플 로그인(구현 예정)" />
    </SafeAreaView>
  );
}

export default App;
