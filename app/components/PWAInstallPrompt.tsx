'use client';
import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────
   PWAInstallPrompt
   • Android Chrome  → captures the beforeinstallprompt event
                        and shows a native-style bottom sheet
   • iOS Safari      → detects standalone=false and shows a
                        manual "Add to Home Screen" instruction
                        banner (iOS doesn't support the event)
   • Shows once per 14 days (localStorage key: msambwa_pwa_ts)
   • Dismissed permanently with "Not now" after 3 dismissals
───────────────────────────────────────────────────────────── */

const STORAGE_KEY   = 'msambwa_pwa_ts';
const DISMISS_KEY   = 'msambwa_pwa_dismissals';
const MAX_DISMISSALS = 3;
const COOLDOWN_MS   = 14 * 24 * 60 * 60 * 1000; // 14 days

// Design tokens (must match store.jsx tokens)
const C = {
  blue:  '#1C7A8C',
  black: '#0C1C1F',
  gray4: '#5B7C84',
  gray7: '#C6DDE2',
  fill4: '#F2FAFC',
  white: '#ffffff',
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export default function PWAInstallPrompt() {
  const [show,        setShow]        = useState(false);
  const [isIOS,       setIsIOS]       = useState(false);
  const [deferredEvt, setDeferred]    = useState<BeforeInstallPromptEvent | null>(null);
  const [installing,  setInstalling]  = useState(false);

  useEffect(() => {
    // Already running as installed PWA — don't show
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if ((window.navigator as any).standalone === true) return;      // iOS standalone

    // Check cooldown and max dismissals
    try {
      const ts         = localStorage.getItem(STORAGE_KEY);
      const dismissals = Number(localStorage.getItem(DISMISS_KEY) || '0');
      if (dismissals >= MAX_DISMISSALS) return;
      if (ts && Date.now() - Number(ts) < COOLDOWN_MS) return;
    } catch (_) {}

    // Detect iOS Safari
    const ua  = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios|opios|mercury/i.test(ua);
    setIsIOS(ios);

    if (ios) {
      // iOS: show banner after 3s (no native prompt available)
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Desktop Chrome: listen for the install event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      // Small delay so the page is fully interactive first
      setTimeout(() => setShow(true), 1500);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = (permanent = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      if (permanent) {
        localStorage.setItem(DISMISS_KEY, String(MAX_DISMISSALS));
      } else {
        const prev = Number(localStorage.getItem(DISMISS_KEY) || '0');
        localStorage.setItem(DISMISS_KEY, String(prev + 1));
      }
    } catch (_) {}
    setShow(false);
  };

  const install = async () => {
    if (!deferredEvt) return;
    setInstalling(true);
    try {
      await deferredEvt.prompt();
      const { outcome } = await deferredEvt.userChoice;
      if (outcome === 'accepted') {
        dismiss(true); // permanent — already installed
      } else {
        dismiss();
      }
    } catch (_) {
      dismiss();
    } finally {
      setInstalling(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => dismiss()}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.45)',
          animation: 'fadeIn .2s ease',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10001,
        maxWidth: 540, margin: '0 auto',
        background: C.white,
        borderRadius: '24px 24px 0 0',
        padding: '0 0 env(safe-area-inset-bottom, 24px)',
        animation: 'slideUp .32s cubic-bezier(.32,0,.28,1)',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
      }}>
        {/* Drag handle */}
        <div style={{ width: 36, height: 5, borderRadius: 3, background: C.gray7, margin: '14px auto 0' }}/>

        <div style={{ padding: '20px 24px 28px' }}>
          {/* App icon + name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: `linear-gradient(145deg, ${C.blue}, #0f5f6e)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: `0 4px 16px ${C.blue}44`,
            }}>
              {/* M monogram */}
              <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-1px', fontFamily: '-apple-system, sans-serif' }}>M</span>
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', color: C.black, letterSpacing: '-0.4px' }}>MSAMBWA</p>
              <p style={{ fontSize: 13, color: C.gray4, margin: 0 }}>Classic Wear</p>
            </div>
          </div>

          {isIOS ? (
            /* iOS instructions */
            <>
              <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: C.black }}>
                Add to your Home Screen
              </p>
              <p style={{ fontSize: 14, color: C.gray4, margin: '0 0 20px', lineHeight: 1.6 }}>
                Install MSAMBWA for a faster, app-like experience — no App Store needed.
              </p>

              {/* Step-by-step iOS instructions */}
              {[
                { num: 1, text: 'Tap the Share button', icon: '⬆️', sub: 'at the bottom of Safari' },
                { num: 2, text: 'Scroll down and tap',  icon: '➕', sub: '"Add to Home Screen"' },
                { num: 3, text: 'Tap Add',              icon: '✓',  sub: 'in the top right corner' },
              ].map(step => (
                <div key={step.num} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: C.fill4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>{step.icon}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 2px', color: C.black }}>{step.text}</p>
                    <p style={{ fontSize: 12, color: C.gray4, margin: 0 }}>{step.sub}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => dismiss()}
                style={{
                  width: '100%', padding: '15px', marginTop: 8,
                  background: C.fill4, color: C.gray4,
                  border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Got it
              </button>
            </>
          ) : (
            /* Android / Chrome install prompt */
            <>
              <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: C.black }}>
                Install the MSAMBWA app
              </p>
              <p style={{ fontSize: 14, color: C.gray4, margin: '0 0 20px', lineHeight: 1.6 }}>
                Shop faster, get push notifications for orders, and browse even offline — no App Store needed.
              </p>

              {/* Feature pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
                {['⚡ Faster', '📦 Order tracking', '📶 Works offline', '🔔 Notifications'].map(f => (
                  <span key={f} style={{
                    fontSize: 12, fontWeight: 600,
                    background: C.fill4, color: C.gray4,
                    padding: '6px 12px', borderRadius: 99,
                  }}>{f}</span>
                ))}
              </div>

              <button
                onClick={install}
                disabled={installing}
                style={{
                  width: '100%', padding: '16px', marginBottom: 10,
                  background: C.blue, color: '#fff',
                  border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 700,
                  cursor: installing ? 'default' : 'pointer',
                  opacity: installing ? 0.7 : 1,
                  transition: 'opacity .15s',
                }}
              >
                {installing ? 'Installing…' : 'Install App'}
              </button>

              <button
                onClick={() => dismiss()}
                style={{
                  width: '100%', padding: '13px',
                  background: 'none', color: C.gray4,
                  border: 'none', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Not now
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
