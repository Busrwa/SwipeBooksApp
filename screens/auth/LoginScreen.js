import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { ThemeContext } from '../../context/ThemeContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { theme, darkMode } = useContext(ThemeContext);

  const logoSource = darkMode
    ? require('../../assets/logo_beyaz.png')
    : require('../../assets/logo_siyah.png');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const { setUser } = useContext(AuthContext);

  useEffect(() => {
    const checkUser = async () => {
      const savedUser = await AsyncStorage.getItem('rememberedUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser)); 
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
    };
    checkUser();
  }, []);


  const showPopup = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showPopup('Eksik Bilgi', 'Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }

    try {
      // Firebase ile giriş
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      await user.reload();

      // E-posta doğrulamasını kontrol et
      if (!user.emailVerified) {
        showPopup('Doğrulama Gerekli', 'E-posta adresinizi doğrulamadan giriş yapamazsınız.');
        return;
      }

      // Firestore'dan kullanıcı verisini al
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        showPopup('Kayıtlı Değil', 'Bu kullanıcı ile kayıt bulunamadı.');
        return;
      }

      const userData = userDoc.data();

      setUser({
        uid: user.uid,
        email: user.email,
        username: userData.username || 'Anonim',
        avatarIndex: userData.avatarIndex || 0,
      });

      // "Beni Hatırla" işlemi
      if (rememberMe) {
        await AsyncStorage.setItem(
          'rememberedUser',
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            username: userData.username || 'Anonim',
            avatarIndex: userData.avatarIndex || 0,
          })
        );
      } else {
        await AsyncStorage.removeItem('rememberedUser');
      }

      logInfo('Giriş yapan kullanıcı:', userData.username || 'Anonim');
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });

    } catch (error) {
      let message = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      if (error.code === 'auth/invalid-email') message = 'Geçersiz e-posta adresi.';
      else if (error.code === 'auth/user-not-found') message = 'Kullanıcı bulunamadı.';
      else if (error.code === 'auth/wrong-password') message = 'Şifre yanlış.';
      showPopup('Giriş Hatası', message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showPopup('E-posta Gerekli', 'Şifre sıfırlama için lütfen e-posta adresinizi girin.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      showPopup('E-posta Gönderildi', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch (error) {
      showPopup('Hata', 'Şifre sıfırlama sırasında bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContainer}>
            <Image
              source={logoSource}
              style={styles.logo}
            />
            <Text style={[styles.title, { color: theme.textPrimary }]}>Giriş Yap</Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.textPrimary,
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
              placeholder="E-posta"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    color: theme.textPrimary,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Şifre"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Text style={{ fontSize: 16, color: theme.textPrimary }}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.forgotRememberContainer}>
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordTouchable}>
                <Text style={[styles.forgotPassword, { color: theme.toggleActive }]}>Şifremi Unuttum?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                style={styles.rememberMeContainer}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.customCheckbox,
                    { borderColor: theme.toggleActive },
                    rememberMe && { backgroundColor: theme.toggleActive },
                  ]}
                />
                <Text style={[styles.rememberText, { color: theme.textSecondary }]}>Beni Hatırla</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.toggleActive }]} onPress={handleLogin}>
              <Text style={styles.buttonText}>Giriş Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.linkText, { color: theme.textSecondary }]}>Hesabın yok mu? Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{modalTitle}</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.toggleActive }]}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: 150,
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 12,
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 15 : 15,
  },
  forgotRememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  forgotPasswordTouchable: {
    paddingVertical: 5,
  },
  forgotPassword: {
    color: '#E63946',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#E63946',
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  customCheckboxChecked: {
    backgroundColor: '#E63946',
  },
  rememberText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#E63946',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginBottom: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  linkText: {
    color: 'gray',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
