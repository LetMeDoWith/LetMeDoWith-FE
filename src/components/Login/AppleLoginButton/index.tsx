import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import appleAuth from '@invertase/react-native-apple-authentication';

import { AppleSymbol } from 'components/common/icons/AppleSymbol';
import { useAuthToken } from 'hooks/auth/useAuthToken';
import { ProviderEnum } from 'schemes/auth/enum';

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
      <AppleSymbol width={44} height={44} />
      <Text style={styles.title}>애플 계정으로 로그인</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    width: Dimensions.get('window').width - 60,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 30,
    borderRadius: 12,
  },

  title: {
    color: '#FFF',
  },
});

export { AppleLoginButton };
