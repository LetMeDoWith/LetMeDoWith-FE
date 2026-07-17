import { StyleSheet, Text } from 'react-native';
import { Snackbar } from 'react-native-paper';

import { useSnackbarStore } from 'stores/snackbarStore';
import { theme } from 'styles/theme';

const GlobalSnackbar = () => {
  const visible = useSnackbarStore(state => state.visible);
  const message = useSnackbarStore(state => state.message);
  const duration = useSnackbarStore(state => state.duration);
  const hide = useSnackbarStore(state => state.hide);

  return (
    <Snackbar
      visible={visible}
      onDismiss={hide}
      duration={duration}
      style={styles.snackbar}
      wrapperStyle={styles.wrapper}
    >
      <Text style={styles.message}>{message}</Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    bottom: 16,
    paddingHorizontal: 16,
  },
  snackbar: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_20,
    borderRadius: 16,
  },
  message: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { GlobalSnackbar };
