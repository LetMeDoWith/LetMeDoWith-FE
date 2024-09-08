import React, { useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';

import { theme } from 'styles/theme';

interface Props {
  uri: string;
  name: string;
  size: number;
}

const Badge = ({ uri, name, size }: Props) => {
  const handlePress = useCallback(() => {
    console.log('click!');
  }, []);

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Image
        borderRadius={50}
        width={size}
        height={size}
        source={{
          uri,
        }}
      />
      <Text style={styles.name}>{name}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  name: { fontSize: 14, fontWeight: 'bold', color: theme.COLORS.DEFAULT.BLACK },
});

export { Badge };
