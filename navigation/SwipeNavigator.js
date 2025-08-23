import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SwipeScreen from '../screens/home/SwipeScreen';
import DetailScreen from '../screens/home/DetailScreen';
import TopBooksScreen from '../screens/home/TopBooksScreen';
const Stack = createNativeStackNavigator();

export default function SwipeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SwipeMain" component={SwipeScreen} />
      <Stack.Screen name="DetailScreen" component={DetailScreen} />
    </Stack.Navigator>
  );
}
