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

export function getBrandDetailsData(uniqueKey, whitelistData = {}, randomData = [], seoBrandName = 'DefaultBrand') {
  const uriHash = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;
  const rng = new SeededRandom(uriHash);

  let currentBrand = null;
  let brandName = '';

  if (whitelistData && typeof whitelistData === 'object' && whitelistData[uniqueKey]) {
    currentBrand = whitelistData[uniqueKey];
    brandName = currentBrand['name'] ? currentBrand['name'] : seoBrandName;
  } else {
    if (randomData && Array.isArray(randomData) && randomData.length > 0) {
      const randomIndex = rng.rand(0, randomData.length - 1);
      const randomPick = randomData[randomIndex];

      brandName = randomPick['name'] ? randomPick['name'] : seoBrandName;
      currentBrand = {
        version: randomPick['version'] || '1.0.0',
        fileSize: randomPick['fileSize'] || '15 MB',
        androidOS: randomPick['androidOS'] || 'Android 8.0+',
        unduhan: randomPick['unduhan'] || '100,000+',
        bahasa: randomPick['bahasa'] || 'Indonesia',
        Diperbarui: randomPick['Diperbarui'] || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        sha: randomPick['sha'] || 'SHA256: ' + generateCRC32Like(uniqueKey)
      };
    } else {
      brandName = seoBrandName;
      
      // Format tanggal mundur acak
      const daysAgo = rng.rand(1, 30);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - daysAgo);
      const formattedDateString = targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      currentBrand = {
        version: `${rng.rand(1, 10)}.${rng.rand(0, 9)}.${rng.rand(10, 999)}`,
        fileSize: `${rng.rand(10, 500)}.${rng.rand(1, 9)} MB`,
        androidOS: `Android ${rng.rand(5, 12)}.0+`,
        unduhan: `${(rng.rand(50, 5000) * 1000).toLocaleString('id-ID')}+`,
        bahasa: `Indonesia (${rng.rand(1, 52)} lainnya)`,
        Diperbarui: formattedDateString,
        sha: 'SHA256: ' + generateCRC32Like(uniqueKey + rng.rand())
      };
    }
  }

  const appVersion = currentBrand['version'];
  const appSize = currentBrand['fileSize'];
  const appOS = currentBrand['androidOS'];
  const appDownloads = currentBrand['unduhan'];
  const appBahasa = currentBrand['bahasa'];
  const displayDate = currentBrand['Diperbarui'];
  const appSha = currentBrand['sha'];
  
  // Format tanggal ISO (Y-m-d\TH:i:sP)
  const parsedDateObj = new Date(displayDate);
  const appDate = !isNaN(parsedDateObj) ? parsedDateObj.toISOString() : new Date().toISOString();

  const hurufPertama = brandName ? brandName.charAt(0).toUpperCase() : 'A';
  const imageUrl = `https://dummyimage.com/240x240/007a99/ffffff.png&text=${hurufPertama}`;

  const appRating = (rng.rand(38, 49) / 10).toFixed(1);
  const appReviewCount = rng.rand(1000, 99999);

  return {
    brandName,
    appVersion,
    appSize,
    appOS,
    appDownloads,
    appBahasa,
    displayDate,
    appSha,
    appDate,
    imageUrl,
    appRating,
    appReviewCount
  };
}

// 8. Get Category Data
export function getCategoryData(uniqueKey) {
  const categories = ['Pendidikan', 'Petualangan', 'Kasual', 'Game', 'Alat', 'Produktivitas', 'GameApplication', 'Strategi', 'Kartu', 'Multiplayer'];
  const uriHash = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;
  const rng = new SeededRandom(uriHash);

  const categoryIndex = rng.rand(0, categories.length - 1);
  return categories[categoryIndex];
}

// 9. Get Image URL Data
export function getImageUrlData(brandName) {
  const hurufPertama = brandName ? brandName.charAt(0).toUpperCase() : 'A';
  return `https://dummyimage.com/240x240/007a99/ffffff.png&text=${hurufPertama}`;
}

// 10. Get Background Colors Data
export function getBackgroundColorsData(uniqueKey) {
  const bgColors = ['007a99', '1a1a1a', '7a0000', '004d1a', '4d004d', '996600'];
  const hashNum = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;
  const count = bgColors.length;

  return {
    bg1: bgColors[hashNum % count],
    bg2: bgColors[(hashNum >> 1) % count],
    bg3: bgColors[(hashNum >> 2) % count],
    bg4: bgColors[(hashNum >> 3) % count]
  };
}
