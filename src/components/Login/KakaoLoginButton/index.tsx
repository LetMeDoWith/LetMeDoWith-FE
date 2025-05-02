import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import { login } from '@react-native-seoul/kakao-login';

import { KakaoSymbol } from 'components/common/icons/KakaoSymbol';
import { useAuthToken } from 'hooks/auth/useAuthToken';
import { ProviderEnum } from 'schemes/auth/enum';

const KakaoLoginButton = () => {
  const [_, setIdToken] = useAuthToken(ProviderEnum.enum.KAKAO);

  const signInWithKakao = async () => {
    return await login()
      .then(result => {
        if (!result.idToken) {
          throw 'identify token이 존재하지 않습니다.';
        }
        setIdToken(result.idToken);
      })
      .catch(error => {
        console.log('Error: ', error);
        throw error;
      });
  };

  return (
    <Pressable style={styles.container} onPress={signInWithKakao}>
      <KakaoSymbol />
      <Text>카카오 계정으로 로그인</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: Dimensions.get('window').width - 60,
    backgroundColor: '#FEE500',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 30,
    borderRadius: 12,
  },
});

export { KakaoLoginButton };
