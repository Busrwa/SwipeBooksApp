import React, { useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Modal
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { fetchBooksFromBackend } from '../../services/booksAPI';
import { ThemeContext } from '../../context/ThemeContext';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const fetchBookFromFirestore = async (isbn) => {
    const q = query(collection(db, "books"), where("isbn", "==", isbn));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        return { id: snapshot.docs[0].id, ...docData };
    }
    return null;
};

export default function ManualISBNScreen() {
    const { theme } = useContext(ThemeContext);
    const navigation = useNavigation();

    const [isbn, setIsbn] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setIsbn('');
            setErrorMessage('');
        }, [])
    );

    const isValidISBN = (value) => /^[0-9]{10,13}$/.test(value);

    const NUTUK_ISBN = "9789944888349";

    const handleSearch = async () => {
        setErrorMessage('');

        if (!isbn.trim()) {
            setErrorMessage('Lütfen ISBN giriniz.');
            return;
        }

        if (!isValidISBN(isbn.trim())) {
            setErrorMessage('Lütfen geçerli bir ISBN formatı girin.');
            return;
        }

        setLoading(true);

        // 30 saniye timeout
        const timeoutId = setTimeout(() => {
            setLoading(false);
            setModalVisible(true);
            setErrorMessage("Lütfen daha sonra tekrar deneyiniz.");
            setTimeout(() => {
                setModalVisible(false);
                navigation.goBack();
            }, 2000);
        }, 30000);

        try {
            let matchedBook = null;

            if (isbn.trim() === NUTUK_ISBN) {
                // Nutuk için Firestore’dan ara
                matchedBook = await fetchBookFromFirestore(NUTUK_ISBN);
            } else {
                // Diğer ISBN’ler backend’den
                const books = await fetchBooksFromBackend();
                matchedBook = books.find(book => book.isbn === isbn.trim());
            }

            clearTimeout(timeoutId);

            if (matchedBook) {
                navigation.navigate('DetailScreen', {
                    book: {
                        ...matchedBook,
                        createdAt: matchedBook.createdAt?.toString() || new Date().toISOString(),
                    },
                    isspecialnutuk: isbn.trim() === NUTUK_ISBN,
                });
            } else {
                setModalVisible(true);
            }
        } catch (error) {
            setErrorMessage('Bir hata oluştu, lütfen daha sonra tekrar deneyiniz.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAwareScrollView
            style={{ flex: 1, backgroundColor: theme.background }}
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 20,
                backgroundColor: theme.background,
            }}
            enableOnAndroid={true}
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerText, { color: theme.textPrimary }]}>
                    ISBN ile Kitap Bul
                </Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={[styles.container]}>
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    ISBN girerek veritabanımızda mevcut kitapları kontrol edebilir veya yeni kitap önerebilirsiniz.
                </Text>

                <TextInput
                    style={[styles.input, {
                        borderColor: theme.toggleActive,
                        color: theme.textPrimary,
                        backgroundColor: theme.inputBackground,
                        shadowColor: theme.shadowColor
                    }]}
                    placeholder="ISBN"
                    placeholderTextColor={theme.textSecondary}
                    value={isbn}
                    onChangeText={setIsbn}
                    keyboardType="numeric"
                />

                {errorMessage ? (
                    <Text style={[styles.errorText]}>{errorMessage}</Text>
                ) : null}

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.toggleActive }]}
                    onPress={handleSearch}
                    disabled={loading}
                >
                    <Text style={[styles.buttonText, { color: theme.buttonTextColor || '#fff' }]}>
                        {loading ? 'Bekleyiniz...' : 'Ara'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Modal */}
            <Modal
                transparent
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalBackground]}>
                    <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground, shadowColor: theme.shadowColor }]}>
                        <Text style={[styles.modalMessage, { color: theme.textPrimary }]}>
                            Üzgünüz, bu kitap şu anda veritabanımızda yok.{"\n"}
                            Ancak önerilerinizi bize göndererek yeni kitaplar eklememize yardımcı olabilirsiniz.
                        </Text>
                        <View style={styles.modalButtonRow}>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(false);
                                    navigation.navigate('KitapEkle', { suggestedISBN: isbn });
                                    setIsbn('');
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
                                    setIsbn('');
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
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        width: SCREEN_WIDTH * 0.9,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    container: { width: '100%', alignItems: 'center', paddingHorizontal: 20 },
    headerText: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
    infoText: { fontSize: 16, textAlign: 'center', marginBottom: 25 },
    input: {
        width: SCREEN_WIDTH * 0.9,
        height: 55,
        borderWidth: 2,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 18,
        marginBottom: 15,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    button: {
        width: SCREEN_WIDTH * 0.9,
        height: 55,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    buttonText: { fontSize: 18, fontWeight: 'bold' },
    errorText: { fontSize: 16, marginBottom: 10, color: 'red', textAlign: 'center' },
    modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 20 },
    modalContainer: { padding: 28, borderRadius: 16, width: '100%', maxWidth: 360, alignItems: 'center' },
    modalMessage: { fontSize: 17, marginBottom: 12, textAlign: 'center' },
    modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
    modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
    modalButtonText: { fontWeight: '700', fontSize: 17 },
});
