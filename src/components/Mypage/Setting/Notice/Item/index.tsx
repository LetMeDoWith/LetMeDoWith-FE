import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';

import { theme } from 'styles/theme';
import type { NoticeType, SettingStackScreenProps } from 'types/shared';

interface Props extends Partial<Pick<SettingStackScreenProps<'NOTICE'>, 'navigation'>> {
  id: number;
  type: NoticeType;
  title: string;
  date: string;
}

const Item = ({ id, type, title, date, navigation }: Props) => {
  const onPress = useCallback(() => {
    if (!navigation) {
      return;
    }

    navigation.navigate('NOTICE_DETAIL', { noticeId: id });
  }, [id, navigation]);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.contentType}>
        <Text style={styles.typeText}>[{type === 'NOTICE' ? '공지' : '이벤트'}]</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.date}>{dayjs(date).format('YYYY.MM.DD')}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 11,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  contentType: {
    flex: 1,
  },
  typeText: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
  content: {
    gap: 8,
    flex: 4,
  },
  title: {
    ...theme.TYPOGRAPHY.BODY_1,
  },
  date: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
});

export { Item };
