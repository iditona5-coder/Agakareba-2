import React from 'react';
import { Images, User } from 'lucide-react';
import { UserProfile } from '../types';

interface SharePromptBoardProps {
  currentUser: UserProfile | null;
  onClickBoard: () => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  onOpenAdminModeration?: () => void;
  onOpenProfile?: () => void;
}

export const SharePromptBoard: React.FC<SharePromptBoardProps> = ({
  currentUser,
  onClickBoard,
  onLogout,
  isAdmin,
  onOpenAdminModeration,
  onOpenProfile,
}) => {
  return (
    <div
      id="papan-ada-kabar-apa"
      className="w-full bg-white border-b-[6px] sm:border-b-[8px] border-slate-300 shadow-xs transition-colors"
    >
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Avatar Pengguna: 44px bulat dengan border putih tipis. Klik untuk membuka Halaman Profil Layar Penuh */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                if (currentUser && onOpenProfile) {
                  onOpenProfile();
                } else {
                  onClickBoard();
                }
              }}
              title={currentUser ? `Lihat Profil: ${currentUser.displayName || currentUser.email}` : 'Masuk dengan Google'}
              className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Pengguna Google'}
                  className="w-[44px] h-[44px] rounded-full object-cover border border-white shadow-xs ring-1 ring-slate-200/80"
                />
              ) : (
                <div className="w-[44px] h-[44px] rounded-full bg-emerald-50 border border-white flex items-center justify-center text-emerald-800 shadow-xs ring-1 ring-slate-200/80">
                  <User className="w-5 h-5 text-[#1b4d1b]" />
                </div>
              )}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                  currentUser ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </button>
          </div>

          {/* Kotak Pemicu (Klik untuk Masuk Google atau Buka Form Buat Vibe Baru) */}
          <button
            type="button"
            onClick={onClickBoard}
            className="flex-1 text-left bg-slate-100/90 hover:bg-slate-200/80 transition-colors rounded-full pl-4 pr-2.5 py-1.5 sm:py-2 flex items-center justify-between group border border-slate-200/70"
          >
            <div className="flex flex-col min-w-0 pr-2">
              {/* Ukuran tulisan: 16px Bold */}
              <span className="text-[15px] sm:text-[16px] font-bold text-slate-800 group-hover:text-blue-900 truncate">
                {currentUser
                  ? `Ada kabar apa hari ini, ${currentUser.displayName?.split(' ')[0] || "daerah'ta"}?`
                  : "Ada kabar apa di daerah'ta?"}
              </span>
              <span className="text-[12px] text-slate-500 hidden xs:inline truncate">
                {currentUser
                  ? 'Bagikan situasi jalan, cuaca, info penting, atau foto/video...'
                  : 'Masuk dengan Google untuk membagikan situasi terkini...'}
              </span>
            </div>
            {/* Icon Media Bertumpuk (Galeri/Foto/Video): warna disamakan dengan warna icon kaca pembesar (text-slate-700) */}
            <span
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 text-slate-700 shadow-2xs group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center border border-slate-200/80 hover:bg-slate-100"
              title="Unggah Media (Foto / Video) & Bagikan Kabar"
            >
              <Images className="w-[23px] h-[23px] text-slate-700" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
