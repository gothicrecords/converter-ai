// TODO: Install dependencies: npm install tesseract.js sharp
// import Tesseract from 'tesseract.js';
// import sharp from 'sharp';

// Perform OCR on an image
export async function performOCR(imageBuffer, language = 'eng+ita') {
  throw new Error('OCR service not configured. Install tesseract.js to enable.');
  /* TODO: Enable when dependencies are installed
  try {
    const result = await Tesseract.recognize(imageBuffer, language, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words.map(w => ({
        text: w.text,
        confidence: w.confidence,
        bbox: w.bbox,
      })),
      blocks: result.data.blocks.map(b => ({
        text: b.text,
        confidence: b.confidence,
        bbox: b.bbox,
      })),
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`OCR failed: ${error.message}`);
  }
  */
}

// Preprocess image for better OCR
export async function preprocessImageForOCR(imageBuffer) {
  return imageBuffer; // Return original until sharp is installed
  /* TODO: Enable when sharp is installed
  try {
    const processed = await sharp(imageBuffer)
      .greyscale()
      .normalize()
      .sharpen()
      .toBuffer();

    return processed;
  } catch (error) {
    console.error('Image preprocessing error:', error);
    return imageBuffer; // Return original if preprocessing fails
  }
  */
}

// Extract text from PDF pages (requires pdf-parse + images)
export async function extractTextFromPDFImage(pageImageBuffer) {
  const preprocessed = await preprocessImageForOCR(pageImageBuffer);
  const result = await performOCR(preprocessed);
  return result.text;
}

export default {
  performOCR,
  preprocessImageForOCR,
  extractTextFromPDFImage,
};
