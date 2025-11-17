import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
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
        maxFileSize: 50 * 1024 * 1024, // 50MB
        multiples: true,
    });

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const mode = Array.isArray(fields.mode) ? fields.mode[0] : fields.mode;

        if (mode === 'combine') {
            const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files];
            
            if (!uploadedFiles || uploadedFiles.length < 2) {
                return res.status(400).json({ error: 'Carica almeno 2 file PDF' });
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
        return res.status(500).json({ 
            error: error.message || 'Errore durante l\'elaborazione del PDF' 
        });
    }
}
