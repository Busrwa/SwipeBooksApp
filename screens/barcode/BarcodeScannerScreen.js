import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { fetchBooksFromBackend } from '../../services/booksAPI';
import { ThemeContext } from '../../context/ThemeContext';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { Ionicons } from "@expo/vector-icons";

const fetchBookFromFirestore = async (isbn) => {
  const q = query(collection(db, "books"), where("isbn", "==", isbn));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docData = snapshot.docs[0].data();
    return { id: snapshot.docs[0].id, ...docData };
  }
  return null;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BarcodeScannerScreen() {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalText, setModalText] = useState('');
  const [loadingTextVisible, setLoadingTextVisible] = useState(false); // Tarama mesajı

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  // BarcodeScannerScreen içinde
  useEffect(() => {
    let timeoutId;

    if (loadingTextVisible) {
      timeoutId = setTimeout(() => {
        // Hâlâ taranmadıysa uyarı ver
        setLoadingTextVisible(false);
        setModalText("Lütfen daha sonra tekrar deneyiniz.");
        setModalVisible(true);

        // 2 saniye sonra geri çık
        setTimeout(() => {
          setModalVisible(false);
          navigation.goBack();
        }, 2000);
      }, 30000); // 30 saniye sonra
    }

    return () => clearTimeout(timeoutId);
  }, [loadingTextVisible, navigation]);

  useFocusEffect(
    useCallback(() => {
      setScanned(true);
      return () => {
        // cleanup
      };
    }, [])
  );

  const handleBarcodeScanned = async ({ data }) => {
    setScanned(true);
    setLoadingTextVisible(true);

    const NUTUK_ISBN = "9789944888349";

    let matchedBook = null;

    if (data === NUTUK_ISBN) {
      // Nutuk için Firestore'dan ara
      matchedBook = await fetchBookFromFirestore(NUTUK_ISBN);
    } else {
      // Diğer ISBN’ler backend’den
      const books = await fetchBooksFromBackend();
      matchedBook = books.find(book => book.isbn === data);
    }

    const isspecialnutuk = data === NUTUK_ISBN;

    setTimeout(() => {
      setLoadingTextVisible(false);
      let message = '';
      if (isspecialnutuk || matchedBook) {
        message = 'Kitabın detay sayfası açılıyor... (Bunun bir sistem olduğunu ve hata yapabileceğini unutmayınız.)';
      } else {
        message = 'Üzgünüz, bu kitap elimizde yok. Kitap ekleme sayfasına yönlendiriliyorsunuz...';
      }
      setModalText(message);
      setModalVisible(true);

      setTimeout(() => {
        if (isspecialnutuk) {
          const safeBook = matchedBook || { id: 'nutuk', title: 'Nutuk', isbn: NUTUK_ISBN };
          navigation.navigate("DetailScreen", { book: safeBook, isspecialnutuk: true });
        } else if (matchedBook) {
          const safeBook = {
            ...matchedBook,
            createdAt: matchedBook.createdAt
              ? (matchedBook.createdAt.toDate
                ? matchedBook.createdAt.toDate().toISOString()
                : matchedBook.createdAt instanceof Date
                  ? matchedBook.createdAt.toISOString()
                  : new Date().toISOString())
              : new Date().toISOString(),
          };
          navigation.navigate("DetailScreen", { book: safeBook, isspecialnutuk: false });
        } else {
          navigation.navigate('KitapEkle', { suggestedIsbn: data });
        }
        setModalVisible(false);
      }, 800);
    }, 500);
  };


  if (hasPermission === null)
    return <Text style={{ textAlign: 'center', marginTop: 20, color: theme.textPrimary }}>Kamera izni isteniyor...</Text>;
  if (hasPermission === false)
    return <Text style={{ textAlign: 'center', marginTop: 20, color: theme.textPrimary }}>Kamera izni verilmedi. Lütfen uygulamayı kapatıp açınız.</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
      </TouchableOpacity>

      {isFocused && ( // 🔑 sadece ekran odaktayken kamera render ediliyor
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr'] }}
        />
      )}

      <View style={[styles.scanBox, { borderColor: theme.toggleActive }]} />

      <TouchableOpacity
        onPress={() => {
          setScanned(false);
          setLoadingTextVisible(true); // Tara’ya basınca hemen başlat
        }}
        style={[styles.scanButton, { backgroundColor: scanned ? theme.toggleActive : '#999' }]}
        disabled={!scanned}
      >
        <Text style={styles.scanButtonText}>Tara</Text>
      </TouchableOpacity>

      {/* Taranıyor mesajı */}
      {loadingTextVisible && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.toggleActive} />
          <Text style={[styles.loadingText, { color: theme.textPrimary }]}>Taranıyor...</Text>
        </View>
      )}

      {/* Modal */}
      <Modal transparent animationType="fade" visible={modalVisible}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalMessage, { color: theme.textPrimary }]}>{modalText}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scanBox: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.25,
    left: SCREEN_WIDTH * 0.1,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.5,
    borderWidth: 3,
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  scanButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  modalContainer: {
    padding: 28,
    borderRadius: 14,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalMessage: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  loadingContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.45,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, fontSize: 16, fontWeight: '600' },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 8,
    borderRadius: 20,
  }

});
