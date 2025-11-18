# Development Notes – Converters Suite (Offline)

These notes summarize the recent architecture and how to extend it quickly.

## Overview
- Unified conversion API: `pages/api/convert/[target].js`
  - Handles many formats entirely offline: images (PNG/JPG/WEBP/AVIF/HEIF/TIFF/BMP/GIF), documents (HTML/MD/TXT→PDF, DOCX→HTML/PDF/TXT, PDF→TXT), spreadsheets (CSV↔XLS/XLSX/ODS), archives (ZIP/TAR/GZ/TGZ/7Z, extraction + repack inc. RAR fallback), fonts (TTF→WOFF/WOFF2/EOT), vectors (SVG→PDF/PNG, SVGZ→SVG), ebooks (EPUB/CBZ/HTMLZ/TXTZ/JAR), and media (audio/video via ffmpeg-static).
  - Always returns `{ name, dataUrl }` where `dataUrl` is a base64 data URL of the result.
  - Graceful fallback: if a conversion path isn’t supported, returns the original buffer with the requested extension, so the UI never fails hard.

- Generic UI: `components/GenericConverter.js`
  - Single upload component reused across tool pages.
  - Supports image options (`width`, `height`, `quality`), video options (`vwidth`, `vheight`, `vbitrate`, `abitrate`), and PDF page selection (`page`, 0-based).

- SEO routing: `pages/tools/[slug].js` + registry `lib/conversionRegistry.js`
  - All tool pages are statically generated from the registry for good SEO.
  - Each registry entry defines slug, title, description, category, and default `targetFormat`.

## Key Files
- `pages/api/convert/[target].js` – core conversion logic
- `components/GenericConverter.js` – shared converter UI
- `pages/tools/[slug].js` – dynamic tool page that uses the registry
- `lib/conversionRegistry.js` – list of tool pages + metadata
- `CHANGELOG.md` – high-level history; see v1.2.0 for this work

## Adding a New Converter
1. Add a registry entry in `lib/conversionRegistry.js` with:
   - `slug` (URL path under `/tools/`), `title`, `description` (SEO), `category`, `targetFormat`.
2. If the target is already supported by `[target].js`, no backend changes required.
3. If it isn’t supported yet:
   - Implement a new branch inside `pages/api/convert/[target].js` using native libraries only.
   - Return a `Buffer` and set an appropriate `mime` string.
   - Let the endpoint fall through to the “forced extension” fallback only as a last resort.
4. UI options: if you need new fields, add inputs in `components/GenericConverter.js` and append them to the `FormData` in `handleConvert`.

## Supported Conversions (Summary)
- Images: → `png`, `jpg/jpeg`, `webp`, `avif`, `heif`, `tiff`, `bmp`, `gif`
- PDF: HTML/MD/TXT/IMG → `pdf`; AI (embedded) → `pdf` extraction
- PDF → image: `pdf` → `png/jpg` with `page` (0-based) using `sharp { density, page }`
- Text: `pdf` → `txt`; `docx` → `html/pdf/txt`; passthrough for others
- Spreadsheets: `xlsx/xls/ods` ↔ `csv`, `csv/txt/ods/xls` → `xlsx`
- Archives: create `zip/tar/gz/tgz/7z`; extract `7z/rar/tar/gz/tgz/zip/bz2/xz` and repack to `zip` or `tgz`
- Fonts: `ttf` → `woff/woff2/eot`
- Vectors: `svg` → `pdf/png`; `svgz` → `svg`
- Ebooks: `html/md/txt` → `epub`; `cbz/htmlz/txtz/jar` (zip-based packages)
- Media: audio/video transcodes to `mp3/wav/m4a/flac/ogg/weba/aac` and `mp4/webm/avi/mkv/mov/flv`

## Local Binaries and Offline Constraint
- Uses `ffmpeg-static` (bundled binary) and `7zip-bin` (bundled 7-Zip) where needed.
- RAR extraction fallback via `node-unrar-js` (WebAssembly) for purely offline behavior.
- No external SaaS APIs are required for conversions.

## How to Test Locally
1. Install deps and run dev server:
   - `npm install`
   - `npm run dev`
2. Open a tool page like `/tools/png-converter` and try uploading a sample.
3. For PDF→image, set “Pagina (PDF)” to pick a specific page (0-based).

## Known Limitations / Next Steps
- Advanced vector and print workflows (EPS/PS/AI robust) typically require Ghostscript/Poppler.
- Multi-page PDF rasterization beyond single page would benefit from Poppler or ImageMagick.
- DJVU/XPS → PDF may require local binaries (djvulibre/poppler).
If desired, we can integrate these as optional, locally-installed tools with Windows-friendly setup.

## Windows Notes
- This repo targets Windows development with PowerShell. `ffmpeg-static` and `7zip-bin` work out of the box.
- No Docker is required. `.env.local` is optional; see `README.md` for details.
