import React, { useState, useRef, useEffect } from 'react';
import { Search, Home, X } from 'lucide-react';
import { KarebaTaLogo } from './KarebaTaLogo';

interface NavbarProps {
  viewMode?: 'feed' | 'map';
  setViewMode?: (mode: 'feed' | 'map') => void;
  userAvatar?: string;
  userName?: string;
  onOpenCreate?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  postsCount?: number;
  unseenCount?: number;
  onHomeClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({
  viewMode = 'feed',
  setViewMode,
  searchQuery = '',
  setSearchQuery,
  unseenCount = 0,
  onHomeClick,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleHomeButton = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      setViewMode?.('feed');
      if (searchQuery && setSearchQuery) {
        setSearchQuery('');
      }
      setIsSearchOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full bg-white text-slate-900 border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between">
        {/* Kareba'Ta Brand Logo */}
        <div
          className="cursor-pointer transition-opacity hover:opacity-90 shrink-0"
          onClick={handleHomeButton}
          title="Ke Halaman Utama / Paling Atas"
        >
          <KarebaTaLogo size="md" />
        </div>

        {/* Right Action Icons: Kaca Pembesar (Cari) + Home (Beranda) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Icon Kaca Pembesar (Search): 22–24 px */}
          <button
            id="navbar-search-btn"
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isSearchOpen && setSearchQuery) {
                setSearchQuery('');
              }
            }}
            title="Cari Berita & Lokasi"
            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
              isSearchOpen || searchQuery
                ? 'text-[#007aff] bg-blue-50 ring-1 ring-[#007aff]/20'
                : 'text-slate-700 hover:text-[#007aff] hover:bg-slate-100'
            }`}
            aria-label="Cari Vibe dan Kabar"
          >
            <Search className="w-[23px] h-[23px]" />
          </button>

          {/* Icon Home di Kanan Kaca Pembesar dengan Lencana Angka Notifikasi Postingan Baru */}
          <button
            id="navbar-home-btn"
            type="button"
            onClick={handleHomeButton}
            title={unseenCount > 0 ? `${unseenCount} postingan baru belum dilihat - Klik untuk menampilkan` : "Beranda (Home)"}
            className={`relative w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ${
              viewMode === 'feed' && !searchQuery
                ? 'text-[#007aff] bg-blue-50/80 ring-1 ring-[#007aff]/25'
                : 'text-slate-700 hover:text-[#007aff] hover:bg-slate-100'
            }`}
            aria-label="Ke Beranda Utama"
          >
            <Home className="w-[23px] h-[23px]" />

            {/* Lencana Angka di Atas Icon Home jika ada postingan baru belum dilihat */}
            {unseenCount > 0 && (
              <span
                id="navbar-home-unseen-badge"
                className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-600 text-white font-extrabold text-[11px] leading-none rounded-full flex items-center justify-center ring-2 ring-white shadow-md animate-pulse pointer-events-none"
              >
                {unseenCount > 99 ? '99+' : unseenCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input (Kaca Pembesar) */}
      {isSearchOpen && (
        <div className="border-t px-3 sm:px-4 py-2 bg-slate-50/95 border-slate-100 animate-in slide-in-from-top-1 duration-150">
          <div className="max-w-2xl mx-auto relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              placeholder="Cari berita, lokasi, atau topik..."
              className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-[16px] sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b4d1b]/30 focus:border-[#1b4d1b]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery?.('')}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                title="Hapus kata kunci"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                title="Tutup pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
});

