import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import type { SettingStackParamList, SettingStackScreenProps } from 'types/shared';
import { BasicMenu } from 'components/Mypage/Setting/Menu';
import { APP_VERSION } from 'constants/shared';

const Setting = ({ navigation: { navigate } }: SettingStackScreenProps<'DEFAULT'>) => {
  const onPress = useCallback(
    (name: keyof SettingStackParamList, params?: SettingStackParamList[keyof SettingStackParamList]) => () => {
      if (name === 'NOTICE_DETAIL' && params) {
        navigate(name, params);
        return;
      }

      navigate(name as Exclude<keyof SettingStackParamList, 'NOTICE_DETAIL'>);
    },
    [navigate],
  );

  return (
    <View style={styles.container}>
      <BasicMenu title="내 정보 관리" onPress={onPress('MYINFO')} isArrowVisible />
      <BasicMenu title="알림설정" onPress={onPress('NOTIFICATION')} isArrowVisible />
      <BasicMenu title="이벤트 & 공지사항" onPress={onPress('NOTICE')} isArrowVisible />
      <BasicMenu title="이용약관" onPress={onPress('POLICY')} isArrowVisible />
      <BasicMenu title="계정 관리" onPress={onPress('ACCOUNT')} isArrowVisible />
      <BasicMenu title="버전 정보" content={APP_VERSION} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});

export { Setting };
