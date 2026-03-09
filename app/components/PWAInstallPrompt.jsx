'use client';
import { useState, useEffect } from 'react';

/*
  PWAInstallPrompt
  • Shows after 3 seconds on first visit
  • Android/Chrome: native install prompt
  • iOS Safari: step-by-step instructions
  • Cooldown: 3 days (not 14) — shows up to 5 times before giving up
*/

const TS_KEY       = 'msambwa_pwa_ts';
const COUNT_KEY    = 'msambwa_pwa_count';
const MAX_SHOWS    = 5;
const COOLDOWN_MS  = 3 * 24 * 60 * 60 * 1000; // 3 days

const C = {
  blue:  '#1C7A8C',
  black: '#0C1C1F',
  gray4: '#5B7C84',
  gray7: '#C6DDE2',
  fill4: '#F2FAFC',
  white: '#ffffff',
};

export default function PWAInstallPrompt() {
  const [show,       setShow]      = useState(false);
  const [isIOS,      setIsIOS]     = useState(false);
  const [deferred,   setDeferred]  = useState(null);
  const [installing, setInstalling]= useState(false);

  useEffect(() => {
    // Already installed as PWA — skip
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (window.navigator.standalone === true) return;

    // Check how many times we've shown it
    try {
      const count = Number(localStorage.getItem(COUNT_KEY) || '0');
      if (count >= MAX_SHOWS) return;
      const lastTs = localStorage.getItem(TS_KEY);
      if (lastTs && Date.now() - Number(lastTs) < COOLDOWN_MS) return;
    } catch (_) {}

    const ua  = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios|opios/i.test(ua);
    setIsIOS(ios);

    if (ios) {
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Android/Chrome — wait for browser event
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const recordShown = () => {
    try {
      const count = Number(localStorage.getItem(COUNT_KEY) || '0');
      localStorage.setItem(COUNT_KEY, String(count + 1));
      localStorage.setItem(TS_KEY, String(Date.now()));
    } catch (_) {}
  };

  // Record when shown
  useEffect(() => { if (show) recordShown(); }, [show]);

  const dismiss = () => setShow(false);

  const install = async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') {
        // Mark as permanently done
        try { localStorage.setItem(COUNT_KEY, String(MAX_SHOWS)); } catch (_) {}
      }
    } catch (_) {}
    setInstalling(false);
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10001,
        maxWidth: 520, margin: '0 auto',
        background: C.white,
        borderRadius: '24px 24px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom, 24px)',
        animation: 'slideUp .32s cubic-bezier(.32,0,.28,1)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ width: 36, height: 5, borderRadius: 3, background: C.gray7, margin: '14px auto 0' }}/>

        <div style={{ padding: '20px 24px 28px' }}>

          {/* App identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, flexShrink: 0,
              background: `linear-gradient(145deg, ${C.blue}, #0f5f6e)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 20px ${C.blue}55`,
            }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: '#fff', fontFamily: '-apple-system,sans-serif' }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 19, fontWeight: 800, margin: '0 0 3px', color: C.black, letterSpacing: '-0.5px' }}>
                MSAMBWA
              </p>
              <p style={{ fontSize: 13, color: C.gray4, margin: 0 }}>Classic Wear · Free App</p>
            </div>
          </div>

          {isIOS ? (
            <>
              <p style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px', color: C.black }}>
                Add to your Home Screen
              </p>
              <p style={{ fontSize: 14, color: C.gray4, margin: '0 0 20px', lineHeight: 1.6 }}>
                Get the full app experience — faster, offline-ready, no App Store needed.
              </p>

              {[
                { icon: '⬆️', title: 'Tap the Share button', sub: 'at the bottom of your browser' },
                { icon: '➕', title: 'Tap "Add to Home Screen"', sub: 'scroll down in the share menu' },
                { icon: '✅', title: 'Tap Add', sub: 'top right corner — done!' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: C.fill4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>{s.icon}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 2px', color: C.black }}>{s.title}</p>
                    <p style={{ fontSize: 12, color: C.gray4, margin: 0 }}>{s.sub}</p>
                  </div>
                </div>
              ))}

              <button onClick={dismiss} style={{
                width: '100%', padding: '15px', marginTop: 10,
                background: C.blue, color: '#fff',
                border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}>Got it!</button>
            </>
          ) : (
            <>
              <p style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px', color: C.black }}>
                Install MSAMBWA Classic Wear
              </p>
              <p style={{ fontSize: 14, color: C.gray4, margin: '0 0 18px', lineHeight: 1.6 }}>
                Shop faster, track orders and browse offline — free, no App Store needed.
              </p>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
                {['⚡ Instant loading', '📦 Order updates', '📶 Works offline', '🔔 Notifications'].map(f => (
                  <span key={f} style={{
                    fontSize: 12, fontWeight: 600,
                    background: C.fill4, color: C.gray4,
                    padding: '6px 12px', borderRadius: 99,
                  }}>{f}</span>
                ))}
              </div>

              <button onClick={install} disabled={installing} style={{
                width: '100%', padding: '16px', marginBottom: 10,
                background: C.blue, color: '#fff',
                border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700,
                cursor: installing ? 'not-allowed' : 'pointer',
                opacity: installing ? 0.7 : 1,
              }}>
                {installing ? 'Installing…' : '📲 Install App — It\'s Free'}
              </button>

              <button onClick={dismiss} style={{
                width: '100%', padding: '12px',
                background: 'none', color: C.gray4,
                border: 'none', fontSize: 14, cursor: 'pointer',
              }}>
                Maybe later
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
