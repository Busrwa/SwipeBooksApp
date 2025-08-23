import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeContext';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);

  const supportEmail = 'info.swipeitofficial@gmail.com';

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', showButton: false });

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${supportEmail}`).catch(() => {
      setModalContent({
        title: 'Hata',
        message: 'E-posta uygulaması açılamadı. Lütfen manuel olarak mail gönderin.',
        showButton: false,
      });
      setModalVisible(true);
    });
  };

  const handleFeedbackPress = () => {
    setModalContent({
      title: 'Geri Bildirim',
      message: 'Geri bildiriminizi bizimle paylaşmak için lütfen e-posta gönderin.',
      showButton: true,
    });
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: theme.textPrimary }]}>Yardım & Destek</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* SSS */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Sıkça Sorulan Sorular</Text>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Uygulamaya nasıl kayıt olabilirim?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Ana ekrandaki "Kayıt Ol" butonuna tıklayarak bilgilerinizi girmeniz yeterlidir.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Şifremi unuttum ne yapmalıyım?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Profil sayfanızdan "Şifre Değiştir" seçeneğiyle sıfırlama e-postası alabilirsiniz.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• KVKK veya Gizlilik Politikası metnine nereden ulaşabilirim?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Profil ekranındaki "Gizlilik Politikası" ve "Kullanım Koşulları" bağlantılarını kullanabilirsiniz.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Uygulamada bir hata buldum, nasıl bildirebilirim?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Aşağıdaki "Sorun Bildir" seçeneğinden bize ulaşabilirsiniz.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Kitaplar nasıl öneriliyor?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Kullanıcıların beğenilerine ve favorilerine göre algoritma yeni kitaplar ve yazarlar önerir.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Kütüphanem nasıl senkronize ediliyor?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Kalp butonuna tıklayarak eklediğiniz favori kitaplarınız hesabınıza bağlı olarak bulutta saklanır ve farklı cihazlarda otomatik senkronize edilir.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Okuma listemi yani Kütüphanemi nasıl yönetebilirim?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Okuma listenize kitap ekleyebilir, çıkarabilir veya sıralamasını değiştirebilirsiniz. Bu liste sizin özel listenizdir.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Kitap detaylarında beğeni, yorumlar ve alıntılar nasıl çalışıyor?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Beğeniler kullanıcıların kitaba verdikleri olumlu oyları gösterir. Yorumlar ve alıntılar ise diğer kullanıcıların paylaşımlarını içerir.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Yeni kitap ve yazarlar nasıl keşfedebilirim?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Ana sayfadaki kaydırma ile algoritmanın size özel hazırladığı farklı türlerde kitapları ve yazarları keşfedebilirsiniz.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Uygulama güncellemeleri nasıl yapılır?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Uygulama mağazanızdan güncellemeleri kontrol edebilir ve son sürümü indirerek kullanmaya devam edebilirsiniz.
            </Text>
          </View>

          <View style={styles.faqBlock}>
            <Text style={[styles.question, { color: theme.textSecondary }]}>• Uygulama verilerim güvende mi?</Text>
            <Text style={[styles.answer, { color: theme.textSecondary }]}>
              Kişisel verileriniz KVKK ve Gizlilik Politikası doğrultusunda güvenle saklanır.
            </Text>
          </View>

          {/* İletişim */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>İletişim</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Her türlü soru, öneri veya teknik destek için bizimle iletişime geçebilirsiniz:
          </Text>

          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={[styles.emailLink, { color: theme.errorBackground }]}>{supportEmail}</Text>
          </TouchableOpacity>

          {/* Geri Bildirim */}
          <TouchableOpacity onPress={handleFeedbackPress} style={[styles.feedbackButton, { backgroundColor: theme.errorBackground }]}>
            <Ionicons name="bug-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.feedbackButtonText}>Sorun Bildir / Geri Bildirim Gönder</Text>
          </TouchableOpacity>

          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            Geri bildirimleriniz uygulamayı geliştirmemize yardımcı olur. Teşekkür ederiz!
          </Text>
        </ScrollView>

      </View>

      {/* Custom Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalBackground]}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background, shadowColor: theme.shadowColor }]}>
            <Text style={[styles.modalTitle, { color: theme.errorBackground }]}>{modalContent.title}</Text>
            <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>{modalContent.message}</Text>
            <View style={styles.modalButtons}>
              {modalContent.showButton && (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.errorBackground }]}
                  onPress={() => {
                    setModalVisible(false);
                    handleEmailPress();
                  }}
                >
                  <Text style={styles.modalButtonText}>E-posta Gönder</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.errorBackground }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: SCREEN_HEIGHT * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SCREEN_WIDTH * 0.03,
    padding: SCREEN_WIDTH * 0.02,
  },
  header: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: '700',
    lineHeight: SCREEN_WIDTH * 0.08,
    flexShrink: 1,
  },
  content: {
    paddingBottom: SCREEN_HEIGHT * 0.04,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: '700',
    marginTop: SCREEN_HEIGHT * 0.035,
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  faqBlock: {
    marginBottom: 16,
  },
  question: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '700',
    marginTop: SCREEN_HEIGHT * 0.015,
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  answer: {
    fontSize: SCREEN_WIDTH * 0.035,
    marginTop: 6,
  },
  text: {
    fontSize: SCREEN_WIDTH * 0.042,
    lineHeight: SCREEN_WIDTH * 0.06,
  },
  emailLink: {
    fontSize: 16,
    textDecorationLine: 'underline',
    marginBottom: 24,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 14,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  noteText: {
    fontSize: 14,
    marginTop: 14,
    fontStyle: 'italic',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 5,
    // backgroundColor dinamik olarak tema ile set ediliyor
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    // color dinamik olarak tema ile set ediliyor
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 26,
    // color dinamik olarak tema ile set ediliyor
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 14,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    // backgroundColor dinamik olarak tema ile set ediliyor
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
