import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Keyboard,
  Share,
} from 'react-native';
import { FavoritesContext } from '../../context/FavoritesContext';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, Timestamp, increment, arrayRemove, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../services/firebase';
import Octicons from '@expo/vector-icons/Octicons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { Linking } from 'react-native';

import { ThemeContext } from '../../context/ThemeContext';

const cleanDocId = (title) => {
  if (!title) return 'unknown';
  let id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  id = id.replace(/^-+|-+$/g, '');
  return id || 'unknown';
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const reasons = [
  'Spam veya alakasız içerik',
  'Nefret söylemi veya saldırgan dil',
  'Yanıltıcı bilgi',
  'Taciz veya zorbalık',
  'Diğer',
];

function ErrorModal({ visible, message, onClose, theme }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.modalBackground]}>
        <View style={[styles.errorModalContainer, { backgroundColor: theme.background }]}>
          <Text style={[styles.errorModalTitle, { color: theme.errorBackground }]}>Uyarı</Text>
          <Text style={[styles.errorModalMessage, { color: theme.textPrimary }]}>{message}</Text>
          <Pressable style={[styles.errorModalButton, { backgroundColor: theme.errorBackground }]} onPress={onClose}>
            <Text style={styles.errorModalButtonText}>Tamam</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function DetailScreen({ route, navigation }) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editText, setEditText] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const { book } = route.params;
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newQuote, setNewQuote] = useState('');
  const [activeTab, setActiveTab] = useState('comments');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorVisible, setErrorVisible] = useState(false);
  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { addFavorite, favorites, isFavorite } = useContext(FavoritesContext);

  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportItem, setSelectedReportItem] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);

  const { theme } = useContext(ThemeContext);

  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  const [likeCount, setLikeCount] = useState(0);
  const buttonsDisabled = editModalVisible || reportModalVisible || titleModalVisible || modalVisible;

  const [likeProcessing, setLikeProcessing] = useState(false);
  const [dislikeProcessing, setDislikeProcessing] = useState(false);

  const [buttonsTempDisabled, setButtonsTempDisabled] = useState(false);

  const isSpecialNutuk = book.id === 'nutuk';

  const handleShare = async () => {
    if (!book) return showFeedback('Kitap bilgisi bulunamadı.');
    try {
      const message = `📚 Kitap: "${book.title}"\n✍ Yazar: ${book.author}`;
      await Share.share({ message });
    } catch (error) {
      showFeedback('Paylaşım başarısız oldu.');
    }
  };


  <Text style={{ marginLeft: 6, fontWeight: 'bold', color: theme.textPrimary, marginTop: 8 }}>
    {isSpecialNutuk ? '∞' : `${likeCount} Beğeni`}
  </Text>

  const showFeedback = (message) => {
    setModalMessage(message);
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 2000);
  };

  const handleLike = async () => {
    if (!user) {
      showFeedback('Lütfen giriş yapınız.');
      return;
    }

    if (likeProcessing || buttonsTempDisabled) return;
    setLikeProcessing(true);
    setButtonsTempDisabled(true);

    try {
      const bookSnap = await getDoc(bookDocRef);
      const bookData = bookSnap.exists() ? bookSnap.data() : null;

      if (hasLiked) {
        // LikesHistory'den son eklenen kaydı çıkar
        const lastLikeTimestamp = bookData?.likesHistory?.[bookData.likesHistory.length - 1];
        await updateDoc(bookDocRef, {
          likes: increment(-1),
          likesHistory: lastLikeTimestamp ? arrayRemove(lastLikeTimestamp) : [],
        });
        await updateDoc(doc(db, 'users', user.uid), { likedBooks: arrayRemove(docId) });
        setHasLiked(false);
        showFeedback('Beğeniyi geri aldınız.');
      } else if (hasDisliked) {
        showFeedback('Bu kitap için daha önce beğenmeme tuşuna bastınız.');
      } else {
        const newTimestamp = Timestamp.now();
        await updateDoc(bookDocRef, {
          likes: increment(1),
          likesHistory: arrayUnion(newTimestamp),
        });
        await updateDoc(doc(db, 'users', user.uid), { likedBooks: arrayUnion(docId) });
        setHasLiked(true);
        showFeedback('Kitabı beğendiniz!');
      }
    } catch (error) {
      showFeedback('Beğenirken hata oluştu.');
    } finally {
      setLikeProcessing(false);
      setTimeout(() => setButtonsTempDisabled(false), 2000);
    }
  };


  const handleDislike = async () => {
    if (!user) {
      showFeedback('Lütfen giriş yapınız.');
      return;
    }

    if (dislikeProcessing || buttonsTempDisabled) return;
    setDislikeProcessing(true);
    setButtonsTempDisabled(true);

    try {
      if (isSpecialNutuk) {
        showFeedback('Bu eser, eleştirilmeyecek kadar değerlidir. Sadece saygıyla okunmalıdır.');
      } else {
        const bookSnap = await getDoc(bookDocRef);
        const bookData = bookSnap.exists() ? bookSnap.data() : null;

        if (hasDisliked) {
          // dislikesHistory'den son eklenen kaydı çıkar
          const lastDislikeTimestamp = bookData?.dislikesHistory?.[bookData.dislikesHistory.length - 1];
          await updateDoc(bookDocRef, {
            dislikes: increment(-1),
            dislikesHistory: lastDislikeTimestamp ? arrayRemove(lastDislikeTimestamp) : [],
          });
          await updateDoc(doc(db, 'users', user.uid), { dislikedBooks: arrayRemove(docId) });
          setHasDisliked(false);
          showFeedback('Beğenmeme geri alındı.');
        } else if (hasLiked) {
          showFeedback('Bu kitap için daha önce beğenme tuşuna bastınız.');
        } else {
          const newTimestamp = Timestamp.now();
          await updateDoc(bookDocRef, {
            dislikes: increment(1),
            dislikesHistory: arrayUnion(newTimestamp),
          });
          await updateDoc(doc(db, 'users', user.uid), { dislikedBooks: arrayUnion(docId) });
          setHasDisliked(true);
          showFeedback('Kitabı beğenmediniz.');
        }
      }
    } catch (error) {
      showFeedback('Beğenmeme sırasında hata oluştu.');
    } finally {
      setDislikeProcessing(false);
      setTimeout(() => setButtonsTempDisabled(false), 2000);
    }
  };



  const handleAddFavorite = async () => {
    if (!user) {
      showFeedback('Lütfen giriş yapınız.');
      return;
    }
    if (isFavorite(book)) {
      showFeedback('Bu kitap zaten favorilerinizde.');
      return;
    }
    if (favorites.length >= 15) {
      showFeedback('En fazla 15 favori kitap ekleyebilirsiniz.');
      return;
    }
    if (book) {
      try {
        await addFavorite(book);
        showFeedback('Kitap favorilere eklendi!');
      } catch (error) {
        showFeedback('Favorilere eklenirken hata oluştu.');
      }
    }
  };

  const handleReportPress = async () => {
    if (!book) return;

    const email = 'info.swipeitofficial@gmail.com';
    const subject = encodeURIComponent(`Kitap Hatası Bildirimi: ${book.title}`);
    const body = encodeURIComponent(
      `Merhaba,\n\n"${book.title}" adlı kitapla ilgili bir hata veya sorun bildirmek istiyorum.\n\nLütfen detayları buraya yazınız...\n`
    );
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      showError('E-posta göndermek için telefonunuzda bir posta uygulaması bulunmalı.');
    }
  };

  const docId = useMemo(() => cleanDocId(book?.title), [book?.title]);
  const bookDocRef = useMemo(() => doc(db, 'books', docId), [docId]);

  useEffect(() => {
    const unsubscribe = onSnapshot(bookDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikeCount(data.likes || 0); // Anlık beğeni sayısı
      }
    });

    return () => unsubscribe(); // Temizlik
  }, [bookDocRef]);

  useEffect(() => {
    if (!isSpecialNutuk) return;

    const nutukDocRef = doc(db, 'specialBooks', 'nutuk');

    const unsubscribe = onSnapshot(nutukDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Örneğin description ve quotes gibi alanları çekebilirsin
        setComments([]); // Nutuk için yorum eklemeyi kapatıyoruz
        setQuotes(data.quotes || []); // Nutuk alıntıları Firestore'dan gelir
      }
    });

    return () => unsubscribe();
  }, [book.id]);

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(bookDocRef);
        if (!docSnap.exists()) {
          await setDoc(bookDocRef, {
            title: book.title,
            author: book.author,
            coverImageUrl: book.coverImageUrl || null,
            likes: 0,
          });
          setLikeCount(0);
        } else {
          const data = docSnap.data();
          setLikeCount(data.likes || 0); // Firestore'daki toplam like sayısını state'e ata
        }

        const commentsDoc = await getDoc(doc(db, 'comments', docId));
        const commentsData = commentsDoc.exists() ? commentsDoc.data().entries || [] : [];

        const quotesDoc = await getDoc(doc(db, 'quotes', docId));
        const quotesData = quotesDoc.exists() ? quotesDoc.data().entries || [] : [];

        setComments(commentsData.filter(item => item.id));
        setQuotes(quotesData.filter(item => item.id));
      } catch (error) {
        showError('Kitap verileri yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookData();
  }, [bookDocRef]);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardOffset(event.endCoordinates.height - 30);
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });
    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (userDoc) => {
      if (userDoc.exists()) {
        const data = userDoc.data();
        setHasLiked(data.likedBooks?.includes(docId) || false);
        setHasDisliked(data.dislikedBooks?.includes(docId) || false);
      } else {
        setHasLiked(false);
        setHasDisliked(false);
      }
    });

    return () => unsubscribe(); // temizlik
  }, [user, docId]);



  const showError = (msg) => {
    setErrorMessage(msg);
    setErrorVisible(true);
  };

  const addEntry = async (type, text) => {
    const trimmed = text.trim();
    if (!trimmed) return showError(`${type === 'comments' ? 'Yorum' : 'Alıntı'} boş olamaz.`);
    if (!user) return showError('Kullanıcı bilgisi alınamadı. Lütfen giriş yapınız.');
    if (isSpecialNutuk) {
      showError(
        type === 'comments'
          ? 'Bu kitap, tarihe ışık tutan bir başyapıttır. Yorumlar ve alıntılar yerine, her satırını dikkatle okumak en doğru yaklaşımdır.'
          : 'Bu kitap, tarihe ışık tutan bir başyapıttır. Yorumlar ve alıntılar yerine, her satırını dikkatle okumak en doğru yaklaşımdır.'
      );
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const username = userDoc.exists() ? userDoc.data().username || 'Anonim' : 'Anonim';

      const newEntry = {
        id: generateUUID(),
        userId: user.uid,
        username,
        text: trimmed,
        createdAt: Timestamp.now(),
      };

      const collectionName = type === 'comments' ? 'comments' : 'quotes';
      const docRef = doc(db, collectionName, docId);

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          entries: arrayUnion(newEntry),
        });
      } else {
        await setDoc(docRef, {
          title: book.title || 'Bilinmeyen Kitap',
          author: book.author || 'Bilinmeyen Yazar',
          entries: [newEntry],
        });
      }

      if (type === 'comments') {
        setComments(prev => [...prev, newEntry]);
        setNewComment('');
      } else {
        setQuotes(prev => [...prev, newEntry]);
        setNewQuote('');
      }

      Keyboard.dismiss();
    } catch (error) {
      showError(`${type === 'comments' ? 'Yorum' : 'Alıntı'} eklenirken hata oluştu.`);
    }
  };

  const renderItem = ({ item }) => {
    const isOwner = user && item.userId === user.uid;

    return (
      <View style={[styles.listItem, { backgroundColor: theme.cardBackground }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.listText, { color: theme.textPrimary }]}>{item.text}</Text>
            <Text style={[styles.userText, { color: theme.textSecondary }]}>
              — {item.username || 'Anonim'} {item.edited ? '(Düzenlendi)' : ''}
            </Text>
          </View>

          {isOwner ? (
            <View style={{ flexDirection: 'row' }}>
              {/* Düzenle */}
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="create-outline" size={22} color={theme.toggleActive} />
              </TouchableOpacity>

              {/* Sil */}
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="trash-outline" size={22} color="red" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setSelectedReportItem(item);
                setReportModalVisible(true);
              }}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="alert-circle-outline" size={24} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleDelete = async (item) => {
    try {
      const collectionName = activeTab === 'comments' ? 'comments' : 'quotes';
      const docRef = doc(db, collectionName, docId);

      await updateDoc(docRef, {
        entries: arrayRemove(item),
      });

      if (activeTab === 'comments') {
        setComments(prev => prev.filter(c => c.id !== item.id));
      } else {
        setQuotes(prev => prev.filter(q => q.id !== item.id));
      }

      showFeedback('Gönderi silindi.');
    } catch (error) {
      showError('Silme işlemi başarısız.');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditText(item.text);
    setEditModalVisible(true);
  };
  const [updateMessage, setUpdateMessage] = useState('');


  const saveEdit = async () => {
    try {
      const collectionName = activeTab === 'comments' ? 'comments' : 'quotes';
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        let entries = docSnap.data().entries || [];
        entries = entries.map(e =>
          e.id === editingItem.id
            ? { ...e, text: editText, edited: true }
            : e
        );


        await setDoc(docRef, { entries }, { merge: true });

        if (activeTab === 'comments') {
          setComments(entries);
        } else {
          setQuotes(entries);
        }

        setEditModalVisible(false);
        showFeedback('Başarıyla güncellendi.');
      }
    } catch (error) {
      showError('Düzenleme sırasında hata oluştu.');
    }
  };

  const sendReport = async () => {
    if (!user || !selectedReportItem) return;

    try {
      await setDoc(doc(db, 'reports', generateUUID()), {
        type: activeTab === 'comments' ? 'comment' : 'quote',
        text: selectedReportItem.text,
        username: selectedReportItem.username || 'Anonim',
        bookTitle: book.title || 'Bilinmeyen Kitap',
        userId: user.uid,
        createdAt: Timestamp.now(),
        reason: selectedReason,
      });

      setReportModalVisible(false);
      showFeedback('Şikayetiniz gönderildi.');
    } catch (error) {
      showFeedback('Şikayet gönderilirken hata oluştu.');
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: theme.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Kitap Detayı</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={[styles.bookInfo, { borderBottomColor: theme.border }]}>
            <View style={styles.coverContainer}>
              <TouchableOpacity onPress={() => setTitleModalVisible(true)}>
                {book.coverImageUrl ? (
                  <Image source={{ uri: book.coverImageUrl }} style={styles.cover} />
                ) : (
                  <View style={[styles.cover, styles.noCover]}>
                    <Text style={[styles.noCoverText, { color: theme.textSecondary }]}>Kapak Yok</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.topRightButton}
                onPress={handleReportPress}
              >
                <Ionicons name="alert-circle-outline" size={28} color="red" />
              </TouchableOpacity>
            </View>


            <View style={styles.bookTextInfo}>
              <TouchableOpacity onPress={() => setTitleModalVisible(true)}>
                <Text style={[styles.bookTitle, { color: theme.textPrimary }]} numberOfLines={1} ellipsizeMode="tail">
                  {book.title}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.bookAuthor, { color: theme.textSecondary }]}>{book.author}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleLike}
                  disabled={buttonsDisabled || buttonsTempDisabled} style={[styles.iconBox, { backgroundColor: '#e6f7e6' }]}>
                  <Octicons name="thumbsup" size={22} color="#34a853" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDislike}
                  disabled={buttonsDisabled || buttonsTempDisabled} style={[styles.iconBox, { backgroundColor: '#ffeaea' }]}>
                  <Octicons name="thumbsdown" size={22} color="#ea4335" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddFavorite}
                  disabled={favoriteLoading}
                  style={[styles.iconBox, { backgroundColor: '#ffe5f0' }]}
                >
                  <Ionicons name="heart" size={22} color="#d60056" />
                </TouchableOpacity>


              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                {/* Beğeni sayısı */}
                <Octicons
                  name="heart"
                  size={22}
                  color="#e63946"
                  style={{ marginRight: 6 }}
                />
                <Text style={{ fontWeight: 'bold', color: theme.textPrimary, marginRight: 12 }}>
                  {isSpecialNutuk ? '∞ Beğeni' : `${likeCount} Beğeni`}
                </Text>

                {/* Paylaş butonu (ikon) */}
                <TouchableOpacity
                  onPress={handleShare}
                  style={{
                    padding: 8, // dokunma alanını biraz büyüt
                    borderRadius: 16, // daha yuvarlak köşeler
                    backgroundColor: theme.cardBackground, // tema uyumlu açık arka plan
                    borderWidth: 1,
                    borderColor: theme.toggleActive, // hafif bir kenarlık, ikon rengi ile uyumlu
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 8, // diğer butonlardan biraz boşluk
                  }}
                >
                  <Ionicons name="share-social-outline" size={20} color={theme.toggleActive} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
            {['comments', 'quotes'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.tabButton,
                  activeTab === type && { borderColor: theme.toggleActive },
                ]}
                onPress={() => setActiveTab(type)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === type ? theme.toggleActive : theme.textSecondary },
                    activeTab === type && styles.activeTabText,
                  ]}
                >
                  {type === 'comments' ? 'Yorumlar' : 'Alıntılar'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.toggleActive} style={{ marginTop: 20 }} />
          ) : (
            <>
              <FlatList
                data={(activeTab === 'comments' ? comments : quotes).slice(-10)}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                renderItem={renderItem}
                ListEmptyComponent={() => {
                  if (book.id === 'nutuk') { // sadece Nutuk için
                    return (
                      <View style={{ alignItems: 'center', marginTop: 20, paddingHorizontal: 20 }}>
                        <Text style={{ fontSize: SCREEN_WIDTH * 0.045, color: theme.textSecondary, textAlign: 'center' }}>
                          Bu kitap, tarihe ışık tutan bir başyapıttır. Yorumlar ve alıntılar yerine, her satırını dikkatle okumak en doğru yaklaşımdır.
                        </Text>
                      </View>
                    );
                  } else {
                    return (
                      <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Text style={{ fontSize: SCREEN_WIDTH * 0.045, color: theme.textSecondary }}>
                          {activeTab === 'comments' ? 'Henüz yorum yapılmadı.' : 'Henüz alıntı yapılmadı.'}
                        </Text>
                      </View>
                    );
                  }
                }}
                contentContainerStyle={{
                  paddingTop: 10,
                  paddingBottom: 30,
                }}
                keyboardShouldPersistTaps="handled"
              />

              <View style={[styles.inputContainer, { marginBottom: keyboardOffset }]}>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.cardBackground, color: theme.textPrimary },
                  ]}
                  placeholder={`Yeni ${activeTab === 'comments' ? 'yorum' : 'alıntı'} ekle...`}
                  placeholderTextColor={theme.textSecondary}
                  value={activeTab === 'comments' ? newComment : newQuote}
                  onChangeText={activeTab === 'comments' ? setNewComment : setNewQuote}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: theme.toggleActive }]}
                  onPress={() => addEntry(activeTab, activeTab === 'comments' ? newComment : newQuote)}
                >
                  <Ionicons name="send" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView >
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>

            {/* Başlık */}
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 10,
              color: theme.textPrimary,
              textAlign: 'center'
            }}>
              İletini Düzenle
            </Text>

            <TextInput
              value={editText}
              onChangeText={setEditText}
              style={[styles.input, { backgroundColor: theme.cardBackground, color: theme.textPrimary }]}
              multiline
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={[styles.errorModalButton, { backgroundColor: '#ccc', marginRight: 10 }]}
              >
                <Text style={{ color: '#000000ff', fontWeight: "bold" }}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveEdit}
                style={[styles.errorModalButton, { backgroundColor: theme.toggleActive }]}
              >
                <Text style={{ color: 'white', fontWeight: "bold" }}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <Modal visible={reportModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalText, { color: theme.textPrimary }]}>
              Bu içerik topluluk kurallarımıza aykırı mı?
            </Text>
            <Text
              style={[
                styles.modalText,
                { fontSize: 14, marginTop: 8, fontStyle: 'italic', color: theme.textSecondary },
              ]}
            >
              "{selectedReportItem?.text}"
            </Text>

            <Text style={{ marginTop: 16, fontWeight: '600', color: theme.textPrimary }}>
              Şikayet Sebebi Seçin:
            </Text>
            {reasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedReason(reason)}
                style={{
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                  backgroundColor: selectedReason === reason ? theme.cardBackground : 'transparent',
                }}
              >
                <Text style={{ fontSize: 16, color: theme.textPrimary }}>{reason}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => {
                  setReportModalVisible(false);
                  setSelectedReason(null);
                }}
                style={[styles.errorModalButton, { backgroundColor: '#ccc', marginRight: 10 }]}
              >
                <Text style={[styles.errorModalButtonText, { color: '#333' }]}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={sendReport}
                disabled={!selectedReason}
                style={[
                  styles.errorModalButton,
                  { backgroundColor: selectedReason ? 'red' : '#aaa' },
                ]}
              >
                <Text style={styles.errorModalButtonText}>Şikayet Et</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={titleModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <TouchableOpacity onPress={() => setTitleModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={30} color={theme.textPrimary} />
            </TouchableOpacity>
            <ScrollView>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{book.title}</Text>
              <Text style={[styles.modalAuthor, { color: theme.textSecondary }]}>Yazar: {book.author}</Text>
              <Text style={[styles.modalDescription, { color: theme.textPrimary }]}>
                {/* Buraya varsa kitap açıklaması veya detayları */}
                {book.description || 'Kitap açıklaması yok.'}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ErrorModal
        visible={errorVisible}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
        theme={theme}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={[styles.modalBackground]}>
          <View style={[styles.feedbackModalContainer, { backgroundColor: theme.background }]}>
            <Text style={[styles.feedbackModalText, { color: theme.textPrimary }]}>{modalMessage}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SCREEN_HEIGHT * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  backButton: {
    width: 28,
  },
  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.07,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  bookInfo: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  cover: {
    width: SCREEN_WIDTH * 0.30,
    height: SCREEN_WIDTH * 0.48,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  noCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCoverText: {
    fontSize: SCREEN_WIDTH * 0.04,
  },
  bookTextInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: '700',
  },
  bookAuthor: {
    fontSize: SCREEN_WIDTH * 0.045,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  activeTabText: {
    fontWeight: '700',
  },
  tabText: {
    fontSize: SCREEN_WIDTH * 0.045,
  },
  listItem: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
  },
  listText: {
    fontSize: SCREEN_WIDTH * 0.045,
    marginBottom: 5,
  },
  userText: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    alignItems: 'center',
    paddingTop: 2,
    marginBottom: 30,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: SCREEN_WIDTH * 0.045,
  },
  addButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorModalContainer: {
    width: SCREEN_WIDTH * 0.75,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  errorModalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorModalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  errorModalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  modalText: {
    fontSize: 18,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: SCREEN_HEIGHT * 0.8,
    padding: SCREEN_WIDTH * 0.05,
    padding: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalAuthor: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
  },
  feedbackModalContainer: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  feedbackModalText: {
    fontSize: 18,
    textAlign: 'center',
  },
  coverContainer: {
    position: 'relative',
  },

  topRightButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 5,
    borderRadius: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,  // eskiden 14
    paddingVertical: 5,     // eskiden 6
    borderRadius: 12,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },


});