import { StyleSheet, Text } from 'react-native';
import { Snackbar } from 'react-native-paper';

import { SNACKBAR_TYPE, useSnackbarStore } from 'stores/snackbarStore';
import type { SnackbarType } from 'stores/snackbarStore';
import { theme } from 'styles/theme';

// 타입별 색상. 밝은 배경 위에서도 읽히도록 같은 계열의 어두운 텍스트색을 함께 지정한다.
// INFO(기본)는 중립 다크 그레이 + 흰색 텍스트.
const SNACKBAR_COLOR: Record<SnackbarType, { background: string; text: string }> = {
  [SNACKBAR_TYPE.INFO]: {
    background: theme.COLORS.GRAY_SCALE.GRAY_20,
    text: theme.COLORS.DEFAULT.WHITE,
  },
  [SNACKBAR_TYPE.SUCCESS]: {
    background: theme.COLORS.STATUS.GREEN_55,
    text: theme.COLORS.STATUS.GREEN_20,
  },
  [SNACKBAR_TYPE.ERROR]: {
    background: theme.COLORS.STATUS.RED_55,
    text: theme.COLORS.STATUS.RED_20,
  },
  [SNACKBAR_TYPE.WARNING]: {
    background: theme.COLORS.STATUS.YELLOW_55,
    text: theme.COLORS.STATUS.YELLOW_20,
  },
};

const GlobalSnackbar = () => {
  const visible = useSnackbarStore(state => state.visible);
  const message = useSnackbarStore(state => state.message);
  const duration = useSnackbarStore(state => state.duration);
  const type = useSnackbarStore(state => state.type);
  const hide = useSnackbarStore(state => state.hide);

  const color = SNACKBAR_COLOR[type];

  return (
    <Snackbar
      visible={visible}
      onDismiss={hide}
      duration={duration}
      style={[styles.snackbar, { backgroundColor: color.background }]}
      wrapperStyle={styles.wrapper}
    >
      <Text style={[styles.message, { color: color.text }]}>{message}</Text>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    bottom: 16,
    paddingHorizontal: 16,
  },
  snackbar: {
    borderRadius: 16,
  },
  message: {
    ...theme.TYPOGRAPHY.BODY_2,
  },
});

export { GlobalSnackbar };
