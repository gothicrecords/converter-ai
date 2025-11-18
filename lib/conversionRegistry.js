// Registry of conversion tool pages for SEO.
// Each entry defines a slug (URL under /tools/), title, description, category, and targetFormat.
// Initially many formats will fallback to placeholder conversion until native implementation is added.

export const conversionTools = [
    // Full Image list from request (slugs normalized)
    { slug: '3fr-converter', title: '3FR Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Hasselblad 3FR RAW images to JPG/PNG.' },
    { slug: 'arw-converter', title: 'ARW Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Sony ARW RAW images to JPG/PNG.' },
    { slug: 'avif-converter', title: 'AVIF Converter', category: 'Image', targetFormat: 'avif', description: 'Convert images to AVIF or from AVIF to JPG/PNG (if supported by sharp).' },
    { slug: 'cr2-converter', title: 'CR2 Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Canon CR2 RAW images to JPG/PNG.' },
    { slug: 'cr3-converter', title: 'CR3 Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Canon CR3 RAW images to JPG/PNG.' },
    { slug: 'crw-converter', title: 'CRW Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Canon CRW RAW images to JPG/PNG.' },
    { slug: 'dcr-converter', title: 'DCR Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Kodak DCR RAW images to JPG/PNG.' },
    { slug: 'dng-converter', title: 'DNG Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Adobe DNG RAW images to JPG/PNG.' },
    { slug: 'eps-converter', title: 'EPS Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert EPS to PDF/PNG (PDF rasterization supported; EPS placeholder).' },
    { slug: 'erf-converter', title: 'ERF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Epson ERF RAW images to JPG/PNG.' },
    { slug: 'heif-converter', title: 'HEIF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert HEIF to JPG/PNG (support depends on libvips build).' },
    { slug: 'icns-converter', title: 'ICNS Converter', category: 'Image', targetFormat: 'png', description: 'Convert Apple ICNS icons to PNG.' },
    { slug: 'ico-converter', title: 'ICO Converter', category: 'Image', targetFormat: 'png', description: 'Convert Windows ICO icons to PNG.' },
    { slug: 'jfif-converter', title: 'JFIF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert JFIF images to JPG/PNG.' },
    { slug: 'mos-converter', title: 'MOS Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Leaf MOS RAW images to JPG/PNG.' },
    { slug: 'mrw-converter', title: 'MRW Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Minolta MRW RAW images to JPG/PNG.' },
    { slug: 'nef-converter', title: 'NEF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Nikon NEF RAW images to JPG/PNG.' },
    { slug: 'odd-converter', title: 'ODD Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert ODD (OpenDocument Drawing Template) to PDF/PNG (placeholder).' },
    { slug: 'odg-converter', title: 'ODG Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert ODG drawings to PDF/PNG (placeholder).' },
    { slug: 'orf-converter', title: 'ORF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Olympus ORF RAW images to JPG/PNG.' },
    { slug: 'pef-converter', title: 'PEF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Pentax PEF RAW images to JPG/PNG.' },
    { slug: 'ppm-converter', title: 'PPM Converter', category: 'Image', targetFormat: 'png', description: 'Convert PPM images to PNG/JPG.' },
    { slug: 'ps-converter', title: 'PS Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert PostScript PS to PDF/PNG (placeholder without Ghostscript).' },
    { slug: 'psd-converter', title: 'PSD Converter', category: 'Image', targetFormat: 'png', description: 'Convert Adobe PSD to PNG/JPG (flatten).'},
    { slug: 'pub-converter', title: 'PUB Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert Microsoft Publisher PUB to PDF (placeholder).'},
    { slug: 'raf-converter', title: 'RAF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Fuji RAF RAW to JPG/PNG.'},
    { slug: 'raw-converter', title: 'RAW Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert various RAW formats to JPG/PNG (best-effort).'},
    { slug: 'rw2-converter', title: 'RW2 Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Panasonic RW2 RAW to JPG/PNG.'},
    { slug: 'tif-converter', title: 'TIF Converter', category: 'Image', targetFormat: 'tiff', description: 'Convert TIF/TIFF images to PNG/JPG or viceversa.' },
    { slug: 'x3f-converter', title: 'X3F Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Sigma X3F RAW to JPG/PNG.' },
    { slug: 'xcf-converter', title: 'XCF Converter', category: 'Image', targetFormat: 'png', description: 'Convert GIMP XCF to PNG/JPG (flatten).'},
    { slug: 'xps-converter', title: 'XPS Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert XPS documents to PDF (placeholder).'},

    // Vector additions
    { slug: 'ai-converter', title: 'AI Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert Adobe Illustrator AI to PDF/PNG (placeholder without GS).'},
    { slug: 'cdr-converter', title: 'CDR Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert CorelDRAW CDR to PDF/PNG (placeholder).'},
    { slug: 'cgm-converter', title: 'CGM Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert CGM to PDF/PNG (placeholder).'},
    { slug: 'emf-converter', title: 'EMF Converter', category: 'Vector', targetFormat: 'png', description: 'Convert EMF to PNG/PDF (placeholder).'},
    { slug: 'sk-converter', title: 'SK Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert SK to PDF/PNG (placeholder).'},
    { slug: 'sk1-converter', title: 'SK1 Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert SK1 to PDF/PNG (placeholder).'},
    { slug: 'svgz-converter', title: 'SVGZ Converter', category: 'Vector', targetFormat: 'svg', description: 'Convert SVGZ (compressed SVG) to SVG/PNG.'},
    { slug: 'vsd-converter', title: 'VSD Converter', category: 'Vector', targetFormat: 'pdf', description: 'Convert Visio VSD to PDF/PNG (placeholder).'},
    { slug: 'wmf-converter', title: 'WMF Converter', category: 'Vector', targetFormat: 'png', description: 'Convert WMF to PNG/PDF (placeholder).'},

    // Video list (map to common targets)
    { slug: '3g2-converter', title: '3G2 Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert 3G2 videos to MP4 or WEBM.'},
    { slug: '3gp-converter', title: '3GP Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert 3GP videos to MP4 or WEBM.'},
    { slug: '3gpp-converter', title: '3GPP Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert 3GPP videos to MP4 or WEBM.'},
    { slug: 'cavs-converter', title: 'CAVS Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert CAVS to MP4 (best-effort).'},
    { slug: 'dv-converter', title: 'DV Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert DV to MP4.'},
    { slug: 'dvr-converter', title: 'DVR Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert DVR MS to MP4 (best-effort).'},
    { slug: 'flv-converter', title: 'FLV Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert FLV to MP4 or WEBM.'},
    { slug: 'm2ts-converter', title: 'M2TS Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert M2TS to MP4.'},
    { slug: 'm4v-converter', title: 'M4V Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert M4V to MP4.'},
    { slug: 'mkv-converter', title: 'MKV Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert MKV to MP4 or WEBM.'},
    { slug: 'mod-converter', title: 'MOD Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert MOD to MP4 (best-effort).'},
    { slug: 'mov-converter', title: 'MOV Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert MOV to MP4 or WEBM.'},
    { slug: 'mpeg-converter', title: 'MPEG Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert MPEG to MP4.'},
    { slug: 'mpg-converter', title: 'MPG Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert MPG to MP4.'},
    { slug: 'mts-converter', title: 'MTS Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert MTS to MP4.'},
    { slug: 'mxf-converter', title: 'MXF Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert MXF to MP4 (best-effort).'},
    { slug: 'ogg-converter', title: 'OGG Converter', category: 'Video', targetFormat: 'webm', description: 'Convert OGG videos to WEBM (or audio OGG to OGG).'},
    { slug: 'rm-converter', title: 'RM Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert RealMedia RM to MP4 (best-effort).'},
    { slug: 'rmvb-converter', title: 'RMVB Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert RMVB to MP4 (best-effort).'},
    { slug: 'swf-converter', title: 'SWF Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert SWF to MP4 (best-effort).'},
    { slug: 'ts-converter', title: 'TS Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert TS transport streams to MP4.'},
    { slug: 'vob-converter', title: 'VOB Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert VOB (DVD) to MP4.'},
    { slug: 'wmv-converter', title: 'WMV Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert WMV to MP4.'},
    { slug: 'wtv-converter', title: 'WTV Converter', category: 'Video', targetFormat: 'mp4', description: 'Convert WTV to MP4 (best-effort).'},

    // Archive list (creation-focused)
    { slug: '7z-converter', title: '7Z Converter', category: 'Archive', targetFormat: '7z', description: 'Create 7z archive (placeholder).' },
    { slug: 'ace-converter', title: 'ACE Converter', category: 'Archive', targetFormat: 'ace', description: 'ACE archive conversion (placeholder).' },
    { slug: 'alz-converter', title: 'ALZ Converter', category: 'Archive', targetFormat: 'alz', description: 'ALZ archive conversion (placeholder).' },
    { slug: 'arc-converter', title: 'ARC Converter', category: 'Archive', targetFormat: 'arc', description: 'ARC archive conversion (placeholder).' },
    { slug: 'arj-converter', title: 'ARJ Converter', category: 'Archive', targetFormat: 'arj', description: 'ARJ archive conversion (placeholder).' },
    { slug: 'bz-converter', title: 'BZ Converter', category: 'Archive', targetFormat: 'bz', description: 'Bzip compression (placeholder).' },
    { slug: 'bz2-converter', title: 'BZ2 Converter', category: 'Archive', targetFormat: 'bz2', description: 'Bzip2 compression (placeholder).' },
    { slug: 'cab-converter', title: 'CAB Converter', category: 'Archive', targetFormat: 'cab', description: 'CAB archive conversion (placeholder).' },
    { slug: 'cpio-converter', title: 'CPIO Converter', category: 'Archive', targetFormat: 'cpio', description: 'CPIO archive conversion (placeholder).' },
    { slug: 'deb-converter', title: 'DEB Converter', category: 'Archive', targetFormat: 'deb', description: 'DEB package conversion (placeholder).' },
    { slug: 'dmg-converter', title: 'DMG Converter', category: 'Archive', targetFormat: 'dmg', description: 'DMG image conversion (placeholder).' },
    { slug: 'img-converter', title: 'IMG Converter', category: 'Archive', targetFormat: 'img', description: 'IMG disk image conversion (placeholder).' },
    { slug: 'iso-converter', title: 'ISO Converter', category: 'Archive', targetFormat: 'iso', description: 'ISO image conversion (placeholder).' },
    { slug: 'jar-converter', title: 'JAR Converter', category: 'Archive', targetFormat: 'jar', description: 'JAR archive creation (zip-based).'},
    { slug: 'lha-converter', title: 'LHA Converter', category: 'Archive', targetFormat: 'lha', description: 'LHA archive conversion (placeholder).'},
    { slug: 'lz-converter', title: 'LZ Converter', category: 'Archive', targetFormat: 'lz', description: 'LZ compression (placeholder).'},
    { slug: 'lzma-converter', title: 'LZMA Converter', category: 'Archive', targetFormat: 'lzma', description: 'LZMA compression (placeholder).'},
    { slug: 'lzo-converter', title: 'LZO Converter', category: 'Archive', targetFormat: 'lzo', description: 'LZO compression (placeholder).'},
    { slug: 'rar-converter', title: 'RAR Converter', category: 'Archive', targetFormat: 'rar', description: 'RAR archive conversion (placeholder).' },
    { slug: 'rpm-converter', title: 'RPM Converter', category: 'Archive', targetFormat: 'rpm', description: 'RPM package conversion (placeholder).' },
    { slug: 'rz-converter', title: 'RZ Converter', category: 'Archive', targetFormat: 'rz', description: 'Rzip compression (placeholder).' },
    { slug: 'tar-7z-converter', title: 'TAR.7Z Converter', category: 'Archive', targetFormat: '7z', description: 'Create .tar.7z archives (placeholder).' },
    { slug: 'tar-bz-converter', title: 'TAR.BZ Converter', category: 'Archive', targetFormat: 'tar.bz', description: 'Create .tar.bz archives (placeholder).' },
    { slug: 'tar-bz2-converter', title: 'TAR.BZ2 Converter', category: 'Archive', targetFormat: 'tar.bz2', description: 'Create .tar.bz2 archives (placeholder).' },
    { slug: 'tar-gz-converter', title: 'TAR.GZ Converter', category: 'Archive', targetFormat: 'tgz', description: 'Create .tar.gz (tgz) archives from files.' },
    { slug: 'tar-lzo-converter', title: 'TAR.LZO Converter', category: 'Archive', targetFormat: 'tar.lzo', description: 'Create .tar.lzo archives (placeholder).' },
    { slug: 'tar-xz-converter', title: 'TAR.XZ Converter', category: 'Archive', targetFormat: 'tar.xz', description: 'Create .tar.xz archives (placeholder).' },
    { slug: 'tar-z-converter', title: 'TAR.Z Converter', category: 'Archive', targetFormat: 'tar.z', description: 'Create .tar.Z archives (placeholder).' },
    { slug: 'tbz-converter', title: 'TBZ Converter', category: 'Archive', targetFormat: 'tbz', description: 'TBZ compression (placeholder).'},
    { slug: 'tbz2-converter', title: 'TBZ2 Converter', category: 'Archive', targetFormat: 'tbz2', description: 'TBZ2 compression (placeholder).'},
    { slug: 'tgz-converter', title: 'TGZ Converter', category: 'Archive', targetFormat: 'tgz', description: 'Create TGZ archives (tar.gz) from files.'},
    { slug: 'tz-converter', title: 'TZ Converter', category: 'Archive', targetFormat: 'tz', description: 'TZ compression (placeholder).'},
    { slug: 'tzo-converter', title: 'TZO Converter', category: 'Archive', targetFormat: 'tzo', description: 'TZO compression (placeholder).'},
    { slug: 'xz-converter', title: 'XZ Converter', category: 'Archive', targetFormat: 'xz', description: 'XZ compression (placeholder).'},
    { slug: 'z-converter', title: 'Z Converter', category: 'Archive', targetFormat: 'z', description: 'Unix .Z compression (placeholder).'},

    // Audio list
    { slug: 'aac-converter', title: 'AAC Converter', category: 'Audio', targetFormat: 'aac', description: 'Convert audio to AAC/M4A (best-effort).' },
    { slug: 'ac3-converter', title: 'AC3 Converter', category: 'Audio', targetFormat: 'mp3', description: 'Convert AC3 to MP3/WAV.' },
    { slug: 'aif-converter', title: 'AIF Converter', category: 'Audio', targetFormat: 'wav', description: 'Convert AIF to WAV/MP3.' },
    { slug: 'aifc-converter', title: 'AIFC Converter', category: 'Audio', targetFormat: 'wav', description: 'Convert AIFC to WAV/MP3.' },
    { slug: 'aiff-converter', title: 'AIFF Converter', category: 'Audio', targetFormat: 'wav', description: 'Convert AIFF to WAV/MP3.' },
    { slug: 'amr-converter', title: 'AMR Converter', category: 'Audio', targetFormat: 'mp3', description: 'Convert AMR to MP3/WAV.' },
    { slug: 'au-converter', title: 'AU Converter', category: 'Audio', targetFormat: 'wav', description: 'Convert AU to WAV/MP3.' },
    { slug: 'caf-converter', title: 'CAF Converter', category: 'Audio', targetFormat: 'wav', description: 'Convert CAF to WAV/MP3.' },
    { slug: 'dss-converter', title: 'DSS Converter', category: 'Audio', targetFormat: 'mp3', description: 'Convert DSS to MP3/WAV (best-effort).' },
    { slug: 'flac-converter', title: 'FLAC Converter', category: 'Audio', targetFormat: 'flac', description: 'Convert audio to/from FLAC.' },
    { slug: 'm4a-converter', title: 'M4A Converter', category: 'Audio', targetFormat: 'm4a', description: 'Convert audio to M4A (AAC).' },
    { slug: 'm4b-converter', title: 'M4B Converter', category: 'Audio', targetFormat: 'm4b', description: 'Convert audiobooks to M4B (placeholder).' },
    { slug: 'mp3-converter', title: 'MP3 Converter', category: 'Audio', targetFormat: 'mp3', description: 'Convert audio to MP3 (bitrate configurabile).' },
    { slug: 'oga-converter', title: 'OGA Converter', category: 'Audio', targetFormat: 'ogg', description: 'Convert audio to OGG (Opus).' },
    { slug: 'voc-converter', title: 'VOC Converter', category: 'Audio', targetFormat: 'wav', description: 'Convert VOC to WAV (best-effort).' },
    { slug: 'weba-converter', title: 'WEBA Converter', category: 'Audio', targetFormat: 'weba', description: 'Convert audio to WEBA (OGG/Opus).' },
    { slug: 'wma-converter', title: 'WMA Converter', category: 'Audio', targetFormat: 'mp3', description: 'Convert WMA to MP3/WAV.' },

    // Document additions
    { slug: 'abw-converter', title: 'ABW Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert AbiWord ABW to PDF (placeholder).' },
    { slug: 'djvu-converter', title: 'DJVU Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert DJVU to PDF (placeholder).' },
    { slug: 'doc-converter', title: 'DOC Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert DOC to PDF (placeholder).' },
    { slug: 'docm-converter', title: 'DOCM Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert DOCM to PDF (macros esclusi, placeholder).' },
    { slug: 'dot-converter', title: 'DOT Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert DOT templates to PDF (placeholder).' },
    { slug: 'dotx-converter', title: 'DOTX Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert DOTX templates to PDF (placeholder).' },
    { slug: 'html-converter', title: 'HTML Converter', category: 'Document', targetFormat: 'html', description: 'Converti tra HTML/MD/TXT/PDF.' },
    { slug: 'hwp-converter', title: 'HWP Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert HWP to PDF (placeholder).'},
    { slug: 'lwp-converter', title: 'LWP Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert LWP to PDF (placeholder).'},
    { slug: 'md-converter', title: 'MD Converter', category: 'Document', targetFormat: 'md', description: 'Convert MD ↔ HTML/PDF (base).'},
    { slug: 'odt-converter', title: 'ODT Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert ODT to PDF (placeholder).'},
    { slug: 'pages-converter', title: 'PAGES Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert Apple Pages to PDF (placeholder).'},
    { slug: 'rst-converter', title: 'RST Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert reStructuredText to PDF (placeholder).'},
    { slug: 'rtf-converter', title: 'RTF Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert RTF to PDF (placeholder).'},
    { slug: 'tex-converter', title: 'TEX Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert LaTeX TEX to PDF (placeholder).'},
    { slug: 'wpd-converter', title: 'WPD Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert WordPerfect WPD to PDF (placeholder).'},
    { slug: 'wps-converter', title: 'WPS Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert WPS to PDF (placeholder).'},
    { slug: 'zabw-converter', title: 'ZABW Converter', category: 'Document', targetFormat: 'pdf', description: 'Convert Zipped ABW to PDF (placeholder).'},

    // Ebook
    { slug: 'azw-converter', title: 'AZW Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert Kindle AZW to EPUB (placeholder).' },
    { slug: 'azw3-converter', title: 'AZW3 Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert AZW3 to EPUB (placeholder).' },
    { slug: 'azw4-converter', title: 'AZW4 Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert AZW4 to EPUB (placeholder).' },
    { slug: 'cbc-converter', title: 'CBC Converter', category: 'Ebook', targetFormat: 'cbz', description: 'Convert CBC to CBZ (placeholder).' },
    { slug: 'cbr-converter', title: 'CBR Converter', category: 'Ebook', targetFormat: 'cbz', description: 'Convert CBR to CBZ (placeholder).' },
    { slug: 'cbz-converter', title: 'CBZ Converter', category: 'Ebook', targetFormat: 'cbz', description: 'Create CBZ comic zip from images.' },
    { slug: 'chm-converter', title: 'CHM Converter', category: 'Ebook', targetFormat: 'pdf', description: 'Convert CHM to PDF (placeholder).' },
    { slug: 'epub-converter', title: 'EPUB Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert to/from EPUB (basic packaging placeholder).' },
    { slug: 'fb2-converter', title: 'FB2 Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert FB2 to EPUB (placeholder).' },
    { slug: 'htm-converter', title: 'HTM Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert HTM/HTML to EPUB (placeholder).' },
    { slug: 'htmlz-converter', title: 'HTMLZ Converter', category: 'Ebook', targetFormat: 'htmlz', description: 'Create HTMLZ (zipped HTML) (placeholder).'},
    { slug: 'lit-converter', title: 'LIT Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert LIT to EPUB (placeholder).'},
    { slug: 'lrf-converter', title: 'LRF Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert LRF to EPUB (placeholder).'},
    { slug: 'mobi-converter', title: 'MOBI Converter', category: 'Ebook', targetFormat: 'mobi', description: 'Convert EPUB to MOBI (placeholder).'},
    { slug: 'pdb-converter', title: 'PDB Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert PDB to EPUB (placeholder).'},
    { slug: 'pml-converter', title: 'PML Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert PML to EPUB (placeholder).'},
    { slug: 'prc-converter', title: 'PRC Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert PRC to EPUB (placeholder).'},
    { slug: 'rb-converter', title: 'RB Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert RB to EPUB (placeholder).'},
    { slug: 'snb-converter', title: 'SNB Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert SNB to EPUB (placeholder).'},
    { slug: 'tcr-converter', title: 'TCR Converter', category: 'Ebook', targetFormat: 'epub', description: 'Convert TCR to EPUB (placeholder).'},
    { slug: 'txtz-converter', title: 'TXTZ Converter', category: 'Ebook', targetFormat: 'txtz', description: 'Create TXTZ (zipped TXT) (placeholder).'},
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
  { slug: 'woff2-converter', title: 'WOFF2 Converter', category: 'Font', targetFormat: 'woff2', description: 'Convert fonts to modern compressed WOFF2 format.' },
  { slug: 'eot-converter', title: 'EOT Converter', category: 'Font', targetFormat: 'eot', description: 'Convert fonts to legacy EOT format for older browsers.' },

  // Specific conversion tools (bidirectional)
  { slug: 'powerpoint-to-pdf', title: 'PowerPoint to PDF', category: 'Presentation', targetFormat: 'pdf', description: 'Convert PowerPoint presentations (PPT, PPTX) to PDF format with high quality.' },
  { slug: 'excel-to-pdf', title: 'Excel to PDF', category: 'Spreadsheet', targetFormat: 'pdf', description: 'Convert Excel spreadsheets (XLS, XLSX) to PDF format preserving formatting.' },
  { slug: 'html-to-pdf', title: 'HTML to PDF', category: 'Document', targetFormat: 'pdf', description: 'Convert HTML web pages to PDF documents with full styling support.' },
  { slug: 'pdf-to-powerpoint', title: 'PDF to PowerPoint', category: 'Document', targetFormat: 'pptx', description: 'Convert PDF documents to editable PowerPoint presentations (PPTX).' },
  { slug: 'pdf-to-excel', title: 'PDF to Excel', category: 'Document', targetFormat: 'xlsx', description: 'Convert PDF tables to editable Excel spreadsheets (XLSX).' },
  { slug: 'pdf-to-pdfa', title: 'PDF to PDF/A', category: 'Document', targetFormat: 'pdfa', description: 'Convert PDF files to PDF/A format for long-term archiving compliance.' }
];

export function getConversionTool(slug) {
  return conversionTools.find(t => t.slug === slug);
}

export function listConversionSlugs() {
  return conversionTools.map(t => t.slug);
}

// Get all tools organized by category
export function getToolsByCategory() {
  const categorized = {};
  conversionTools.forEach(tool => {
    if (!categorized[tool.category]) {
      categorized[tool.category] = [];
    }
    categorized[tool.category].push({
      title: tool.title,
      description: tool.description,
      href: `/tools/${tool.slug}`,
      category: tool.category,
      targetFormat: tool.targetFormat
    });
  });
  return categorized;
}

// Get all categories
export function getAllCategories() {
  return [...new Set(conversionTools.map(t => t.category))];
}

// Get all tools as a flat array (for tools page)
export function getAllConversionTools() {
  return conversionTools.map(tool => ({
    title: tool.title,
    description: tool.description,
    href: `/tools/${tool.slug}`,
    category: tool.category,
    targetFormat: tool.targetFormat,
    icon: null // Will use fallback icon in ToolCard
  }));
}
