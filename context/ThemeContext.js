import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
  background: '#fff',
  textPrimary: '#222',
  textSecondary: '#444',
  border: '#eee',
  avatarBackground: '#f44336',
  avatarSelectedBorder: '#f44336',
  successBackground: '#4caf50',
  errorBackground: '#f44336',
  toggleActive: '#f44336',
  toggleInactive: '#ccc',

  cardBackground: '#f5f5f5',
  shadowColor: '#000',
  limitWarningBackground: '#ffe5e5',
  limitWarningBorder: 'red',
  limitWarningText: 'red',

};

export const darkTheme = {
  background: '#121212',
  textPrimary: '#eee',
  textSecondary: '#bbb',
  border: '#333',
  avatarBackground: '#b71c1c',
  avatarSelectedBorder: '#f44336',
  successBackground: '#388e3c',
  errorBackground: '#d32f2f',
  toggleActive: '#f44336',
  toggleInactive: '#555',

  cardBackground: '#1e1e1e',
  shadowColor: '#000',
  limitWarningBackground: '#5a1a1a',
  limitWarningBorder: '#ff5555',
  limitWarningText: '#ff5555',
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('darkMode');
        if (saved !== null) {
          setDarkMode(JSON.parse(saved));
        }
      } catch (e) {
        logError('Tema yüklenirken hata:', e);
      }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
