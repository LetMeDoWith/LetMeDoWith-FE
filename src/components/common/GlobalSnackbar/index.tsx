import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Snackbar } from 'react-native-paper';

import { WarningCircle } from 'components/common/icons/WarningCircle';
import { DEFAULT_SNACKBAR_BOTTOM_OFFSET, SNACKBAR_TYPE, useSnackbarStore } from 'stores/snackbarStore';
import type { SnackbarType } from 'stores/snackbarStore';
import { theme } from 'styles/theme';

// 타입별 색상. 밝은 배경 위에서도 읽히도록 같은 계열의 어두운 텍스트색을 함께 지정한다.
// INFO(기본)와 ERROR는 중립 다크 그레이 + 흰색 텍스트.
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
    background: theme.COLORS.GRAY_SCALE.GRAY_20,
    text: theme.COLORS.DEFAULT.WHITE,
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
  const bottomOffset = useSnackbarStore(state => state.bottomOffset);
  const hide = useSnackbarStore(state => state.hide);

  const color = SNACKBAR_COLOR[type];
  /*
   * Snackbar는 wrapper에 세이프에어리어 하단만큼 paddingBottom을 자체로 넣는다.
   * 바텀시트 위처럼 위치를 직접 지정한 경우에는 그만큼 더 떠버리므로 걷어낸다.
   * 기본 위치일 때는 홈 인디케이터를 피해야 하니 그대로 둔다.
   */
  const isCustomOffset = bottomOffset !== DEFAULT_SNACKBAR_BOTTOM_OFFSET;

  return (
    <Snackbar
      visible={visible}
      onDismiss={hide}
      duration={duration}
      style={[styles.snackbar, { backgroundColor: color.background }]}
      wrapperStyle={[styles.wrapper, { bottom: bottomOffset }, isCustomOffset && styles.wrapperWithoutSafeArea]}
    >
      <View style={styles.content}>
        {/* 에러는 어두운 배경에 경고 아이콘을 함께 띄운다 */}
        {type === SNACKBAR_TYPE.ERROR && <WarningCircle />}
        <Text style={[styles.message, { color: color.text }]}>{message}</Text>
      </View>
    </Snackbar>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
  wrapperWithoutSafeArea: {
    paddingBottom: 0,
  },
  snackbar: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  message: {
    ...theme.TYPOGRAPHY.BODY_2,
  },
});

export { GlobalSnackbar };
