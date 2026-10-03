export function renderDownloadPage(data) {
  const { seoTitle, description, downloadLink, brandCode, appVersion, appSize, appDownloads, appRating } = data;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoTitle}</title>
  <meta name="description" content="${description}">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3); max-width: 440px; width: 100%; padding: 35px 25px; text-align: center; }
    .logo-badge { display: inline-block; background: #3b82f6; color: #fff; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 20px; margin-bottom: 20px; letter-spacing: 1px; text-transform: uppercase; }
    h1 { font-size: 20px; color: #fff; margin-bottom: 12px; line-height: 1.4; }
    p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
    .meta-info { display: flex; justify-content: space-around; background: #0f172a; padding: 10px; border-radius: 8px; font-size: 12px; color: #cbd5e1; margin-bottom: 25px; }
    .btn-download { display: block; background: #22c55e; color: #fff; text-align: center; padding: 15px 20px; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 16px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4); transition: background 0.2s; }
    .btn-download:hover { background: #16a34a; }
    .footer-note { font-size: 12px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-badge">Official APK - ${brandCode}</div>
    <h1>${seoTitle}</h1>
    <p>${description}</p>
    <div class="meta-info">
      <div>Versi: <strong>${appVersion}</strong></div>
      <div>Ukuran: <strong>${appSize}</strong></div>
      <div>Rating: <strong>⭐ ${appRating}</strong></div>
    </div>
    <a href="${downloadLink}" class="btn-download">DOWNLOAD APK RESMI</a>
    <div class="footer-note">Unduhan Aman, Cepat, & Terverifikasi</div>
  </div>
</body>
</html>`;
}
