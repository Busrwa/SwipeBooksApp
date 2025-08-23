import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DetailScreen from '../screens/home/DetailScreen';
import TopBooksScreen from '../screens/home/TopBooksScreen';
const Stack = createNativeStackNavigator();

export default function TopBooksNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TopBooksScreenMain" component={TopBooksScreen} />
      <Stack.Screen name="DetailScreen" component={DetailScreen} />
    </Stack.Navigator>
  );
}
