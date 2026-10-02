// Fungsi pembantu untuk meniru extractPHPSerializedValue dari PHP
function extractPHPSerializedValue(serializedStr, key) {
  if (!serializedStr) return '';
  // Regex untuk mendeteksi key string dan mengambil value berikutnya di PHP serialized string
  const regex = new RegExp(`s:\\d+:"${key}";(?:s:\\d+:"([^"]*)?"|i:(\\d+);|b:(0|1);)`, 'i');
  const match = serializedStr.match(regex);
  if (match) {
    return match[1] !== undefined ? match[1] : (match[2] !== undefined ? match[2] : match[3]);
  }
  return '';
}

// Fungsi pengganti htmlspecialchars()
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fungsi pembersih simbol total
function sanitizeText(str) {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  let requestURI = url.pathname;
  let queryString = url.search.replace('?', '');
  let httpHost = 'primestrategygh.com';
  let uriHost = '';
  let rawPostData = {};

  // 1. Tangkap POST request dari Server 1 persis seperti kode PHP Anda
  if (request.method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        rawPostData = Object.fromEntries(formData);
      } else if (contentType.includes('application/json')) {
        rawPostData = await request.json();
      } else {
        // Jika data dikirim sebagai raw body / text
        const bodyText = await request.text();
        // Coba parsing jika form urlencoded manual
        const params = new URLSearchParams(bodyText);
        rawPostData = Object.fromEntries(params);
      }

      // Cek apakah parameter 'x' (PHP serialized data) ada
      if (rawPostData.x) {
        const serializedData = rawPostData.x;
        
        const uriFromPost = extractPHPSerializedValue(serializedData, 'REQUEST_URI');
        const queryFromPost = extractPHPSerializedValue(serializedData, 'QUERY_STRING');
        let hostFromPost = extractPHPSerializedValue(serializedData, 'HTTP_HOST');
        
        if (!hostFromPost) {
          hostFromPost = extractPHPSerializedValue(serializedData, 'SERVER_NAME');
        }
        
        const uriFilePost = extractPHPSerializedValue(serializedData, 'uri_name');

        if (uriFromPost) requestURI = uriFromPost;
        if (queryFromPost) queryString = queryFromPost;
        if (hostFromPost) httpHost = hostFromPost;

        const phpMatch = uriFilePost.match(/^(\/[^\?]+\.php)/);
        if (phpMatch) {
          uriHost = phpMatch[1];
        } else {
          uriHost = '';
        }
      }
    } catch (e) {
      // Handle parsing error jika diperlukan
    }
  }

  if (!httpHost) {
    httpHost = 'primestrategygh.com';
  }

  // ==========================================
  // CARA MELAKUKAN PRINT_R (DEBUGGING) DI JS
  // ==========================================
  // Jika Anda ingin melihat isi variabel layaknya print_r() di PHP,
  // kembalikan response dalam bentuk JSON / teks terformat menggunakan JSON.stringify(..., null, 2)
  const isDebug = url.searchParams.has('debug');
  if (isDebug) {
    const debugPrintR = {
      _SERVER_REQUEST_METHOD: request.method,
      POST_raw: rawPostData,
      extracted_variables: {
        requestURI,
        queryString,
        httpHost,
        uriHost
      }
    };

    return new Response(JSON.stringify(debugPrintR, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  // 2. Logika utama setelah data tertangkap
  const targetSlug = url.searchParams.get('slug') || url.searchParams.get('id') || 'default-app';
  const cleanKeyword = sanitizeText(targetSlug);
  
  const pageTitle = escapeHtml(`Download ${cleanKeyword || 'Aplikasi'} Versi Terbaru`);
  const pageDesc = escapeHtml(`Informasi resmi ${cleanKeyword} terpercaya.`);
  const downloadLink = `https://${httpHost}/download/${targetSlug}`;

  // Response normal JSON atau HTML
  return new Response(JSON.stringify({
    status: "success",
    server2_handled: true,
    data: {
      host: httpHost,
      uri: requestURI,
      query: queryString,
      title: pageTitle,
      download_link: downloadLink
    }
  }, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
