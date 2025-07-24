import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Indigo
      light: '#8b87ff',
      dark: '#4338ca',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff'
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.05)',
    '0px 1px 6px rgba(0, 0, 0, 0.07)',
    '0px 3px 16px rgba(0, 0, 0, 0.08)',
    '0px 6px 24px rgba(0, 0, 0, 0.09)',
    '0px 8px 32px rgba(0, 0, 0, 0.1)',
    '0px 12px 48px rgba(0, 0, 0, 0.11)',
    '0px 16px 64px rgba(0, 0, 0, 0.12)',
    '0px 20px 80px rgba(0, 0, 0, 0.13)',
    '0px 24px 96px rgba(0, 0, 0, 0.14)',
    '0px 28px 112px rgba(0, 0, 0, 0.15)',
    '0px 32px 128px rgba(0, 0, 0, 0.16)',
    '0px 36px 144px rgba(0, 0, 0, 0.17)',
    '0px 40px 160px rgba(0, 0, 0, 0.18)',
    '0px 44px 176px rgba(0, 0, 0, 0.19)',
    '0px 48px 192px rgba(0, 0, 0, 0.2)',
    '0px 52px 208px rgba(0, 0, 0, 0.21)',
    '0px 56px 224px rgba(0, 0, 0, 0.22)',
    '0px 60px 240px rgba(0, 0, 0, 0.23)',
    '0px 64px 256px rgba(0, 0, 0, 0.24)',
    '0px 68px 272px rgba(0, 0, 0, 0.25)',
    '0px 72px 288px rgba(0, 0, 0, 0.26)',
    '0px 76px 304px rgba(0, 0, 0, 0.27)',
    '0px 80px 320px rgba(0, 0, 0, 0.28)',
    '0px 84px 336px rgba(0, 0, 0, 0.29)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 20px'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #e2e8f0'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    }
  }
});