import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { theme } from 'styles/theme';

interface Props {
  uri: string;
  name?: string;
  isRepresentative?: boolean;
  onPress?: () => void;
}

const size = Dimensions.get('window').width / 3 - 48;

const Badge = ({ uri, name, isRepresentative, onPress }: Props) => (
  <Pressable style={styles.container} onPress={onPress}>
    {uri ? (
      <>
        {isRepresentative && (
          <View style={styles.representativeBadge}>
            <Text style={styles.representativeText}>대표</Text>
          </View>
        )}
        <Image
          style={isRepresentative && styles.representativeImage}
          borderRadius={50}
          width={size}
          height={size}
          source={{
            uri,
          }}
        />
      </>
    ) : (
      <View style={styles.emptyBadge}>
        <IconButton icon="lock" iconColor={theme.COLORS.DEFAULT.WHITE} size={35} />
      </View>
    )}
    {name && <Text style={styles.name}>{name}</Text>}
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  emptyBadge: {
    borderRadius: 40,
    width: size,
    height: size,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: { fontSize: 14, fontWeight: 'bold', color: theme.COLORS.DEFAULT.BLACK },
  representativeBadge: {
    position: 'absolute',
    top: -5,
    zIndex: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    backgroundColor: theme.COLORS.PRIMARY.RED_500,
  },
  representativeText: {
    color: theme.COLORS.DEFAULT.WHITE,
    fontSize: 10,
  },
  representativeImage: {
    borderWidth: 2,
    borderColor: theme.COLORS.PRIMARY.RED_500,
  },
});

export { Badge };
