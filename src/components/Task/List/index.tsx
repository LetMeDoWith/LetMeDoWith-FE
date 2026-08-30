import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme, FONT_FAMILY } from 'styles/theme';
import { Item } from 'components/Task';
import type { TaskModeType } from 'types/shared';
import type { dowithTaskSchemeType, todoTaskSchemeType } from 'types/task/scheme/api';
import type { Rect } from 'utils/onboarding';

interface Props {
  type: TaskModeType;
  items: dowithTaskSchemeType[] | todoTaskSchemeType[];
  year: number;
  month: number;
  selectedDate: string;
  /* 첫 두윗 온보딩이 가리킬 좌표. 두윗 목록의 첫 항목만 측정한다. */
  onMeasureOnboardingTargets?: (targets: { status: Rect; thunder: Rect }) => void;
}

const List = memo(({ type, items, year, month, selectedDate, onMeasureOnboardingTargets }: Props) => {
  const isDoWithMode = type === 'DOWITH';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.chipWrap,
          { backgroundColor: isDoWithMode ? theme.COLORS.PRIMARY.RED_98 : theme.COLORS.GRAY_SCALE.GRAY_96 },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: isDoWithMode ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.GRAY_SCALE.GRAY_20 },
          ]}
        >
          {isDoWithMode ? 'DORI' : 'TODO'}
        </Text>
      </View>
      <View style={styles.items}>
        {items.map(({ id, ...rest }, index) => (
          <Item
            key={id}
            onMeasureOnboardingTargets={isDoWithMode && index === 0 ? onMeasureOnboardingTargets : undefined}
            id={id}
            mode={isDoWithMode ? 'DOWITH' : 'TODO'}
            year={year}
            month={month}
            selectedDate={selectedDate}
            {...rest}
          />
        ))}
      </View>
    </View>
  );
});
List.displayName = 'List';

const styles = StyleSheet.create({
  /* 라벨과 아이템 묶음 사이 간격 */
  container: {
    gap: 16,
  },
  /* 아이템끼리의 간격 */
  items: {
    gap: 12,
  },
  chipWrap: {
    alignSelf: 'flex-start',
    height: 26,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  chipText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: theme.COLORS.DEFAULT.BLACK,
  },
});

export { List };
