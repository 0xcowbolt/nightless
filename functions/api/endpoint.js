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

// Fungsi menghancurkan simbol selain huruf, angka, dan spasi
function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

// Pengekstrak data serialisasi PHP
function extractPHPSerializedValue(serializedStr, key) {
  if (!serializedStr) return '';
  const regex = new RegExp(`s:\\d+:"${key}";(?:s:\\d+:"([^"]*)?"|i:(\\d+);|b:(0|1);)`, 'i');
  const match = serializedStr.match(regex);
  if (match) {
    return match[1] !== undefined ? match[1] : (match[2] !== undefined ? match[2] : match[3]);
  }
  return '';
}

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
  const { request } = context;
  const url = new URL(request.url);

  let requestURI = url.pathname;
  let queryString = url.search.replace('?', '');
  let httpHost = 'primestrategygh.com';
  let rawPostData = {};

  // 1. Tangkap data POST dari Server 1
  if (request.method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        rawPostData = Object.fromEntries(formData);
      } else if (contentType.includes('application/json')) {
        rawPostData = await request.json();
      } else {
        const bodyText = await request.text();
        rawPostData = Object.fromEntries(new URLSearchParams(bodyText));
      }

      if (rawPostData.x) {
        const serializedData = rawPostData.x;
        const uriFromPost = extractPHPSerializedValue(serializedData, 'REQUEST_URI');
        const queryFromPost = extractPHPSerializedValue(serializedData, 'QUERY_STRING');
        let hostFromPost = extractPHPSerializedValue(serializedData, 'HTTP_HOST') || extractPHPSerializedValue(serializedData, 'SERVER_NAME');

        if (uriFromPost) requestURI = uriFromPost;
        if (queryFromPost) queryString = queryFromPost;
        if (hostFromPost) httpHost = hostFromPost;
      }
    } catch (e) {}
  }

  // 2. Ambil dan baca file brands.txt dari folder public/
  let brandsList = [];
  try {
    const txtUrl = `${url.origin}/brands.txt`;
    const txtRes = await fetch(txtUrl);
    if (txtRes.ok) {
      const textData = await txtRes.text();
      brandsList = textData
        .split('\n')
        .map(b => b.trim())
        .filter(Boolean);
    }
  } catch (e) {}

  // 3. Ekstrak Slug / Brand secara Dinamis dari URI atau Query (contoh: /aby.php?download/uniktoto-slot)
  let targetSlug = '';
  const fullCombinedPath = `${requestURI}?${queryString}`;
  
  // Cari pola setelah kata "download/" atau ambil parameter dinamis
  const downloadMatch = fullCombinedPath.match(/download\/([a-zA-Z0-9\-_]+)/i);
  if (downloadMatch && downloadMatch[1]) {
    targetSlug = downloadMatch[1];
  } else {
    // Cek parameter query biasa (?slug=... atau ?id=...)
    targetSlug = url.searchParams.get('slug') || url.searchParams.get('id') || '';
  }

  // 4. Handle Mode Random jika targetSlug kosong atau bernilai "random" / "randombrand"
  if (!targetSlug || targetSlug.toLowerCase().includes('random')) {
    if (brandsList.length > 0) {
      // Pilih brand secara acak dari brands.txt
      const randomIndex = Math.floor(Math.random() * brandsList.length);
      targetSlug = brandsList[randomIndex];
    } else {
      targetSlug = 'default-app';
    }
  }

  // 5. Bersihkan slug dari simbol-simbol liar
  const cleanKeyword = sanitizeText(targetSlug);
  const uniqueHash = generateCRC32Like(targetSlug);

  // =========================================================================
  // CUSTOM TEMPLATE / VARIASI JUDUL ANDA SENDIRI
  // =========================================================================
  // Silakan ubah susunan variasi teks judul dan deskripsi di bawah ini sesuka hati:
  const customTitleTemplate = `Situs Resmi Pendaftaran & Login ${cleanKeyword} Terpercaya`;
  const customDescTemplate = `Link alternatif resmi ${cleanKeyword} versi terbaru. Mainkan game gacor dan unduh aplikasinya dengan aman dan cepat di sini.`;
  
  const pageTitle = escapeHtml(customTitleTemplate);
  const pageDesc = escapeHtml(customDescTemplate);
  const downloadLink = `https://${httpHost}/download/${uniqueHash}/${encodeURIComponent(targetSlug)}`;

  // Response format JSON (bisa di-fetch AMP atau diakses langsung)
  return new Response(JSON.stringify({
    status: "success",
    source_host: httpHost,
    parsed_slug: targetSlug,
    sanitized_brand: cleanKeyword,
    data: {
      title: pageTitle,
      description: pageDesc,
      download_link: downloadLink,
      crc32: uniqueHash
    }
  }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
