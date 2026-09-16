import React from 'react';
import { MOODS, PRESET_LOCATIONS } from '../data/moods';

interface MoodFilterBarProps {
  selectedMood: string | null;
  setSelectedMood: (mood: string | null) => void;
  selectedLocation: string | null;
  setSelectedLocation: (loc: string | null) => void;
}

export const MoodFilterBar: React.FC<MoodFilterBarProps> = ({
  selectedMood,
  setSelectedMood,
  selectedLocation,
  setSelectedLocation,
}) => {
  const isAllSelected = selectedMood === null && selectedLocation === null;

  const handleSelectAll = () => {
    setSelectedMood(null);
    setSelectedLocation(null);
  };

  const handleToggleMood = (emoji: string) => {
    if (selectedMood === emoji) {
      setSelectedMood(null);
    } else {
      setSelectedMood(emoji);
    }
  };

  const handleToggleLocation = (locName: string) => {
    if (selectedLocation === locName) {
      setSelectedLocation(null);
    } else {
      setSelectedLocation(locName);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/80 shadow-2xs">
      {/* SingleChildScrollView(scrollDirection: Axis.horizontal, padding: EdgeInsets.all(10)) */}
      <div className="max-w-2xl mx-auto overflow-x-auto p-[10px] scrollbar-none no-scrollbar">
        <div className="flex items-center gap-2 whitespace-nowrap">
          {/* ChoiceChip: Semua */}
          <button
            id="choice-chip-semua"
            onClick={handleSelectAll}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all border shrink-0 ${
              isAllSelected
                ? 'bg-purple-100 text-[#673ab7] border-purple-300 font-bold shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua
          </button>

          {/* ChoiceChip: 😡 Geram */}
          <button
            id="choice-chip-geram"
            onClick={() => handleToggleMood('😡')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all border shrink-0 flex items-center gap-1.5 ${
              selectedMood === '😡'
                ? 'bg-purple-100 text-[#673ab7] border-purple-300 font-bold shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>😡</span>
            <span>Geram</span>
          </button>

          {/* ChoiceChip: 😢 Sedih */}
          <button
            id="choice-chip-sedih"
            onClick={() => handleToggleMood('😢')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all border shrink-0 flex items-center gap-1.5 ${
              selectedMood === '😢'
                ? 'bg-purple-100 text-[#673ab7] border-purple-300 font-bold shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>😢</span>
            <span>Sedih</span>
          </button>

          {/* Other Moods from config */}
          {MOODS.filter((m) => !['😡', '😢'].includes(m.emoji)).map((m) => {
            const isSelected = selectedMood === m.emoji;
            const shortLabel = m.label.split(' / ')[0];
            return (
              <button
                key={m.emoji}
                id={`choice-chip-mood-${m.emoji}`}
                onClick={() => handleToggleMood(m.emoji)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all border shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-purple-100 text-[#673ab7] border-purple-300 font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{m.emoji}</span>
                <span>{shortLabel}</span>
              </button>
            );
          })}

          {/* Location ChoiceChips (📍 Palu Timur, etc.) */}
          {PRESET_LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc.name;
            return (
              <button
                key={loc.name}
                id={`choice-chip-loc-${loc.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => handleToggleLocation(loc.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all border shrink-0 flex items-center gap-1 ${
                  isSelected
                    ? 'bg-purple-100 text-[#673ab7] border-purple-300 font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>📍</span>
                <span>{loc.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

