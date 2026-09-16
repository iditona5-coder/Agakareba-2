import React from 'react';
import { X, MapPin, Calendar, Heart, Shield, LogOut, CheckCircle2, FileText } from 'lucide-react';
import { Post } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

export interface UserProfileData {
  name: string;
  avatar?: string;
  email?: string;
  location?: string;
  isCurrentUser?: boolean;
}

interface ProfileFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUser: UserProfileData | null;
  userPosts: Post[];
  currentUser: FirebaseUser | null;
  onLogout?: () => void;
  onOpenAdminModeration?: () => void;
  isAdmin?: boolean;
  onSelectPost?: (post: Post) => void;
}

export const ProfileFullscreenModal: React.FC<ProfileFullscreenModalProps> = ({
  isOpen,
  onClose,
  profileUser,
  userPosts,
  currentUser,
  onLogout,
  onOpenAdminModeration,
  isAdmin = false,
  onSelectPost,
}) => {
  if (!isOpen || !profileUser) return null;

  const isSelf = Boolean(
    profileUser.isCurrentUser ||
    (currentUser && profileUser.email && currentUser.email === profileUser.email)
  );

  const totalLikes = userPosts.reduce((acc, p) => acc + (p.caresCount || 0), 0);

  return (
    <div
      id="profile-fullscreen-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full h-full sm:h-[94vh] sm:max-w-2xl bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR HEADER */}
        <header className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-800 tracking-tight">
              {isSelf ? 'Profil Saya' : 'Profil Warga'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Tutup (Esc)"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* SCROLLABLE PROFILE CONTENT */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* COVER BANNER */}
          <div className="h-32 sm:h-36 bg-gradient-to-r from-emerald-800 via-[#1b4d1b] to-teal-800 relative">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          </div>

          {/* AVATAR & IDENTITAS */}
          <div className="px-5 pb-5 -mt-14 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="relative inline-block shrink-0">
                {profileUser.avatar ? (
                  <img
                    src={profileUser.avatar}
                    alt={profileUser.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-white flex items-center justify-center text-3xl font-bold text-emerald-800 shadow-md ring-1 ring-slate-200">
                    {profileUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {isSelf && (
                  <span
                    className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
                    title="Online / Sedang Aktif"
                  />
                )}
              </div>

              {/* ACTION BUTTONS (LOGOUT / ADMIN IF SELF) */}
              <div className="flex items-center gap-2">
                {isSelf && isAdmin && onOpenAdminModeration && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminModeration();
                    }}
                    className="h-9 px-3.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>Panel Moderasi</span>
                  </button>
                )}

                {isSelf && onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="h-9 px-4 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                )}
              </div>
            </div>

            {/* NAMA & EMAIL */}
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {profileUser.name}
                </h1>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" title="Akun Terverifikasi" />
              </div>

              {profileUser.email && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {profileUser.email}
                </p>
              )}

              {profileUser.location && (
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{profileUser.location}</span>
                </div>
              )}
            </div>

            {/* RINGKASAN STATISTIK */}
            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-800 leading-none">
                    {userPosts.length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Kabar Dibagikan</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 fill-rose-600" />
                </div>
                <div>
                  <div className="text-base font-bold text-slate-800 leading-none">
                    {totalLikes}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Suka Diterima</div>
                </div>
              </div>
            </div>

            {/* DAFTAR POSTINGAN OLEH PENGGUNA INI */}
            <div className="mt-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">
                  Semua Kabar dari {isSelf ? 'Anda' : profileUser.name.split(' ')[0]} ({userPosts.length})
                </h2>
              </div>

              {userPosts.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  Belum ada kabar yang dibagikan oleh pengguna ini.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                  {userPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => {
                        onClose();
                        onSelectPost?.(post);
                      }}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                    >
                      {post.mediaType === 'video' ? (
                        <video
                          src={post.imageUrl}
                          muted
                          preload="metadata"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <img
                          src={post.imageUrl}
                          alt={post.caption || 'Kabar'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity p-2 flex flex-col justify-end">
                        <span className="text-white text-[11px] font-medium line-clamp-2 leading-tight drop-shadow-xs">
                          {post.caption || post.location}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-white/80">
                          <span className="flex items-center gap-0.5">
                            <Heart className="w-2.5 h-2.5 fill-white" />
                            {post.caresCount || 0}
                          </span>
                          <span>•</span>
                          <span>{post.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
