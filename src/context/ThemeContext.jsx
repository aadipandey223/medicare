import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes = {
  light: {
    palette: {
      mode: 'light',
      primary: {
        main: '#0D9488', // Medical teal
        light: '#14B8A6',
        dark: '#0F766E',
      },
      secondary: {
        main: '#0891B2', // Medical cyan
        light: '#06B6D4',
        dark: '#0E7490',
      },
      success: {
        main: '#10B981', // Medical green
        light: '#34D399',
        dark: '#059669',
      },
      error: {
        main: '#EF4444', // Professional red
        light: '#F87171',
        dark: '#DC2626',
      },
      warning: {
        main: '#F59E0B', // Medical amber
        light: '#FBBF24',
        dark: '#D97706',
      },
      info: {
        main: '#3B82F6', // Medical blue
        light: '#60A5FA',
        dark: '#2563EB',
      },
      background: {
        default: '#F8FAFC', // Soft gray-white
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1E293B', // Dark slate
        secondary: '#64748B', // Medium slate
      },
    },
  },
  dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: '#14B8A6', // Brighter teal for dark
        light: '#2DD4BF',
        dark: '#0D9488',
      },
      secondary: {
        main: '#06B6D4', // Brighter cyan
        light: '#22D3EE',
        dark: '#0891B2',
      },
      success: {
        main: '#34D399', // Brighter green
        light: '#6EE7B7',
        dark: '#10B981',
      },
      error: {
        main: '#F87171', // Softer red
        light: '#FCA5A5',
        dark: '#EF4444',
      },
      warning: {
        main: '#FBBF24', // Brighter amber
        light: '#FCD34D',
        dark: '#F59E0B',
      },
      info: {
        main: '#60A5FA', // Brighter blue
        light: '#93C5FD',
        dark: '#3B82F6',
      },
      background: {
        default: '#0F172A', // Dark slate
        paper: '#1E293B', // Slightly lighter slate
      },
      text: {
        primary: '#F1F5F9', // Light slate
        secondary: '#CBD5E1', // Medium light slate
      },
    },
  },
  eyeProtection: {
    palette: {
      mode: 'light',
      primary: {
        main: '#5a9b7a',
        light: '#7ab399',
        dark: '#3d6b54',
      },
      secondary: {
        main: '#6b8b6f',
      },
      success: {
        main: '#52a577',
      },
      error: {
        main: '#d97f70',
      },
      warning: {
        main: '#e8b86b',
      },
      background: {
        default: '#f0f4f0',
        paper: '#e8f0e8',
      },
    },
  },
  grayscale: {
    palette: {
      mode: 'light',
      primary: {
        main: '#666666',
        light: '#999999',
        dark: '#333333',
      },
      secondary: {
        main: '#777777',
      },
      success: {
        main: '#888888',
      },
      error: {
        main: '#555555',
      },
      warning: {
        main: '#707070',
      },
      background: {
        default: '#f8f8f8',
        paper: '#ffffff',
      },
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
  }, [currentTheme]);

  const theme = createTheme({
    ...themes[currentTheme],
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
        fontSize: '1.75rem',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
        fontSize: '1.5rem',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
        fontSize: '1.25rem',
      },
      body1: {
        fontSize: '0.95rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
    },
    shape: {
      borderRadius: 12, // More compact rounded corners
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 10,
            padding: '8px 20px',
            fontSize: '0.875rem',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
