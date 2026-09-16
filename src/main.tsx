import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Cegah zoom layar tanpa menghalangi scrolling normal
// Cegah pinch zoom (2 jari atau lebih), biarkan scroll 1 jari bebas lancar
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// Cegah gesture zoom pada WebKit / Safari
document.addEventListener(
  'gesturestart',
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);
document.addEventListener(
  'gesturechange',
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);
document.addEventListener(
  'gestureend',
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

// Cegah Ctrl + Wheel / Trackpad pinch zoom di Desktop
document.addEventListener(
  'wheel',
  (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  },
  { passive: false }
);

// Cegah tombol pintasan keyboard zoom (Ctrl/Cmd + '+', '-', '0')
document.addEventListener('keydown', (e) => {
  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0' || e.key === '_')
  ) {
    e.preventDefault();
  }
});

// 2. Cegah salin teks (copy) pada seluruh bagian konten umum, kecuali di dalam kolom input/textarea
document.addEventListener('copy', (e) => {
  const activeEl = document.activeElement;
  const isInputField =
    activeEl?.tagName === 'INPUT' ||
    activeEl?.tagName === 'TEXTAREA' ||
    activeEl?.getAttribute('contenteditable') === 'true';

  if (!isInputField) {
    e.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

