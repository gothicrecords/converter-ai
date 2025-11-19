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
    { slug: 'eps-converter', title: 'EPS Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti file EPS in PDF o PNG mantenendo la qualità vettoriale.' },
    { slug: 'erf-converter', title: 'ERF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Epson ERF RAW images to JPG/PNG.' },
    { slug: 'heif-converter', title: 'HEIF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert HEIF to JPG/PNG (support depends on libvips build).' },
    { slug: 'icns-converter', title: 'ICNS Converter', category: 'Image', targetFormat: 'png', description: 'Convert Apple ICNS icons to PNG.' },
    { slug: 'ico-converter', title: 'ICO Converter', category: 'Image', targetFormat: 'png', description: 'Convert Windows ICO icons to PNG.' },
    { slug: 'jfif-converter', title: 'JFIF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert JFIF images to JPG/PNG.' },
    { slug: 'mos-converter', title: 'MOS Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Leaf MOS RAW images to JPG/PNG.' },
    { slug: 'mrw-converter', title: 'MRW Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Minolta MRW RAW images to JPG/PNG.' },
    { slug: 'nef-converter', title: 'NEF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Nikon NEF RAW images to JPG/PNG.' },
    { slug: 'odd-converter', title: 'ODD Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti template di disegno OpenDocument (ODD) in PDF o PNG.' },
    { slug: 'odg-converter', title: 'ODG Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti disegni ODG in PDF o PNG preservando gli elementi grafici.' },
    { slug: 'orf-converter', title: 'ORF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Olympus ORF RAW images to JPG/PNG.' },
    { slug: 'pef-converter', title: 'PEF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Pentax PEF RAW images to JPG/PNG.' },
    { slug: 'ppm-converter', title: 'PPM Converter', category: 'Image', targetFormat: 'png', description: 'Convert PPM images to PNG/JPG.' },
    { slug: 'ps-converter', title: 'PS Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti file PostScript (PS) in PDF o PNG ad alta risoluzione.' },
    { slug: 'psd-converter', title: 'PSD Converter', category: 'Image', targetFormat: 'png', description: 'Convert Adobe PSD to PNG/JPG (flatten).'},
    { slug: 'pub-converter', title: 'PUB Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti Microsoft Publisher (PUB) in PDF preservando layout e grafica.'},
    { slug: 'raf-converter', title: 'RAF Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Fuji RAF RAW to JPG/PNG.'},
    { slug: 'raw-converter', title: 'RAW Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert various RAW formats to JPG/PNG (best-effort).'},
    { slug: 'rw2-converter', title: 'RW2 Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Panasonic RW2 RAW to JPG/PNG.'},
    { slug: 'tif-converter', title: 'TIF Converter', category: 'Image', targetFormat: 'tiff', description: 'Convert TIF/TIFF images to PNG/JPG or viceversa.' },
    { slug: 'x3f-converter', title: 'X3F Converter', category: 'Image', targetFormat: 'jpg', description: 'Convert Sigma X3F RAW to JPG/PNG.' },
    { slug: 'xcf-converter', title: 'XCF Converter', category: 'Image', targetFormat: 'png', description: 'Convert GIMP XCF to PNG/JPG (flatten).'},
    { slug: 'xps-converter', title: 'XPS Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti XPS in PDF mantenendo formattazione e immagini.'},

    // Vector additions
    { slug: 'ai-converter', title: 'AI Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti file Adobe Illustrator (AI) in PDF o PNG ad alta qualità.'},
    { slug: 'cdr-converter', title: 'CDR Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti disegni CorelDRAW (CDR) in PDF o PNG preservando i vettori.'},
    { slug: 'cgm-converter', title: 'CGM Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti grafici CGM in PDF o PNG mantenendo la qualità vettoriale.'},
    { slug: 'emf-converter', title: 'EMF Converter', category: 'Vector', targetFormat: 'png', description: 'Converti file EMF (Enhanced Metafile) in PNG o PDF.'},
    { slug: 'sk-converter', title: 'SK Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti file SK in PDF o PNG preservando gli elementi grafici.'},
    { slug: 'sk1-converter', title: 'SK1 Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti file SK1 in PDF o PNG ad alta risoluzione.'},
    { slug: 'svgz-converter', title: 'SVGZ Converter', category: 'Vector', targetFormat: 'svg', description: 'Convert SVGZ (compressed SVG) to SVG/PNG.'},
    { slug: 'vsd-converter', title: 'VSD Converter', category: 'Vector', targetFormat: 'pdf', description: 'Converti diagrammi Microsoft Visio (VSD) in PDF o PNG.'},
    { slug: 'wmf-converter', title: 'WMF Converter', category: 'Vector', targetFormat: 'png', description: 'Converti file WMF (Windows Metafile) in PNG o PDF.'},

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
    { slug: '7z-converter', title: '7Z Converter', category: 'Archive', targetFormat: '7z', description: 'Crea o estrai archivi 7Z compressi ad alta efficienza.' },
    { slug: 'ace-converter', title: 'ACE Converter', category: 'Archive', targetFormat: 'ace', description: 'Gestisci archivi ACE: crea o estrai file compressi.' },
    { slug: 'alz-converter', title: 'ALZ Converter', category: 'Archive', targetFormat: 'alz', description: 'Converti o estrai archivi ALZ compressi.' },
    { slug: 'arc-converter', title: 'ARC Converter', category: 'Archive', targetFormat: 'arc', description: 'Gestisci archivi ARC: crea o estrai contenuti.' },
    { slug: 'arj-converter', title: 'ARJ Converter', category: 'Archive', targetFormat: 'arj', description: 'Crea o estrai archivi ARJ compressi.' },
    { slug: 'bz-converter', title: 'BZ Converter', category: 'Archive', targetFormat: 'bz', description: 'Comprimi file usando l\'algoritmo Bzip.' },
    { slug: 'bz2-converter', title: 'BZ2 Converter', category: 'Archive', targetFormat: 'bz2', description: 'Comprimi file con Bzip2 per massima compressione.' },
    { slug: 'cab-converter', title: 'CAB Converter', category: 'Archive', targetFormat: 'cab', description: 'Gestisci archivi CAB di Windows: crea o estrai.' },
    { slug: 'cpio-converter', title: 'CPIO Converter', category: 'Archive', targetFormat: 'cpio', description: 'Crea o estrai archivi CPIO Unix/Linux.' },
    { slug: 'deb-converter', title: 'DEB Converter', category: 'Archive', targetFormat: 'deb', description: 'Gestisci pacchetti DEB Debian: estrai o crea.' },
    { slug: 'dmg-converter', title: 'DMG Converter', category: 'Archive', targetFormat: 'dmg', description: 'Gestisci immagini disco DMG di macOS.' },
    { slug: 'img-converter', title: 'IMG Converter', category: 'Archive', targetFormat: 'img', description: 'Gestisci immagini disco IMG: estrai o crea.' },
    { slug: 'iso-converter', title: 'ISO Converter', category: 'Archive', targetFormat: 'iso', description: 'Gestisci immagini ISO: estrai contenuti o crea nuove immagini.' },
    { slug: 'jar-converter', title: 'JAR Converter', category: 'Archive', targetFormat: 'jar', description: 'JAR archive creation (zip-based).'},
    { slug: 'lha-converter', title: 'LHA Converter', category: 'Archive', targetFormat: 'lha', description: 'Gestisci archivi LHA: crea o estrai file compressi.'},
    { slug: 'lz-converter', title: 'LZ Converter', category: 'Archive', targetFormat: 'lz', description: 'Comprimi file usando l\'algoritmo LZ.'},
    { slug: 'lzma-converter', title: 'LZMA Converter', category: 'Archive', targetFormat: 'lzma', description: 'Comprimi file con LZMA per alta compressione.'},
    { slug: 'lzo-converter', title: 'LZO Converter', category: 'Archive', targetFormat: 'lzo', description: 'Comprimi file con LZO per compressione veloce.'},
    { slug: 'rar-converter', title: 'RAR Converter', category: 'Archive', targetFormat: 'rar', description: 'Gestisci archivi RAR: estrai contenuti compressi.' },
    { slug: 'rpm-converter', title: 'RPM Converter', category: 'Archive', targetFormat: 'rpm', description: 'Gestisci pacchetti RPM: estrai o crea pacchetti.' },
    { slug: 'rz-converter', title: 'RZ Converter', category: 'Archive', targetFormat: 'rz', description: 'Comprimi file usando l\'algoritmo Rzip.' },
    { slug: 'tar-7z-converter', title: 'TAR.7Z Converter', category: 'Archive', targetFormat: '7z', description: 'Crea archivi .tar.7z combinando TAR e compressione 7Z.' },
    { slug: 'tar-bz-converter', title: 'TAR.BZ Converter', category: 'Archive', targetFormat: 'tar.bz', description: 'Crea archivi .tar.bz combinando TAR e Bzip.' },
    { slug: 'tar-bz2-converter', title: 'TAR.BZ2 Converter', category: 'Archive', targetFormat: 'tar.bz2', description: 'Crea archivi .tar.bz2 combinando TAR e Bzip2.' },
    { slug: 'tar-gz-converter', title: 'TAR.GZ Converter', category: 'Archive', targetFormat: 'tgz', description: 'Create .tar.gz (tgz) archives from files.' },
    { slug: 'tar-lzo-converter', title: 'TAR.LZO Converter', category: 'Archive', targetFormat: 'tar.lzo', description: 'Crea archivi .tar.lzo combinando TAR e LZO.' },
    { slug: 'tar-xz-converter', title: 'TAR.XZ Converter', category: 'Archive', targetFormat: 'tar.xz', description: 'Crea archivi .tar.xz combinando TAR e XZ.' },
    { slug: 'tar-z-converter', title: 'TAR.Z Converter', category: 'Archive', targetFormat: 'tar.z', description: 'Crea archivi .tar.Z combinando TAR e compress Unix.' },
    { slug: 'tbz-converter', title: 'TBZ Converter', category: 'Archive', targetFormat: 'tbz', description: 'Comprimi file in formato TBZ (TAR + Bzip).'},
    { slug: 'tbz2-converter', title: 'TBZ2 Converter', category: 'Archive', targetFormat: 'tbz2', description: 'Comprimi file in formato TBZ2 (TAR + Bzip2).'},
    { slug: 'tgz-converter', title: 'TGZ Converter', category: 'Archive', targetFormat: 'tgz', description: 'Create TGZ archives (tar.gz) from files.'},
    { slug: 'tz-converter', title: 'TZ Converter', category: 'Archive', targetFormat: 'tz', description: 'Comprimi file in formato TZ compresso.'},
    { slug: 'tzo-converter', title: 'TZO Converter', category: 'Archive', targetFormat: 'tzo', description: 'Comprimi file in formato TZO compresso.'},
    { slug: 'xz-converter', title: 'XZ Converter', category: 'Archive', targetFormat: 'xz', description: 'Comprimi file con XZ per massima compressione.'},
    { slug: 'z-converter', title: 'Z Converter', category: 'Archive', targetFormat: 'z', description: 'Comprimi file in formato Unix .Z compresso.'},

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
    { slug: 'm4b-converter', title: 'M4B Converter', category: 'Audio', targetFormat: 'm4b', description: 'Converti audiolibri in formato M4B con capitoli e segnalibri.' },
    { slug: 'mp3-converter', title: 'MP3 Converter', category: 'Audio', targetFormat: 'mp3', description: 'Convert audio to MP3 (bitrate configurabile).' },
    { slug: 'oga-converter', title: 'OGA Converter', category: 'Audio', targetFormat: 'ogg', description: 'Convert audio to OGG (Opus).' },
    { slug: 'voc-converter', title: 'VOC Converter', category: 'Audio', targetFormat: 'wav', description: 'Convert VOC to WAV (best-effort).' },
    { slug: 'weba-converter', title: 'WEBA Converter', category: 'Audio', targetFormat: 'weba', description: 'Convert audio to WEBA (OGG/Opus).' },
    { slug: 'wma-converter', title: 'WMA Converter', category: 'Audio', targetFormat: 'mp3', description: 'Convert WMA to MP3/WAV.' },

    // Document additions
    { slug: 'abw-converter', title: 'ABW Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti AbiWord (ABW) in PDF preservando formattazione e layout.' },
    { slug: 'djvu-converter', title: 'DJVU Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti file DJVU in PDF mantenendo immagini e testo ad alta qualità.' },
    { slug: 'doc-converter', title: 'DOC Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti Word legacy (DOC) in PDF moderni.' },
    { slug: 'docm-converter', title: 'DOCM Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti DOCM in PDF (le macro vengono rimosse per sicurezza).' },
    { slug: 'dot-converter', title: 'DOT Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti template Word (DOT) in PDF preservando lo stile.' },
    { slug: 'dotx-converter', title: 'DOTX Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti template Word moderni (DOTX) in PDF.' },
    { slug: 'html-converter', title: 'HTML Converter', category: 'Document', targetFormat: 'html', description: 'Converti tra HTML/MD/TXT/PDF.' },
    { slug: 'hwp-converter', title: 'HWP Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti HWP (Hancom Word) in PDF preservando formattazione.'},
    { slug: 'lwp-converter', title: 'LWP Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti LWP in PDF mantenendo layout e stili.'},
    { slug: 'md-converter', title: 'MD Converter', category: 'Document', targetFormat: 'md', description: 'Converti documenti tra Markdown, HTML e PDF.'},
    { slug: 'odt-converter', title: 'ODT Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti OpenDocument (ODT) in PDF ad alta qualità.'},
    { slug: 'pages-converter', title: 'PAGES Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti Apple Pages in PDF preservando design e formattazione.'},
    { slug: 'rst-converter', title: 'RST Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti file reStructuredText in PDF per documentazione professionale.'},
    { slug: 'rtf-converter', title: 'RTF Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti RTF (Rich Text Format) in PDF mantenendo formattazione.'},
    { slug: 'tex-converter', title: 'TEX Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti LaTeX (TEX) in PDF preservando formule e layout.'},
    { slug: 'wpd-converter', title: 'WPD Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti WordPerfect (WPD) in PDF moderni.'},
    { slug: 'wps-converter', title: 'WPS Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti documenti WPS in PDF preservando contenuto e formattazione.'},
    { slug: 'zabw-converter', title: 'ZABW Converter', category: 'Document', targetFormat: 'pdf', description: 'Converti archivi compressi ABW (ZABW) in PDF.'},

    // Ebook
    { slug: 'azw-converter', title: 'AZW Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook Kindle (AZW) in formato EPUB universale.' },
    { slug: 'azw3-converter', title: 'AZW3 Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook AZW3 di Amazon in EPUB per lettura su qualsiasi dispositivo.' },
    { slug: 'azw4-converter', title: 'AZW4 Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook AZW4 in formato EPUB standard.' },
    { slug: 'cbc-converter', title: 'CBC Converter', category: 'Ebook', targetFormat: 'cbz', description: 'Converti fumetti CBC in formato CBZ compresso.' },
    { slug: 'cbr-converter', title: 'CBR Converter', category: 'Ebook', targetFormat: 'cbz', description: 'Converti fumetti CBR (RAR) in formato CBZ (ZIP) universale.' },
    { slug: 'cbz-converter', title: 'CBZ Converter', category: 'Ebook', targetFormat: 'cbz', description: 'Crea archivi CBZ per fumetti da immagini.' },
    { slug: 'chm-converter', title: 'CHM Converter', category: 'Ebook', targetFormat: 'pdf', description: 'Converti file CHM (help di Windows) in PDF per lettura universale.' },
    { slug: 'epub-converter', title: 'EPUB Converter', category: 'Ebook', targetFormat: 'epub', description: 'Gestisci ebook EPUB: converti da e verso altri formati ebook.' },
    { slug: 'fb2-converter', title: 'FB2 Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook FictionBook (FB2) in formato EPUB.' },
    { slug: 'htm-converter', title: 'HTM Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti pagine HTML/HTM in ebook EPUB strutturati.' },
    { slug: 'htmlz-converter', title: 'HTMLZ Converter', category: 'Ebook', targetFormat: 'htmlz', description: 'Crea archivi HTMLZ (HTML compresso) per ebook.'},
    { slug: 'lit-converter', title: 'LIT Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook Microsoft LIT in formato EPUB moderno.'},
    { slug: 'lrf-converter', title: 'LRF Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook Sony LRF in formato EPUB universale.'},
    { slug: 'mobi-converter', title: 'MOBI Converter', category: 'Ebook', targetFormat: 'mobi', description: 'Converti ebook EPUB in formato MOBI per Kindle.'},
    { slug: 'pdb-converter', title: 'PDB Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook Palm (PDB) in formato EPUB.'},
    { slug: 'pml-converter', title: 'PML Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook PML in formato EPUB standard.'},
    { slug: 'prc-converter', title: 'PRC Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook PRC in formato EPUB universale.'},
    { slug: 'rb-converter', title: 'RB Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook RocketBook (RB) in formato EPUB.'},
    { slug: 'snb-converter', title: 'SNB Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook SNB in formato EPUB standard.'},
    { slug: 'tcr-converter', title: 'TCR Converter', category: 'Ebook', targetFormat: 'epub', description: 'Converti ebook TCR in formato EPUB universale.'},
    { slug: 'txtz-converter', title: 'TXTZ Converter', category: 'Ebook', targetFormat: 'txtz', description: 'Crea archivi TXTZ (testo compresso) per ebook.'},
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

  // Image (subset initially supported; raw formats)
  { slug: 'png-converter', title: 'PNG Converter', category: 'Image', targetFormat: 'png', description: 'Converti immagini in PNG ottimizzato o da PNG a JPG, WEBP.' },
  { slug: 'jpg-converter', title: 'JPG Converter', category: 'Image', targetFormat: 'jpg', description: 'Converti immagini in JPG con qualità regolabile per file più leggeri.' },
  { slug: 'jpeg-converter', title: 'JPEG Converter', category: 'Image', targetFormat: 'jpeg', description: 'Converti immagini in formato JPEG controllando qualità e dimensione.' },
  { slug: 'webp-converter', title: 'WEBP Converter', category: 'Image', targetFormat: 'webp', description: 'Converti immagini in formato WEBP moderno per ottimizzazione web.' },
  { slug: 'gif-converter', title: 'GIF Converter', category: 'Image', targetFormat: 'gif', description: 'Converti immagini statiche in GIF (supporto animazioni in arrivo).' },
  { slug: 'heic-converter', title: 'HEIC Converter', category: 'Image', targetFormat: 'heic', description: 'Converti foto HEIC (iPhone) in JPG o PNG per compatibilità universale.' },
  { slug: 'tiff-converter', title: 'TIFF Converter', category: 'Image', targetFormat: 'tiff', description: 'Converti immagini TIFF ad alta qualità in PNG, JPG o PDF.' },
  { slug: 'bmp-converter', title: 'BMP Converter', category: 'Image', targetFormat: 'bmp', description: 'Converti immagini BMP in PNG o JPG compressi per risparmiare spazio.' },
  { slug: 'raw-converter', title: 'RAW Converter', category: 'Image', targetFormat: 'raw', description: 'Converti formati RAW delle fotocamere in JPG o PNG processati.' },

  // Vector - duplicati rimossi, già presenti sopra

  // Video (initial support limited to container remux via ffmpeg if available)
  { slug: 'mp4-converter', title: 'MP4 Converter', category: 'Video', targetFormat: 'mp4', description: 'Converti video in MP4 (H.264/AAC) con risoluzione e qualità regolabili.' },
  { slug: 'webm-converter', title: 'WEBM Converter', category: 'Video', targetFormat: 'webm', description: 'Converti video in WEBM (VP9/Opus) ottimizzato per web.' },
  { slug: 'avi-converter', title: 'AVI Converter', category: 'Video', targetFormat: 'avi', description: 'Converti video in formato AVI legacy per compatibilità.' },

  // Archive (initial: zip create/extract) - duplicati rimossi, già presenti sopra

  // Audio (initial conversion using ffmpeg if available) - duplicati rimossi, già presenti sopra

  // Document conversions
  { slug: 'docx-converter', title: 'DOCX Converter', category: 'Document', targetFormat: 'docx', description: 'Converti documenti in formato DOCX (Word) preservando formattazione e stili.' },
  { slug: 'txt-converter', title: 'TXT Converter', category: 'Document', targetFormat: 'txt', description: 'Converti documenti in testo semplice (TXT) estraendo solo il contenuto testuale.' },
  { slug: 'md-converter', title: 'MD Converter', category: 'Document', targetFormat: 'md', description: 'Converti documenti o HTML in formato Markdown per documentazione e note.' },
  { slug: 'html-converter', title: 'HTML Converter', category: 'Document', targetFormat: 'html', description: 'Converti Markdown o testo in pagine HTML con formattazione completa.' },

  // Ebook (duplicati rimossi - già presenti sopra)
  { slug: 'cbz-converter', title: 'CBZ Converter', category: 'Ebook', targetFormat: 'cbz', description: 'Create comic book CBZ archive from images.' },

  // Font (initial: ttf/otf -> woff/woff2 if library available)
  { slug: 'ttf-converter', title: 'TTF Converter', category: 'Font', targetFormat: 'ttf', description: 'Converti font TTF in WOFF/WOFF2 per web o viceversa.' },
  { slug: 'otf-converter', title: 'OTF Converter', category: 'Font', targetFormat: 'otf', description: 'Converti font OTF in TTF o WOFF per compatibilità web.' },
  { slug: 'woff-converter', title: 'WOFF Converter', category: 'Font', targetFormat: 'woff', description: 'Convert fonts to web-optimized WOFF format.' },
  { slug: 'woff2-converter', title: 'WOFF2 Converter', category: 'Font', targetFormat: 'woff2', description: 'Convert fonts to modern compressed WOFF2 format.' },
  { slug: 'eot-converter', title: 'EOT Converter', category: 'Font', targetFormat: 'eot', description: 'Convert fonts to legacy EOT format for older browsers.' },

  // PDF Tools - Convertitori specifici per PDF
  { slug: 'pdf-to-powerpoint', title: 'PDF to PowerPoint', category: 'PDF', targetFormat: 'pptx', description: 'Converti documenti PDF in presentazioni PowerPoint modificabili (PPTX).' },
  { slug: 'pdf-to-excel', title: 'PDF to Excel', category: 'PDF', targetFormat: 'xlsx', description: 'Estrai tabelle da PDF e convertile in fogli Excel modificabili (XLSX).' },
  { slug: 'pdf-to-pdfa', title: 'PDF to PDF/A', category: 'PDF', targetFormat: 'pdfa', description: 'Converti PDF in formato PDF/A conforme per archiviazione a lungo termine.' },
  { slug: 'pdf-to-docx', title: 'PDF to Word', category: 'PDF', targetFormat: 'docx', description: 'Converti PDF in documenti Word modificabili (DOCX) preservando la formattazione.' },
  { slug: 'pdf-to-jpg', title: 'PDF to JPG', category: 'PDF', targetFormat: 'jpg', description: 'Estrai immagini da PDF e convertile in file JPG ad alta qualità.' },
  { slug: 'pdf-to-png', title: 'PDF to PNG', category: 'PDF', targetFormat: 'png', description: 'Converti pagine PDF in immagini PNG mantenendo la qualità originale.' },
  { slug: 'pdf-to-txt', title: 'PDF to TXT', category: 'PDF', targetFormat: 'txt', description: 'Estrai il testo da PDF e convertilo in file di testo semplice (TXT).' },
  { slug: 'pdf-to-html', title: 'PDF to HTML', category: 'PDF', targetFormat: 'html', description: 'Converti PDF in pagine HTML preservando layout e formattazione.' },
  
  // Specific conversion tools (bidirectional) - Da altri formati a PDF
  { slug: 'powerpoint-to-pdf', title: 'PowerPoint to PDF', category: 'Presentation', targetFormat: 'pdf', description: 'Converti presentazioni PowerPoint (PPT, PPTX) in PDF ad alta qualità.' },
  { slug: 'excel-to-pdf', title: 'Excel to PDF', category: 'Spreadsheet', targetFormat: 'pdf', description: 'Converti fogli Excel (XLS, XLSX) in PDF preservando formattazione e tabelle.' },
  { slug: 'html-to-pdf', title: 'HTML to PDF', category: 'Document', targetFormat: 'pdf', description: 'Converti pagine web HTML in documenti PDF con stili completi.' }
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
  const seenSlugs = new Set(); // Per evitare duplicati
  
  conversionTools.forEach(tool => {
    // Salta se abbiamo già visto questo slug
    if (seenSlugs.has(tool.slug)) {
      return;
    }
    seenSlugs.add(tool.slug);
    
    if (!categorized[tool.category]) {
      categorized[tool.category] = [];
    }
    categorized[tool.category].push({
      title: tool.title,
      description: tool.description,
      href: `/tools/${tool.slug}`,
      category: tool.category,
      targetFormat: tool.targetFormat,
      slug: tool.slug // Aggiungi anche lo slug per facilitare il confronto
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
