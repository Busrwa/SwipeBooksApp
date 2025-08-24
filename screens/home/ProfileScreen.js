import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user: authUser, loading: authLoading } = useContext(AuthContext); // AuthContext'ten kullanıcı
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [username, setUsername] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [tempSelectedAvatarIndex, setTempSelectedAvatarIndex] = useState(null);

  const { darkMode, setDarkMode, theme } = useContext(ThemeContext);
  const avatarOptions = [
    require('../../assets/avatars/avatar1.png'),
    require('../../assets/avatars/avatar2.png'),
    require('../../assets/avatars/avatar3.png'),
    require('../../assets/avatars/avatar4.png'),
  ];

  const auth = getAuth();
  const navigation = useNavigation();

  // Kullanıcı ve Firestore verilerini yükle
  useEffect(() => {
    if (!authUser) return; // Kullanıcı yoksa işlemi durdur
    setUserEmail(authUser.email || '');
    setUsername(authUser.displayName || authUser.email?.split('@')[0] || '');

    const fetchUserDoc = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.username) setUsername(data.username);
          if (typeof data.avatarIndex === 'number' && avatarOptions[data.avatarIndex]) {
            setSelectedAvatar(avatarOptions[data.avatarIndex]);
            setSelectedAvatarIndex(data.avatarIndex);
          }
        }
      } catch (error) {
        console.error('Firestore hatası:', error);
      }
    };

    fetchUserDoc();
  }, [authUser]);

  const showMessage = (text, type = 'success') => {
    setMessageText(text);
    setMessageType(type);
    setMessageModalVisible(true);
  };

  const handleSendResetEmail = async () => {
    const email = userEmail;
    if (!email) {
      showMessage('Kullanıcı e-posta adresi bulunamadı.', 'error');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      setModalVisible(false);
      showMessage('Şifre sıfırlama maili gönderildi. Lütfen e-postanızı kontrol edin.', 'success');
    } catch (error) {
      setLoading(false);
      console.error('Şifre sıfırlama hatası:', error);
      showMessage('Hata: ' + error.message, 'error');
    }
  };

  const saveAvatarToFirestore = async (index) => {
    if (!authUser?.uid) return showMessage('Kullanıcı bilgisi bulunamadı', 'error');
    try {
      await setDoc(doc(db, 'users', authUser.uid), { avatarIndex: index }, { merge: true });
      setSelectedAvatar(avatarOptions[index]);
      setSelectedAvatarIndex(index);
      showMessage('Profil resmi başarıyla güncellendi.', 'success');
    } catch (error) {
      console.error('Avatar kaydetme hatası:', error);
      showMessage('Profil resmi güncellenirken hata oluştu: ' + error.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('rememberedUser');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      showMessage('Çıkış yaparken hata oluştu: ' + error.message, 'error');
    }
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.avatarBackground} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Text style={[styles.header, { color: theme.textPrimary }]}>Profil</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => {
            setIsAvatarModalVisible(true);
            setTempSelectedAvatarIndex(selectedAvatarIndex);
          }}
          activeOpacity={0.7}
        >
          {selectedAvatar ? (
            <Image source={selectedAvatar} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.avatarBackground }]}>
              <Text style={styles.avatarText}>
                {(username && username.charAt(0).toUpperCase()) ||
                  (userEmail && userEmail.charAt(0).toUpperCase()) ||
                  'U'}
              </Text>
            </View>
          )}
          <Text style={[styles.avatarHintText, { color: theme.textSecondary }]}>
            Profil resmine dokunarak değiştirebilirsiniz
          </Text>
        </TouchableOpacity>

        {/* Kullanıcı Bilgileri */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            E-posta: {userEmail || 'Yükleniyor...'}
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Kullanıcı Adı: {username || 'Yükleniyor...'}
          </Text>
          <TouchableOpacity
            onPress={() => {
              showMessage(
                'Bu uygulamada şu anda yeni bir üyelik tipi mevcut değil. \nAyrıntılı bilgi için \ninfo.swipeitofficial@gmail.com ile iletişime geçebilirsiniz.',
                'success'
              );
            }}
          >
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Üyelik Tipi: Standart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tema */}
        <TouchableOpacity
          style={[styles.optionButton, { borderBottomColor: theme.border }]}
          onPress={() => setDarkMode(!darkMode)}
        >
          <View style={styles.toggleRow}>
            <Text style={[styles.optionText, { color: theme.textPrimary }]}>Karanlık Mod</Text>
            <Switch
              trackColor={{ false: theme.toggleInactive, true: theme.toggleActive }}
              thumbColor={darkMode ? '#b71c1c' : '#fff'}
              ios_backgroundColor="#555"
              onValueChange={setDarkMode}
              value={darkMode}
            />
          </View>
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.optionButton, { borderBottomColor: theme.border }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.optionText, { color: theme.textPrimary }]}>Şifre Değiştir</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionButton, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('BarcodeChoice')}>
          <Text style={[styles.optionText, { color: theme.textPrimary }]}>ISBN veya Barkod ile Ara</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('KitapEkle')}>
          <Text style={[styles.optionText, { color: theme.textPrimary }]}>Kitap Önerisi Gönder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={[styles.optionText, { color: theme.textPrimary }]}>Gizlilik Politikası</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('TermsOfUse')}>
          <Text style={[styles.optionText, { color: theme.textPrimary }]}>Kullanım Koşulları</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.optionButton, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('HelpSupport')}>
          <Text style={[styles.optionText, { color: theme.textPrimary }]}>Yardım & Destek</Text>
        </TouchableOpacity>


        {/* Çıkış */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={[styles.optionText, { color: theme.textSecondary, textAlign: 'center', fontSize: SCREEN_WIDTH * 0.035, paddingTop: 20 }]}>
          Versiyon: 1.2.0
        </Text>
      </ScrollView>

      {/* Şifre Modalı */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => !loading && setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <TouchableOpacity style={styles.modalCloseButton} disabled={loading} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={SCREEN_WIDTH * 0.07} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Şifre Sıfırlama</Text>
            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderilecektir.
            </Text>
            {loading ? (
              <ActivityIndicator size="large" color={theme.avatarBackground} style={{ marginTop: 15 }} />
            ) : (
              <TouchableOpacity style={[styles.resetButton, { backgroundColor: theme.avatarBackground }]} onPress={handleSendResetEmail}>
                <Text style={styles.sendButtonText}>Gönder</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Mesaj Modalı */}
      <Modal visible={messageModalVisible} transparent animationType="fade" onRequestClose={() => setMessageModalVisible(false)}>
        <View style={styles.messageModalBackground}>
          <View style={[
            styles.messageModalContainer,
            messageType === 'success' ? { backgroundColor: theme.successBackground } : { backgroundColor: theme.errorBackground }
          ]}>
            <Ionicons
              name={messageType === 'success' ? "checkmark-circle-outline" : "close-circle-outline"}
              size={SCREEN_WIDTH * 0.12}
              color="#fff"
              style={{ marginBottom: SCREEN_HEIGHT * 0.015 }}
            />
            <Text style={styles.messageModalText}>{messageText}</Text>
            <TouchableOpacity style={styles.messageModalButton} onPress={() => setMessageModalVisible(false)}>
              <Text style={styles.messageModalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar Modalı */}
      <Modal visible={isAvatarModalVisible} transparent animationType="slide" onRequestClose={() => setIsAvatarModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Profil Resmini Seç</Text>
            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              Profil resminizi değiştirmek için aşağıdan bir avatar seçin ve "Kaydet"e dokunun.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarOptionsScroll} contentContainerStyle={{ paddingHorizontal: 10 }}>
              {avatarOptions.map((img, index) => (
                <TouchableOpacity key={index} onPress={() => setTempSelectedAvatarIndex(index)} style={[styles.avatarOption, tempSelectedAvatarIndex === index && { borderColor: theme.avatarSelectedBorder }]} activeOpacity={0.7}>
                  <Image source={img} style={styles.avatarImageSmall} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity onPress={() => setIsAvatarModalVisible(false)} style={[styles.sendButton, styles.cancelButton]} activeOpacity={0.7}>
                <Text style={styles.sendButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (tempSelectedAvatarIndex !== null) {
                    await saveAvatarToFirestore(tempSelectedAvatarIndex);
                    setIsAvatarModalVisible(false);
                  }
                }}
                disabled={tempSelectedAvatarIndex === null}
                style={[styles.sendButton, { opacity: tempSelectedAvatarIndex !== null ? 1 : 0.6 }]}
                activeOpacity={0.7}
              >
                <Text style={styles.sendButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  header: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: 'bold',
    marginBottom: SCREEN_HEIGHT * 0.03,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  avatarHintText: {
    marginTop: 6,
    fontSize: 12,
    fontStyle: 'italic',
  },
  infoSection: {
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  optionButton: {
    borderBottomWidth: 1,
    paddingVertical: 20,
  },
  optionText: {
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '50%',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalContainer: {
    borderRadius: 12,
    padding: 18,
    elevation: 5,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
  resetButton: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  messageModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  messageModalContainer: {
    padding: 24,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  messageModalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  messageModalButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  messageModalButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarOptionsScroll: {
    marginVertical: 16,
  },
  avatarOption: {
    marginHorizontal: 9,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 3,
  },
  avatarImageSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  sendButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 20,
  },
});