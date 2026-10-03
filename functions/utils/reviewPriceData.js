import { generateCRC32Like } from './parser.js';

class SeededRandom {
  constructor(seed) {
    this.seed = Math.abs(seed) % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  rand(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// 1. Get Price Data
export function getPriceData(uniqueKey) {
  const uriHash = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;
  const rng = new SeededRandom(uriHash);

  const isFree = rng.rand(1, 10) > 8;
  let appPrice = "0";

  if (!isFree) {
    const randomMultiplier = rng.rand(3, 50);
    appPrice = String(randomMultiplier * 5000);
  }

  return {
    appPrice,
    priceCurrency: "IDR",
    isFree
  };
}

// 2. Get Reviews Data
export async function getReviewsData(uniqueKey, brandName, appOS = 'Android', appSize = '15 MB') {
  const formattedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
  
  let names = [];
  let commentTemplates = [];

  try {
    const [namesRes, commentsRes] = await Promise.all([
      fetch('https://sweet-mode-a6d9.kontrirod.workers.dev/names.json'),
      fetch('https://sweet-mode-a6d9.kontrirod.workers.dev/comments.json')
    ]);

    if (namesRes.ok) names = await namesRes.json();
    if (commentsRes.ok) commentTemplates = await commentsRes.json();
  } catch (e) {}

  if (!names.length) names = ["Budi Santoso", "Siti Rahma", "Ahmad Fauzi", "Dewi Lestari"];
  if (!commentTemplates.length) commentTemplates = ["Aplikasi {brand} sangat membantu dan proses unduhnya cepat untuk {os} ({size})."];

  const baseHash = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;
  const brandHash = parseInt(generateCRC32Like(brandName), 16) || 54321;
  const pageSeed = baseHash + brandHash;

  const rng = new SeededRandom(pageSeed);
  const totalReviews = rng.rand(5, 7);

  const reviews = [];
  const reviewSchemas = [];

  for (let i = 0; i < totalReviews; i++) {
    const starsCount = rng.rand(4, 5);
    const templateIndex = rng.rand(0, commentTemplates.length - 1);
    const randomTemplate = commentTemplates[templateIndex] || commentTemplates[0];

    const commentText = randomTemplate
      .replace(/\{brand\}/g, formattedBrand)
      .replace(/\{os\}/g, appOS)
      .replace(/\{size\}/g, appSize);

    const nameIndex = rng.rand(0, names.length - 1);
    const reviewerName = names[nameIndex] || "Pengguna Setia";
    const timeAgo = rng.rand(1, 6) + ' hari yang lalu';
    const avatarRand = rng.rand(1, 70);

    reviews.push({
      name: reviewerName,
      avatar: avatarRand,
      time: timeAgo,
      stars: '★'.repeat(starsCount) + '☆'.repeat(5 - starsCount),
      comment: commentText
    });

    reviewSchemas.push({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": String(starsCount)
      },
      "author": {
        "@type": "Person",
        "name": reviewerName
      },
      "reviewBody": commentText
    });
  }

  return { reviews, reviewSchemas };
}

// 3. Get Paragraphs Data
export async function getParagraphsData(uniqueKey, brandName = '') {
  let masterParagraphs = [];

  try {
    const res = await fetch('https://sweet-mode-a6d9.kontrirod.workers.dev/paragraphs.json');
    if (res.ok) masterParagraphs = await res.json();
  } catch (e) {}

  if (!masterParagraphs.length) {
    masterParagraphs = [
      "{brand} adalah platform digital terkemuka yang menyediakan akses layanan dan unduhan aplikasi resmi secara cepat.",
      "Nikmati kenyamanan dan keamanan penuh saat menggunakan layanan dari {brand} di perangkat Anda."
    ];
  }

  const limitParagraphs = 5;
  let tempParagraphs = masterParagraphs.map((paragraph, index) => {
    const sortKey = parseInt(generateCRC32Like(`${index}_${uniqueKey}`), 16) || index;
    return { paragraph, sortKey };
  });

  tempParagraphs.sort((a, b) => a.sortKey - b.sortKey);

  const rawSelected = tempParagraphs.slice(0, limitParagraphs);
  const selectedParagraphs = rawSelected.map(item => {
    let pText = item.paragraph;
    if (brandName) {
      const formattedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
      pText = pText.replace(/\{brand\}/g, formattedBrand);
    }
    return pText;
  });

  return selectedParagraphs;
}

// 4. Get What's New Data
export async function getWhatsNewData(uniqueKey, brandName = '') {
  let masterWhatsNew = [];

  try {
    const res = await fetch('https://sweet-mode-a6d9.kontrirod.workers.dev/whatsnew.json');
    if (res.ok) masterWhatsNew = await res.json();
  } catch (e) {}

  if (!masterWhatsNew.length) {
    masterWhatsNew = [
      "Pembaruan sistem keamanan dan enkripsi data terbaru untuk {brand}.",
      "Optimalisasi kecepatan unduh file APK dan peningkatan kestabilan server."
    ];
  }

  const uniqueHashNum = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;
  let countWhatsNew = 4 + (uniqueHashNum % 3);
  if (countWhatsNew < 4) countWhatsNew = 4;

  let tempWhatsNew = masterWhatsNew.map((item, index) => {
    const sortKey = parseInt(generateCRC32Like(`${index}_${uniqueKey}`), 16) || index;
    return { item, sortKey };
  });

  tempWhatsNew.sort((a, b) => a.sortKey - b.sortKey);

  const rawSelected = tempWhatsNew.slice(0, countWhatsNew);
  return rawSelected.map(wrapper => {
    let item = wrapper.item;
    if (brandName && typeof item === 'string') {
      const formattedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
      item = item.replace(/\{brand\}/g, formattedBrand);
    }
    return item;
  });
}

// 5. Get Description Data (Baru Ditambahkan)
export function getDescriptionData(uniqueKey, brandName, pubHost = '') {
  const formattedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
  let finalDescription = '';

  const fallbackTemplates = [
    `Unduh aplikasi resmi ${formattedBrand} melalui ${pubHost} · Nikmati pengalaman akses yang lebih cepat, aman, dan stabil langsung dari perangkat Anda.`,
    `Dapatkan file instalasi terbaru ${formattedBrand} di ${pubHost} : Kemudahan login, navigasi optimal, serta performa aplikasi terbaik khusus pengguna ${pubHost}.`,
    `Pusat unduhan resmi ${formattedBrand} terpercaya / Akses tautan unduh ${pubHost} sekarang juga untuk mendapatkan pembaruan aplikasi versi terbaru dengan mudah.`,
    `Install aplikasi ${formattedBrand} sekarang lewat ${pubHost} → Desain antarmuka yang ringan dan responsif memastikan kenyamanan maksimal di setiap penggunaan.`,
    `Nikmati kemudahan mengunduh ${formattedBrand} langsung melalui portal ${pubHost} · Cepat, aman, dan kompatibel untuk berbagai perangkat seluler Anda.`,
    `${formattedBrand} versi terbaru kini hadir di ${pubHost} : Unduh aplikasinya sekarang dan rasakan kemudahan akses tanpa hambatan.`,
    `Portal unduhan resmi ${formattedBrand} untuk ${pubHost} / Dapatkan file APK/aplikasi dengan proses instalasi yang cepat dan aman.`,
    `Akses link unduh resmi ${formattedBrand} via ${pubHost} → Solusi praktis dan handal untuk kebutuhan aplikasi seluler Anda hari ini.`,
    `Tautan unduh aplikasi ${formattedBrand} terverifikasi di ${pubHost} · Dapatkan kemudahan akses dengan performa yang optimal.`,
    `Perbarui dan unduh ${formattedBrand} langsung dari ${pubHost} : Nikmati fitur-fitur unggulan dalam satu genggaman.`
  ];

  const uriHash = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;
  const rng = new SeededRandom(uriHash);
  const randomIndex = rng.rand(0, fallbackTemplates.length - 1);
  const selectedTemplate = fallbackTemplates[randomIndex];

  finalDescription = selectedTemplate
    .replace(/\{\{brand\}\}/g, formattedBrand)
    .replace(/\{brand\}/g, formattedBrand)
    .replace(/\{\{pubhost\}\}/gi, pubHost)
    .replace(/\{pubhost\}/gi, pubHost);

  return finalDescription;
}

// 6. Get Keyword Data (Baru Ditambahkan)
export function getKeywordData(uniqueKey, brandName, pubHost = '') {
  const fallbackKeywordArrays = [
    ["unduh aplikasi", "download apk", "link unduh resmi", "pasang aplikasi", "versi terbaru", "portal unduhan", "login", "daftar", "main"],
    ["instalasi aplikasi", "download resmi", "akses unduh", "aplikasi seluler", "file apk terbaru", "pusat download", "login", "daftar", "main"],
    ["unduh file", "download cepat", "link download", "aplikasi mobile", "unduh perangkat", "pasang apk", "login", "daftar", "main"],
    ["download mudah", "situs unduh", "aplikasi resmi", "unduh aman", "pemasangan aplikasi", "download versi terbaru", "login", "daftar", "main"]
  ];

  const uriHash = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;
  const rng = new SeededRandom(uriHash);
  const randomIndex = rng.rand(0, fallbackKeywordArrays.length - 1);
  const selectedKeywordsArray = fallbackKeywordArrays[randomIndex];

  const formattedBrand = brandName.toLowerCase();
  const processedArray = selectedKeywordsArray.map(keyword => `${formattedBrand} ${keyword}`);

  return processedArray.join(', ');
}
