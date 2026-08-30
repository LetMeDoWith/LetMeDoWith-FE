/*
 * Pretendard는 굵기별 파일을 따로 등록해 쓴다. 커스텀 폰트는 안드로이드에서
 * fontFamily + fontWeight 조합이 신뢰할 수 없어, 굵기를 패밀리 이름으로 직접 지정한다.
 * 값은 폰트의 PostScript 이름이며 파일명과 같아 iOS·Android 모두 그대로 통한다.
 */
const FONT_FAMILY = {
  REGULAR: 'Pretendard-Regular',
  MEDIUM: 'Pretendard-Medium',
  SEMI_BOLD: 'Pretendard-SemiBold',
  BOLD: 'Pretendard-Bold',
} as const;

const theme = {
  COLORS: {
    DEFAULT: {
      WHITE: '#FFFFFF',
      BLACK: '#000000',
    },
    PRIMARY: {
      RED_98: '#FFF3F0',
      RED_92: '#FDE1D8',
      RED_60: '#FF5F33',
    },
    SECONDARY: {
      BLUE_97: '#F2FAFD',
      BLUE_95: '#E5F6FF',
      BLUE_60: '#6DC4E3',
      BLUE_50: '#29A8D6',
    },
    STATUS: {
      GREEN_90: '#F5FBD0',
      GREEN_55: '#CAF425',
      GREEN_20: '#4F6105',
      YELLOW_90: '#FFF7CC',
      YELLOW_55: '#FFD91A',
      YELLOW_20: '#665500',
      RED_90: '#FEEBEB',
      RED_55: '#FB7676',
      RED_20: '#630303',
    },
    GRAY_SCALE: {
      GRAY_98: '#FAFAFA',
      GRAY_96: '#F4F5F5',
      GRAY_92: '#E4E5E7',
      GRAY_80: '#C9CBCF',
      GRAY_70: '#AEB0B6',
      GRAY_60: '#94969E',
      GRAY_50: '#797C86',
      GRAY_40: '#61638B',
      GRAY_30: '#494B50',
      GRAY_20: '#313235',
      GRAY_10: '#18191B',
    },
    SUB: {
      PINK_60: '#FF383C',
      BLUE_60: '#3399FF',
    },
  },
  TYPOGRAPHY: {
    HEADER: {
      fontFamily: FONT_FAMILY.SEMI_BOLD,
      fontSize: 24,
      color: '#000000',
      lineHeight: 32,
      letterSpacing: -0.96,
    },
    TITLE_1: {
      fontFamily: FONT_FAMILY.SEMI_BOLD,
      fontSize: 20,
      color: '#000000',
      lineHeight: 28,
      letterSpacing: -0.8,
    },
    TITLE_2: {
      fontFamily: FONT_FAMILY.SEMI_BOLD,
      fontSize: 18,
      color: '#000000',
      lineHeight: 26,
      letterSpacing: -0.36,
    },
    TITLE_3: {
      fontFamily: FONT_FAMILY.SEMI_BOLD,
      fontSize: 16,
      color: '#000000',
      lineHeight: 24,
      letterSpacing: -0.32,
    },
    SUB_TITLE: {
      fontFamily: FONT_FAMILY.BOLD,
      fontSize: 14,
      color: '#000000',
      lineHeight: 20,
      letterSpacing: -0.28,
    },
    BODY_1: {
      fontFamily: FONT_FAMILY.REGULAR,
      fontSize: 16,
      color: '#000000',
      lineHeight: 24,
      letterSpacing: -0.32,
    },
    BODY_2: {
      fontFamily: FONT_FAMILY.MEDIUM,
      fontSize: 14,
      color: '#000000',
      lineHeight: 20,
      letterSpacing: -0.28,
    },
    CAPTION1_THICK: {
      fontFamily: FONT_FAMILY.BOLD,
      fontSize: 12,
      color: '#000000',
      lineHeight: 16,
      letterSpacing: -0.24,
    },
    CAPTION1_BASIC: {
      fontFamily: FONT_FAMILY.MEDIUM,
      fontSize: 12,
      color: '#000000',
      lineHeight: 16,
      letterSpacing: -0.24,
    },
    CAPTION_2: {
      fontFamily: FONT_FAMILY.MEDIUM,
      fontSize: 11,
      color: '#000000',
      lineHeight: 14,
      letterSpacing: -0.22,
    },
  },
} as const;

export { theme, FONT_FAMILY };
