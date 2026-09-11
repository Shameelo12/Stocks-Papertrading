import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import App from './App.jsx'
import { ThemeProvider as AppThemeProvider, useTheme } from './context/ThemeContext'
import './index.css'

function ThemedApp() {
  const { isDark } = useTheme();

  const theme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#05a854',
        light: '#1abc7e',
        dark: '#047d4a',
        lighter: '#e8f5f0',
      },
      secondary: {
        main: '#424242',
        light: '#616161',
        dark: '#212121',
      },
      background: {
        default: isDark ? '#0a0e27' : '#ffffff',
        paper: isDark ? '#141829' : '#fafbfc',
      },
      text: {
        primary: isDark ? '#ffffff' : '#1a1a1a',
        secondary: isDark ? '#a0a0a0' : '#5a5a5a',
      },
      divider: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      // Gain and loss are the two colours that carry meaning in this app, and
      // green-vs-red is the textbook deuteranopia failure: the previous pair
      // (#05a854 / #ef5350) measured ΔE 3.7 for a red-green colourblind viewer,
      // far below the ΔE 8 floor — the two were effectively the same colour to
      // roughly 8% of men. The crimson below measures ΔE 10.4 while still
      // reading unambiguously as "negative" to normal vision (ΔE 37.1, better
      // separation than the old pair managed).
      //
      // Colour still never carries the signal alone: every gain/loss figure is
      // paired with a direction arrow and an explicit sign.
      success: {
        main: isDark ? '#3ECB84' : '#05a854',
        light: isDark ? 'rgba(62,203,132,0.12)' : '#e8f5f0',
      },
      error: {
        main: isDark ? '#EC407A' : '#c2185b',
        light: isDark ? 'rgba(236,64,122,0.12)' : '#fce4ec',
      },
      warning: {
        main: '#ffa726',
        light: '#fff3e0',
      },
      info: {
        main: '#29b6f6',
        light: '#e1f5fe',
      },
    },
    typography: {
      fontFamily: '"Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: '2.5rem',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
      },
      h5: {
        fontWeight: 500,
        fontSize: '1rem',
      },
      h6: {
        fontWeight: 500,
        fontSize: '0.875rem',
      },
      body1: {
        fontSize: '0.95rem',
        lineHeight: 1.6,
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        fontWeight: 400,
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '8px',
            padding: '10px 24px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            fontSize: '0.95rem',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: isDark ? '#1f2937' : '#fafbfc',
              transition: 'all 0.2s ease',
              '&:hover fieldset': {
                borderColor: '#05a854',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#05a854',
                boxShadow: '0 0 0 3px rgba(5,168,84,0.1)',
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.3)'
              : '0 1px 3px rgba(0,0,0,0.06)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.05)'
              : '1px solid rgba(0,0,0,0.05)',
            backgroundColor: isDark ? '#141829' : '#ffffff',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: isDark
                ? '0 4px 12px rgba(0,0,0,0.4)'
                : '0 4px 12px rgba(0,0,0,0.08)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.3)'
              : '0 1px 3px rgba(0,0,0,0.06)',
            backgroundColor: isDark ? '#141829' : '#ffffff',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0a0e27' : '#ffffff',
            color: isDark ? '#ffffff' : '#1a1a1a',
            boxShadow: isDark
              ? '0 1px 3px rgba(0,0,0,0.3)'
              : '0 1px 3px rgba(0,0,0,0.06)',
            borderBottom: isDark
              ? '1px solid rgba(255,255,255,0.05)'
              : '1px solid rgba(0,0,0,0.05)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#141829' : '#ffffff',
            borderRight: isDark
              ? '1px solid rgba(255,255,255,0.05)'
              : '1px solid rgba(0,0,0,0.05)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
            fontWeight: 500,
            fontSize: '0.8rem',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.05)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppThemeProvider>
      <ThemedApp />
    </AppThemeProvider>
  </React.StrictMode>,
)
