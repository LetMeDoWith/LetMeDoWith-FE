import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';

interface Props {
  title: string;
  subTitle: string;
}

const NotificationMenu = ({ title, subTitle }: Props) => {
  const [isSwitchOn, setIsSwitchOn] = React.useState(false);

  const onToggleSwitch = useCallback(() => setIsSwitchOn(!isSwitchOn), [isSwitchOn]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subTitle}>{subTitle}</Text>
      </View>
      <Switch value={isSwitchOn} color={theme.COLORS.PRIMARY.RED_500} onValueChange={onToggleSwitch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    paddingRight: isAos ? 12 : 24,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_600,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 16,
  },
  subTitle: {
    fontSize: 14,
    color: theme.COLORS.GRAY_SCALE.GRAY_600,
    maxWidth: Dimensions.get('window').width - 100,
  },
});

export { NotificationMenu };
