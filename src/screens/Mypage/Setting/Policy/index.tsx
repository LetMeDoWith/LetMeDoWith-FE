import React from 'react';
import { View } from 'react-native';

import { Menu } from 'components/Mypage/Setting/Menu';

const Policy = () => (
  <View>
    <Menu title="서비스 이용약관" />
    <Menu title="개인정보 처리방침" />
    <Menu title="마케팅(이벤트) 정보 수신 동의" />
  </View>
);

export { Policy };
