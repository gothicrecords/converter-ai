# Upscaler AI - Full Project Scaffold
## What this is
A complete minimal web app (frontend + Node.js backend) that accepts image uploads and
sends them to the HuggingFace Inference API (Real-ESRGAN) to perform upscaling, then
returns the upscaled image to the user.

This scaffold is intentionally simple and production-ready enough to deploy on
Hostinger (Node.js hosting), Vercel, Render, or any similar host.

## What I provide in this archive
- `server.js` : Express backend handling upload and forwarding to HuggingFace
- `public/index.html`, `public/styles.css`, `public/client.js` : frontend with drag&drop
- `package.json`
- `.env.example` : shows required environment variables
- `README.md` : this file with deployment instructions
- `LICENSE` : MIT

## Quick local run (development)
1. Install Node.js (16+ recommended)
2. Copy `.env.example` -> `.env` and fill `HF_API_TOKEN`
3. Install dependencies:
   ```
   npm install
   ```
4. Run:
   ```
   npm start
   ```
5. Open http://localhost:3000

## Environment variables
- `HF_API_TOKEN` : Your HuggingFace API token (get it at https://huggingface.co/settings/tokens)
- `PORT` (optional) : port to run on (default 3000)

## How it works (summary)
- The frontend sends the image file via POST `/api/upscale`.
- `server.js` receives the file, creates a `FormData` POST to the HF Inference API model endpoint,
  receives the response (image bytes) and streams them back to the client.
- The client displays the returned image and allows download.

## Hostinger (Node.js) deployment notes
1. Zip the project and upload via Hostinger file manager OR push via Git if Hostinger Git deploy is enabled.
2. In the Hostinger control panel, create an "Node.js" app and set:
   - Start script: `node server.js`
   - Environment variables: add `HF_API_TOKEN` with your HuggingFace token
3. Install dependencies on Hostinger (SSH into the host or use the control panel console):
   ```
   npm install
   ```
4. Start the app via Hostinger's "Start" button or process manager.
5. Make sure port mapping is configured (Hostinger usually maps external port to your app automatically) and domain points to the hosting.

## Notes, limitations and tips
- HuggingFace free tier has rate limits and model cold-start latency. For production, consider:
  - Upgrading HF plan for higher throughput
  - Caching results (e.g., for identical images / hashes)
  - Limiting upload size and validating file types
- Protect your HF API key: never embed it in frontend code. Use server-side calls only.
- Consider background jobs for very slow models: queue uploads and notify users when ready.
- For monetization: integrate Stripe on the server, create authenticated endpoints, and enforce quotas.
- For scaling: add a storage layer (S3), CDN, and queue/router (BullMQ / Redis).

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
