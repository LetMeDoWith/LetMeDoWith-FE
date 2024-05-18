import React from 'react';

import { theme } from 'styles/theme';

type Theme = {
  COLORS: {
    DEFAULT: typeof theme.COLORS.DEFAULT;
    PRIMARY: typeof theme.COLORS.PRIMARY;
    SECONDARY: typeof theme.COLORS.SECONDARY;
    EMOJI: typeof theme.COLORS.EMOJI;
    GRAY_SCALE: typeof theme.COLORS.GRAY_SCALE;
  };
};

const DefaultTheme: Theme = theme;

export const ThemeContext = React.createContext<Theme>(DefaultTheme);

const useTheme = () => {
  const theme = React.useContext(ThemeContext);
  return theme;
};

export default useTheme;
