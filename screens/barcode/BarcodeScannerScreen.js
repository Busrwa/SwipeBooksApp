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
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleBarcodeScanned = async ({ data }) => {
    console.log("Taranan ISBN:", data); // <- burası eklediğimiz kısım
    setScanned(true);
    const books = await fetchBooksFromBackend();
    const matchedBook = books.find(book => book.isbn === data);

    if (matchedBook) {
      navigation.navigate('DetailScreen', { book: matchedBook });
    } else {
      showModal('Üzgünüz, bu kitap şu anda veritabanımızda yok. Ancak önerilerinizi bize göndererek yeni kitaplar eklememize yardımcı olabilirsiniz.');
    }
  };

  if (hasPermission === null) return <Text style={{ textAlign: 'center', marginTop: 20, color: theme.textPrimary }}>Kamera izni isteniyor...</Text>;
  if (hasPermission === false) return <Text style={{ textAlign: 'center', marginTop: 20, color: theme.textPrimary }}>Kamera izni verilmedi. İzin vermek için lütfen uygulamayı kapatıp açınız.</Text>;

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

      {/* Tekrar Tara Butonu */}
      {scanned && (
        <TouchableOpacity onPress={() => setScanned(false)} style={[styles.scanButton, { backgroundColor: theme.toggleActive }]}>
          <Text style={styles.scanButtonText}>Tekrar Tara</Text>
        </TouchableOpacity>
      )}

      {/* Modal */}
      <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalMessage, { color: theme.textPrimary }]}>{modalMessage}</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('KitapEkle');

                }}
                style={[styles.modalButton, { backgroundColor: theme.toggleActive }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.buttonTextColor || '#fff' }]}>
                  Kitap Öner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);

                }}
                style={[styles.modalButton, { backgroundColor: theme.cancelButton || '#999' }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.buttonTextColor || '#fff' }]}>
                  İptal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
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
  modalMessage: { fontSize: 17, marginBottom: 18, textAlign: 'center' },
  modalButton: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  modalButtonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
});
