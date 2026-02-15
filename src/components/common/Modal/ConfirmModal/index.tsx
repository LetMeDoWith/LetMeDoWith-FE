import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';

import { theme } from 'styles/theme';

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
  <Portal>
    <Modal contentContainerStyle={styles.container} visible={visible} onDismiss={onDismiss}>
      <View style={styles.contentWrap}>
        <View style={styles.content}>
          <Text style={[theme.TYPOGRAPHY.TITLE_3, { color: theme.COLORS.GRAY_SCALE.GRAY_20 }]}>{title}</Text>
          <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.GRAY_SCALE.GRAY_50, textAlign: 'center' }]}>
            {description}
          </Text>
        </View>
        <View style={styles.buttonGroup}>
          <Pressable
            style={[
              styles.button,
              { borderBottomLeftRadius: 8, borderRightWidth: 0.5, borderColor: theme.COLORS.GRAY_SCALE.GRAY_80 },
            ]}
            onPress={onCancel}
          >
            <Text style={[theme.TYPOGRAPHY.BODY_2, styles.buttonText, { color: theme.COLORS.GRAY_SCALE.GRAY_20 }]}>
              {cancelText}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.button,
              { borderBottomRightRadius: 8 },
              type === 'contained' && { backgroundColor: theme.COLORS.PRIMARY.RED_60 },
            ]}
            onPress={onConfirm}
          >
            <Text
              style={[
                theme.TYPOGRAPHY.BODY_2,
                { color: type === 'outlined' ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.DEFAULT.WHITE },
                styles.buttonText,
              ]}
            >
              {confirmText}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  </Portal>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignSelf: 'center',
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    width: 280,
    borderRadius: 8,
  },
  contentWrap: {
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    padding: 20,
    gap: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    height: 48,
    borderTopWidth: 0.5,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  buttonText: {
    textAlign: 'center',
  },
});

export { ConfirmModal };
