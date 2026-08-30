import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import Config from 'react-native-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { GoogleSymbol } from 'components/common/icons/GoogleSymbol';
import { useAuthToken } from 'hooks/auth/useAuthToken';
import { ProviderEnum } from 'schemes/auth/enum';

import { theme } from 'styles/theme';

const GoogleLoginButton = () => {
  const [_, setIdToken] = useAuthToken(ProviderEnum.enum.GOOGLE);

  /*
    계정 선택 창이 떠 있는 동안 버튼이 다시 눌리면 signIn이 중복 호출되어
    "Sign-in in progress"로 거부되고 앞선 promise도 유실된다.
    ref는 연타를 동기적으로 막고(상태 갱신은 비동기라 연타에서 두 번 통과한다),
    state는 버튼 비활성화 표시에만 쓴다.
  */
  const isSigningInRef = useRef(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signInWithGoogle = async () => {
    if (isSigningInRef.current) {
      return;
    }
    isSigningInRef.current = true;
    setIsSigningIn(true);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (!result.idToken) {
        console.error('GOOGLE identify token이 존재하지 않습니다.');
        return;
      }
      setIdToken(result.idToken);
    } catch (error) {
      console.error('구글 로그인에서 에러가 발생했습니다.: ', error);
    } finally {
      isSigningInRef.current = false;
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  return (
    <Pressable style={styles.container} onPress={signInWithGoogle} disabled={isSigningIn}>
      <GoogleSymbol width={25} height={25} />
      <Text style={styles.label}>구글로 계속하기</Text>
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
    paddingHorizontal: 8,
    width: BUTTON_WIDTH,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    /* 시안은 그림자가 아니라 얇은 테두리다. */
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    borderRadius: 12,
  },
  label: theme.TYPOGRAPHY.SUB_TITLE,
});

export { GoogleLoginButton };
