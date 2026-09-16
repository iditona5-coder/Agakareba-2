import React, { useState, useEffect, useRef } from 'react';
import { Post, UserProfile, ReportItem } from './types';
import { INITIAL_POSTS } from './data/initialPosts';
import { deleteFromImageKit } from './utils/imagekitUpload';
import {
  savePostToFirebase,
  deletePostFromFirebase,
  updatePostCareInFirebase,
  addCommentInFirebase,
  subscribeToFirebasePosts,
  seedInitialPostsIfEmpty,
  subscribeToAuth,
  logoutGoogleUser,
  getStoredUser,
  submitReportToFirebase,
  subscribeToReports,
  updateReportStatusInFirebase,
  toggleHidePostInFirebase,
  getLocalClientId,
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { RunningTextTicker } from './components/RunningTextTicker';
import { SharePromptBoard } from './components/SharePromptBoard';
import { PostCard } from './components/PostCard';
import { CreateVibeModal } from './components/CreateVibeModal';
import { GoogleLoginPage } from './components/GoogleLoginPage';
import { VibeMapView } from './components/VibeMapView';
import { ReportModal } from './components/ReportModal';
import { AdminModerationModal } from './components/AdminModerationModal';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { ProfileFullscreenModal, UserProfileData } from './components/ProfileFullscreenModal';
import { ArrowUp } from 'lucide-react';

export default function App() {
  // Sumber data murni dari Firebase Firestore
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  // Postingan baru yang masuk namun belum dilihat pengguna (ditandai dengan angka di icon Home)
  const [pendingNewPosts, setPendingNewPosts] = useState<Post[]>([]);
  // Melacak ID postingan yang sudah tampil di feed pengguna saat ini
  const displayedPostIdsRef = useRef<Set<string>>(new Set());
  const isInitialSyncRef = useRef(true);

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);
  const [isAdminModerationOpen, setIsAdminModerationOpen] = useState(false);
  const [reportedPostIds, setReportedPostIds] = useState<Set<string>>(new Set());

  const [viewMode, setViewMode] = useState<'feed' | 'map'>('feed');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGoogleLoginOpen, setIsGoogleLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [focusedPostId, setFocusedPostId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Modal Profil Layar Penuh (Hanya untuk profil sendiri)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfileData | null>(null);

  const handleOpenMyProfile = () => {
    if (!currentUser) return;
    setSelectedProfileUser({
      name: currentUser.displayName || 'Pengguna Google',
      avatar: currentUser.photoURL || undefined,
      email: currentUser.email || undefined,
      location: currentUser.location || 'Kab. Bone, Sulawesi Selatan',
      isCurrentUser: true,
    });
    setIsProfileModalOpen(true);
  };

  // ID unik pengguna saat ini (uid Google Auth jika sudah login, atau ID Client lokal)
  const currentUserId = currentUser?.uid || getLocalClientId();

  // Status admin moderasi (sukasukata24@gmail.com atau jika ada kredensial admin)
  const isAdmin = currentUser?.email === 'sukasukata24@gmail.com' || Boolean(currentUser?.email?.toLowerCase().includes('admin'));

  // Deteksi rute URL admin terpisah (?page=admin atau /admin)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') === 'admin' || window.location.pathname.startsWith('/admin');
  });

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setIsAdminRoute(params.get('page') === 'admin' || window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Pantau status login Google
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Monitor scroll position to show/hide "Scroll to Top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Sinkronisasi data real-time langsung ke Firebase Firestore
  useEffect(() => {
    // Inisialisasi data di Firebase jika koleksi masih kosong
    seedInitialPostsIfEmpty().catch(console.warn);

    const unsubscribe = subscribeToFirebasePosts((remotePosts) => {
      if (!remotePosts || remotePosts.length === 0) return;

      // Pemuatan awal saat aplikasi baru dibuka:
      // Tampilkan semua postingan langsung ke feed tanpa memunculkan angka di icon Home
      if (isInitialSyncRef.current) {
        setPosts(remotePosts);
        displayedPostIdsRef.current = new Set(remotePosts.map((p) => p.id));
        isInitialSyncRef.current = false;
        return;
      }

      // Pembaruan real-time berikutnya:
      const currentDisplayedIds = displayedPostIdsRef.current;
      const remoteMap = new Map(remotePosts.map((p) => [p.id, p]));

      // 1. Deteksi postingan baru yang belum pernah tampil di feed
      const brandNewPosts = remotePosts.filter((p) => !currentDisplayedIds.has(p.id));

      if (brandNewPosts.length > 0) {
        const ownNewPosts: Post[] = [];
        const otherNewPosts: Post[] = [];

        brandNewPosts.forEach((p) => {
          const isOwn = Boolean(
            p.isOwn ||
            (currentUserId && p.authorId && p.authorId === currentUserId) ||
            (p.authorClientId && p.authorClientId === getLocalClientId())
          );
          if (isOwn) {
            ownNewPosts.push(p);
          } else {
            otherNewPosts.push(p);
          }
        });

        // Jika postingan milik sendiri yang baru dibuat, langsung tampilkan di feed
        if (ownNewPosts.length > 0) {
          ownNewPosts.forEach((p) => currentDisplayedIds.add(p.id));
          setPosts((prev) => {
            const existingIds = new Set(prev.map((item) => item.id));
            const toAdd = ownNewPosts.filter((item) => !existingIds.has(item.id));
            return [...toAdd, ...prev];
          });
        }

        // Jika postingan baru dari orang lain, masukkan ke pendingNewPosts
        // Ini akan memunculkan angka di atas icon Home!
        if (otherNewPosts.length > 0) {
          setPendingNewPosts((prev) => {
            const existingPendingIds = new Set(prev.map((item) => item.id));
            const freshlyIncoming = otherNewPosts.filter(
              (item) => !existingPendingIds.has(item.id) && !currentDisplayedIds.has(item.id)
            );
            return [...freshlyIncoming, ...prev];
          });
        }
      }

      // 2. Perbarui postingan yang sudah ada (misal update reaksi, komentar, caresCount, status hidden)
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          const updated = remoteMap.get(post.id);
          if (updated) {
            return {
              ...post,
              caresCount: updated.caresCount,
              isCared: updated.isCared,
              userReaction: updated.userReaction,
              comments: updated.comments,
              hidden: updated.hidden,
            };
          }
          return post;
        })
      );
    }, undefined, currentUserId);

    const unsubscribeReports = subscribeToReports((remoteReports) => {
      if (remoteReports) {
        setReports(remoteReports);
        // PRIVASI:
        // Hanya laporan yang diajukan oleh pengguna saat ini sendiri yang dicatat pada status lokal pelapor.
        // Pemilik postingan & pengguna lain TIDAK BISA melihat tanda bahwa suatu postingan telah dilaporkan.
        const myReports = remoteReports.filter(
          (r) => r.reporterId === currentUserId || (currentUser?.uid && r.reporterId === currentUser.uid)
        );
        const myIds = new Set(myReports.map((r) => r.postId));
        setReportedPostIds((prev) => new Set([...prev, ...myIds]));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeReports();
    };
  }, [currentUserId, currentUser?.uid]);

  // Aksi ketika icon Home atau banner "Kabar Baru" diklik:
  // 1. Postingan baru yang tadi belum dilihat langsung muncul di feed paling atas
  // 2. Angka di atas icon Home otomatis hilang
  // 3. Layar otomatis scroll mulus ke paling atas
  const handleHomeClick = () => {
    if (pendingNewPosts.length > 0) {
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const toAdd = pendingNewPosts.filter((p) => !existingIds.has(p.id));
        return [...toAdd, ...prev];
      });

      // Tandai semua postingan ini sudah dilihat
      pendingNewPosts.forEach((p) => displayedPostIdsRef.current.add(p.id));

      // Otomatis hilangkan angka di atas icon Home
      setPendingNewPosts([]);
    }

    // Kembalikan ke mode feed jika sedang di mode map
    if (viewMode !== 'feed') {
      setViewMode('feed');
    }

    // Reset kata kunci pencarian jika sedang aktif agar semua berita terlihat
    if (searchQuery) {
      setSearchQuery('');
    }

    // Scroll ke paling atas
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Toggle Care (❤️ Peduli) or reaction
  const handleToggleCare = (postId: string) => {
    let targetIsCared = false;
    let targetCount = 0;
    let targetReaction: string | undefined;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const newIsCared = !post.isCared;
          targetIsCared = newIsCared;
          targetReaction = newIsCared ? (post.userReaction || '❤️') : undefined;
          targetCount = newIsCared ? post.caresCount + 1 : Math.max(0, post.caresCount - 1);

          return {
            ...post,
            isCared: newIsCared,
            userReaction: targetReaction,
            caresCount: targetCount,
          };
        }
        return post;
      })
    );

    // Sinkronkan ke Firebase
    updatePostCareInFirebase(postId, targetIsCared, targetCount, targetReaction);
  };

  // Set Custom Reaction (😡 😱 😄 🥲 🥰)
  const handleSelectReaction = (postId: string, emoji: string) => {
    let targetIsCared = false;
    let targetCount = 0;
    let targetReaction: string | undefined;

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const wasCared = post.isCared;
          const isSameReaction = post.userReaction === emoji;
          
          if (isSameReaction) {
            targetIsCared = false;
            targetReaction = undefined;
            targetCount = Math.max(0, post.caresCount - 1);
            return {
              ...post,
              isCared: false,
              userReaction: undefined,
              caresCount: targetCount,
            };
          }

          targetIsCared = true;
          targetReaction = emoji;
          targetCount = wasCared ? post.caresCount : post.caresCount + 1;

          return {
            ...post,
            isCared: true,
            userReaction: emoji,
            caresCount: targetCount,
          };
        }
        return post;
      })
    );

    // Sinkronkan ke Firebase
    updatePostCareInFirebase(postId, targetIsCared, targetCount, targetReaction);
  };

  // Add Comment (💬 Komentar)
  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author: 'Warga Palu',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      text,
      createdAt: 'Baru saja',
    };

    let allComments: any[] = [];

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          allComments = [...post.comments, newComment];
          return {
            ...post,
            comments: allComments,
          };
        }
        return post;
      })
    );

    // Sinkronkan komentar ke Firebase
    if (allComments.length > 0) {
      addCommentInFirebase(postId, allComments);
    }
  };

  // Klik papan "Ada kabar apa di daerah'ta"
  const handleClickShareBoard = () => {
    if (!currentUser) {
      // Masuk ke halaman login Google
      setIsGoogleLoginOpen(true);
    } else {
      // Jika sudah masuk dengan akun Google, langsung buka modal buat postingan
      setIsCreateModalOpen(true);
    }
  };

  const handleSuccessGoogleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsGoogleLoginOpen(false);
    setIsCreateModalOpen(false);
    setViewMode('feed');
  };

  const handleLogout = async () => {
    await logoutGoogleUser();
    setCurrentUser(null);
  };

  // Add New Post (FAB action)
  const handleAddPost = (newPostData: Omit<Post, 'id' | 'createdAt' | 'caresCount' | 'isCared' | 'comments'>) => {
    const authorId = currentUser?.uid || getLocalClientId();
    const newPost: Post = {
      author: currentUser?.displayName || 'Warga Kareba',
      authorAvatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      authorId: authorId,
      authorClientId: getLocalClientId(),
      ...newPostData,
      id: `post-${Date.now()}`,
      createdAt: 'Baru saja',
      caresCount: 1,
      isCared: true,
      comments: [],
      isOwn: true,
    };

    // Tambahkan ke state lokal & simpan ke Firebase
    displayedPostIdsRef.current.add(newPost.id);
    setPosts((prev) => [newPost, ...prev]);
    savePostToFirebase(newPost);
  };

  // Delete Post (Hapus postingan sendiri & otomatis hapus dari Firebase & ImageKit)
  const handleDeletePost = (postId: string) => {
    const postToDelete = posts.find((p) => p.id === postId);

    // Langsung hapus dari tampilan UI & database lokal
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));

    // Hapus dari Firebase Firestore
    deletePostFromFirebase(postId);

    // Jika postingan memiliki media ImageKit, hapus permanen dari server ImageKit
    if (postToDelete && (postToDelete.imageKitFileId || (postToDelete.imageUrl && postToDelete.imageUrl.includes('imagekit.io')))) {
      console.log('Menghapus media terkait dari ImageKit untuk post:', postId);
      deleteFromImageKit(postToDelete.imageKitFileId, postToDelete.imageUrl).then((success) => {
        if (success) {
          console.log('✓ Media berhasil terhapus dari ImageKit.');
        } else {
          console.warn('Gagal atau dilewati penghapusan media ImageKit.');
        }
      }).catch((err) => {
        console.error('Error saat menghapus media ImageKit:', err);
      });
    }
  };

  // Jump to view on Map
  const handleViewOnMap = (post: Post) => {
    setFocusedPostId(post.id);
    setViewMode('map');
  };

  // Buka dialog Laporkan Postingan (Hanya untuk postingan yang dilihat oleh pengguna lain)
  const handleOpenReport = (post: Post) => {
    // ATURAN: Jika pengguna melihat postingannya sendiri, tombol/aksi "Laporkan" tidak boleh dijalankan
    const postOwnerId = post.authorId || (post.isOwn ? currentUserId : undefined);
    if ((currentUserId && postOwnerId && currentUserId === postOwnerId) || post.isOwn) {
      return;
    }
    setReportingPost(post);
  };

  // Kirim laporan postingan ke Firebase Firestore collection 'reports'
  const handleSubmitReport = async (report: ReportItem): Promise<boolean> => {
    const success = await submitReportToFirebase(report);
    setReportedPostIds((prev) => new Set([...prev, report.postId]));
    return success;
  };

  // Moderasi: Menyembunyikan atau menampilkan postingan
  const handleToggleHidePost = async (postId: string, hidden: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === postId ? { ...p, hidden } : p))
    );
    await toggleHidePostInFirebase(postId, hidden);
  };

  // Moderasi: Mengubah status laporan (pending, resolved, ignored)
  const handleUpdateReportStatus = async (
    reportId: string,
    status: 'pending' | 'resolved' | 'ignored'
  ) => {
    setReports((prevReports) =>
      prevReports.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
    await updateReportStatusInFirebase(reportId, status);
  };

  // Filter posts (postingan yang disembunyikan / hidden tidak ditampilkan di feed publik)
  const filteredPosts = posts.filter((post) => {
    if (post.hidden) return false;
    if (selectedMood && post.mood !== selectedMood) return false;
    if (selectedLocation && post.location !== selectedLocation) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCaption = post.caption?.toLowerCase().includes(q);
      const matchLocation = post.location?.toLowerCase().includes(q);
      const matchAuthor = post.author?.toLowerCase().includes(q);
      const matchMood = post.mood?.toLowerCase().includes(q);
      const matchMoodLabel = post.moodLabel?.toLowerCase().includes(q);
      const matchCategory = post.category?.toLowerCase().includes(q);
      if (!matchCaption && !matchLocation && !matchAuthor && !matchMood && !matchMoodLabel && !matchCategory) {
        return false;
      }
    }
    return true;
  });

  // JIKA MEMBUKA URL DASBOR ADMIN TERPISAH (?page=admin atau /admin)
  if (isAdminRoute) {
    return (
      <AdminDashboardPage
        reports={reports}
        posts={posts}
        currentUser={currentUser}
        onToggleHidePost={handleToggleHidePost}
        onDeletePost={handleDeletePost}
        onUpdateReportStatus={handleUpdateReportStatus}
        onBackToApp={() => {
          window.history.pushState({}, '', window.location.pathname.replace(/\/admin$/, '') || '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans text-slate-900 pb-20">
      {/* 1. APP BAR & PAPAN TEKS BERJALAN: Sticky bersama di paling atas, kokoh & tidak bergoyang saat scroll mentok ke atas */}
      <div className="sticky-top-bar-stable w-full shadow-xs bg-white z-40">
        <Navbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenCreate={() => setIsCreateModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          postsCount={posts.length}
          unseenCount={pendingNewPosts.length}
          onHomeClick={handleHomeClick}
        />

        <RunningTextTicker
          posts={posts.filter((p) => !p.hidden)}
          onSelectPost={(postId) => {
            if (viewMode === 'map') {
              setViewMode('feed');
            }
            setTimeout(() => {
              const el = document.getElementById(`post-card-${postId}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }}
        />
      </div>

      {/* 2. MAP VIEW OR FEED VIEW */}
      {viewMode === 'map' ? (
        <VibeMapView
          posts={posts.filter((p) => !p.hidden)}
          onSelectPost={(p) => setFocusedPostId(p.id)}
          onBackToFeed={() => setViewMode('feed')}
          onToggleCare={handleToggleCare}
          selectedPostId={focusedPostId}
        />
      ) : (
        <div className="w-full flex flex-col">
          {/* Tombol Melayang Berita Baru Belum Dilihat (Jika ada kabar baru yang belum dilihat saat user membaca feed) */}
          {pendingNewPosts.length > 0 && (
            <div className="sticky top-[86px] sm:top-[92px] z-30 flex justify-center py-2 -mb-10 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                id="btn-floating-new-posts"
                type="button"
                onClick={handleHomeClick}
                className="pointer-events-auto bg-[#007aff] hover:bg-[#0066d6] active:scale-95 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-white/40 transition-all cursor-pointer"
                title="Klik untuk melihat postingan yang tadi belum dilihat"
              >
                <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
                <span>{pendingNewPosts.length} Kabar Baru Belum Dilihat</span>
              </button>
            </div>
          )}

          {/* Papan "Ada kabar apa di daerah'ta?" rapat langsung menempel di bawah papan pengumuman teks berjalan */}
          <SharePromptBoard
            currentUser={currentUser}
            onClickBoard={handleClickShareBoard}
            onLogout={handleLogout}
            isAdmin={isAdmin}
            onOpenAdminModeration={() => setIsAdminModerationOpen(true)}
            onOpenProfile={handleOpenMyProfile}
          />

          {/* Active Search Filter Chip */}
          {searchQuery.trim() && (
            <div className="max-w-2xl mx-auto w-full px-3 pt-2">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-emerald-900">
                <span className="truncate">
                  Hasil pencarian: <strong className="font-semibold text-emerald-950">"{searchQuery}"</strong> ({filteredPosts.length} kabar ditemukan)
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="ml-2 px-2 py-0.5 bg-white border border-emerald-300 rounded-lg text-[11px] font-medium text-emerald-800 hover:bg-emerald-100/50"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* LISTVIEW FEED: Rapat antar kartu dengan garis pembatas abu-abu jelas seperti di Facebook */}
          <main className="w-full max-w-2xl mx-auto px-0 pt-0 pb-[90px] space-y-0 sm:border-x sm:border-slate-300/80">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/80 py-10 px-6 text-center my-4 mx-3 shadow-2xs">
                <h3 className="font-semibold text-slate-700 text-sm">Belum Ada Kabar yang Ditemukan</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Saat ini belum ada postingan kabar di daerah ini.
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  onToggleCare={handleToggleCare}
                  onSelectReaction={handleSelectReaction}
                  onAddComment={handleAddComment}
                  onViewOnMap={handleViewOnMap}
                  onDeletePost={handleDeletePost}
                  onOpenReport={handleOpenReport}
                  isReported={reportedPostIds.has(post.id)}
                />
              ))
            )}
          </main>
        </div>
      )}

      {/* 3. TOMBOL KEMBALI KE ATAS (Scroll to Top): Muncul otomatis saat user scroll jauh ke bawah */}
      {showScrollTop && (
        <button
          id="btn-scroll-to-top"
          onClick={scrollToTop}
          className="fixed bottom-6 right-5 z-40 bg-[#1b4d1b] hover:bg-green-900 text-white w-12 h-12 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center animate-in fade-in zoom-in-95 duration-200 border border-white/20 group"
          title="Kembali ke Paling Atas"
          aria-label="Kembali ke atas"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* 4. CREATE VIBE MODAL DIALOG */}
      <CreateVibeModal
        isOpen={isCreateModalOpen}
        currentUser={currentUser}
        onClose={() => setIsCreateModalOpen(false)}
        onAddPost={handleAddPost}
      />

      {/* 5. HALAMAN / MODAL LOGIN GOOGLE */}
      <GoogleLoginPage
        isOpen={isGoogleLoginOpen}
        onClose={() => setIsGoogleLoginOpen(false)}
        onSuccessLogin={handleSuccessGoogleLogin}
      />

      {/* 6. MODAL LAPORKAN POSTINGAN */}
      <ReportModal
        isOpen={Boolean(reportingPost)}
        post={reportingPost}
        currentUser={currentUser}
        onClose={() => setReportingPost(null)}
        onSubmitReport={handleSubmitReport}
      />

      {/* 7. MODAL ADMIN MODERASI */}
      <AdminModerationModal
        isOpen={isAdminModerationOpen}
        onClose={() => setIsAdminModerationOpen(false)}
        reports={reports}
        posts={posts}
        onToggleHidePost={handleToggleHidePost}
        onDeletePost={handleDeletePost}
        onUpdateReportStatus={handleUpdateReportStatus}
      />

      {/* 8. HALAMAN / MODAL PROFIL PENGGUNA LAYAR PENUH (Hanya Akun Pribadi) */}
      <ProfileFullscreenModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedProfileUser(null);
        }}
        profileUser={selectedProfileUser}
        userPosts={
          selectedProfileUser
            ? posts.filter((p) => {
                if (selectedProfileUser.isCurrentUser) {
                  return Boolean(
                    p.isOwn ||
                    (currentUser && p.authorId && p.authorId === currentUser.uid) ||
                    (currentUser && p.author === currentUser.displayName)
                  );
                }
                return p.author === selectedProfileUser.name;
              })
            : []
        }
        currentUser={currentUser}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        onOpenAdminModeration={() => setIsAdminModerationOpen(true)}
        onSelectPost={(post) => {
          setIsProfileModalOpen(false);
          const element = document.getElementById(`post-card-${post.id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
      />
    </div>
  );
}
