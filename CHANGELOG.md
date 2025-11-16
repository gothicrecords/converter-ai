## v1.1.0 (2025-11-16)

- Migrate upscaling to local Sharp (libvips): faster, reliable, no external API
- Speed/quality heuristics: fast single-pass for large images; two-pass quality for small ones
- Desktop UX: much larger before/after slider, clearer differences; badges “Originale/ Upscalata 2x”
- Mobile UX: responsive polish, touch-friendly controls, viewport meta
- Output: tuned JPEG (mozjpeg), fixed data URL MIME to `image/jpeg`
- Docs: README changelog and updated instructions
