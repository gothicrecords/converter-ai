import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import XLSX from 'xlsx';
import sharp from 'sharp';
import { performOCR } from '../ocr/ocr.js';

// Parse PDF
export async function parsePDF(buffer) {
  try {
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      pages: data.numpages,
      metadata: data.info,
      version: data.version,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

// Parse DOCX
export async function parseDOCX(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value,
      messages: result.messages,
    };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

// Parse Excel/CSV
export async function parseExcel(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheets = {};
    const tables = [];

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      sheets[sheetName] = jsonData;
      
      // Convert to table format
      if (jsonData.length > 0) {
        tables.push({
          name: sheetName,
          headers: jsonData[0],
          rows: jsonData.slice(1),
          rowCount: jsonData.length - 1,
          columnCount: jsonData[0].length,
        });
      }
    });

    // Generate text representation
    let text = '';
    tables.forEach((table) => {
      text += `\n\n=== ${table.name} ===\n`;
      text += table.headers.join(' | ') + '\n';
      text += table.rows.map(row => row.join(' | ')).join('\n');
    });

    return {
      sheets,
      tables,
      text: text.trim(),
      sheetCount: workbook.SheetNames.length,
    };
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Failed to parse Excel: ${error.message}`);
  }
}

// Parse image (extract text via OCR + metadata)
export async function parseImage(buffer) {
  try {
    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Perform OCR
    const ocrResult = await performOCR(buffer);

    return {
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
      },
      words: ocrResult.words,
    };
  } catch (error) {
    console.error('Image parsing error:', error);
    throw new Error(`Failed to parse image: ${error.message}`);
  }
}

// Parse text file
export function parseTextFile(buffer) {
  try {
    const text = buffer.toString('utf-8');
    
    return {
      text,
      lineCount: text.split('\n').length,
      wordCount: text.split(/\s+/).length,
      charCount: text.length,
    };
  } catch (error) {
    console.error('Text file parsing error:', error);
    throw new Error(`Failed to parse text file: ${error.message}`);
  }
}

// Main file parser (routes to correct parser)
export async function parseFile(buffer, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      return await parsePDF(buffer);
    }
    
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await parseDOCX(buffer);
    }
    
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
      return await parseExcel(buffer);
    }
    
    if (mimeType.startsWith('image/')) {
      return await parseImage(buffer);
    }
    
    if (mimeType.startsWith('text/')) {
      return parseTextFile(buffer);
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('File parsing error:', error);
    throw error;
  }
}

export default {
  parsePDF,
  parseDOCX,
  parseExcel,
  parseImage,
  parseTextFile,
  parseFile,
};
