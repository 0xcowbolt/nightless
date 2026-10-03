import { escapeHtml, sanitizeText, generateCRC32Like } from './parser.js';
import { getSelectedFaqs, getSimilarAndRelated } from './faqData.js';

export async function getBrandSeoData(brandQuery, httpHost, urlOrigin) {
  const cleanBrandName = sanitizeText(brandQuery);
  const finalBrandTitle = cleanBrandName || 'APLIKASI TERPERCAYA';
  const uniqueHash = generateCRC32Like(brandQuery);

  const seoTitle = escapeHtml(`Situs Resmi Pendaftaran & Login ${finalBrandTitle} Terpercaya`);
  const description = escapeHtml(`Link alternatif resmi ${finalBrandTitle} versi terbaru. Mainkan game gacor dan unduh aplikasinya dengan aman dan cepat.`);
  const keywords = escapeHtml(`${finalBrandTitle}, login ${finalBrandTitle}, link alternatif ${finalBrandTitle}, daftar ${finalBrandTitle}, apk ${finalBrandTitle}`);

  const appVersion = "3.2.1";
  const appSize = "18.5 MB";
  const appOS = "Android";
  const appRating = "4.8";
  const downloadLink = `[https://download.store-files.com/apk/$](https://download.store-files.com/apk/$){uniqueHash}/${encodeURIComponent(brandQuery)}.apk`;

  // Panggil data FAQ dan Similar Apps secara asynchronous
  const faqs = await getSelectedFaqs(uniqueHash, finalBrandTitle, urlOrigin);
  const relatedData = await getSimilarAndRelated(uniqueHash, finalBrandTitle, appOS, appSize, urlOrigin);

  return {
    brandCode: finalBrandTitle,
    seoTitle,
    description,
    keywords,
    appVersion,
    appSize,
    appOS,
    appRating,
    downloadLink,
    faqs,
    similarApps: relatedData.similarApps,
    relatedTopics: relatedData.relatedTopics
  };
}
