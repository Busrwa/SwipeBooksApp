import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';


import { ThemeContext } from '../../context/ThemeContext';

function CheckBox({ value, onValueChange }) {
  const { theme } = useContext(ThemeContext);


  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={[styles.checkboxContainer, { borderColor: theme.toggleActive }]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      accessibilityLabel="KVKK Onayı"
    >
      <View style={[styles.checkbox, value && { backgroundColor: theme.toggleActive, borderRadius: 3 }]} />
    </TouchableOpacity>
  );
}

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { theme, darkMode } = useContext(ThemeContext);

  const logoSource = darkMode
    ? require('../../assets/logo_beyaz.png')
    : require('../../assets/logo_siyah.png');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const showModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9çÇğĞıİöÖşŞüÜ]+$/;
    const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+$/;

    if (!username.trim()) {
      showModal('Hata', 'Kullanıcı adı boş bırakılamaz.');
      return false;
    }
    if (username.length < 3) {
      showModal('Hata', 'Kullanıcı adı en az 3 karakter olmalıdır.');
      return false;
    }
    if (!usernameRegex.test(username.trim())) {
      showModal('Hata', 'Kullanıcı adı sadece harf ve rakamlardan oluşmalıdır. Özel karakter içeremez.');
      return false;
    }
    if (!email.trim()) {
      showModal('Hata', 'E-posta boş bırakılamaz.');
      return false;
    }
    if (!emailRegex.test(email)) {
      showModal('Hata', 'Lütfen geçerli bir e-posta adresi girin.');
      return false;
    }
    if (!password) {
      showModal('Hata', 'Şifre boş bırakılamaz.');
      return false;
    }
    if (password.length < 6) {
      showModal('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return false;
    }
    if (!confirmPassword) {
      showModal('Hata', 'Şifre tekrar boş bırakılamaz.');
      return false;
    }
    if (!passwordComplexityRegex.test(password)) {
      showModal('Hata', 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir. Özel karakter kullanmayınız.');
      return false;
    }
    if (password !== confirmPassword) {
      showModal('Hata', 'Şifreler uyuşmuyor.');
      return false;
    }
    if (!kvkkAccepted) {
      showModal('KVKK Onayı Gerekli', 'Devam etmek için KVKK metnini okuyup onaylamanız gerekmektedir.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Kullanıcı adı kontrolü
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        showModal('Hata', 'Bu kullanıcı adı zaten alınmış. Başka bir tane deneyin.');
        setLoading(false);
        return;
      }

      // Firebase Auth ile kayıt
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // E-posta doğrulama gönder
      try {
        await sendEmailVerification(user);
      } catch (verifyError) {
        logError("Doğrulama e-postası gönderilemedi:", verifyError);
        showModal('Uyarı', 'Kayıt başarılı oldu fakat doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      }

      // Firestore'a kaydet
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: username.trim(),
        createdAt: new Date(),
        emailVerified: false,
      });

      // Kullanıcıya bilgi ver
      showModal(
        'Doğrulama Gerekli',
        'Kayıt işlemi tamamlandı. Lütfen e-posta adresinizi doğrulamak için gelen kutunuzu kontrol edin.'
      );

      setLoading(false);
    } catch (error) {
      logError('Kayıt sırasında hata:', error);
      let message = 'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Bu e-posta zaten kayıtlı.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Geçersiz e-posta adresi.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Şifre çok zayıf. En az 6 karakter olmalıdır.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'İnternet bağlantınızı kontrol edin.';
      }
      showModal('Kayıt Hatası', message);
      setLoading(false);
    }
  };


  const openKVKK = () => {
    navigation.navigate('KVKK');
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
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

            <Text style={[styles.title, { color: theme.textPrimary }]}>Kayıt Ol</Text>

            <TextInput
              style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              placeholder="Kullanıcı Adı"
              placeholderTextColor={theme.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              accessibilityLabel="Kullanıcı Adı"
              returnKeyType="next"
            />

            <TextInput
              style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              placeholder="E-posta"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              textContentType="emailAddress"
              accessibilityLabel="Email"
              returnKeyType="next"
            />

            <View style={[styles.passwordContainer]}>
              <TextInput
                style={[styles.input, styles.passwordInput, { color: theme.textPrimary, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                placeholder="Şifre"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoComplete="password-new"
                accessibilityLabel="Şifre"
                returnKeyType="next"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                <Text style={{ fontSize: 20, color: theme.textPrimary }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, { color: theme.textPrimary, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                placeholder="Şifre Tekrar"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoComplete="password-new"
                accessibilityLabel="Şifre Tekrar"
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                <Text style={{ fontSize: 20, color: theme.textPrimary }}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.kvkkContainer}>
              <CheckBox value={kvkkAccepted} onValueChange={setKvkkAccepted} />
              <Text style={[styles.kvkkText, { color: theme.textPrimary }]}>
                Bu uygulamaya kayıt olarak, yukarıda belirtilen tüm koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
                {' '}
                <Text style={[styles.kvkkLink, { color: theme.toggleActive }]} onPress={openKVKK} accessibilityRole="link">
                  (Detaylar)
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Kayıt Ol"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessibilityRole="button"
              accessibilityLabel="Giriş Yap"
              style={{ marginTop: 10 }}
            >
              <Text style={[styles.linkText, { color: theme.textSecondary }]}>Zaten hesabın var mı? Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Popup */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalBox, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{modalTitle}</Text>
            <ScrollView style={{ maxHeight: 150, marginVertical: 10 }}>
              <Text style={[styles.modalMessage, { color: theme.textPrimary }]}>{modalMessage}</Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton]}
              onPress={() => {
                setModalVisible(false);

                // Başarılı kayıt veya doğrulama sonrası alanları temizle
                if (
                  modalTitle === 'Başarılı' ||
                  modalTitle === 'Doğrulama Gerekli'
                ) {
                  setEmail('');
                  setUsername('');
                  setPassword('');
                  setConfirmPassword('');
                  setKvkkAccepted(false);
                  navigation.navigate('Login');
                }
              }}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Tamam"
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  innerContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 50,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: Platform.OS === 'ios' ? 13 : 12,
  },
  kvkkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
  },
  kvkkText: {
    flex: 1,
    fontSize: 13,
  },
  kvkkLink: {
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#E63946',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    borderRadius: 12,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
