import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { SettingStackScreenProps } from 'types/shared';

const Setting = ({ navigation: { navigate } }: SettingStackScreenProps<'DEFAULT'>) => {
  return (
    <View>
      <Pressable
        onPress={() => {
          navigate('MYINFO');
        }}
      >
        <Text>클릭하면 내 정보 관리 스크린으로 이동</Text>
      </Pressable>
    </View>
  );
};

export { Setting };
