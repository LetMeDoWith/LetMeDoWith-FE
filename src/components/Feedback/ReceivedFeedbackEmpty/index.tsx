import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from 'styles/theme';

import notCaughtYetImage from 'assets/images/not_caught_yet.png';

/* 원본은 @3x로 추출한 300x201이라 1/3 크기로 그린다 */
const IMAGE_WIDTH = 100;
const IMAGE_HEIGHT = 67;

interface Props {
  onCertify: () => void;
}

/*
 * 아직 잡도리를 하나도 받지 못한 상태.
 * 이 상태는 인증 전에만 나오므로 인증 유도 버튼을 함께 둔다.
 */
const ReceivedFeedbackEmpty = ({ onCertify }: Props) => (
  <View style={styles.container}>
    <Text style={styles.title}>아직 들키지 않았다</Text>
    <Text style={styles.description}>잡도리받기 전에 인증해 주세요!</Text>
    <Image source={notCaughtYetImage} style={styles.image} />
    <Pressable style={styles.button} onPress={onCertify}>
      <Text style={styles.buttonText}>바로 인증하기</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.TYPOGRAPHY.TITLE_3,
  },
  description: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
    marginTop: 4,
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    marginTop: 24,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
  },
  buttonText: {
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { ReceivedFeedbackEmpty };
