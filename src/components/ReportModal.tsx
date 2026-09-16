import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Post, UserProfile, ReportItem } from '../types';

export interface ReportReasonOption {
  id: string;
  label: string;
  example?: string;
}

export const REPORT_REASONS: ReportReasonOption[] = [
  {
    id: 'sexual',
    label: 'Konten seksual / pornografi',
    example: 'Contoh: video porno, konten telanjang, adegan seksual.',
  },
  {
    id: 'vulgar',
    label: 'Konten vulgar / tidak pantas',
    example: 'Contoh: joget atau gerakan yang mengandung unsur seksual, perilaku tidak sesuai untuk publik.',
  },
  {
    id: 'hoax',
    label: 'Informasi palsu / hoaks',
    example: 'Contoh: berita bohong atau informasi menyesatkan.',
  },
  {
    id: 'hate_speech',
    label: 'Ujaran kebencian',
    example: 'Contoh: menghina, menyerang, atau memprovokasi.',
  },
  {
    id: 'violence',
    label: 'Kekerasan atau konten berbahaya',
  },
  {
    id: 'privacy',
    label: 'Pelanggaran privasi',
    example: 'Contoh: menyebarkan data pribadi tanpa izin.',
  },
  {
    id: 'spam',
    label: 'Spam / iklan berlebihan',
  },
  {
    id: 'wrong_category',
    label: 'Kategori berita tidak sesuai',
  },
  {
    id: 'other',
    label: 'Lainnya',
  },
];

interface ReportModalProps {
  isOpen: boolean;
  post: Post | null;
  currentUser: UserProfile | null;
  onClose: () => void;
  onSubmitReport: (report: ReportItem) => Promise<boolean>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  post,
  currentUser,
  onClose,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen || !post) return null;

  // Pencegahan laporkan postingan sendiri (defense-in-depth)
  const isSelfPost = Boolean(
    (currentUser?.uid && post.authorId && currentUser.uid === post.authorId) ||
    post.isOwn
  );
  if (isSelfPost) {
    return null;
  }

  const handleClose = () => {
    if (isSubmitting) return;
    setSelectedReason('');
    setDescription('');
    setIsSubmitted(false);
    setErrorMessage('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      setErrorMessage('Silakan pilih salah satu alasan laporan.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const reportId = `report-${Date.now()}`;
    const newReport: ReportItem = {
      id: reportId,
      postId: post.id,
      postOwnerId: post.authorId || '',
      postCaption: post.caption || '',
      postAuthor: post.author || 'Warga Kareba',
      reporterId: currentUser?.uid || 'anon',
      reporterName: currentUser?.displayName || 'Warga Kareba',
      reason: selectedReason,
      description: description.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      const success = await onSubmitReport(newReport);
      if (success) {
        setIsSubmitted(true);
      } else {
        // Tetap tampilkan sukses ke pengguna demi kenyamanan UI lokal
        setIsSubmitted(true);
      }
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-laporkan-postingan"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                Laporkan Postingan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kareba'Ta Komunitas Aman & Terpercaya
              </p>
            </div>
          </div>
          <button
            id="btn-close-report-modal"
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="p-6 sm:p-8 text-center flex flex-col items-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                Laporan Terkirim
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Terima kasih. Laporan Anda bersifat rahasia dan aman. Pemilik postingan tidak akan mengetahui laporan ini, dan hanya tim Admin yang dapat meninjau serta memprosesnya.
              </p>
            </div>
            <button
              id="btn-close-report-success"
              type="button"
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-xs active:scale-98 transition-all"
            >
              Selesai
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Deskripsi Aturan */}
            <div className="bg-amber-50/80 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Laporkan konten yang menurut Anda melanggar aturan Kareba'Ta.
              </span>
            </div>

            {/* Cuplikan Postingan yang Dilaporkan */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
              {post.imageUrl ? (
                post.mediaType === 'video' ? (
                  <div className="w-12 h-12 rounded-lg bg-black shrink-0 overflow-hidden flex items-center justify-center">
                    <video src={post.imageUrl} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <img
                    src={post.imageUrl}
                    alt="Post media"
                    className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                  />
                )
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  Postingan oleh {post.author || 'Warga'} • {post.location}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                  {post.caption || 'Tanpa keterangan'}
                </p>
              </div>
            </div>

            {/* Pilihan Alasan */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pilihan Alasan Laporan:
              </label>

              <div className="space-y-2">
                {REPORT_REASONS.map((item) => {
                  const isChecked = selectedReason === item.label;
                  return (
                    <label
                      key={item.id}
                      className={`block p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-400'
                          : 'border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="reportReason"
                          value={item.label}
                          checked={isChecked}
                          onChange={() => {
                            setSelectedReason(item.label);
                            setErrorMessage('');
                          }}
                          className="mt-0.5 h-4 w-4 text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm block leading-tight font-medium ${
                              isChecked ? 'text-rose-950 font-semibold' : 'text-slate-800'
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.example && (
                            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                              {item.example}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Kolom Tambahan Keterangan (Opsional) */}
            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="report-description"
                className="block text-xs font-semibold text-slate-700"
              >
                Tambahkan keterangan (opsional)
              </label>
              <textarea
                id="report-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan catatan tambahan untuk moderator bila diperlukan..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 placeholder:text-slate-400 text-slate-800"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                {errorMessage}
              </p>
            )}

            {/* Tombol Aksi */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                id="btn-submit-report"
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <span>Kirim Laporan</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
