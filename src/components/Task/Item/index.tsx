import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { TaskSuccess } from 'components/common/icons/DoWithModeSuccess';
import { EtcDots } from 'components/common/icons/EtcDots';
import { theme } from 'styles/theme';
import type { TaskModeType } from 'types/shared';

interface Props {
  mode: TaskModeType;
}

const Item = ({ mode }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {/* TODO: task 상태에 맞는 아이콘 처리 */}
        <TaskSuccess mode={mode} />
        <View style={styles.info}>
          <Text style={styles.title}>푸쉬업하기</Text>
          <View style={styles.option}>
            <Text>12:00</Text>
            <Text> • </Text>
            <Text>9:00</Text>
          </View>
        </View>
      </View>
      <View style={styles.rightContainer}>
        {mode === 'DOWITH' && (
          <Image
            borderRadius={50}
            width={24}
            height={24}
            source={{
              uri: 'https://media.bunjang.co.kr/images/crop/981758465_w320.jpg',
            }}
          />
        )}
        {/* TODO: task 상태에 맞는 disabled 처리 */}
        <EtcDots />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rightContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  info: {
    gap: 4,
  },
  title: {
    fontSize: 14,
    color: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  option: {
    flexDirection: 'row',
  },
});

export { Item };
