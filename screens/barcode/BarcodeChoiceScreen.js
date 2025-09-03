import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BarcodeChoiceScreen() {
    const { theme } = useContext(ThemeContext);
    const navigation = useNavigation();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>

            <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
                {/* Geri butonu */}
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
                </TouchableOpacity>

                {/* Başlık */}
                <Text style={[styles.headerText, { color: theme.textPrimary }]}>
                    Kitap Barkodu Okut
                </Text>

                {/* Ortada başlığı tam ortalamak için boş bir view */}
                <View style={{ width: 28 }} />
            </View>

            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                Kitapları barkod okuyucu ile taratabilir veya kitapların ISBN numaralarını girerek veritabanımızda olup olmadığını kontrol edebilir, ilgili kitaba yorum veya alıntı ekleyebilirsiniz.
            </Text>

            {/* Barkod ile Tara */}
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.toggleActive }]}
                onPress={() => navigation.navigate('BarcodeScanner')}
            >
                <Text style={styles.cardText}>Barkod Tara</Text>
            </TouchableOpacity>

            {/* Manuel ISBN Girişi */}
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.cardBackground }]}
                onPress={() => navigation.navigate('ManualISBN')}
            >
                <Text style={[styles.cardText, { color: theme.textPrimary }]}>Manuel ISBN Girişi</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    headerText: { fontSize: 26, fontWeight: '700', marginBottom: 12, },
    infoText: { fontSize: 16, textAlign: 'center', marginBottom: 25 },
    card: {
        width: SCREEN_WIDTH * 0.9,
        height: 120,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    cardText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    headerContainer: {
        width: SCREEN_WIDTH * 0.9,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
});
