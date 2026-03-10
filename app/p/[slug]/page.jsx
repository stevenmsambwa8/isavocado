/**
 * MSAMBWA — Product Open Graph page
 * Route: /p/[slug]
 * Deploy to: app/p/[slug]/page.jsx
 */

import { createClient } from '@supabase/supabase-js';

const DOMAIN = 'https://msambwaclassicwear.com';

function getSB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL      || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

async function getProduct(slug) {
  const parts   = (slug || '').split('-');
  const shortId = parts[parts.length - 1];
  if (!shortId || shortId.length < 4) return null;

  const { data } = await getSB()
    .from('products')
    .select('id,name,description,image_url,image_urls,sizes,in_stock,badge,category')
    .eq('is_active', true);

  if (!data) return null;
  return data.find(p =>
    p.id.replace(/-/g, '').toLowerCase().endsWith(shortId.toLowerCase())
  ) || null;
}

// ── Image URL helper ───────────────────────────────────────────
// Facebook requires:
//   - Minimum 200×200px, recommended 1200×630 (landscape)
//   - Publicly accessible, no redirect chains
//   - We use wsrv.nl to resize to 1200×630 and serve as JPEG
//   - fb=1 param bypasses FB's sometimes-broken image fetcher
function ogImageUrl(src) {
  if (!src) return null;
  // wsrv.nl: resize to 1200w, crop to 630h (landscape), output jpg
  return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=1200&h=630&fit=cover&output=jpg&q=85`;
}

// generateMetadata — crawlers read this, not the page body
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);

  const fallbackImg = `${DOMAIN}/icons/icon-512x512.png`;

  if (!p) {
    return {
      title:       'MSAMBWA Classic Wear',
      description: 'Shop refined fashion from MSAMBWA Classic Wear.',
      openGraph: {
        title:       'MSAMBWA Classic Wear',
        description: 'Shop refined fashion from MSAMBWA Classic Wear.',
        siteName:    'MSAMBWA Classic Wear',
        url:          DOMAIN,
        images:      [{ url: fallbackImg, width: 512, height: 512, alt: 'MSAMBWA' }],
      },
      twitter: {
        card:   'summary_large_image',
        title:  'MSAMBWA Classic Wear',
        images: [fallbackImg],
      },
    };
  }

  const rawImage   = (p.image_urls?.[0] || p.image_url || '').trim();
  const image      = ogImageUrl(rawImage);          // 1200×630 landscape for FB
  const inStock    = p.in_stock !== false;
  const stockLabel = inStock ? 'In Stock' : 'Out of Stock';
  const sizesLine  = Array.isArray(p.sizes) && p.sizes.length > 0
    ? p.sizes.join(' · ') : null;

  const ogDesc = [
    sizesLine ? `Sizes: ${sizesLine}` : null,
    stockLabel,
    p.description || 'Classic wear from MSAMBWA.',
    'Order now on MSAMBWA Classic Wear.',
  ].filter(Boolean).join(' · ');

  const ogTitle = `${p.name} — MSAMBWA`;
  const pageUrl = `${DOMAIN}/p/${slug}`;

  // Facebook needs width/height declared so it knows the image is large enough
  const ogImages = image
    ? [{ url: image, width: 1200, height: 630, alt: p.name, type: 'image/jpeg' }]
    : [{ url: fallbackImg, width: 512, height: 512, alt: 'MSAMBWA' }];

  return {
    title:       ogTitle,
    description: ogDesc,
    openGraph: {
      title:       ogTitle,
      description: ogDesc,
      url:         pageUrl,
      siteName:    'MSAMBWA Classic Wear',
      type:        'website',
      images:      ogImages,
    },
    twitter: {
      card:        'summary_large_image',
      title:       ogTitle,
      description: ogDesc,
      images:      image ? [image] : [fallbackImg],
    },
    other: {
      // Facebook product meta
      'og:type':                  'og:product',
      'product:availability':     inStock ? 'in stock' : 'out of stock',
      'product:condition':        'new',
      'product:retailer_item_id': p.id,
      ...(sizesLine ? { 'product:size': sizesLine } : {}),
      // Explicit image dimensions — FB uses these to validate image size
      'og:image:width':  '1200',
      'og:image:height': '630',
      'og:image:type':   'image/jpeg',
      // WhatsApp Status reads og:image:secure_url
      'og:image:secure_url': image || fallbackImg,
    },
    alternates: { canonical: pageUrl },
  };
}

// Page — serves full HTML so crawlers see OG tags.
// Real users are bounced instantly via JS (bots don't run JS).
export default async function ProductPage({ params }) {
  const { slug }  = await params;
  const parts     = (slug || '').split('-');
  const shortId   = parts[parts.length - 1];
  const p         = await getProduct(slug);
  const destUrl   = `${DOMAIN}/?p=${shortId}`;

  const rawImage  = p ? (p.image_urls?.[0] || p.image_url || '') : '';
  const image     = ogImageUrl(rawImage);
  const name      = p?.name || 'MSAMBWA Classic Wear';
  const inStock   = p ? p.in_stock !== false : true;
  const sizesLine = p && Array.isArray(p.sizes) && p.sizes.length > 0
    ? p.sizes.join(' · ') : '';

  return (
    <html>
      <head>
        {/* Instant client-side redirect for real users.
            Crawlers (FB, WhatsApp) ignore JS and read the OG
            meta tags generated by generateMetadata() above.   */}
        <meta httpEquiv="refresh" content={`0;url=${destUrl}`} />
        <script dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(destUrl)});`
        }}/>
      </head>
      <body style={{ margin:0, fontFamily:'system-ui,sans-serif', background:'#fff' }}>
        <div style={{ maxWidth:480, margin:'60px auto', padding:'0 24px', textAlign:'center' }}>
          {image && (
            <img
              src={image}
              alt={name}
              style={{ width:'100%', maxWidth:360, borderRadius:16, marginBottom:20, aspectRatio:'1200/630', objectFit:'cover' }}
            />
          )}
          <h1 style={{ fontSize:22, fontWeight:700, margin:'0 0 8px' }}>{name}</h1>
          {sizesLine && (
            <p style={{ fontSize:14, color:'#666', margin:'0 0 6px' }}>Sizes: {sizesLine}</p>
          )}
          <p style={{ fontSize:14, color: inStock ? '#1a7a45' : '#c0392b', margin:'0 0 20px', fontWeight:600 }}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </p>
          <a
            href={destUrl}
            style={{ display:'inline-block', background:'#1C7A8C', color:'#fff', borderRadius:12, padding:'14px 32px', fontSize:16, fontWeight:700, textDecoration:'none' }}
          >
            Order Now
          </a>
        </div>
      </body>
    </html>
  );
}
