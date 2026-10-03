import { escapeHtml, sanitizeText, generateCRC32Like } from './parser.js';
import { getSelectedFaqs, getSimilarAndRelated } from './faqAndSimilar.js';
import { getPriceData, getReviewsData, getParagraphsData } from './reviewPriceData.js';

export async function getBrandSeoData(brandQuery, httpHost, urlOrigin) {
  const cleanBrandName = sanitizeText(brandQuery);
  const finalBrandTitle = cleanBrandName || 'APLIKASI TERPERCAYA';
  const uniqueHash = generateCRC32Like(brandQuery);

  // 1. Data SEO Utama
  const seoTitle = escapeHtml(`Situs Resmi Pendaftaran & Login ${finalBrandTitle} Terpercaya`);
  const description = escapeHtml(`Link alternatif resmi ${finalBrandTitle} versi terbaru. Mainkan game gacor dan unduh aplikasinya dengan aman dan cepat.`);
  const keywords = escapeHtml(`${finalBrandTitle}, login ${finalBrandTitle}, link alternatif ${finalBrandTitle}, daftar ${finalBrandTitle}, apk ${finalBrandTitle}`);

  // 2. Metadata Aplikasi Pendukung
  const appVersion = "3.2.1";
  const appSize = "18.5 MB";
  const appOS = "Android";
  const appRating = "4.8";
  const downloadLink = `https://download.store-files.com/apk/${uniqueHash}/${encodeURIComponent(brandQuery)}.apk`;
  const imageUrl = `https://${httpHost}/assets/images/${brandQuery}.png`;

  // 3. Ambil Semua Data Tambahan (FAQ, Similar Apps, Price, Reviews, Paragraphs) Secara Paralel
  const [faqs, relatedData, priceInfo, reviewsInfo, paragraphs] = await Promise.all([
    getSelectedFaqs(uniqueHash, finalBrandTitle, urlOrigin),
    getSimilarAndRelated(uniqueHash, finalBrandTitle, appOS, appSize, urlOrigin),
    Promise.resolve(getPriceData(uniqueHash)),
    getReviewsData(uniqueHash, finalBrandTitle, appOS, appSize),
    getParagraphsData(uniqueHash, finalBrandTitle)
  ]);

  // 4. Return Objek Terstruktur Lengkap untuk Template HTML
  return {
    brandCode: finalBrandTitle,
    seoTitle,
    description,
    keywords,
    appVersion,
    appSize,
    appOS,
    appRating,
    imageUrl,
    downloadLink,
    faqs,
    similarApps: relatedData.similarApps,
    relatedTopics: relatedData.relatedTopics,
    priceData: priceInfo,          // Berisi appPrice, priceCurrency, isFree
    reviews: reviewsInfo.reviews,  // Berisi list komentar ulasan
    reviewSchemas: reviewsInfo.reviewSchemas, // Berisi JSON-LD schema review
    paragraphs                     // Berisi array paragraf dinamis
  };
}
