import React from 'react';

import { theme } from 'styles/theme';

type Theme = {
  COLORS: {
    DEFAULT: typeof theme.COLORS.DEFAULT;
    PRIMARY: typeof theme.COLORS.PRIMARY;
    SECONDARY: typeof theme.COLORS.SECONDARY;
    STATUS: typeof theme.COLORS.STATUS;
    GRAY_SCALE: typeof theme.COLORS.GRAY_SCALE;
    SUB: typeof theme.COLORS.SUB;
  };
  TYPOGRAPHY: {
    HEADER: typeof theme.TYPOGRAPHY.HEADER;
    TITLE_1: typeof theme.TYPOGRAPHY.TITLE_1;
    TITLE_2: typeof theme.TYPOGRAPHY.TITLE_2;
    TITLE_3: typeof theme.TYPOGRAPHY.TITLE_3;
    BODY_1: typeof theme.TYPOGRAPHY.BODY_1;
    BODY_2: typeof theme.TYPOGRAPHY.BODY_2;
    SUB_TITLE: typeof theme.TYPOGRAPHY.SUB_TITLE;
    CAPTION1_THICK: typeof theme.TYPOGRAPHY.CAPTION1_THICK;
    CAPTION1_BASIC: typeof theme.TYPOGRAPHY.CAPTION1_BASIC;
    CAPTION_2: typeof theme.TYPOGRAPHY.CAPTION_2;
  };
};

const DefaultTheme: Theme = theme;

export const ThemeContext = React.createContext<Theme>(DefaultTheme);

const useTheme = () => {
  const theme = React.useContext(ThemeContext);
  return theme;
};

export default useTheme;
