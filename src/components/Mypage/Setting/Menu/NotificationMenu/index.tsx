import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';

import { theme } from 'styles/theme';

interface Props {
  title: string;
  subTitle: string;
  value: boolean;
  handleValue: () => void;
  isLast?: boolean;
}

const NotificationMenu = ({ title, subTitle, value, handleValue, isLast }: Props) => {
  const [isSwitchOn, setIsSwitchOn] = React.useState(value);

  const onToggleSwitch = useCallback(() => {
    setIsSwitchOn(!isSwitchOn);
    handleValue();
  }, [isSwitchOn]);

  return (
    <View
      style={[
        styles.container,
        !isLast && { borderBottomWidth: 0.5, borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_92 },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subTitle}>{subTitle}</Text>
      </View>
      <Switch value={isSwitchOn} color={theme.COLORS.PRIMARY.RED_60} onValueChange={onToggleSwitch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 16,
  },
  subTitle: {
    fontSize: 14,
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
    maxWidth: Dimensions.get('window').width - 100,
  },
});

export { NotificationMenu };
