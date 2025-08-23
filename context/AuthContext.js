import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context oluştur
export const AuthContext = createContext();

// Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Uygulama açıldığında AsyncStorage'dan kullanıcıyı yükle
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.log('AsyncStorage kullanıcı yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Firebase auth değişikliklerini dinle
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // AsyncStorage'a kaydet
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || '',
          })
        );
      } else {
        setUser(null);
        await AsyncStorage.removeItem('user');
      }
    });

    return unsubscribe;
  }, []);

  // Çıkış yapma fonksiyonu
  const logout = async () => {
    await auth.signOut();
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
