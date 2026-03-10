/**
 * MSAMBWA — Product Open Graph page
 * Route: /p/[slug]
 * Deploy to: app/p/[slug]/page.jsx
 *
 * WhatsApp Status fix:
 *  - Use raw image URL directly (no proxy/redirect)
 *  - Remove <meta http-equiv="refresh"> from <head> — WA crawler
 *    sees it and stops reading meta tags early
 *  - Redirect moved to <body> script only
 *  - og:image:secure_url added (WA Status reads this)
 *  - og:image declared before all other tags (order matters for WA)
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

// generateMetadata — this is what crawlers read
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p        = await getProduct(slug);
  const fallback = `${DOMAIN}/icons/icon-512x512.png`;

  if (!p) {
    return {
      title:       'MSAMBWA Classic Wear',
      description: 'Shop refined fashion from MSAMBWA Classic Wear.',
      openGraph: {
        title:       'MSAMBWA Classic Wear',
        description: 'Shop refined fashion from MSAMBWA Classic Wear.',
        siteName:    'MSAMBWA Classic Wear',
        url:          DOMAIN,
        images:      [{ url: fallback, width: 800, height: 800, alt: 'MSAMBWA' }],
      },
      twitter: {
        card:   'summary_large_image',
        title:  'MSAMBWA Classic Wear',
        images: [fallback],
      },
    };
  }

  // Use raw image URL — no proxy, no redirects
  // WhatsApp Status requires a direct HTTPS URL that returns the image immediately
  const image    = (p.image_urls?.[0] || p.image_url || '').trim();
  const inStock  = p.in_stock !== false;
  const sizesLine = Array.isArray(p.sizes) && p.sizes.length > 0
    ? p.sizes.join(' · ') : null;

  const ogDesc = [
    sizesLine ? `Sizes: ${sizesLine}` : null,
    inStock ? 'In Stock' : 'Out of Stock',
    p.description || 'Classic wear from MSAMBWA.',
    'Order now on MSAMBWA Classic Wear.',
  ].filter(Boolean).join(' · ');

  const ogTitle  = `${p.name} — MSAMBWA`;
  const pageUrl  = `${DOMAIN}/p/${slug}`;
  const imgUrl   = image || fallback;

  return {
    title:       ogTitle,
    description: ogDesc,
    openGraph: {
      title:       ogTitle,
      description: ogDesc,
      url:         pageUrl,
      siteName:    'MSAMBWA Classic Wear',
      type:        'website',
      // Image declared with explicit dimensions — required by FB & WA
      images: [{
        url:    imgUrl,
        width:  1200,
        height: 1200,
        alt:    p.name,
      }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       ogTitle,
      description: ogDesc,
      images:      [imgUrl],
    },
    other: {
      'og:type':                  'og:product',
      'product:availability':     inStock ? 'in stock' : 'out of stock',
      'product:condition':        'new',
      'product:retailer_item_id': p.id,
      ...(sizesLine ? { 'product:size': sizesLine } : {}),
      // WhatsApp Status specifically looks for og:image:secure_url
      'og:image:secure_url': imgUrl,
      'og:image:width':      '1200',
      'og:image:height':     '1200',
      // og:image repeated explicitly as first tag — WA reads first occurrence
      'og:image': imgUrl,
    },
    alternates: { canonical: pageUrl },
  };
}

// Page component
export default async function ProductPage({ params }) {
  const { slug }  = await params;
  const parts     = (slug || '').split('-');
  const shortId   = parts[parts.length - 1];
  const p         = await getProduct(slug);
  const destUrl   = `${DOMAIN}/?p=${shortId}`;
  const image     = p ? (p.image_urls?.[0] || p.image_url || '') : '';
  const name      = p?.name || 'MSAMBWA Classic Wear';
  const inStock   = p ? p.in_stock !== false : true;
  const sizesLine = p && Array.isArray(p.sizes) && p.sizes.length > 0
    ? p.sizes.join(' · ') : '';

  return (
    <html>
      <head>
        {/*
          NO <meta http-equiv="refresh"> here.
          WhatsApp Status crawler sees that tag and stops reading
          meta tags — it never reaches og:image. Redirect is
          handled by JS in the body only. Crawlers don't run JS.
        */}
      </head>
      <body style={{ margin:0, fontFamily:'system-ui,sans-serif', background:'#fff' }}>
        {/* JS redirect — fires instantly for real users, ignored by crawlers */}
        <script dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(destUrl)});`
        }}/>

        {/* Fallback for users with JS disabled */}
        <div style={{ maxWidth:480, margin:'60px auto', padding:'0 24px', textAlign:'center' }}>
          {image && (
            <img
              src={image}
              alt={name}
              style={{ width:'100%', maxWidth:360, borderRadius:16, marginBottom:20 }}
            />
          )}
          <h1 style={{ fontSize:22, fontWeight:700, margin:'0 0 8px' }}>{name}</h1>
          {sizesLine && (
            <p style={{ fontSize:14, color:'#666', margin:'0 0 6px' }}>Sizes: {sizesLine}</p>
          )}
          <p style={{ fontSize:14, color:inStock?'#1a7a45':'#c0392b', margin:'0 0 20px', fontWeight:600 }}>
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
