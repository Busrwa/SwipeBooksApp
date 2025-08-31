import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { fetchBooksFromBackend } from '../../services/booksAPI';
import { ThemeContext } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BarcodeScannerScreen() {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(true); // Başlangıçta tara butonu aktif
  const [modalVisible, setModalVisible] = useState(false); // DetailScreen açılana kadar gösterilecek modal

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarcodeScanned = async ({ data }) => {
    setScanned(true); // Tara butonunu pasif yap
    setModalVisible(true); // Modal göster

    const books = await fetchBooksFromBackend();
    const matchedBook = books.find(book => book.isbn === data);

    setTimeout(() => {
      if (matchedBook) {
        const safeBook = {
          ...matchedBook,
          createdAt: matchedBook.createdAt ? matchedBook.createdAt.toISOString() : null,
        };
        navigation.navigate('DetailScreen', { book: safeBook });
      } else {
        navigation.navigate('KitapEkle', { suggestedIsbn: data });
      }
      setModalVisible(false); // DetailScreen açıldıktan sonra modalı kapat
    }, 800); // Kısa gecikme ile kullanıcı modalı görebilsin
  };

  if (hasPermission === null) return <Text style={{ textAlign: 'center', marginTop: 20, color: theme.textPrimary }}>Kamera izni isteniyor...</Text>;
  if (hasPermission === false) return <Text style={{ textAlign: 'center', marginTop: 20, color: theme.textPrimary }}>Kamera izni verilmedi. Lütfen uygulamayı kapatıp açınız.</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Kamera */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "qr"] }}
      />

      {/* Barkod Tarama Alanı */}
      <View style={[styles.scanBox, { borderColor: theme.toggleActive }]} />

      {/* Tara Butonu */}
      <TouchableOpacity
        onPress={() => setScanned(false)}
        style={[styles.scanButton, { backgroundColor: scanned ? theme.toggleActive : '#999' }]}
        disabled={!scanned} // Tara butonu sadece başta aktif, tarama başladıktan sonra pasif
      >
        <Text style={styles.scanButtonText}>Tara</Text>
      </TouchableOpacity>

      {/* DetailScreen Açılıyor Modalı */}
      <Modal transparent animationType="fade" visible={modalVisible}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalMessage, { color: theme.textPrimary }]}>Detail sayfası açılıyor...</Text>
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
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: SCREEN_WIDTH * 0.05 },
  modalContainer: { padding: 28, borderRadius: 14, width: '100%', maxWidth: 360, alignItems: 'center' },
  modalMessage: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
});
