## v1.1.0 (2025-11-16)

- Migrate upscaling to local Sharp (libvips): faster, reliable, no external API
- Speed/quality heuristics: fast single-pass for large images; two-pass quality for small ones
- Desktop UX: much larger before/after slider, clearer differences; badges “Originale/ Upscalata 2x”
- Mobile UX: responsive polish, touch-friendly controls, viewport meta
- Output: tuned JPEG (mozjpeg), fixed data URL MIME to `image/jpeg`
- Docs: README changelog and updated instructions

## v1.2.0 (2025-11-18)

- Converters: added a unified, offline convert API at `pages/api/convert/[target].js` supporting images (PNG/JPG/WEBP/AVIF/HEIF/TIFF/BMP/GIF), documents (HTML/MD/TXT→PDF, DOCX→HTML/PDF/TXT, PDF→TXT), spreadsheets (CSV↔XLS/XLSX/ODS), archives (ZIP/TAR/GZ/TGZ/7Z, extraction and repack including RAR fallback), fonts (TTF→WOFF/WOFF2/EOT), vectors (SVG→PDF/PNG, SVGZ→SVG), ebooks (EPUB/CBZ/HTMLZ/TXTZ/JAR), and media (audio/video via ffmpeg-static).
- UI: introduced `components/GenericConverter.js` to drive all tool pages with image/video options.
- SEO: tool pages statically generated via `pages/tools/[slug].js` and `lib/conversionRegistry.js` registry.
- PDF: implemented AI→PDF embedded stream extraction; PDF→PNG/JPG rasterization; added `page` parameter for page selection (0-based).
- Archives: multi-format extraction via 7-Zip with RAR WebAssembly fallback, then repack to ZIP/TGZ.
- Hygiene: added `.gitignore` rule for `tmp/`; seeded `.env.local.example`.
