import { Alert, Dimensions, Pressable, StyleSheet, Text } from 'react-native';
import { login } from '@react-native-seoul/kakao-login';

import SvgIcon from '@components/common/SvgIcon';

const KakaoLoginButton = () => {
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

  return (
    <Pressable style={styles.container} onPress={signInWithKakao}>
      <SvgIcon name="KakaoSymbol" size={20} />
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
