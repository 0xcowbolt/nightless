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

  // Tangani Request POST dari Server 1 PHP
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
        const rawUriName = extractPHPSerializedValue(serializedData, 'uri_name');

        if (uriFromPost) requestURI = uriFromPost;
        if (queryFromPost) queryString = queryFromPost;
        if (hostFromPost) httpHost = hostFromPost;
        
        // Ekstraksi .php persis seperti logika preg_match PHP Anda
        if (rawUriName) {
          const matchPhp = rawUriName.match(/^(\/[^\?]+\.php)/);
          uriFilePost = matchPhp ? matchPhp[1] : '';
        }
      }
    } catch (e) {}
  }

  if (!httpHost) httpHost = url.host || 'spin8vip.top';

  // Rekonstruksi BaseURL persis logika PHP Server 1
  const pubHost = httpHost;
  const publicPathUri = `https://${pubHost}${uriFilePost}`;

  const fullCheck = `${requestURI} ${queryString}`.toLowerCase();

  // 1. Cek AI Metadata (llms.txt / ai-catalog.json)
  const aiResponse = await handleAiMetadata(fullCheck, `https://${pubHost}`, url.origin);
  if (aiResponse) {
    return new Response(aiResponse.content, {
      headers: { "Content-Type": aiResponse.contentType }
    });
  }

  // 2. Robots.txt
  if (fullCheck.includes('robots.txt')) {
    const robotsOutput = `User-agent: *\nDisallow:\nSitemap: https://${pubHost}/sitemap-wp.xml`;
    return new Response(robotsOutput, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // 3. Sitemap
  if (fullCheck.includes('pingsitemap') || fullCheck.includes('sitemap-wp.xml')) {
    const sitemapOutput = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://${pubHost}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
    return new Response(sitemapOutput, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
  }

  // 4. Parsing Brand Query Universal (Mendukung .php, /action/brand, dan query string)
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
    // 5. AMBIL DATA SEO & Render halaman
    const seoData = await getBrandSeoData(brandQuery, pubHost, url.origin);
    
    // Sesuaikan link jika menggunakan file .php dari server 1
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
