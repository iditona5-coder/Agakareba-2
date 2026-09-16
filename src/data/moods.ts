import { MoodConfig } from '../types';

export const MOODS: MoodConfig[] = [
  { emoji: '😡', label: 'Geram / Rusak', color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  { emoji: '😢', label: 'Sedih / Bencana', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { emoji: '☕', label: 'Santai / Nongkrong', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { emoji: '🔥', label: 'Viral / Heboh', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { emoji: '🍜', label: 'Kuliner / Enak', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { emoji: '⚠️', label: 'Waspada / Macet', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { emoji: '⚪', label: 'Tanpa Emoji / Netral', color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
];

export const PRESET_LOCATIONS = [
  { name: 'Palu Timur', lat: -0.892, lng: 119.885 },
  { name: 'Palu Barat', lat: -0.899, lng: 119.845 },
  { name: 'Palu Selatan', lat: -0.925, lng: 119.892 },
  { name: 'Mantikulore (Tondo)', lat: -0.865, lng: 119.895 },
  { name: 'Pantai Talise', lat: -0.875, lng: 119.870 },
  { name: 'Palu Utara (Mamboro)', lat: -0.812, lng: 119.865 },
  { name: 'Tatanga', lat: -0.918, lng: 119.860 },
  { name: 'Ulujadi (Donggala Kodi)', lat: -0.850, lng: 119.825 },
];
