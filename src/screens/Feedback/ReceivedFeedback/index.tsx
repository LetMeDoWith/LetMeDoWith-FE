import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';

import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';
import { theme } from 'styles/theme';
import type { RootStackParamList } from 'types/shared';

import dowithFailImage from 'assets/images/dowith_fail.png';

const FailHeader = () => (
  <View style={styles.failHeader}>
    <Text style={styles.failTitle}>앗 실패했다</Text>
    <Text style={styles.failDescription}>다음엔 인증해줄거지?</Text>
    <Image source={dowithFailImage} style={styles.failImage} resizeMode="contain" />
  </View>
);

const ReceivedFeedbackScreen = ({ route }: StackScreenProps<RootStackParamList, 'RECEIVED_FEEDBACK'>) => {
  const { dowithTaskId } = route.params;

  return (
    <View style={styles.container}>
      <ReceivedFeedbackContent dowithTaskId={dowithTaskId} headerComponent={<FailHeader />} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    // backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  failHeader: {
    alignItems: 'center',
    paddingTop: 16,
    backgroundColor: theme.COLORS.SECONDARY.BLUE_97,
    borderRadius: 16,
    marginTop: 20,
  },
  failTitle: {
    ...theme.TYPOGRAPHY.BODY_1,
  },
  failDescription: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_40,
    marginTop: 4,
  },
  failImage: {
    width: 86,
    height: 56,
    marginTop: 12,
  },
});

export { ReceivedFeedbackScreen };
