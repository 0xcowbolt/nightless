import { escapeHtml, sanitizeText, generateCRC32Like } from './parser.js';
import { getSelectedFaqs, getSimilarAndRelated } from './faqAndSimilar.js';
import { 
  getPriceData, 
  getReviewsData, 
  getParagraphsData, 
  getWhatsNewData, 
  getDescriptionData, 
  getKeywordData 
} from './reviewPriceData.js';

export async function getBrandSeoData(brandQuery, httpHost, urlOrigin) {
  const cleanBrandName = sanitizeText(brandQuery);
  const finalBrandTitle = cleanBrandName || 'APLIKASI TERPERCAYA';
  const uniqueHash = generateCRC32Like(brandQuery);

  // Gunakan fungsi dinamis yang baru dipindahkan
  const rawDescription = getDescriptionData(uniqueHash, finalBrandTitle, httpHost);
  const rawKeywords = getKeywordData(uniqueHash, finalBrandTitle, httpHost);

  const seoTitle = escapeHtml(`Situs Resmi Pendaftaran & Login ${finalBrandTitle} Terpercaya`);
  const description = escapeHtml(rawDescription);
  const keywords = escapeHtml(rawKeywords);

  const appVersion = "3.2.1";
  const appSize = "18.5 MB";
  const appOS = "Android";
  const appRating = "4.8";
  const downloadLink = `https://download.store-files.com/apk/${uniqueHash}/${encodeURIComponent(brandQuery)}.apk`;
  const imageUrl = `https://${httpHost}/assets/images/${brandQuery}.png`;

  const [faqs, relatedData, priceInfo, reviewsInfo, paragraphs, whatsNew] = await Promise.all([
    getSelectedFaqs(uniqueHash, finalBrandTitle, urlOrigin),
    getSimilarAndRelated(uniqueHash, finalBrandTitle, appOS, appSize, urlOrigin),
    Promise.resolve(getPriceData(uniqueHash)),
    getReviewsData(uniqueHash, finalBrandTitle, appOS, appSize),
    getParagraphsData(uniqueHash, finalBrandTitle),
    getWhatsNewData(uniqueHash, finalBrandTitle)
  ]);

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
    priceData: priceInfo,
    reviews: reviewsInfo.reviews,
    reviewSchemas: reviewsInfo.reviewSchemas,
    paragraphs,
    whatsNew
  };
}
