import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

import { Item } from 'components/Mypage/Setting/Notice';
import { theme } from 'styles/theme';
import type { SettingStackScreenProps } from 'types/shared';

const NoticeDetail = ({ route: { params } }: SettingStackScreenProps<'NOTICE_DETAIL'>) => {
  const { type, title, date } = params;

  return (
    <View style={styles.container}>
      <Item type={type} title={title} date={date} />
      <Text>공지사항 & 이벤트 테스트 내용입니다</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('window').height,
    paddingHorizontal: 24,
    gap: 26,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
});

export { NoticeDetail };
