/**
 * ImageKit upload helper
 * Sends media (photos and videos) to the server-side /api/upload endpoint
 * which securely handles authentication with ImageKit Private Key.
 */

export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  name: string;
  fileType: 'image' | 'video' | 'non-image';
  thumbnailUrl?: string;
}

/**
 * Uploads a base64 or File to ImageKit via backend /api/upload endpoint
 */
export async function uploadToImageKit(
  fileData: string | File,
  fileName?: string,
  folder: string = '/karebata_uploads'
): Promise<ImageKitUploadResult> {
  let base64String = '';
  let finalFileName = fileName || `media_${Date.now()}`;

  if (typeof fileData === 'string') {
    base64String = fileData;
  } else {
    finalFileName = fileName || fileData.name || `media_${Date.now()}`;
    base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileData);
    });
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: base64String,
      fileName: finalFileName,
      folder,
      tags: ['karebata', 'warga-palu'],
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error || `Upload gagal dengan status ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.url) {
    throw new Error(data.error || 'Respon server ImageKit tidak valid');
  }

  return {
    url: data.url,
    fileId: data.fileId,
    name: data.name,
    fileType: data.fileType,
    thumbnailUrl: data.thumbnailUrl,
  };
}

/**
 * Deletes a file from ImageKit via backend API when a post is removed
 */
export async function deleteFromImageKit(fileId?: string, url?: string): Promise<boolean> {
  if (!fileId && !url) return false;

  // If it's a third-party image (like unsplash) or local sample, skip calling ImageKit API
  if (url && !url.includes('imagekit.io') && !url.includes('ik.imagekit.io')) {
    return false;
  }

  try {
    const response = await fetch('/api/imagekit/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId,
        url,
      }),
    });

    if (!response.ok) {
      console.warn(`Gagal menghapus file dari ImageKit (Status: ${response.status})`);
      return false;
    }

    const resData = await response.json();
    return Boolean(resData.success);
  } catch (err) {
    console.error('Error saat menghapus media dari ImageKit:', err);
    return false;
  }
}
