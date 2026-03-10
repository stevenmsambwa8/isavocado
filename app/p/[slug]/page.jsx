/**
 * MSAMBWA — Product Open Graph page
 * Route: /p/[slug]
 * Deploy to: app/p/[slug]/page.jsx
 */

import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const DOMAIN = 'https://msambwaclassicwear.com';

// ── Supabase client created INSIDE functions (not at module level)
//    so it runs at request time, not at build time.
//    Build-time execution has no env vars → "supabaseUrl is required" error.
function getSB() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL       || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY  || ''
  );
}

// ── Fetch product by the 6-char shortId tail of its UUID ──────
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

// ── generateMetadata — server-side, feeds OG tags to crawlers ──
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);

  if (!p) {
    return {
      title:       'Product — MSAMBWA Classic Wear',
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

  // No price — just sizes, stock, description, CTA
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

// ── Page — real users get redirected straight to the store ─────
export default async function ProductPage({ params }) {
  const { slug }  = await params;
  const parts     = (slug || '').split('-');
  const shortId   = parts[parts.length - 1];
  redirect(`/?p=${shortId}`);
}
