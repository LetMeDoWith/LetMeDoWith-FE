import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BasicMenu } from 'components/Mypage/Setting/Menu';

const Policy = () => (
  <View style={styles.container}>
    <BasicMenu title="서비스 이용약관" isArrowVisible />
    <BasicMenu title="개인정보 처리방침" isArrowVisible />
    <BasicMenu title="마케팅(이벤트) 정보 수신 동의" isArrowVisible />
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});

export { Policy };
