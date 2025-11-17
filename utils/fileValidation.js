// File validation utilities

const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/vnd.ms-excel', // XLS
  'text/plain',
  'text/csv',
  
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function isValidFileType(mimeType) {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

export function isValidFileSize(size) {
  return size <= MAX_FILE_SIZE;
}

export function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function getFileIcon(fileType) {
  const icons = {
    pdf: '📄',
    docx: '📝',
    xlsx: '📊',
    xls: '📊',
    csv: '📊',
    txt: '📃',
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🖼️',
    webp: '🖼️',
  };
  
  return icons[fileType] || '📄';
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function validateFile(file) {
  if (!isValidFileType(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Please upload PDF, DOCX, XLSX, TXT, or image files.`
    };
  }
  
  if (!isValidFileSize(file.size)) {
    return {
      valid: false,
      error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}.`
    };
  }
  
  return { valid: true };
}

export function generatePreview(file) {
  return new Promise((resolve, reject) => {
    // For images, generate a data URL preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          type: 'image',
          url: e.target.result,
          name: file.name,
          size: file.size
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      // For non-images, return file info without preview
      resolve({
        type: 'file',
        url: null,
        name: file.name,
        size: file.size,
        icon: getFileIcon(getFileExtension(file.name))
      });
    }
  });
}
