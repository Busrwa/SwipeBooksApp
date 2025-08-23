import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext'; 

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function KVKK({ navigation }) {
  const { theme } = useContext(ThemeContext);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.outerContainer, { paddingTop: SCREEN_HEIGHT * 0.06 }]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text
              style={[styles.title, { color: theme.textPrimary }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              Kişisel Verilerin Korunması Hakkında Aydınlatma Metni
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              İşbu metin, Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ilgili mevzuat uyarınca,
              SwipeIt uygulaması kullanıcılarının kişisel verilerinin işlenme süreçleri hakkında
              bilgilendirme yapmak amacıyla hazırlanmıştır.
            </Text>

            <Text style={[styles.heading, { color: theme.textPrimary }]}>1. Veri Sorumlusu</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              Veri sorumlusu, SwipeIt uygulamasını işleten şirket/tüzel kişi olup, kullanıcıların
              kişisel verilerini kanun ve sözleşmeler çerçevesinde korumayı taahhüt eder.
            </Text>

            <Text style={[styles.heading, { color: theme.textPrimary }]}>2. İşlenen Kişisel Veriler</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              Ad, soyad, e-posta, kullanıcı adı, şifre, IP adresi, kullanım verileri gibi
              kişisel verileriniz işlenebilir.
            </Text>

            <Text style={[styles.heading, { color: theme.textPrimary }]}>3. Kişisel Verilerin İşlenme Amaçları</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              Hizmetlerin sunulması, hesap yönetimi, müşteri desteği, uygulama geliştirme, 
              yasal yükümlülüklerin yerine getirilmesi amaçlarıyla verileriniz işlenir.
            </Text>

            <Text style={[styles.heading, { color: theme.textPrimary }]}>4. Kişisel Verilerin Aktarılması</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              Kişisel verileriniz, ilgili yasal düzenlemeler çerçevesinde ve açık rızanız alınmadıkça
              üçüncü kişilere aktarılmaz. Ancak, hukuki zorunluluk durumunda yetkili kurumlara
              aktarım yapılabilir.
            </Text>

            <Text style={[styles.heading, { color: theme.textPrimary }]}>5. Veri Sahibi Hakları</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              KVKK’nın 11. maddesi kapsamında; kişisel verilerinize erişim, düzeltme, silme,
              işleme itiraz etme ve veri taşınabilirliği gibi haklara sahipsiniz. Bu haklarınızı
              kullanmak için aşağıdaki iletişim kanallarını kullanabilirsiniz.
            </Text>

            <Text style={[styles.heading, { color: theme.textPrimary }]}>6. Veri Güvenliği</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              Kişisel verileriniz, uygun teknik ve idari tedbirlerle korunmakta olup,
              yetkisiz erişime, kayba veya kötüye kullanıma karşı güvenlik önlemleri alınmaktadır.
            </Text>

            <Text style={[styles.heading, { color: theme.textPrimary }]}>7. İletişim</Text>
            <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
              Kişisel verilerinizle ilgili talepleriniz için bizimle
              <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}> info.swipeitofficial@gmail.com </Text>adresinden iletişime geçebilirsiniz.
            </Text>

            <Text style={[styles.consent, { color: theme.errorBackground }]}>
              Yukarıda belirtilen kişisel verilerimin SwipeIt uygulaması tarafından işlenmesini,
              KVKK kapsamında haklarımın bana bildirildiğini okudum, anladım ve kabul ediyorum.
            </Text>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  outerContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  consent: {
    fontSize: 14,
    marginTop: 25,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
