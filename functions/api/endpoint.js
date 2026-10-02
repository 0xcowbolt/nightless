// Fungsi pengganti htmlspecialchars() untuk keamanan XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fungsi untuk menghancurkan semua simbol selain huruf, angka, dan spasi
function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ') // Hancurkan semua simbol selain huruf, angka, spasi
    .replace(/\s+/g, ' ')            // Bersihkan spasi ganda
    .trim()                          // Pangkas spasi awal/akhir
    .toUpperCase();                  // Ubah ke huruf kapital
}

// Fungsi verifikasi HMAC-SHA256 (opsional untuk keamanan dari Server 1)
function hexToArrayBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

async function verifyHmacSignature(secret, message, signatureHex) {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    return await crypto.subtle.verify("HMAC", key, hexToArrayBuffer(signatureHex), encoder.encode(message));
  } catch (e) {
    return false;
  }
}

// Fungsi peniru CRC32 untuk hash unik
function generateCRC32Like(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const rawSlug = url.searchParams.get('slug') || url.searchParams.get('id') || '';
  const format = url.searchParams.get('format') || 'html';

  // 1. Ambil dan baca file brands.txt secara dinamis dari folder public/
  let allowedBrands = [];
  try {
    const txtUrl = `${url.origin}/brands.txt`;
    const txtRes = await fetch(txtUrl);
    if (txtRes.ok) {
      const textData = await txtRes.text();
      // Bersihkan setiap baris teks dari simbol saat dibaca dari brands.txt
      allowedBrands = textData
        .split('\n')
        .map(b => sanitizeText(b))
        .filter(Boolean);
    }
  } catch (e) {
    // Fallback jika file txt gagal diakses
  }

  // 2. Bersihkan input slug dari request
  const cleanCurrentSlug = sanitizeText(rawSlug);

  // 3. Validasi pencocokan (Opsional: Pastikan brand terdaftar di brands.txt jika listnya ada)
  const isBrandValid = allowedBrands.length === 0 || allowedBrands.includes(cleanCurrentSlug) || allowedBrands.some(b => cleanCurrentSlug.includes(b));

  if (!isBrandValid && cleanCurrentSlug) {
    return new Response(JSON.stringify({ error: "Brand not found in database or brands.txt list" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 4. Buat variabel konten yang aman dari simbol dan XSS
  const uniqueHash = generateCRC32Like(rawSlug || 'default');
  const safeTitleText = cleanCurrentSlug || 'APLIKASI TERBARU';
  
  const pageTitle = escapeHtml(`Download ${safeTitleText} Versi Terbaru`);
  const pageDesc = escapeHtml(`Informasi resmi dan tautan unduh ${safeTitleText} terpercaya, aman, serta cepat.`);
  const downloadLink = `https://download.store-files.com/apk/${uniqueHash}/${encodeURIComponent(rawSlug)}.apk`;

  // 5. Jika format JSON diminta (biasanya di-fetch oleh subdomain AMP)
  if (format === 'json' || request.headers.get('accept')?.includes('application/json')) {
    return new Response(JSON.stringify({
      status: "success",
      data: {
        id: rawSlug,
        sanitized_keyword: cleanCurrentSlug,
        title: pageTitle,
        description: pageDesc,
        download_link: downloadLink,
        crc32: uniqueHash
      }
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  // 6. Jika diakses browser biasa, render tampilan halaman unduh utama dari template HTML
  const templateUrl = `${url.origin}/templates/download-page.html`;
  let htmlTemplate = '<!DOCTYPE html><html><head><title>{{TITLE}}</title></head><body><h1>{{TITLE}}</h1><p>{{DESCRIPTION}}</p><a href="{{DOWNLOAD_LINK}}">Download</a></body></html>';
  
  try {
    const res = await fetch(templateUrl);
    if (res.ok) {
      htmlTemplate = await res.text();
    }
  } catch (e) {}

  // Inject data ke template HTML unduh
  const finalHtml = htmlTemplate
    .replace(/\{\{TITLE\}\}/g, pageTitle)
    .replace(/\{\{DESCRIPTION\}\}/g, pageDesc)
    .replace(/\{\{DOWNLOAD_LINK\}\}/g, downloadLink);

  return new Response(finalHtml, {
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600"
    }
  });
}
