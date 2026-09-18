import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import { BasicMenu } from 'components/Mypage/Setting/Menu';
import { showSnackbar, SNACKBAR_TYPE } from 'stores/snackbarStore';

/* 약관 원문은 노션 문서로 관리한다. 앱 내 뷰어가 없어 외부 브라우저로 연다. */
const POLICY_URL = {
  TERMS_OF_SERVICE: 'https://app.notion.com/p/5f4ae42e50364b10a67799c2675ea3f6?source=copy_link',
  PRIVACY: 'https://app.notion.com/p/afd1661a34734eae9696511f2f511d3d?source=copy_link&__dm_a=1',
} as const;

const openPolicy = (url: string) => async () => {
  try {
    await Linking.openURL(url);
  } catch {
    showSnackbar('페이지를 열 수 없어요. 잠시 후 다시 시도해주세요.', { type: SNACKBAR_TYPE.ERROR });
  }
};

const Policy = () => (
  <View style={styles.container}>
    <BasicMenu title="서비스 이용약관" isArrowVisible onPress={openPolicy(POLICY_URL.TERMS_OF_SERVICE)} />
    <BasicMenu title="개인정보 처리방침" isArrowVisible onPress={openPolicy(POLICY_URL.PRIVACY)} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});

export { Policy };
