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

export default function TermsOfUseScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const handleEmailPress = () => {
    Linking.openURL('mailto:info.swipeitofficial@gmail.com');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={SCREEN_WIDTH * 0.07} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: theme.textPrimary }]}>Kullanım Koşulları</Text>
        </View>

        {/* Scroll İçerik */}
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>1. Tanımlar</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            İşbu Kullanım Koşulları metninde;
            {"\n"}- “Uygulama” ifadesi SwipeIt mobil uygulamasını,
            {"\n"}- “Kullanıcı” ifadesi uygulamayı kullanan gerçek veya tüzel kişiyi,
            {"\n"}- “Biz”, “SwipeIt” ifadesi ise uygulamanın sahibi ve işletmecisini ifade eder.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>2. Kabul ve Onay</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Uygulamayı indirip kullanmanızla, işbu Kullanım Koşulları’nı, Gizlilik Politikası ve KVKK aydınlatma metnini okuyup anladığınızı,
            tamamını kabul ettiğinizi beyan etmiş sayılırsınız. Eğer bu koşulları kabul etmiyorsanız, lütfen uygulamayı kullanmayınız.
            Kullanımınız devam ettiği sürece bu koşulları kabul ettiğiniz varsayılır.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>3. Hizmet Tanımı</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            SwipeIt, kullanıcıların kitap içeriklerini görüntülemesine, favorilere eklemesine, değerlendirmesine ve kişisel koleksiyonlarını yönetmesine imkan tanır.
            Hizmet kapsamında sunulan içerik ve işlevler önceden haber verilmeksizin değiştirilebilir veya sonlandırılabilir.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>4. Hesap ve Güvenlik</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Hesabınızın güvenliği sizin sorumluluğunuzdadır. Şifrenizi gizli tutmanız, yetkisiz erişim durumunda derhal bizimle iletişime geçmeniz gerekmektedir.
            Herhangi bir yetkisiz kullanımda SwipeIt’in sorumluluğu bulunmamaktadır.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>5. Kullanıcı Yükümlülükleri</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Uygulamada;
            {"\n"}- Kanunlara, genel ahlak ve adaba aykırı,
            {"\n"}- Telif hakkı veya diğer üçüncü şahıs haklarını ihlal eden,
            {"\n"}- Zararlı, yanıltıcı, tehditkar, hakaret içeren içeriklerin paylaşımı kesinlikle yasaktır.
            Bu tür davranışlar tespit edilmesi halinde hesabınız askıya alınabilir, silinebilir ve yasal işlem başlatılabilir.
            Kullanıcı olarak, paylaştığınız tüm içeriklerin hukuki sorumluluğu tamamen size aittir.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>6. Fikri Mülkiyet Hakları</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Uygulamaya ait tüm yazılım, tasarım, içerik, logo, marka ve benzeri fikri mülkiyet hakları SwipeIt veya lisans verenlerine aittir.
            İzinsiz kopyalanması, dağıtılması veya ticari amaçlarla kullanılması yasaktır.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>7. Üçüncü Taraf Hizmetler</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Uygulamada, kimlik doğrulama ve veri saklama gibi işlemler için Firebase gibi üçüncü taraf servisler kullanılmaktadır.
            Bu servislerin kendi gizlilik politikaları ve kullanım koşulları geçerlidir.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>8. Sorumluluğun Sınırlandırılması</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Uygulama “olduğu gibi” ve “mevcut durumda” sunulmaktadır. Kesintisiz, hatasız veya kesintisiz çalışacağına dair garanti verilmez.
            SwipeIt, uygulamanın kullanımından doğan doğrudan veya dolaylı zararlardan, veri kaybından veya üçüncü tarafların davranışlarından sorumlu tutulamaz.
            Ayrıca kullanıcıların paylaştığı içeriklerin doğruluğu veya yasallığı konusunda garanti vermez.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>9. Kişisel Verilerin Korunması</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Kişisel verilerinizin işlenmesine ilişkin detaylı bilgiler için lütfen Gizlilik Politikası ve KVKK Aydınlatma Metni’ni inceleyiniz.
            Kullanıcı onayı olmadan kişisel verileriniz üçüncü taraflarla paylaşılmaz.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>10. Değişiklikler</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            SwipeIt, işbu Kullanım Koşullarını herhangi bir zamanda önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar.
            Yapılan değişiklikler uygulama üzerinden duyurulacak ve kullanıcıların erişimine sunulacaktır.
            Kullanımınıza devam etmeniz güncellenen koşulları kabul ettiğiniz anlamına gelir.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>11. Uyuşmazlıkların Çözümü</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            İşbu Kullanım Koşullarından doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti yasaları uygulanacak olup,
            İstanbul (Anadolu) Mahkemeleri ve İcra Daireleri yetkilidir.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>12. İletişim</Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            İşbu koşullar, hizmetlerimiz veya kişisel verilerinizle ilgili sorularınız için aşağıdaki e-posta adresinden bizimle iletişime geçebilirsiniz:{'\n'}
            <Text style={[styles.emailLink, { color: theme.errorBackground }]} onPress={handleEmailPress}>
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
