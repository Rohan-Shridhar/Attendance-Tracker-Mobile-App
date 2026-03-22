import { create } from 'zustand';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subtext: string;
  primary: string;
  border: string;
  inputBackground: string;
  badgeGreen: string;
  badgeYellow: string;
  badgeRed: string;
}

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const lightTheme: ThemeColors = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#333333',
  subtext: '#666666',
  primary: '#1F3864',
  border: '#E0E0E0',
  inputBackground: '#F9F9F9',
  badgeGreen: '#4CAF50',
  badgeYellow: '#FFC107',
  badgeRed: '#F44336',
};

const darkTheme: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  subtext: '#AAAAAA',
  primary: '#4A90D9',
  border: '#333333',
  inputBackground: '#2C2C2C',
  badgeGreen: '#388E3C', // slightly darker or adjusted for dark mode if needed, but requirements didn't specify exact shades for badges.
  badgeYellow: '#FBC02D',
  badgeRed: '#D32F2F',
};

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: false,
  colors: lightTheme,
  toggleTheme: () => set((state) => {
    const newIsDarkMode = !state.isDarkMode;
    return {
      isDarkMode: newIsDarkMode,
      colors: newIsDarkMode ? darkTheme : lightTheme,
    };
  }),
}));
