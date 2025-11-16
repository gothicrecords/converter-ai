// Simple Express backend to proxy uploads to HuggingFace Inference API
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import upscaleImage from "./utils/upscale.js";
import { v2 as cloudinary } from 'cloudinary';

// configure cloudinary from env (dotenv already loaded above)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

const HF_API_TOKEN = process.env.HF_API_TOKEN;
if (!HF_API_TOKEN) {
  console.error("Missing HF_API_TOKEN in environment");
}

app.use(express.static(path.join(__dirname, "public")));

// Basic health check
app.get("/ping", (req, res) => res.json({ ok: true }));

app.post("/api/upscale-hf", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Missing file" });

    // Basic MIME check
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Forward to HuggingFace Inference API (example using Real-ESRGAN)
    const model = "ai-forever/Real-ESRGAN"; // change if you prefer a different HF model
    const hfUrl = `https://api-inference.huggingface.co/models/${model}`;

    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const hfRes = await fetch(hfUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`
      },
      body: form
    });

    if (!hfRes.ok) {
      const txt = await hfRes.text();
      console.error("HuggingFace error:", hfRes.status, txt);
      return res.status(502).json({ error: "Upscale API error", details: txt });
    }

    const arrayBuffer = await hfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optional: cache to disk for short time to serve URL instead of streaming each time
    const id = uuidv4();
    const outPath = path.join(__dirname, "public", "cache");
    if (!fs.existsSync(outPath)) fs.mkdirSync(outPath, { recursive: true });
    const filename = `${id}.png`;
    fs.writeFileSync(path.join(outPath, filename), buffer);

    // Return JSON with URL to cached image
    const fullUrl = `/cache/${filename}`;
    res.json({ url: fullUrl });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve cached images
app.use("/cache", express.static(path.join(__dirname, "public", "cache")));

// Cloudinary upscale endpoint (primary)
app.post("/api/upscale", upload.single("image"), async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non permesso' });
  }

  try {
    // Ricevi il buffer dal file
    if (!req.file) {
      return res.status(400).json({ error: 'Nessuna immagine ricevuta' });
    }

    const fileBuffer = req.file.buffer;

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ error: 'Nessuna immagine ricevuta' });
    }

    // Usa Upscayl (o altro) per upscale
    const upscaledUrl = await upscaleImage(fileBuffer);

    // Scarica l'immagine upscalata
    const fetchRes = await fetch(upscaledUrl);
    if (!fetchRes.ok) {
      const txt = await fetchRes.text();
      console.error('Error fetching upscaled image:', fetchRes.status, txt);
      return res.status(502).json({ error: 'Failed to download upscaled image', details: txt });
    }

    const contentType = fetchRes.headers.get('content-type') || 'image/png';
    const arrayBuffer = await fetchRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, { folder: 'upscaler-ai' });

    // Return Cloudinary URL
    res.status(200).json({ url: uploadResult.secure_url });

  } catch (error) {
    console.error('Errore API upscale:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
