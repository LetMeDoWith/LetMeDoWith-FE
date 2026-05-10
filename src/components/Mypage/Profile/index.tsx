import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { EditIcon } from 'components/common/icons/EditIcon';
import { theme } from 'styles/theme';
import type { RootStackParamList } from 'types/shared';
import type { myDowithInfoResponseSchemeType } from 'types/member/scheme/api';

interface Props {
  data: myDowithInfoResponseSchemeType['data'];
}

const Profile = ({ data }: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.container}>
      <Image style={styles.profileImage} source={{ uri: data.profileImageUrl }} />
      <Pressable style={styles.nicknameRow} onPress={() => navigation.navigate('SETTING', { screen: 'MYINFO' })}>
        <Text style={styles.nickname}>{data.nickname}</Text>
        <EditIcon />
      </Pressable>
      <Text style={styles.selfDescription}>{data.selfDescription}</Text>
      <View style={styles.statBadge}>
        <Text style={styles.statLabel}>성공한 두윗</Text>
        <Text style={styles.statCount}>
          <Text style={styles.statCountHighlight}>{data.successDowithCount}</Text> 개
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    alignItems: 'center',
  },
  profileImage: {
    width: 107,
    height: 107,
    borderRadius: 35,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 16,
  },
  nickname: {
    ...theme.TYPOGRAPHY.TITLE_1,
  },
  selfDescription: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
    marginTop: 2,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 41,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_98,
  },
  statLabel: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
  statCount: {
    ...theme.TYPOGRAPHY.SUB_TITLE,
  },
  statCountHighlight: {
    ...theme.TYPOGRAPHY.SUB_TITLE,
    color: theme.COLORS.SECONDARY.BLUE_50,
  },
});

export { Profile };
