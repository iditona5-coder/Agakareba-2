import React, { useState } from 'react';
import { UserProfile } from '../types';
import { signInWithGoogle } from '../services/firebase';
import { ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { KarebaTaLogo } from './KarebaTaLogo';

interface GoogleLoginPageProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: UserProfile) => void;
}

export const GoogleLoginPage: React.FC<GoogleLoginPageProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOfficialGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      setIsLoading(false);
      if (user) {
        onSuccessLogin(user);
      }
    } catch (err: any) {
      setIsLoading(false);
      
      const code = err?.code || '';
      const isPopupBlocked =
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup');

      if (isPopupBlocked) {
        setErrorMessage(
          'Jendela popup Google diblokir oleh peramban atau iframe. Silakan buka aplikasi di tab browser baru (Open in new tab) atau izinkan popup untuk situs ini.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
        setErrorMessage(
          `Domain "${currentHostname}" belum terdaftar di Firebase Authorized Domains. Harap tambahkan domain ini di Firebase Console > Authentication > Settings > Authorized domains.`
        );
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('Proses login dibatalkan karena jendela login ditutup.');
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMessage(
          'Penyedia Login Google belum diaktifkan di Firebase Console. Buka Authentication > Sign-in method > Google > aktifkan (Enable).'
        );
      } else {
        setErrorMessage(
          `${err?.message || 'Gagal masuk dengan Google.'}${code ? ` (${code})` : ''}`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="google-login-modal"
        className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar with Back Button */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 px-2 -ml-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Berita</span>
          </button>
          <KarebaTaLogo size="sm" />
        </div>

        {/* Login Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Official Google G Multi-Color Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center mb-5 p-3.5 ring-4 ring-slate-50">
            <svg className="w-full h-full" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Masuk dengan Google
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
            Lanjutkan ke <strong>Kareba'Ta</strong> untuk membagikan kabar terkini, foto, atau video situasi di daerah Anda.
          </p>

          {/* Error Message if Any */}
          {errorMessage && (
            <div className="w-full mt-4 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-left flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Primary Action Button: Official Google Sign-In Button */}
          <div className="w-full mt-6">
            <button
              id="btn-google-official-login"
              type="button"
              disabled={isLoading}
              onClick={handleOfficialGoogleSignIn}
              className="w-full h-12 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-300 rounded-full shadow-xs transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Lanjutkan dengan Akun Google</span>
            </button>
          </div>

          {/* Privacy & Trust Badge */}
          <div className="mt-6 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kareba'Ta menghormati privasi dan keamanan akun Anda</span>
          </div>
        </div>
      </div>
    </div>
  );
};
