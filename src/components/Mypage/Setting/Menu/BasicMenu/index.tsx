import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { IconButton } from 'react-native-paper';

import { theme } from 'styles/theme';

interface Props {
  title: string;
  onPress?: () => void;
  isArrowVisible?: boolean;
  content?: string;
}

const BasicMenu = ({ title, onPress, isArrowVisible = true, content }: Props) => (
  <Pressable
    style={isArrowVisible ? styles.container : [styles.container, { paddingVertical: 18, paddingHorizontal: 24 }]}
    onPress={onPress}
  >
    <Text>{title}</Text>
    {isArrowVisible && <IconButton icon="chevron-right" iconColor={theme.COLORS.DEFAULT.BLACK} size={24} />}
    {!isArrowVisible && content && <Text>{content}</Text>}
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 24,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_400,
  },
});

export { BasicMenu };
