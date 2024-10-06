import React from 'react';
import { StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';

import { Item } from 'components/Mypage/Setting/Notice';
import { theme } from 'styles/theme';
import type { SettingStackScreenProps } from 'types/shared';

const NoticeList = ({ navigation }: SettingStackScreenProps<'NOTICE'>) => (
  <View style={styles.container}>
    <Item
      type="NOTICE"
      title={'공지사항 일이삼사오육칠팔구영일이삼사오육칠팔구영일이삼사오육칠팔구영일이삼사오육칠팔구여잉ㄹ이삼사오육'}
      date={dayjs(new Date()).format('YYYY-MM-DD')}
      navigation={navigation}
    />
    <Item
      type="EVENT"
      title={'이벤트 일이삼사오육칠팔구영일이삼사오육칠팔구영일이삼사오육칠팔구영일이삼사오육칠팔구여잉ㄹ이삼사오육'}
      date={dayjs(new Date().setDate(new Date().getDate() - 1)).format('YYYY-MM-DD')}
      navigation={navigation}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 24,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
});

export { NoticeList };
