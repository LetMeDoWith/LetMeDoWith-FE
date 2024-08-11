import React from 'react';
import { View } from 'react-native';

import { BasicMenu } from 'components/Mypage/Setting/Menu';

const Policy = () => (
  <View>
    <BasicMenu title="서비스 이용약관" />
    <BasicMenu title="개인정보 처리방침" />
    <BasicMenu title="마케팅(이벤트) 정보 수신 동의" />
  </View>
);

export { Policy };
