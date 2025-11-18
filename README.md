# Upscaler AI & Offline Converters

## What’s new (2025-11-18)
- Added a unified, offline Convert API supporting images, documents, spreadsheets, archives, fonts, vectors, ebooks, and media without external services.
- Introduced a Generic Converter UI and SEO-friendly tool pages generated from a registry.
- PDF: supports AI→PDF embedded extraction and PDF→PNG/JPG with `page` selection (0-based).
- Archives: multi-format extraction via 7-Zip with RAR WebAssembly fallback; repack to ZIP/TGZ.

Current stack: Next.js (API routes) + Sharp + XLSX + pdfkit + html-pdf-node + mammoth + marked + JSZip + tar-stream + zlib + ttf2woff/ttf2woff2/ttf2eot + svg-to-pdfkit + epub-gen + ffmpeg-static + fluent-ffmpeg + 7zip-bin + node-unrar-js.
## What this is
A Next.js app offering local upscaling and a broad, offline file conversion suite (no SaaS APIs).

This scaffold is intentionally simple and production-ready enough to deploy on
Vercel, Render, Hostinger, or any similar host.

## What I provide in this archive
- Next.js app with `pages/` (frontend + API routes)
- `public/styles.css` : custom responsive UI and slider styles
- `package.json`
- `.env.example` : shows required environment variables
- `README.md` : this file with deployment instructions
- `LICENSE` : MIT

## Quick local run (development)
1. Install Node.js (16+ recommended)
2. Install dependencies:
   ```
   npm install
   ```
3. Run:
   ```
   npm run dev
   ```
4. Open http://localhost:3000

Converters quick test:
- Visit `/tools/png-converter` (or any tool page from the navbar/registry), upload a file, choose output format, and download.
- For PDF→image, set “Pagina (PDF)” to pick a specific page (0-based).

## Environment variables
- None required for the converters; everything runs offline.
- Optional: you may add your own services (analytics, auth, storage) as needed.
- `PORT` (optional): dev server port (default 3000)

## How it works (summary)
- Upscale: POST `/api/upscale` processes locally with Sharp and returns a data URL.
- Converters: POST `/api/convert/[target]` with `file` form field and optional params (e.g., `width`, `height`, `quality`, `page`, `vwidth`, `vheight`, `vbitrate`, `abitrate`). Returns `{ name, dataUrl }`.

## Deployment notes
- Vercel/Render/Hostinger: import the repo; no external conversion services are required.
- Ensure the Node runtime supports Sharp; other libraries are pure JS or ship their binaries (ffmpeg-static, 7zip-bin).

## Notes, limitations and tips
- All conversions run offline. Some formats (EPS/PS/AI robust, DJVU/XPS, multi-page PDF raster) may require optional local binaries (Ghostscript/Poppler/djvulibre) if you choose to extend further.
- Limit upload size and validate input types. For heavy workflows consider queues and storage.

## Security
- Validate MIME types and file size.
- Use HTTPS in production.
- Rate-limit endpoints (e.g., express-rate-limit).
- Scan uploaded files for viruses if you expect public uploads (3rd-party services).

## Want me to add:
- Stripe subscription flow (checkout + webhook)
- User accounts (email/password or OAuth)
- Multiple models selector and model-specific params
- Dockerfile for container deployment
- CI/CD script for Hostinger/GitHub Actions

More details in `DEVELOPMENT_NOTES.md`. For history, see `CHANGELOG.md`.
