import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import ffmpegStatic from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 500 * 1024 * 1024, // 500MB
    });

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const videoFile = Array.isArray(files.video) ? files.video[0] : files.video;
        const quality = Array.isArray(fields.quality) ? fields.quality[0] : fields.quality || 'medium';

        if (!videoFile) {
            return res.status(400).json({ error: 'Nessun file video caricato' });
        }

        // Configurazione bitrate in base alla qualità
        const qualitySettings = {
            low: { videoBitrate: '500k', audioBitrate: '64k' },
            medium: { videoBitrate: '1000k', audioBitrate: '128k' },
            high: { videoBitrate: '2000k', audioBitrate: '192k' },
        };

        const settings = qualitySettings[quality] || qualitySettings.medium;

        // Configura ffmpeg
        ffmpeg.setFfmpegPath(ffmpegStatic);

        const inputPath = videoFile.filepath;
        const outputPath = path.join(
            path.dirname(inputPath),
            `compressed_${Date.now()}.mp4`
        );

        // Esegui compressione
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .videoBitrate(settings.videoBitrate)
                .audioBitrate(settings.audioBitrate)
                .outputOptions([
                    '-movflags faststart',
                    '-preset medium',
                    '-crf 23'
                ])
                .output(outputPath)
                .on('end', () => {
                    console.log('Compressione completata');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Errore ffmpeg:', err);
                    reject(err);
                })
                .on('progress', (progress) => {
                    console.log('Progress:', progress.percent + '%');
                })
                .run();
        });

        // Leggi il file compresso
        const compressedBuffer = fs.readFileSync(outputPath);

        // Cleanup
        try {
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        } catch (e) {
            console.error('Errore cleanup:', e);
        }

        // Determina il tipo MIME
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Disposition', `attachment; filename=compressed_${videoFile.originalFilename || 'video.mp4'}`);
        res.status(200).send(compressedBuffer);

    } catch (error) {
        console.error('Errore API Compressione Video:', error);
        res.status(500).json({ 
            error: error.message || 'Errore durante la compressione del video. Riprova con un file diverso.' 
        });
    }
}
