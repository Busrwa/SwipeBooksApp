import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext'; 

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const handleEmailPress = () => {
    Linking.openURL('mailto:info.swipeitofficial@gmail.com');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={SCREEN_WIDTH * 0.07} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: theme.textPrimary }]}>Gizlilik Politikası</Text>
        </View>

        {/* Scroll İçerik */}
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>1. Giriş</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Bu gizlilik politikası, SwipeIt uygulaması aracılığıyla toplanan bilgilerin
            nasıl kullanıldığı, korunduğu ve işlendiğini açıklar. Uygulamayı kullanarak,
            bu politikayı kabul etmiş sayılırsınız.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>2. Toplanan Bilgiler</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Kullanıcı adı, e-posta adresi, favoriler ve kullanım verileri gibi sınırlı
            kişisel bilgiler toplanabilir. Bu veriler, kullanıcı deneyimini geliştirmek
            amacıyla kullanılır ve üçüncü taraflarla paylaşılmaz.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>3. Bilgi Kullanımı</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Toplanan bilgiler hesap yönetimi, içerik önerileri, uygulama geliştirme ve
            destek hizmetleri amacıyla kullanılır. Veriler, yasal zorunluluklar haricinde
            üçüncü kişilerle paylaşılmaz.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>4. Veri Güvenliği</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Kullanıcı bilgileriniz, uygun teknik ve idari önlemlerle korunmaktadır.
            Firebase Authentication ve Firestore gibi güvenilir servisler kullanılmaktadır.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>5. Üçüncü Taraf Hizmetleri</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Uygulama kimlik doğrulama ve veri depolama işlemleri için Firebase hizmetlerini
            kullanır. Bu hizmetlerin kendi gizlilik politikaları da geçerlidir.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>6. Çerezler</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Mobil uygulamada çerez kullanılmaz. Ancak, üçüncü taraf servislerin analiz
            araçları olabilir.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>7. Kullanıcı Hakları</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Kişisel verilerinizin erişimi, düzeltilmesi, silinmesi veya işlenmesine itiraz
            hakkınız vardır. Taleplerinizi uygulama içinden veya aşağıdaki e-posta adresinden iletebilirsiniz.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>8. Değişiklikler</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Gizlilik politikası zamanla güncellenebilir. Güncellemeler uygulama içinde
            duyurulacaktır.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Uygulamaya kayıt olarak, kişisel verilerinizin bu gizlilik politikası kapsamında
            işleneceğini ve saklanacağını açıkça kabul etmiş olursunuz.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>9. İletişim</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Sorularınız ve talepleriniz için:{'\n'}
            <Text
              style={[styles.emailLink, { color: theme.errorBackground }]}
              onPress={handleEmailPress}
            >
              info.swipeitofficial@gmail.com
            </Text>
          </Text>
        </ScrollView>
      </View>
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
  contentContainer: {
    paddingBottom: SCREEN_HEIGHT * 0.04,
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.042,
    fontWeight: '700',
    marginTop: SCREEN_HEIGHT * 0.035,
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  text: {
    fontSize: SCREEN_WIDTH * 0.035,
    lineHeight: SCREEN_WIDTH * 0.06,
  },
  emailLink: {
    textDecorationLine: 'underline',
  },
});
