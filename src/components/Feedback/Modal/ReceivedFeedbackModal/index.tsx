import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CancelIcon } from 'components/common/icons/CancelIcon';
import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';
import { theme } from 'styles/theme';

import dowithFailImage from 'assets/images/dowith_fail.png';

interface Props {
  visible: boolean;
  dowithTaskId: number;
  onClose: () => void;
}

const FailHeader = () => (
  <View style={styles.failHeader}>
    <Text style={styles.failTitle}>앗 실패했다</Text>
    <Text style={styles.failDescription}>다음엔 인증해줄거지?</Text>
    <Image source={dowithFailImage} style={styles.failImage} resizeMode="contain" />
  </View>
);

const ReceivedFeedbackModal = ({ visible, dowithTaskId, onClose }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>받은 잔소리</Text>
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12}>
            <CancelIcon />
          </Pressable>
        </View>
        <ReceivedFeedbackContent dowithTaskId={dowithTaskId} enabled={visible} headerComponent={<FailHeader />} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  title: {
    ...theme.TYPOGRAPHY.TITLE_1,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  failHeader: {
    alignItems: 'center',
    paddingTop: 16,
    backgroundColor: theme.COLORS.SECONDARY.BLUE_97,
    borderRadius: 16,
    marginTop: 4,
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

export { ReceivedFeedbackModal };
