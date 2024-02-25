import { Alert, Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import SvgIcon from '@components/common/SvgIcon';

const GoogleLoginButton = () => {
  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result = await GoogleSignin.signIn();
    Alert.alert('google result', JSON.stringify(result, null, 2));
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
