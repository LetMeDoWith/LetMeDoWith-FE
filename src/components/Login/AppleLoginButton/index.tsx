import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import appleAuth from '@invertase/react-native-apple-authentication';

import { AppleSymbol } from 'components/common/icons/AppleSymbol';
import { useAuthToken } from 'hooks/auth/useAuthToken';
import { ProviderEnum } from 'schemes/auth/enum';

import { theme } from 'styles/theme';

const AppleLoginButton = () => {
  const [_, setIdToken] = useAuthToken(ProviderEnum.enum.APPLE);

  const signInWithApple = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });

      if (!appleAuthRequestResponse.identityToken) {
        console.error('APPLE identify token이 존재하지 않습니다.');
        return;
      }
      setIdToken(appleAuthRequestResponse.identityToken);
    } catch (error: any) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.warn('사용자가 로그인을 취소하였습니다.');
      } else {
        console.error('애플 로그인에서 에러가 발생했습니다.: ', error);
      }
    }
  };

  useEffect(() => {
    return appleAuth.onCredentialRevoked(async () => {
      console.warn('유저 권한이 해제되었습니다.');
    });
  }, []);

  return (
    <Pressable style={styles.container} onPress={signInWithApple}>
      {/* 사과 글리프는 세로가 긴 17:21 비율이라 높이를 25에 맞추고 너비는 비례로 준다 */}
      <AppleSymbol width={20} height={25} />
      <Text style={styles.title}>Apple로 계속하기</Text>
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
    backgroundColor: theme.COLORS.DEFAULT.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    fontSize: 30,
    borderRadius: 12,
  },

  title: {
    ...theme.TYPOGRAPHY.SUB_TITLE,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { AppleLoginButton };
