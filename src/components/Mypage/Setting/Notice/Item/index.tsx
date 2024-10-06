import React, { useCallback } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from 'styles/theme';
import type { NoticeType, SettingStackScreenProps } from 'types/shared';

interface Props extends Partial<Pick<SettingStackScreenProps<'NOTICE'>, 'navigation'>> {
  type: NoticeType;
  title: string;
  date: string;
}

const Item = ({ type, title, date, navigation }: Props) => {
  const onPress = useCallback(() => {
    if (!navigation) {
      return;
    }

    navigation.navigate('NOTICE_DETAIL', { type, title, date });
  }, [date, navigation, title, type]);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.contentType}>
        <Text>[{type === 'NOTICE' ? '공지' : '이벤트'}]</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text>{date}</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_600,
  },
  contentType: {
    flex: 1,
  },
  content: {
    gap: 14,
    flex: 4,
  },
  title: {
    width: Dimensions.get('window').width / 1.5,
  },
});

export { Item };
