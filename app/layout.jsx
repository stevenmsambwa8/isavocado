import type { Metadata, Viewport } from 'next';
import './layout.css';

/* ─────────────────────────────────────────────────────────────
   MSAMBWA — Root Layout
   Includes all PWA meta tags for iOS Safari and Android Chrome.
───────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title:       'MSAMBWA Classic Wear',
  description: 'Refined fashion — shop the latest collection from MSAMBWA.',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:       true,
    title:         'MSAMBWA',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title:       'MSAMBWA Classic Wear',
    description: 'Shop refined fashion from MSAMBWA.',
    type:        'website',
    siteName:    'MSAMBWA',
  },
  icons: {
    // Standard favicons
    icon: [
      { url: '/icons/icon-32x32.png',  sizes: '32x32',  type: 'image/png' },
      { url: '/icons/icon-96x96.png',  sizes: '96x96',  type: 'image/png' },
      { url: '/icons/icon-192x192.png',sizes: '192x192',type: 'image/png' },
    ],
    // iOS home screen icons — Safari requires explicit apple-touch-icon links
    apple: [
      { url: '/icons/apple-touch-icon.png',          sizes: '180x180' },
      { url: '/icons/apple-touch-icon-152x152.png',  sizes: '152x152' },
      { url: '/icons/apple-touch-icon-144x144.png',  sizes: '144x144' },
      { url: '/icons/apple-touch-icon-120x120.png',  sizes: '120x120' },
    ],
    shortcut: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,        // prevent accidental zoom in the app shell
  userScalable:        false,
  viewportFit:         'cover',  // extend into iPhone notch / Dynamic Island
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1C7A8C' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f5f6e' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ── iOS Safari specific meta tags ──────────────────── */}

        {/* Hides Safari browser chrome — makes it feel native */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MSAMBWA" />

        {/* iOS splash screens — shown while app is loading from home screen */}
        {/* iPhone 16 Pro Max (430×932) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"  href="/splash/splash-1290x2796.png"/>
        {/* iPhone 16 / 15 Pro (393×852) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"  href="/splash/splash-1179x2556.png"/>
        {/* iPhone 14 Pro Max (430×932) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"  href="/splash/splash-1290x2796.png"/>
        {/* iPhone SE 3rd gen (375×667) */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"  href="/splash/splash-750x1334.png"/>
        {/* iPad Pro 12.9" */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" href="/splash/splash-2048x2732.png"/>
        {/* iPad Air / Pro 11" */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"  href="/splash/splash-1640x2360.png"/>

        {/* ── Android / general ──────────────────────────────── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name"       content="MSAMBWA" />

        {/* Microsoft tiles (Edge mobile) */}
        <meta name="msapplication-TileColor"  content="#1C7A8C" />
        <meta name="msapplication-TileImage"  content="/icons/icon-144x144.png" />
        <meta name="msapplication-config"     content="/browserconfig.xml" />

        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[MSAMBWA SW] registered, scope:', reg.scope);
                      // Check for updates every 60 minutes
                      setInterval(function() { reg.update(); }, 60 * 60 * 1000);
                    })
                    .catch(function(err) {
                      console.warn('[MSAMBWA SW] registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, overscrollBehavior: 'none' }}>
        {children}
      </body>
    </html>
  );
}
