import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  CheckCircle,
  EyeOff,
  Eye,
  Trash2,
  AlertOctagon,
  Clock,
  User,
  Filter,
} from 'lucide-react';
import { ReportItem, Post } from '../types';

interface AdminModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ReportItem[];
  posts: Post[];
  onToggleHidePost: (postId: string, hidden: boolean) => Promise<void>;
  onDeletePost: (postId: string) => void;
  onUpdateReportStatus: (reportId: string, status: 'pending' | 'resolved' | 'ignored') => Promise<void>;
}

export const AdminModerationModal: React.FC<AdminModerationModalProps> = ({
  isOpen,
  onClose,
  reports,
  posts,
  onToggleHidePost,
  onDeletePost,
  onUpdateReportStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved' | 'ignored'>('pending');
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const ignoredCount = reports.filter((r) => r.status === 'ignored').length;

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'pending') return r.status === 'pending';
    if (activeTab === 'resolved') return r.status === 'resolved';
    if (activeTab === 'ignored') return r.status === 'ignored';
    return true;
  });

  const handleToggleHide = async (postId: string, currentHidden: boolean) => {
    setActionLoadingId(`hide-${postId}`);
    try {
      await onToggleHidePost(postId, !currentHidden);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: 'pending' | 'resolved' | 'ignored') => {
    setActionLoadingId(`status-${reportId}`);
    try {
      await onUpdateReportStatus(reportId, status);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeletePostConfirm = (postId: string, reportId: string) => {
    onDeletePost(postId);
    setConfirmDeletePostId(null);
    // Otomatis tandai laporan sebagai selesai
    onUpdateReportStatus(reportId, 'resolved');
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id="modal-admin-moderasi"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Admin */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white leading-tight">
                  Panel Moderasi Kareba'Ta
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pengawasan konten berita warga yang aman, terpercaya, dan ramah keluarga
              </p>
            </div>
          </div>
          <button
            id="btn-close-admin-moderation"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            title="Tutup Panel Moderasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tab Status */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <button
              id="tab-moderasi-pending"
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-300/80'
              }`}
            >
              <span>Menunggu ({pendingCount})</span>
            </button>

            <button
              id="tab-moderasi-resolved"
              type="button"
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'resolved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-300/80'
              }`}
            >
              <span>Selesai ({resolvedCount})</span>
            </button>

            <button
              id="tab-moderasi-ignored"
              type="button"
              onClick={() => setActiveTab('ignored')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'ignored'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-300/80'
              }`}
            >
              <span>Diabaikan ({ignoredCount})</span>
            </button>

            <button
              id="tab-moderasi-all"
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-300/80'
              }`}
            >
              <span>Semua ({reports.length})</span>
            </button>
          </div>
        </div>

        {/* List of Reports */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2.5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                Tidak Ada Laporan dalam Kategori Ini
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Komunitas saat ini kondusif. Semua postingan telah diperiksa dan bersih dari pelanggaran.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const post = posts.find((p) => p.id === report.postId);
              const isPostHidden = Boolean(post?.hidden);

              return (
                <div
                  key={report.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all hover:border-slate-300"
                >
                  {/* Top Bar Laporan: Alasan & Status */}
                  <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="font-bold text-slate-900 text-sm">
                        {report.reason}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status === 'pending' && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-300/80 rounded-md text-[11px] font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Menunggu</span>
                        </span>
                      )}
                      {report.status === 'resolved' && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300/80 rounded-md text-[11px] font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Selesai</span>
                        </span>
                      )}
                      {report.status === 'ignored' && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-300 rounded-md text-[11px] font-semibold">
                          Diabaikan
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Body: Pelapor & Deskripsi Tambahan */}
                  <div className="px-4 py-3 space-y-2 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <User className="w-3.5 h-3.5" />
                      <span>Pelapor:</span>
                      <strong className="text-slate-800 font-semibold">
                        {report.reporterName || 'Warga Kareba'}
                      </strong>
                      <span className="text-slate-400 font-mono text-[10px]">
                        ({report.reporterId.substring(0, 10)})
                      </span>
                    </div>

                    {report.description ? (
                      <div className="bg-rose-50/60 border border-rose-200/70 rounded-lg p-2.5 text-slate-800">
                        <span className="font-semibold text-rose-900 block text-[11px] mb-0.5">
                          Keterangan Pelapor:
                        </span>
                        <p className="text-xs leading-relaxed text-slate-700">
                          "{report.description}"
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Post Preview */}
                  <div className="p-4 bg-slate-50/30">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Konten Postingan yang Dilaporkan:
                    </p>

                    {post ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start relative">
                        {isPostHidden && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            <span>Disembunyikan dari Publik</span>
                          </div>
                        )}

                        {post.imageUrl && (
                          <div className="w-full sm:w-28 sm:h-24 h-36 bg-black rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                            {post.mediaType === 'video' ? (
                              <video
                                src={post.imageUrl}
                                controls
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={post.imageUrl}
                                alt="Post media"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {post.author || 'Warga Kareba'}
                            </span>
                            <span className="text-[11px] text-slate-400">• {post.location}</span>
                            <span className="text-[11px] text-slate-400">• {post.createdAt}</span>
                          </div>

                          <p className="text-xs text-slate-800 leading-relaxed line-clamp-3">
                            {post.caption || 'Tanpa teks'}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                            <span>❤️ {post.caresCount} Peduli</span>
                            <span>💬 {post.comments.length} Komentar</span>
                            <span className="font-mono text-[10px] text-slate-400">
                              ID: {post.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          Postingan ini tidak ditemukan atau sudah dihapus dari database.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 py-3 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* 1. Menyembunyikan / Tampilkan Kembali Post */}
                      {post && (
                        <button
                          type="button"
                          disabled={actionLoadingId === `hide-${post.id}`}
                          onClick={() => handleToggleHide(post.id, isPostHidden)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border ${
                            isPostHidden
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                          title={isPostHidden ? 'Tampilkan kembali di feed' : 'Sembunyikan dari feed publik'}
                        >
                          {isPostHidden ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Tampilkan Kembali</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Sembunyikan Post</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* 2. Menghapus Post */}
                      {post && (
                        confirmDeletePostId === post.id ? (
                          <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 px-2 py-1 rounded-lg">
                            <span className="text-[11px] text-rose-800 font-medium">Hapus permanen?</span>
                            <button
                              type="button"
                              onClick={() => handleDeletePostConfirm(post.id, report.id)}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold"
                            >
                              Ya, Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePostId(null)}
                              className="px-2 py-0.5 bg-white text-slate-700 border border-slate-300 rounded text-[11px]"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePostId(post.id)}
                            className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                            title="Hapus postingan dari server"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Post</span>
                          </button>
                        )
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* 3. Mengabaikan Laporan */}
                      {report.status !== 'ignored' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === `status-${report.id}`}
                          onClick={() => handleUpdateStatus(report.id, 'ignored')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                          title="Abaikan laporan jika tidak melanggar aturan"
                        >
                          Abaikan Laporan
                        </button>
                      )}

                      {/* 4. Mengubah Status Menjadi Selesai */}
                      {report.status !== 'resolved' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === `status-${report.id}`}
                          onClick={() => handleUpdateStatus(report.id, 'resolved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                          title="Tandai laporan ini sudah ditangani dan selesai"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Tandai Selesai</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
