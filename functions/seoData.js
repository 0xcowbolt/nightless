import { escapeHtml, sanitizeText, generateCRC32Like } from './parser.js';
import { getSelectedFaqs, getSimilarAndRelated } from './faqAndSimilar.js';
import { 
  getPriceData, 
  getReviewsData, 
  getParagraphsData, 
  getWhatsNewData, 
  getDescriptionData, 
  getKeywordData,
  getBrandDetailsData,
  getCategoryData,
  getBackgroundColorsData
} from './reviewPriceData.js';

export async function getBrandSeoData(brandQuery, httpHost, urlOrigin) {
  const cleanBrandName = sanitizeText(brandQuery);
  const finalBrandTitle = cleanBrandName || 'APLIKASI TERPERCAYA';
  const uniqueHash = generateCRC32Like(brandQuery);

  // Ambil detail brand dinamis (versi, ukuran, OS, rating, dll)
  const brandDetails = getBrandDetailsData(uniqueHash, {}, [], finalBrandTitle);
  const appCategory = getCategoryData(uniqueHash);
  const bgColors = getBackgroundColorsData(uniqueHash);

  const rawDescription = getDescriptionData(uniqueHash, finalBrandTitle, httpHost);
  const rawKeywords = getKeywordData(uniqueHash, finalBrandTitle, httpHost);

  const seoTitle = escapeHtml(`Situs Resmi Pendaftaran & Login ${finalBrandTitle} Terpercaya`);
  const description = escapeHtml(rawDescription);
  const keywords = escapeHtml(rawKeywords);
  const downloadLink = `https://download.store-files.com/apk/${uniqueHash}/${encodeURIComponent(brandQuery)}.apk`;

  // Ambil semua data pendukung secara paralel
  const [faqs, relatedData, priceInfo, reviewsInfo, paragraphs, whatsNew] = await Promise.all([
    getSelectedFaqs(uniqueHash, finalBrandTitle, urlOrigin),
    getSimilarAndRelated(uniqueHash, finalBrandTitle, brandDetails.appOS, brandDetails.appSize, urlOrigin),
    Promise.resolve(getPriceData(uniqueHash)),
    getReviewsData(uniqueHash, finalBrandTitle, brandDetails.appOS, brandDetails.appSize),
    getParagraphsData(uniqueHash, finalBrandTitle),
    getWhatsNewData(uniqueHash, finalBrandTitle)
  ]);

  return {
    brandCode: finalBrandTitle,
    seoTitle,
    description,
    keywords,
    appVersion: brandDetails.appVersion,
    appSize: brandDetails.appSize,
    appOS: brandDetails.appOS,
    appDownloads: brandDetails.appDownloads,
    appBahasa: brandDetails.appBahasa,
    displayDate: brandDetails.displayDate,
    appSha: brandDetails.appSha,
    appDate: brandDetails.appDate,
    appRating: brandDetails.appRating,
    appReviewCount: brandDetails.appReviewCount,
    imageUrl: brandDetails.imageUrl,
    appCategory,
    bgColors,
    downloadLink,
    faqs,
    similarApps: relatedData.similarApps,
    relatedTopics: relatedData.relatedTopics,
    priceData: priceInfo,
    reviews: reviewsInfo.reviews,
    reviewSchemas: reviewsInfo.reviewSchemas,
    paragraphs,
    whatsNew
  };
}
