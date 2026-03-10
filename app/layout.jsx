import Script from 'next/script';
import './layout.css';

export const metadata = {
  title:       'MSAMBWA Classic Wear',
  description: 'Refined fashion — shop the latest collection from MSAMBWA.',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:        true,
    title:          'MSAMBWA',
    statusBarStyle: 'black-translucent',
    startupImage: [
      { url: '/splash/splash-1290x2796.png', media: 'screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { url: '/splash/splash-1179x2556.png', media: 'screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { url: '/splash/splash-1125x2436.png', media: 'screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      { url: '/splash/splash-828x1792.png',  media: 'screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      { url: '/splash/splash-750x1334.png',  media: 'screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      { url: '/splash/splash-2048x2732.png', media: 'screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      { url: '/splash/splash-1640x2360.png', media: 'screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
    ],
  },
  formatDetection:  { telephone: false },
  applicationName:  'MSAMBWA',
  openGraph: {
    title:       'MSAMBWA Classic Wear',
    description: 'Shop refined fashion from MSAMBWA.',
    type:        'website',
    siteName:    'MSAMBWA',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png',   sizes: '32x32',   type: 'image/png' },
      { url: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png',         sizes: '180x180' },
      { url: '/icons/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/icons/apple-touch-icon-144x144.png', sizes: '144x144' },
      { url: '/icons/apple-touch-icon-120x120.png', sizes: '120x120' },
    ],
    shortcut: '/icons/icon-192x192.png',
  },
  other: {
    'mobile-web-app-capable':  'yes',
    'msapplication-TileColor': '#1C7A8C',
    'msapplication-TileImage': '/icons/icon-144x144.png',
    'msapplication-config':    '/browserconfig.xml',
  },
};

export const viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit:  'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1C7A8C' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f5f6e' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(function(reg) {
                  console.log('[SW] registered:', reg.scope);
                  setInterval(function() { reg.update(); }, 3600000);
                })
                .catch(function(err) { console.warn('[SW] failed:', err); });
            });
          }`}
        </Script>
      </body>
    </html>
  );
}
