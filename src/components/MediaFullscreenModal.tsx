import React, { useEffect, useRef, useState } from 'react';
import { Post } from '../types';
import {
  X,
  MapPin,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface MediaFullscreenModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onOpenUserProfile?: (post: Post) => void;
}

export const MediaFullscreenModal: React.FC<MediaFullscreenModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayVideo();
      }
      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isVideo =
    post.mediaType === 'video' ||
    post.imageUrl?.startsWith('data:video') ||
    /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(post.imageUrl || '');

  const authorName = post.author || 'Warga';
  const authorAvatar =
    post.authorAvatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';

  const togglePlayVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const vid = e.currentTarget;
    setDuration(vid.duration || 0);
    setIsMuted(vid.muted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div
      ref={containerRef}
      id="fullscreen-media-modal"
      className="fixed inset-0 z-50 bg-black w-screen h-[100dvh] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200"
    >
      {/* 1. MEDIA CONTAINER FULLSCREEN:
          Menampilkan media sesuai rasio asli (fit contain) pada layar penuh tanpa terpotong / gepeng */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black overflow-hidden">
        {!mediaError ? (
          isVideo ? (
            <video
              ref={videoRef}
              src={post.imageUrl}
              autoPlay
              playsInline
              loop
              muted={isMuted}
              onClick={togglePlayVideo}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setMediaError(true)}
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full max-w-full max-h-[100dvh] object-contain bg-black transition-all select-none cursor-pointer"
            />
          ) : (
            <img
              src={post.imageUrl}
              alt={authorName}
              onError={() => setMediaError(true)}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-full max-w-full max-h-[100dvh] object-contain bg-black transition-all select-none pointer-events-none"
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 text-white/80 max-w-sm">
            <span className="text-4xl mb-2">📷</span>
            <p className="text-sm font-semibold">Media tidak dapat dimuat</p>
            <p className="text-xs text-white/50 mt-1">Sumber media tidak tersedia atau format tidak didukung.</p>
          </div>
        )}

        {/* Center Play/Pause Indicator for Video */}
        {isVideo && !isPlaying && (
          <div
            onClick={togglePlayVideo}
            className="absolute z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="Putar Video"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white translate-x-0.5" />
          </div>
        )}
      </div>

      {/* 2. OVERLAY ATAS: Header Pengguna (Non-clickable / Privasi) & Tombol Tutup X */}
      <div className="relative z-20 w-full p-3.5 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
        {/* Kiri: Foto Profil + Nama Pengguna + Lokasi & Waktu (Non-clickable demi privasi warga) */}
        <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto min-w-0 pr-2 select-none">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/80 shadow-md shrink-0 bg-slate-800">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-full h-full object-cover pointer-events-none"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex flex-col text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate">
            <span className="font-bold text-xs sm:text-sm tracking-tight text-white truncate">
              {authorName}
            </span>

            <div className="flex items-center gap-1.5 text-[11px] text-white/90 font-medium mt-0.5">
              <span>{post.createdAt}</span>
              <span className="text-white/60">·</span>
              <div className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-lime-400 shrink-0" />
                <span className="truncate">{post.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kanan: Tombol Tutup X */}
        <div className="flex items-center pointer-events-auto shrink-0">
          <button
            id="close-fullscreen-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Tutup (Esc)"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3. OVERLAY BAWAH (UNTUK VIDEO: SLIDER WAKTU & KONTROL AUDIO) */}
      {isVideo && (
        <div className="relative z-20 w-full px-3.5 py-3 sm:px-6 sm:py-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2.5 pointer-events-none">
          <div
            className="pointer-events-auto max-w-2xl mx-auto w-full flex flex-col gap-1.5 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bar Slider Durasi */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full">
              <span className="text-[11px] sm:text-xs text-white/90 font-mono min-w-[30px] text-right drop-shadow-md">
                {formatTime(currentTime)}
              </span>
              <div className="relative flex-1 flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-lime-400 focus:outline-none group-hover:h-2 transition-all"
                />
              </div>
              <span className="text-[11px] sm:text-xs text-white/75 font-mono min-w-[30px] drop-shadow-md">
                {formatTime(duration)}
              </span>
            </div>

            {/* Tombol Play/Pause & Lospeker */}
            <div className="flex items-center justify-between pt-0.5">
              <button
                type="button"
                onClick={togglePlayVideo}
                title={isPlaying ? 'Jeda Video (Spasi)' : 'Putar Video (Spasi)'}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all text-xs font-semibold active:scale-95 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-white fill-white" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-white fill-white" />
                    <span>Putar</span>
                  </>
                )}
              </button>

              <button
                id="fullscreen-speaker-btn"
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Nyalakan Suara (M)' : 'Matikan Suara (M)'}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all text-xs font-semibold active:scale-95 cursor-pointer"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-300">Bisu</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-lime-400" />
                    <span className="text-lime-300">Suara</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
