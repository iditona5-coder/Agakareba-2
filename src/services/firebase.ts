import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { Post, Comment, UserProfile, ReportItem } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';

// Konfigurasi Firebase pribadi pengguna
export const firebaseConfig = {
  apiKey: "AIzaSyCIYga4scuibu7DvScxjy2LAyDZaC66zJM",
  authDomain: "kareba-ta-728d0.firebaseapp.com",
  projectId: "kareba-ta-728d0",
  storageBucket: "kareba-ta-728d0.firebasestorage.app",
  messagingSenderId: "88744359192",
  appId: "1:88744359192:web:3961c5cac1fa073cb35a6d",
  measurementId: "G-Z0BDDY9HCM"
};

// Inisialisasi Firebase App
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inisialisasi Firestore Database
export const db = getFirestore(firebaseApp);

// Inisialisasi Firebase Auth & Google Auth Provider
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

const USER_STORAGE_KEY = 'kareba_google_user';

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('Failed to save user in storage:', e);
  }
}

/**
 * Masuk menggunakan akun Google asli melalui Firebase Auth Popup
 */
export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const profile: UserProfile = {
      uid: fbUser.uid,
      displayName: fbUser.displayName || 'Pengguna Google',
      email: fbUser.email || '',
      photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    saveStoredUser(profile);
    return profile;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      // Penutupan popup oleh pengguna adalah aksi pembatalan yang wajar, bukan crash/error aplikasi
      return null;
    }
    console.warn('Firebase Google Sign-In error notice:', error?.message || error);
    throw error;
  }
}

/**
 * Masuk secara langsung dengan profil Google (untuk fallback/demo jika popup dihalangi iframe browser)
 */
export function signInAsGoogleUser(customProfile?: Partial<UserProfile>): UserProfile {
  const profile: UserProfile = {
    uid: customProfile?.uid || 'google_user_' + Date.now(),
    displayName: customProfile?.displayName || 'sukasukata24',
    email: customProfile?.email || 'sukasukata24@gmail.com',
    photoURL: customProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  };
  saveStoredUser(profile);
  return profile;
}

/**
 * Keluar / Logout dari Akun Google
 */
export async function logoutGoogleUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase SignOut warning:', err);
  }
  saveStoredUser(null);
}

/**
 * Langganan status autentikasi Google Firebase
 */
export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      const profile: UserProfile = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Pengguna Google',
        email: fbUser.email || '',
        photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      saveStoredUser(profile);
      callback(profile);
    } else {
      const stored = getStoredUser();
      callback(stored);
    }
  });

  return unsubscribe;
}

export const POSTS_COLLECTION = 'posts';

/**
 * ID Klien unik lokal untuk mengenali kepemilikan postingan (isOwn)
 */
export function getLocalClientId(): string {
  try {
    let id = sessionStorage.getItem('kareba_client_id');
    if (!id) {
      id = 'client_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('kareba_client_id', id);
    }
    return id;
  } catch {
    return 'client_temp';
  }
}

/**
 * Menyimpan data awal ke Firebase Firestore jika database masih kosong
 */
export async function seedInitialPostsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, POSTS_COLLECTION));
    if (snap.empty) {
      console.log('Database Firestore kosong, mengunggah data awal ke Firebase...');
      let orderIndex = INITIAL_POSTS.length;
      for (const p of INITIAL_POSTS) {
        await setDoc(doc(db, POSTS_COLLECTION, p.id), {
          ...p,
          orderTimestamp: Date.now() - orderIndex * 60000,
          updatedAt: serverTimestamp(),
        });
        orderIndex--;
      }
      console.log('✓ Data awal berhasil tersimpan ke Firebase Firestore!');
    }
  } catch (err) {
    console.warn('Gagal melakukan seed awal ke Firestore:', err);
  }
}

/**
 * Menyimpan atau memperbarui data postingan lengkap ke Firebase Firestore
 * (deskripsi, waktu, nama pengguna, avatar, media, lokasi, mood, dll.)
 */
export async function savePostToFirebase(post: Post): Promise<boolean> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, post.id);
    const clientId = getLocalClientId();

    const payload = {
      id: post.id,
      author: post.author || 'Warga Kareba',
      authorAvatar: post.authorAvatar || '',
      authorId: post.authorId || clientId,
      authorClientId: post.authorClientId || clientId,
      caption: post.caption || '',
      imageUrl: post.imageUrl || '',
      mediaType: post.mediaType || 'image',
      imageKitFileId: post.imageKitFileId || null,
      mood: post.mood || '☕',
      moodLabel: post.moodLabel || '',
      location: post.location || 'Palu',
      coordinates: post.coordinates || { lat: -0.892, lng: 119.885 },
      createdAt: post.createdAt || 'Baru saja',
      orderTimestamp: Date.now(),
      caresCount: Number(post.caresCount || 0),
      isCared: Boolean(post.isCared),
      userReaction: post.userReaction || null,
      comments: post.comments || [],
      category: post.category || 'santai',
      isOwn: Boolean(post.isOwn),
      hidden: Boolean(post.hidden),
      updatedAt: serverTimestamp(),
    };

    await setDoc(postRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firebase Firestore save warning:', err);
    return false;
  }
}

/**
 * Menghapus dokumen postingan dari Firebase Firestore
 */
export async function deletePostFromFirebase(postId: string): Promise<boolean> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(postRef);
    return true;
  } catch (err) {
    console.warn('Firebase Firestore delete warning:', err);
    return false;
  }
}

/**
 * Memperbarui data reaksi atau jumlah suka di Firebase Firestore
 */
export async function updatePostCareInFirebase(
  postId: string,
  isCared: boolean,
  caresCount: number,
  userReaction?: string
): Promise<boolean> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      isCared,
      caresCount,
      userReaction: userReaction || null,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Gagal update reaksi ke Firebase:', err);
    return false;
  }
}

/**
 * Menambahkan komentar ke postingan di Firebase Firestore
 */
export async function addCommentInFirebase(postId: string, comments: Comment[]): Promise<boolean> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      comments,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Gagal menambah komentar ke Firebase:', err);
    return false;
  }
}

/**
 * Mendengarkan data postingan secara real-time dari Firebase Firestore
 */
export function subscribeToFirebasePosts(
  onData: (posts: Post[]) => void,
  onError?: (error: any) => void,
  currentUserId?: string | null
): () => void {
  try {
    const q = query(collection(db, POSTS_COLLECTION));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedPosts: Post[] = [];
          const currentClientId = getLocalClientId();

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const authorId = data.authorId || data.authorClientId || undefined;
            const isAuthor = Boolean(
              (currentUserId && authorId && authorId === currentUserId) ||
              (data.authorClientId && data.authorClientId === currentClientId) ||
              data.isOwn
            );

            fetchedPosts.push({
              id: docSnap.id,
              author: data.author || 'Warga Kareba',
              authorAvatar: data.authorAvatar,
              authorId: authorId,
              authorClientId: data.authorClientId,
              caption: data.caption || '',
              imageUrl: data.imageUrl || '',
              mediaType: data.mediaType || 'image',
              imageKitFileId: data.imageKitFileId || undefined,
              mood: data.mood || '☕',
              moodLabel: data.moodLabel,
              location: data.location || 'Palu',
              coordinates: data.coordinates,
              createdAt: data.createdAt || 'Baru saja',
              caresCount: typeof data.caresCount === 'number' ? data.caresCount : 0,
              isCared: Boolean(data.isCared),
              userReaction: data.userReaction || undefined,
              comments: Array.isArray(data.comments) ? data.comments : [],
              category: data.category || 'santai',
              isOwn: isAuthor,
              hidden: Boolean(data.hidden),
            });
          });

          // Urutkan postingan: postingan terbaru dengan orderTimestamp paling tinggi berada di atas
          fetchedPosts.sort((a, b) => {
            const timeA = (snapshot.docs.find((d) => d.id === a.id)?.data()?.orderTimestamp as number) || 0;
            const timeB = (snapshot.docs.find((d) => d.id === b.id)?.data()?.orderTimestamp as number) || 0;
            return timeB - timeA;
          });

          onData(fetchedPosts);
        } else {
          // Jika kosong di awal, inisialisasi dengan seed
          seedInitialPostsIfEmpty();
        }
      },
      (error) => {
        console.warn('Firestore real-time subscription error (bisa karena rule permissions atau koneksi):', error);
        onError?.(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Gagal inisialisasi onSnapshot Firestore:', err);
    onError?.(err);
    return () => {};
  }
}

// ==========================================
// 🛡️ FITUR LAPORAN & MODERASI KAREBA'TA
// ==========================================
export const REPORTS_COLLECTION = 'reports';

/**
 * Mengirim laporan baru ke koleksi 'reports' di Firebase Firestore
 */
export async function submitReportToFirebase(report: ReportItem): Promise<boolean> {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, report.id);
    const payload = {
      id: report.id,
      postId: report.postId,
      postOwnerId: report.postOwnerId || '',
      postCaption: report.postCaption || '',
      postAuthor: report.postAuthor || '',
      reporterId: report.reporterId || 'anon',
      reporterName: report.reporterName || 'Warga Kareba',
      reason: report.reason,
      description: report.description || '',
      createdAt: report.createdAt || new Date().toISOString(),
      status: report.status || 'pending',
      updatedAt: serverTimestamp(),
    };

    await setDoc(reportRef, payload);
    return true;
  } catch (err) {
    console.warn('Gagal mengirim laporan ke Firebase:', err);
    return false;
  }
}

/**
 * Berlangganan data laporan secara real-time untuk Admin Moderasi
 */
export function subscribeToReports(
  onData: (reports: ReportItem[]) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const q = query(collection(db, REPORTS_COLLECTION));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ReportItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            postId: data.postId || '',
            postOwnerId: data.postOwnerId || '',
            postCaption: data.postCaption || '',
            postAuthor: data.postAuthor || '',
            reporterId: data.reporterId || '',
            reporterName: data.reporterName || 'Warga Kareba',
            reason: data.reason || 'Lainnya',
            description: data.description || '',
            createdAt: data.createdAt || new Date().toISOString(),
            status: data.status || 'pending',
          });
        });

        // Urutkan laporan terbaru di atas
        list.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime() || 0;
          const timeB = new Date(b.createdAt).getTime() || 0;
          return timeB - timeA;
        });

        onData(list);
      },
      (error) => {
        console.warn('Gagal membaca koleksi reports Firestore:', error);
        onError?.(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Gagal langganan laporan:', err);
    onError?.(err);
    return () => {};
  }
}

/**
 * Mengubah status laporan (misal: 'pending', 'resolved' / selesai, 'ignored' / diabaikan)
 */
export async function updateReportStatusInFirebase(
  reportId: string,
  status: 'pending' | 'resolved' | 'ignored'
): Promise<boolean> {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Gagal memperbarui status laporan:', err);
    return false;
  }
}

/**
 * Menyembunyikan atau menampilkan kembali postingan di feed
 */
export async function toggleHidePostInFirebase(postId: string, hidden: boolean): Promise<boolean> {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postRef, {
      hidden,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Gagal update status hidden post di Firebase:', err);
    return false;
  }
}

/**
 * Mengambil PIN keamanan admin dari Firestore (atau default '123456' jika belum di-set)
 */
export async function getAdminPinFromFirebase(): Promise<string> {
  const defaultPin = '123456';
  try {
    const configRef = doc(db, 'settings', 'admin_security');
    const docSnap = await getDoc(configRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.pin) {
        return String(data.pin);
      }
    } else {
      await setDoc(configRef, {
        pin: defaultPin,
        updatedAt: serverTimestamp(),
      });
    }
    return defaultPin;
  } catch (err) {
    console.warn('Fallback PIN lokal:', err);
    const localPin = localStorage.getItem('karebata_admin_pin');
    return localPin || defaultPin;
  }
}

/**
 * Menyimpan PIN keamanan baru ke Firestore
 */
export async function updateAdminPinInFirebase(newPin: string): Promise<boolean> {
  try {
    const configRef = doc(db, 'settings', 'admin_security');
    await setDoc(
      configRef,
      {
        pin: newPin,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    localStorage.setItem('karebata_admin_pin', newPin);
    return true;
  } catch (err) {
    console.error('Gagal update PIN ke Firebase:', err);
    localStorage.setItem('karebata_admin_pin', newPin);
    return true;
  }
}


