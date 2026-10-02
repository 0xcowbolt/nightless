import { escapeHtml, sanitizeText, generateCRC32Like } from './parser.js';

export function getBrandSeoData(brandQuery, httpHost) {
  const cleanBrandName = sanitizeText(brandQuery);
  const finalBrandTitle = cleanBrandName || 'APLIKASI TERPERCAYA';
  const uniqueHash = generateCRC32Like(brandQuery);

  // 1. Title & Deskripsi Utama (Setara getSeoTitles & getDescriptionData)
  const seoTitle = escapeHtml(`Situs Resmi Pendaftaran & Login ${finalBrandTitle} Terpercaya`);
  const description = escapeHtml(`Link alternatif resmi ${finalBrandTitle} versi terbaru. Mainkan game gacor dan unduh aplikasinya dengan aman dan cepat.`);
  
  // 2. Keywords (Setara getKeywordData)
  const keywords = escapeHtml(`${finalBrandTitle}, login ${finalBrandTitle}, link alternatif ${finalBrandTitle}, daftar ${finalBrandTitle}, apk ${finalBrandTitle}`);

  // 3. Detail Aplikasi Pendukung (Versi, Ukuran, Rating, dll)
  const appVersion = "3.2.1";
  const appSize = "18.5 MB";
  const appOS = "Android";
  const appDownloads = "100.000+";
  const appRating = "4.8";
  const appCategory = "Gaming & Entertainment";

  // 4. Download Link & Image URL
  const downloadLink = `https://download.store-files.com/apk/${uniqueHash}/${encodeURIComponent(brandQuery)}.apk`;
  const imageUrl = `https://${httpHost}/assets/images/${brandQuery}.png`;

  // 5. Data Tambahan (FAQ, WhatsNew, Background Colors - Opsional untuk pengembangan)
  const paragraphs = `${finalBrandTitle} adalah platform digital dan hiburan terkemuka yang menawarkan pengalaman bermain game online yang mulus, aman, dan responsif di berbagai perangkat seluler.`;
  const whatsNew = `Pembaruan sistem keamanan terbaru, peningkatan kecepatan unduh APK, serta penambahan server game anti-lag.`;

  return {
    brandCode: finalBrandTitle,
    seoTitle,
    description,
    keywords,
    appVersion,
    appSize,
    appOS,
    appDownloads,
    appRating,
    appCategory,
    imageUrl,
    downloadLink,
    paragraphs,
    whatsNew
  };
}
