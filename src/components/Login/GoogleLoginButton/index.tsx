import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import Config from 'react-native-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import SvgIcon from '@components/common/SvgIcon';
import { Props } from '@screens/Login';

const GoogleLoginButton = ({ setIsLoggedIn }: Props) => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const result = await GoogleSignin.signIn();
      if (!result.idToken) {
        throw 'identify token이 존재하지 않습니다.';
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Pressable style={styles.container} onPress={signInWithGoogle}>
      <SvgIcon name="GoogleSymbol" size={18} />
      <Text style={styles.label}>구글 계정으로 로그인</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 40,
    paddingHorizontal: 8,
    width: Dimensions.get('window').width - 60,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
  },
});

export { GoogleLoginButton };
