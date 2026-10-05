import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BasicMenu } from 'components/Mypage/Setting/Menu';
import { POLICY_URL } from 'constants/shared';
import { openExternalUrl } from 'utils/linking';

const Policy = () => (
  <View style={styles.container}>
    <BasicMenu title="서비스 이용약관" isArrowVisible onPress={() => openExternalUrl(POLICY_URL.TERMS_OF_SERVICE)} />
    <BasicMenu title="개인정보 처리방침" isArrowVisible onPress={() => openExternalUrl(POLICY_URL.PRIVACY)} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});

export { Policy };
