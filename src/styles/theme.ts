const theme = {
  COLORS: {
    DEFAULT: {
      WHITE: '#FFFFFF',
      BLACK: '#000000',
    },
    PRIMARY: {
      RED_98: '#FFF7F5',
      RED_95: '#FFEBE5',
      RED_60: '#FF6333',
    },
    SECONDARY: {
      BLUE_95: '#E5F6FF',
      BLUE_60: '#33BBFF',
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
      GRAY_95: '#F2F2F3',
      GRAY_90: '#E4E5E7',
      GRAY_80: '#C9CbCF',
      GRAY_70: '#AEB0B6',
      GRAY_60: '#AEB0B6',
      GRAY_50: '#797C86',
      GRAY_40: '#61638B',
      GRAY_30: '#494B50',
      GRAY_20: '#313235',
      GRAY_10: '#18191B',

      // TODO: deprecated 예정
      GRAY_300: '#EDEDED',
      GRAY_400: '#DBDBDB',
      GRAY_500: '#CCCCCC',
      GRAY_600: '#999999',
      GRAY_700: '#666666',
      GRAY_800: '#333333',
      GRAY_900: '#111111',
      BLUE_GRAY_100: '#F5F8FF',
      BLUE_GRAY_200: '#F4F5FA',
      BLUE_GRAY_300: '#FAFAFA',
    },
    SUB: {
      PINK_60: '#FF3377',
      BLUE_60: '#3399FF',
    },
  },
} as const;

export { theme };
