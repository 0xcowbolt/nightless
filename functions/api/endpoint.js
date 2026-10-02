// Fungsi pembantu verifikasi HMAC
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

  // Ambil parameter slug atau id dari URL query (contoh: ?slug=whatsapp-terbaru) atau POST
  const slugParam = url.searchParams.get('slug') || url.searchParams.get('id') || 'default-app';
  const format = url.searchParams.get('format') || 'html'; // default merender tampilan HTML unduh

  // Proses string secara stateless
  const cleanTitle = slugParam.replace(/[\/\-_.]/g, ' ').replace(/\bapk\b/gi, '').trim().toUpperCase();
  const uniqueHash = generateCRC32Like(slugParam);
  const pageTitle = `Download ${cleanTitle || 'Aplikasi'} Versi Terbaru`;
  const pageDesc = `Unduh aplikasi ${cleanTitle || 'aplikasi'} resmi dengan aman, cepat, dan versi terlengkap untuk Android.`;
  const downloadLink = `https://download.store-files.com/apk/${uniqueHash}/${slugParam}.apk`;

  // Jika format yang diminta adalah JSON (biasanya di-fetch oleh subdomain AMP)
  if (format === 'json' || request.headers.get('accept')?.includes('application/json')) {
    return new Response(JSON.stringify({
      status: "success",
      data: {
        id: slugParam,
        title: pageTitle,
        description: pageDesc,
        download_link: downloadLink,
        crc32: uniqueHash
      }
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  // Jika diakses biasa, ambil template HTML tampilan unduh dari folder public
  const templateUrl = `${url.origin}/templates/download-page.html`;
  let htmlTemplate = '<h1>Template Not Found</h1>';
  
  try {
    const res = await fetch(templateUrl);
    if (res.ok) {
      htmlTemplate = await res.text();
    }
  } catch (e) {
    // Fallback error
  }

  // Inject data ke template tampilan unduh
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
