import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

import { KakaoLoginButton } from 'components/Login/KakaoLoginButton';
import { GoogleLoginButton } from 'components/Login/GoogleLoginButton';
import { AppleLoginButton } from 'components/Login/AppleLoginButton';
import { MainLogo, MAIN_LOGO_RATIO } from 'components/common/icons/MainLogo';
import { theme } from 'styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* 시안 근사값. 정확한 수치를 받으면 교체한다. */
const LOGO_WIDTH = SCREEN_WIDTH * 0.23;
const LOGO_HEIGHT = LOGO_WIDTH * MAIN_LOGO_RATIO;
/* 로고 묶음과 버튼 묶음 사이 간격 */
const SECTION_GAP = 80;

const Login = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <MainLogo width={LOGO_WIDTH} height={LOGO_HEIGHT} />
        <Text style={styles.tagline}>미루는 습관을 깨는 가장 확실한 잡도리</Text>
      </View>
      <View style={styles.buttonSection}>
        <KakaoLoginButton />
        <GoogleLoginButton />
        {Platform.OS === 'ios' && <AppleLoginButton />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* 로고와 버튼을 하나의 묶음으로 보고 화면 세로 정중앙에 둔다. */
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SECTION_GAP,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  logoSection: {
    alignItems: 'center',
    gap: 12,
  },
  tagline: {
    ...theme.TYPOGRAPHY.SUB_TITLE,
    color: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  buttonSection: {
    alignItems: 'center',
    gap: 8,
  },
});

export { Login };
