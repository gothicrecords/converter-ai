import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
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
        maxFileSize: 100 * 1024 * 1024, // 100MB
    });

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
        const noiseLevel = Array.isArray(fields.noiseLevel) ? fields.noiseLevel[0] : fields.noiseLevel;

        if (!audioFile) {
            return res.status(400).json({ error: 'Nessun file audio caricato' });
        }

        console.log('Elaborazione audio con livello rumore:', noiseLevel);

        // PLACEHOLDER: In produzione, qui andresti ad usare una libreria come:
        // - ffmpeg con filtri audio (afftdn, anlmdn)
        // - API esterne specializzate (Adobe Podcast AI, Krisp, etc.)
        // - Modelli AI come Demucs, Spleeter, etc.
        
        // Per ora restituiamo l'audio originale
        const fileContent = fs.readFileSync(audioFile.filepath);
        
        // Cleanup
        try {
            fs.unlinkSync(audioFile.filepath);
        } catch (e) {
            console.error('Errore cleanup:', e);
        }

        // Determina il tipo MIME corretto
        let mimeType = audioFile.mimetype || 'audio/mpeg';
        const ext = path.extname(audioFile.originalFilename).toLowerCase();
        
        const mimeMap = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.flac': 'audio/flac',
            '.aac': 'audio/aac'
        };
        
        if (mimeMap[ext]) {
            mimeType = mimeMap[ext];
        }

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename=cleaned_${audioFile.originalFilename}`);
        res.status(200).send(fileContent);

    } catch (error) {
        console.error('Errore API Clean Noise:', error);
        res.status(500).json({ 
            error: 'Errore durante l\'elaborazione dell\'audio. Riprova con un file diverso.' 
        });
    }
}
