// Registry of conversion tool pages for SEO.
// Each entry defines a slug (URL under /tools/), title, description, category, and targetFormat.
// Initially many formats will fallback to placeholder conversion until native implementation is added.

export const conversionTools = [
  // Presentation
  { slug: 'dps-converter', title: 'DPS Converter', category: 'Presentation', targetFormat: 'dps', description: 'Convert DPS presentation files to and from PPTX, PPT, PDF easily online.' },
  { slug: 'key-converter', title: 'KEY Converter', category: 'Presentation', targetFormat: 'key', description: 'Convert Apple Keynote KEY files to PPTX or PDF preserving layout.' },
  { slug: 'odp-converter', title: 'ODP Converter', category: 'Presentation', targetFormat: 'odp', description: 'Transform OpenDocument presentations (ODP) into PPTX, PDF and vice versa.' },
  { slug: 'pot-converter', title: 'POT Converter', category: 'Presentation', targetFormat: 'pot', description: 'Convert legacy PowerPoint template POT files to modern PPTX or PDF.' },
  { slug: 'potx-converter', title: 'POTX Converter', category: 'Presentation', targetFormat: 'potx', description: 'Convert POTX templates to PPTX presentations or PDF handouts.' },
  { slug: 'pps-converter', title: 'PPS Converter', category: 'Presentation', targetFormat: 'pps', description: 'Convert PPS show files to editable PPTX or PDF.' },
  { slug: 'ppsx-converter', title: 'PPSX Converter', category: 'Presentation', targetFormat: 'ppsx', description: 'Convert PPSX slide shows to PPTX or PDF quickly.' },
  { slug: 'ppt-converter', title: 'PPT Converter', category: 'Presentation', targetFormat: 'ppt', description: 'Convert legacy PPT files to PPTX or PDF retaining content.' },
  { slug: 'pptm-converter', title: 'PPTM Converter', category: 'Presentation', targetFormat: 'pptm', description: 'Convert PPTM macro-enabled presentations to PPTX or PDF (macros excluded).' },
  { slug: 'pptx-converter', title: 'PPTX Converter', category: 'Presentation', targetFormat: 'pptx', description: 'Convert PPTX presentations to PDF, or other formats (initial support: PDF).' },

  // Spreadsheet
  { slug: 'csv-converter', title: 'CSV Converter', category: 'Spreadsheet', targetFormat: 'csv', description: 'Convert CSV data to XLSX or PDF tables and back.' },
  { slug: 'et-converter', title: 'ET Converter', category: 'Spreadsheet', targetFormat: 'et', description: 'Convert Kingsoft ET spreadsheet files to XLSX or PDF.' },
  { slug: 'numbers-converter', title: 'NUMBERS Converter', category: 'Spreadsheet', targetFormat: 'numbers', description: 'Convert Apple Numbers documents to XLSX or PDF.' },
  { slug: 'ods-converter', title: 'ODS Converter', category: 'Spreadsheet', targetFormat: 'ods', description: 'Convert OpenDocument spreadsheets (ODS) to XLSX or PDF.' },
  { slug: 'xls-converter', title: 'XLS Converter', category: 'Spreadsheet', targetFormat: 'xls', description: 'Convert legacy Excel XLS files to modern XLSX or PDF.' },
  { slug: 'xlsm-converter', title: 'XLSM Converter', category: 'Spreadsheet', targetFormat: 'xlsm', description: 'Convert XLSM macro-enabled workbooks to XLSX or PDF (macros excluded).' },
  { slug: 'xlsx-converter', title: 'XLSX Converter', category: 'Spreadsheet', targetFormat: 'xlsx', description: 'Convert XLSX spreadsheets to PDF or CSV (initial support: PDF, CSV).' },

  // Image (subset initially supported; raw formats placeholder)
  { slug: 'png-converter', title: 'PNG Converter', category: 'Image', targetFormat: 'png', description: 'Convert images to optimized PNG or from PNG to JPG, WEBP.' },
  { slug: 'jpg-converter', title: 'JPG Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert images to JPG with adjustable quality.' },
  { slug: 'jpeg-converter', title: 'JPEG Converter', category: 'Image', targetFormat: 'jpeg', description: 'Convert images to JPEG format controlling quality and size.' },
  { slug: 'webp-converter', title: 'WEBP Converter', category: 'Image', targetFormat: 'webp', description: 'Convert images to modern WEBP format for web optimization.' },
  { slug: 'gif-converter', title: 'GIF Converter', category: 'Image', targetFormat: 'gif', description: 'Convert static images to GIF (animated support roadmapped).' },
  { slug: 'heic-converter', title: 'HEIC Converter', category: 'Image', targetFormat: 'heic', description: 'Convert HEIC photos to JPG or PNG (placeholder until native decoder added).' },
  { slug: 'tiff-converter', title: 'TIFF Converter', category: 'Image', targetFormat: 'tiff', description: 'Convert high-quality TIFF images to PNG, JPG or PDF.' },
  { slug: 'bmp-converter', title: 'BMP Converter', category: 'Image', targetFormat: 'bmp', description: 'Convert BMP images to compressed PNG or JPG.' },
  { slug: 'raw-converter', title: 'RAW Converter', category: 'Image', targetFormat: 'raw', description: 'Convert camera RAW formats to JPG or PNG (placeholder).' },

  // Vector
  { slug: 'svg-converter', title: 'SVG Converter', category: 'Vector', targetFormat: 'svg', description: 'Convert SVG vector graphics to PNG or PDF.' },
  { slug: 'pdf-vector-converter', title: 'PDF Vector Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert PDF (vector) pages to SVG or PNG thumbnails.' },
  { slug: 'eps-converter', title: 'EPS Converter', category: 'Vector', targetFormat: 'eps', description: 'Convert EPS to PDF or PNG (placeholder without Ghostscript).' },

  // Video (initial support limited to container remux via ffmpeg if available)
  { slug: 'mp4-converter', title: 'MP4 Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert videos to MP4 (H.264/AAC) with adjustable resolution (placeholder).' },
  { slug: 'webm-converter', title: 'WEBM Converter', category: 'Video', targetFormat: 'webm', description: 'Convert videos to WEBM (VP9/Opus) (placeholder).' },
  { slug: 'avi-converter', title: 'AVI Converter', category: 'Video', targetFormat: 'avi', description: 'Convert videos to legacy AVI format (placeholder).' },

  // Archive (initial: zip create/extract)
  { slug: 'zip-converter', title: 'ZIP Converter', category: 'Archive', targetFormat: 'zip', description: 'Create ZIP archives from files or extract ZIP contents.' },
  { slug: 'tar-converter', title: 'TAR Converter', category: 'Archive', targetFormat: 'tar', description: 'Create TAR archives or extract existing TAR files.' },
  { slug: 'gz-converter', title: 'GZ Converter', category: 'Archive', targetFormat: 'gz', description: 'Compress files to .tar.gz or decompress existing .gz archive.' },
  { slug: '7z-converter', title: '7Z Converter', category: 'Archive', targetFormat: '7z', description: 'Create or extract 7Z archives (placeholder without native library).' },

  // Audio (initial conversion using ffmpeg if available, else placeholder)
  { slug: 'mp3-converter', title: 'MP3 Converter', category: 'Audio', targetFormat: 'mp3', description: 'Convert audio to MP3 with configurable bitrate (placeholder).' },
  { slug: 'wav-converter', title: 'WAV Converter', category: 'Audio', targetFormat: 'wav', description: 'Convert audio to lossless WAV format.' },
  { slug: 'm4a-converter', title: 'M4A Converter', category: 'Audio', targetFormat: 'm4a', description: 'Convert audio to M4A (AAC) (placeholder).' },
  { slug: 'flac-converter', title: 'FLAC Converter', category: 'Audio', targetFormat: 'flac', description: 'Convert audio to lossless FLAC (placeholder).' },

  // Document (initial: pdf/docx/txt/md/html conversions partly implemented)
  { slug: 'pdf-converter', title: 'PDF Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert documents to PDF (presentations, spreadsheets, text).' },
  { slug: 'docx-converter', title: 'DOCX Converter', category: 'Document', targetFormat: 'docx', description: 'Convert documents to DOCX (initial: PDF->DOCX placeholder).' },
  { slug: 'txt-converter', title: 'TXT Converter', category: 'Document', targetFormat: 'txt', description: 'Convert documents to plain TXT (extract text layers).' },
  { slug: 'md-converter', title: 'MD Converter', category: 'Document', targetFormat: 'md', description: 'Convert documents or HTML to Markdown (basic heuristics).' },
  { slug: 'html-converter', title: 'HTML Converter', category: 'Document', targetFormat: 'html', description: 'Convert Markdown or text to HTML (basic template).' },

  // Ebook (initial placeholders)
  { slug: 'epub-converter', title: 'EPUB Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert documents to EPUB ebook format (placeholder builder).' },
  { slug: 'mobi-converter', title: 'MOBI Converter', category: 'Ebook', targetFormat: 'mobi', description: 'Convert EPUB to MOBI (placeholder).' },
  { slug: 'cbz-converter', title: 'CBZ Converter', category: 'Ebook', targetFormat: 'cbz', description: 'Create comic book CBZ archive from images.' },

  // Font (initial: ttf/otf -> woff/woff2 if library available)
  { slug: 'ttf-converter', title: 'TTF Converter', category: 'Font', targetFormat: 'ttf', description: 'Convert fonts to TTF or from TTF to WOFF/WOFF2.' },
  { slug: 'otf-converter', title: 'OTF Converter', category: 'Font', targetFormat: 'otf', description: 'Convert OTF fonts to TTF or WOFF (placeholder).' },
  { slug: 'woff-converter', title: 'WOFF Converter', category: 'Font', targetFormat: 'woff', description: 'Convert fonts to web-optimized WOFF format.' },
  { slug: 'woff2-converter', title: 'WOFF2 Converter', category: 'Font', targetFormat: 'woff2', description: 'Convert fonts to modern compressed WOFF2 format.' }
];

export function getConversionTool(slug) {
  return conversionTools.find(t => t.slug === slug);
}

export function listConversionSlugs() {
  return conversionTools.map(t => t.slug);
}
