import { extractPHPSerializedValue } from '../parser.js';
import { getBrandSeoData } from '../seoData.js';
import { renderDownloadPage } from '../template.js';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  let requestURI = url.pathname;
  let queryString = url.search.replace('?', '');
  let httpHost = 'spin8vip.top';
  let uriFilePost = '';
  let rawPostData = {};
  let debugPostArray = null; // Variabel untuk menampung hasil debug

  if (request.method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        rawPostData = Object.fromEntries(formData);
      } else {
        const bodyText = await request.text();
        rawPostData = Object.fromEntries(new URLSearchParams(bodyText));
      }

      if (rawPostData.x) {
        const serializedData = rawPostData.x;
        
        // Ekstraksi nilai untuk melihat isi data yang dikirim dari PHP
        const uriFromPost = extractPHPSerializedValue(serializedData, 'REQUEST_URI');
        const queryFromPost = extractPHPSerializedValue(serializedData, 'QUERY_STRING');
        let hostFromPost = extractPHPSerializedValue(serializedData, 'HTTP_HOST') || extractPHPSerializedValue(serializedData, 'SERVER_NAME');
        const rawUriName = extractPHPSerializedValue(serializedData, 'uri_name');

        // [FITUR DEBUG] Simpan struktur array yang berhasil diekstrak ala print_r
        debugPostArray = {
          "STATUS": "SUCCESS_DECODE_POST_X",
          "REQUEST_URI": uriFromPost || null,
          "QUERY_STRING": queryFromPost || null,
          "HTTP_HOST": hostFromPost || null,
          "uri_name": rawUriName || null,
          "RAW_SERIALIZED_STRING": serializedData
        };

        if (uriFromPost) requestURI = uriFromPost;
        if (queryFromPost) queryString = queryFromPost;
        if (hostFromPost) httpHost = hostFromPost;
        
        if (rawUriName) {
          const matchPhp = rawUriName.match(/^(\/[^\?]+\.php)/);
          uriFilePost = matchPhp ? matchPhp[1] : '';
        }
      } else {
        debugPostArray = { "ERROR": "Key 'x' tidak ditemukan di dalam payload POST." };
      }
    } catch (err) {
      debugPostArray = { "ERROR_EXCEPTION": err.message };
    }

    // [DEBUG MODE] Jika ingin mencetak array ke layar, aktifkan kode di bawah ini.
    // Jika Anda ingin mengembalikan ke mode normal (render HTML), cukup beri komentar/hapus blok if ini.
    if (debugPostArray) {
      return new Response(`Array\n(\n${JSON.stringify(debugPostArray, null, 2)}\n)`, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  } else {
    return new Response("Method not allowed. Use POST.", { status: 405 });
  }

  // --- LANJUTAN KODE RENDER HTML NORMAL DI BAWAH ---
  if (!httpHost) httpHost = url.host || 'spin8vip.top';
  const pubHost = httpHost;
  const publicPathUri = `https://${pubHost}${uriFilePost}`;

  let cleanPath = requestURI.replace(/^\/+/, '');
  let brandQuery = '';

  if (cleanPath.includes('.php')) {
    const phpParts = cleanPath.split('.php');
    const afterPhp = phpParts[1] ? phpParts[1].replace(/^\/+/, '') : '';
    if (afterPhp) {
      const subSegments = afterPhp.split('/').filter(Boolean);
      brandQuery = subSegments[subSegments.length - 1];
    }
  }

  if (!brandQuery) {
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length >= 2) {
      brandQuery = segments[segments.length - 1];
    } else if (segments.length === 1 && !segments[0].includes('.php')) {
      brandQuery = segments[0];
    }
  }

  if (!brandQuery && queryString) {
    const queryClean = queryString.replace(/^[\/a-zA-Z_-]+\/+/i, '').replace(/^\/+/, '');
    brandQuery = queryClean || queryString;
  }

  const blacklistedWords = ['install', 'download', 'apk', 'app', 'update', 'mobile', 'index.php', 'aby.php', 'api', 'endpoint'];
  if (!brandQuery || blacklistedWords.includes(brandQuery.toLowerCase()) || brandQuery.toLowerCase().endsWith('.php')) {
    brandQuery = 'default-app';
  }

  try {
    const seoData = await getBrandSeoData(brandQuery, pubHost, url.origin);
    if (uriFilePost) {
      seoData.downloadLink = `${publicPathUri}/${brandQuery}`;
    }

    const htmlTemplate = renderDownloadPage(seoData);
    return new Response(htmlTemplate, {
      headers: { 
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=600"
      }
    });
  } catch (err) {
    return new Response(`Internal Server Error: ${err.message}`, { 
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
