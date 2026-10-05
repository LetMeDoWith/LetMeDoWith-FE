import React, { useEffect } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

import { useSuccessMotionStore } from 'stores/successMotionStore';
import { theme } from 'styles/theme';

import doriSuccessMotion from 'assets/lottie/dori_success.json';

/* 원본 크기(122×150) 그대로 */
const MOTION_WIDTH = 122;
const MOTION_HEIGHT = 150;

/*
 * 재생 완료 콜백이 오지 않으면(로띠 로드 실패 등) 화면이 영영 막히므로 강제로 닫는 시한.
 * 모션 길이(144프레임 / 60fps = 2.4초)에 여유를 더한 값이다.
 */
const FORCE_HIDE_MS = 3500;

/*
 * 도리 인증 성공 시 앱 전체 위에 딤 + 로띠를 한 번 재생한다.
 * 재생이 끝날 때까지 터치·뒤로가기를 막는다(Modal). App.tsx에 한 번만 둔다.
 */
const DoriSuccessMotion = () => {
  const visible = useSuccessMotionStore(state => state.visible);
  const hide = useSuccessMotionStore(state => state.hide);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(hide, FORCE_HIDE_MS);
    return () => clearTimeout(timer);
  }, [visible, hide]);

  if (!visible) {
    return null;
  }

  return (
    /* 재생 중에는 안드로이드 뒤로가기로도 닫지 않는다 */
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
      <View style={styles.dim} />
      <View style={styles.center} pointerEvents="none">
        <LottieView source={doriSuccessMotion} autoPlay loop={false} onAnimationFinish={hide} style={styles.motion} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.COLORS.DEFAULT.BLACK,
    opacity: 0.6,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motion: {
    width: MOTION_WIDTH,
    height: MOTION_HEIGHT,
  },
});

export { DoriSuccessMotion };
