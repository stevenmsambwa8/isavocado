'use client'
import { useState, useEffect, useRef, useMemo, useCallback, memo, createContext, useContext, Component } from "react";
import { createClient } from '@supabase/supabase-js';
import PWAInstallPrompt from './components/PWAInstallPrompt';

/* ─── Error Boundary ────────────────────────────────────────── */
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(e) { return { hasError:true, error:e }; }
  componentDidCatch(e, info) { console.error("MSAMBWA Error:", e, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:32,textAlign:"center",background:"#fff" }}>
        <div style={{ width:72,height:72,borderRadius:24,background:"#fff0f0",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E03A4E" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p style={{ fontSize:20,fontWeight:700,marginBottom:8,color:"#0C1C1F" }}>Something went wrong</p>
        <p style={{ fontSize:14,color:"#8AADB5",marginBottom:24,maxWidth:280,lineHeight:1.6 }}>We hit an unexpected error. Tap below to reload.</p>
        <button onClick={()=>window.location.reload()} style={{ background:"#1C7A8C",color:"#fff",border:"none",borderRadius:14,padding:"14px 32px",fontSize:15,fontWeight:600,cursor:"pointer" }}>Reload Store</button>
      </div>
    );
  }
}

/* ─── Supabase ──────────────────────────────────────────────── */
const SUPABASE_URL  = 'https://crekrdcmagswrfrmkiuj.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWtyZGNtYWdzd3Jmcm1raXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODEyNDYsImV4cCI6MjA4ODI1NzI0Nn0.qoUb9wOHW5DbiJtJcIGhCFtYu5Slx9_Fhb7lK_l11kM';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
/* ⚠️  IMPORTANT — Enable Row Level Security in Supabase for:
   - wishlists       → users can only read/write their own session_id rows
   - purchase_requests → users can only read/write their own session_id rows
   - user_addresses  → users can only read/write their own user_id rows
   - user_notification_prefs → users can only read/write their own user_id rows
   - product_reviews → anyone can insert, only approved=true visible on select
   - site_feedback   → insert-only for anon users
   Run the SQL in schema.sql to set up tables + RLS policies.
*/

/* ─── Persistent anonymous session ─────────────────────────────
   Strategy:
   1. On first visit, sign in anonymously via Supabase anonymous auth.
      This creates a real row in auth.users and persists across refreshes
      using the Supabase session cookie / localStorage token.
   2. We also store the session_id (user.id) in localStorage as a fallback
      key for wishlists / cart recovery even if the Supabase session expires.
   3. Cart and wishlist are stored in Supabase so they survive refreshes.
──────────────────────────────────────────────────────────────── */
const SESSION_KEY = 'msambwa_sid';

async function getOrCreateSession() {
  // Try existing Supabase session first
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) return session.user.id;

  // Try anon sign-in (Supabase anonymous auth)
  try {
    const { data, error } = await sb.auth.signInAnonymously();
    if (!error && data.user) {
      localStorage.setItem(SESSION_KEY, data.user.id);
      return data.user.id;
    }
  } catch (_) {}

  // Fallback: generate a stable UUID stored in localStorage
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/* ─── Inject keyframes ──────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("__store_anim")) {
  const el = document.createElement("style");
  el.id = "__store_anim";
  el.textContent = `
    @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes scaleIn  { from { transform:scale(0.88); opacity:0; } to { transform:scale(1); opacity:1; } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes slideInR { from { transform:translateX(100%); } to { transform:translateX(0); } }
    @keyframes spin     { to { transform:rotate(360deg); } }
    @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
    .pressable:active { transform:scale(0.97); transition:transform .1s; }
    .sk { background:linear-gradient(90deg,#eef8fa 25%,#dff0f3 50%,#eef8fa 75%); background-size:800px 100%; animation:shimmer 1.4s infinite linear; border-radius:10px; }
    img { content-visibility:auto; }
    /* GPU-composited layers for animated elements */
    .slide-panel { will-change:transform; }
    .card-slider  { will-change:transform; }
  `;
  document.head.appendChild(el);
}

/* ─── Lang context ──────────────────────────────────────────── */
import { TR, LANGS } from './translations';

const LangCtx = createContext({ lang:"en", setLang:()=>{}, t:TR.en });
const useLang  = () => useContext(LangCtx);

/* ─── Design tokens ─────────────────────────────────────────── */
const T = {
  black:"#0C1C1F", white:"#fff",
  gray2:"#1A2E32", gray3:"#2B4A50", gray4:"#5B7C84", gray5:"#8AADB5",
  gray6:"#AECDD3", gray7:"#C6DDE2", gray8:"#DFF0F3", gray9:"#EEF8FA",
  fill3:"#E6F5F8", fill4:"#F2FAFC",
  // Brand teal from logo
  blue:"#1C7A8C",       // primary — dark teal (buttons, active states, links)
  brandLight:"#4EC8E8", // sky blue accent (highlights, badges)
  red:"#E03A4E", green:"#1D9B6A", yellow:"#F59A0E",
};
const shadow = { xs:"0 1px 4px rgba(0,0,0,.08)", xl:"0 16px 48px rgba(0,0,0,.14)", xxl:"0 24px 60px rgba(0,0,0,.18)" };
const $p = v => `TZS ${Number(v).toLocaleString('en-US', { minimumFractionDigits:0, maximumFractionDigits:0 })}`;

/* ─── Image URL optimizer (wsrv.nl — free, no account needed) ──
   wsrv.nl is a free image CDN that resizes, compresses and
   converts to WebP on the fly. Caches globally so repeat loads
   are instant. No API key, no account, no cost.
   - thumb  : 200px  — small thumbnails
   - card   : 400px  — grid cards
   - detail : 900px  — product detail
─────────────────────────────────────────────────────────── */
function imgUrl(src, { width = 400, quality = 75 } = {}) {
  if (!src) return src;
  // Already proxied — skip
  if (src.includes('wsrv.nl')) return src;
  // Encode the full URL and send through wsrv.nl proxy
  const encoded = encodeURIComponent(src);
  return `https://wsrv.nl/?url=${encoded}&w=${width}&q=${quality}&output=webp&we`;
}


/* ─── Local Notification helpers ────────────────────────────────
   All notifications go through the service worker via postMessage.
   SW handles the actual Notification API so it works even when
   the app is in the background / closed.
─────────────────────────────────────────────────────────────── */
function getSW() {
  return navigator.serviceWorker?.controller || null;
}

function swPost(type, payload = {}) {
  const sw = getSW();
  if (sw) sw.postMessage({ type, payload });
}

async function requestNotifPermission() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

// Keys for localStorage
const NOTIF_WELCOME_KEY  = 'msambwa_notif_welcomed';
const NOTIF_ARRIVAL_KEY  = 'msambwa_notif_arrivals_started';
const NOTIF_INBOX_KEY    = 'msambwa_notif_inbox';

// ── Inbox helpers ─────────────────────────────────────────────
function inboxGet() {
  try { return JSON.parse(localStorage.getItem(NOTIF_INBOX_KEY) || '[]'); }
  catch(_) { return []; }
}

function inboxAdd(entry) {
  try {
    const list = inboxGet();
    // Keep max 30, newest first, no dupes by tag
    const filtered = list.filter(n => n.tag !== entry.tag);
    const next = [entry, ...filtered].slice(0, 30);
    localStorage.setItem(NOTIF_INBOX_KEY, JSON.stringify(next));
    return next;
  } catch(_) { return []; }
}

function inboxMarkRead(id) {
  try {
    const next = inboxGet().map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(NOTIF_INBOX_KEY, JSON.stringify(next));
    return next;
  } catch(_) { return []; }
}

function inboxMarkAllRead() {
  try {
    const next = inboxGet().map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIF_INBOX_KEY, JSON.stringify(next));
    return next;
  } catch(_) { return []; }
}

function inboxDelete(id) {
  try {
    const next = inboxGet().filter(n => n.id !== id);
    localStorage.setItem(NOTIF_INBOX_KEY, JSON.stringify(next));
    return next;
  } catch(_) { return []; }
}

function inboxClear() {
  try { localStorage.removeItem(NOTIF_INBOX_KEY); } catch(_) {}
  return [];
}

function inboxUnreadCount(list) {
  return list.filter(n => !n.read).length;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

const toSlug = (name = '', id = '') => {
  const words = name.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '').trim()
    .split(/ +/).slice(0, 4).join('-');
  const tail = id.replace(/-/g, '').slice(-6);
  return words ? `${words}-${tail}` : tail;
};

const productUrl = (id, name) => {
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://msambwaclassicwear.com';
  return `${origin}/p/${toSlug(name, id)}`;
};

const shareProduct = async (prod, e) => {
  e?.stopPropagation();
  const url = productUrl(prod.id, prod.name);
  if (navigator?.share) {
    try { await navigator.share({ title: prod.name, text: `Check out ${prod.name} on MSAMBWA`, url }); } catch(_) {}
  } else {
    try { await navigator.clipboard.writeText(url); } catch(_) {}
  }
};

/* ─── Atoms ─────────────────────────────────────────────────── */
function Spin({ size=24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation:'spin .7s linear infinite', flexShrink:0 }}>
      <circle cx="12" cy="12" r="10" stroke={T.gray7} strokeWidth="2.5"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={T.black} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function Icon({ name, size=20, color=T.black, strokeWidth=2 }) {
  const s = { width:size, height:size, flexShrink:0 };
  const p = { fill:"none", stroke:color, strokeWidth, strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    back:      <svg {...s} viewBox="0 0 24 24"><path {...p} d="M15 18l-6-6 6-6"/></svg>,
    bag:       <svg {...s} viewBox="0 0 24 24"><path {...p} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line {...p} x1="3" y1="6" x2="21" y2="6"/><path {...p} d="M16 10a4 4 0 01-8 0"/></svg>,
    heart:     <svg {...s} viewBox="0 0 24 24"><path {...p} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    "heart-fill":<svg {...s} viewBox="0 0 24 24"><path fill={color} stroke="none" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
    search:    <svg {...s} viewBox="0 0 24 24"><circle {...p} cx="11" cy="11" r="8"/><line {...p} x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    home:      <svg {...s} viewBox="0 0 24 24"><path {...p} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline {...p} points="9 22 9 12 15 12 15 22"/></svg>,
    person:    <svg {...s} viewBox="0 0 24 24"><path {...p} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle {...p} cx="12" cy="7" r="4"/></svg>,
    close:     <svg {...s} viewBox="0 0 24 24"><line {...p} x1="18" y1="6" x2="6" y2="18"/><line {...p} x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:      <svg {...s} viewBox="0 0 24 24"><line {...p} x1="12" y1="5" x2="12" y2="19"/><line {...p} x1="5" y1="12" x2="19" y2="12"/></svg>,
    minus:     <svg {...s} viewBox="0 0 24 24"><line {...p} x1="5" y1="12" x2="19" y2="12"/></svg>,
    chevronR:  <svg {...s} viewBox="0 0 24 24"><polyline {...p} points="9 18 15 12 9 6"/></svg>,
    star:      <svg {...s} viewBox="0 0 24 24"><polygon {...p} fill={color} stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    "star-e":  <svg {...s} viewBox="0 0 24 24"><polygon {...p} points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    truck:     <svg {...s} viewBox="0 0 24 24"><rect {...p} x="1" y="3" width="15" height="13"/><polygon {...p} points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle {...p} fill={color} cx="5.5" cy="18.5" r="2.5"/><circle {...p} fill={color} cx="18.5" cy="18.5" r="2.5"/></svg>,
    box:       <svg {...s} viewBox="0 0 24 24"><path {...p} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline {...p} points="3.27 6.96 12 12.01 20.73 6.96"/><line {...p} x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    card:      <svg {...s} viewBox="0 0 24 24"><rect {...p} x="1" y="4" width="22" height="16" rx="2"/><line {...p} x1="1" y1="10" x2="23" y2="10"/></svg>,
    bell:      <svg {...s} viewBox="0 0 24 24"><path {...p} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path {...p} d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    settings:  <svg {...s} viewBox="0 0 24 24"><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    gift:      <svg {...s} viewBox="0 0 24 24"><polyline {...p} points="20 12 20 22 4 22 4 12"/><rect {...p} x="2" y="7" width="20" height="5"/><line {...p} x1="12" y1="22" x2="12" y2="7"/><path {...p} d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path {...p} d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
    location:  <svg {...s} viewBox="0 0 24 24"><path {...p} d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle {...p} cx="12" cy="10" r="3"/></svg>,
    grid:      <svg {...s} viewBox="0 0 24 24"><rect {...p} x="3" y="3" width="7" height="7"/><rect {...p} x="14" y="3" width="7" height="7"/><rect {...p} x="14" y="14" width="7" height="7"/><rect {...p} x="3" y="14" width="7" height="7"/></svg>,
    list:      <svg {...s} viewBox="0 0 24 24"><line {...p} x1="8" y1="6" x2="21" y2="6"/><line {...p} x1="8" y1="12" x2="21" y2="12"/><line {...p} x1="8" y1="18" x2="21" y2="18"/><line {...p} x1="3" y1="6" x2="3.01" y2="6"/><line {...p} x1="3" y1="12" x2="3.01" y2="12"/><line {...p} x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    share:     <svg {...s} viewBox="0 0 24 24"><circle {...p} cx="18" cy="5" r="3"/><circle {...p} cx="6" cy="12" r="3"/><circle {...p} cx="18" cy="19" r="3"/><line {...p} x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line {...p} x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
    check:     <svg {...s} viewBox="0 0 24 24"><polyline {...p} points="20 6 9 17 4 12"/></svg>,
    lock:      <svg {...s} viewBox="0 0 24 24"><rect {...p} x="3" y="11" width="18" height="11" rx="2"/><path {...p} d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    chat:      <svg {...s} viewBox="0 0 24 24"><path {...p} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    info:      <svg {...s} viewBox="0 0 24 24"><circle {...p} cx="12" cy="12" r="10"/><line {...p} x1="12" y1="8" x2="12" y2="12"/><line {...p} x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    eye:       <svg {...s} viewBox="0 0 24 24"><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...p} cx="12" cy="12" r="3"/></svg>,
    "eye-off": <svg {...s} viewBox="0 0 24 24"><path {...p} d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path {...p} d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line {...p} x1="1" y1="1" x2="23" y2="23"/></svg>,
  };
  return icons[name] || <svg {...s} viewBox="0 0 24 24"/>;
}

function IconBtn({ icon, onClick, size=44, color=T.black, bg="none", style:st }) {
  return (
    <button onClick={onClick} style={{ width:size,height:size,borderRadius:size/2,background:bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,...st }}>
      <Icon name={icon} size={size*0.42} color={color}/>
    </button>
  );
}

function Btn({ children, variant="dark", onClick, full, size="md", style:st, disabled }) {
  const styles = { dark:{background:T.black,color:T.white}, gray:{background:T.gray8,color:T.black}, white:{background:T.white,color:T.black,border:`1px solid ${T.gray8}`}, red:{background:T.red,color:T.white} };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], border:styles[variant].border||"none", borderRadius:14, padding:size==="sm"?"11px 20px":"14px 28px", fontSize:size==="sm"?14:15, fontWeight:600, cursor:disabled?"not-allowed":"pointer", width:full?"100%":"auto", letterSpacing:"-0.2px", opacity:disabled?0.5:1, fontFamily:"-apple-system,sans-serif", transition:"opacity .15s", ...st }}>{children}</button>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background:active?T.black:T.fill3,color:active?T.white:T.gray2,border:"none",borderRadius:99,padding:"9px 18px",fontSize:14,fontWeight:active?600:400,cursor:"pointer",letterSpacing:"-0.1px",flexShrink:0,whiteSpace:"nowrap",fontFamily:"-apple-system,sans-serif" }}>{label}</button>
  );
}

function Divider({ my=12 }) { return <div style={{ height:1,background:T.gray8,margin:`${my}px 0` }}/>; }

function RatingStars({ rating, size=12 }) {
  const r = Number(rating) || 0;
  return (
    <div style={{ display:"flex", gap:2 }}>
      {[1,2,3,4,5].map(i=>(
        <Icon key={i} name="star" size={size} color={i<=Math.round(r)?"#FF9500":T.gray7}/>
      ))}
    </div>
  );
}

function PriceLine({ price, was, user, onLoginPrompt }) {
  const { t } = useLang();
  if (!user) return (
    <button
      onClick={e => { e.stopPropagation(); onLoginPrompt && onLoginPrompt(); }}
      style={{ background:"none", border:"none", padding:0, cursor:"pointer", textAlign:"left" }}
    >
      <span style={{ fontSize:12, color:T.gray5, fontStyle:"italic" }}>{t.signInToContinue}</span>
    </button>
  );
  return (
    <div style={{ display:"flex",alignItems:"baseline",gap:7 }}>
      <span style={{ fontSize:15,fontWeight:700,color:was?T.red:T.black }}>{$p(price)}</span>
      {was&&<span style={{ fontSize:12,color:T.gray5,textDecoration:"line-through" }}>{$p(was)}</span>}
    </div>
  );
}

function HScroll({ children, gap=12, px=0 }) {
  return (
    <div style={{ display:"flex",gap,overflowX:"auto",paddingLeft:px,paddingRight:px,scrollbarWidth:"none",msOverflowStyle:"none",WebkitOverflowScrolling:"touch" }}>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, body, action }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 24px",gap:16,textAlign:"center" }}>
      <div style={{ width:64,height:64,borderRadius:20,background:T.fill3,display:"flex",alignItems:"center",justifyContent:"center",opacity:.55 }}>
        <Icon name={icon||"bag"} size={30} color={T.gray4}/>
      </div>
      <p style={{ fontSize:18,fontWeight:700,color:T.gray2,margin:0 }}>{title}</p>
      <p style={{ fontSize:14,color:T.gray5,margin:0,maxWidth:280,lineHeight:1.6 }}>{body}</p>
      {action}
    </div>
  );
}

/* ─── Skeleton loading screens ──────────────────────────────── */
function Sk({ w="100%", h=16, r=10, style:st }) {
  return <div className="sk" style={{ width:w, height:h, borderRadius:r, flexShrink:0, ...st }}/>;
}

function HomeSkeleton() {
  return (
    <div style={{ animation:"fadeIn .2s ease" }}>
      {/* Hero */}
      <Sk h={380} r={28} style={{ marginBottom:28 }}/>
      {/* New In label */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <Sk w={120} h={22} r={8}/>
        <Sk w={50} h={16} r={8}/>
      </div>
      {/* New In row */}
      <div style={{ display:"flex",gap:12,overflowX:"hidden",marginBottom:32 }}>
        {[1,2,3].map(i=>(
          <div key={i} style={{ flexShrink:0,width:140 }}>
            <Sk w={140} h={168} r={16} style={{ marginBottom:8 }}/>
            <Sk w={100} h={14} r={6} style={{ marginBottom:6 }}/>
            <Sk w={70} h={12} r={6}/>
          </div>
        ))}
      </div>
      {/* Sale banner */}
      <Sk h={100} r={20} style={{ marginBottom:28 }}/>
      {/* Trending grid */}
      <Sk w={160} h={22} r={8} style={{ marginBottom:16 }}/>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 10px" }}>
        {[1,2,3,4].map(i=>(
          <div key={i}>
            <Sk h={220} r={20} style={{ marginBottom:8 }}/>
            <Sk w="70%" h={14} r={6} style={{ marginBottom:5 }}/>
            <Sk w="45%" h={12} r={6}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Lazy image with fade-in + native lazy loading ─────────── */
function LazyImg({ src, alt="", width=600, quality=75, style:st, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const optimised = imgUrl(src, { width, quality });
  return (
    <div style={{ position:"relative", width:"100%", height:"100%", background:"#f2f2f7", ...st }}>
      {!loaded && <div className="sk" style={{ position:"absolute",inset:0,borderRadius:"inherit" }}/>}
      <img
        src={optimised} alt={alt} loading="lazy" decoding="async"
        onLoad={() => setLoaded(true)}
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", opacity: loaded ? 1 : 0, transition:"opacity .25s", ...rest.imgStyle }}
        {...rest}
      />
    </div>
  );
}
function CardImageSlider({ images, aspectRatio="3/4", borderRadius=20, badge, soldOut=false, children }) {
  const [idx, setIdx]     = useState(0);
  const [visible, setVis] = useState(false);
  const timerRef          = useRef(null);
  const rootRef           = useRef(null);
  const imgs              = images?.length ? images : [];
  const multi             = imgs.length > 1;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !multi) return;
    const obs = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold:0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [multi]);

  useEffect(() => {
    if (!multi || !visible) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % imgs.length), 3800);
    return () => clearInterval(timerRef.current);
  }, [multi, visible, imgs.length]);

  return (
    <div ref={rootRef} style={{ aspectRatio, background:"#f2f2f7", borderRadius, overflow:"hidden", position:"relative", flexShrink:0, contain:"layout style paint", contentVisibility:"auto" }}>
      {imgs.length === 0 ? (
        <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#f2f2f7" }}>
          <Icon name="bag" size={28} color={T.gray6}/>
        </div>
      ) : (
        <>
          <div className="card-slider" style={{ display:"flex", width:`${imgs.length * 100}%`, height:"100%", transition:"transform .45s cubic-bezier(.32,0,.28,1)", transform:`translateX(-${idx * (100 / imgs.length)}%)` }}>
            {imgs.map((src, i) => (
              <div key={i} style={{ width:`${100 / imgs.length}%`, height:"100%", flexShrink:0 }}>
                <img src={imgUrl(src,{width:400,quality:72})} alt="" loading="lazy" decoding="async" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
              </div>
            ))}
          </div>
          {multi && (
            <div style={{ position:"absolute", bottom:7, left:"50%", transform:"translateX(-50%)", display:"flex", gap:4, pointerEvents:"none" }}>
              {imgs.map((_,i) => (
                <div key={i} style={{ width: i===idx ? 14 : 5, height:5, borderRadius:3, background: i===idx ? "#fff" : "rgba(255,255,255,0.5)", transition:"width .3s, background .3s" }}/>
              ))}
            </div>
          )}
        </>
      )}
      {badge && <span style={{ position:"absolute",top:8,left:8,background:badge==="Sale"?T.red:T.black,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:99 }}>{badge}</span>}
      {soldOut && <div style={{ position:"absolute",inset:0,background:"rgba(255,255,255,0.55)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"inherit" }}><span style={{ fontSize:11,fontWeight:700,color:"#fff",background:"rgba(0,0,0,0.6)",padding:"4px 10px",borderRadius:99 }}>SOLD OUT</span></div>}
      {children}
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────────────── */
const ProductCard = memo(function ProductCard({ p, grid, compact, onSelect, onWishlist, wishlisted, user, onLoginPrompt }) {
  const images = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [];

  if (compact) return (
    <div style={{ width:140, flexShrink:0, position:"relative" }}>
      <div onClick={()=>onSelect(p)} className="pressable" style={{ cursor:"pointer" }}>
        <CardImageSlider images={images} aspectRatio="5/6" borderRadius={13} badge={p.badge} soldOut={p.in_stock===false}/>
      </div>
      {/* Share icon top-RIGHT — badge is top-left so no overlap */}
      <button onClick={e=>shareProduct(p,e)} style={{ position:"absolute",top:8,right:8,width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.88)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2 }}>
        <Icon name="share" size={13} color={T.gray3}/>
      </button>
      <div onClick={()=>onSelect(p)} className="pressable" style={{ cursor:"pointer" }}>
        <p style={{ fontSize:13,fontWeight:600,marginBottom:3,marginTop:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</p>
        <PriceLine price={p.price} was={p.was} user={user} onLoginPrompt={onLoginPrompt}/>
      </div>
    </div>
  );

  if (grid) return (
    <div style={{ cursor:"pointer" }}>
      <div style={{ marginBottom:10 }} onClick={()=>onSelect(p)} className="pressable">
        <CardImageSlider images={images} aspectRatio="3/4" borderRadius={13} badge={p.badge} soldOut={p.in_stock===false}>
          {/* Heart — top-right only */}
          <button onClick={e=>{e.stopPropagation();onWishlist(p.id);}} style={{ position:"absolute",top:8,right:8,width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.9)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2 }}>
            <Icon name={wishlisted?"heart-fill":"heart"} size={15} color={wishlisted?T.red:T.gray5}/>
          </button>
          {/* Share — bottom-right, away from badge */}
          <button onClick={e=>shareProduct(p,e)} style={{ position:"absolute",bottom:8,right:8,width:30,height:30,borderRadius:8,background:"rgba(255,255,255,0.88)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2 }}>
            <Icon name="share" size={13} color={T.gray4}/>
          </button>
        </CardImageSlider>
      </div>
      <div onClick={()=>onSelect(p)} className="pressable">
        <p style={{ fontSize:13,fontWeight:700,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</p>
        <p style={{ fontSize:11,color:T.gray4,marginBottom:5 }}>{p.category}</p>
        <PriceLine price={p.price} was={p.was} user={user} onLoginPrompt={onLoginPrompt}/>
      </div>
    </div>
  );
  return null;
});



/* ─── Related Products ───────────────────────────────────────── */
function RelatedProducts({ currentProduct, products, onSelect, wishlist, onWishlist, user, onLoginPrompt }) {
  const related = useMemo(() => {
    return products
      .filter(p => p.id !== currentProduct.id && (
        p.category === currentProduct.category ||
        p.badge === currentProduct.badge
      ))
      .slice(0, 6);
  }, [currentProduct, products]);

  if (related.length === 0) return null;

  return (
    <div style={{ marginTop:32 }}>
      <p style={{ fontSize:18,fontWeight:700,letterSpacing:"-0.4px",marginBottom:16 }}>You may also like</p>
      <div style={{ display:"flex",gap:12,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4,WebkitOverflowScrolling:"touch" }}>
        {related.map(p => (
          <div key={p.id} onClick={()=>onSelect(p)} className="pressable" style={{ flexShrink:0,width:148,cursor:"pointer" }}>
            <div style={{ width:148,height:185,borderRadius:18,overflow:"hidden",background:"#f2f2f7",marginBottom:8,position:"relative" }}>
              {p.image_url
                ? <img src={imgUrl(p.image_url,{width:200,quality:70})} alt={p.name} loading="lazy" decoding="async" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="bag" size={24} color={T.gray6}/></div>}
              {p.badge && <span style={{ position:"absolute",top:8,left:8,background:p.badge==="Sale"?T.red:T.black,color:"#fff",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99 }}>{p.badge}</span>}
            </div>
            <p style={{ fontSize:13,fontWeight:600,margin:"0 0 4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</p>
            <PriceLine price={p.price} was={p.was} user={user} onLoginPrompt={onLoginPrompt}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Purchase Request Modal ───────────────────────────────── */
/* ─── Post-purchase "finish your account" nudge ──────────────── */
const NUDGE_SKIP_KEY = 'msambwa_skip_nudge';

function AccountNudge({ email, onDone }) {
  const { t } = useLang();
  const [pass,    setPass]    = useState('');
  const [show,    setShow]    = useState(false);
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState('');
  const [created, setCreated] = useState(false);

  const skip = (permanently) => {
    if (permanently) {
      try { localStorage.setItem(NUDGE_SKIP_KEY, '1'); } catch(_) {}
    }
    onDone();
  };

  const create = async () => {
    if (pass.length < 8) { setErr(t.createAccountNudgePasswordPlaceholder); return; }
    setBusy(true); setErr('');
    try {
      const { error } = await sb.auth.signUp({ email, password: pass });
      if (error) throw error;
      setCreated(true);
      setTimeout(onDone, 2000);
    } catch(e) {
      setErr(e.message || t.createAccountNudgeError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div onClick={()=>skip(false)} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",animation:"fadeIn .2s ease" }}/>
      <div style={{ position:"relative",zIndex:1,width:"100%",maxWidth:540,background:T.white,borderRadius:"24px 24px 0 0",padding:"0 0 env(safe-area-inset-bottom,24px)",animation:"slideUp .3s cubic-bezier(.32,0,.28,1)" }}>
        <div style={{ width:36,height:5,borderRadius:3,background:T.gray7,margin:"14px auto 0" }}/>
        <div style={{ padding:"22px 24px 32px" }}>
          {created ? (
            <div style={{ textAlign:"center",padding:"24px 0 12px" }}>
              <div style={{ width:64,height:64,borderRadius:32,background:"#e8faf0",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px" }}>
                <Icon name="check" size={30} color={T.green}/>
              </div>
              <p style={{ fontSize:18,fontWeight:700,color:T.black,margin:"0 0 6px" }}>{t.createAccountNudgeSuccess}</p>
              <p style={{ fontSize:13,color:T.gray4,margin:0 }}>{email}</p>
            </div>
          ) : (
            <>
              <div style={{ display:"flex",alignItems:"flex-start",gap:14,marginBottom:20 }}>
                <div style={{ width:46,height:46,borderRadius:14,background:`${T.blue}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2 }}>
                  <Icon name="person" size={22} color={T.blue}/>
                </div>
                <div>
                  <p style={{ fontSize:17,fontWeight:700,margin:"0 0 6px",letterSpacing:"-0.3px" }}>{t.createAccountNudgeTitle}</p>
                  <p style={{ fontSize:13,color:T.gray4,margin:0,lineHeight:1.6 }}>{t.createAccountNudgeBody}</p>
                </div>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:11,fontWeight:700,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:7 }}>
                  {t.createAccountNudgePasswordLabel}
                </label>
                <div style={{ position:"relative" }}>
                  <input
                    type={show?"text":"password"}
                    value={pass}
                    onChange={e=>{ setPass(e.target.value); setErr(''); }}
                    placeholder={t.createAccountNudgePasswordPlaceholder}
                    style={{ width:"100%",padding:"13px 44px 13px 14px",fontSize:15,background:T.fill3,border:`1.5px solid ${err?T.red:T.gray8}`,borderRadius:13,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif",boxSizing:"border-box" }}
                  />
                  <button onClick={()=>setShow(s=>!s)} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4 }}>
                    <Icon name={show?"eye-off":"eye"} size={17} color={T.gray5}/>
                  </button>
                </div>
                {err&&<p style={{ fontSize:12,color:T.red,margin:"6px 0 0" }}>{err}</p>}
              </div>

              <Btn full onClick={create} disabled={busy||pass.length<2} style={{ borderRadius:13,padding:"15px",fontSize:15,marginBottom:10 }}>
                {busy ? <Spin size={17}/> : t.createAccountNudgeCreate}
              </Btn>

              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <button onClick={()=>skip(false)} style={{ background:"none",border:"none",fontSize:13,color:T.gray4,cursor:"pointer",padding:"8px 0",fontWeight:500 }}>
                  {t.createAccountNudgeSkip}
                </button>
                <button onClick={()=>skip(true)} style={{ background:"none",border:"none",fontSize:12,color:T.gray5,cursor:"pointer",padding:"8px 0" }}>
                  {t.createAccountNudgeDontShow}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PurchaseModal({ product, onClose, sessionId, user }) {
  const { t } = useLang();
  const images = product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [];

  // Pre-fill from logged-in user's metadata
  const meta = user?.user_metadata || {};
  const isRealUser = user && !user.is_anonymous;
  const prefillName  = isRealUser ? (meta.full_name || [meta.first_name, meta.last_name].filter(Boolean).join(' ') || '') : '';
  const prefillEmail = isRealUser ? (user.email || '') : '';
  const prefillPhone = isRealUser ? (meta.phone || '') : '';
  const prefillAddr  = isRealUser ? (meta.address || '') : '';

  const [form, setForm] = useState({
    name:    prefillName,
    email:   prefillEmail,
    phone:   prefillPhone,
    address: prefillAddr,
    note:    '',
    size:    product.sizes?.[0]||'',
    qty:     1,
  });
  const [selectedImg, setSelectedImg] = useState(images[0] || null);
  const [loading, setL]     = useState(false);
  const [sent, setSent]     = useState(false);
  const [err, setErr]       = useState('');
  const [showNudge, setNudge] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Check if "don't show again" was set
  const nudgeSkipped = () => { try { return localStorage.getItem(NUDGE_SKIP_KEY)==='1'; } catch(_){ return false; } };

  const submit = async () => {
    if (!form.name.trim()||!form.email.trim()) { setErr(t.yourName + ' & ' + t.yourEmail + ' are required.'); return; }
    if (images.length > 1 && !selectedImg) { setErr(t.pickRequired); return; }
    setL(true); setErr('');

    const payload = {
      product_id:         product.id,
      product_name:       product.name,
      product_price:      product.price,
      selected_size:      form.size || null,
      quantity:           form.qty,
      buyer_name:         form.name.trim(),
      buyer_email:        form.email.trim(),
      buyer_phone:        form.phone.trim() || null,
      buyer_address:      form.address.trim() || null,
      note:               form.note.trim() || null,
      selected_image_url: selectedImg || null,
      status:             'pending',
    };

    try {
      let { error } = await sb.from('purchase_requests').insert({ ...payload, session_id: sessionId || null });
      if (error && (error.message?.includes('session_id') || error.code === '42703')) {
        const res = await sb.from('purchase_requests').insert(payload);
        error = res.error;
      }
      if (error) throw error;
      setSent(true);
      // Show account nudge only to non-registered users who provided an email and haven't dismissed it
      if (!isRealUser && form.email.trim() && !nudgeSkipped()) {
        setTimeout(() => setNudge(true), 900);
      }
    } catch(e) {
      setErr(e?.message || e?.error_description || 'Something went wrong. Please try again.');
    } finally {
      setL(false);
    }
  };

  const inp = (label, key, type='text', placeholder='', readOnly=false) => (
    <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
      <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:'0.05em',textTransform:'uppercase' }}>{label}</label>
      <input
        type={type} value={form[key]}
        onChange={e=>{ if(!readOnly) set(key,e.target.value); }}
        readOnly={readOnly}
        placeholder={placeholder}
        style={{ padding:'12px 14px',fontSize:15,background:readOnly?T.fill4:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:'none',fontFamily:'-apple-system,sans-serif',opacity:readOnly?0.8:1 }}
      />
    </div>
  );

  return (
    <>
      <div style={{ position:'fixed',inset:0,zIndex:700,display:'flex',alignItems:'flex-end',justifyContent:'center' }}>
        <div onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.52)' }}/>
        <div style={{ position:'relative',zIndex:1,width:'100%',maxWidth:540,background:T.white,borderRadius:'24px 24px 0 0',maxHeight:'92vh',overflowY:'auto',animation:'slideUp .3s cubic-bezier(.32,0,.28,1)' }}>
          <div style={{ width:36,height:5,borderRadius:3,background:T.gray7,margin:'14px auto 0' }}/>
          <div style={{ padding:'20px 24px 40px' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
              <h3 style={{ fontSize:20,fontWeight:700,margin:0,letterSpacing:'-0.4px' }}>{t.requestToBuy}</h3>
              <IconBtn icon="close" onClick={onClose} size={34} color={T.gray4}/>
            </div>

            {/* Product summary */}
            <div style={{ display:'flex',gap:12,background:T.fill4,borderRadius:14,padding:14,marginBottom:22 }}>
              {(selectedImg||product.image_url)&&<div style={{ width:60,height:72,borderRadius:10,overflow:'hidden',flexShrink:0 }}><img src={imgUrl(selectedImg||product.image_url,{width:120,quality:65})} alt={product.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/></div>}
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15,fontWeight:700,margin:'0 0 4px' }}>{product.name}</p>
                <p style={{ fontSize:16,fontWeight:700,color:T.black,margin:0 }}>{$p(product.price)}</p>
              </div>
            </div>

            {/* Image picker */}
            {images.length > 1 && (
              <div style={{ marginBottom:18 }}>
                <p style={{ fontSize:12,fontWeight:700,color:T.gray4,letterSpacing:'0.05em',textTransform:'uppercase',marginBottom:10 }}>{t.pickExactImage}</p>
                <p style={{ fontSize:12,color:T.gray4,marginBottom:12 }}>{t.pickExactImageSub}</p>
                <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
                  {images.map((src,i)=>(
                    <button key={i} onClick={()=>setSelectedImg(src)}
                      style={{ width:80,height:96,borderRadius:12,overflow:'hidden',padding:0,border:`2.5px solid ${selectedImg===src?T.black:T.gray8}`,cursor:'pointer',position:'relative',background:'#f2f2f7',flexShrink:0,boxShadow:selectedImg===src?`0 0 0 2px ${T.black}`:'none',transition:'border .18s, box-shadow .18s' }}>
                      <img src={imgUrl(src,{width:120,quality:65})} alt={`Option ${i+1}`} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }}/>
                      {selectedImg===src&&<div style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.18)',display:'flex',alignItems:'center',justifyContent:'center' }}><Icon name="check" size={18} color="#fff"/></div>}
                    </button>
                  ))}
                </div>
                {!selectedImg&&<p style={{ fontSize:12,color:T.red,marginTop:8 }}>{t.pickRequired}</p>}
              </div>
            )}

            {/* Pre-fill notice */}
            {isRealUser && prefillName && (
              <div style={{ display:'flex',alignItems:'center',gap:8,background:`${T.green}10`,border:`1px solid ${T.green}30`,borderRadius:11,padding:'10px 13px',marginBottom:16 }}>
                <Icon name="check" size={14} color={T.green}/>
                <p style={{ fontSize:12,color:T.green,fontWeight:500,margin:0 }}>{t.requestFormPrefilled}</p>
              </div>
            )}

            {sent ? (
              <div style={{ textAlign:'center',padding:'32px 0' }}>
                <div style={{ width:72,height:72,borderRadius:36,background:'#e8faf0',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16 }}>
                  <Icon name="check" size={34} color={T.green}/>
                </div>
                <p style={{ fontSize:20,fontWeight:700,color:T.black,marginBottom:8 }}>{t.requestSent}</p>
                <p style={{ fontSize:14,color:T.gray4,marginBottom:24,lineHeight:1.6 }}>
                  We'll contact you at <strong>{form.email}</strong> to confirm.
                </p>
                <Btn onClick={onClose} variant="gray" size="sm">Close</Btn>
              </div>
            ) : (
              <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
                {inp(t.yourName,  'name',    'text',  'e.g. Jane Smith')}
                {inp(t.yourEmail, 'email',   'email', 'your@email.com', isRealUser && !!prefillEmail)}
                {inp(t.yourPhone, 'phone',   'tel',   '+255 700 000 000')}
                {inp(t.deliveryAddress,'address','text','Street, City, Country')}

                {product.sizes?.length>0&&(
                  <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
                    <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:'0.05em',textTransform:'uppercase' }}>{t.size}</label>
                    <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                      {product.sizes.map(s=>(
                        <button key={s} onClick={()=>set('size',s)} style={{ padding:'8px 16px',borderRadius:10,border:`1.5px solid ${form.size===s?T.black:T.gray8}`,background:form.size===s?T.black:T.fill3,color:form.size===s?T.white:T.black,fontSize:13,fontWeight:600,cursor:'pointer' }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
                  <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:'0.05em',textTransform:'uppercase' }}>{t.noteToSeller}</label>
                  <textarea value={form.note} onChange={e=>set('note',e.target.value)} placeholder="Anything we should know…" style={{ padding:'12px 14px',fontSize:14,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:'none',fontFamily:'-apple-system,sans-serif',resize:'vertical',minHeight:72 }}/>
                </div>

                {/* Guest tip */}
                {!isRealUser && (
                  <p style={{ fontSize:12,color:T.gray5,background:T.fill4,padding:'9px 13px',borderRadius:10,margin:0,lineHeight:1.5 }}>
                    {t.requestFormGuestNote}
                  </p>
                )}

                {err&&<p style={{ fontSize:13,color:T.red,background:'#fff0f0',padding:'10px 14px',borderRadius:10,margin:0 }}>{err}</p>}
                <Btn full onClick={submit} disabled={loading} style={{ marginTop:4,padding:'16px',fontSize:16,borderRadius:16 }}>
                  {loading?<Spin size={18}/>:t.requestToBuy+' →'}
                </Btn>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account creation nudge — shown after successful send for guests */}
      {showNudge && (
        <AccountNudge email={form.email} onDone={()=>{ setNudge(false); onClose(); }}/>
      )}
    </>
  );
}

/* ─── Cart Drawer ────────────────────────────────────────────── */
function CartDrawer({ cart, onClose, onRemove, onQty, sessionId, user, storeSettings }) {
  const { t } = useLang();
  const subtotal = cart.reduce((s,i) => s + Number(i.price) * Number(i.qty), 0);

  const { delivery_enabled, delivery_cost, free_delivery_threshold } = storeSettings || { delivery_enabled:true, delivery_cost:30000, free_delivery_threshold:500000 };
  const freeByThreshold = subtotal >= free_delivery_threshold;

  const [step,       setStep]      = useState("bag");
  const [phone,      setPhone]     = useState(user?.user_metadata?.phone || "");
  const [note,       setNote]      = useState("");
  const [noDelivery, setNoDelivery]= useState(false);
  const [loading,    setLoad]      = useState(false);
  const [err,        setErr]       = useState("");

  const deliveryFee  = (!delivery_enabled || freeByThreshold || noDelivery) ? 0 : delivery_cost;
  const total        = subtotal + deliveryFee;
  const showFreeBar  = delivery_enabled && !noDelivery;

  const buyerName  = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const buyerEmail = user?.email || "";

  // Guest-only fields
  const [guestName,  setGuestName]  = useState(buyerName);
  const [guestEmail, setGuestEmail] = useState(buyerEmail);

  const submitOrder = async () => {
    swPost('NOTIF_CART_CANCEL'); // order placed — cancel abandonment timer
    const finalName  = user ? buyerName  : guestName.trim();
    const finalEmail = user ? buyerEmail : guestEmail.trim();
    if (!phone.trim()) { setErr(t.cartPhoneLabel + " is required."); return; }
    if (!user && !finalName) { setErr("Please enter your name."); return; }
    setLoad(true); setErr("");
    try {
      // Group items under a shared order reference
      const orderRef = `ORD-${Date.now().toString(36).toUpperCase()}`;
      for (const item of cart) {
        const payload = {
          product_id: item.id, product_name: item.name, product_price: Number(item.price),
          selected_size: item.sz || null, quantity: Number(item.qty),
          selected_image_url: item.selectedImg || item.image_url || null,
          buyer_name:  finalName  || "Guest",
          buyer_email: finalEmail || null,
          buyer_phone: phone.trim(), note: note.trim() || null, status: "pending",
          order_ref: orderRef,
        };
        let { error } = await sb.from("purchase_requests").insert({ ...payload, session_id: sessionId || null });
        if (error?.code === "42703") ({ error } = await sb.from("purchase_requests").insert(payload));
        if (error) throw error;
      }
      setStep("sent");
    } catch(e) {
      setErr(e?.message || "Something went wrong. Please try again.");
    } finally { setLoad(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:500 }}/>
      <div style={{ position:"fixed",top:0,right:0,bottom:0,width:"min(440px,100vw)",background:"#ffffff",zIndex:600,display:"flex",flexDirection:"column",animation:"slideInR 0.36s cubic-bezier(.32,0,.28,1)",borderRadius:"20px 0 0 20px",boxShadow:shadow.xxl }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.gray7,margin:"14px auto 0" }}/>

        {/* ── Header ── */}
        <div style={{ padding:"14px 22px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          {step==="checkout"
            ? <button onClick={()=>setStep("bag")} style={{ display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",color:T.blue,padding:0,fontSize:14,fontWeight:500 }}>
                <Icon name="back" size={17} color={T.blue}/> {t.myBag}
              </button>
            : <span style={{ fontSize:21,fontWeight:700,letterSpacing:"-0.5px" }}>{t.myBag}</span>
          }
          <IconBtn icon="close" onClick={onClose} size={34}/>
        </div>

        {/* ── SENT ── */}
        {step==="sent" && (
          <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px 48px",textAlign:"center",gap:14 }}>
            <div style={{ width:72,height:72,borderRadius:36,background:"#e8faf0",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="check" size={34} color={T.green}/></div>
            <p style={{ fontSize:22,fontWeight:700,letterSpacing:"-0.5px",margin:0 }}>{t.cartSent}</p>
            <p style={{ fontSize:14,color:T.gray4,lineHeight:1.6,maxWidth:280,margin:0 }}>{t.cartSentBody}</p>
            <Btn onClick={onClose} variant="gray" style={{ marginTop:10,borderRadius:14,padding:"13px 32px" }}>{t.continueShopping}</Btn>
          </div>
        )}

        {/* ── CHECKOUT FORM ── */}
        {step==="checkout" && (
          <div style={{ flex:1,overflowY:"auto",padding:"4px 22px 36px" }}>
            {/* Order summary */}
            <div style={{ background:T.fill4,borderRadius:14,padding:"14px 16px",marginBottom:20 }}>
              {cart.map(item=>(
                <div key={`${item.id}-${item.sz}`} style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:13,color:T.gray3,flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8 }}>
                    {item.name || item.product_name || "Item"}{item.sz?` · ${item.sz}`:""} ×{item.qty}
                  </span>
                  <span style={{ fontSize:13,fontWeight:600,flexShrink:0 }}>{$p(Number(item.price)*Number(item.qty))}</span>
                </div>
              ))}
              <div style={{ height:1,background:T.gray8,margin:"8px 0" }}/>
              {deliveryFee > 0 && (
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:13,color:T.gray4 }}>{t.delivery}</span>
                  <span style={{ fontSize:13,color:T.gray4 }}>{$p(deliveryFee)}</span>
                </div>
              )}
              {(deliveryFee === 0 && delivery_enabled && !noDelivery) && (
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:13,color:T.green }}>{t.delivery}</span>
                  <span style={{ fontSize:13,fontWeight:600,color:T.green }}>Free</span>
                </div>
              )}
              <div style={{ display:"flex",justifyContent:"space-between" }}>
                <span style={{ fontSize:14,fontWeight:700 }}>Total</span>
                <span style={{ fontSize:14,fontWeight:700 }}>{$p(total)}</span>
              </div>
            </div>

            <p style={{ fontSize:13,color:T.gray4,marginBottom:18,lineHeight:1.5 }}>{t.cartCheckoutSub}</p>

            {/* Guest-only: name + email */}
            {!user && (<>
              <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:14 }}>
                <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase" }}>Your Name *</label>
                <input type="text" value={guestName} onChange={e=>setGuestName(e.target.value.slice(0,80))} placeholder="Full name" maxLength={80}
                  style={{ padding:"13px 14px",fontSize:15,background:T.fill3,border:`1.5px solid ${err&&!guestName.trim()?T.red:T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif" }}/>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:14 }}>
                <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase" }}>Email (optional)</label>
                <input type="email" value={guestEmail} onChange={e=>setGuestEmail(e.target.value)} placeholder="your@email.com"
                  style={{ padding:"13px 14px",fontSize:15,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif" }}/>
              </div>
            </>)}

            {/* Phone */}
            <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:14 }}>
              <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase" }}>{t.cartPhoneLabel}</label>
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.slice(0,20))} placeholder="+255 700 000 000" maxLength={20}
                style={{ padding:"13px 14px",fontSize:15,background:T.fill3,border:`1.5px solid ${err&&!phone.trim()?T.red:T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif" }}/>
            </div>

            {/* Delivery opt-out */}
            {delivery_enabled && (
              <button onClick={()=>setNoDelivery(v=>!v)}
                style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"12px 14px",borderRadius:12,border:`1.5px solid ${noDelivery?T.black:T.gray8}`,background:noDelivery?T.fill3:T.white,cursor:"pointer",marginBottom:14,textAlign:"left" }}>
                <div style={{ width:20,height:20,borderRadius:10,border:`2px solid ${noDelivery?T.black:T.gray6}`,background:noDelivery?T.black:"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  {noDelivery && <div style={{ width:8,height:8,borderRadius:4,background:T.white }}/>}
                </div>
                <span style={{ fontSize:14,color:T.black,fontWeight:noDelivery?600:400 }}>{t.deliveryOptOut}</span>
              </button>
            )}

            {/* Note */}
            <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:22 }}>
              <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase" }}>{t.noteToSeller}</label>
              <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={t.cartNotePlaceholder}
                style={{ padding:"12px 14px",fontSize:14,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif",resize:"none",minHeight:80 }}/>
            </div>

            {err&&<p style={{ fontSize:13,color:T.red,background:"#fff0f0",padding:"10px 14px",borderRadius:10,margin:"0 0 14px" }}>{err}</p>}
            <Btn full onClick={submitOrder} disabled={loading} style={{ borderRadius:14,padding:"17px",fontSize:16 }}>
              {loading?<Spin size={18}/>:t.cartSubmit+" →"}
            </Btn>
          </div>
        )}

        {/* ── BAG ── */}
        {step==="bag" && (
          <>
            {showFreeBar && (
              <div style={{ margin:"0 22px 10px",background:T.fill4,borderRadius:14,padding:"12px 16px",flexShrink:0 }}>
                {freeByThreshold
                  ? <p style={{ fontSize:13,fontWeight:600,color:T.green,display:"flex",alignItems:"center",gap:6,margin:0 }}><Icon name="truck" size={15} color={T.green}/> {t.freeDeliveryQualify}</p>
                  : <p style={{ fontSize:13,color:T.gray3,margin:0 }}>{t.addMore} <strong>{$p(free_delivery_threshold-subtotal)}</strong> {t.moreForFreeDelivery}</p>
                }
              </div>
            )}
            <div style={{ flex:1,overflowY:"auto",padding:"0 22px" }}>
              {cart.length===0
                ? <EmptyState icon="bag" title={t.emptyBag} body={t.continueShopping}/>
                : cart.map((item,i)=>(
                  <div key={`${item.id}|${item.sz||""}`}>
                    <div style={{ padding:"16px 0",display:"flex",gap:14 }}>
                      <div style={{ width:80,height:100,background:"#f2f2f7",borderRadius:14,flexShrink:0,overflow:"hidden" }}>
                        {(item.selectedImg || item.image_url)
                          ? <img src={imgUrl(item.selectedImg || item.image_url,{width:160,quality:65})} alt={item.name} style={{ width:"100%",height:"100%",objectFit:"cover" }} loading="lazy"/>
                          : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#e8e8ed" }}><Icon name="bag" size={24} color={T.gray5}/></div>}
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <p style={{ fontSize:15,fontWeight:600,marginBottom:2 }}>{item.name || item.product_name || "Item"}</p>
                        {item.sz&&<p style={{ fontSize:13,color:T.gray4,marginBottom:12 }}>{t.size}: {item.sz}</p>}
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                          <div style={{ display:"flex",alignItems:"center",background:T.gray9,borderRadius:99 }}>
                            <button onClick={()=>onQty(item,item.qty-1)} style={{ width:34,height:34,borderRadius:17,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="minus" size={14} color={T.black}/></button>
                            <span style={{ fontSize:15,fontWeight:600,minWidth:22,textAlign:"center" }}>{item.qty}</span>
                            <button onClick={()=>onQty(item,item.qty+1)} style={{ width:34,height:34,borderRadius:17,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="plus" size={14} color={T.black}/></button>
                          </div>
                          <span style={{ fontSize:16,fontWeight:700 }}>{$p(Number(item.price)*Number(item.qty))}</span>
                        </div>
                      </div>
                      <button onClick={()=>onRemove(item)} style={{ background:"none",border:"none",cursor:"pointer",alignSelf:"flex-start",marginTop:2 }}><Icon name="close" size={16} color={T.gray5}/></button>
                    </div>
                    {i<cart.length-1&&<Divider/>}
                  </div>
                ))
              }
            </div>
            {cart.length>0&&(
              <div style={{ padding:"18px 22px 32px",borderTop:`1px solid ${T.gray8}`,flexShrink:0 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ fontSize:14,color:T.gray4 }}>{t.subtotal}</span>
                  <span style={{ fontSize:14,color:T.gray3 }}>{$p(subtotal)}</span>
                </div>
                {delivery_enabled && (
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                    <span style={{ fontSize:14,color:T.gray4 }}>{t.delivery}</span>
                    <span style={{ fontSize:14,color:freeByThreshold?T.green:T.gray3,fontWeight:freeByThreshold?600:400 }}>
                      {freeByThreshold ? t.free : $p(delivery_cost)}
                    </span>
                  </div>
                )}
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
                  <span style={{ fontSize:15,fontWeight:700 }}>{t.total}</span>
                  <span style={{ fontSize:18,fontWeight:700 }}>{$p(freeByThreshold||!delivery_enabled ? subtotal : subtotal+delivery_cost)}</span>
                </div>
                <Btn full onClick={()=>setStep("checkout")} style={{ borderRadius:14,padding:"17px",fontSize:16 }}>{t.checkout}</Btn>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

/* ─── Product Detail ────────────────────────────────────────── */
const ProductDetail = memo(function ProductDetail({ p, onBack, onNavigateProduct, onAdd, wishlisted, onWishlist, sessionId, user, onLoginPrompt, products=[] }) {
  const { t } = useLang();
  const [szs, setSzs]         = useState([]);
  const [done, setDone]       = useState(false);
  const [showReq, setReq]     = useState(false);
  const [imgIdx, setImgIdx]   = useState(0);
  const [lightbox, setLB]     = useState(null);
  const [priceRevealed, setPriceRevealed] = useState(false);
  const [imgErr, setImgErr]   = useState(false);
  const scrollRef             = useRef();

  // Build images array — prefer image_urls, fall back to image_url
  const images = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [];
  const multiImg = images.length > 1;
  // selectedImg tracks which image the user actively chose (required before add-to-bag when multi)
  const [selectedImg, setSelectedImg] = useState(images[0] || null);

  /* ── Scroll gallery to slide ── */
  const scrollTo = (i) => {
    setImgIdx(i);
    setSelectedImg(images[i]);
    setImgErr(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

  /* ── Track scroll position to update dot ── */
  const onScroll = () => {
    if (!scrollRef.current) return;
    const i = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
    setImgIdx(i);
    setSelectedImg(images[i]);
  };

  const inStock = p.in_stock !== false;
  const add = () => {
    if (!inStock) return;
    if (p.sizes?.length > 0 && szs.length === 0) return;
    if (multiImg && !selectedImg) { setImgErr(true); return; }
    // Add one cart entry per selected size
    const toAdd = szs.length > 0 ? szs : [null];
    toAdd.forEach(sz => onAdd({
      ...p,
      sz,
      image_url: selectedImg || images[0] || p.image_url || null,
      selectedImg: selectedImg || images[0] || null,
    }));
    setSzs([]);  // clear size selection after adding
    setDone(true); setTimeout(() => setDone(false), 2200);
  };

  // Guest clicks "Add to Bag" → reveal price first, then let them proceed
  const handleAddToBag = () => {
    if (!user && !priceRevealed) { setPriceRevealed(true); return; }
    add();
  };

  // Guest clicks "Request to Buy" → reveal price then open modal
  const handleRequest = () => {
    if (!user && !priceRevealed) { setPriceRevealed(true); return; }
    setReq(true);
  };

  const showPrice = user || priceRevealed;

  return (
    <div style={{ animation:"fadeIn 0.18s ease" }}>

      {/* ── Image Gallery ── */}
      <div style={{ position:"relative", marginBottom:20, borderRadius:24, overflow:"hidden" }}>
        {images.length === 0 ? (
          <div style={{ aspectRatio:"4/5", background:"#f2f2f7", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:24 }}>
            <Icon name="bag" size={64} color={T.gray6}/>
          </div>
        ) : (
          <>
            {/* Horizontal scroll strip */}
            <div
              ref={scrollRef}
              onScroll={onScroll}
              style={{ display:"flex", overflowX:"auto", scrollSnapType:"x mandatory", scrollbarWidth:"none", WebkitOverflowScrolling:"touch", borderRadius:24, width:"100%" }}
            >
              {images.map((src, i) => (
                <div
                  key={i}
                  onClick={() => setLB(i)}
                  style={{ minWidth:"100%", width:"100%", aspectRatio:"4/5", flexShrink:0, scrollSnapAlign:"start", cursor:"zoom-in", position:"relative", overflow:"hidden", background:"#f2f2f7" }}
                >
                  <img src={imgUrl(src,{width:900,quality:80})} alt={`${p.name} ${i+1}`} loading="lazy" decoding="async" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                </div>
              ))}
            </div>

            {/* Badge */}
            {p.badge && <div style={{ position:"absolute", top:16, left:16, background:p.badge==="Sale"?T.red:"#000", color:"#fff", fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:99, textTransform:"uppercase" }}>{p.badge}</div>}

            {/* Share + Wishlist */}
            <div style={{ position:"absolute", top:14, right:14, display:"flex", flexDirection:"column", gap:10 }}>
              <IconBtn icon="share" onClick={e=>shareProduct(p,e)} size={40} bg="rgba(255,255,255,0.9)" color={T.gray3}/>
              <IconBtn icon={wishlisted?"heart-fill":"heart"} onClick={()=>onWishlist(p.id)} size={40} bg="rgba(255,255,255,0.9)" color={wishlisted?T.red:T.gray3}/>
            </div>

            {/* Zoom hint */}
            {images.length > 0 && (
              <div style={{ position:"absolute", bottom:14, right:14, background:"rgba(0,0,0,0.55)", borderRadius:99, padding:"4px 10px" }}>
                <p style={{ fontSize:11, color:"#fff", margin:0 }}>Tap to zoom</p>
              </div>
            )}

            {/* Dot indicators */}
            {images.length > 1 && (
              <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", display:"flex", gap:5 }}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    style={{ width: i===imgIdx ? 18 : 6, height:6, borderRadius:3, background: i===imgIdx ? "#fff" : "rgba(255,255,255,0.45)", border:"none", cursor:"pointer", padding:0, transition:"width .22s, background .22s" }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Thumbnail strip (when >1 image) ── */}
      {images.length > 1 && (
        <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", scrollbarWidth:"none" }}>
          {images.map((src, i) => (
            <div
              key={i}
              onClick={() => scrollTo(i)}
              style={{ width:60, height:72, borderRadius:12, overflow:"hidden", flexShrink:0, cursor:"pointer", border:`2px solid ${i===imgIdx?T.black:"transparent"}`, transition:"border .18s" }}
            >
              <img src={imgUrl(src,{width:120,quality:65})} alt="" loading="lazy" decoding="async" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize:12,fontWeight:500,color:T.gray4,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6 }}>{p.category}</p>
      <h1 style={{ fontSize:28,fontWeight:700,letterSpacing:"-0.8px",marginBottom:12,lineHeight:1.2,color:T.black }}>{p.name}</h1>

      {Number(p.rating)>0&&(
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
          <RatingStars rating={p.rating}/>
          <span style={{ fontSize:13,color:T.gray3 }}>{p.rating} ({p.reviews} {t.reviewsLabel})</span>
        </div>
      )}

      <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:20 }}>
        {showPrice ? (
          <>
            <span style={{ fontSize:30,fontWeight:700,letterSpacing:"-0.8px",color:p.was?T.red:T.black }}>{$p(p.price)}</span>
            {p.was&&<span style={{ fontSize:18,color:T.gray4,textDecoration:"line-through" }}>{$p(p.was)}</span>}
          </>
        ) : (
          <span style={{ fontSize:22, color:T.gray6, fontStyle:"italic", letterSpacing:"-0.3px" }}>{t.signInToContinue}</span>
        )}
      </div>

      {p.description&&(<><Divider my={16}/><p style={{ fontSize:15,color:T.gray3,lineHeight:1.7,marginBottom:20 }}>{p.description}</p></>)}

      {p.sizes?.length>0&&(
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <p style={{ fontSize:13,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",margin:0,color:T.gray2 }}>{t.size}</p>
            {szs.length>0&&(
              <button onClick={()=>setSzs([])} style={{ fontSize:11,color:T.gray4,background:"none",border:"none",cursor:"pointer",padding:0,fontWeight:500 }}>
                Clear
              </button>
            )}
          </div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
            {p.sizes.map(s=>{
              const on=szs.includes(s);
              return (
                <button key={s}
                  onClick={()=>setSzs(prev=>on?prev.filter(x=>x!==s):[...prev,s])}
                  style={{ minWidth:52,padding:"10px 14px",borderRadius:12,position:"relative",
                    border:`1.5px solid ${on?T.black:T.gray7}`,
                    background:on?T.black:T.fill3,
                    color:on?T.white:T.black,
                    fontSize:14,fontWeight:600,cursor:"pointer",
                    transition:"all .12s"
                  }}>
                  {s}
                  {on&&<span style={{ position:"absolute",top:-5,right:-5,width:16,height:16,borderRadius:8,background:"#1C7A8C",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <Icon name="check" size={8} color="#fff"/>
                  </span>}
                </button>
              );
            })}
          </div>
          {szs.length>1&&(
            <p style={{ fontSize:12,color:T.gray3,marginTop:10,marginBottom:0,fontWeight:500 }}>
              {szs.length} sizes selected — each added to bag separately
            </p>
          )}
        </div>
      )}

      {/* ── Image picker (required when >1 image) ── */}
      {multiImg && (
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <p style={{ fontSize:13,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",margin:0,color:T.gray2 }}>{t.pickExactImage}</p>
            {selectedImg && <span style={{ fontSize:11,color:T.green,fontWeight:600 }}>✓ Selected</span>}
          </div>
          <p style={{ fontSize:12,color:T.gray4,marginBottom:12,lineHeight:1.4 }}>{t.pickExactImageSub}</p>
          <div style={{ display:"flex", gap:10, overflowX:"auto", scrollbarWidth:"none", paddingBottom:4 }}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={()=>{ setSelectedImg(src); setImgErr(false); scrollTo(i); }}
                style={{
                  width:72, height:88, borderRadius:14, overflow:"hidden", padding:0, flexShrink:0,
                  border:`2.5px solid ${selectedImg===src ? T.black : T.gray8}`,
                  cursor:"pointer", position:"relative", background:"#f2f2f7",
                  boxShadow: selectedImg===src ? `0 0 0 2px ${T.black}` : "none",
                  transition:"border .18s, box-shadow .18s",
                }}
              >
                <img src={imgUrl(src,{width:120,quality:65})} alt={`Option ${i+1}`} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
                {selectedImg===src && (
                  <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.22)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <div style={{ width:22,height:22,borderRadius:11,background:"#fff",display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <span style={{ fontSize:13,lineHeight:1 }}>✓</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          {imgErr && (
            <div style={{ marginTop:10,background:"#fff0f0",borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:8 }}>
              <Icon name="chevronR" size={16} color={T.red}/>
              <p style={{ fontSize:13,color:T.red,margin:0,fontWeight:500 }}>{t.pickRequired}</p>
            </div>
          )}
        </div>
      )}

      {!inStock && (
        <div style={{ background:"#fff0f0",borderRadius:14,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10 }}>
          <Icon name="close" size={14} color={T.red}/>
          <p style={{ fontSize:14,fontWeight:600,color:T.red,margin:0 }}>Sold Out — Join the waitlist below</p>
        </div>
      )}
      <div style={{ display:"flex",gap:12,marginBottom:24 }}>
        <Btn
          full
          onClick={handleAddToBag}
          disabled={!inStock || (showPrice && p.sizes?.length > 0 && szs.length === 0)}
          style={{ borderRadius:16, padding:"17px", fontSize:16, ...(inStock ? {} : { background:"#C7C7CC", cursor:"not-allowed" }) }}
        >
          {!inStock ? "Sold Out" : done ? t.addedToBag : t.addToBagReveal}
        </Btn>
        <Btn variant="gray" onClick={handleRequest} style={{ borderRadius:16,padding:"17px",whiteSpace:"nowrap" }}>
          {t.requestReveal}
        </Btn>
      </div>

      {showReq&&<PurchaseModal product={p} onClose={()=>setReq(false)} sessionId={sessionId} user={user}/>}


      <RelatedProducts currentProduct={p} products={products} onSelect={onNavigateProduct} wishlist={[]} onWishlist={onWishlist} user={user} onLoginPrompt={onLoginPrompt}/>

      {/* ── Lightbox / Zoom ── */}
      {lightbox !== null && (
        <ImageLightbox images={images} startIndex={lightbox} onClose={() => setLB(null)}/>
      )}
    </div>
  );
});

/* ─── Image Lightbox with pinch-to-zoom ─────────────────────── */
function ImageLightbox({ images, startIndex, onClose }) {
  const { t }             = useLang();
  const [idx, setIdx]     = useState(startIndex ?? 0);
  const [scale, setScale] = useState(1);
  const [offset, setOffs] = useState({ x:0, y:0 });
  const containerRef      = useRef(null);
  const lastTouch         = useRef(null);
  const lastDist          = useRef(null);
  const dragStart         = useRef(null);

  const reset = () => { setScale(1); setOffs({ x:0, y:0 }); };
  const goTo  = (i) => { reset(); setIdx((i + images.length) % images.length); };

  // Attach touch handlers with { passive:false } so preventDefault works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDist.current = Math.hypot(dx, dy);
        lastTouch.current = null;
      } else if (e.touches.length === 1) {
        lastTouch.current = e.touches[0].clientX;
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastDist.current) {
          const delta = dist / lastDist.current;
          setScale(s => Math.min(Math.max(s * delta, 1), 5));
        }
        lastDist.current = dist;
      } else if (e.touches.length === 1) {
        setScale(s => {
          if (s > 1 && dragStart.current) {
            e.preventDefault();
            const dx = e.touches[0].clientX - dragStart.current.x;
            const dy = e.touches[0].clientY - dragStart.current.y;
            setOffs(o => ({ x: o.x + dx, y: o.y + dy }));
            dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
          return s;
        });
      }
    };

    const onEnd = (e) => {
      lastDist.current = null;
      dragStart.current = null;
      // swipe to next/prev only when not zoomed
      setScale(s => {
        if (s <= 1 && e.changedTouches.length === 1 && lastTouch.current !== null) {
          const dx = lastTouch.current - e.changedTouches[0].clientX;
          if (Math.abs(dx) > 50) {
            setIdx(i => (i + (dx > 0 ? 1 : -1) + images.length) % images.length);
            setOffs({ x:0, y:0 });
          }
        }
        return s;
      });
      lastTouch.current = null;
    };

    el.addEventListener('touchstart', onStart, { passive:true });
    el.addEventListener('touchmove',  onMove,  { passive:false });
    el.addEventListener('touchend',   onEnd,   { passive:true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove',  onMove);
      el.removeEventListener('touchend',   onEnd);
    };
  }, [images.length]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.96)", display:"flex", alignItems:"center", justifyContent:"center", touchAction:"none" }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{ position:"absolute", top:20, right:20, zIndex:10, width:40, height:40, borderRadius:20, background:"rgba(255,255,255,0.12)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
      >
        <Icon name="close" size={20} color="#fff"/>
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <p style={{ position:"absolute", top:24, left:"50%", transform:"translateX(-50%)", color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600, margin:0, pointerEvents:"none" }}>
          {idx + 1} / {images.length}
        </p>
      )}

      {/* Image */}
      <div
        onDoubleClick={() => scale > 1 ? reset() : setScale(2.5)}
        style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}
      >
        <img
          src={imgUrl(images[idx],{width:1200,quality:85})}
          alt=""
          style={{
            maxWidth:"100%", maxHeight:"100%", objectFit:"contain",
            transform:`scale(${scale}) translate(${offset.x/scale}px, ${offset.y/scale}px)`,
            transition: scale === 1 ? "transform .25s" : "none",
            userSelect:"none", pointerEvents:"none", display:"block",
          }}
        />
      </div>

      {/* Hint */}
      {scale === 1 && (
        <p style={{ position:"absolute", bottom:images.length>1?80:32, left:"50%", transform:"translateX(-50%)", color:"rgba(255,255,255,0.3)", fontSize:12, whiteSpace:"nowrap", margin:0, pointerEvents:"none" }}>
          {t.pinchZoom}
        </p>
      )}

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button onClick={()=>goTo(idx-1)} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", width:40, height:40, borderRadius:20, background:"rgba(255,255,255,0.12)", border:"none", cursor:"pointer", color:"#fff", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
          <button onClick={()=>goTo(idx+1)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", width:40, height:40, borderRadius:20, background:"rgba(255,255,255,0.12)", border:"none", cursor:"pointer", color:"#fff", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
          {/* Dot strip */}
          <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6, pointerEvents:"none" }}>
            {images.map((_, i) => (
              <div key={i} style={{ width: i===idx?18:6, height:6, borderRadius:3, background: i===idx?"#fff":"rgba(255,255,255,0.3)", transition:"width .2s" }}/>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Hero Slider ───────────────────────────────────────────── */
function HeroSlider({ onNavigate, products }) {
  const { t } = useLang();
  const [idx,  setIdx]  = useState(0);
  const [drag, setDrag] = useState(null);
  const timerRef        = useRef(null);

  const imgOf = (list) => {
    for (const p of list) {
      const src = p.image_urls?.[0] || p.image_url;
      if (src) return src;
    }
    return null;
  };

  const slides = useMemo(() => {
    const newP  = products.filter(p => p.badge === "New");
    const hotP  = products.filter(p => ["Hot","hot","Trending","trending"].includes(p.badge));
    const saleP = products.filter(p => p.badge === "Sale");
    return [
      {
        id:1,
        tag:   t.heroNewLabel,
        title: t.heroNewTitle,
        sub:   t.heroNewSub,
        cta:   t.heroNewCta,
        nav:   "shop",
        img:   imgOf(newP) || imgOf(products),
      },
      {
        id:2,
        tag:   t.heroHotLabel,
        title: t.heroHotTitle,
        sub:   t.heroHotSub,
        cta:   t.heroHotCta,
        nav:   "shop",
        img:   imgOf(hotP.length ? hotP : products),
      },
      {
        id:3,
        tag:   t.heroSaleLabel,
        title: t.heroSaleTitle,
        sub:   t.heroSaleSub,
        cta:   t.heroSaleCta,
        nav:   "shop",
        img:   imgOf(saleP) || imgOf(products),
      },
    ].filter(sl => sl.img);
  }, [products, t]);

  const N = slides.length || 1;
  const go = (i) => { setIdx((i + N) % N); };
  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(i => (i+1) % N), 5000);
  };
  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [N]);

  const onDragStart = (x) => setDrag({ x });
  const onDragEnd   = (x) => {
    if (!drag) return;
    const dx = drag.x - x;
    if (Math.abs(dx) > 44) { go(idx + (dx > 0 ? 1 : -1)); resetTimer(); }
    setDrag(null);
  };

  if (!slides.length) return null;
  const sl = slides[idx];

  return (
    <div
      style={{ borderRadius:13, overflow:"hidden", marginBottom:24, userSelect:"none", background:"#111" }}
      onMouseDown={e=>onDragStart(e.clientX)}
      onMouseUp={e=>onDragEnd(e.clientX)}
      onTouchStart={e=>onDragStart(e.touches[0].clientX)}
      onTouchEnd={e=>onDragEnd(e.changedTouches[0].clientX)}
    >
      {/* ── Slide strip — each slide is a LEFT TEXT / RIGHT IMAGE split ── */}
      <div style={{ display:"flex", width:`${N*100}%`, transition:"transform .45s cubic-bezier(.32,0,.28,1)", transform:`translateX(-${idx*(100/N)}%)` }}>
        {slides.map((s, si) => (
          <div key={s.id} style={{ width:`${100/N}%`, flexShrink:0, display:"flex", height:260, background:"#111" }}>

            {/* LEFT — text column */}
            <div style={{ width:"48%", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"22px 0 22px 18px" }}>
              {/* Top: tag + title */}
              <div>
                <p style={{ margin:"0 0 8px", fontSize:9, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)" }}>
                  {s.tag}
                </p>
                <h2 style={{ margin:0, fontSize:21, fontWeight:800, color:"#fff", lineHeight:1.2, letterSpacing:"-0.3px" }}>
                  {s.title}
                </h2>
              </div>
              {/* Bottom: dots only — CTA is on the photo */}
              <div style={{ display:"flex", gap:5 }}>
                {slides.map((_,i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); go(i); resetTimer(); }}
                    style={{ width:i===idx?16:5, height:4, borderRadius:2, background:i===idx?"#fff":"rgba(255,255,255,0.3)", border:"none", cursor:"pointer", padding:0, transition:"width .25s" }}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT — product photo, hard edge no fade */}
            <div style={{ width:"52%", position:"relative", overflow:"hidden" }}>
              <img
                src={imgUrl(s.img, { width:600, quality:80 })}
                alt={s.title}
                loading={si===0?"eager":"lazy"}
                decoding={si===0?"sync":"async"}
                style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }}
              />
              {/* CTA pinned to bottom-right of photo */}
              <button
                onClick={() => onNavigate(s.nav)}
                style={{ position:"absolute", bottom:16, right:14, background:"#fff", color:"#111", border:"none", borderRadius:99, padding:"9px 16px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", boxShadow:"0 2px 12px rgba(0,0,0,0.25)" }}
              >
                {s.cta}
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
const HomeScreen = memo(function HomeScreen({ products, onSelect, onWishlist, wishlist, onNavigate, user, onLoginPrompt }) {
  const { t } = useLang();
  const newP  = useMemo(() => products.filter(p=>p.badge==='New').slice(0,8), [products]);
  const saleP = useMemo(() => products.filter(p=>p.badge==='Sale').slice(0,8), [products]);
  const trend = useMemo(() => products.slice(0,6), [products]);

  if (products.length===0) return <EmptyState icon="bag" title={t.shopOpeningSoon} body={t.curatingCollection}/>;

  return (
    <div style={{ animation:"fadeIn 0.18s ease" }}>
      <HeroSlider onNavigate={onNavigate} products={products}/>

      {newP.length>0&&(
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <p style={{ fontSize:20,fontWeight:700,letterSpacing:"-0.5px",margin:0 }}>{t.newIn}</p>
            <button onClick={()=>onNavigate("shop")} style={{ background:"none",border:"none",cursor:"pointer",fontSize:14,color:T.blue,fontWeight:500 }}>{t.seeAll}</button>
          </div>
          <HScroll gap={12} px={16}>{newP.map(p=><ProductCard key={p.id} p={p} compact onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)} user={user} onLoginPrompt={onLoginPrompt}/>)}</HScroll>
        </div>
      )}

      {saleP.length>0&&(
        <div style={{ background:"linear-gradient(135deg,#fff0f0,#ffe5e5)",borderRadius:20,padding:"22px 20px",marginBottom:28 }}>
          <p style={{ fontSize:12,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.red,marginBottom:4 }}>{t.limitedTime}</p>
          <p style={{ fontSize:22,fontWeight:800,letterSpacing:"-0.5px",marginBottom:4 }}>{t.upTo40}</p>
          <p style={{ fontSize:13,color:T.gray4,marginBottom:16 }}>{t.whileStocks}</p>
          <Btn size="sm" style={{ background:T.red,color:T.white }} onClick={()=>onNavigate("shop")}>{t.shopSale}</Btn>
        </div>
      )}

      {trend.length>0&&(
        <div style={{ marginBottom:32 }}>
          <p style={{ fontSize:20,fontWeight:700,letterSpacing:"-0.5px",marginBottom:16 }}>{t.trendingNow}</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 10px" }}>
            {trend.map(p=><ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)} user={user} onLoginPrompt={onLoginPrompt}/>)}
          </div>
        </div>
      )}
    </div>
  );
});

/* ─── Shop ──────────────────────────────────────────────────── */
const ShopScreen = memo(function ShopScreen({ products, onSelect, onWishlist, wishlist, user, onLoginPrompt }) {
  const { t } = useLang();
  const [cat,setCat]   = useState("All");
  const [sort,setSort] = useState("featured");
  const [grid,setGrid] = useState(true);

  const cats = useMemo(() => ["All", ...new Set(products.map(p=>p.category).filter(Boolean))], [products]);

  const filtered = useMemo(() => {
    let p = cat==="All" ? products : products.filter(x=>x.category===cat);
    if (sort==="low")    p=[...p].sort((a,b)=>a.price-b.price);
    if (sort==="high")   p=[...p].sort((a,b)=>b.price-a.price);
    if (sort==="rating") p=[...p].sort((a,b)=>b.rating-a.rating);
    if (sort==="new")    p=[...p].filter(x=>x.badge==="New").concat([...p].filter(x=>x.badge!=="New"));
    return p;
  }, [cat,sort,products]);

  if (products.length===0) return <EmptyState icon="bag" title={t.shopEmpty} body={t.shopEmptyBody}/>;

  return (
    <div style={{ animation:"fadeIn 0.18s ease" }}>
      <HScroll gap={8}>{cats.map(c=><Chip key={c} label={c} active={cat===c} onClick={()=>setCat(c)}/>)}</HScroll>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",margin:"16px 0 20px" }}>
        <span style={{ fontSize:14,color:T.gray4 }}>{filtered.length} {t.items}</span>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{ fontSize:14,color:T.black,background:T.fill3,border:"none",padding:"9px 16px",borderRadius:99,cursor:"pointer",outline:"none" }}>
            <option value="featured">{t.sortFeatured}</option>
            <option value="new">{t.sortNew}</option>
            <option value="low">{t.sortLow}</option>
            <option value="high">{t.sortHigh}</option>
            <option value="rating">{t.sortRating}</option>
          </select>
          <button onClick={()=>setGrid(g=>!g)} style={{ width:36,height:36,borderRadius:10,background:T.fill3,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Icon name={grid?"list":"grid"} size={16} color={T.black}/>
          </button>
        </div>
      </div>
      {filtered.length===0 ? <EmptyState icon="search" title={`No ${cat} ${t.items}`} body={t.tryCategory}/> : (
        <div style={{ display:"grid",gridTemplateColumns:grid?"1fr 1fr":"1fr",gap:grid?"16px 10px":"12px" }}>
          {filtered.map(p=>(
            grid ? <ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)} user={user} onLoginPrompt={onLoginPrompt}/> : (
              <div key={p.id} onClick={()=>onSelect(p)} className="pressable" style={{ display:"flex",gap:14,cursor:"pointer",background:T.fill4,borderRadius:18,padding:14 }}>
                <div style={{ width:80,height:100,background:"#f2f2f7",borderRadius:14,flexShrink:0,overflow:"hidden" }}>
                  {p.image_url?<img src={imgUrl(p.image_url,{width:160,quality:65})} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#f2f2f7" }}><Icon name="bag" size={22} color={T.gray6}/></div>}
                </div>
                <div style={{ flex:1,minWidth:0,paddingTop:2 }}>
                  <p style={{ fontSize:15,fontWeight:700,marginBottom:4 }}>{p.name}</p>
                  <p style={{ fontSize:12,color:T.gray4,marginBottom:6 }}>{p.category}</p>
                  {Number(p.rating)>0&&<RatingStars rating={p.rating} size={11}/>}
                  <div style={{ marginTop:6 }}><PriceLine price={p.price} was={p.was} user={user} onLoginPrompt={onLoginPrompt}/></div>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
});

/* ─── Search ────────────────────────────────────────────────── */
function SearchScreen({ products, onSelect, onWishlist, wishlist, user, onLoginPrompt }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [dq, setDq] = useState("");
  const debRef = useRef(null);
  const onSearchChange = (v) => {
    setQ(v);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDq(v), 180);
  };
  const res = useMemo(() => {
    const ql = dq.trim().toLowerCase();
    if (ql.length < 2) return [];
    return products.filter(p =>
      p.name?.toLowerCase().includes(ql) ||
      p.category?.toLowerCase().includes(ql) ||
      p.description?.toLowerCase().includes(ql) ||
      p.badge?.toLowerCase().includes(ql)
    );
  }, [dq, products]);
  return (
    <div style={{ animation:"fadeIn 0.18s ease" }}>
      <div style={{ position:"relative",marginBottom:22 }}>
        <input value={q} onChange={e=>onSearchChange(e.target.value)} placeholder={t.searchPlaceholder} style={{ width:"100%",padding:"15px 20px 15px 48px",fontSize:16,background:T.fill4,border:"none",borderRadius:14,outline:"none",color:T.black,boxSizing:"border-box" }}/>
        <span style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)" }}><Icon name="search" size={19} color={T.gray4}/></span>
        {q&&<button onClick={()=>setQ("")} style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer" }}><Icon name="close" size={16} color={T.gray4}/></button>}
      </div>
      {q.length<2 ? (
        products.length===0 ? <EmptyState icon="search" title={t.search} body={t.noProducts}/> : (
          <><p style={{ fontSize:16,fontWeight:700,marginBottom:14 }}>{t.trending}</p><HScroll gap={10} px={16}>{products.slice(0,8).map(p=><ProductCard key={p.id} p={p} compact onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)} user={user} onLoginPrompt={onLoginPrompt}/>)}</HScroll></>
        )
      ) : (
        <>
          <p style={{ fontSize:14,color:T.gray4,marginBottom:20 }}>{res.length} {res.length!==1?t.noResults:t.noResults} for "{q}"</p>
          {res.length===0 ? <EmptyState icon="search" title={t.noResults} body={`${t.nothingMatched} "${q}".`}/> : (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 10px" }}>
              {res.map(p=><ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)} user={user} onLoginPrompt={onLoginPrompt}/>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Wishlist ──────────────────────────────────────────────── */
function WishlistScreen({ products, wishlist, onSelect, onWishlist, user, onLoginPrompt }) {
  const { t } = useLang();
  const items = products.filter(p=>wishlist.includes(p.id));
  return (
    <div style={{ animation:"fadeIn 0.18s ease" }}>
      <p style={{ fontSize:14,color:T.gray4,marginBottom:20 }}>{items.length} {t.savedItems}</p>
      {items.length===0 ? <EmptyState icon="heart" title={t.wishlistEmpty} body={t.wishlistEmptyBody}/> : (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 10px" }}>
          {items.map(p=><ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={true} user={user} onLoginPrompt={onLoginPrompt}/>)}
        </div>
      )}
    </div>
  );
}

/* ─── Auth Gate HOC ─────────────────────────────────────────── */
function AuthGate({ user, onLogin, children, t }) {
  if (user) return children;
  return (
    <div style={{ animation:"fadeIn .18s ease", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 24px", gap:20, textAlign:"center" }}>
      <div style={{ width:64,height:64,borderRadius:20,background:T.fill3,display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="lock" size={28} color={T.gray4}/></div>
      <p style={{ fontSize:22, fontWeight:700, margin:0, letterSpacing:"-0.5px" }}>{t.loginRequired}</p>
      <p style={{ fontSize:15, color:T.gray4, margin:0, maxWidth:280, lineHeight:1.6 }}>{t.loginRequiredBody}</p>
      <Btn onClick={onLogin} style={{ borderRadius:14, padding:"14px 32px", fontSize:16 }}>{t.signIn} / {t.createAccount}</Btn>
    </div>
  );
}

/* ─── Customer Auth Modal ───────────────────────────────────── */
function AuthModal({ onClose, onAuth, t }) {
  const [mode, setMode]   = useState("login");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [name,  setName]  = useState("");
  const [show,  setShow]  = useState(false);
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);

  const go = async () => {
    if (!email || !pass) { setErr("Email and password are required."); return; }
    setBusy(true); setErr("");
    try {
      let res;
      if (mode === "login") {
        res = await sb.auth.signInWithPassword({ email, password: pass });
      } else {
        res = await sb.auth.signUp({ email, password: pass, options: { data: { full_name: name } } });
      }
      if (res.error) throw res.error;
      onAuth(res.data.user || res.data.session?.user);
      onClose();
    } catch(e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.55)" }}/>
      <div style={{ position:"relative",zIndex:1,width:"100%",maxWidth:480,margin:"0 auto",background:T.white,borderRadius:"24px 24px 0 0",padding:"28px 24px 40px",animation:"slideUp .3s cubic-bezier(.32,0,.28,1)",paddingBottom:"env(safe-area-inset-bottom,40px)" }}>
        <div style={{ width:36,height:5,borderRadius:3,background:T.gray7,margin:"-14px auto 20px" }}/>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
          <h2 style={{ fontSize:22,fontWeight:700,margin:0,letterSpacing:"-0.5px" }}>{mode==="login" ? t.signIn : t.createAccount}</h2>
          <IconBtn icon="close" onClick={onClose} size={34} color={T.gray4}/>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {mode==="signup" && (
            <input value={name} onChange={e=>setName(e.target.value)} placeholder={t.yourName} style={{ padding:"14px 16px",fontSize:15,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif" }}/>
          )}
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t.email} style={{ padding:"14px 16px",fontSize:15,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif" }}/>
          <div style={{ position:"relative" }}>
            <input type={show?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder={t.password} style={{ width:"100%",padding:"14px 48px 14px 16px",fontSize:15,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif",boxSizing:"border-box" }}/>
            <button onClick={()=>setShow(s=>!s)} style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:4 }}>
              <Icon name={show?"close":"search"} size={18} color={T.gray5}/>
            </button>
          </div>
          {err && <p style={{ fontSize:13,color:T.red,background:"#fff0f0",padding:"10px 14px",borderRadius:10,margin:0 }}>{err}</p>}
          <Btn full onClick={go} disabled={busy} style={{ borderRadius:12,padding:"15px",fontSize:16,marginTop:4 }}>
            {busy ? <Spin size={18}/> : mode==="login" ? t.signIn : t.createAccount}
          </Btn>
        </div>
        <p style={{ textAlign:"center",fontSize:14,color:T.gray4,marginTop:18 }}>
          {mode==="login" ? t.noAccount : t.alreadyAccount}{" "}
          <button onClick={()=>{ setMode(m=>m==="login"?"signup":"login"); setErr(""); }} style={{ background:"none",border:"none",color:T.blue,cursor:"pointer",fontWeight:600,fontSize:14,padding:0 }}>
            {mode==="login" ? t.createAccount : t.signIn}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─── Account Screen ────────────────────────────────────────── */
function AccountScreen({ onNavigate, user, onLogin, onLogout, onFeedback, t, inbox = [] }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || t.guestUser;

  const publicRows = [
    { icon:"box",      label:t.myOrders,      sub:"Track your purchases",      go:"orders"       },
    { icon:"heart",    label:t.wishlist,       sub:"Your saved items",          go:"wishlist"     },
    { icon:"share",    label:t.ourStory,       sub:"Who we are",                go:"our-story"    },
    { icon:"truck",    label:t.returns,        sub:"3–5 day returns",       go:"returns"      },
    { icon:"gift",     label:t.sustainability, sub:"Our commitment",            go:"sustainability"},
    { icon:"grid",     label:t.lookbook,       sub:"SS26 Collection",           go:"lookbook"     },
  ];

  const privateRows = [
    { icon:"person",   label:t.editProfile,   sub:"Name, email, phone",        go:"edit-profile",  auth:true },
    { icon:"location", label:t.addresses,     sub:"Delivery addresses",        go:"addresses",     auth:true },
    { icon:"bell",     label:t.notifications, sub:t.notificationsDesc,         go:"notifications", auth:true },
    { icon:"settings", label:t.settings,      sub:t.settingsDesc,              go:"settings",      auth:false },
    { icon:"card",     label:t.privacy,       sub:"Privacy & Terms",           go:"privacy",       auth:false },
  ];

  const unread = inboxUnreadCount(inbox);

  const Row = ({ icon, label, sub, go, auth }) => {
    const locked = auth && !user;
    const isBell = go === 'notifications';
    return (
      <button
        onClick={()=> locked ? onLogin() : onNavigate(go)}
        style={{ width:"100%",display:"flex",alignItems:"center",gap:14,padding:"15px 18px",background:"none",border:"none",cursor:"pointer",textAlign:"left" }}
      >
        <div style={{ width:38,height:38,borderRadius:10,background:T.fill3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0, position:"relative" }}>
          <Icon name={icon} size={18} color={T.black}/>
          {isBell && unread > 0 && (
            <div style={{ position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:8,background:"#FF3B30",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <span style={{ fontSize:9,fontWeight:700,color:"#fff" }}>{unread > 9 ? "9+" : unread}</span>
            </div>
          )}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15,fontWeight:600,margin:0,letterSpacing:"-0.2px" }}>{label}</p>
          <p style={{ fontSize:12,color:T.gray4,margin:"2px 0 0" }}>{sub}</p>
        </div>
        {locked
          ? <span style={{ fontSize:11,color:T.gray5,background:T.fill3,borderRadius:99,padding:"3px 10px",flexShrink:0 }}>{t.signIn}</span>
          : <Icon name="chevronR" size={16} color={T.gray5}/>
        }
      </button>
    );
  };

  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      {/* Profile hero */}
      <div style={{ background:`linear-gradient(145deg,${T.blue},${T.gray2})`,borderRadius:24,padding:"24px",marginBottom:24 }}>
        <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom: user ? 16 : 0 }}>
          <div style={{ width:60,height:60,borderRadius:30,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Icon name="person" size={26} color="rgba(255,255,255,0.7)"/>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:19,fontWeight:700,color:T.white,letterSpacing:"-0.4px",margin:0 }}>{displayName}</p>
            <p style={{ fontSize:13,color:"rgba(255,255,255,0.45)",marginTop:3 }}>{user ? user.email : t.member}</p>
          </div>
        </div>
        {!user && (
          <button onClick={onLogin} style={{ width:"100%",background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",borderRadius:12,padding:"12px",fontSize:14,fontWeight:600,cursor:"pointer",marginTop:4 }}>
            {t.signIn} / {t.createAccount} →
          </button>
        )}
        {user && (
          <button onClick={onLogout} style={{ background:"rgba(255,59,48,0.15)",border:"1px solid rgba(255,59,48,0.3)",color:"#FF6B6B",borderRadius:12,padding:"9px 18px",fontSize:13,fontWeight:600,cursor:"pointer" }}>
            {t.signOut}
          </button>
        )}
      </div>

      {/* Main rows */}
      <div style={{ background:T.fill4,borderRadius:20,overflow:"hidden",marginBottom:16 }}>
        {publicRows.map((row,i)=>(
          <div key={row.label}>
            <Row {...row}/>
            {i<publicRows.length-1&&<div style={{ height:1,background:T.gray8,margin:"0 18px" }}/>}
          </div>
        ))}
      </div>

      <div style={{ background:T.fill4,borderRadius:20,overflow:"hidden",marginBottom:24 }}>
        {privateRows.map((row,i)=>(
          <div key={row.label}>
            <Row {...row}/>
            {i<privateRows.length-1&&<div style={{ height:1,background:T.gray8,margin:"0 18px" }}/>}
          </div>
        ))}
      </div>

      {/* Help us improve */}
      <button onClick={onFeedback} style={{ width:"100%",display:"flex",alignItems:"center",gap:14,background:`linear-gradient(135deg,${T.blue},${T.brandLight||"#4EC8E8"})`,border:"none",borderRadius:20,padding:"18px 20px",cursor:"pointer",marginBottom:16,textAlign:"left" }}>
        <div style={{ width:40,height:40,borderRadius:12,background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name="chat" size={20} color="#fff"/></div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:15,fontWeight:700,color:"#fff",margin:0 }}>{t.helpFeedback}</p>
          <p style={{ fontSize:12,color:"rgba(255,255,255,0.75)",margin:"2px 0 0" }}>{t.helpFeedbackSub}</p>
        </div>
        <Icon name="chevronR" size={16} color="rgba(255,255,255,0.8)"/>
      </button>

      <p style={{ textAlign:"center",fontSize:12,color:T.gray6,marginBottom:8 }}>MSAMBWA · {t.version}</p>
    </div>
  );
}

/* ─── Edit Profile Screen ───────────────────────────────────── */
function EditProfileScreen({ user, onBack, t }) {
  const [form, setForm] = useState({
    firstName: user?.user_metadata?.full_name?.split(" ")[0] || "",
    lastName:  user?.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "",
    phone:     user?.user_metadata?.phone || "",
    email:     user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const save = async () => {
    setSaving(true);
    await sb.auth.updateUser({ data: { full_name: `${form.firstName} ${form.lastName}`.trim(), phone: form.phone } });
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  const inp = (label, key, type="text", placeholder="") => (
    <div style={{ marginBottom:14 }}>
      <p style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase",margin:"0 0 6px" }}>{label}</p>
      <input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder}
        style={{ width:"100%",padding:"14px 16px",fontSize:15,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",boxSizing:"border-box",fontFamily:"-apple-system,sans-serif" }}/>
    </div>
  );

  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      {saved && (
        <div style={{ background:"#e8faf0",borderRadius:14,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10 }}>
          <Icon name="check" size={18} color={T.green}/>
          <p style={{ fontSize:14,fontWeight:600,color:T.green,margin:0 }}>Profile saved!</p>
        </div>
      )}
      <div style={{ background:T.white,borderRadius:20,padding:"20px",boxShadow:shadow.xs,marginBottom:20 }}>
        {inp(t.firstName, "firstName", "text", "Jane")}
        {inp(t.lastName,  "lastName",  "text", "Smith")}
        {inp(t.phone,     "phone",     "tel",  "+1 555 000 0000")}
        <div style={{ marginBottom:0 }}>
          <p style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase",margin:"0 0 6px" }}>{t.email}</p>
          <p style={{ padding:"14px 16px",fontSize:15,background:T.fill3,borderRadius:12,color:T.gray5,margin:0 }}>{form.email}</p>
          <p style={{ fontSize:11,color:T.gray5,margin:"5px 0 0" }}>Email cannot be changed here</p>
        </div>
      </div>
      <Btn full onClick={save} disabled={saving} style={{ borderRadius:14,padding:"16px",fontSize:16 }}>
        {saving ? <Spin size={18}/> : t.saveChanges}
      </Btn>
    </div>
  );
}

/* ─── Addresses Screen ──────────────────────────────────────── */
function AddressesScreen({ t, user }) {
  const [addresses, setAddresses] = useState([]);
  const [adding,    setAdding]    = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm]           = useState({ label:"Home", street:"", city:"", country:"Tanzania", postcode:"" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Load from Supabase
  useEffect(() => {
    if (!user?.id) return;
    sb.from('user_addresses').select('*').eq('user_id', user.id).order('created_at')
      .then(({ data }) => { if (data) setAddresses(data); });
  }, [user?.id]);

  const saveAddress = async () => {
    if (!form.street || !form.city) return;
    setSaving(true);
    const payload = { ...form, user_id: user.id };
    const { data, error } = await sb.from('user_addresses').insert(payload).select().single();
    if (!error && data) setAddresses(a => [...a, data]);
    setForm({ label:"Home", street:"", city:"", country:"Tanzania", postcode:"" });
    setAdding(false);
    setSaving(false);
  };

  const deleteAddress = async (id) => {
    await sb.from('user_addresses').delete().eq('id', id).eq('user_id', user.id);
    setAddresses(a => a.filter(x => x.id !== id));
  };

  const inp = (label, key, placeholder, type="text") => (
    <div style={{ marginBottom:10 }}>
      <p style={{ fontSize:11,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase",margin:"0 0 5px" }}>{label}</p>
      <input value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder}
        style={{ width:"100%",padding:"12px 14px",fontSize:15,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",boxSizing:"border-box",fontFamily:"-apple-system,sans-serif" }}/>
    </div>
  );

  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      {addresses.length === 0 && !adding && (
        <EmptyState icon="location" title="No addresses saved" body="Add a delivery address to speed up checkout." action={<Btn onClick={()=>setAdding(true)} size="sm">{t.addAddress}</Btn>}/>
      )}
      {addresses.map((a) => (
        <div key={a.id} style={{ background:T.fill4,borderRadius:16,padding:"16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:T.blue,textTransform:"uppercase",letterSpacing:"0.06em",margin:"0 0 3px" }}>{a.label}</p>
            <p style={{ fontSize:15,fontWeight:600,margin:"0 0 3px" }}>{a.street}</p>
            <p style={{ fontSize:13,color:T.gray4,margin:0 }}>{a.city}{a.postcode ? `, ${a.postcode}` : ""}{a.country ? ` · ${a.country}` : ""}</p>
          </div>
          <button onClick={()=>deleteAddress(a.id)} style={{ background:"none",border:"none",cursor:"pointer",padding:4 }}>
            <Icon name="close" size={16} color={T.gray5}/>
          </button>
        </div>
      ))}
      {adding ? (
        <div style={{ background:T.white,borderRadius:20,padding:"18px",boxShadow:shadow.xs }}>
          <p style={{ fontSize:16,fontWeight:700,marginBottom:14 }}>{t.addAddress}</p>
          <div style={{ marginBottom:10 }}>
            <p style={{ fontSize:11,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase",margin:"0 0 5px" }}>Label</p>
            <div style={{ display:"flex",gap:8,marginBottom:2 }}>
              {["Home","Work","Other"].map(l=>(
                <button key={l} onClick={()=>set("label",l)} style={{ padding:"7px 14px",borderRadius:99,border:`1.5px solid ${form.label===l?T.black:T.gray8}`,background:form.label===l?T.black:T.white,color:form.label===l?T.white:T.black,fontSize:13,fontWeight:600,cursor:"pointer" }}>{l}</button>
              ))}
            </div>
          </div>
          {inp(t.street,   "street",   "123 Main St")}
          {inp(t.city,     "city",     "Dar es Salaam")}
          {inp(t.postcode, "postcode", "Optional")}
          {inp(t.country,  "country",  "Tanzania")}
          <div style={{ display:"flex",gap:10,marginTop:4 }}>
            <Btn full onClick={saveAddress} disabled={saving} style={{ borderRadius:12,padding:"13px" }}>{saving?<Spin size={16}/>:"Save"}</Btn>
            <Btn full variant="gray" onClick={()=>setAdding(false)} style={{ borderRadius:12,padding:"13px" }}>{t.cancel}</Btn>
          </div>
        </div>
      ) : (
        addresses.length > 0 && (
          <button onClick={()=>setAdding(true)} style={{ display:"flex",alignItems:"center",gap:10,background:T.fill4,borderRadius:16,padding:"16px",width:"100%",border:"none",cursor:"pointer",marginTop:4 }}>
            <Icon name="plus" size={20} color={T.blue}/>
            <span style={{ fontSize:15,fontWeight:600,color:T.blue }}>{t.addAddress}</span>
          </button>
        )
      )}
    </div>
  );
}

/* ─── Notifications Screen ──────────────────────────────────── */
function NotificationsScreen({ t, user, inbox = [], setInbox }) {
  const [prefs,  setPrefs]  = useState({ push:true, email:true, orders:true, promos:false, newArrivals:true });
  const [saving, setSaving] = useState(false);
  const [tab,    setTab]    = useState('inbox'); // 'inbox' | 'settings'

  const unread = inboxUnreadCount(inbox);

  // Mark all read when inbox tab opens
  useEffect(() => {
    if (tab === 'inbox' && unread > 0) {
      setInbox(inboxMarkAllRead());
    }
  }, [tab]);

  // Load saved prefs
  useEffect(() => {
    if (!user?.id) return;
    sb.from('user_notification_prefs').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { if (data) setPrefs({ push:data.push??true, email:data.email??true, orders:data.orders??true, promos:data.promos??false, newArrivals:data.new_arrivals??true }); });
  }, [user?.id]);

  const toggle = async k => {
    const next = { ...prefs, [k]:!prefs[k] };
    setPrefs(next);
    if (!user?.id) return;
    setSaving(true);
    await sb.from('user_notification_prefs').upsert({
      user_id:user.id, push:next.push, email:next.email, orders:next.orders, promos:next.promos, new_arrivals:next.newArrivals
    }, { onConflict:'user_id' });
    setSaving(false);
  };

  const NToggle = ({ on, onChange }) => (
    <div onClick={onChange} style={{ width:48,height:28,borderRadius:14,background:on?"#34C759":"#E5E5EA",cursor:"pointer",position:"relative",transition:"background .18s",flexShrink:0 }}>
      <div style={{ position:"absolute",top:2,left:on?22:2,width:24,height:24,borderRadius:12,background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,.2)",transition:"left .18s" }}/>
    </div>
  );
  const Row = ({ label, sub, k }) => (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px" }}>
      <div>
        <p style={{ fontSize:15,fontWeight:500,margin:0 }}>{label}</p>
        {sub && <p style={{ fontSize:12,color:T.gray4,margin:"2px 0 0" }}>{sub}</p>}
      </div>
      <NToggle on={prefs[k]} onChange={()=>toggle(k)}/>
    </div>
  );

  // Tag → icon emoji
  const tagIcon = tag => {
    if (!tag) return '🔔';
    if (tag.includes('welcome'))  return '👋';
    if (tag.includes('cart'))     return '🛍️';
    if (tag.includes('arrival'))  return '✨';
    if (tag.includes('sale'))     return '🏷️';
    return '🔔';
  };

  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      {/* Tab switcher */}
      <div style={{ display:"flex", background:T.fill4, borderRadius:14, padding:3, marginBottom:20, gap:2 }}>
        {[{id:'inbox',label:'Inbox'},{id:'settings',label:'Settings'}].map(tb => (
          <button key={tb.id} onClick={()=>setTab(tb.id)} style={{ flex:1, padding:"9px 0", borderRadius:11, border:"none", background:tab===tb.id?"#fff":"transparent", fontWeight:tab===tb.id?600:400, fontSize:14, color:tab===tb.id?T.black:T.gray4, cursor:"pointer", boxShadow:tab===tb.id?"0 1px 4px rgba(0,0,0,.1)":"none", transition:"all .15s", position:"relative" }}>
            {tb.label}
            {tb.id==='inbox' && unread > 0 && (
              <span style={{ position:"absolute", top:6, right:"calc(50% - 22px)", width:16, height:16, borderRadius:8, background:"#FF3B30", color:"#fff", fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── INBOX TAB ── */}
      {tab === 'inbox' && (
        <div>
          {inbox.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 24px", color:T.gray4 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔔</div>
              <p style={{ fontSize:15, fontWeight:600, color:T.black, margin:"0 0 6px" }}>No notifications yet</p>
              <p style={{ fontSize:13, margin:0 }}>Alerts from the store will appear here, even if you missed the popup.</p>
            </div>
          ) : (
            <>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <p style={{ fontSize:13, color:T.gray4, margin:0 }}>{inbox.length} notification{inbox.length!==1?"s":""}</p>
                <button onClick={()=>setInbox(inboxClear())} style={{ fontSize:12, color:"#FF3B30", background:"none", border:"none", cursor:"pointer", fontWeight:500, padding:"4px 8px" }}>Clear all</button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {inbox.map(n => (
                  <div key={n.id} style={{ background: n.read ? T.fill4 : "#fff", borderRadius:16, padding:"14px 16px", boxShadow: n.read ? "none" : "0 2px 12px rgba(0,0,0,.08)", border:`1.5px solid ${n.read ? T.gray8 : T.gray8}`, position:"relative", display:"flex", gap:14, alignItems:"flex-start" }}>
                    {/* Unread dot */}
                    {!n.read && <div style={{ position:"absolute", top:14, right:14, width:8, height:8, borderRadius:4, background:"#007AFF" }}/>}
                    {/* Icon */}
                    <div style={{ fontSize:26, flexShrink:0, marginTop:2 }}>{tagIcon(n.tag)}</div>
                    {/* Content */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:600, margin:"0 0 3px", color:T.black, paddingRight:16 }}>{n.title}</p>
                      <p style={{ fontSize:13, color:T.gray4, margin:"0 0 6px", lineHeight:1.4 }}>{n.body}</p>
                      <p style={{ fontSize:11, color:T.gray5, margin:0 }}>{timeAgo(n.ts)}</p>
                    </div>
                    {/* Delete */}
                    <button onClick={()=>setInbox(inboxDelete(n.id))} style={{ position:"absolute", bottom:10, right:12, fontSize:11, color:T.gray5, background:"none", border:"none", cursor:"pointer", padding:"2px 6px" }}>✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && (
        <div>
          {saving && <p style={{ fontSize:12,color:T.gray4,textAlign:"right",marginBottom:8 }}>Saving…</p>}
          <div style={{ background:T.fill4,borderRadius:20,overflow:"hidden",marginBottom:16 }}>
            <p style={{ fontSize:13,color:T.gray4,padding:"14px 18px 6px",textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600 }}>Channels</p>
            <Row label={t.pushNotifications}  k="push"/>
            <div style={{ height:1,background:T.gray8,margin:"0 18px" }}/>
            <Row label={t.emailNotifications} k="email"/>
          </div>
          <div style={{ background:T.fill4,borderRadius:20,overflow:"hidden" }}>
            <p style={{ fontSize:13,color:T.gray4,padding:"14px 18px 6px",textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600 }}>Topics</p>
            <Row label={t.orderUpdates}    sub="Status changes for your orders" k="orders"/>
            <div style={{ height:1,background:T.gray8,margin:"0 18px" }}/>
            <Row label={t.promotions}      sub="Sales and special offers"       k="promos"/>
            <div style={{ height:1,background:T.gray8,margin:"0 18px" }}/>
            <Row label={t.newArrivalsAlert} sub="New collection drops"           k="newArrivals"/>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Settings Screen ───────────────────────────────────────── */
function SettingsScreen({ t, lang, setLang }) {
  const Row = ({ label, children }) => (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px" }}>
      <p style={{ fontSize:15,fontWeight:500,margin:0 }}>{label}</p>
      {children}
    </div>
  );
  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      <div style={{ background:T.fill4,borderRadius:20,overflow:"hidden",marginBottom:16 }}>
        <Row label={t.language}>
          <div style={{ display:"flex",gap:8 }}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>setLang(l.code)} style={{ padding:"7px 14px",borderRadius:99,border:`1.5px solid ${lang===l.code?T.black:T.gray8}`,background:lang===l.code?T.black:T.white,color:lang===l.code?T.white:T.black,fontSize:13,fontWeight:lang===l.code?700:400,cursor:"pointer",transition:"all .15s" }}>
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>
        </Row>
        <div style={{ height:1,background:T.gray8,margin:"0 18px" }}/>
        <Row label={t.currency}>
          <select style={{ fontSize:14,color:T.blue,background:"transparent",border:"none",outline:"none",cursor:"pointer",fontFamily:"-apple-system,sans-serif" }}>
            <option>USD ($)</option>
            <option>GBP (£)</option>
            <option>EUR (€)</option>
            <option>KES (KSh)</option>
          </select>
        </Row>
      </div>

      <div style={{ background:T.fill4,borderRadius:20,overflow:"hidden",marginBottom:16 }}>
        <Row label={t.privacyPolicy}>
          <Icon name="chevronR" size={16} color={T.gray5}/>
        </Row>
        <div style={{ height:1,background:T.gray8,margin:"0 18px" }}/>
        <Row label={t.termsOfService}>
          <Icon name="chevronR" size={16} color={T.gray5}/>
        </Row>
      </div>

      <p style={{ textAlign:"center",fontSize:12,color:T.gray6,marginTop:8 }}>MSAMBWA · v1.0.0</p>
    </div>
  );
}

/* ─── Privacy Screen ────────────────────────────────────────── */
function PrivacyScreen({ t }) {
  const sections = [
    { title:"What We Collect", body:"We collect information you provide directly, such as your name, email address, phone number, and delivery address when you create an account or make a purchase request. We also collect usage data to improve your experience." },
    { title:"How We Use It", body:"Your information is used to process orders, communicate with you about your purchases, personalise your shopping experience, and send you updates you've opted into. We never sell your personal data to third parties." },
    { title:"Cookies", body:"We use cookies to keep you logged in, remember your preferences, and analyse how our store is used. You can manage cookie preferences in your browser settings." },
    { title:"Your Rights", body:"You have the right to access, correct, or delete your personal data at any time. Contact us at privacy@msambwa.com to make a request. We'll respond within 30 days." },
    { title:"Contact", body:"Questions about privacy? Email us at privacy@msambwa.com or write to: MSAMBWA, Privacy Team, Nairobi, Kenya." },
  ];
  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      <p style={{ fontSize:13,color:T.gray4,marginBottom:20,lineHeight:1.6 }}>Last updated: March 2026</p>
      {sections.map(s => (
        <div key={s.title} style={{ marginBottom:20 }}>
          <p style={{ fontSize:16,fontWeight:700,marginBottom:8,letterSpacing:"-0.3px" }}>{s.title}</p>
          <p style={{ fontSize:14,color:T.gray3,lineHeight:1.75,margin:0 }}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Our Story Screen ──────────────────────────────────────── */
function OurStoryScreen({ t }) {
  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      <div style={{ background:"linear-gradient(145deg,#1C1C1E,#3A3A3C)",borderRadius:24,padding:"36px 24px",marginBottom:28,textAlign:"center" }}>
        <div style={{ width:52,height:52,borderRadius:16,background:T.fill3,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 0 16px" }}><Icon name="share" size={24} color={T.gray3}/></div>
        <h2 style={{ fontSize:28,fontWeight:800,color:"#fff",letterSpacing:"-0.8px",margin:"0 0 10px" }}>{t.ourStoryTitle}</h2>
        <p style={{ fontSize:14,color:"rgba(255,255,255,0.5)",margin:0 }}>Since 2024</p>
      </div>
      {t.ourStoryBody.split("\n\n").map((para,i) => (
        <p key={i} style={{ fontSize:15,color:T.gray3,lineHeight:1.8,marginBottom:20 }}>{para}</p>
      ))}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:8,marginBottom:20 }}>
        {[["location","Ethical Sourcing"],["settings","Expert Craft"],["gift","Sustainable Future"]].map(([icon,label])=>(
          <div key={label} style={{ background:T.fill4,borderRadius:16,padding:"18px 12px",textAlign:"center" }}>
            <div style={{ width:40,height:40,borderRadius:12,background:T.fill3,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px" }}><Icon name={icon} size={20} color={T.blue}/></div>
            <p style={{ fontSize:12,fontWeight:600,color:T.gray3,margin:0,lineHeight:1.4 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Returns Screen ────────────────────────────────────────── */
function ReturnsScreen({ t }) {
  const steps = [
    { icon:"chat",     title:"Contact Us",    body:"Email hello@msambwa.com with your order number and reason for return." },
    { icon:"box",      title:"Pack It Up",    body:"Place items in original packaging, unworn and with tags attached." },
    { icon:"truck",    title:"Ship It Back",  body:"We'll email you a prepaid return label within 24 hours." },
    { icon:"card",     title:"Get Refunded",  body:"Refunds processed within 3–5 business days of receiving your return." },
  ];
  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      <div style={{ background:"#e8f4fd",borderRadius:20,padding:"20px",marginBottom:24,display:"flex",gap:14,alignItems:"flex-start" }}>
        <div style={{ width:38,height:38,borderRadius:10,background:T.fill3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name="info" size={18} color={T.gray4}/></div>
        <div>
          <p style={{ fontSize:15,fontWeight:700,margin:"0 0 4px",color:T.blue }}>3–5 Day Returns</p>
          <p style={{ fontSize:13,color:T.gray3,margin:0,lineHeight:1.6 }}>Items must be unworn, unwashed, and in original packaging with tags attached.</p>
        </div>
      </div>
      <p style={{ fontSize:18,fontWeight:700,marginBottom:16,letterSpacing:"-0.4px" }}>How it works</p>
      {steps.map((s,i) => (
        <div key={i} style={{ display:"flex",gap:16,marginBottom:20 }}>
          <div style={{ width:44,height:44,borderRadius:22,background:T.fill4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name={s.icon} size={20} color={T.blue}/></div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:15,fontWeight:700,margin:"0 0 4px" }}>{s.title}</p>
            <p style={{ fontSize:14,color:T.gray4,margin:0,lineHeight:1.6 }}>{s.body}</p>
          </div>
        </div>
      ))}
      <div style={{ background:T.fill4,borderRadius:16,padding:"16px",marginTop:8 }}>
        <p style={{ fontSize:14,fontWeight:600,margin:"0 0 4px" }}>Need help?</p>
        <p style={{ fontSize:13,color:T.gray4,margin:0 }}>hello@msambwa.com</p>
      </div>
    </div>
  );
}

/* ─── Sustainability Screen ─────────────────────────────────── */
function SustainabilityScreen({ t }) {
  const pillars = [
    { icon:"gift",     title:"Recyclable Packaging",  body:"100% of our packaging is made from recycled or recyclable materials. We've eliminated single-use plastics entirely." },
    { icon:"truck",    title:"Carbon Offset",          body:"We offset 100% of our shipping emissions through verified reforestation projects in East Africa." },
    { icon:"person",   title:"Ethical Manufacturing",  body:"All manufacturing partners are audited annually for fair wages, safe conditions, and environmental compliance." },
    { icon:"bag",      title:"Designed to Last",        body:"We design pieces with longevity in mind — the most sustainable garment is one you wear for years, not seasons." },
  ];
  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      <div style={{ background:"linear-gradient(145deg,#1a4a2e,#2d7a47)",borderRadius:24,padding:"32px 24px",marginBottom:28,textAlign:"center" }}>
        <div style={{ width:52,height:52,borderRadius:16,background:T.fill3,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 0 12px" }}><Icon name="truck" size={24} color={T.gray3}/></div>
        <h2 style={{ fontSize:26,fontWeight:800,color:"#fff",letterSpacing:"-0.6px",margin:"0 0 8px" }}>{t.sustainabilityTitle}</h2>
        <p style={{ fontSize:14,color:"rgba(255,255,255,0.6)",margin:0 }}>Fashion that respects the planet</p>
      </div>
      {pillars.map((p,i) => (
        <div key={i} style={{ background:T.fill4,borderRadius:18,padding:"18px",marginBottom:12,display:"flex",gap:14 }}>
          <div style={{ width:48,height:48,borderRadius:14,background:"rgba(52,199,89,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name={p.icon} size={22} color="#34C759"/></div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:15,fontWeight:700,margin:"0 0 5px" }}>{p.title}</p>
            <p style={{ fontSize:13,color:T.gray3,margin:0,lineHeight:1.65 }}>{p.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Lookbook Screen ───────────────────────────────────────── */
function LookbookScreen({ products, onSelect, t }) {
  // Use products that have images; first 8 for the hero mosaic, next 6 for "shop the look"
  const withImg = products.filter(p => p.image_url || p.image_urls?.length);
  const heroProds  = withImg.slice(0, 4);   // up to 4 for editorial mosaic
  const shopProds  = withImg.slice(0, 6);   // up to 6 for shop grid

  const getImg = (p, w=600) => imgUrl(p.image_url || p.image_urls?.[0] || null, {width:w, quality:78});

  return (
    <div style={{ animation:"fadeIn .18s ease" }}>
      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <p style={{ fontSize:13,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:T.gray4,marginBottom:6 }}>{t.lookbookSeason}</p>
        <h2 style={{ fontSize:28,fontWeight:800,letterSpacing:"-0.8px",marginBottom:4 }}>{t.lookbookTitle}</h2>
        <p style={{ fontSize:14,color:T.gray4 }}>Explore the season's most refined pieces</p>
      </div>

      {/* Editorial mosaic — product images */}
      {heroProds.length >= 2 ? (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:24, gridTemplateRows:"auto auto" }}>
          {/* Large left tile spans 2 rows */}
          <div
            onClick={()=>onSelect(heroProds[0])}
            className="pressable"
            style={{ gridColumn:"1", gridRow:"1 / 3", borderRadius:20, overflow:"hidden", cursor:"pointer",
                     background:T.fill3, aspectRatio:"2/3", position:"relative" }}>
            <img src={getImg(heroProds[0], 900)} alt={heroProds[0].name}
                 loading="lazy" decoding="async"
                 style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
            <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"28px 12px 12px",
                          background:"linear-gradient(transparent,rgba(0,0,0,0.55))" }}>
              <p style={{ fontSize:12,fontWeight:700,color:"#fff",margin:0,
                          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{heroProds[0].name}</p>
            </div>
          </div>
          {/* Right column — up to 3 smaller tiles */}
          {heroProds.slice(1).map((p,i) => (
            <div key={p.id}
              onClick={()=>onSelect(p)}
              className="pressable"
              style={{ gridColumn:"2", borderRadius:18, overflow:"hidden", cursor:"pointer",
                       background:T.fill3, aspectRatio:"3/4", position:"relative" }}>
              <img src={getImg(p, 400)} alt={p.name}
                   loading="lazy" decoding="async"
                   style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
              <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"18px 10px 8px",
                            background:"linear-gradient(transparent,rgba(0,0,0,0.5))" }}>
                <p style={{ fontSize:11,fontWeight:700,color:"#fff",margin:0,
                            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : heroProds.length === 1 ? (
        /* single product fallback */
        <div onClick={()=>onSelect(heroProds[0])} className="pressable"
          style={{ borderRadius:20,overflow:"hidden",marginBottom:24,aspectRatio:"4/3",background:T.fill3,cursor:"pointer" }}>
          <img src={getImg(heroProds[0], 900)} alt={heroProds[0].name}
               style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
        </div>
      ) : (
        /* no products yet placeholder */
        <div style={{ borderRadius:20,background:T.fill4,height:220,display:"flex",alignItems:"center",
                      justifyContent:"center",marginBottom:24 }}>
          <p style={{ fontSize:14,color:T.gray5 }}>{t.noProducts}</p>
        </div>
      )}

      {/* Shop the Look grid */}
      {shopProds.length > 0 && (
        <>
          <p style={{ fontSize:18,fontWeight:700,marginBottom:16,letterSpacing:"-0.4px" }}>Shop the Look</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 10px" }}>
            {shopProds.map(p=>(
              <div key={p.id} onClick={()=>onSelect(p)} className="pressable" style={{ cursor:"pointer" }}>
                <div style={{ aspectRatio:"3/4",background:T.fill3,borderRadius:18,overflow:"hidden",marginBottom:8 }}>
                  {getImg(p)
                    ? <img src={getImg(p, 300)} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                    : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="bag" size={30} color={T.gray6}/></div>}
                </div>
                <p style={{ fontSize:13,fontWeight:600,margin:"0 0 3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</p>
                <PriceLine price={p.price} was={p.was}/>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}



/* ─── My Orders Screen ──────────────────────────────────────── */
const ORDER_STATUS = {
  pending:   { color:"#FF9500", label:"Pending",   icon:"bell",     canCancel:true  },
  confirmed: { color:"#007AFF", label:"Confirmed", icon:"check",    canCancel:true  },
  shipped:   { color:"#30B0C7", label:"Shipped",   icon:"truck",    canCancel:false },
  delivered: { color:"#34C759", label:"Delivered", icon:"box",      canCancel:false },
  cancelled: { color:"#FF3B30", label:"Cancelled", icon:"close",    canCancel:false },
};

function MyOrdersScreen({ sessionId }) {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [sel,      setSel]      = useState(null);       // selected order for detail
  const [confirm,  setConfirm]  = useState(null);       // { id, action:'cancel'|'delete' }
  const [busy,     setBusy]     = useState(false);
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    if (!sessionId) return;
    setLoading(true);
    const { data, error } = await sb
      .from('purchase_requests')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [sessionId]);

  const cancelOrder = async (id) => {
    setBusy(true);
    const { error } = await sb
      .from('purchase_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .eq('session_id', sessionId); // safety: only own orders
    if (error) { showToast("Failed to cancel. Try again.", "error"); }
    else {
      showToast("Order cancelled");
      setOrders(os => os.map(o => o.id===id ? {...o, status:'cancelled'} : o));
      if (sel?.id === id) setSel(o => ({...o, status:'cancelled'}));
    }
    setBusy(false);
    setConfirm(null);
  };

  const deleteOrder = async (id) => {
    setBusy(true);
    const { error } = await sb
      .from('purchase_requests')
      .delete()
      .eq('id', id)
      .eq('session_id', sessionId); // safety: only own orders
    if (error) { showToast("Failed to delete. Try again.", "error"); }
    else {
      showToast("Order removed");
      setOrders(os => os.filter(o => o.id !== id));
      setSel(null);
    }
    setBusy(false);
    setConfirm(null);
  };

  const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"40vh" }}>
      <Spin size={32}/>
    </div>
  );

  if (orders.length === 0) return (
    <EmptyState
      icon="box"
      title="No orders yet"
      body="Your purchase requests will appear here after you submit them."
    />
  );

  return (
    <div style={{ animation:"fadeIn 0.18s ease" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:toast.type==="error"?"#FF3B30":"rgba(28,28,30,0.92)",color:"#fff",padding:"12px 20px",borderRadius:99,fontSize:14,fontWeight:500,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",animation:"slideUp .2s ease" }}>
          {toast.msg}
        </div>
      )}

      <p style={{ fontSize:14,color:T.gray4,marginBottom:20 }}>{orders.length} order{orders.length!==1?"s":""}</p>

      <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
        {orders.map(order => {
          const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
          return (
            <div
              key={order.id}
              onClick={() => setSel(order)}
              className="pressable"
              style={{ background:T.fill4,borderRadius:18,padding:"16px",cursor:"pointer",border:`1px solid ${T.gray8}` }}
            >
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:15,fontWeight:700,margin:"0 0 3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{order.product_name}</p>
                  <p style={{ fontSize:12,color:T.gray4,margin:0 }}>{fmtDate(order.created_at)}{order.order_ref ? <span style={{ marginLeft:8,background:T.fill3,borderRadius:6,padding:"1px 7px",fontSize:11,color:T.gray4 }}>{order.order_ref}</span> : null}</p>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:`${st.color}18`,marginLeft:10,flexShrink:0 }}>
                  <Icon name={st.icon} size={12} color={st.color}/>
                  <span style={{ fontSize:12,fontWeight:600,color:st.color }}>{st.label}</span>
                </div>
              </div>

              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div style={{ display:"flex",gap:12 }}>
                  {order.selected_size && <span style={{ fontSize:13,color:T.gray3 }}>Size: <strong>{order.selected_size}</strong></span>}
                  <span style={{ fontSize:13,color:T.gray3 }}>Qty: <strong>{order.quantity}</strong></span>
                </div>
                <span style={{ fontSize:16,fontWeight:700,color:T.black }}>{$p(Number(order.product_price) * Number(order.quantity||1))}</span>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  {["pending","confirmed","shipped","delivered"].map((s,i) => {
                    const steps = ["pending","confirmed","shipped","delivered"];
                    const curIdx = steps.indexOf(order.status);
                    const active = i <= curIdx && order.status !== "cancelled";
                    return (
                      <div key={s} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                        <div style={{ width:"100%",height:3,borderRadius:99,background:active?T.blue:T.gray8,transition:"background .3s" }}/>
                        <span style={{ fontSize:9,color:active?T.blue:T.gray5,fontWeight:active?600:400,textTransform:"capitalize" }}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Detail Sheet */}
      {sel && (
        <div style={{ position:"fixed",inset:0,zIndex:700,display:"flex",alignItems:"flex-end" }}>
          <div onClick={()=>setSel(null)} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)" }}/>
          <div style={{ position:"relative",zIndex:1,width:"100%",maxWidth:480,margin:"0 auto",background:T.white,borderRadius:"24px 24px 0 0",maxHeight:"88dvh",overflowY:"auto",animation:"slideUp .3s cubic-bezier(.32,0,.28,1)",paddingBottom:"env(safe-area-inset-bottom,24px)" }}>
            <div style={{ width:36,height:5,borderRadius:3,background:T.gray7,margin:"14px auto 0" }}/>

            <div style={{ padding:"18px 20px 32px" }}>
              {/* Header */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                <h3 style={{ fontSize:20,fontWeight:700,margin:0,letterSpacing:"-0.4px" }}>Order Details</h3>
                <button onClick={()=>setSel(null)} style={{ width:32,height:32,borderRadius:16,background:T.fill3,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <Icon name="close" size={15} color={T.gray4}/>
                </button>
              </div>

              {/* Status banner */}
              {(() => { const st = ORDER_STATUS[sel.status] || ORDER_STATUS.pending; return (
                <div style={{ background:`${st.color}12`,borderRadius:14,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:40,height:40,borderRadius:12,background:`${st.color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name={st.icon} size={20} color={st.color}/></div>
                  <div>
                    <p style={{ fontSize:16,fontWeight:700,color:st.color,margin:"0 0 2px" }}>{st.label}</p>
                    <p style={{ fontSize:13,color:T.gray4,margin:0 }}>
                      {sel.status==="pending" && "Waiting for seller to confirm your request"}
                      {sel.status==="confirmed" && "Your order has been confirmed by the seller"}
                      {sel.status==="shipped" && "Your order is on its way!"}
                      {sel.status==="delivered" && "Your order has been delivered"}
                      {sel.status==="cancelled" && "This order has been cancelled"}
                    </p>
                  </div>
                </div>
              ); })()}

              {/* Product */}
              <div style={{ background:T.fill4,borderRadius:14,padding:"14px 16px",marginBottom:16 }}>
                <p style={{ fontSize:11,fontWeight:600,color:T.gray4,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10 }}>Product</p>
                <p style={{ fontSize:16,fontWeight:700,margin:"0 0 6px" }}>{sel.product_name}</p>
                <div style={{ display:"flex",gap:16 }}>
                  {sel.selected_size && <p style={{ fontSize:13,color:T.gray3,margin:0 }}>Size: <strong>{sel.selected_size}</strong></p>}
                  <p style={{ fontSize:13,color:T.gray3,margin:0 }}>Qty: <strong>{sel.quantity}</strong></p>
                  <p style={{ fontSize:15,fontWeight:700,margin:0,marginLeft:"auto" }}>{$p(Number(sel.product_price) * Number(sel.quantity||1))}</p>
                </div>
              </div>

              {/* Delivery info */}
              <div style={{ background:T.fill4,borderRadius:14,padding:"14px 16px",marginBottom:16 }}>
                <p style={{ fontSize:11,fontWeight:600,color:T.gray4,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10 }}>Delivery Info</p>
                <p style={{ fontSize:14,fontWeight:600,margin:"0 0 3px" }}>{sel.buyer_name}</p>
                <p style={{ fontSize:13,color:T.gray3,margin:"0 0 3px" }}>{sel.buyer_email}</p>
                {sel.buyer_phone   && <p style={{ fontSize:13,color:T.gray3,margin:"0 0 3px" }}>{sel.buyer_phone}</p>}
                {sel.buyer_address && <p style={{ fontSize:13,color:T.gray3,margin:0 }}>{sel.buyer_address}</p>}
              </div>

              {sel.note && (
                <div style={{ background:T.fill4,borderRadius:14,padding:"14px 16px",marginBottom:16 }}>
                  <p style={{ fontSize:11,fontWeight:600,color:T.gray4,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 }}>Note</p>
                  <p style={{ fontSize:14,color:T.gray3,margin:0,lineHeight:1.6 }}>{sel.note}</p>
                </div>
              )}

              <p style={{ fontSize:12,color:T.gray5,textAlign:"center",marginBottom:20 }}>Ordered on {fmtDate(sel.created_at)}</p>

              {/* Action buttons */}
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {ORDER_STATUS[sel.status]?.canCancel && (
                  <button
                    onClick={() => setConfirm({ id:sel.id, action:"cancel" })}
                    style={{ width:"100%",padding:"14px",borderRadius:14,background:"rgba(255,59,48,0.08)",color:"#FF3B30",border:"1.5px solid rgba(255,59,48,0.2)",fontSize:15,fontWeight:600,cursor:"pointer" }}
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => setConfirm({ id:sel.id, action:"delete" })}
                  style={{ width:"100%",padding:"14px",borderRadius:14,background:T.fill3,color:T.gray3,border:"none",fontSize:15,fontWeight:500,cursor:"pointer" }}
                >
                  Remove from History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirm && (
        <div style={{ position:"fixed",inset:0,zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}>
          <div onClick={()=>setConfirm(null)} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.55)" }}/>
          <div style={{ position:"relative",zIndex:1,background:T.white,borderRadius:22,padding:"28px 24px",width:"100%",maxWidth:340,animation:"scaleIn .22s cubic-bezier(.34,1.56,.64,1)" }}>
            <p style={{ fontSize:20,fontWeight:700,marginBottom:10,letterSpacing:"-0.4px" }}>
              {confirm.action === "cancel" ? "Cancel Order?" : "Remove Order?"}
            </p>
            <p style={{ fontSize:14,color:T.gray4,marginBottom:24,lineHeight:1.6 }}>
              {confirm.action === "cancel"
                ? "Are you sure you want to cancel this order? The seller will be notified."
                : "This will remove the order from your history. It cannot be undone."}
            </p>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setConfirm(null)} style={{ flex:1,padding:"13px",borderRadius:12,background:T.fill3,border:"none",fontSize:15,fontWeight:600,cursor:"pointer",color:T.black }}>
                Keep
              </button>
              <button
                onClick={() => confirm.action==="cancel" ? cancelOrder(confirm.id) : deleteOrder(confirm.id)}
                disabled={busy}
                style={{ flex:1,padding:"13px",borderRadius:12,background:"#FF3B30",border:"none",fontSize:15,fontWeight:600,cursor:"pointer",color:"#fff",opacity:busy?.6:1 }}
              >
                {busy ? "…" : confirm.action==="cancel" ? "Cancel Order" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// logo.png must be in your /public folder for Next.js to serve it at /logo.png
// On GitHub: open logo.png → edit → rename path to: public/logo.png → commit
function Logo({ height=40 }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.6px", color:"#000", fontFamily:"-apple-system,sans-serif", lineHeight:1 }}>
        MSAMBWA
      </span>
    );
  }
  return (
    <img
      src="/logo.png"
      alt="MSAMBWA"
      onError={() => setBroken(true)}
      style={{ height, width:"auto", display:"block", objectFit:"contain", maxWidth:140 }}
    />
  );
}


/* ─── Pull to Refresh ────────────────────────────────────────
   Native-feeling pull indicator. Attaches to window touch events.
   Calls onRefresh() when user pulls down > 72px from top of page.
─────────────────────────────────────────────────────────── */
function PullToRefresh({ onRefresh }) {
  const [pull, setPull]       = useState(0);   // px pulled
  const [state, setState]     = useState("idle"); // idle | pulling | releasing | done
  const startY                = useRef(null);
  const THRESHOLD             = 72;

  useEffect(() => {
    const onStart = (e) => {
      // Only start tracking if page is scrolled to top
      if (window.scrollY > 4) return;
      startY.current = e.touches[0].clientY;
      setState("pulling");
    };
    const onMove = (e) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) { startY.current = null; setPull(0); setState("idle"); return; }
      // Dampen pull past threshold
      const clamped = dy < THRESHOLD ? dy : THRESHOLD + (dy - THRESHOLD) * 0.25;
      setPull(Math.min(clamped, THRESHOLD + 30));
    };
    const onEnd = async () => {
      if (pull >= THRESHOLD) {
        setState("releasing");
        setPull(THRESHOLD);
        await onRefresh();
        setState("done");
        setTimeout(() => { setPull(0); setState("idle"); }, 400);
      } else {
        setPull(0);
        setState("idle");
      }
      startY.current = null;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove",  onMove,  { passive: true });
    window.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove",  onMove);
      window.removeEventListener("touchend",   onEnd);
    };
  }, [pull, onRefresh]);

  if (pull <= 0 && state === "idle") return null;

  const progress = Math.min(pull / THRESHOLD, 1);
  const spinning = state === "releasing" || state === "done";

  return (
    <div style={{
      position: "fixed", top: 64, left: 0, right: 0, zIndex: 190,
      display: "flex", justifyContent: "center",
      transform: `translateY(${Math.min(pull, THRESHOLD + 30) - THRESHOLD}px)`,
      transition: spinning ? "transform .3s cubic-bezier(.32,0,.28,1)" : "none",
      pointerEvents: "none",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 18,
        background: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {spinning ? (
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation: "spin .7s linear infinite" }}>
            <circle cx="9" cy="9" r="7" fill="none" stroke={T.gray7} strokeWidth="2"/>
            <path d="M9 2 A7 7 0 0 1 16 9" fill="none" stroke={T.blue} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18"
            style={{ transform: `rotate(${progress * 180}deg)`, transition: "transform .1s" }}>
            <path d="M9 3 L9 15 M4 10 L9 15 L14 10" fill="none" stroke={progress >= 1 ? T.blue : T.gray5}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </div>
  );
}

/* ─── Header ────────────────────────────────────────────────── */
function Header({ screen, cartCount, onCart, onNavigate, canGoBack, onBack }) {
  const { t, lang, setLang } = useLang();
  const [showLang, setShowLang] = useState(false);
  const titles = {
    shop:t.shop, search:t.search, wishlist:t.wishlist, account:t.account,
    orders:t.myOrders, "edit-profile":t.editProfile, addresses:t.addresses,
    notifications:t.notifications, settings:t.settings, privacy:t.privacy,
    "our-story":t.ourStory, returns:t.returns, sustainability:t.sustainability,
    lookbook:t.lookbook,
  };
  const title = titles[screen] || "";
  return (
    <header style={{ background:"rgba(255,255,255,0.94)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderBottom:"1px solid rgba(0,0,0,0.07)",position:"sticky",top:0,zIndex:200,userSelect:"none" }}>
      <div style={{ height:64,display:"flex",alignItems:"center",padding:"0 8px",position:"relative" }}>
        <div style={{ display:"flex",alignItems:"center",minWidth:100,flexShrink:0 }}>
          {canGoBack ? (
            <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",color:T.blue,padding:"8px 8px" }}>
              <Icon name="back" size={20} color={T.blue} strokeWidth={2}/>
            </button>
          ) : (
            <button onClick={()=>{ onNavigate("home"); if(typeof window!=="undefined") window.dispatchEvent(new Event("msambwa:reload")); }} style={{ background:"none",border:"none",cursor:"pointer",padding:"8px 10px" }}>
              <Logo height={36}/>
            </button>
          )}
        </div>
        <div style={{ position:"absolute",left:"50%",transform:"translateX(-50%)",pointerEvents:"none" }}>
          {canGoBack&&title&&<span style={{ fontSize:17,fontWeight:600,letterSpacing:"-0.3px",color:"#000",whiteSpace:"nowrap" }}>{title}</span>}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:0,marginLeft:"auto",flexShrink:0,position:"relative" }}>
          {screen!=="search"&&(
            <button onClick={()=>onNavigate("search")} style={{ background:"none",border:"none",cursor:"pointer",padding:"8px 10px" }}>
              <Icon name="search" size={22} color={T.black}/>
            </button>
          )}
          {/* Globe language picker */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>setShowLang(v=>!v)} style={{ background:"none",border:"none",cursor:"pointer",padding:"8px 8px",display:"flex",alignItems:"center",gap:3 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.black} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span style={{ fontSize:11,fontWeight:600,color:T.black }}>{lang.toUpperCase()}</span>
            </button>
            {showLang&&(
              <>
                <div onClick={()=>setShowLang(false)} style={{ position:"fixed",inset:0,zIndex:299 }}/>
                <div style={{ position:"absolute",top:"calc(100% + 6px)",right:0,background:T.white,borderRadius:14,boxShadow:shadow.xl,border:`1px solid ${T.gray8}`,zIndex:300,overflow:"hidden",minWidth:140 }}>
                  {LANGS.map(l=>(
                    <button key={l.code} onClick={()=>{ setLang(l.code); setShowLang(false); }}
                      style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"12px 16px",background:lang===l.code?T.fill3:T.white,border:"none",cursor:"pointer",fontSize:14,fontWeight:lang===l.code?700:400,color:T.black,textAlign:"left" }}>
                      
                      <span>{l.label}</span>
                      {lang===l.code&&<span style={{ marginLeft:"auto",fontSize:12,color:T.blue }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={onCart} style={{ position:"relative",background:"none",border:"none",cursor:"pointer",padding:"8px 10px" }}>
            <Icon name="bag" size={22} color={T.black}/>
            {cartCount>0&&<span style={{ position:"absolute",top:4,right:4,minWidth:18,height:18,borderRadius:9,background:T.black,color:T.white,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px" }}>{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─── Bottom Nav ────────────────────────────────────────────── */
function BottomNav({ screen, onNavigate }) {
  const { t } = useLang();
  const tabs = [
    { id:"home",     icon:"home",   label:t.home    },
    { id:"shop",     icon:"bag",    label:t.shop    },
    { id:"search",   icon:"search", label:t.search  },
    { id:"wishlist", icon:"heart",  label:t.saved   },
    { id:"account",  icon:"person", label:t.account },
  ];
  return (
    <nav style={{ position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,255,255,0.96)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:`1px solid ${T.gray8}`,display:"flex",justifyContent:"space-around",paddingTop:8,paddingBottom:"max(8px,env(safe-area-inset-bottom))",zIndex:300 }}>
      {tabs.map(tab=>{
        const active = screen===tab.id;
        return (
          <button key={tab.id} onClick={()=>onNavigate(tab.id)} style={{ background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"4px 14px",minWidth:0 }}>
            <Icon name={tab.icon} size={24} color={active?T.black:T.gray5} strokeWidth={active?2.5:1.8}/>
            <span style={{ fontSize:10,fontWeight:active?600:400,color:active?T.black:T.gray5 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─── Sale Modal ────────────────────────────────────────────── */
/* ─── Help Us Improve Feedback Widget ───────────────────────── */
function HelpFeedback({ onClose }) {
  const [step,    setStep]   = useState("form");    // form | sent
  const [rating,  setRating] = useState(0);
  const [hovered, setHov]    = useState(0);
  const [msg,     setMsg]    = useState("");
  const [email,   setEmail]  = useState("");
  const [busy,    setBusy]   = useState(false);
  const [err,     setErr]    = useState("");

  const submit = async () => {
    if (!rating) { setErr("Please select a star rating."); return; }
    setBusy(true); setErr("");
    try {
      const { error } = await sb.from('site_feedback').insert({
        rating, message: msg.trim() || null,
        email: email.trim() || null,
        page: window.location.pathname || '/',
      });
      if (error) throw error;
      setStep("sent");
    } catch(e) {
      setErr(e?.message || "Failed to send. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:950,display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)" }}/>
      <div style={{ position:"relative",zIndex:1,width:"100%",maxWidth:480,background:T.white,borderRadius:"24px 24px 0 0",padding:"24px 24px 40px",animation:"slideUp .3s cubic-bezier(.32,0,.28,1)",paddingBottom:"max(40px,env(safe-area-inset-bottom,40px))" }}>
        <div style={{ width:36,height:5,borderRadius:3,background:T.gray8,margin:"-8px auto 20px" }}/>

        {step === "sent" ? (
          <div style={{ textAlign:"center",paddingBottom:8 }}>
            <div style={{ width:64,height:64,borderRadius:20,background:"#e8faf0",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12 }}><Icon name="check" size={28} color={T.green}/></div>
            <p style={{ fontSize:20,fontWeight:700,margin:"0 0 8px",color:T.black }}>Thank you!</p>
            <p style={{ fontSize:14,color:T.gray4,lineHeight:1.6,marginBottom:24 }}>Your feedback helps us improve MSAMBWA for everyone.</p>
            <button onClick={onClose} style={{ padding:"13px 32px",background:T.blue,color:"#fff",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer" }}>Close</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize:20,fontWeight:700,margin:"0 0 4px",color:T.black }}>Help us improve</p>
            <p style={{ fontSize:14,color:T.gray4,marginBottom:20,lineHeight:1.5 }}>How's your experience with MSAMBWA? We read every message.</p>

            {/* Star rating */}
            <div style={{ display:"flex",gap:6,marginBottom:20 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={()=>setRating(i)} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(0)}
                  style={{ background:"none",border:"none",cursor:"pointer",padding:0,transition:"transform .12s",transform:i<=(hovered||rating)?"scale(1.15)":"scale(1)" }}>
                  <Icon name="star" size={32} color={i<=(hovered||rating)?"#FF9500":T.gray7}/>
                </button>
              ))}
              {rating > 0 && <span style={{ fontSize:13,color:T.gray4,marginLeft:6,alignSelf:"center" }}>
                {["","Poor","Fair","Good","Great","Excellent"][rating]}
              </span>}
            </div>

            {/* Message */}
            <textarea
              value={msg} onChange={e=>setMsg(e.target.value)}
              placeholder="What can we do better? (optional)"
              style={{ width:"100%",resize:"none",minHeight:80,padding:"12px 14px",fontSize:14,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif",marginBottom:12,boxSizing:"border-box" }}
            />

            {/* Email */}
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Your email (optional, if you'd like a reply)"
              style={{ width:"100%",padding:"12px 14px",fontSize:14,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif",marginBottom:16,boxSizing:"border-box" }}
            />

            {err && <p style={{ fontSize:13,color:T.red,margin:"0 0 12px",padding:"10px 14px",background:`${T.red}12`,borderRadius:10 }}>{err}</p>}

            <div style={{ display:"flex",gap:10 }}>
              <button onClick={submit} disabled={busy}
                style={{ flex:1,padding:"14px",background:T.blue,color:"#fff",border:"none",borderRadius:14,fontSize:15,fontWeight:600,cursor:"pointer",opacity:busy?0.7:1 }}>
                {busy ? "Sending…" : "Send Feedback"}
              </button>
              <button onClick={onClose}
                style={{ padding:"14px 20px",background:T.fill3,color:T.gray3,border:"none",borderRadius:14,fontSize:15,cursor:"pointer" }}>
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SaleModal({ onClose, onShop }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.55)" }}/>
      <div style={{ position:"relative",zIndex:1,background:"#fff",borderRadius:28,overflow:"hidden",width:"100%",maxWidth:380,animation:"scaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ position:"relative",height:220 }}>
          <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" alt="Sale" style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>
          <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}/>
          <button onClick={onClose} style={{ position:"absolute",top:14,right:14,width:32,height:32,borderRadius:16,background:"rgba(0,0,0,0.4)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Icon name="close" size={14} color="#fff"/>
          </button>
        </div>
        <div style={{ padding:"24px 24px 28px" }}>
          <h2 style={{ fontSize:28,fontWeight:700,letterSpacing:"-0.8px",marginBottom:8,color:"#000" }}>Up to 40% Off</h2>
          <p style={{ fontSize:15,color:"#636366",lineHeight:1.5,marginBottom:24 }}>Shop the SS26 Sale — select styles while stocks last.</p>
          <button onClick={onShop} style={{ width:"100%",background:T.blue,color:"#fff",border:"none",borderRadius:14,padding:"17px",fontSize:16,fontWeight:600,cursor:"pointer" }}>Shop the Sale →</button>
          <button onClick={onClose} style={{ width:"100%",background:"none",border:"none",padding:"14px",fontSize:14,color:"#8e8e93",cursor:"pointer",marginTop:4 }}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Root App ──────────────────────────────────────────────── */
function PageInner() {
  const [lang, setLang]         = useState(() => typeof localStorage !== "undefined" ? localStorage.getItem("msambwa_lang")||"en" : "en");
  const t                        = TR[lang] || TR.en;

  // Persist language choice
  useEffect(() => { try { localStorage.setItem("msambwa_lang", lang); } catch(_) {} }, [lang]);

  /* Products from Supabase */
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* Persistent session */
  const [sessionId, setSid]     = useState(null);

  /* Logged-in customer */
  const [user, setUser]         = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // Listen for auth changes
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u && !u.is_anonymous) setUser(u);
    });
    const { data:{ subscription } } = sb.auth.onAuthStateChange((_, s) => {
      const u = s?.user;
      setUser(u && !u.is_anonymous ? u : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await sb.auth.signOut();
    setUser(null);
  };

  /* Navigation */
  const [current,  setCurrent]  = useState({ screen:"home" });
  const [history,  setHistory]  = useState([]);

  /* Cart — stored in localStorage keyed by sessionId */
  const [cart,     setCart]     = useState([]);
  const [inbox,    setInbox]    = useState(() => inboxGet());

  /* Wishlist — stored in Supabase wishlists table */
  const [wishlist, setWishlist] = useState([]);

  const [cartOpen,    setCartOpen]    = useState(false);
  const [showSale,    setShowSale]    = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [showFeedback,setShowFeedback]= useState(false);

  /* ── Bootstrap session ── */
  useEffect(() => {
    getOrCreateSession().then(async sid => {
      setSid(sid);

      // Best-effort: upsert session into Supabase (only works if anonymous_sessions table exists)
      try {
        await sb.from('anonymous_sessions').upsert(
          { id: sid, last_seen: new Date().toISOString() },
          { onConflict: 'id', ignoreDuplicates: false }
        );
      } catch(_) { /* table may not exist yet — safe to ignore */ }

      // Best-effort: restore cart from Supabase (cross-device)
      try {
        const { data } = await sb.from('anonymous_sessions').select('cart').eq('id', sid).single();
        if (data?.cart?.length) {
          setCart(data.cart);
          return;
        }
      } catch(_) { /* ignore */ }

      // Fallback: restore cart from localStorage (skip if older than 30 days)
      try {
        const saved = localStorage.getItem(`cart_${sid}`);
        const ts    = localStorage.getItem(`cart_${sid}_ts`);
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        if (saved && ts && Date.now() - Number(ts) < THIRTY_DAYS) setCart(JSON.parse(saved));
        else if (ts && Date.now() - Number(ts) >= THIRTY_DAYS) {
          localStorage.removeItem(`cart_${sid}`);
          localStorage.removeItem(`cart_${sid}_ts`);
        }
      } catch(_) {}
    }).catch(() => {
      // Even session creation failed — generate a temporary id so the app works
      const fallbackId = `tmp-${Date.now()}`;
      setSid(fallbackId);
    });
  }, []);

  /* ── Persist cart to localStorage (immediate) + Supabase (debounced 1.2s) ── */
  const cartSyncRef = useRef(null);
  useEffect(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cart));
      localStorage.setItem(`cart_${sessionId}_ts`, String(Date.now()));
    } catch(_) {}
    // Debounce Supabase sync — batch rapid changes (e.g. qty++)
    clearTimeout(cartSyncRef.current);
    cartSyncRef.current = setTimeout(() => {
      try {
        sb.from('anonymous_sessions')
          .update({ cart, last_seen: new Date().toISOString() })
          .eq('id', sessionId)
          .then(() => {});
      } catch(_) {}
    }, 1200);
  }, [cart, sessionId]);

  /* ── Store settings (fetched once, shared) ── */
  const [storeSettings, setStoreSettings] = useState({ delivery_enabled:true, delivery_cost:30000, free_delivery_threshold:500000 });
  useEffect(() => {
    sb.from('store_settings').select('delivery_enabled,delivery_cost,free_delivery_threshold').eq('id',1).maybeSingle()
      .then(({ data }) => { if(data) setStoreSettings({ delivery_enabled: data.delivery_enabled ?? true, delivery_cost: Number(data.delivery_cost ?? 30000), free_delivery_threshold: Number(data.free_delivery_threshold ?? 500000) }); });
  }, []);

  /* ── Load wishlist from Supabase ── */
  useEffect(() => {
    if (!sessionId) return;
    sb.from('wishlists').select('product_id').eq('session_id', sessionId)
      .then(({ data }) => {
        if (data) setWishlist(data.map(r => r.product_id));
      });
  }, [sessionId]);

  /* ── Load products + handle deep-link hash ── */
  const [loadError, setLoadError] = useState(false);
  const loadProducts = () => {
    setLoadError(false);
    setLoading(true);
    sb.from('products')
      .select('id,name,price,was,category,badge,image_url,image_urls,sizes,rating,reviews,description,in_stock,is_active,created_at')
      .eq('is_active', true).order('created_at', { ascending:false })
      .then(({ data, error }) => {
        if (error) { setLoadError(true); setLoading(false); return; }
        const prods = data || [];
        setProducts(prods);
        setLoading(false);
        try {
          // Old format: #product=UUID
          const hashM = window.location.hash.match(/^#product=([a-f0-9-]+)$/i);
          if (hashM) {
            const found = prods.find(pr => pr.id === hashM[1]);
            if (found) {
              window.history.replaceState({}, '', window.location.pathname);
              setCurrent({ screen:'product', product: found });
            }
          }
          // New format: ?p=last6 (set by /p/[slug] OG page redirect)
          const params = new URLSearchParams(window.location.search);
          const shortId = params.get('p');
          if (shortId) {
            const found = prods.find(pr => pr.id.replace(/-/g,'').endsWith(shortId));
            if (found) {
              window.history.replaceState({}, '', window.location.pathname);
              setCurrent({ screen:'product', product: found });
            }
          }
        } catch(_) {}
      });
  };
  useEffect(() => { loadProducts(); }, []);
  useEffect(() => {
    const handler = () => loadProducts();
    window.addEventListener('msambwa:reload', handler);
    return () => window.removeEventListener('msambwa:reload', handler);
  }, []);

  // ── SW → App message listener (inbox) ───────────────────────
  useEffect(() => {
    if (!navigator.serviceWorker) return;
    const handler = event => {
      if (event.data?.type === 'INBOX_ADD') {
        const updated = inboxAdd(event.data.entry);
        setInbox([...updated]);
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  // ── Notification setup on mount ───────────────────────────
  useEffect(() => {
    if (!('Notification' in window) || !navigator.serviceWorker) return;

    // Ask permission after 8 seconds (user has seen the app)
    const permTimer = setTimeout(async () => {
      const granted = await requestNotifPermission();
      if (!granted) return;

      // Welcome — only once ever
      try {
        if (!localStorage.getItem(NOTIF_WELCOME_KEY)) {
          localStorage.setItem(NOTIF_WELCOME_KEY, '1');
          swPost('NOTIF_WELCOME');
        }
      } catch(_) {}

      // New arrivals — start the 3-day timer (once per session)
      try {
        if (!localStorage.getItem(NOTIF_ARRIVAL_KEY)) {
          localStorage.setItem(NOTIF_ARRIVAL_KEY, '1');
        }
        swPost('NOTIF_ARRIVALS_START');
      } catch(_) {}

    }, 8000);

    return () => clearTimeout(permTimer);
  }, []);

  /* ── Show sale modal after 2s — max once per 2 days ── */
  useEffect(() => {
    try {
      const last = localStorage.getItem('msambwa_sale_ts');
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
      if (last && Date.now() - Number(last) < TWO_DAYS_MS) return; // shown within last 2 days, skip
    } catch(_) {}
    const t = setTimeout(() => {
      setShowSale(true);
      try { localStorage.setItem('msambwa_sale_ts', String(Date.now())); } catch(_) {}
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  /* ── Cookie banner — show only once ever ── */
  useEffect(() => {
    if (showSale) return;
    try { if (localStorage.getItem('msambwa_cookies_ok')) return; } catch(_) {}
    const t = setTimeout(() => setShowCookies(true), 800);
    return () => clearTimeout(t);
  }, [showSale]);

  /* ── Navigation ── */
  const navigate = (screen, data={}) => {
    setHistory(h=>[...h,current]);
    setCurrent({ screen, ...data });
    window.scrollTo(0,0);
    // Push a browser history entry so the phone's back gesture works
    window.history.pushState({ screen, ...data }, "");
  };

  const goBack = () => {
    const prev = history[history.length-1];
    if (prev) {
      setHistory(h=>h.slice(0,-1));
      setCurrent(prev);
      window.scrollTo(0,0);
    }
  };

  // Listen to the phone/browser back button (popstate fires when user swipes back)
  useEffect(() => {
    const onPop = () => {
      // Browser already moved back in its own stack — mirror it in app state
      setHistory(h => {
        const prev = h[h.length-1];
        if (prev) { setCurrent(prev); window.scrollTo(0,0); return h.slice(0,-1); }
        return h;
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* ── Cart ── */
  const addToCart = item => {
    setCart(c => {
      const key = x => x.id + '|' + (x.sz||'');
      const ex = c.find(x => key(x) === key(item));
      const next = ex ? c.map(x => key(x)===key(item) ? {...x,qty:x.qty+1} : x) : [...c,{...item,qty:1}];
      // Start cart abandonment timer — fires 1hr later if user doesn't checkout
      if (Notification.permission === 'granted') {
        swPost('NOTIF_CART_START', { count: next.reduce((s,i)=>s+i.qty,0) });
      }
      return next;
    });
  };
  const removeFromCart = item => {
    const key = x => x.id + '|' + (x.sz||'');
    setCart(c => {
      const next = c.filter(x => key(x) !== key(item));
      // Cancel timer if cart is now empty
      if (next.length === 0) swPost('NOTIF_CART_CANCEL');
      return next;
    });
  };
  const updateQty = (item,qty) => {
    const key = x => x.id + '|' + (x.sz||'');
    if (qty <= 0) return removeFromCart(item);
    setCart(c => c.map(x => key(x)===key(item) ? {...x,qty} : x));
  };

  /* ── Wishlist (synced to Supabase) ── */
  const [wishToast, setWishToast] = useState(null);
  const wishToastKey = useRef(0);
  const toggleWishlist = async id => {
    const has = wishlist.includes(id);
    setWishlist(w => has ? w.filter(x=>x!==id) : [...w,id]);
    // Show brief toast
    wishToastKey.current += 1;
    setWishToast(has ? "Removed from saved" : "Saved to wishlist");
    clearTimeout(window.__wishToastTimer);
    window.__wishToastTimer = setTimeout(() => setWishToast(null), 2000);
    if (!sessionId) return;
    if (has) {
      await sb.from('wishlists').delete().eq('session_id', sessionId).eq('product_id', id);
    } else {
      await sb.from('wishlists').upsert({ session_id:sessionId, product_id:id });
    }
  };

  const cartCount  = useMemo(() => cart.reduce((s,i)=>s+i.qty, 0), [cart]);
  const canGoBack  = history.length > 0;
  const onSelect   = useCallback(p=>navigate("product",{product:p}), []);
  const onLoginPrompt = useCallback(()=>setShowAuth(true), []);
  const screenProps = useMemo(() => ({ products, onSelect, onWishlist:toggleWishlist, wishlist, onNavigate:navigate, user, onLoginPrompt }), [products, wishlist, user]);

  const renderScreen = () => {
    if (loading) return <HomeSkeleton/>;
    if (loadError) return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:16,padding:24,textAlign:"center" }}>
        <div style={{ width:64,height:64,borderRadius:20,background:"#fff0f0",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Icon name="info" size={28} color={T.red}/>
        </div>
        <p style={{ fontSize:18,fontWeight:700,margin:0 }}>Connection problem</p>
        <p style={{ fontSize:14,color:T.gray4,margin:0,maxWidth:280,lineHeight:1.6 }}>We couldn't load the store. Please check your internet connection.</p>
        <button onClick={loadProducts} style={{ background:T.blue,color:"#fff",border:"none",borderRadius:14,padding:"13px 28px",fontSize:15,fontWeight:600,cursor:"pointer" }}>Try Again</button>
      </div>
    );
    switch (current.screen) {
      case "home":         return <HomeScreen {...screenProps}/>;
      case "shop":         return <ShopScreen {...screenProps}/>;
      case "search":       return <SearchScreen {...screenProps}/>;
      case "wishlist":     return <WishlistScreen {...screenProps}/>;
      case "account":      return <AccountScreen onNavigate={navigate} user={user} onLogin={()=>setShowAuth(true)} onLogout={handleLogout} onFeedback={()=>setShowFeedback(true)} t={t} inbox={inbox}/>;
      case "orders":       return <MyOrdersScreen sessionId={sessionId}/>;
      case "edit-profile": return <AuthGate user={user} onLogin={()=>setShowAuth(true)} t={t}><EditProfileScreen user={user} onBack={goBack} t={t}/></AuthGate>;
      case "addresses":    return <AuthGate user={user} onLogin={()=>setShowAuth(true)} t={t}><AddressesScreen t={t} user={user}/></AuthGate>;
      case "notifications":return <AuthGate user={user} onLogin={()=>setShowAuth(true)} t={t}><NotificationsScreen t={t} user={user} inbox={inbox} setInbox={setInbox}/></AuthGate>;
      case "settings":     return <SettingsScreen t={t} lang={lang} setLang={setLang}/>;
      case "privacy":      return <PrivacyScreen t={t}/>;
      case "our-story":    return <OurStoryScreen t={t}/>;
      case "returns":      return <ReturnsScreen t={t}/>;
      case "sustainability":return <SustainabilityScreen t={t}/>;
      case "lookbook":     return <LookbookScreen products={products} onSelect={p=>navigate("product",{product:p})} t={t}/>;
      case "product":      return <ProductDetail p={current.product} onBack={goBack} onNavigateProduct={prod=>navigate("product",{product:prod})} onAdd={addToCart} wishlisted={wishlist.includes(current.product?.id)} onWishlist={toggleWishlist} sessionId={sessionId} user={user} onLoginPrompt={()=>setShowAuth(true)} products={products}/>;
      default:             return <HomeScreen {...screenProps}/>;
    }
  };

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      <div style={{ maxWidth:480,margin:"0 auto",minHeight:"100vh",background:T.white,position:"relative" }}>
        <Header screen={current.screen} cartCount={cartCount} onCart={()=>setCartOpen(true)} onNavigate={navigate} canGoBack={canGoBack} onBack={goBack}/>
        <PullToRefresh onRefresh={loadProducts}/>
        <main style={{ padding:"20px 16px 100px" }}>{renderScreen()}</main>
        <BottomNav screen={current.screen} onNavigate={navigate}/>

        {cartOpen&&<CartDrawer cart={cart} onClose={()=>setCartOpen(false)} onRemove={removeFromCart} onQty={updateQty} sessionId={sessionId} user={user} storeSettings={storeSettings}/>}

        {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuth={u=>{ if(u&&!u.is_anonymous) setUser(u); setShowAuth(false); }} t={t}/>}

        {showFeedback&&<HelpFeedback onClose={()=>setShowFeedback(false)}/>}

        {showSale&&!cartOpen&&<SaleModal onClose={()=>setShowSale(false)} onShop={()=>{setShowSale(false);navigate("shop");}}/>}

        {wishToast && (
          <div key={wishToastKey.current} style={{ position:"fixed",bottom:84,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:"rgba(28,28,30,0.97)",color:"#fff",padding:"11px 18px",borderRadius:99,fontSize:13,fontWeight:600,whiteSpace:"nowrap",boxShadow:"0 4px 24px rgba(0,0,0,0.25)",animation:"fadeIn .18s ease",pointerEvents:"none",display:"flex",alignItems:"center",gap:7 }}>
            <Icon name="heart-fill" size={13} color={T.red}/>{wishToast}
          </div>
        )}

        {!showSale&&showCookies&&(
          <div style={{ position:"fixed",bottom:80,left:12,right:12,zIndex:700,background:"rgba(12,28,31,0.98)",borderRadius:20,padding:"18px 20px",animation:"slideUp .36s cubic-bezier(.32,0,.28,1)",maxWidth:560,margin:"0 auto" }}>
            <div style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                <Icon name="settings" size={18} color="rgba(255,255,255,0.7)"/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15,fontWeight:600,color:"#fff",marginBottom:5 }}>We use cookies</p>
                <p style={{ fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.5,marginBottom:16 }}>We use cookies to personalise your experience.</p>
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={()=>{ try{localStorage.setItem('msambwa_cookies_ok','1');}catch(_){} setShowCookies(false); }} style={{ flex:1,background:T.blue,color:"#fff",border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:600,cursor:"pointer" }}>Accept</button>
                  <button onClick={()=>{ try{localStorage.setItem('msambwa_cookies_ok','0');}catch(_){} setShowCookies(false); }} style={{ flex:1,background:"rgba(255,255,255,0.12)",color:"#fff",border:"none",borderRadius:12,padding:"12px",fontSize:14,cursor:"pointer" }}>Decline</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PWAInstallPrompt />
    </LangCtx.Provider>
  );
}

export default function Page() {
  return <ErrorBoundary><PageInner/></ErrorBoundary>;
}
