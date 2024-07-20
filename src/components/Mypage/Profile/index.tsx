import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';

import { theme } from 'styles/theme';

const Profile = () => (
  <View style={styles.container}>
    <Pressable
      onPress={() => {
        console.log('click');
      }}
    >
      <Image
        style={styles.image}
        source={{
          uri: 'https://ichef.bbci.co.uk/news/1536/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg.webp',
        }}
      />
    </Pressable>
    <View style={styles.nicknameWrap}>
      <Text style={styles.nickname}>닉네임</Text>
      <Divider style={styles.divider} />
    </View>
    <View style={styles.followWrap}>
      <View style={[styles.followWrap, styles.followDetailWrap]}>
        <Text>팔로잉</Text>
        <Text>10K</Text>
      </View>
      <View style={[styles.followWrap, styles.followDetailWrap]}>
        <Text>팔로워</Text>
        <Text>0</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 31,
    paddingBottom: 26,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
  },
  nicknameWrap: {
    marginTop: 24,
  },
  followWrap: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 21,
  },
  followDetailWrap: {
    gap: 7,
    alignItems: 'center',
  },
  nickname: {
    fontSize: 18,
    fontWeight: '800',
  },
  divider: {
    marginTop: 6,
    height: 3,
    backgroundColor: theme.COLORS.PRIMARY.RED_500,
    borderRadius: 5,
  },
});

export { Profile };
