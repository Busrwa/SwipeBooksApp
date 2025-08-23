import React, { useEffect, useState, memo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Animated } from 'react-native';

import LottieView from 'lottie-react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesContext } from '../../context/FavoritesContext';
import { ThemeContext } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Alert modal
function CustomAlertModal({ visible, title, message, onClose, theme }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.customModalBackground}>
        <View style={[styles.customModalContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.alertTitle, { color: theme.textPrimary }]}>{title}</Text>
          <Text style={[styles.alertMessage, { color: theme.textSecondary }]}>{message}</Text>
          <TouchableOpacity style={[styles.alertButton, { backgroundColor: theme.toggleActive }]} onPress={onClose}>
            <Text style={styles.alertButtonText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const BookCard = memo(({ item, onPress, onAddFavorite, theme }) => {
  const title = item.title?.trim() || 'Başlık Bilgisi Yok';
  const author = item.author?.trim() || 'Yazar Bilgisi Yok';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.cardBackground, shadowColor: theme.shadowColor }]}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {item.coverImageUrl ? (
        <Image source={{ uri: item.coverImageUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.noCover]}>
          <Text style={[styles.noCoverText, { color: theme.textSecondary }]}>Kapak Yok</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.author, { color: theme.textSecondary }]}>{author}</Text>
        <View style={styles.stats}>
          <Ionicons name="heart" size={18} color="red" />
          <Text style={[styles.likes, { color: 'red' }]}>{item.likes || 0}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.favoriteButton, { backgroundColor: theme.toggleActive, shadowColor: theme.shadowColor }]}
        onPress={(e) => {
          e.stopPropagation();
          onAddFavorite(item);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.8}
      >
        <Ionicons name="heart" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function TopBooksScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const { addFavorite, favorites, isFavorite } = useContext(FavoritesContext);
  const [activeTab, setActiveTab] = useState('allTime');

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'books'),
      (querySnapshot) => {
        const now = new Date();
        const monday = getMondayUTC(now);
        const sundayEnd = getSundayEndUTC(monday);

        const allBooks = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const likesHistory = data.likesHistory || [];
          let weeklyLikes = 0;

          if (Array.isArray(likesHistory)) {
            weeklyLikes = likesHistory.filter(ts => {
              const dateObj = ts?.toDate?.();
              return dateObj && dateObj >= monday && dateObj <= sundayEnd;
            }).length;
          }

          return { id: doc.id, ...data, weeklyLikes };
        });

        const results = activeTab === 'weekly'
          ? allBooks.filter(book => (book.weeklyLikes || 0) > 0).sort((a, b) => b.weeklyLikes - a.weeklyLikes).slice(0, 10)
          : allBooks.filter(book => book.likes > 0).sort((a, b) => b.likes - a.likes).slice(0, 10);

        setBooks(results);
        setLoading(false);
      },
      () => {
        showAlert('Hata', 'Kitaplar yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [activeTab]);

  const getMondayUTC = (date) => {
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = utcDate.getUTCDay();
    const diff = (day === 0 ? -6 : 1) - day;
    utcDate.setUTCDate(utcDate.getUTCDate() + diff);
    utcDate.setUTCHours(0, 0, 0, 0);
    return utcDate;
  };

  const getSundayEndUTC = (mondayDate) => {
    const sunday = new Date(mondayDate);
    sunday.setUTCDate(mondayDate.getUTCDate() + 6);
    sunday.setUTCHours(23, 59, 59, 999);
    return sunday;
  };

  const openBookModal = (book) => {
    setSelectedBook(book);
    setBookModalVisible(true);
  };

  const closeBookModal = () => {
    setSelectedBook(null);
    setBookModalVisible(false);
  };

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const hideAlert = () => setAlertVisible(false);

  const addToFavorites = (book) => {
    if (isFavorite(book)) {
      // Eğer kitap zaten favorilerdeyse modal göster
      showAlert('Bilgi', 'Bu kitap zaten favorilerinizde.');
      return;
    }
    if (favorites.length >= 15) {
      showAlert('Uyarı', 'En fazla 15 favori kitap ekleyebilirsiniz.');
      return;
    }
    // Kitap favorilerde değilse ekle
    addFavorite(book);
    showAlert('Başarılı', `"${book.title}" favorilere eklendi.`);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <LottieView source={require('../../assets/loading.json')} autoPlay loop style={{ width: 250, height: 250 }} />
        <Text style={{ marginTop: 10, fontSize: 16, color: theme.textSecondary }}>
          En çok beğenilen kitaplar yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, { borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'weekly' && { borderColor: theme.toggleActive }]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'weekly' && { color: theme.toggleActive, fontWeight: 'bold' }]}>
            Haftalık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'allTime' && { borderColor: theme.toggleActive }]}
          onPress={() => setActiveTab('allTime')}
        >
          <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'allTime' && { color: theme.toggleActive, fontWeight: 'bold' }]}>
            Tüm Zamanlar
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.header, { color: theme.textPrimary }]}>
        {activeTab === 'weekly'
          ? 'Haftanın En Çok Beğenilen Kitapları'
          : 'Tüm Zamanların En Çok Beğenilen Kitapları'}
      </Text>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <BookCard item={item} onPress={openBookModal} onAddFavorite={addToFavorites} theme={theme} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{ paddingTop: 50, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: theme.textSecondary }}>
              {activeTab === 'weekly' ? 'Bu hafta beğenilen kitap bulunamadı.' : 'Henüz beğenilen kitap yok.'}
            </Text>
          </View>
        )}
      />

      {/* Book Modal */}
      <Modal visible={bookModalVisible} animationType="fade" transparent onRequestClose={closeBookModal}>
        <View style={styles.customModalBackground}>
          <View style={[styles.customModalContainer, { backgroundColor: theme.background }]}>
            <TouchableOpacity onPress={closeBookModal} style={styles.modalCloseButton}>
              <Ionicons name="close-circle" size={32} color={theme.textSecondary} />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{selectedBook?.title}</Text>
              <Text style={[styles.modalAuthor, { color: theme.textSecondary }]}>Yazar: {selectedBook?.author}</Text>
              {selectedBook?.coverImageUrl && (
                <Image source={{ uri: selectedBook.coverImageUrl }} style={styles.modalCover} resizeMode="cover" />
              )}
              <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
                {selectedBook?.description ?? selectedBook?.bookDescription ?? 'Açıklama bulunamadı.'}
              </Text>
              <TouchableOpacity style={[styles.detailButton, { backgroundColor: theme.toggleActive }]} onPress={() => {
                setBookModalVisible(false);
                navigation.navigate('DetailScreen', { book: selectedBook });
              }}>
                <Text style={styles.detailButtonText}>Yorumlar & Alıntılar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Alert Modal */}
      <CustomAlertModal visible={alertVisible} title={alertTitle} message={alertMessage} onClose={hideAlert} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Sadece yapısal stiller, renkler theme ile veriliyor
  container: { flex: 1, paddingTop: SCREEN_HEIGHT * 0.06, paddingHorizontal: SCREEN_WIDTH * 0.05 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15, borderBottomWidth: 1 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2 },
  tabText: { fontSize: 16 },
  header: { fontSize: SCREEN_WIDTH * 0.06, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  list: { paddingBottom: 30 },
  card: { flexDirection: 'row', borderRadius: 12, marginBottom: 12, overflow: 'hidden', elevation: 2, alignItems: 'center', padding: SCREEN_WIDTH * 0.03, position: 'relative' },
  cover: { width: SCREEN_WIDTH * 0.28, height: SCREEN_HEIGHT * 0.20, borderRadius: 5, backgroundColor: '#ddd' },
  noCover: { justifyContent: 'center', alignItems: 'center' },
  noCoverText: { fontSize: SCREEN_WIDTH * 0.035, textAlign: 'center' },
  info: { flex: 1, paddingLeft: SCREEN_WIDTH * 0.03, justifyContent: 'center' },
  title: { fontSize: SCREEN_WIDTH * 0.045, fontWeight: '600', marginBottom: 4 },
  author: { fontSize: SCREEN_WIDTH * 0.038, marginBottom: 8 },
  stats: { flexDirection: 'row', alignItems: 'center' },
  likes: { marginLeft: 6, fontSize: SCREEN_WIDTH * 0.045, fontWeight: 'bold' },
  favoriteButton: { position: 'absolute', right: SCREEN_WIDTH * 0.04, bottom: SCREEN_HEIGHT * 0.015, borderRadius: 25, padding: 10, elevation: 6 },
  customModalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: SCREEN_WIDTH * 0.05 },
  customModalContainer: { borderRadius: 20, width: '100%', maxHeight: SCREEN_HEIGHT * 0.85, padding: SCREEN_WIDTH * 0.06, elevation: 10 },
  modalCloseButton: { alignSelf: 'flex-end', marginBottom: 10 },
  modalTitle: { fontSize: SCREEN_WIDTH * 0.065, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalAuthor: { fontSize: SCREEN_WIDTH * 0.045, marginBottom: 15, textAlign: 'center' },
  modalCover: { width: '100%', height: SCREEN_HEIGHT * 0.25, borderRadius: 15, marginBottom: 15 },
  modalDescription: { fontSize: SCREEN_WIDTH * 0.045, lineHeight: SCREEN_WIDTH * 0.06, textAlign: 'justify' },
  detailButton: { marginTop: 20, paddingVertical: 14, paddingHorizontal: 25, borderRadius: 30, alignSelf: 'center', shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  detailButtonText: { color: '#fff', fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.047 },
  alertTitle: { fontSize: SCREEN_WIDTH * 0.06, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  alertMessage: { fontSize: SCREEN_WIDTH * 0.045, textAlign: 'center', marginBottom: 25, lineHeight: SCREEN_WIDTH * 0.06 },
  alertButton: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, alignSelf: 'center' },
  alertButtonText: { color: '#fff', fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.045 },
});
