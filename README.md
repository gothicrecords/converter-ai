# Upscaler AI - Full Project Scaffold

## Changelog (2025-11-16)
- Migrated upscaling to local Sharp (libvips) processing: no external HF API.
- Quality/speed heuristics: fast single-pass for large images, two-pass detail for small ones.
- Output JPEG tuned (mozjpeg) with correct `image/jpeg` data URL MIME.
- Desktop viewing improved: larger container and slider for clearer differences.
- Slider labels added (Originale / Upscalata 2x) to avoid confusion.
- Mobile UX refined: responsive layout, touch-friendly controls, viewport meta.

Current stack: Next.js (API routes) + Sharp; optional Cloudinary hosting fallback.
## What this is
A minimal web app (Next.js frontend + API route) that accepts image uploads and
performs fast, high-quality 2x upscaling locally via Sharp (libvips), then returns
the upscaled image to the user (optionally hosted on Cloudinary).

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
2. (Optional) Configure Cloudinary env vars if you want hosted URLs:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Install dependencies:
   ```
   npm install
   ```
4. Run:
   ```
   npm run dev
   ```
5. Open http://localhost:3000

## Environment variables
- Cloudinary (optional): see above
- `PORT` (optional): dev server port (default 3000)

## How it works (summary)
- The frontend sends the image file via POST `/api/upscale`.
- The Next.js API route parses upload, processes locally with Sharp (2x upscale),
  and returns either a Cloudinary URL or a `data:image/jpeg;base64,...` URL.
- The client displays a before/after slider with labels and provides download/full-res link.

## Deployment notes
- Vercel: import repo, ensure Sharp works on default Node runtime. Add Cloudinary env vars if needed.
- Other hosts: run `npm run dev` for development or configure a production build as desired.

## Notes, limitations and tips
- Local Sharp upscaling is fast and reliable; quality tuned for natural look.
- Limit upload size and validate image MIME types.
- For scaling: add storage (S3), CDN, queuing if you add heavier processing.

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

Reply in chat which extras you want and I'll extend the project.
