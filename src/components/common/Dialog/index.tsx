import { Dialog as PaperDialog } from 'react-native-paper';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from 'styles/theme';

interface Props {
  visible: boolean;
  title: string;
  content: string;
  onDismiss: () => void;
  subContent?: string;
  type?: 'BASIC' | 'ALERT';
  leftButtonText?: string;
  rightButtonText?: string;
  alertButtonText?: string;
  handleLeftButton?: () => void;
  handleRightButton?: () => void;
  handleAlertButton?: () => void;
}

const Dialog = ({
  visible,
  type = 'BASIC',
  title,
  content,
  onDismiss,
  subContent = '',
  leftButtonText = '취소',
  rightButtonText = '확인',
  alertButtonText = '확인',
  handleLeftButton,
  handleRightButton,
  handleAlertButton,
}: Props) => {
  return (
    <PaperDialog style={styles.container} visible={visible} onDismiss={onDismiss}>
      <View style={styles.dialogWrap}>
        <PaperDialog.Title>
          <Text style={styles.title}>{title}</Text>
        </PaperDialog.Title>
        <PaperDialog.Content style={styles.contentWrap}>
          <Text
            style={[
              subContent ? theme.TYPOGRAPHY.CAPTION1_BASIC : theme.TYPOGRAPHY.BODY_2,
              { color: theme.COLORS.GRAY_SCALE.GRAY_50, textAlign: 'center' },
            ]}
          >
            {content}
          </Text>
          {subContent && (
            <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.GRAY_SCALE.GRAY_20, textAlign: 'center' }]}>
              {subContent}
            </Text>
          )}
        </PaperDialog.Content>
        <PaperDialog.Actions style={styles.action}>
          {type === 'BASIC' ? (
            <>
              <Pressable
                style={[styles.basicButton, { borderRightWidth: 1, borderRightColor: theme.COLORS.GRAY_SCALE.GRAY_92 }]}
                onPress={handleLeftButton}
              >
                <Text style={[styles.cancelButtonText]}>{leftButtonText}</Text>
              </Pressable>
              <Pressable style={styles.basicButton} onPress={handleRightButton}>
                <Text style={styles.confirmButtonText}>{rightButtonText}</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={styles.alertButton} onPress={handleAlertButton}>
              <Text style={styles.alertButtonText}>{alertButtonText}</Text>
            </Pressable>
          )}
        </PaperDialog.Actions>
      </View>
    </PaperDialog>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  dialogWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
  },
  title: theme.TYPOGRAPHY.TITLE_3,
  contentWrap: {
    gap: 12,
  },
  action: {
    paddingBottom: 0,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  basicButton: {
    flex: 1,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    ...theme.TYPOGRAPHY.SUB_TITLE,
    color: theme.COLORS.DEFAULT.BLACK,
  },
  confirmButtonText: {
    ...theme.TYPOGRAPHY.SUB_TITLE,
    color: theme.COLORS.PRIMARY.RED_60,
  },
  alertButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
  },
  alertButtonText: {
    ...theme.TYPOGRAPHY.SUB_TITLE,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { Dialog };
