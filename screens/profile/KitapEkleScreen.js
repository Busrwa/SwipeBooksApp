import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function KitapEkleScreen() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext); // AuthContext'ten kullanıcıyı alıyoruz

  const [bookName, setBookName] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigation = useNavigation();

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!bookName.trim() || !author.trim() || !description.trim()) {
      showModal('Lütfen tüm alanları doldurun.');
      return;
    }

    if (!user) {
      showModal('Öneri gönderebilmek için giriş yapmalısınız.');
      return;
    }

    const userId = user.uid;
    const userEmail = user.email || 'Email yok';
    const userName = user.displayName || userId;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    try {
      const q = query(
        collection(db, 'data'),
        where('userId', '==', userId),
        where('createdAt', '>=', firstDayOfMonth)
      );

      const snapshot = await getDocs(q);

      if (snapshot.size >= 2) {
        showModal('Her ay en fazla 2 kitap önerisi gönderebilirsiniz.');
        return;
      }

      await addDoc(collection(db, 'data'), {
        bookName: bookName.trim(),
        author: author.trim(),
        description: description.trim(),
        userId,
        userEmail,
        userName,
        createdAt: new Date(),
      });

      showModal('Kitap öneriniz gönderildi.');
      setBookName('');
      setAuthor('');
      setDescription('');
    } catch (error) {
      showModal('Kitap önerisi gönderilemedi. Lütfen tekrar deneyiniz.');
      console.error('Kitap önerisi hata:', error);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardOpeningTime={0}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: theme.textPrimary }]}>Kitap Önerisi Gönder</Text>
        <View style={{ width: 28 }} />
      </View>

      <View
        style={[
          styles.formContainer,
          {
            backgroundColor: theme.cardBackground,
            shadowColor: theme.shadowColor,
            elevation: 4,
          },
        ]}
      >
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Kullanıcılar ayda en fazla 2 kitap önerisi gönderebilir.
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Gönderdiğiniz kitaplar için içerik ve doğruluk sorumluluğu size aittir.
          </Text>
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              color: theme.textPrimary,
              borderColor: theme.border,
            },
          ]}
          placeholder="Kitap Adı"
          placeholderTextColor={theme.textSecondary}
          value={bookName}
          onChangeText={setBookName}
          returnKeyType="next"
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background,
              color: theme.textPrimary,
              borderColor: theme.border,
            },
          ]}
          placeholder="Yazar Adı"
          placeholderTextColor={theme.textSecondary}
          value={author}
          onChangeText={setAuthor}
          returnKeyType="next"
        />
        <TextInput
          style={[
            styles.input,
            { height: 100, textAlignVertical: 'top' },
            {
              backgroundColor: theme.background,
              color: theme.textPrimary,
              borderColor: theme.border,
            },
          ]}
          placeholder="Kitap Konusu"
          placeholderTextColor={theme.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          returnKeyType="done"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.toggleActive }]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalBackground]}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.cardBackground, shadowColor: theme.shadowColor },
            ]}
          >
            <Text style={[styles.modalMessage, { color: theme.textPrimary }]}>{modalMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.toggleActive }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerContainer: {
    width: 360,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  formContainer: {
    width: 360,
    padding: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 18,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalContainer: {
    padding: 28,
    borderRadius: 14,
    width: 320,
    alignItems: 'center',
    elevation: 5,
  },
  modalMessage: {
    fontSize: 17,
    marginBottom: 18,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
});
