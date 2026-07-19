const theme = {
  COLORS: {
    DEFAULT: {
      WHITE: '#FFFFFF',
      BLACK: '#000000',
    },
    PRIMARY: {
      RED_98: '#FFF3F0',
      RED_95: '#FDE1D8',
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
      fontWeight: '600',
      fontSize: 24,
      color: '#000000',
      lineHeight: 32,
    },
    TITLE_1: {
      fontWeight: '600',
      fontSize: 20,
      color: '#000000',
      lineHeight: 28,
    },
    TITLE_2: {
      fontWeight: '600',
      fontSize: 18,
      color: '#000000',
      lineHeight: 26,
    },
    TITLE_3: {
      fontWeight: '600',
      fontSize: 16,
      color: '#000000',
      lineHeight: 24,
    },
    SUB_TITLE: {
      fontWeight: 'bold',
      fontSize: 14,
      color: '#000000',
      lineHeight: 20,
    },
    BODY_1: {
      fontSize: 16,
      color: '#000000',
      lineHeight: 24,
    },
    BODY_2: {
      fontWeight: '500',
      fontSize: 14,
      color: '#000000',
      lineHeight: 20,
    },
    CAPTION1_THICK: {
      fontWeight: 'bold',
      fontSize: 12,
      color: '#000000',
      lineHeight: 16,
    },
    CAPTION1_BASIC: {
      fontWeight: '500',
      fontSize: 12,
      color: '#000000',
      lineHeight: 16,
    },
    CAPTION_2: {
      fontWeight: '500',
      fontSize: 11,
      color: '#000000',
      lineHeight: 14,
    },
  },
} as const;

export { theme };
