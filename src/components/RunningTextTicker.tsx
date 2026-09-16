import React from 'react';
import { Post } from '../types';
import { Radio } from 'lucide-react';

interface RunningTextTickerProps {
  posts: Post[];
  onSelectPost?: (postId: string) => void;
}

export const RunningTextTicker: React.FC<RunningTextTickerProps> = React.memo(({
  posts,
  onSelectPost,
}) => {
  if (!posts || posts.length === 0) return null;

  // Extract headlines from posts
  const tickerItems = posts.slice(0, 10).map((post) => ({
    id: post.id,
    location: post.location || 'Palu',
    caption: post.caption || 'Kabar warga terkini',
    time: post.createdAt || 'Terkini',
  }));

  const handleClickItem = (id: string) => {
    if (onSelectPost) {
      onSelectPost(id);
    } else {
      const el = document.getElementById(`post-card-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div
      id="running-text-ticker-board"
      className="w-full bg-[#163e16] text-white border-b border-green-950/60 shadow-xs relative overflow-hidden select-none z-20"
      style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)', isolation: 'isolate' }}
      title="Papan Teks Berjalan Info (Sentuh atau arahkan kursor untuk jeda, klik untuk menuju postingan)"
    >
      <div className="max-w-4xl mx-auto flex items-center h-8 sm:h-9 px-2 sm:px-3 relative">
        {/* Left Badge: Papan Info */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[9px] sm:text-[10px] tracking-wider uppercase shadow-xs shrink-0 z-10 mr-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          <Radio className="w-2.5 h-2.5 text-white hidden xs:inline" />
          <span>INFO</span>
        </div>

        {/* Marquee Ticker Track (Teks Berjalan Horizontal dari Kanan ke Kiri) */}
        <div className="flex-1 overflow-hidden h-full flex items-center relative">
          <div className="animate-marquee items-center gap-8 py-1 whitespace-nowrap cursor-pointer">
            {/* Loop ganda untuk kelancaran animasi marquee tiada henti */}
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span
                key={`${item.id}-${idx}`}
                onClick={() => handleClickItem(item.id)}
                className="inline-flex items-center gap-2 group hover:text-lime-300 transition-colors"
              >
                <span className="bg-white/15 text-lime-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  {item.location}
                </span>
                <span className="text-[11px] sm:text-xs text-white group-hover:underline underline-offset-2">
                  {item.caption}
                </span>
                <span className="text-emerald-300/70 font-mono text-[10px]">
                  ({item.time})
                </span>
                <span className="text-emerald-400 font-bold ml-1 opacity-60">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
