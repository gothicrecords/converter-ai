#!/usr/bin/env node

/**
 * Postinstall script to set FFmpeg permissions
 * This ensures FFmpeg is executable on Vercel/serverless environments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

try {
  // Try to import ffmpeg-static
  let ffmpegPath;
  try {
    // Use dynamic import for ES modules
    const ffmpegStaticModule = await import('ffmpeg-static');
    const ffmpegStatic = ffmpegStaticModule.default || ffmpegStaticModule;
    ffmpegPath = typeof ffmpegStatic === 'string' ? ffmpegStatic : ffmpegStatic.default || ffmpegStatic;
  } catch (e) {
    // Try require.resolve as fallback
    try {
      const ffmpegStaticPath = require.resolve('ffmpeg-static');
      const pkg = JSON.parse(fs.readFileSync(path.join(path.dirname(ffmpegStaticPath), '..', 'package.json'), 'utf8'));
      // The binary is usually in the package root
      const pkgDir = path.dirname(require.resolve('ffmpeg-static/package.json'));
      const binName = pkg.bin?.ffmpeg || 'ffmpeg';
      ffmpegPath = path.join(pkgDir, binName);
      
      // If not found, try common locations
      if (!fs.existsSync(ffmpegPath)) {
        const possiblePaths = [
          path.join(pkgDir, 'ffmpeg'),
          path.join(pkgDir, 'ffmpeg.exe'),
          path.join(pkgDir, '..', 'ffmpeg'),
          path.join(pkgDir, '..', 'ffmpeg.exe')
        ];
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            ffmpegPath = possiblePath;
            break;
          }
        }
      }
    } catch (e2) {
      console.warn('FFmpeg-static not found, skipping permission setup');
      process.exit(0);
    }
  }

  if (ffmpegPath && fs.existsSync(ffmpegPath)) {
    try {
      // Set executable permissions (0o755 = rwxr-xr-x)
      fs.chmodSync(ffmpegPath, 0o755);
      console.log(`✓ FFmpeg permissions set: ${ffmpegPath}`);
    } catch (chmodError) {
      // On Windows or if chmod fails, just warn
      console.warn(`⚠ Could not set FFmpeg permissions: ${chmodError.message}`);
      console.warn(`  FFmpeg path: ${ffmpegPath}`);
    }
  } else {
    console.warn(`⚠ FFmpeg binary not found at: ${ffmpegPath || 'undefined'}`);
  }
} catch (error) {
  // Don't fail the build if postinstall fails
  console.warn(`⚠ Postinstall script warning: ${error.message}`);
  process.exit(0);
}

