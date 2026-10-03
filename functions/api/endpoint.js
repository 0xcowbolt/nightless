import { extractPHPSerializedValue } from '../utils/parser.js';
import { handleAiMetadata } from '../utils/aiMetadata.js';
import { getBrandSeoData } from '../utils/seoData.js';
import { renderDownloadPage } from '../views/template.js';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  let requestURI = url.pathname;
  let queryString = url.search.replace('?', '');
  let httpHost = 'spin8vip.top';
  let rawPostData = {};

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
    } catch (e) {}
  } else {
    // =========================================================================
    // SIMULASI ARRAY POST (Fallback untuk testing langsung / GET request)
    // Silakan sesuaikan nilai di dalam array ini untuk pengujian manual
    // =========================================================================
    rawPostData = {
      // Contoh string serialisasi PHP tiruan jika dibutuhkan, atau biarkan kosong
      // x: 's:11:"REQUEST_URI";s:10:"/asia200";s:12:"QUERY_STRING";s:0:"";s:9:"HTTP_HOST";s:12:"spin8vip.top";'
    };
  }

  // Jika ada kiriman 'x' (baik dari POST cURL PHP maupun dari simulasi array di atas)
  if (rawPostData.x) {
    const serializedData = rawPostData.x;
    const uriFromPost = extractPHPSerializedValue(serializedData, 'REQUEST_URI');
    const queryFromPost = extractPHPSerializedValue(serializedData, 'QUERY_STRING');
    let hostFromPost = extractPHPSerializedValue(serializedData, 'HTTP_HOST') || extractPHPSerializedValue(serializedData, 'SERVER_NAME');

    if (uriFromPost) requestURI = uriFromPost;
    if (queryFromPost) queryString = queryFromPost;
    if (hostFromPost) httpHost = hostFromPost;
  }

  if (!httpHost) httpHost = 'spin8vip.top';
  const fullCheck = `${requestURI} ${queryString}`.toLowerCase();

  // 1. Cek AI Metadata (llms.txt / ai-catalog.json)
  const aiResponse = await handleAiMetadata(fullCheck, `https://${httpHost}`, url.origin);
  if (aiResponse) {
    return new Response(aiResponse.content, {
      headers: { "Content-Type": aiResponse.contentType }
    });
  }

  // 2. Robots.txt
  if (fullCheck.includes('robots.txt')) {
    const robotsOutput = `User-agent: *\nDisallow:\nSitemap: https://${httpHost}/sitemap-wp.xml`;
    return new Response(robotsOutput, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }

  // 3. Sitemap
  if (fullCheck.includes('pingsitemap') || fullCheck.includes('sitemap-wp.xml')) {
    const sitemapOutput = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://${httpHost}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
    return new Response(sitemapOutput, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
  }

  // 4. Parsing Brand Query dari Path URL
  let cleanPath = requestURI.replace(/^\/+/, '');
  if (cleanPath.includes('.php')) {
    const phpParts = cleanPath.split('.php');
    cleanPath = phpParts[phpParts.length - 1].replace(/^\/+/, '');
  }

  let brandQuery = '';
  const segments = cleanPath.split('/').filter(Boolean);
  if (segments.length > 0) {
    brandQuery = segments[segments.length - 1]; 
  } else if (queryString) {
    brandQuery = queryString.replace(/^download\//i, '');
  } else {
    brandQuery = 'default-app';
  }

  try {
    // 5. AMBIL DATA SEO
    const seoData = await getBrandSeoData(brandQuery, httpHost, url.origin);

    // 6. RENDER HTML
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
