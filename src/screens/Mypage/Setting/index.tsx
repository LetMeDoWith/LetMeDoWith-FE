import React, { useCallback } from 'react';
import { View } from 'react-native';

import type { SettingStackParamList, SettingStackScreenProps } from 'types/shared';
import { Menu } from 'components/Mypage/Setting/Menu';

const Setting = ({ navigation: { navigate } }: SettingStackScreenProps<'DEFAULT'>) => {
  const onPress = useCallback((name: keyof SettingStackParamList) => () => navigate(name), [navigate]);

  return (
    <View>
      <Menu title="내 정보 관리" onPress={onPress('MYINFO')} />
      <Menu title="알림설정" onPress={onPress('NOTIFICATION')} />
      <Menu title="이용약관" onPress={onPress('POLICY')} />
      <Menu title="버전 정보" isArrowVisible={false} content="v0.0.0" />
    </View>
  );
};

export { Setting };
