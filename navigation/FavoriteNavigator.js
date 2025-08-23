import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DetailScreen from '../screens/home/DetailScreen';
import FavoritesScreen from '../screens/home/FavoritesScreen';
const Stack = createNativeStackNavigator();

export default function FavoriteNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesScreenMain" component={FavoritesScreen} />
      <Stack.Screen name="DetailScreen" component={DetailScreen} />
    </Stack.Navigator>
  );
}
