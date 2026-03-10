/**
 * MSAMBWA — Product Open Graph page
 * Route: /p/[slug]
 * Deploy to: app/p/[slug]/page.jsx
 *
 * Key fix: NO server-side redirect() — crawlers (WhatsApp, FB, Twitter)
 * follow redirects and read the destination page OG tags, not this page.
 * Instead we serve a real HTML page with correct OG meta, and use a
 * client-side <meta http-equiv="refresh"> + JS to redirect real users.
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

// generateMetadata — crawlers read this
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);

  if (!p) {
    return {
      title:       'MSAMBWA Classic Wear',
      description: 'Shop refined fashion from MSAMBWA Classic Wear.',
      openGraph: {
        title:    'MSAMBWA Classic Wear',
        siteName: 'MSAMBWA Classic Wear',
        images:   [{ url: `${DOMAIN}/icons/icon-512x512.png`, width: 512, height: 512 }],
      },
    };
  }

  const image      = (p.image_urls?.[0] || p.image_url || '').trim();
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

  const ogTitle  = `${p.name} — MSAMBWA`;
  const pageUrl  = `${DOMAIN}/p/${slug}`;
  const ogImages = image
    ? [{ url: image, width: 1200, height: 1200, alt: p.name }]
    : [{ url: `${DOMAIN}/icons/icon-512x512.png`, width: 512, height: 512, alt: 'MSAMBWA' }];

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
      images:      image ? [image] : [`${DOMAIN}/icons/icon-512x512.png`],
    },
    other: {
      'og:type':                  'og:product',
      'product:availability':     inStock ? 'in stock' : 'out of stock',
      'product:condition':        'new',
      'product:retailer_item_id': p.id,
      ...(sizesLine ? { 'product:size': sizesLine } : {}),
      'og:image:width':  '1200',
      'og:image:height': '1200',
    },
    alternates: { canonical: pageUrl },
  };
}

// Page component — serves real HTML so crawlers read OG tags above.
// Real users are redirected client-side via JS (crawlers don't run JS).
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
        {/* Client-side redirect — real users bounce instantly.
            WhatsApp / Facebook crawlers don't execute JS so they
            stay on this page and read the OG meta tags above.     */}
        <meta httpEquiv="refresh" content={`0;url=${destUrl}`} />
        <script dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(destUrl)});`
        }}/>
      </head>
      <body style={{ margin:0, fontFamily:'system-ui,sans-serif', background:'#fff' }}>
        {/* Visible fallback for users with JS disabled */}
        <div style={{ maxWidth:480, margin:'60px auto', padding:'0 24px', textAlign:'center' }}>
          {image && (
            <img
              src={image}
              alt={name}
              style={{ width:'100%', maxWidth:320, borderRadius:16, marginBottom:20 }}
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
