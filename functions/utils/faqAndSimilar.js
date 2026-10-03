import { sanitizeList } from './parser.js';

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
  shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(this.next()Fungsi kompleks seperti `getSelectedFaqs` dan `getSimilarAndRelated` di atas **belum ada** di dalam modul JavaScript Cloudflare Pages kita. Fungsi-fungsi tersebut sebelumnya berada di controller PHP Server 1 Anda, yang memanfaatkan operasi seed acak berbasis CRC32 dan pembacaan array master.

Karena kita sudah memisahkan struktur kode menjadi modular, kita bisa menerjemahkan (porting) logika PHP tersebut ke dalam JavaScript murni agar bisa berjalan di Server 2 (Cloudflare Edge) dengan hasil acak yang konsisten dan presisi.

Berikut adalah cara menerjemahkannya ke dalam modul terpisah:

### 1. Buat File `functions/utils/faqData.js`
Letakkan file ini untuk menangani pengambilan FAQ acak dan aplikasi terkait (`similarApps` & `relatedTopics`) secara konsisten berdasarkan *hash* key:

```javascript
import { generateCRC32Like } from './parser.js';

// Generator pseudo-random berbasis hash (pengganti mt_srand di PHP)
function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function seededShuffle(array, seed) {
  let currentIndex = array.length, randomIndex, temporaryValue;
  let currentSeed = seed;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(seededRandom(currentSeed++) * currentIndex);
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
    const res = await fetch('[https://sweet-mode-a6d9.kontrirod.workers.dev/faqs.json](https://sweet-mode-a6d9.kontrirod.workers.dev/faqs.json)');
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
  const hashNum = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;
  
  let tempFaqs = [...masterFaqs];
  tempFaqs = seededShuffle(tempFaqs, hashNum);

  const rawSelectedFaqs = tempFaqs.slice(0, limitFaqs);
  const selectedFaqs = rawSelectedFaqs.map(faq => ({
    q: faq.q.replace(/\{brand\}/g, formattedBrand),
    a: faq.a.replace(/\{brand\}/g, formattedBrand)
  }));

  return selectedFaqs;
}

// 2. Ambil Similar Apps & Related Topics
export async function getSimilarAndRelated(uniqueKey, brandCode, appOS = 'Android', appSize = '18.5 MB', urlOrigin) {
  const formattedBrand = brandCode.charAt(0).toUpperCase() + brandCode.slice(1).toLowerCase();
  const currentHash = parseInt(generateCRC32Like(uniqueKey), 16) || 12345;

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
  
  const extensions = ['app', 'mobile', 'apk'];
  const similarApps = [];
  const relatedTopics = [];

  // Generate Similar Apps
  for (let i = 0; i < 8; i++) {
    const currentBrandName = (i === 0) ? formattedBrand : brandNames[i % brandCount];
    const randomWord = displayWords[Math.floor(seededRandom(currentHash + i + 100) * displayWords.length)];
    const randomHexSlug = Math.random().toString(16).substring(2, 6);
    const randomExt = extensions[Math.floor(seededRandom(currentHash + i + 150) * extensions.length)];
    const randomKey = Math.random().toString(16).substring(2, 8);

    const randomUriSlug = `?id=com.app.${randomHexSlug}.${randomExt}&hl=id&key=${randomKey}`;
    const title = `${currentBrandName} - ${randomWord} (${appSize})`;

    similarApps.push({
      title: title,
      slug: randomUriSlug,
      firstLetter: currentBrandName.charAt(0).toUpperCase(),
      bgHex: Math.floor(seededRandom(currentHash + i) * 16777215).toString(16)
    });
  }

  // Generate Related Topics
  const topicActions = [
    `Unduh Sekarang untuk ${appOS}`,
    `Pembaruan Resmi ${appOS}`,
    `File Instalasi Terverifikasi`,
    `Panduan Download Aman`,
    `Akses Unduh Cepat`,
    `Versi Terbaru ${appOS}`
  ];

  for (let i = 0; i < 12; i++) {
    const currentBrandName = brandNames[(i + 1) % brandCount];
    const randomHexSlugRel = Math.random().toString(16).substring(2, 6);
    const randomExtRel = extensions[Math.floor(seededRandom(currentHash + i + 250) * extensions.length)];
    const randomKeyRel = Math.random().toString(16).substring(2, 8);

    const randomUriSlug = `?id=com.app.${randomHexSlugRel}.${randomExtRel}&hl=id&key=${randomKeyRel}`;
    const selectedAction = topicActions[i % topicActions.length];
    const title = `${currentBrandName} - ${selectedAction}`;

    relatedTopics.push({
      title: title,
      slug: randomUriSlug
    });
  }

  return { similarApps, relatedTopics };
}
