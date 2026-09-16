import { Post } from '../types';
import { INITIAL_POSTS } from '../data/initialPosts';

const STORAGE_KEY = 'vibeboard_posts_v5';

/**
 * Loads posts from localStorage with fallback to initial posts.
 */
export function loadPostsFromStorage(): Post[] {
  try {
    // Clean up legacy caches where posts had pre-set isCared=true
    localStorage.removeItem('vibeboard_posts_v4');
    localStorage.removeItem('vibeboard_posts_v3');
    localStorage.removeItem('vibeboard_posts_v2');
    localStorage.removeItem('vibeboard_posts');

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => {
          // Replace inaccessible Google Cloud Storage video sample if found in old cache
          if (p.imageUrl?.includes('gtv-videos-bucket') || p.imageUrl?.includes('ForBiggerBlazes')) {
            return { ...p, imageUrl: '/sample-video.mp4' };
          }
          return p;
        });
      }
    }
  } catch (e) {
    console.warn('Error loading posts from localStorage, falling back to initial data:', e);
  }
  return INITIAL_POSTS;
}

/**
 * Compresses/sanitizes a list of posts for safe storage within localStorage quota limits (typically 5MB).
 */
function sanitizePostsForStorage(posts: Post[]): Post[] {
  return posts.slice(0, 30).map((post, index) => {
    // If an image URL is a huge base64 data string and exceeds index 5, replace or trim to avoid overflowing quota
    if (index > 4 && post.imageUrl && post.imageUrl.length > 100000 && post.imageUrl.startsWith('data:')) {
      return {
        ...post,
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      };
    }
    return post;
  });
}

/**
 * Safely saves posts to localStorage with quota-exceeded recovery.
 */
export function savePostsToStorage(posts: Post[]): void {
  try {
    const payload = JSON.stringify(posts);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (e) {
    console.warn('Initial localStorage save exceeded quota. Attempting sanitized save...', e);
    try {
      // Step 1: Sanitize large base64 media
      const sanitized = sanitizePostsForStorage(posts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (e2) {
      console.warn('Sanitized save failed. Clearing old keys and saving lightweight latest posts...', e2);
      try {
        // Step 2: Keep only top 10 posts with external URLs only
        const lightweight = posts.slice(0, 10).map((p) => ({
          ...p,
          imageUrl: p.imageUrl.startsWith('data:')
            ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'
            : p.imageUrl,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
      } catch (e3) {
        // Final fallback: do not crash the app
        console.error('localStorage is full or disabled. Operating in-memory only.', e3);
      }
    }
  }
}
