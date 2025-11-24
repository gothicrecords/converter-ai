#!/usr/bin/env node

/**
 * Postinstall script to set FFmpeg permissions
 * This ensures FFmpeg is executable on Vercel/serverless environments
 */

const fs = require('fs');
const path = require('path');

try {
  // Try to import ffmpeg-static
  let ffmpegPath;
  try {
    const ffmpegStatic = require('ffmpeg-static');
    ffmpegPath = typeof ffmpegStatic === 'string' ? ffmpegStatic : ffmpegStatic.default || ffmpegStatic;
  } catch (e) {
    // Try dynamic import as fallback
    try {
      const ffmpegStatic = require.resolve('ffmpeg-static');
      const pkg = require('ffmpeg-static/package.json');
      // The binary is usually in the package root
      ffmpegPath = path.join(path.dirname(ffmpegStatic), '..', pkg.bin?.ffmpeg || 'ffmpeg');
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

