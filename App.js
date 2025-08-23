import React, { useEffect, useContext } from 'react';
import { StatusBar } from 'react-native';

import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';   // AuthContext sağlandı
import AppNavigator from './navigation/AppNavigator';

import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

function InnerApp() {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    // Sistem çubuklarını ve navigasyon barını özelleştir
    NavigationBar.setVisibilityAsync('hidden');
    NavigationBar.setBackgroundColorAsync('transparent');
    SystemUI.setBackgroundColorAsync('transparent');
  }, []);

  return (
    <>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        translucent={true}
        backgroundColor="transparent"
        hidden={false}
      />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <InnerApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
