import { StyleSheet, Text, View } from 'react-native';

import type { TaskModeType } from 'types/shared';
import { theme } from 'styles/theme';
import { Item } from 'components/Task';

interface Props {
  type: TaskModeType;
}

const List = ({ type }: Props) => {
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
      <Item mode={isDoWithMode ? 'DOWITH' : 'TODO'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
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
