import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { PDFDocument } from 'pdf-lib';

export const config = {
    api: {
        bodyParser: false,
    },
};

async function combinePDFs(filePaths) {
    const mergedPdf = await PDFDocument.create();

    for (const filePath of filePaths) {
        const pdfBytes = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
}

async function splitPDF(filePath, ranges) {
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    // Parse ranges (es: "1-3,5,7-10")
    const pageIndices = new Set();
    
    if (!ranges || ranges.trim() === '') {
        // Se non ci sono ranges, restituisci tutte le pagine
        for (let i = 0; i < totalPages; i++) {
            pageIndices.add(i);
        }
    } else {
        const parts = ranges.split(',').map(s => s.trim());
        
        for (const part of parts) {
            if (part.includes('-')) {
                // Range (es: "1-3")
                const [start, end] = part.split('-').map(n => parseInt(n.trim()));
                if (isNaN(start) || isNaN(end)) continue;
                
                for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
                    pageIndices.add(i - 1); // PDF-lib usa indici 0-based
                }
            } else {
                // Pagina singola
                const pageNum = parseInt(part);
                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                    pageIndices.add(pageNum - 1);
                }
            }
        }
    }

    if (pageIndices.size === 0) {
        throw new Error('Nessuna pagina valida specificata');
    }

    const newPdf = await PDFDocument.create();
    const sortedIndices = Array.from(pageIndices).sort((a, b) => a - b);
    
    const copiedPages = await newPdf.copyPages(pdfDoc, sortedIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    return await newPdf.save();
}

export default async function handler(req, res) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Su Vercel, usa /tmp (unico filesystem scrivibile)
    const tmpDir = process.env.VERCEL ? '/tmp' : os.tmpdir();
    const uploadDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'uploads');
    
    // Su Vercel, /tmp esiste sempre, non serve crearlo
    if (!process.env.VERCEL && !fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        multiples: true,
    });

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    // Gestione specifica degli errori di formidable
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        reject(new Error('File troppo grande. Dimensione massima: 50MB per file'));
                    } else if (err.code === 'LIMIT_FIELD_VALUE') {
                        reject(new Error('Valore del campo troppo grande'));
                    } else if (err.code === 'LIMIT_FIELD_COUNT') {
                        reject(new Error('Troppi campi nel form'));
                    } else if (err.code === 'LIMIT_PART_COUNT') {
                        reject(new Error('Troppe parti nel form'));
                    } else {
                        reject(err);
                    }
                } else {
                    resolve([fields, files]);
                }
            });
        });

        const mode = Array.isArray(fields.mode) ? fields.mode[0] : fields.mode;

        if (mode === 'combine') {
            const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];
            
            if (!uploadedFiles || uploadedFiles.length < 2) {
                return res.status(400).json({ error: 'Carica almeno 2 file PDF' });
            }

            // Valida che tutti i file siano PDF
            for (const file of uploadedFiles) {
                if (!file.mimetype || !file.mimetype.includes('pdf')) {
                    // Cleanup
                    uploadedFiles.forEach(f => {
                        try { fs.unlinkSync(f.filepath); } catch (e) {}
                    });
                    return res.status(400).json({ error: 'Tutti i file devono essere PDF' });
                }
            }

            const filePaths = uploadedFiles.map(f => f.filepath);
            const combinedPdfBytes = await combinePDFs(filePaths);

            // Cleanup uploaded files
            filePaths.forEach(fp => {
                try { fs.unlinkSync(fp); } catch (e) {}
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=combined.pdf');
            return res.status(200).send(Buffer.from(combinedPdfBytes));

        } else if (mode === 'split') {
            const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
            
            if (!uploadedFile) {
                return res.status(400).json({ error: 'Carica un file PDF' });
            }

            // Valida che il file sia un PDF
            if (!uploadedFile.mimetype || !uploadedFile.mimetype.includes('pdf')) {
                try { fs.unlinkSync(uploadedFile.filepath); } catch (e) {}
                return res.status(400).json({ error: 'Il file deve essere un PDF' });
            }

            const ranges = Array.isArray(fields.ranges) ? fields.ranges[0] : fields.ranges;
            const splitPdfBytes = await splitPDF(uploadedFile.filepath, ranges);

            // Cleanup uploaded file
            try { fs.unlinkSync(uploadedFile.filepath); } catch (e) {}

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=split.pdf');
            return res.status(200).send(Buffer.from(splitPdfBytes));

        } else {
            return res.status(400).json({ error: 'Modalità non valida' });
        }

    } catch (error) {
        console.error('Errore elaborazione PDF:', error);
        
        // Pulisci i file temporanei in caso di errore
        try {
            if (req.file) {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            }
        } catch (cleanupError) {
            console.error('Errore durante la pulizia dei file:', cleanupError);
        }

        // Assicurati che la risposta sia sempre JSON
        const errorMessage = error.message || 'Errore durante l\'elaborazione del PDF';
        
        // Se l'errore riguarda la dimensione del file, restituisci 413
        if (errorMessage.includes('troppo grande') || errorMessage.includes('LIMIT_FILE_SIZE')) {
            return res.status(413).json({ 
                error: 'File troppo grande. Dimensione massima: 50MB per file' 
            });
        }
        
        return res.status(500).json({ 
            error: errorMessage
        });
    }
}
