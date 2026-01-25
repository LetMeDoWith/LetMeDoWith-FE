import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { theme } from 'styles/theme';
import { ArrowRight } from 'components/common/icons/ArrowIcon';

interface Props {
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  isArrowVisible?: boolean;
  content?: string;
}

const BasicMenu = ({ title, style, onPress, isArrowVisible, content }: Props) => (
  <Pressable style={[styles.container, style]} onPress={onPress}>
    <Text>{title}</Text>
    {isArrowVisible && <ArrowRight fill={theme.COLORS.GRAY_SCALE.GRAY_40} />}
    {!isArrowVisible && content && <Text>{content}</Text>}
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
});

export { BasicMenu };
