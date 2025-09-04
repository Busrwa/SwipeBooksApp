import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Animated,
  PanResponder,
  Linking,
  Alert,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Octicons from '@expo/vector-icons/Octicons';
import { FavoritesContext } from '../../context/FavoritesContext';
import { fetchBooksFromBackend } from '../../services/booksAPI';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';
import LottieView from 'lottie-react-native';
import { db } from '../../services/firebase';
import { ThemeContext } from '../../context/ThemeContext';

import { arrayRemove } from 'firebase/firestore';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // iPhone 6/7/8 genişliği referans
import { AuthContext } from '../../context/AuthContext';

function normalize(size) {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

function CustomAlertModal({ visible, title, message, onClose, theme, onUndo }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SCREEN_WIDTH * 0.05,
      }}>
        <View style={{
          backgroundColor: theme.background,
          borderRadius: 20,
          width: '100%',
          maxHeight: SCREEN_HEIGHT * 0.3,
          padding: SCREEN_WIDTH * 0.05,
          alignItems: 'center',
        }}>
          <Text style={{ fontSize: SCREEN_WIDTH * 0.06, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: theme.textPrimary }}>
            {title}
          </Text>
          <Text style={{ fontSize: SCREEN_WIDTH * 0.045, textAlign: 'center', marginBottom: 25, lineHeight: SCREEN_WIDTH * 0.06, color: theme.textSecondary }}>
            {message}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, backgroundColor: theme.toggleActive, marginRight: 10 }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.045 }}>Tamam</Text>
            </TouchableOpacity>

            {onUndo && (
              <TouchableOpacity
                onPress={onUndo}
                style={{ paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, backgroundColor: 'gray' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.045 }}>Geri Al</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}


const cleanDocId = (title) => {
  if (!title) return 'unknown';
  let id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  id = id.replace(/^-+|-+$/g, '');
  return id || 'unknown';
};

export default function SwipeScreen({ navigation }) {
  const { theme, darkMode } = useContext(ThemeContext);

  const logoSource = darkMode
    ? require('../../assets/logo_beyaz.png')
    : require('../../assets/logo_siyah.png');

  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  const [books, setBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [bookDescription, setBookDescription] = useState('');
  const [titleModalVisible, setTitleModalVisible] = useState(false);

  const { addFavorite, favorites, isFavorite } = useContext(FavoritesContext);
  const position = useRef(new Animated.ValueXY()).current;
  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const showAlert = (title, message, onUndo = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
    setAlertUndo(() => onUndo); // Yeni state: alertUndo
  };
  const [alertUndo, setAlertUndo] = useState(null);
  const hideAlert = () => {
    setAlertVisible(false);
    setAlertUndo(null);
  };

  const { user } = useContext(AuthContext);

  const currentBook = books.length > 0 ? books[currentIndex % books.length] : null;

  const handleUndoLike = async () => {
    if (!currentBook || !user) return;

    const bookId = cleanDocId(currentBook.title);
    await updateDoc(doc(db, "users", user.uid), {
      likedBooks: arrayRemove(bookId)
    });

    // Score’u geri azalt
    await updateBookScore(currentBook, "likes", -1);
    setHasLiked(false);
    hideAlert();
  };

  const handleUndoDislike = async () => {
    if (!currentBook || !user) return;

    const bookId = cleanDocId(currentBook.title);
    await updateDoc(doc(db, "users", user.uid), {
      dislikedBooks: arrayRemove(bookId)
    });

    await updateBookScore(currentBook, "dislikes", -1);
    setHasDisliked(false);
    hideAlert();
  };


  useEffect(() => {
    if (!user || !currentBook) return;

    const fetchUserLikes = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        // her kitap değişiminde güncelle
        const bookId = cleanDocId(currentBook.title);
        setHasLiked(data.likedBooks?.includes(bookId) || false);
        setHasDisliked(data.dislikedBooks?.includes(bookId) || false);
      } else {
        setHasLiked(false);
        setHasDisliked(false);
      }
    };
    fetchUserLikes();
  }, [user, currentBook?.title]); // currentBook değiştiğinde çalışacak



  useEffect(() => {
    const loadBooksAndIndex = async () => {
      setLoading(true);
      const bookList = await fetchBooksFromBackend();

      // Random sıralamayı kaldır, veritabanından geldiği sırayla kullan
      setBooks(bookList);

      // Kullanıcının kaldığı yeri Firestore'dan al
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const savedIndex = userSnap.data().lastViewedBookIndex || 0;
          setCurrentIndex(savedIndex);
        }
      }

      setLoading(false);
    };

    loadBooksAndIndex();
  }, [user]);

  const showNextBook = async () => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;

      // Firestore'a kullanıcı için son görülen kitap indeksini kaydet
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        updateDoc(userDocRef, { lastViewedBookIndex: nextIndex }).catch((error) => {
          logError('Firestore güncelleme hatası (lastViewedBookIndex):', error);
        });
      }

      // Yeni kitap geldiğinde butonları aktif et
      setButtonsDisabled(false);
      setHasLiked(false);
      setHasDisliked(false);


      return nextIndex;
    });
  };


  const updateBookScore = async (book, field, incrementValue) => {
    if (!book?.title) return;
    const docId = cleanDocId(book.title);
    const bookDocRef = doc(db, 'books', docId);

    try {
      const docSnap = await getDoc(bookDocRef);
      const commonData = {
        title: book.title,
        author: book.author || 'Bilinmiyor',
        coverImageUrl: book.coverImageUrl || null,
        description: book.description || '',
        isbn: book.isbn || null,
      };

      if (docSnap.exists()) {
        const updateData = {
          ...commonData,
          [field]: increment(incrementValue),
        };

        if (field === 'likes') {
          updateData.likesHistory = arrayUnion(Timestamp.now());
        }

        await updateDoc(bookDocRef, updateData);
      } else {
        const newData = {
          ...commonData,
          likes: field === 'likes' ? incrementValue : 0,
          dislikes: field === 'dislikes' ? incrementValue : 0,
        };

        if (field === 'likes') {
          newData.likesHistory = [Timestamp.now()];
        }

        await setDoc(bookDocRef, newData);
      }
    } catch (error) {
      logError('Firestore update error:', error);
    }
  };

  const handleThumbsUp = async () => {
    if (buttonsDisabled) return; // Eğer devre dışı ise hiçbir şey yapma
    if (hasLiked) {
      showAlert("Bilgi", "Bu kitabı zaten beğendiniz.", handleUndoLike);
      return;
    }
    if (hasDisliked) {
      showAlert("Bilgi", "Bu kitap için daha önce beğenmeme tuşuna bastınız.", handleUndoDislike);
      return;
    }

    setButtonsDisabled(true); // Diğer butonları devre dışı bırak
    if (currentBook) {
      await updateBookScore(currentBook, "likes", 1);
      await updateDoc(doc(db, "users", user.uid), {
        likedBooks: arrayUnion(cleanDocId(currentBook.title)),
      });
      setHasLiked(true);
    }
    Animated.timing(position, {
      toValue: { x: 500, y: 0 },
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      showNextBook();
      setButtonsDisabled(false);
    });
  };

  const handleDislike = async () => {
    if (buttonsDisabled) return;
    if (hasDisliked) {
      showAlert("Bilgi", "Bu kitabı zaten beğenmediniz.", handleUndoDislike);
      return;
    }
    if (hasLiked) {
      showAlert("Bilgi", "Bu kitap için daha önce beğenme tuşuna bastınız.", handleUndoLike);
      return;
    }
    setButtonsDisabled(true);

    if (currentBook) {
      await updateBookScore(currentBook, "dislikes", 1);
      await updateDoc(doc(db, "users", user.uid), {
        dislikedBooks: arrayUnion(currentBook.title),
      });
      setHasDisliked(true);
    }
    Animated.timing(position, {
      toValue: { x: -500, y: 0 },
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      showNextBook();
      setButtonsDisabled(false);
    });
  };

  const handleAddFavorite = () => {
    if (buttonsDisabled) return;

    if (!currentBook) return;
    // Eğer kitap zaten favorilerdeyse modal göster
    if (isFavorite(currentBook)) {
      showAlert('Bilgi', 'Bu kitap zaten favorilerinizde.');
      return;
    }
    // Eğer favori sayısı 15'i geçtiyse modal göster
    if (favorites.length >= 15) {
      showAlert('Uyarı', 'En fazla 15 favori kitap ekleyebilirsiniz.');
      return;
    }

    setButtonsDisabled(true);

    if (currentBook) {
      addFavorite(currentBook);
      Animated.timing(position, {
        toValue: { x: 500, y: 0 },
        duration: 400,
        useNativeDriver: false,
      }).start(() => {
        position.setValue({ x: 0, y: 0 });
        showNextBook();
        setButtonsDisabled(false);
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: async (_, gesture) => {
        if (gesture.dx > 120) await handleThumbsUp();
        else if (gesture.dx < -120) await handleDislike();
        else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const fetchDescription = () => {
    if (!currentBook) return;
    setBookDescription(currentBook.description || 'Kitap hakkında bilgi yok.');
    setModalVisible(true);
  };

  const handleReportPress = async () => {
    if (!currentBook) return;

    const email = 'info.swipeitofficial@gmail.com';
    const subject = encodeURIComponent(`Kitap Hatası Bildirimi: ${currentBook.title}`);
    const body = encodeURIComponent(
      `Merhaba,\n\n"${currentBook.title}" adlı kitapla ilgili bir hata veya sorun bildirmek istiyorum.\n\nLütfen detayları buraya yazınız...\n`
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      showAlert('Hata', 'E-posta göndermek için telefonunuzda bir posta uygulaması bulunmalı.');
    }
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: SCREEN_HEIGHT * 0.05,
      paddingBottom: SCREEN_HEIGHT * 0.15,
      position: 'relative',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SCREEN_HEIGHT * 0.025,
    },
    logo: {
      width: 150,
      height: 50,
    },
    bookInfo: {
      alignItems: 'center',
      marginBottom: SCREEN_HEIGHT * 0.02,
      paddingHorizontal: SCREEN_WIDTH * 0.05,
    },
    bookTitle: {
      fontSize: SCREEN_WIDTH * 0.05,
      maxWidth: SCREEN_WIDTH * 0.75,
      fontWeight: '700',
      textAlign: 'center',
      color: theme.textPrimary,
    },
    author: {
      fontSize: 18,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    cardContainer: {
      width: SCREEN_WIDTH * 0.8,
      height: SCREEN_HEIGHT * 0.55,
      marginBottom: SCREEN_HEIGHT * 0.025,
    },
    card: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    cover: {
      width: '100%',
      height: '100%',
    },
    reportButton: {
      position: 'absolute',
      top: SCREEN_HEIGHT * 0.02,
      right: SCREEN_WIDTH * 0.02,
      zIndex: 20,
    },
    swipeButtons: {
      bottom: 85,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      width: '60%',
      alignSelf: 'center',
      backgroundColor: 'transparent',
      zIndex: 10,
    },
    swipeButton: {
      padding: 15,
      backgroundColor: theme.background,
      borderRadius: 40,
      elevation: 5,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      marginHorizontal: 10,
    },
    learnMore: {
      position: 'absolute',
      bottom: SCREEN_HEIGHT * 0.04,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.toggleActive,
      paddingHorizontal: SCREEN_WIDTH * 0.05,
      paddingVertical: SCREEN_HEIGHT * 0.015,
      borderRadius: 20,
      zIndex: 10,
    },
    learnMoreText: {
      color: 'white',
      marginRight: SCREEN_WIDTH * 0.02,
      fontWeight: 'bold',
      fontSize: normalize(18),
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SCREEN_WIDTH * 0.05,
    },
    modalContainer: {
      backgroundColor: theme.background,
      borderRadius: 12,
      width: '100%',
      maxHeight: SCREEN_HEIGHT * 0.8,
      padding: SCREEN_WIDTH * 0.05,
    },
    modalCloseButton: {
      alignSelf: 'flex-end',
    },
    modalTitle: {
      fontSize: SCREEN_WIDTH * 0.065,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
      color: theme.textPrimary,
    },
    modalAuthor: {
      fontSize: SCREEN_WIDTH * 0.045,
      marginBottom: 15,
      textAlign: 'center',
      color: theme.textSecondary,
    },
    modalDescription: {
      fontSize: SCREEN_WIDTH * 0.045,
      lineHeight: SCREEN_WIDTH * 0.06,
      textAlign: 'justify',
      color: theme.textPrimary,
    },
    detailButton: {
      backgroundColor: theme.toggleActive,
      marginTop: 20, paddingVertical: 14, paddingHorizontal: 25, borderRadius: 30, alignSelf: 'center', shadowOpacity: 0.6, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }
    },
    detailButtonText: { color: '#fff', fontWeight: 'bold', fontSize: SCREEN_WIDTH * 0.047 },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../../assets/loading.json')}
          autoPlay
          loop
          style={{ width: 250, height: 250 }}
        />
        <Text style={{ marginTop: 10, fontSize: 16, color: theme.textSecondary }}>
          Kitaplar yükleniyor...
        </Text>
      </View>
    );
  }

  if (!currentBook) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.textPrimary }}>Gösterilecek kitap kalmadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={logoSource}
          style={styles.logo}
        />
      </View>

      <View style={styles.bookInfo}>
        <TouchableOpacity onPress={() => setTitleModalVisible(true)}>
          <Text style={styles.bookTitle} numberOfLines={1} ellipsizeMode="tail">
            {currentBook.title}
          </Text>
        </TouchableOpacity>
        <Text style={styles.author}>{currentBook.author}</Text>
      </View>

      <View style={styles.cardContainer}>
        {/* Arkada sabit duran bir sonraki kitap */}
        {books.length > 0 && books[(currentIndex + 1) % books.length] && (
          <View style={[styles.card, { position: 'absolute' }]}>
            <Image
              source={
                books[(currentIndex + 1) % books.length].coverImageUrl
                  ? { uri: books[(currentIndex + 1) % books.length].coverImageUrl }
                  : require('../../assets/swipeitlogo.png')
              }
              style={styles.cover}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Öndeki, animasyonla kayacak olan mevcut kitap */}
        {currentBook && (
          <Animated.View
            style={[styles.card, { transform: position.getTranslateTransform() }]}
            {...panResponder.panHandlers}
          >
            {currentBook.coverImageUrl ? (
              <Image source={{ uri: currentBook.coverImageUrl }} style={styles.cover} resizeMode="cover" />
            ) : (
              <Image source={require('../../assets/swipeitlogo.png')} style={styles.cover} resizeMode="cover" />
            )}
          </Animated.View>
        )}
        <TouchableOpacity onPress={handleReportPress} style={styles.reportButton}>
          <Ionicons name="alert-circle-outline" size={28} color={theme.errorBackground} />
        </TouchableOpacity>
      </View>

      <View style={styles.swipeButtons}>
        <TouchableOpacity onPress={handleDislike} style={styles.swipeButton} disabled={buttonsDisabled}>
          <Octicons name="thumbsdown" size={30} color={hasDisliked ? "red" : theme.errorBackground} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddFavorite} style={styles.swipeButton} disabled={buttonsDisabled}>
          <Ionicons name="heart-outline" size={30} color={theme.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleThumbsUp} style={styles.swipeButton} disabled={buttonsDisabled}>
          <Octicons name="thumbsup" size={30} color={hasLiked ? "green" : theme.successBackground} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.learnMore} onPress={fetchDescription}>
        <Text style={styles.learnMoreText}>Daha Fazla Ayrıntı</Text>
        <Ionicons name="arrow-forward" size={20} color={'white'} />
      </TouchableOpacity>

      {/* Açıklama Modalı */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={30} color={theme.textPrimary} />
            </TouchableOpacity>
            <ScrollView>
              <Text style={styles.modalTitle}>{currentBook.title}</Text>
              <Text style={styles.modalAuthor}>Yazar: {currentBook.author}</Text>
              <Text style={styles.modalDescription}>{bookDescription}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => {
                setModalVisible(false);
                const safeBook = {
                  ...currentBook,
                  createdAt: currentBook.createdAt
                    ? (currentBook.createdAt.toDate ? currentBook.createdAt.toDate().toISOString() : currentBook.createdAt.toISOString())
                    : null,
                };

                navigation.navigate('DetailScreen', { book: safeBook });
              }}
            >
              <Text style={styles.detailButtonText}>Yorumlar & Alıntılar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomAlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={hideAlert}
        theme={theme}
        onUndo={alertUndo}
      />

      {/* Başlık Modalı */}
      <Modal
        visible={titleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTitleModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { maxHeight: '30%' }]}>
            <TouchableOpacity onPress={() => setTitleModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={30} color={theme.textPrimary} />
            </TouchableOpacity>
            <ScrollView>
              <Text style={[styles.modalTitle, { fontSize: 20 }]}>{currentBook.title}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
