import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import comingSoonImage from 'assets/images/coming_soon.png';

const Dashboard = () => (
  <View style={styles.container}>
    <Image source={comingSoonImage} style={styles.image} resizeMode="contain" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});

export { Dashboard };
