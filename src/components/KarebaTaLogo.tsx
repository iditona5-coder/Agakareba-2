import React from 'react';

export interface KarebaTaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'horizontal' | 'vertical' | 'stacked' | 'icon-only' | 'full';
  inverted?: boolean;
  withTagline?: boolean;
}

/**
 * Agakareba Official Icon
 * Sama persis dengan gambar logo resmi:
 * - Lengkungan / Kubah Biru Tua Navy (#003B6D) dengan ujung membulat sempurna (strokeWidth 21)
 * - Titik lingkaran oranye terang (#FF6D00) tepat bersarang di rongga bawah kubah (radius 15)
 */
export const AgakarebaIcon: React.FC<{
  size?: number | string;
  className?: string;
  inverted?: boolean;
}> = ({ size = 32, className = '', inverted = false }) => {
  const navyColor = inverted ? '#93c5fd' : '#003B6D';
  const orangeColor = inverted ? '#fb923c' : '#FF6D00';

  const numHeight = typeof size === 'number' ? size : parseInt(String(size), 10) || 32;
  const numWidth = Math.round(numHeight * 1.23);

  return (
    <svg
      style={{
        height: typeof size === 'number' ? `${numHeight}px` : size,
        width: typeof size === 'number' ? `${numWidth}px` : 'auto',
      }}
      viewBox="6 14 108 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      {/* Lengkungan / Kubah Biru Tua Navy (#003B6D) */}
      <path
        d="M 18 90 L 46 38 Q 60 16 74 38 L 102 90"
        stroke={navyColor}
        strokeWidth="21"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Lingkaran Oranye Terang (#FF6D00) */}
      <circle cx="60" cy="71" r="15" fill={orangeColor} />
    </svg>
  );
};

export const KarebaTaLogo: React.FC<KarebaTaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  inverted = false,
  withTagline = false,
}) => {
  // Dimension scales
  const scales = {
    sm: {
      iconSize: 22,
      textSize: 'text-xl',
      taglineSize: 'text-[8px]',
      gap: 'gap-1.5',
      vIconSize: 48,
      vTextSize: 'text-2xl',
    },
    md: {
      iconSize: 28,
      textSize: 'text-2xl sm:text-[26px]',
      taglineSize: 'text-[9px]',
      gap: 'gap-2',
      vIconSize: 64,
      vTextSize: 'text-3xl',
    },
    lg: {
      iconSize: 36,
      textSize: 'text-3xl sm:text-4xl',
      taglineSize: 'text-[10.5px]',
      gap: 'gap-2.5',
      vIconSize: 84,
      vTextSize: 'text-4xl',
    },
    xl: {
      iconSize: 46,
      textSize: 'text-4xl sm:text-5xl',
      taglineSize: 'text-xs',
      gap: 'gap-3',
      vIconSize: 110,
      vTextSize: 'text-5xl',
    },
    '2xl': {
      iconSize: 58,
      textSize: 'text-5xl sm:text-6xl',
      taglineSize: 'text-sm',
      gap: 'gap-3.5',
      vIconSize: 140,
      vTextSize: 'text-6xl',
    },
  };

  const current = scales[size] || scales.md;
  const isVertical = variant === 'vertical' || variant === 'stacked' || variant === 'full';
  const isIconOnly = variant === 'icon-only';

  const navyColor = inverted ? '#93c5fd' : '#003B6D';
  const orangeColor = inverted ? '#fb923c' : '#FF6D00';

  if (isIconOnly) {
    return <AgakarebaIcon size={current.iconSize} className={className} inverted={inverted} />;
  }

  // Teks Logo Berada di Bawah Ikon (Desain Vertikal)
  if (isVertical) {
    return (
      <div
        className={`flex flex-col items-center text-center select-none ${className}`}
        title="AgaKareba"
      >
        <AgakarebaIcon size={current.vIconSize} inverted={inverted} />

        {/* Wordmark: Aga (Navy) + Kareba (Oranye) */}
        <div className="flex items-baseline tracking-[-0.03em] font-[800] leading-none mt-2 select-none">
          <span
            style={{
              color: navyColor,
              fontFamily: "'Poppins', 'Century Gothic', 'Outfit', system-ui, -apple-system, sans-serif",
            }}
            className={`${current.vTextSize} font-[800] tracking-[-0.03em]`}
          >
            Aga
          </span>
          <span
            style={{
              color: orangeColor,
              fontFamily: "'Poppins', 'Century Gothic', 'Outfit', system-ui, -apple-system, sans-serif",
            }}
            className={`${current.vTextSize} font-[800] tracking-[-0.03em]`}
          >
            Kareba
          </span>
        </div>

        {withTagline && (
          <span
            className={`font-bold tracking-widest uppercase text-slate-400 mt-1.5 ${current.taglineSize}`}
          >
            PORTAL BERITA DIGITAL
          </span>
        )}
      </div>
    );
  }

  // Desain Horizontal Standar (Sama persis dengan gambar yang diunggah)
  return (
    <div
      className={`inline-flex items-center ${current.gap} select-none ${className}`}
      title="AgaKareba"
    >
      {/* 1. Ikon Simbol di Kiri (Kubah Navy + Lingkaran Oranye) */}
      <AgakarebaIcon size={current.iconSize} inverted={inverted} />

      {/* 2. Teks Wordmark: Aga (Navy) + Kareba (Oranye) */}
      <div className="flex flex-col justify-center select-none leading-none">
        <div className="flex items-baseline tracking-[-0.03em] font-[800] leading-none">
          <span
            style={{
              color: navyColor,
              fontFamily: "'Poppins', 'Century Gothic', 'Outfit', system-ui, -apple-system, sans-serif",
            }}
            className={`${current.textSize} font-[800] tracking-[-0.03em]`}
          >
            Aga
          </span>
          <span
            style={{
              color: orangeColor,
              fontFamily: "'Poppins', 'Century Gothic', 'Outfit', system-ui, -apple-system, sans-serif",
            }}
            className={`${current.textSize} font-[800] tracking-[-0.03em]`}
          >
            Kareba
          </span>
        </div>

        {withTagline && (
          <span
            className={`font-semibold tracking-widest uppercase text-slate-400 mt-0.5 ${current.taglineSize}`}
          >
            PORTAL BERITA DIGITAL
          </span>
        )}
      </div>
    </div>
  );
};

export default KarebaTaLogo;
