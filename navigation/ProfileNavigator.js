import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../screens/home/ProfileScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsOfUseScreen from '../screens/profile/TermsOfUseScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import KitapEkleScreen from '../screens/profile/KitapEkleScreen';


const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="KitapEkle" component={KitapEkleScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
