import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Modal } from 'react-native-paper';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';

interface Props {
  visible: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onDismiss: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'outlined' | 'contained';
}

const ConfirmModal = ({
  visible,
  title,
  description,
  confirmText,
  cancelText,
  onDismiss,
  onConfirm,
  onCancel,
  type = 'outlined',
}: Props) => (
  <Modal contentContainerStyle={styles.container} visible={visible} onDismiss={onDismiss}>
    <View style={styles.contentWrap}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <Pressable
          style={[
            styles.button,
            { borderBottomLeftRadius: 8, borderRightWidth: 0.5, borderColor: theme.COLORS.GRAY_SCALE.GRAY_500 },
          ]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>{cancelText}</Text>
        </Pressable>
        <Pressable
          style={
            type === 'outlined'
              ? [styles.button, { borderBottomRightRadius: 8 }]
              : [styles.button, { borderBottomRightRadius: 8, backgroundColor: theme.COLORS.PRIMARY.RED_500 }]
          }
          onPress={onConfirm}
        >
          <Text
            style={
              type === 'outlined'
                ? [styles.buttonText, styles.confirmButtonText]
                : [styles.buttonText, styles.confirmButtonText, { color: theme.COLORS.DEFAULT.WHITE }]
            }
          >
            {confirmText}
          </Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignSelf: 'center',
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    width: 280,
    height: 158,
    borderRadius: 8,
  },
  contentWrap: {
    height: '100%',
    justifyContent: 'space-between',
  },
  content: {
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 18,
  },
  description: {
    fontSize: isAos ? 11 : 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    height: 48,
    borderTopWidth: 0.5,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_500,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  buttonText: {
    textAlign: 'center',
  },
  confirmButtonText: {
    color: theme.COLORS.PRIMARY.RED_500,
  },
});

export { ConfirmModal };
