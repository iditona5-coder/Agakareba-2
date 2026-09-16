import React, { useEffect, useRef, useState } from 'react';
import { Post } from '../types';
import { MOODS } from '../data/moods';
import L from 'leaflet';
import { Heart, MessageCircle, ArrowLeft, Layers, MapPin, ZoomIn, ZoomOut } from 'lucide-react';

interface VibeMapViewProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onBackToFeed: () => void;
  onToggleCare: (postId: string) => void;
  selectedPostId?: string | null;
}

export const VibeMapView: React.FC<VibeMapViewProps> = ({
  posts,
  onSelectPost,
  onBackToFeed,
  onToggleCare,
  selectedPostId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [activeMoodFilter, setActiveMoodFilter] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [mediaError, setMediaError] = useState(false);

  useEffect(() => {
    setMediaError(false);
  }, [activePost?.id]);

  const filteredPosts = activeMoodFilter
    ? posts.filter((p) => p.mood === activeMoodFilter && p.coordinates)
    : posts.filter((p) => p.coordinates);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center: Palu (-0.892, 119.875)
      const map = L.map(mapContainerRef.current, {
        center: [-0.892, 119.875],
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    for (const key of Object.keys(markersRef.current)) {
      const m = markersRef.current[key];
      if (m) {
        m.remove();
      }
    }
    markersRef.current = {};

    // Add markers for posts
    filteredPosts.forEach((post) => {
      if (!post.coordinates) return;

      const isHighlight = post.id === selectedPostId || post.id === activePost?.id;

      // Custom HTML emoji icon
      const customIcon = L.divIcon({
        className: 'custom-vibe-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isHighlight ? '46px' : '38px'};
            height: ${isHighlight ? '46px' : '38px'};
            background: ${isHighlight ? '#581c87' : 'white'};
            border: 3px solid ${isHighlight ? '#f43f5e' : '#7e22ce'};
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            font-size: ${isHighlight ? '22px' : '18px'};
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            ${post.mood}
          </div>
          <div style="
            background: rgba(15, 23, 42, 0.85);
            color: white;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
            margin-top: 4px;
            text-align: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.2);
          ">
            ${post.location}
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 25],
      });

      const marker = L.marker([post.coordinates.lat, post.coordinates.lng], {
        icon: customIcon,
      }).addTo(map);

      marker.on('click', () => {
        setActivePost(post);
        map.panTo([post.coordinates!.lat, post.coordinates!.lng]);
      });

      markersRef.current[post.id] = marker;
    });

    // If a specific post was selected to view on map, pan to it
    if (selectedPostId) {
      const targetPost = posts.find((p) => p.id === selectedPostId);
      if (targetPost && targetPost.coordinates) {
        setActivePost(targetPost);
        map.setView([targetPost.coordinates.lat, targetPost.coordinates.lng], 15);
      }
    }

    return () => {
      // Cleanup on unmount handled by ref
    };
  }, [filteredPosts, selectedPostId]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className="relative w-full h-[calc(100vh-65px)] bg-slate-200 overflow-hidden flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-400 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="back-to-feed-btn"
            onClick={onBackToFeed}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg border border-slate-200 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-purple-700" />
            <span>Kembali ke Feed</span>
          </button>
        </div>

        {/* Mood filter pills on Map */}
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-lg border border-slate-200 pointer-events-auto overflow-x-auto max-w-full">
          <button
            id="map-filter-all"
            onClick={() => setActiveMoodFilter(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeMoodFilter === null
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Semua ({posts.length})
          </button>
          {MOODS.map((m) => {
            const isSel = activeMoodFilter === m.emoji;
            const count = posts.filter((p) => p.mood === m.emoji).length;
            return (
              <button
                key={m.emoji}
                id={`map-filter-${m.emoji}`}
                onClick={() => setActiveMoodFilter(isSel ? null : m.emoji)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  isSel
                    ? 'bg-purple-800 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{m.emoji}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Navigation Buttons */}
      <div className="absolute right-4 bottom-24 sm:bottom-8 z-400 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-purple-800" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white hover:bg-slate-50 text-slate-800 rounded-xl shadow-lg border border-slate-200 flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-purple-800" />
        </button>
      </div>

      {/* Bottom Card for Selected Post */}
      {activePost && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-400 animate-slide-up">
          <div className="bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden">
            <div className="p-3.5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activePost.mood}</span>
                <div>
                  <h4 className="font-bold text-sm leading-tight">{activePost.location}</h4>
                  <p className="text-[11px] text-purple-200">{activePost.createdAt}</p>
                </div>
              </div>
              <button
                onClick={() => setActivePost(null)}
                className="text-purple-200 hover:text-white text-xs font-semibold px-2 py-1 bg-purple-800/60 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 space-y-2.5">
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
                {!mediaError ? (
                  activePost.mediaType === 'video' || /\.(mp4|mov|webm|ogg|m4v)(\?.*)?$/i.test(activePost.imageUrl || '') ? (
                    <video
                      src={activePost.imageUrl}
                      controls
                      playsInline
                      onError={() => setMediaError(true)}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={activePost.imageUrl}
                      alt={activePost.caption}
                      onError={() => setMediaError(true)}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs">
                    <span>📷 Media tidak dapat dimuat</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                {activePost.caption}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <button
                  onClick={() => onToggleCare(activePost.id)}
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                    activePost.isCared
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${activePost.isCared ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>❤️ Peduli ({activePost.caresCount})</span>
                </button>

                <button
                  onClick={() => {
                    onSelectPost(activePost);
                    onBackToFeed();
                  }}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-all shadow-xs"
                >
                  Buka Postingan ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
