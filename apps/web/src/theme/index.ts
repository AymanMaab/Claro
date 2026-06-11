import { createTheme, type Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    custom: { authGradient: string };
  }
  interface ThemeOptions {
    custom?: { authGradient?: string };
  }
}

const CLARO = {
  navy:       '#001d64',
  darkBlue:   '#002473',
  midNavy:    '#003083',
  accentBlue: '#006abc',
  skyBlue:    '#0098f1',
};

const shared = {
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' as const, fontWeight: 600, borderRadius: 8 },
        containedPrimary: {
          background: `linear-gradient(135deg, ${CLARO.midNavy} 0%, ${CLARO.accentBlue} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${CLARO.darkBlue} 0%, ${CLARO.skyBlue} 100%)`,
          },
        },
      },
    },
    MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
  },
};

export const lightTheme: Theme = createTheme({
  ...shared,
  custom: {
    authGradient: `linear-gradient(160deg, #ddeeff 0%, #eaf4ff 50%, #f0f8ff 100%)`,
  },
  palette: {
    mode: 'light',
    primary:    { main: CLARO.navy, light: CLARO.accentBlue, dark: CLARO.navy, contrastText: '#fff' },
    secondary:  { main: CLARO.accentBlue, light: CLARO.skyBlue },
    background: { default: '#F0F4FF', paper: '#ffffff' },
    text:       { primary: '#0D1B3E', secondary: '#4A5878' },
  },
});

export const darkTheme: Theme = createTheme({
  ...shared,
  custom: {
    authGradient: `linear-gradient(135deg, #000a2e 0%, ${CLARO.navy} 60%, ${CLARO.midNavy} 100%)`,
  },
  palette: {
    mode: 'dark',
    primary:    { main: CLARO.accentBlue, light: CLARO.skyBlue, dark: CLARO.midNavy, contrastText: '#fff' },
    secondary:  { main: CLARO.skyBlue },
    background: { default: '#0A0F1E', paper: '#111827' },
    text:       { primary: '#E8EEFF', secondary: '#8B9CC8' },
  },
  components: {
    ...shared.components,
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, border: '1px solid rgba(0,106,188,0.15)' },
      },
    },
  },
});
