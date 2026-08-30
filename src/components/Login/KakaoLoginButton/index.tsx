import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import { login } from '@react-native-seoul/kakao-login';

import { KakaoSymbol } from 'components/common/icons/KakaoSymbol';
import { useAuthToken } from 'hooks/auth/useAuthToken';
import { ProviderEnum } from 'schemes/auth/enum';

import { theme } from 'styles/theme';

const KakaoLoginButton = () => {
  const [_, setIdToken] = useAuthToken(ProviderEnum.enum.KAKAO);

  const signInWithKakao = async () => {
    return await login()
      .then(result => {
        if (!result.idToken) {
          console.error('KAKAO identify token이 존재하지 않습니다.');
          return;
        }
        setIdToken(result.idToken);
      })
      .catch(error => {
        console.error('카카오 로그인에서 에러가 발생했습니다.: ', error);
      });
  };

  return (
    <Pressable style={styles.container} onPress={signInWithKakao}>
      <KakaoSymbol width={25} height={25} />
      <Text style={styles.label}>카카오로 계속하기</Text>
    </Pressable>
  );
};

/* 시안 근사값 — 세 버튼이 같은 폭·높이를 쓴다. */
const BUTTON_WIDTH = Dimensions.get('window').width - 42;
const BUTTON_HEIGHT = 47;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: BUTTON_HEIGHT,
    paddingHorizontal: 20,
    width: BUTTON_WIDTH,
    backgroundColor: '#FEEA00',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    fontSize: 30,
    borderRadius: 12,
  },
  label: theme.TYPOGRAPHY.SUB_TITLE,
});

export { KakaoLoginButton };
