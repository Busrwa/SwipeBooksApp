import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../screens/home/ProfileScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsOfUseScreen from '../screens/profile/TermsOfUseScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';

import BarcodeScannerScreen from '../screens/barcode/BarcodeScannerScreen'
import BarcodeChoiceScreen from '../screens/barcode/BarcodeChoiceScreen'
import ManualISBNScreen from '../screens/barcode/ManualISBNScreen'


import KitapEkleScreen from '../screens/profile/KitapEkleScreen';
import DetailScreen from '../screens/home/DetailScreen';


const Stack = createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BarcodeChoice" component={BarcodeChoiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ManualISBN" component={ManualISBNScreen} options={{ headerShown: false }} />
      <Stack.Screen name="KitapEkle" component={KitapEkleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetailScreen" component={DetailScreen} />
    </Stack.Navigator>
  );
}
