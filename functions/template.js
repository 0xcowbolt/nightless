export function renderDownloadPage(data) {
  const {
    brandCode,
    seoTitle,
    description,
    keywords,
    appVersion,
    appSize,
    appOS,
    appDownloads,
    appBahasa,
    displayDate,
    appSha,
    appDate,
    appRating,
    appReviewCount,
    imageUrl,
    appCategory,
    bgColors,
    downloadLink,
    faqs,
    similarApps,
    relatedTopics,
    priceData,
    reviews,
    reviewSchemas,
    paragraphs,
    whatsNew
  } = data;

  const currentYear = new Date().getFullYear();
  const formattedBrand = brandCode.charAt(0).toUpperCase() + brandCode.slice(1).toLowerCase();
  
  // Format JSON-LD untuk Review Schema
  const reviewSchemasJson = JSON.stringify(reviewSchemas, null, 2);

  // Format HTML untuk FAQ Schema
  const faqSchemaItems = faqs.map(faq => {
    const qText = faq.q.replace(/\{brand\}/g, formattedBrand);
    const aText = faq.a.replace(/\{brand\}/g, formattedBrand);
    return `{
      "@type": "Question",
      "name": ${JSON.stringify(qText)},
      "acceptedAnswer": {
        "@type": "Answer",
        "text": ${JSON.stringify(aText)}
      }
    }`;
  }).join(',');

  return `<!DOCTYPE html>
<html lang="id" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>${seoTitle}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="author" content="${formattedBrand}">
    <meta name="publisher" content="${formattedBrand} Technologies">

    <link rel="canonical" href="${downloadLink}">
    <link rel="alternate" hreflang="id-ID" href="${downloadLink}">
    <link rel="alternate" hreflang="x-default" href="${downloadLink}">

    <link rel="icon" type="image/png" href="https://stc.utdstc.com/favicon.png" sizes="192x192">
    <meta property="og:site_name" content="${formattedBrand}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${seoTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${downloadLink}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:alt" content="Ikon ${formattedBrand}">
    <meta property="article:published_time" content="${appDate}">
    <meta property="article:modified_time" content="${appDate}">
    <meta property="article:section" content="${appCategory}">
    <link rel="preload" href="${imageUrl}" as="image">
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@${formattedBrand}"> 
    <meta name="twitter:title" content="${seoTitle}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">

    <meta name="theme-color" content="#007a99">
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "${formattedBrand}",
      "alternateName": "${formattedBrand} Technologies",
      "url": "https://${formattedBrand.toLowerCase()}.com/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://${formattedBrand.toLowerCase()}.com/store/apps/details/{search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Store",
        "item": "https://${formattedBrand.toLowerCase()}.com/store/"
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Apps",
        "item": "https://${formattedBrand.toLowerCase()}.com/store/apps/"
      },{
        "@type": "ListItem",
        "position": 3,
        "name": "${appCategory}",
        "item": "https://${formattedBrand.toLowerCase()}.com/store/apps/details/${appCategory.toLowerCase()}/"
      },{
        "@type": "ListItem",
        "position": 4,
        "name": "${formattedBrand}"
      }]
    }
    </script>

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "${formattedBrand}",
      "operatingSystem": "${appOS}",
      "applicationCategory": "${appCategory}",
      "datePublished": "${appDate}",
      "dateModified": "${appDate}",
      "version": "${appVersion}",
      "fileSize": "${appSize}",
      "image": "${imageUrl}",
      "offers": {
        "@type": "Offer",
        "price": "${priceData.appPrice}",
        "priceCurrency": "${priceData.priceCurrency}",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "${appRating}",
        "ratingCount": "${appReviewCount}"
      },
      "review": ${reviewSchemasJson}
    }
    </script>
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        ${faqSchemaItems}
      ]
    }
    </script>
    
    <style>
        :root { 
            --primary: #007a99; 
            --bg: #f4f5f7; 
            --text-main: #111111; 
            --text-muted: #555555; 
            --border: #eaeaea; 
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body { background-color: var(--bg); color: var(--text-main); -webkit-font-smoothing: antialiased; line-height: 1.6; text-rendering: optimizeLegibility; }
        header { background: #fff; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; }
        .logo-area { display: flex; align-items: center; gap: 16px; }
        .logo { font-size: 22px; font-weight: 800; color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 6px; }
        .container { max-width: 1100px; margin: 0 auto; padding: 20px 15px; }
        .breadcrumbs { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
        .breadcrumbs a { color: var(--primary); text-decoration: none; font-weight: 600; }
        .breadcrumbs span { margin: 0 8px; color: #767676; }
        .grid-layout { display: grid; grid-template-columns: 1fr; gap: 20px; }
        @media (min-width: 850px) { .grid-layout { grid-template-columns: 1fr 320px; align-items: start; } }
        .card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 20px; border: 1px solid rgba(0,0,0,0.02); }
        .section-title { font-size: 20px; font-weight: 800; margin-bottom: 16px; color: #111; display: flex; align-items: center; gap: 8px; }
        .app-hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px; }
        .app-icon { width: 120px; height: 120px; border-radius: 24px; background: #fff; flex-shrink: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), 0 8px 16px rgba(0,122,153,0.15); overflow: hidden; }
        .app-icon img { width: 120px; height: 120px; object-fit: cover; display: block; }
        .app-title { font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 8px; }
        .app-dev { color: var(--primary); font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; margin-bottom: 12px; }
        .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .badge { background: #e8f5e9; color: #1b5e20; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
        .stats-row { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; font-size: 14px; color: #333333; }
        .stars { color: #8a6508; font-weight: 700; display: flex; align-items: center; gap: 4px; }
        .dl-card { text-align: center; padding: 24px; position: sticky; top: 80px; }
        .btn-download { display: block; background: #0f6634; color: #ffffff; text-decoration: none; border-radius: 12px; padding: 18px; box-shadow: 0 4px 15px rgba(20,133,68,0.25); transition: 0.2s; }
        .btn-download:hover { background: #0c522a; }
        .btn-title { font-size: 22px; font-weight: 800; display: block; color: #ffffff; }
        .btn-sub { color: #ffffff; font-size: 13px; font-weight: 600; opacity: 0.9; margin-top: 4px; display: block; }
        .security-check { display: flex; align-items: center; justify-content: center; gap: 8px; color: #115c2d; font-size: 13px; font-weight: 700; margin-top: 16px; background: #e8f8f0; padding: 8px; border-radius: 8px; }
        .screenshots { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 12px; scroll-snap-type: x mandatory; }
        .shot { width: 140px; height: 250px; border-radius: 12px; flex-shrink: 0; scroll-snap-align: start; border: 1px solid var(--border); }
        .shot img { width: 140px; height: 250px; object-fit: cover; border-radius: 11px; display: block; }
        .whats-new { background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid var(--primary); margin-bottom: 20px; }
        .whats-new h3 { font-size: 15px; margin-bottom: 8px; color: #111; }
        .whats-new ul { margin-left: 20px; font-size: 14px; color: #444; }
        .rich-content { font-size: 15px; color: #333; line-height: 1.8; }
        .rich-content p { margin-bottom: 16px; }
        .review { border-bottom: 1px solid var(--border); padding: 16px 0; }
        .rev-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .rev-user { font-weight: 700; font-size: 14px; color: #111; display: flex; align-items: center; gap: 8px; }
        .rev-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .rev-date { font-size: 12px; color: #4a4a4a; }
        .rev-body { font-size: 14px; color: #333333; }
        .similar-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
        .sim-app { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; text-decoration: none; }
        .sim-icon { width: 72px; height: 72px; border-radius: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); object-fit: cover; }
        .sim-title { font-size: 13px; font-weight: 600; color: #333; }
        .info-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .info-table tr { border-bottom: 1px solid var(--border); }
        .info-table td { padding: 12px 0; }
        .info-table td:first-child { color: var(--text-muted); width: 40%; font-weight: 600; }
        .info-table td:last-child { color: #111; font-weight: 600; word-break: break-all; }
        .tags { display: flex; flex-wrap: wrap; gap: 10px; }
        .tag { background: #f0f2f5; color: #222; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-decoration: none; border: 1px solid #b8bcbe; }
        .tag:hover { background: #e4e6e9; color: var(--primary); border-color: var(--primary); }
        footer { background: #fff; padding: 40px 20px; text-align: center; font-size: 14px; color: #444; border-top: 1px solid var(--border); margin-top: 40px; font-weight: 500; }
        .faq-box { margin-bottom: 16px; }
        .faq-box h3 { font-size: 16px; color: #111; margin-bottom: 6px; font-weight: 700; }
        .faq-box p { font-size: 14px; color: #333333; }
    </style>
</head>
<body>

    <header>
        <div class="logo-area">
            <a href="/" class="logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                ${formattedBrand}
            </a>
        </div>
        <div class="search-container" style="margin: 0; text-align: center;">
            <form onsubmit="handleSearch(event)" style="display: inline-flex; gap: 8px;">
                <input type="text" id="searchInput" placeholder="Cari aplikasi atau game..." required style="padding: 8px 12px; width: 220px; border: 1px solid #ccc; border-radius: 4px;">
                <button type="submit" style="padding: 8px 12px; background: #007a99; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Cari</button>
            </form>
            <script>
            function handleSearch(event) {
                event.preventDefault();
                var query = document.getElementById('searchInput').value.trim();
                if (query) {
                    var slug = query.toLowerCase().replace(/\\s+/g, '-');
                    window.location.href = "/store/apps/details/" + encodeURIComponent(slug);
                }
            }
            </script>
        </div>
    </header>

    <div class="container">
        <div class="breadcrumbs">
            <a href="/store/">Store</a> <span>/</span> <a href="/store/apps/">Apps</a> <span>/</span> <a href="/store/apps/details/${appCategory.toLowerCase()}">${appCategory}</a> <span>/</span> ${formattedBrand}
        </div>

        <div class="grid-layout">
            <main class="left-col">
                
                <div class="card">
                    <div class="app-hero">
                        <div class="app-icon">
                            <img src="${imageUrl}" alt="Icon ${formattedBrand}" width="120" height="120" fetchpriority="high">
                        </div>
                        <div>
                            <h1 class="app-title">${seoTitle}</h1>
                            <a href="#" class="app-dev">Official Developer</a>
                            
                            <div class="badges">
                                <div class="badge">✔ Partner Developer</div>
                                <div class="badge">✔ Terpercaya</div>
                            </div>
                        
                            <div class="price-row" style="margin: 8px 0; font-weight: bold;">
                                ${priceData.appPrice === "0" 
                                  ? '<span style="color: #ffffff; background: #c0392b; padding: 3px 8px; border-radius: 4px;">Gratis</span>' 
                                  : `<span style="color: #a93226;">${priceData.priceCurrency}${Number(priceData.appPrice).toLocaleString('id-ID')}</span>`
                                }
                            </div>
                        
                            <div class="stats-row">
                                <div class="stars">★ ${appRating}</div>
                                <span>${Number(appReviewCount).toLocaleString('id-ID')} ulasan</span>
                                <span>Versi ${appVersion}</span>
                            </div>
                        </div>
                    </div>

                    <div class="screenshots">
                        <div class="shot"><img src="https://dummyimage.com/280x500/${bgColors.bg1}/ffffff.png&text=${encodeURIComponent(formattedBrand)}" alt="Screenshot 1" width="140" height="250"></div>
                        <div class="shot"><img src="https://dummyimage.com/280x500/${bgColors.bg2}/ffffff.png&text=${encodeURIComponent(formattedBrand)}" alt="Screenshot 2" width="140" height="250" loading="lazy"></div>
                        <div class="shot"><img src="https://dummyimage.com/280x500/${bgColors.bg3}/ffffff.png&text=${encodeURIComponent(formattedBrand)}" alt="Screenshot 3" width="140" height="250" loading="lazy"></div>
                        <div class="shot"><img src="https://dummyimage.com/280x500/${bgColors.bg4}/ffffff.png&text=${encodeURIComponent(formattedBrand)}" alt="Screenshot 4" width="140" height="250" loading="lazy"></div>
                    </div>
                </div>

                <div class="card">
                    <h2 class="section-title">Deskripsi Komprehensif ${formattedBrand}</h2>
                    
                    <div class="whats-new">
                        <h3>Apa yang Baru di Versi ${appVersion}?</h3>
                        <ul>
                            ${whatsNew.map(item => `<li>${item.replace(/\{brand\}/g, formattedBrand).replace(/\{os\}/g, appOS)}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="rich-content">
                        ${paragraphs.map(p => `<p>${p.replace(/\{brand\}/g, formattedBrand).replace(/\{downloads\}/g, appDownloads).replace(/\{size\}/g, appSize).replace(/\{os\}/g, appOS)}</p>`).join('')}
                    </div>
                </div>

                <div class="card">
                    <h2 class="section-title">Pertanyaan Umum (FAQ)</h2>
                    ${faqs.map(faq => `
                        <div class="faq-box">
                            <h3>${faq.q.replace(/\{brand\}/g, formattedBrand)}</h3>
                            <p>${faq.a.replace(/\{brand\}/g, formattedBrand)}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="card">
                    <h2 class="section-title">Ulasan Pengguna (Top Comments)</h2>
                    ${reviews.map(review => `
                        <div class="review">
                            <div class="rev-header">
                                <div class="rev-user">
                                    <img src="https://i.pravatar.cc/150?img=${review.avatar}" class="rev-avatar" alt="Avatar" width="32" height="32" loading="lazy"> 
                                    ${review.name}
                                </div>
                                <div class="stars">${review.stars}</div>
                            </div>
                            <div class="rev-date">${review.time}</div>
                            <div class="rev-body">${review.comment}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="card">
                    <h2 class="section-title">Jelajahi Serupa</h2>
                    <div class="similar-grid">
                        ${similarApps.map(item => `
                            <a href="${item.slug}" class="sim-app">
                                <img src="https://dummyimage.com/144x144/${item.bgHex}/fff.png&text=${item.firstLetter}" class="sim-icon" alt="Icon" width="72" height="72" loading="lazy">
                                <div class="sim-title">${item.title}</div>
                            </a>
                        `).join('')}
                    </div>
                </div>

                <div class="card">
                    <h2 class="section-title">Topik Terkait</h2>
                    <div class="tags">
                        ${relatedTopics.map(item => `
                            <a href="${item.slug}" class="tag">${item.title}</a>
                        `).join('')}
                    </div>
                </div>
            </main>

            <aside class="right-col">
                <div class="card dl-card" id="download">
                    <a href="${downloadLink}" class="btn-download">
                        <span class="btn-title">Unduh APK</span>
                        <span class="btn-sub">${appSize} • Bebas Virus</span>
                    </a>
                    <div class="security-check">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"></path></svg>
                        Telah Diverifikasi Aman
                    </div>
                    <div style="font-size:11px; color:#555; margin-top:16px; font-family:monospace; word-break:break-all; background:#f9f9f9; padding:8px; border-radius:4px;">
                        ${appSha}
                    </div>
                </div>

                <div class="card">
                    <h2 class="section-title" style="font-size:16px;">Informasi Teknis</h2>
                    <table class="info-table">
                        <tbody>
                            <tr><td>Versi Terbaru</td><td>${appVersion}</td></tr>
                            <tr><td>Ukuran</td><td>${appSize}</td></tr>
                            <tr><td>OS Minimum</td><td>${appOS}</td></tr>
                            <tr><td>Kategori</td><td>${appCategory}</td></tr>
                            <tr><td>Bahasa</td><td>${appBahasa}</td></tr>
                            <tr><td>Total Unduhan</td><td>${appDownloads}</td></tr>
                            <tr><td>Diperbarui</td><td>${displayDate}</td></tr>
                        </tbody>
                    </table>
                </div>
            </aside>
        </div>
    </div>
    
    <footer>
        <p>© ${currentYear} ${formattedBrand} Technologies. Semua hak dilindungi undang-undang.</p>
        <p style="margin-top:8px;">Kebijakan Privasi | Persyaratan Layanan | DMCA</p>
    </footer>
</body>
</html>`;
}
