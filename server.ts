import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import ImageKit from 'imagekit';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;

// Initialize ImageKit instance with environment variables or provided credentials
const getImageKit = (): ImageKit => {
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/rdyi1j1sg/';
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || 'public_WEwv7Q9gV4tFyZzV0obqGnKfT94=';
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'private_Hfxv7O6OPu7fA8wOA03WgNaxMKY=';

  return new ImageKit({
    urlEndpoint,
    publicKey,
    privateKey,
  });
};

async function startServer() {
  const app = express();

  // Support up to 50MB for video and high-resolution photo uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API 1: Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      imagekitConfigured: true,
      timestamp: new Date().toISOString(),
    });
  });

  // API 2: ImageKit Authentication Parameters for client-side direct uploads
  app.get('/api/imagekit/auth', (req, res) => {
    try {
      const ik = getImageKit();
      const authParams = ik.getAuthenticationParameters();
      res.json(authParams);
    } catch (error: any) {
      console.error('Error generating ImageKit auth parameters:', error);
      res.status(500).json({
        error: 'Failed to generate auth parameters',
        message: error?.message || 'Internal error',
      });
    }
  });

  // API 3: Upload Photo or Video directly to ImageKit
  app.post('/api/upload', async (req, res) => {
    try {
      const { file, fileName, folder, tags } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'File data is required (base64 string or remote URL)' });
      }

      const ik = getImageKit();
      const safeFileName = fileName || `upload_${Date.now()}`;
      const targetFolder = folder || '/karebata_media';

      console.log(`Uploading file "${safeFileName}" to ImageKit folder: ${targetFolder}...`);

      const result = await ik.upload({
        file: file, // base64 string or URL
        fileName: safeFileName,
        folder: targetFolder,
        useUniqueFileName: true,
        tags: tags || ['karebata', 'warga'],
      });

      console.log(`ImageKit upload success: ${result.url}`);

      return res.json({
        success: true,
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        fileType: result.fileType,
        thumbnailUrl: result.thumbnailUrl,
        height: result.height,
        width: result.width,
        size: result.size,
      });
    } catch (error: any) {
      console.error('ImageKit upload failed:', error);
      return res.status(500).json({
        success: false,
        error: error?.message || 'Failed to upload media to ImageKit',
        details: error,
      });
    }
  });

  // API 4: Delete media from ImageKit by fileId or URL
  app.post('/api/imagekit/delete', async (req, res) => {
    try {
      const { fileId, url } = req.body;
      const ik = getImageKit();

      // If fileId is provided directly, delete using ImageKit SDK
      if (fileId) {
        console.log(`Deleting ImageKit file by fileId: ${fileId}...`);
        await ik.deleteFile(fileId);
        console.log(`ImageKit file ${fileId} successfully deleted.`);
        return res.json({ success: true, message: `File ${fileId} deleted from ImageKit` });
      }

      // If only ImageKit URL is available, extract fileName and search for fileId
      if (url && typeof url === 'string') {
        try {
          const urlObj = new URL(url);
          const parts = urlObj.pathname.split('/').filter(Boolean);
          const fileName = parts[parts.length - 1];
          if (fileName) {
            console.log(`Searching ImageKit file by name: "${fileName}" for deletion...`);
            const files = await ik.listFiles({ searchQuery: `name="${fileName}"` });
            if (files && files.length > 0) {
              const matchedId = (files[0] as any).fileId;
              await ik.deleteFile(matchedId);
              console.log(`ImageKit file "${fileName}" (${matchedId}) successfully deleted.`);
              return res.json({ success: true, message: `File ${fileName} deleted from ImageKit`, fileId: matchedId });
            }
          }
        } catch (searchErr) {
          console.warn('Error during URL search in ImageKit:', searchErr);
        }
      }

      return res.status(400).json({
        success: false,
        error: 'fileId or valid ImageKit URL is required for deletion',
      });
    } catch (error: any) {
      console.error('Failed to delete file from ImageKit:', error);
      return res.status(500).json({
        success: false,
        error: error?.message || 'Failed to delete file from ImageKit',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
