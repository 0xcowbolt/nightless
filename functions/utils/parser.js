// Fungsi pengganti htmlspecialchars() untuk keamanan XSS
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fungsi menghancurkan simbol selain huruf, angka, dan spasi
export function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

// Pengekstrak data serialisasi PHP
export function extractPHPSerializedValue(serializedStr, key) {
  if (!serializedStr) return '';
  const regex = new RegExp(`s:\\d+:"${key}";(?:s:\\d+:"([^"]*)?"|i:(\\d+);|b:(0|1);)`, 'i');
  const match = serializedStr.match(regex);
  if (match) {
    return match[1] !== undefined ? match[1] : (match[2] !== undefined ? match[2] : match[3]);
  }
  return '';
}

// Generator hash unik
export function generateCRC32Like(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
