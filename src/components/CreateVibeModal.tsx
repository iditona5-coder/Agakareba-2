import React, { useState, useRef } from 'react';
import { MOODS, PRESET_LOCATIONS } from '../data/moods';
import { Post, UserProfile } from '../types';
import { X, Camera, Upload, Video, Image as ImageIcon, MapPin, Sparkles, AlertCircle, Check, Loader2, CloudUpload, Code2, User } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';
import { uploadToImageKit } from '../utils/imagekitUpload';

interface CreateVibeModalProps {
  isOpen: boolean;
  currentUser?: UserProfile | null;
  onClose: () => void;
  onAddPost: (post: Omit<Post, 'id' | 'createdAt' | 'caresCount' | 'isCared' | 'comments'>) => void;
}

const SAMPLE_MEDIA_PRESETS = [
  {
    title: 'Jalan Rusak / Aspal',
    type: 'image' as const,
    emoji: '😡',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    location: 'Palu Timur',
    caption: 'Kondisi aspal berlubang parah di perempatan lampu merah, mohon hati-hati melintas.'
  },
  {
    title: 'Video Situasi Ombak',
    type: 'video' as const,
    emoji: '⚠️',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    location: 'Pantai Talise',
    caption: '🎥 Rekaman video kondisi ombak dan angin kencang di pesisir sore ini.'
  },
  {
    title: 'Banjir / Genangan',
    type: 'image' as const,
    emoji: '😢',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
    location: 'Palu Barat',
    caption: 'Genangan air pasca hujan deras 2 jam, motor matic jangan lewat sini dulu.'
  },
  {
    title: 'Sunset Pantai Talise',
    type: 'image' as const,
    emoji: '☕',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    location: 'Pantai Talise',
    caption: 'Vibe sore yang tenang di tepian Teluk Palu. Senja selalu punya cerita!'
  },
  {
    title: 'Kopi & Nongkrong',
    type: 'image' as const,
    emoji: '☕',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    location: 'Mantikulore (Tondo)',
    caption: 'Spot ngopi santai sambil menikmati udara sejuk perbukitan.'
  },
  {
    title: 'Kuliner Khas / Kaledo',
    type: 'image' as const,
    emoji: '🍜',
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    location: 'Palu Selatan',
    caption: 'Makan siang berfaedah dengan sajian kaledo hangat segar!'
  }
];

export const CreateVibeModal: React.FC<CreateVibeModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onAddPost
}) => {
  const [selectedMood, setSelectedMood] = useState<string>('😡');
  const [location, setLocation] = useState<string>('Palu Timur');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [isCustomLoc, setIsCustomLoc] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>('');
  const [mediaUrl, setMediaUrl] = useState<string>(SAMPLE_MEDIA_PRESETS[0].url);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [photoMode, setPhotoMode] = useState<'preset' | 'upload' | 'url'>('upload');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');
  const [isImageKitUploaded, setIsImageKitUploaded] = useState<boolean>(false);
  const [imageKitFileId, setImageKitFileId] = useState<string | undefined>(undefined);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, forcedType?: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = forcedType === 'video' || file.type.startsWith('video/');
    const maxSize = isVid ? 40 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg(`Ukuran ${isVid ? 'video' : 'foto'} maksimal ${isVid ? '40MB' : '15MB'}`);
      return;
    }

    setIsUploading(true);
    setUploadStatusText(`Mengunggah ${isVid ? 'video' : 'foto'} ke ImageKit...`);
    setIsImageKitUploaded(false);
    setErrorMsg('');

    try {
      let uploadPayload: string | File = file;

      if (!isVid) {
        // Compress photo before uploading for swift network transmission
        const compressed = await compressImageFile(file, 1280, 0.82);
        setMediaUrl(compressed); // Instant visual preview
        setMediaType('image');
        uploadPayload = compressed;
      } else {
        setMediaType('video');
        // Create local object URL for instant preview while video uploads
        const previewUrl = URL.createObjectURL(file);
        setMediaUrl(previewUrl);
      }

      // Upload directly to ImageKit through server-side /api/upload
      const result = await uploadToImageKit(uploadPayload, file.name, '/karebata_media');
      setMediaUrl(result.url);
      setImageKitFileId(result.fileId);
      setIsImageKitUploaded(true);
      setUploadStatusText('✓ Berhasil tersimpan di ImageKit CDN');
    } catch (err: any) {
      console.error('ImageKit upload error:', err);
      setErrorMsg('Gagal mengunggah ke ImageKit: ' + (err?.message || 'Koneksi terganggu. Silakan coba lagi.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectPreset = (preset: typeof SAMPLE_MEDIA_PRESETS[0]) => {
    setMediaUrl(preset.url);
    setImageKitFileId(undefined);
    setMediaType(preset.type);
    setSelectedMood(preset.emoji);
    setLocation(preset.location);
    setIsImageKitUploaded(false);
    if (!caption) {
      setCaption(preset.caption);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setErrorMsg('Harap isi deskripsi/caption vibe kamu.');
      return;
    }
    if (!mediaUrl.trim()) {
      setErrorMsg('Harap sertakan foto atau video situasi.');
      return;
    }

    const finalLocation = isCustomLoc ? (customLocation.trim() || 'Palu') : location;
    const presetLoc = PRESET_LOCATIONS.find((p) => p.name === finalLocation);
    const coordinates = presetLoc
      ? { lat: presetLoc.lat, lng: presetLoc.lng }
      : { lat: -0.892 + (Math.random() - 0.5) * 0.05, lng: 119.885 + (Math.random() - 0.5) * 0.05 };

    const moodObj = MOODS.find((m) => m.emoji === selectedMood);

    // Auto detect if URL is video
    const isVid =
      mediaType === 'video' ||
      mediaUrl.startsWith('data:video') ||
      /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(mediaUrl);

    onAddPost({
      imageUrl: mediaUrl,
      mediaType: isVid ? 'video' : 'image',
      imageKitFileId,
      caption: caption.trim(),
      mood: selectedMood,
      moodLabel: moodObj?.label || 'Vibe Terkini',
      location: finalLocation,
      coordinates,
      category: selectedMood === '😡' || selectedMood === '⚠️' ? 'laporan' : 'santai'
    });

    // Reset and close
    setCaption('');
    setImageKitFileId(undefined);
    setErrorMsg('');
    onClose();
  };

  const handleGpsLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsCustomLoc(true);
          setCustomLocation(`GPS (${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)})`);
        },
        () => {
          const randomPreset = PRESET_LOCATIONS[Math.floor(Math.random() * PRESET_LOCATIONS.length)];
          setLocation(randomPreset.name);
          setIsCustomLoc(false);
        }
      );
    } else {
      setLocation('Palu Timur');
    }
  };

  const isVideoPreview =
    mediaType === 'video' ||
    mediaUrl.startsWith('data:video') ||
    /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(mediaUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-6">
        {/* MODAL HEADER */}
        <div className="bg-[#673ab7] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg">
              📸
            </div>
            <div>
              <h2 className="text-base font-bold leading-none">Buat Vibe Baru</h2>
              <p className="text-[11px] text-purple-200 mt-1">
                Upload Foto/Video dari Galeri & Pilih Mood
              </p>
            </div>
          </div>
          <button
            id="close-create-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* IDENTITAS PENGIRIM GOOGLE */}
          {currentUser && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate">
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
                Akun Google Aktif
              </span>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. PILIH MOOD (Pilihan Mood atau Kosong/Tanpa Emoji) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span>1. Pilih Mood Suasana</span>
              <span className="text-slate-400 font-normal">(Pilih salah satu atau Tanpa Emoji)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.emoji;
                const isNone = m.emoji === '⚪';
                return (
                  <button
                    key={m.emoji}
                    type="button"
                    id={`select-mood-${m.emoji}`}
                    onClick={() => setSelectedMood(m.emoji)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'bg-purple-100 border-[#673ab7] ring-2 ring-purple-600/30 scale-[1.03] shadow-2xs'
                        : `${m.bgColor} ${m.borderColor} hover:opacity-80`
                    }`}
                  >
                    {isNone ? (
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 text-xs font-bold">
                        ✕
                      </div>
                    ) : (
                      <span className="text-2xl leading-none">{m.emoji}</span>
                    )}
                    <span className="text-[11px] font-bold text-slate-700 mt-1 line-clamp-1">
                      {isNone ? 'Tanpa Emoji' : m.label.split(' / ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. MEDIA DOKUMENTASI (FOTO / VIDEO DARI GALERI) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>2. Foto atau Video Situasi</span>
                <span className="text-rose-500">*</span>
              </label>

              {/* Photo/Video Mode Tabs */}
              <div className="flex items-center gap-1 text-[11px] bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPhotoMode('upload')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    photoMode === 'upload' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Galeri / File
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('preset')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    photoMode === 'preset' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Contoh
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    photoMode === 'url' ? 'bg-white text-purple-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Link URL
                </button>
              </div>
            </div>

            {/* UPLOAD FILE DARI GALERI (FOTO & VIDEO) */}
            {photoMode === 'upload' && (
              <div className="space-y-2">
                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => handleFileUpload(e, 'image')}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={(e) => handleFileUpload(e, 'video')}
                  accept="video/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={(e) => handleFileUpload(e)}
                  accept="image/*,video/*"
                  capture="environment"
                  className="hidden"
                />

                {/* 3 Opsi: Galeri Foto, Galeri Video, Kamera */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    id="btn-pick-gallery-photo"
                    disabled={isUploading}
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 transition-all text-purple-900 active:scale-95 text-center disabled:opacity-60"
                  >
                    <ImageIcon className="w-5 h-5 mb-1 text-[#673ab7]" />
                    <span className="text-xs font-bold">Foto Galeri</span>
                    <span className="text-[9px] text-slate-500">Pilih foto</span>
                  </button>

                  <button
                    type="button"
                    id="btn-pick-gallery-video"
                    disabled={isUploading}
                    onClick={() => videoInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 transition-all text-indigo-900 active:scale-95 text-center disabled:opacity-60"
                  >
                    <Video className="w-5 h-5 mb-1 text-indigo-700" />
                    <span className="text-xs font-bold">Video Galeri</span>
                    <span className="text-[9px] text-slate-500">Pilih video</span>
                  </button>

                  <button
                    type="button"
                    id="btn-pick-camera"
                    disabled={isUploading}
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-slate-800 active:scale-95 text-center disabled:opacity-60"
                  >
                    <Camera className="w-5 h-5 mb-1 text-slate-700" />
                    <span className="text-xs font-bold">Kamera</span>
                    <span className="text-[9px] text-slate-500">Ambil baru</span>
                  </button>
                </div>

                {/* Status Unggah ImageKit */}
                {isUploading && (
                  <div className="flex items-center gap-2 p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-semibold text-purple-900 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-[#673ab7] shrink-0" />
                    <span>{uploadStatusText || 'Sedang mengunggah media ke ImageKit...'}</span>
                  </div>
                )}

                {!isUploading && (isImageKitUploaded || mediaUrl.includes('ik.imagekit.io')) && (
                  <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-900">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <CloudUpload className="w-4 h-4 text-emerald-600" />
                      Tersimpan di ImageKit Cloud CDN
                    </span>
                    <span className="text-[10px] bg-emerald-200/70 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                      ik.imagekit.io
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* PRESET SAMPLES */}
            {photoMode === 'preset' && (
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_MEDIA_PRESETS.map((preset, idx) => {
                  const isCur = mediaUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all text-left group bg-slate-900 ${
                        isCur
                          ? 'border-[#673ab7] ring-2 ring-purple-500/40'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {preset.type === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                          <Video className="w-6 h-6 text-purple-400 mb-1" />
                          <span className="text-[10px] font-bold">Klip Video</span>
                        </div>
                      ) : (
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-1.5 flex flex-col justify-end">
                        <span className="text-[10px] font-bold text-white leading-tight drop-shadow-sm flex items-center gap-1">
                          <span>{preset.emoji}</span>
                          <span className="truncate">{preset.title}</span>
                        </span>
                      </div>
                      {isCur && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#673ab7] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* URL INPUT */}
            {photoMode === 'url' && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/foto.jpg atau video.mp4"
                  className="w-full text-[16px] sm:text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#673ab7]"
                />
                <div className="flex gap-2 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaTypeRadio"
                      checked={mediaType === 'image'}
                      onChange={() => setMediaType('image')}
                    />
                    <span>Foto</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="mediaTypeRadio"
                      checked={mediaType === 'video'}
                      onChange={() => setMediaType('video')}
                    />
                    <span>Video (MP4 / WebM)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Preview of active photo or video */}
            {mediaUrl && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
                {isVideoPreview ? (
                  <video
                    src={mediaUrl}
                    controls
                    playsInline
                    onError={() => setErrorMsg('Format video tidak didukung atau sumber tidak dapat dimuat')}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setErrorMsg('Gagal memuat media dari URL tersebut')}
                  />
                )}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full font-medium backdrop-blur-xs flex items-center gap-1">
                  {isVideoPreview ? <Video className="w-3 h-3 text-purple-300" /> : <ImageIcon className="w-3 h-3 text-purple-300" />}
                  <span>Pratinjau {isVideoPreview ? 'Video' : 'Foto'}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. LOKASI */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>3. Lokasi Kejadian / Vibe</span>
                <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                onClick={handleGpsLocation}
                className="text-[11px] font-semibold text-[#673ab7] hover:text-purple-900 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-[#673ab7]" />
                <span>Pakai GPS Saya</span>
              </button>
            </div>

            {!isCustomLoc ? (
              <div className="space-y-2">
                <select
                  id="select-preset-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-[16px] sm:text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#673ab7]"
                >
                  {PRESET_LOCATIONS.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      📍 {loc.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustomLoc(true)}
                  className="text-[11px] text-slate-500 hover:text-[#673ab7] underline"
                >
                  + Masukkan nama lokasi khusus
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="input-custom-location"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="Contoh: Jl. Sam Ratulangi No. 12"
                    className="flex-1 text-[16px] sm:text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#673ab7]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomLoc(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. CAPTION */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <span>4. Caption / Cerita Kondisi</span>
                <span className="text-rose-500">*</span>
              </label>

              {/* Tombol Sisipkan Kode / Format */}
              <button
                type="button"
                onClick={() => {
                  setCaption((prev) =>
                    prev
                      ? `${prev}\n\`\`\`\n// Tulis atau tempel kode di sini\n\`\`\`\n`
                      : `\`\`\`\n// Tulis atau tempel kode di sini\n\`\`\`\n`
                  );
                }}
                className="text-[11px] font-semibold text-[#673ab7] hover:text-purple-950 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-purple-50 transition-colors"
                title="Sisipkan kotak kode agar teks kode rapi & tidak mepet"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>+ Kotak Kode (```)</span>
              </button>
            </div>

            <textarea
              id="input-vibe-caption"
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Ceritakan detail situasi, atau tempel kode/informasi..."
              className="w-full text-[16px] sm:text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#673ab7] resize-none"
            />
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <span>💡 Format kode otomatis rapi dengan padding, scroll horizontal, & tombol salin.</span>
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-submit-vibe"
              disabled={isUploading}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 ${
                isUploading
                  ? 'bg-purple-300 text-purple-800 cursor-not-allowed'
                  : 'bg-[#673ab7] hover:bg-purple-800 text-white'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke ImageKit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Posting Vibe Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
