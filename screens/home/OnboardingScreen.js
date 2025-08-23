import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Swiper from 'react-native-swiper';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: 'slide1',
    title: 'Kitap Dünyasına Adım At',
    subtitle:
      'Favori kitaplarını keşfet, kitaplar arasında dolaş ve okuma yolculuğuna hemen başla. Her gün farklı kategorilerden yepyeni kitap önerileri seni bekliyor!',
    animation: require('../../assets/onboarding/Welcome.json'),
    paddingTop: 98,
  },
  {
    key: 'slide2',
    title: 'Alıntılarla İlham Al',
    subtitle:
      'Okuduğun kitaplardan en güzel alıntıları kaydet, yorum yap ve okuma deneyimini daha anlamlı hale getir.',
    animation: require('../../assets/onboarding/heart.json'),
    paddingTop: 122,
  },
  {
    key: 'slide3',
    title: 'Hadi Keşfetmeye Başlayalım!',
    subtitle:
      'Swipe It ile yeni favori kitaplarını bul, yorum yap ve kendi okuma dünyanı yarat. Keyifli okumalar!',
    animation: require('../../assets/onboarding/Books.json'),
    paddingTop: 80,
  },
];

export default function OnboardingScreen({ navigation }) {
  const swiperRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  const [user, setUser] = useState(undefined); // undefined: henüz belli değil

  useEffect(() => {
    const checkData = async () => {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(seen === 'true');
    };

    checkData();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (hasSeenOnboarding !== null && user !== undefined) {
      if (hasSeenOnboarding && user) {
        navigation.replace('Main'); 
      } else if (hasSeenOnboarding && !user) {
        navigation.replace('Login');
      } else {
        setLoading(false);
      }
    }
  }, [hasSeenOnboarding, user]);

  const handleDone = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Login');
  };

  const goNext = () => {
    swiperRef.current?.scrollBy(1);
  };

  const goPrev = () => {
    swiperRef.current?.scrollBy(-1);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../assets/loading.json')}
            autoPlay
            loop
            style={styles.loadingAnimation}
          />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // loading false ise onboarding göster
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Swiper
        ref={swiperRef}
        loop={false}
        activeDotColor="#E63946"
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        showsButtons={false}
        paginationStyle={styles.pagination}
        scrollEnabled={true}
      >
        {slides.map((slide, index) => (
          <View key={slide.key} style={styles.slide}>
            <View style={[styles.centerContent, { paddingTop: slide.paddingTop }]}>
              <LottieView
                source={slide.animation}
                autoPlay
                loop={true}
                style={styles.animation}
              />

              <View style={styles.titleRow}>
                {index > 0 ? (
                  <TouchableOpacity
                    onPress={goPrev}
                    style={[styles.iconButton, styles.iconButtonPrev]}
                  >
                    <Ionicons name="chevron-back" size={26} color="#555" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.iconPlaceholder} />
                )}

                <View style={styles.titleColumn}>
                  <Text style={styles.title}>{slide.title}</Text>
                  <Text style={styles.subtitle}>{slide.subtitle}</Text>

                  {index === slides.length - 1 && (
                    <TouchableOpacity style={styles.startButton} onPress={handleDone}>
                      <Text style={styles.startButtonText}>Başla</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={index === slides.length - 1 ? handleDone : goNext}
                  style={styles.iconButton}
                >
                  <Ionicons name="chevron-forward" size={26} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </Swiper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  animation: {
    width: width * 0.7,
    height: width * 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconButtonPrev: {
    backgroundColor: '#eee',
  },
  iconPlaceholder: {
    width: 42,
    height: 42,
    marginHorizontal: 2,
  },
  titleColumn: {
    flex: 1,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#555',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 25,
    marginTop: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  dot: {
    backgroundColor: 'rgba(230,230,230,0.7)',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#E63946',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 3,
  },
  pagination: {
    bottom: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: width * 0.5,
    height: width * 0.5,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#555',
  },
});
