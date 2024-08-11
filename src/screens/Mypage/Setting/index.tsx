import React, { useCallback } from 'react';
import { View } from 'react-native';

import type { SettingStackParamList, SettingStackScreenProps } from 'types/shared';
import { BasicMenu } from 'components/Mypage/Setting/Menu';

const Setting = ({ navigation: { navigate } }: SettingStackScreenProps<'DEFAULT'>) => {
  const onPress = useCallback((name: keyof SettingStackParamList) => () => navigate(name), [navigate]);

  return (
    <View>
      <BasicMenu title="내 정보 관리" onPress={onPress('MYINFO')} />
      <BasicMenu title="알림설정" onPress={onPress('NOTIFICATION')} />
      <BasicMenu title="이용약관" onPress={onPress('POLICY')} />
      <BasicMenu title="버전 정보" isArrowVisible={false} content="v0.0.0" />
    </View>
  );
};

export { Setting };
