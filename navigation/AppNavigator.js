import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import KVKK from '../screens/auth/KVKK';
import MainTabNavigator from './TabNavigator';
import OnboardingScreen from '../screens/home/OnboardingScreen';

import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase'; 

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [initialRoute, setInitialRoute] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('hasLaunched').then(value => {
      if (value == null) {
        setIsFirstLaunch(true);
        AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const savedEmail = await AsyncStorage.getItem('rememberedUser');

      if (user) {
        if (!savedEmail) {
          await signOut(auth);
          setInitialRoute('Login');
        } else {
          setInitialRoute('Main');
        }
      } else {
        setInitialRoute('Login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isFirstLaunch === null || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'fade' }}
        initialRouteName={isFirstLaunch ? 'Onboarding' : initialRoute}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="KVKK" component={KVKK} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
