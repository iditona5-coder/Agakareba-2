import React, { useState, useEffect } from 'react';
import { ReportItem, Post, UserProfile } from '../types';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  LogOut,
  Sliders,
  Check,
  AlertTriangle
} from 'lucide-react';
import { KarebaTaLogo } from './KarebaTaLogo';
import { getAdminPinFromFirebase, updateAdminPinInFirebase } from '../services/firebase';

interface AdminDashboardPageProps {
  reports: ReportItem[];
  posts: Post[];
  currentUser?: UserProfile | null;
  onToggleHidePost: (postId: string, hidden: boolean) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
  onUpdateReportStatus: (reportId: string, status: 'pending' | 'resolved' | 'ignored') => Promise<void>;
  onBackToApp: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  reports,
  posts,
  currentUser,
  onToggleHidePost,
  onDeletePost,
  onUpdateReportStatus,
  onBackToApp,
}) => {
  // Status Autentikasi PIN
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('karebata_admin_auth') === 'true';
  });
  const [inputPin, setInputPin] = useState('');
  const [currentSavedPin, setCurrentSavedPin] = useState('123456');
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Status Pengaturan Ganti PIN
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changePinError, setChangePinError] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState(false);
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);

  // Filter Status Laporan
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'ignored'>('pending');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Muat PIN dari Firebase saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchPin = async () => {
      const pin = await getAdminPinFromFirebase();
      setCurrentSavedPin(pin);
    };
    fetchPin();
  }, []);

  // Tangani Verifikasi Masuk dengan PIN
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setIsVerifying(true);

    try {
      const livePin = await getAdminPinFromFirebase();
      setCurrentSavedPin(livePin);

      if (inputPin.trim() === livePin.trim()) {
        setIsAuthenticated(true);
        sessionStorage.setItem('karebata_admin_auth', 'true');
        setInputPin('');
      } else {
        setPinError('Kunci PIN salah! Silakan periksa kembali sandi Anda.');
      }
    } catch {
      setPinError('Gagal memverifikasi PIN. Silakan coba sesaat lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Tangani Keluar / Kunci Dasbor
  const handleLogoutAdmin = () => {
    sessionStorage.removeItem('karebata_admin_auth');
    setIsAuthenticated(false);
    setInputPin('');
  };

  // Tangani Ganti PIN Baru
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError('');
    setChangePinSuccess(false);

    if (oldPinInput.trim() !== currentSavedPin.trim()) {
      setChangePinError('PIN lama Anda tidak sesuai.');
      return;
    }

    if (newPinInput.length < 4) {
      setChangePinError('PIN baru minimal harus 4 karakter (angka/huruf).');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setChangePinError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    setIsUpdatingPin(true);
    try {
      const ok = await updateAdminPinInFirebase(newPinInput.trim());
      if (ok) {
        setCurrentSavedPin(newPinInput.trim());
        setChangePinSuccess(true);
        setOldPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
        setTimeout(() => {
          setShowChangePinModal(false);
          setChangePinSuccess(false);
        }, 1500);
      } else {
        setChangePinError('Gagal menyimpan PIN baru ke server.');
      }
    } catch {
      setChangePinError('Terjadi kesalahan saat memperbarui PIN.');
    } finally {
      setIsUpdatingPin(false);
    }
  };

  // Laporan yang difilter
  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const ignoredCount = reports.filter((r) => r.status === 'ignored').length;

  // LAYAR KUNCI PIN KEAMANAN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-rose-600/20 border border-rose-500/30 rounded-2xl flex items-center justify-center mb-3">
              <Lock className="w-7 h-7 text-rose-500" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dasbor Moderasi Admin
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kareba'Ta Makassar • Area Terbatas
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Masukkan Kunci PIN Keamanan
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="Ketik PIN Admin..."
                  autoFocus
                  required
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-white placeholder-slate-500 text-center tracking-widest text-lg font-mono rounded-xl py-3 px-4 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                PIN bawaan awal: <span className="font-mono text-rose-400 font-semibold">123456</span>
              </p>
            </div>

            {pinError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !inputPin.trim()}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memeriksa PIN...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Buka Dasbor Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700/60 flex justify-center">
            <button
              type="button"
              onClick={onBackToApp}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda Aplikasi</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN UTAMA DASBOR ADMIN
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HEADER NAVIGASI DASBOR */}
      <header className="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KarebaTaLogo size="sm" />
          <div className="hidden sm:block border-l border-slate-700/80 pl-3">
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Dasbor Moderasi Admin</span>
            </h1>
            <p className="text-[11px] text-slate-400">Pengawasan Laporan Konten Pengguna</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Ganti PIN */}
          <button
            type="button"
            onClick={() => setShowChangePinModal(true)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            title="Ubah Kunci PIN Keamanan"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Ganti PIN</span>
          </button>

          {/* Tombol Lihat Beranda */}
          <button
            type="button"
            onClick={onBackToApp}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            title="Buka Beranda Kareba'Ta"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Lihat Beranda</span>
          </button>

          {/* Tombol Kunci / Keluar */}
          <button
            type="button"
            onClick={handleLogoutAdmin}
            className="text-xs bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            title="Kunci Dasbor & Keluar"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kunci</span>
          </button>
        </div>
      </header>

      {/* ISI KONTEN DASBOR */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* STATISTIK RINGKASAN */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Perlu Ditinjau</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="text-xs font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Laporan Baru
                </span>
              )}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Selesai Ditindak</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">{resolvedCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diabaikan</span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-400 mt-1">{ignoredCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Laporan</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{reports.length}</div>
          </div>
        </div>

        {/* TAB FILTER STATUS LAPORAN */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>Menunggu Tindakan</span>
              <span className="bg-slate-950/20 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('resolved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Selesai ({resolvedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ignored')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'ignored'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Diabaikan ({ignoredCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Semua ({reports.length})
            </button>
          </div>
        </div>

        {/* DAFTAR LAPORAN */}
        {filteredReports.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500/60 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Tidak ada laporan pada kategori ini</h3>
            <p className="text-xs text-slate-400 mt-1">Semua konten pengguna berjalan aman dan kondusif.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReports.map((rep) => {
              const targetPost = posts.find((p) => p.id === rep.postId);
              const isLoading = actionLoadingId === rep.id;

              return (
                <div
                  key={rep.id}
                  className="bg-slate-900 border border-slate-800/90 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-lg"
                >
                  {/* DETAIL LAPORAN PELAPOR */}
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-2.5 py-1 rounded-md font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{rep.reason}</span>
                      </div>

                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          rep.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : rep.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {rep.status === 'pending'
                          ? 'Perlu Tindakan'
                          : rep.status === 'resolved'
                          ? 'Sudah Selesai'
                          : 'Diabaikan'}
                      </span>
                    </div>

                    {rep.description && (
                      <div className="text-xs bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg text-slate-300 italic">
                        "{rep.description}"
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Pelapor: <strong className="text-slate-200">{rep.reporterName}</strong></span>
                      <span>{new Date(rep.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* KONTEN POSTINGAN ASLI */}
                  <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Penulis: <strong className="text-white">{targetPost?.author || 'Pengguna'}</strong></span>
                      <span>Lokasi: {targetPost?.location || '-'}</span>
                    </div>

                    {targetPost ? (
                      <>
                        <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">
                          {targetPost.caption}
                        </p>
                        {targetPost.imageUrl && (
                          <div className="mt-2 h-32 w-full rounded-md overflow-hidden bg-black/40 border border-slate-800">
                            {targetPost.mediaType === 'video' ? (
                              <video src={targetPost.imageUrl} className="w-full h-full object-cover" controls />
                            ) : (
                              <img src={targetPost.imageUrl} alt="Bukti Postingan" className="w-full h-full object-cover" />
                            )}
                          </div>
                        )}
                        {targetPost.hidden && (
                          <div className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded inline-block border border-rose-500/20">
                            Status Postingan: Disembunyikan dari Publik
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Postingan ini mungkin telah dihapus oleh pengunggah atau administrator.
                      </p>
                    )}
                  </div>

                  {/* TOMBOL TINDAKAN MODERASI */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {targetPost && (
                        <>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={async () => {
                              setActionLoadingId(rep.id);
                              await onToggleHidePost(rep.postId, !targetPost.hidden);
                              setActionLoadingId(null);
                            }}
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                              targetPost.hidden
                                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                                : 'bg-amber-950/30 text-amber-300 border-amber-800/40 hover:bg-amber-900/40'
                            }`}
                          >
                            {targetPost.hidden ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Tampilkan</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Sembunyikan</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={async () => {
                              if (confirm('Yakin ingin menghapus permanen postingan ini?')) {
                                setActionLoadingId(rep.id);
                                await onDeletePost(rep.postId);
                                await onUpdateReportStatus(rep.id, 'resolved');
                                setActionLoadingId(null);
                              }
                            }}
                            className="text-xs px-2.5 py-1.5 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Konten</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {rep.status !== 'ignored' && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={async () => {
                            setActionLoadingId(rep.id);
                            await onUpdateReportStatus(rep.id, 'ignored');
                            setActionLoadingId(null);
                          }}
                          className="text-xs px-2.5 py-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
                        >
                          Abaikan
                        </button>
                      )}

                      {rep.status !== 'resolved' && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={async () => {
                            setActionLoadingId(rep.id);
                            await onUpdateReportStatus(rep.id, 'resolved');
                            setActionLoadingId(null);
                          }}
                          className="text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-900/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Tandai Selesai</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL GANTI PIN ADMIN */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Ganti Kunci PIN Admin</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePinModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Masukkan PIN Lama
                </label>
                <input
                  type="password"
                  value={oldPinInput}
                  onChange={(e) => setOldPinInput(e.target.value)}
                  placeholder="Ketik PIN lama..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Masukkan PIN Baru (Minimal 4 Karakter)
                </label>
                <input
                  type="password"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Ketik PIN baru..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ulangi Konfirmasi PIN Baru
                </label>
                <input
                  type="password"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="Ulangi PIN baru..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                />
              </div>

              {changePinError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">
                  {changePinError}
                </div>
              )}

              {changePinSuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Kunci PIN berhasil diperbarui ke database!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowChangePinModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPin}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPin ? 'Menyimpan...' : 'Simpan PIN Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
