import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesProvider } from '../context/FavoritesContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Dimensions } from 'react-native';

import SwipeNavigator from '../navigation/SwipeNavigator';
import FavoriteNavigator from '../navigation/FavoriteNavigator';
import ProfileNavigator from '../navigation/ProfileNavigator';
import TopBooksNavigation from '../navigation/TopBooksNavigation';

import { ThemeContext } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const { height: screenHeight } = Dimensions.get('window');

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const dynamicTabHeight = screenHeight * 0.10;

  const { theme, darkMode } = useContext(ThemeContext);

  const lightActiveColor = '#E63946';
  const lightInactiveColor = '#A0A0A0';

  return (
    <FavoritesProvider>
      <Tab.Navigator
        initialRouteName="Swipe"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;

            switch (route.name) {
              case 'Swipe':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'TopBooks':
                iconName = focused ? 'star' : 'star-outline';
                break;
              case 'Favorites':
                iconName = focused ? 'heart' : 'heart-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
            }

            return <Ionicons name={iconName} size={26} color={color} />;
          },

          tabBarActiveTintColor: darkMode ? theme.toggleActive : lightActiveColor,
          tabBarInactiveTintColor: darkMode ? theme.toggleInactive : lightInactiveColor,

          headerShown: false,
          tabBarHideOnKeyboard: true,

          tabBarStyle: {
            backgroundColor: darkMode ? theme.background : '#FFFFFF',
            height: dynamicTabHeight + insets.bottom,
            paddingBottom: Platform.OS === 'ios' ? insets.bottom + 6 : insets.bottom + 8,
            paddingTop: 8,
            shadowColor: darkMode ? theme.shadowColor || '#000' : '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 10,
            borderTopWidth: 0,
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: '500',
            marginBottom: 2,
          },
        })}
      >
        <Tab.Screen name="Swipe" component={SwipeNavigator} options={{ title: 'Keşfet' }} />
        <Tab.Screen name="TopBooks" component={TopBooksNavigation} options={{ title: 'Popüler' }} />
        <Tab.Screen name="Favorites" component={FavoriteNavigator} options={{ title: 'Kütüphanem' }} />
        <Tab.Screen name="Profile" component={ProfileNavigator} options={{ title: 'Profil' }} />
      </Tab.Navigator>
    </FavoritesProvider>
  );
}
