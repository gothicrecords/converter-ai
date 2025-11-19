import { v2 as cloudinary } from 'cloudinary';
import diagnostics from '../../lib/diagnostics.js';
import { handleApiError } from '../../errors/index.js';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const env = {
      CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
      HF_API_TOKEN: !!process.env.HF_API_TOKEN,
    };

    let cloudinaryOk = false;
    let cloudinaryMsg = null;
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      const ping = await cloudinary.api.ping();
      cloudinaryOk = !!ping?.status;
      cloudinaryMsg = ping?.status || 'ok';
    } catch (e) {
      cloudinaryOk = false;
      cloudinaryMsg = e?.message || String(e);
    }

    // Enhanced diagnostics
    const health = await diagnostics.runAllChecks();
    const systemInfo = await diagnostics.getSystemInfo();

    return res.status(200).json({
      env,
      cloudinary: { ok: cloudinaryOk, message: cloudinaryMsg },
      health: {
        overall: health.overall,
        timestamp: health.timestamp,
      },
      system: {
        platform: systemInfo.platform,
        nodeVersion: systemInfo.nodeVersion,
        memory: systemInfo.memory,
      },
    });
  } catch (error) {
    return handleApiError(error, res, {
      endpoint: '/api/diagnostics',
      method: req.method,
    });
  }
}
