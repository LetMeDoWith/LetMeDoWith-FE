import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Popover, { PopoverPlacement } from 'react-native-popover-view';
import { Chip, Divider, ProgressBar } from 'react-native-paper';

import { theme } from 'styles/theme';
import { QuestionCircle } from 'components/common/icons/QuestionCircle';

const Dashboard = () => {
  const renderTitle = useCallback(
    (title: string, popOverContent: string) => (
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        <Popover
          from={
            <Pressable>
              <QuestionCircle />
            </Pressable>
          }
          placement={PopoverPlacement.BOTTOM}
          backgroundStyle={styles.popoverBackground}
          offset={4}
          popoverStyle={styles.popoverStyle}
        >
          <Text style={styles.popoverTitle}>{popOverContent}</Text>
        </Popover>
      </View>
    ),
    [],
  );

  const renderDailyDoWithContent = useCallback(
    (title: string, count: number, allCount: number) => (
      <Pressable
        style={styles.countViewWrap}
        onPress={() => {
          console.log('click!');
        }}
      >
        <Text>{title}</Text>
        <View style={styles.countView}>
          <Text style={styles.count}>{count}</Text>
          <Text> / {allCount}</Text>
        </View>
      </Pressable>
    ),
    [],
  );

  const renderChip = useCallback(
    (isHighlight: boolean, position: 'center' | 'right') => (
      <Chip
        style={[
          styles.chip,
          isHighlight && { backgroundColor: theme.COLORS.PRIMARY.RED_500 },
          position === 'right' && { marginLeft: 'auto' },
        ]}
        textStyle={styles.chipText}
      >
        두윗+1
      </Chip>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {renderTitle('데일리 두윗', '사용한 두윗모드, 잔소리는\n매일 00시에 초기화됩니다.')}
      <Divider style={styles.divider} />
      {renderDailyDoWithContent('사용한 두윗모드', 0, 1)}
      <Divider style={styles.divider} />
      {renderDailyDoWithContent('사용한 잔소리', 0, 30)}
      <Divider style={styles.divider} />
      {renderTitle('데일리 리워드', '잔소리를 발송하면 두윗모드\n를 추가로 등록 할 수 있어요.')}
      <View style={styles.rewordContentWrap}>
        <Text style={styles.renderContent}>두윗모드 추가 획득까지</Text>
        <Text style={styles.renderContent}>
          <Text style={[styles.renderContent, { color: theme.COLORS.PRIMARY.RED_500 }]}>3번</Text>의 잔소리가 필요해요!
        </Text>
      </View>
      <Pressable
        style={{ gap: 3 }}
        onPress={() => {
          console.log('click!!');
        }}
      >
        <View style={styles.progressBarCountWrap}>
          <Text style={styles.progressBarCount}>1</Text>
          <Text style={styles.progressBarCount}>3</Text>
          <Text style={styles.progressBarCount}>6</Text>
        </View>
        <ProgressBar style={styles.progressBar} progress={0.5} color={theme.COLORS.PRIMARY.RED_500} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 7 }}>
          {renderChip(true, 'center')}
          {renderChip(false, 'right')}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  popoverStyle: { backgroundColor: theme.COLORS.DEFAULT.BLACK, paddingVertical: 12, paddingHorizontal: 8 },
  popoverBackground: { opacity: 0 },
  popoverTitle: { color: theme.COLORS.DEFAULT.WHITE, textAlign: 'center' },
  countViewWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countView: { flexDirection: 'row', alignItems: 'baseline' },
  count: {
    fontWeight: '400',
    fontSize: 32,
  },
  divider: {
    marginVertical: 10,
    opacity: 0.5,
  },
  rewordContentWrap: {
    alignItems: 'center',
    marginVertical: 20,
  },
  renderContent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: { borderRadius: 10, height: 12 },
  progressBarCountWrap: { flexDirection: 'row', justifyContent: 'space-between' },
  progressBarCount: { fontSize: 8 },
  chip: {
    marginLeft: '40%',
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_600,
    borderRadius: 15,
  },
  chipText: {
    fontSize: 10,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { Dashboard };
