import { StyleSheet, Text, View } from 'react-native';

import { theme } from 'styles/theme';
import { Item } from 'components/Task';
import type { TaskModeType } from 'types/shared';
import type { dowithTaskSchemeType, todoTaskSchemeType } from 'types/task/scheme/api';

interface Props {
  type: TaskModeType;
  items: dowithTaskSchemeType[] | todoTaskSchemeType[];
  year: number;
  month: number;
}

const List = ({ type, items, year, month }: Props) => {
  const isDoWithMode = type === 'DOWITH';

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.chipWrap,
          { backgroundColor: isDoWithMode ? theme.COLORS.PRIMARY.RED_98 : theme.COLORS.SECONDARY.BLUE_95 },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: isDoWithMode ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.SECONDARY.BLUE_60 },
          ]}
        >
          {isDoWithMode ? 'DO WITH' : ' TO DO'}
        </Text>
      </View>
      {items.map(({ id, ...rest }) => (
        <Item key={id} id={id} mode={isDoWithMode ? 'DOWITH' : 'TODO'} year={year} month={month} {...rest} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  chipWrap: {
    alignSelf: 'flex-start',
    height: 26,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: theme.COLORS.SECONDARY.BLUE_95,
    borderRadius: 100,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.COLORS.DEFAULT.BLACK,
  },
});

export { List };
