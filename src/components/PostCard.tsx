import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../types';
import { Heart, MapPin, Video, Share2, Maximize2, X, Flag, Check, BookOpen } from 'lucide-react';
import { MediaFullscreenModal } from './MediaFullscreenModal';

export const REACTION_EMOJIS = ['❤️', '🥲', '😱', '😡', '😌'] as const;

export const REACTION_CONFIG: Record<
  string,
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  '❤️': {
    label: 'Suka',
    textClass: 'text-rose-600',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200/90',
  },
  '😄': {
    label: 'Tertawa',
    textClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200/90',
  },
  '🥲': {
    label: 'Sedih',
    textClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200/90',
  },
  '😱': {
    label: 'Kaget',
    textClass: 'text-yellow-600',
    bgClass: 'bg-yellow-100/70',
    borderClass: 'border-yellow-300/90',
  },
  '😡': {
    label: 'Marah',
    textClass: 'text-red-600',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200/90',
  },
  '😌': {
    label: 'Tenang',
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200/90',
  },
};

interface PostCardProps {
  post: Post;
  currentUserId?: string | null;
  onToggleCare: (postId: string) => void;
  onSelectReaction?: (postId: string, emoji: string) => void;
  onAddComment?: (postId: string, text: string) => void;
  onViewOnMap?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onOpenReport?: (post: Post) => void;
  isReported?: boolean;
  onOpenUserProfile?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onToggleCare,
  onSelectReaction,
  onViewOnMap,
  onDeletePost,
  onOpenReport,
  isReported: propIsReported,
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isReported, setIsReported] = useState(Boolean(propIsReported));

  useEffect(() => {
    if (propIsReported !== undefined) {
      setIsReported(propIsReported);
    }
  }, [propIsReported]);

  // ID pemilik postingan dan perbandingan dengan pengguna saat ini
  const postOwnerId = post.authorId || (post.isOwn ? currentUserId : undefined);
  const isPostOwner = Boolean(
    (currentUserId && postOwnerId && currentUserId === postOwnerId) ||
    post.isOwn
  );
  const [showReactions, setShowReactions] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isExpandedCaption, setIsExpandedCaption] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  // Fitur baca teks berita: membuka seluruh deskripsi panjang
  const handleToggleRead = () => {
    setIsExpandedCaption((prev) => !prev);
  };

  const reactionContainerRef = useRef<HTMLDivElement>(null);
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const captionContainerRef = useRef<HTMLDivElement>(null);

  const isVideo =
    post.mediaType === 'video' ||
    post.imageUrl?.startsWith('data:video') ||
    /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(post.imageUrl || '');

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${post.caption ? post.caption + ' ' : ''}📍 ${post.location} - Kabar Agakareba`;

  const handleShareWA = () => {
    const waText = encodeURIComponent(`${shareText}\n${shareUrl}`);
    const waUrl = `https://api.whatsapp.com/send?text=${waText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const handleShareFB = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  // Tutup reaksi & share menu jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        reactionContainerRef.current &&
        !reactionContainerRef.current.contains(e.target as Node)
      ) {
        setShowReactions(false);
      }
      if (
        shareContainerRef.current &&
        !shareContainerRef.current.contains(e.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleLoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReactions((prev) => !prev);
  };

  const handlePickReaction = (emoji: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReactions(false);
    if (onSelectReaction) {
      onSelectReaction(post.id, emoji);
    } else {
      onToggleCare(post.id);
    }
  };

  const cardBorder = 'border-b-[6px] sm:border-b-[8px] border-slate-300 rounded-none';
  const cardBg = `bg-white ${cardBorder} text-slate-900`;
  const headerBorder = 'border-slate-100';
  const textPrimary = 'text-slate-900';

  return (
    <>
      <article
        id={`post-card-${post.id}`}
        className={`${cardBg} overflow-visible relative transition-all`}
      >
        {/* 1. HEADER ROW:
            - Foto Profil & Nama: Non-clickable (Privasi: Tidak boleh membuka profil pengguna lain)
            - Lokasi & Waktu publikasi
            - Tombol Hapus (jika postingan sendiri) / Laporkan (jika pengguna lain)
        */}
        <div className={`px-4 py-3 flex items-center justify-between gap-2 border-b ${headerBorder}`}>
          <div className="flex items-center gap-3 min-w-0 select-none">
            {/* Foto Profil: 36px, Bentuk bulat, Border putih tipis, Non-clickable */}
            <div className="relative shrink-0">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.author || 'Author'}
                  className="w-[36px] h-[36px] rounded-full object-cover border border-white shadow-2xs ring-1 ring-slate-200/60 pointer-events-none"
                />
              ) : (
                <div className="w-[36px] h-[36px] rounded-full bg-emerald-50 border border-white flex items-center justify-center text-base shadow-2xs ring-1 ring-slate-200/60">
                  <MapPin className="w-4 h-4 text-[#1b4d1b]" />
                </div>
              )}
            </div>

            {/* Nama Pengguna (16px Bold), Lokasi (12px), Waktu Publikasi (12px) */}
            <div className="flex flex-col min-w-0 justify-center">
              <div className="flex items-center gap-1.5 truncate">
                <span className={`font-bold ${textPrimary} text-[16px] leading-snug tracking-tight truncate`}>
                  {post.author || 'Warga Kareba'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-slate-500 leading-tight mt-0.5 truncate">
                <span className="truncate">{post.location}</span>
                <span>•</span>
                <span className="shrink-0">{post.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Header Action:
              ATURAN TOMBOL LAPORKAN & HAPUS:
              - Postingan Sendiri: Tombol Laporkan disembunyikan. Tampilkan opsi konfirmasi hapus.
              - Postingan Orang Lain: Tampilkan tombol Laporkan.
          */}
          <div className="relative shrink-0 flex items-center gap-1.5">
            {isPostOwner ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-1.5 text-xs bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg animate-in fade-in duration-150">
                  <span className="text-[11px] text-rose-700 font-medium">Hapus?</span>
                  <button
                    type="button"
                    onClick={() => onDeletePost?.(post.id)}
                    className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    Ya
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-0.5 bg-white text-slate-700 border border-slate-300 rounded text-[11px] font-medium hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  id={`btn-delete-post-${post.id}`}
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  title="Hapus Postingan Saya"
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )
            ) : (
              isReported ? (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300/80 flex items-center gap-1.5 shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                  <span>Laporan Terkirim</span>
                </span>
              ) : (
                <button
                  id={`btn-report-post-${post.id}`}
                  type="button"
                  onClick={() => {
                    if (onOpenReport) {
                      onOpenReport(post);
                    } else {
                      setIsReported(true);
                    }
                  }}
                  title="Laporkan Postingan Ini"
                  className="text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
                  <span>Laporkan</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* 2. MEDIA CONTAINER: 100% Media Seutuhnya Seperti Media Sosial Asli (Facebook / Instagram)
            - Bersih tanpa latar abu-abu berkedip (bg-white menyatu mulus dengan kartu)
            - Langsung tampil instan tanpa animasi kedip / fade-in
            - Klik => Fullscreen Modal Rasio Penuh */}
        <div
          onClick={() => setIsFullscreenOpen(true)}
          className="w-full bg-white relative flex items-center justify-center cursor-pointer group select-none overflow-hidden"
          title="Klik untuk melihat layar penuh"
        >
          {!mediaError ? (
            isVideo ? (
              <video
                src={`${post.imageUrl}#t=0.001`}
                playsInline
                muted
                preload="metadata"
                onError={() => setMediaError(true)}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-auto max-h-[640px] sm:max-h-[720px] object-contain block mx-auto select-none pointer-events-none"
              />
            ) : (
              <img
                src={post.imageUrl}
                alt={post.caption}
                decoding="auto"
                onError={() => setMediaError(true)}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="w-full h-auto max-h-[640px] sm:max-h-[720px] object-contain block mx-auto select-none pointer-events-none"
              />
            )
          ) : (
            <div className="w-full py-16 flex flex-col items-center justify-center bg-white text-slate-400 p-4 text-center">
              <span className="text-4xl mb-1">{post.mood}</span>
              <p className="text-xs text-slate-600 font-medium">
                {isVideo ? 'Video' : 'Foto'} situasi di {post.location}
              </p>
            </div>
          )}

          {/* Video Badge */}
          {isVideo && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
              <span className="bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Video className="w-3.5 h-3.5 text-lime-400" />
                <span>Video</span>
              </span>
            </div>
          )}

          {/* Fullscreen Expand Hint on Hover */}
          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white p-1.5 rounded-full opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-sm">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>

        {/* 3. TOMBOL AKSI:
            - ❤️ Love
            - 🔄 Share
        */}
        <div className="px-4 py-2 flex items-center gap-2 text-slate-700">
          {/* Tombol ❤️ Love */}
          <div ref={reactionContainerRef} className="relative">
            {/* Popover Emoji Reaksi */}
            {showReactions && (
              <div className="absolute left-0 bottom-full mb-2 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-full shadow-xl border border-slate-200 flex items-center gap-1.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                {REACTION_EMOJIS.map((emoji) => {
                  const isSelected = post.userReaction === emoji;
                  const config = REACTION_CONFIG[emoji];
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={(e) => handlePickReaction(emoji, e)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-xl leading-none hover:scale-125 active:scale-110 transition-transform ${
                        isSelected ? 'bg-slate-100 ring-2 ring-slate-400 scale-110' : 'hover:bg-slate-100'
                      }`}
                      title={config?.label || emoji}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            )}

            {(() => {
              const activeReaction = post.userReaction || '❤️';
              const style = REACTION_CONFIG[activeReaction] || REACTION_CONFIG['❤️'];
              const isReacted = post.isCared;

              return (
                <button
                  id={`btn-care-${post.id}`}
                  type="button"
                  onClick={handleLoveClick}
                  title="Tekan untuk Suka atau memilih reaksi"
                  className={`h-[34px] px-3 rounded-full transition-all select-none flex items-center gap-1.5 active:scale-95 border cursor-pointer ${
                    isReacted
                      ? `${style.bgClass} ${style.textClass} ${style.borderClass} font-semibold shadow-2xs`
                      : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {isReacted && activeReaction !== '❤️' ? (
                    <span className="text-[17px] leading-none drop-shadow-2xs">
                      {activeReaction}
                    </span>
                  ) : (
                    <Heart
                      className={`w-[17px] h-[17px] transition-transform ${
                        isReacted
                          ? 'fill-rose-600 text-rose-600'
                          : 'text-slate-600'
                      }`}
                    />
                  )}
                  <span
                    className={`text-[12px] font-semibold ${
                      isReacted ? style.textClass : 'text-slate-700'
                    }`}
                  >
                    {isReacted && activeReaction !== '❤️'
                      ? style.label
                      : 'Suka'}
                  </span>
                </button>
              );
            })()}
          </div>

          {/* Tombol Ikon Baca (Ikon Buku: ketika diklik semua deskripsi panjang muncul) */}
          <button
            id={`btn-read-post-${post.id}`}
            type="button"
            onClick={handleToggleRead}
            title={isExpandedCaption ? 'Ciutkan deskripsi' : 'Buka semua deskripsi panjang'}
            className={`h-[34px] px-3 rounded-full border transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer select-none ${
              isExpandedCaption
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <BookOpen
              className={`w-[16px] h-[16px] shrink-0 transition-transform ${
                isExpandedCaption ? 'text-blue-600 scale-105' : 'text-slate-600'
              }`}
            />
            <span className="text-[12px] font-semibold">
              {isExpandedCaption ? 'Tutup' : 'Baca'}
            </span>
          </button>

          {/* Tombol 🔄 Bagikan (Share) */}
          <div ref={shareContainerRef} className="relative">
            <button
              id={`btn-share-${post.id}`}
              type="button"
              onClick={() => setShowShareMenu((prev) => !prev)}
              title="Bagikan kabar ke WhatsApp atau Facebook"
              className={`h-[34px] px-3 rounded-full border transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                showShareMenu
                  ? 'border-slate-300 bg-slate-100 text-slate-900 font-semibold'
                  : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Share2 className="w-[16px] h-[16px] text-slate-600" />
              <span className="text-[12px] font-semibold text-slate-700">Bagikan</span>
            </button>

            {/* Dropdown Menu Share */}
            {showShareMenu && (
              <div className="absolute left-0 sm:left-auto sm:right-0 bottom-full mb-2 bg-white border border-slate-200 text-slate-800 rounded-2xl shadow-xl py-2 w-48 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Bagikan Kabar
                </div>
                <button
                  onClick={handleShareWA}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50 text-slate-800 flex items-center gap-2.5 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                      </svg>
                    </span>
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handleShareFB}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50 text-slate-800 flex items-center gap-2.5 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </span>
                    <span>Facebook</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        {/* 4. DESKRIPSI BERITA */}
        <div
          ref={captionContainerRef}
          id={`post-caption-box-${post.id}`}
          className="px-4 pt-1 pb-4 scroll-mt-20"
        >
          {post.caption && (
            <p
              className={`text-[19px] sm:text-[20px] font-bold text-slate-900 leading-[1.35] break-words transition-all select-text ${
                isExpandedCaption ? 'whitespace-pre-line' : 'line-clamp-2 sm:line-clamp-3'
              }`}
            >
              {post.caption}
            </p>
          )}
        </div>
      </article>

      {/* Fullscreen Lightbox Modal */}
      <MediaFullscreenModal
        post={post}
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
      />
    </>
  );
};
