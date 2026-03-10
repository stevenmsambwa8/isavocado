/**
 * MSAMBWA — Product Open Graph page
 * Route: /p/[slug]
 *
 * Deploy to: app/p/[slug]/page.jsx
 *
 * What it does:
 *  1. Extracts the 6-char shortId from the slug (last segment after final -)
 *  2. Fetches the product from Supabase server-side
 *  3. Returns full OG/Twitter meta so FB, Twitter, WhatsApp show rich previews
 *  4. The page itself immediately redirects the user to /?p=<shortId>
 *     so the store opens with that product
 */

import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const DOMAIN = 'https://msambwaclassicwear.com';

// ── Supabase (server-side, read-only) ─────────────────────────
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── Fetch product by shortId (last 6 hex chars of UUID) ───────
async function getProduct(slug) {
  // slug format: "black-linen-shirt-a3f9c2"
  // shortId = last segment = "a3f9c2"
  const parts   = slug.split('-');
  const shortId = parts[parts.length - 1];

  if (!shortId || shortId.length < 4) return null;

  // Fetch all active products and match by UUID suffix
  // (Supabase doesn't support ILIKE on UUID tail without a computed column)
  const { data } = await sb
    .from('products')
    .select('id,name,price,was,description,image_url,image_urls,sizes,in_stock,badge,category')
    .eq('is_active', true);

  if (!data) return null;

  return data.find(p =>
    p.id.replace(/-/g, '').toLowerCase().endsWith(shortId.toLowerCase())
  ) || null;
}

// ── generateMetadata — runs server-side, gives crawlers OG tags ──
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);

  if (!p) {
    return {
      title: 'Product — MSAMBWA Classic Wear',
      description: 'Shop refined fashion from MSAMBWA Classic Wear.',
    };
  }

  // Pick best image
  const image = (p.image_urls?.[0] || p.image_url || '').trim();

  // Stock label
  const inStock    = p.in_stock !== false;
  const stockLabel = inStock ? 'In Stock' : 'Out of Stock';

  // Sizes line  e.g. "S · M · L · XL"
  const sizesLine = Array.isArray(p.sizes) && p.sizes.length > 0
    ? p.sizes.join(' · ')
    : null;

  // Price line
  // Description for OG — sizes, stock, short description, CTA (no price)
  const ogDesc = [
    sizesLine ? `Sizes: ${sizesLine}` : null,
    stockLabel,
    p.description || 'Classic wear from MSAMBWA.',
    'Order now on MSAMBWA Classic Wear.',
  ].filter(Boolean).join(' · ');

  const ogTitle = `${p.name} — MSAMBWA`;
  const pageUrl = `${DOMAIN}/p/${slug}`;

  const ogImage = image
    ? [{ url: image, width: 1200, height: 1200, alt: p.name }]
    : [{ url: `${DOMAIN}/icons/icon-512x512.png`, width: 512, height: 512, alt: 'MSAMBWA' }];

  return {
    title: ogTitle,
    description: ogDesc,
    openGraph: {
      title:       ogTitle,
      description: ogDesc,
      url:         pageUrl,
      siteName:    'MSAMBWA Classic Wear',
      type:        'website',     // use 'og:product' via 'other' below for FB Shop
      images:      ogImage,
    },
    twitter: {
      card:        'summary_large_image',
      title:       ogTitle,
      description: ogDesc,
      images:      image ? [image] : [`${DOMAIN}/icons/icon-512x512.png`],
    },
    // Extra product-specific meta (Facebook product tags + WhatsApp reads og:*)
    other: {
      // Facebook / WhatsApp standard OG
      'og:type':              'og:product',
      'product:availability': inStock ? 'in stock' : 'out of stock',
      'product:condition':    'new',
      'product:retailer_item_id': p.id,
      // Sizes (custom — shown in some crawlers)
      ...(sizesLine ? { 'product:size': sizesLine } : {}),
      // WhatsApp uses og:image:width/height for proper preview sizing
      'og:image:width':  '1200',
      'og:image:height': '1200',
    },
    // Canonical URL
    alternates: { canonical: pageUrl },
  };
}

// ── Page component — redirects real users to the store ─────────
export default async function ProductPage({ params }) {
  const { slug } = await params;
  const parts   = slug.split('-');
  const shortId = parts[parts.length - 1];

  // Redirect to store with ?p=shortId so the app opens the product
  redirect(`/?p=${shortId}`);
}
