import { generateCRC32Like } from './parser.js';

// Generator CRC32 JavaScript (setara dengan abs(crc32($uniqueKey)))
function getCrc32Number(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Pseudo-random generator berbasis seed (Pengganti mt_srand di PHP)
class SeededRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Fungsi shuffle konsisten dengan SeededRandom
function seededShuffle(array, seed) {
  const rng = new SeededRandom(seed);
  let currentIndex = array.length, randomIndex, temporaryValue;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(rng.next() * currentIndex);
    currentIndex--;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// 1. Ambil FAQ Terpilih
export async function getSelectedFaqs(uniqueKey, brandName, urlOrigin) {
  const formattedBrand = brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
  let masterFaqs = [];

  try {
    const res = await fetch('https://sweet-mode-a6d9.kontrirod.workers.dev/faqs.json');
    if (res.ok) {
      masterFaqs = await res.json();
    }
  } catch (e) {}

  // Fallback FAQ jika worker gagal diakses
  if (!masterFaqs || masterFaqs.length === 0) {
    masterFaqs = [
      { q: "Bagaimana cara mengunduh aplikasi {brand}?", a: "Anda dapat menekan tombol download resmi yang tersedia di halaman ini untuk mendapatkan versi terbaru dari {brand}." },
      { q: "Apakah aman menginstal {brand}?", a: "Ya, seluruh file APK {brand} telah melalui pemindaian keamanan dan terverifikasi aman untuk perangkat seluler." }
    ];
  }

  const limitFaqs = 6;
  const hashNum = getCrc32Number(uniqueKey) || 12345;
  
  let tempFaqs = [...masterFaqs];
  tempFaqs = seededShuffle(tempFaqs, hashNum);

  const rawSelectedFaqs = tempFaqs.slice(0, limitFaqs);
  const selectedFaqs = rawSelectedFaqs.map(faq => ({
    q: faq.q.replace(/\{brand\}/g, formattedBrand),
    a: faq.a.replace(/\{brand\}/g, formattedBrand)
  }));

  return selectedFaqs;
}

// 2. Ambil Similar Apps & Related Topics (Menggunakan Nama Brand Asli untuk Internal Link SEO)
export async function getSimilarAndRelated(uniqueKey, brandCode, appOS = 'Android', appSize = '18.5 MB', urlOrigin) {
  const formattedBrand = brandCode.charAt(0).toUpperCase() + brandCode.slice(1).toLowerCase();
  const currentHash = getCrc32Number(uniqueKey) || 12345;
  const rng = new SeededRandom(currentHash);

  // Ambil daftar brand dari brands.txt
  let brandsList = [];
  try {
    const txtRes = await fetch(`${urlOrigin}/brands.txt`);
    if (txtRes.ok) {
      const textData = await txtRes.text();
      brandsList = textData.split('\n').map(b => b.trim()).filter(Boolean);
    }
  } catch (e) {}

  let brandNames = brandsList.map(b => b.charAt(0).toUpperCase() + b.slice(1).toLowerCase());
  if (brandNames.length === 0) {
    brandNames = [formattedBrand, 'K200m', 'Stmtoto', 'Togel2win'];
  }

  // Acak konsisten berdasarkan hash
  brandNames = seededShuffle(brandNames, currentHash);

  // Tempatkan brand aktif di urutan pertama
  brandNames = brandNames.filter(b => b.toLowerCase() !== formattedBrand.toLowerCase());
  brandNames.unshift(formattedBrand);
  const brandCount = brandNames.length;

  const displayWords = [
    'Unduh Resmi', 'Update Versi Terbaru', 'Installer Cepat', 
    'Aplikasi Mobile', 'Paket Instalasi', 'Download Aman', 
    'Client Resmi', 'Pusat Unduhan', 'File APK', 'Dukungan Perangkat'
  ];
  
  const similarApps = [];
  const relatedTopics = [];

  const actionsList = ['download', 'install', 'apk', 'app', 'update', 'mobile'];
  const rng = new SeededRandom(currentHash);

  // Generate Similar Apps
  for (let i = 0; i < 8; i++) {
    const currentBrandName = (i === 0) ? formattedBrand : brandNames[i % brandCount];
    const randomWord = displayWords[Math.floor(rng.next() * displayWords.length)];
    
    // FORMAT BARU: /{action}/{brandname}
    const brandSlug = currentBrandName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomAction = actionsList[Math.floor(rng.next() * actionsList.length)];
    const randomUriSlug = `/${randomAction}/${brandSlug}`;

    similarApps.push({
      title: `${currentBrandName} - ${randomWord} (${appSize})`,
      slug: randomUriSlug,
      firstLetter: currentBrandName.charAt(0).toUpperCase(),
      bgHex: Math.floor(rng.next() * 16777215).toString(16)
    });
  }

  // Generate Related Topics
  const topicActions = [
    `Unduh Sekarang untuk ${appOS}`,
    `Pembaruan Resmi ${appOS}`,
    `File Instalasi Terverifikasi`,
    `Panduan Download Aman`
  ];

  for (let i = 0; i < 12; i++) {
    const currentBrandName = brandNames[(i + 1) % brandCount];
    const brandSlug = currentBrandName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomAction = actionsList[Math.floor(rng.next() * actionsList.length)];
    const randomUriSlug = `/${randomAction}/${brandSlug}`;

    relatedTopics.push({
      title: `${currentBrandName} - ${topicActions[i % topicActions.length]}`,
      slug: randomUriSlug
    });
  }

  return { similarApps, relatedTopics };
}
