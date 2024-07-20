const theme = {
  COLORS: {
    DEFAULT: {
      WHITE: '#FFFFFF',
      BLACK: '#000000',
    },
    PRIMARY: {
      RED_100: '#FFEAE9',
      RED_200: '#E08B8C',
      RED_500: '#FB494D',
      RED_900: '#504344',
    },
    SECONDARY: {
      BLUE_500: '#487AFF',
      GREEN_500: '#00BD6A',
      YELLOW_500: '#FFB400',
      PINK_500: '#FF0A73',
    },
    EMOJI: {
      YELLOW_300: '#FFCD4C',
      YELLOW_400: '#FFAD30',
      YELLOW_900: '#664300',
      GREEN_300: '#77B255',
      BLUE_300: '#5DADEC',
      PINK_700: '#DE2A42',
    },
    GRAY_SCALE: {
      GRAY_300: '#EDEDED',
      GRAY_400: '#DBDBDB',
      GRAY_500: '#CCCCCC',
      GRAY_600: '#999999',
      GRAY_700: '#666666',
      GRAY_800: '#333333',
      GRAY_900: '#111111',
      BLUE_GRAY_100: '#F5F8FF',
      BLUE_GRAY_200: '#F5F8FF',
      BLUE_GRAY_300: '#FAFAFA',
    },
  },
} as const;

export { theme };
