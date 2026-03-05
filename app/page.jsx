'use client'
import { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import { createClient } from '@supabase/supabase-js';
import './layout.css';

/* ─── Supabase ──────────────────────────────────────────────── */
const SUPABASE_URL  = 'https://crekrdcmagswrfrmkiuj.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWtyZGNtYWdzd3Jmcm1raXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODEyNDYsImV4cCI6MjA4ODI1NzI0Nn0.qoUb9wOHW5DbiJtJcIGhCFtYu5Slx9_Fhb7lK_l11kM';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

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
    .pressable:active { transform:scale(0.97); transition:transform .1s; }
  `;
  document.head.appendChild(el);
}

/* ─── Lang context ──────────────────────────────────────────── */
const TR = {
  en: {
    home:"Home", shop:"Shop", search:"Search", saved:"Saved", account:"Account",
    wishlist:"Wishlist", myBag:"My Bag", checkout:"Checkout →",
    addToBag:"Add to Bag", addedToBag:"Added ✓",
    freeShipping:"Free Shipping", freeReturns:"Free Returns",
    newIn:"New In ✦", trendingNow:"Trending Now 🔥", onSale:"On Sale",
    viewAll:"View All", seeAll:"See All", browse:"Browse",
    noSaved:"Your wishlist is empty", saveItemsYouLove:"Save items you love",
    emptyBag:"Your bag is empty", continueShopping:"Continue Shopping",
    freeShippingQualify:"You qualify for free shipping!",
    addMore:"Add", moreForFreeShipping:"more for free shipping",
    noResults:"No results", tryDifferent:"Try a different search term",
    newArrivals:"New Arrivals", orders:"Orders", myOrders:"My Orders",
    addresses:"Addresses", paymentMethods:"Payment Methods",
    referFriend:"Refer a Friend", notifications:"Notifications",
    settings:"Settings", ourStory:"Our Story", returns:"Returns",
    privacy:"Privacy", lookbook:"Lookbook", sustainability:"Sustainability",
    requestToBuy:"Request to Buy", yourName:"Your Name",
    yourEmail:"Your Email", yourPhone:"Phone (optional)",
    deliveryAddress:"Delivery Address", noteToSeller:"Note (optional)",
    submitRequest:"Submit Request", requestSent:"Request Sent! ✓",
    size:"Size", colour:"Colour", description:"Description",
    loading:"Loading…", language:"Language",
    noProducts:"No products yet",
    noProductsBody:"Our collection is being curated. Check back soon.",
  },
};

const LangCtx = createContext({ lang:"en", setLang:()=>{}, t:TR.en });
const useLang  = () => useContext(LangCtx);

/* ─── Design tokens ─────────────────────────────────────────── */
const T = {
  black:"#000", white:"#fff", gray2:"#2C2C2E", gray3:"#3A3A3C",
  gray4:"#636366", gray5:"#8E8E93", gray6:"#AEAEB2", gray7:"#C7C7CC",
  gray8:"#E5E5EA", gray9:"#F2F2F7", fill3:"#EFEFF4", fill4:"#F8F8FA",
  blue:"#007AFF", red:"#FF3B30", green:"#34C759", yellow:"#FF9500",
};
const shadow = { xs:"0 1px 4px rgba(0,0,0,.08)", xl:"0 16px 48px rgba(0,0,0,.14)", xxl:"0 24px 60px rgba(0,0,0,.18)" };
const $p = v => `$${Number(v).toFixed(2)}`;

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

function PriceLine({ price, was }) {
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
      <div style={{ fontSize:52,opacity:.3 }}>{icon}</div>
      <p style={{ fontSize:18,fontWeight:700,color:T.gray2,margin:0 }}>{title}</p>
      <p style={{ fontSize:14,color:T.gray5,margin:0,maxWidth:280,lineHeight:1.6 }}>{body}</p>
      {action}
    </div>
  );
}

/* ─── ProductCard ───────────────────────────────────────────── */
function ProductCard({ p, grid, compact, onSelect, onWishlist, wishlisted }) {
  const thumb = (h, r=16) => (
    <div style={{ height:h,background:"#f2f2f7",borderRadius:r,overflow:"hidden",position:"relative",flexShrink:0 }}>
      {p.image_url
        ? <img src={p.image_url} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
        : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32 }}>👗</div>
      }
      {p.badge&&<span style={{ position:"absolute",top:8,left:8,background:p.badge==="Sale"?T.red:T.black,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:99 }}>{p.badge}</span>}
    </div>
  );

  if (compact) return (
    <div onClick={()=>onSelect(p)} className="pressable" style={{ width:140,flexShrink:0,cursor:"pointer" }}>
      {thumb(170)}
      <p style={{ fontSize:13,fontWeight:600,marginBottom:3,marginTop:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</p>
      <PriceLine price={p.price} was={p.was}/>
    </div>
  );

  if (grid) return (
    <div onClick={()=>onSelect(p)} className="pressable" style={{ cursor:"pointer" }}>
      <div style={{ aspectRatio:"3/4",background:"#f2f2f7",borderRadius:20,overflow:"hidden",marginBottom:10,position:"relative" }}>
        {p.image_url
          ? <img src={p.image_url} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
          : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40 }}>👗</div>
        }
        {p.badge&&<span style={{ position:"absolute",top:10,left:10,background:p.badge==="Sale"?T.red:T.black,color:"#fff",fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:99 }}>{p.badge}</span>}
        <button onClick={e=>{e.stopPropagation();onWishlist(p.id);}} style={{ position:"absolute",top:10,right:10,width:34,height:34,borderRadius:17,background:"rgba(255,255,255,0.9)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Icon name={wishlisted?"heart-fill":"heart"} size={16} color={wishlisted?T.red:T.gray5}/>
        </button>
      </div>
      <p style={{ fontSize:13,fontWeight:700,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</p>
      <p style={{ fontSize:11,color:T.gray4,marginBottom:5 }}>{p.category}</p>
      <PriceLine price={p.price} was={p.was}/>
    </div>
  );
  return null;
}

/* ─── Purchase Request Modal ───────────────────────────────── */
function PurchaseModal({ product, onClose, sessionId }) {
  const { t } = useLang();
  const [form, setForm] = useState({ name:"", email:"", phone:"", address:"", note:"", size:product.sizes?.[0]||"", qty:1 });
  const [loading, setL] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr]   = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = async () => {
    if (!form.name.trim()||!form.email.trim()) { setErr("Name and email are required."); return; }
    setL(true); setErr("");

    const payload = {
      product_id:    product.id,
      product_name:  product.name,
      product_price: product.price,
      selected_size: form.size || null,
      quantity:      form.qty,
      buyer_name:    form.name.trim(),
      buyer_email:   form.email.trim(),
      buyer_phone:   form.phone.trim() || null,
      buyer_address: form.address.trim() || null,
      note:          form.note.trim() || null,
      status:        'pending',
    };

    try {
      // Try insert with session_id first
      let { error } = await sb.from('purchase_requests').insert({
        ...payload,
        session_id: sessionId || null,
      });

      // If session_id column doesn't exist yet, retry without it
      if (error && (error.message?.includes('session_id') || error.code === '42703')) {
        const res = await sb.from('purchase_requests').insert(payload);
        error = res.error;
      }

      if (error) throw error;
      setSent(true);
    } catch(e) {
      setErr(e?.message || e?.error_description || "Something went wrong. Please try again.");
    } finally {
      setL(false);
    }
  };

  const inp = (label, key, type="text", placeholder="") => (
    <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
      <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase" }}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder} style={{ padding:"12px 14px",fontSize:15,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif" }}/>
    </div>
  );

  return (
    <div style={{ position:"fixed",inset:0,zIndex:700,display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(6px)" }}/>
      <div style={{ position:"relative",zIndex:1,width:"100%",maxWidth:540,background:T.white,borderRadius:"24px 24px 0 0",maxHeight:"92vh",overflowY:"auto",animation:"slideUp .3s cubic-bezier(.32,0,.28,1)" }}>
        <div style={{ width:36,height:5,borderRadius:3,background:T.gray7,margin:"14px auto 0" }}/>
        <div style={{ padding:"20px 24px 40px" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
            <h3 style={{ fontSize:20,fontWeight:700,margin:0,letterSpacing:"-0.4px" }}>{t.requestToBuy}</h3>
            <IconBtn icon="close" onClick={onClose} size={34} color={T.gray4}/>
          </div>
          {/* Product summary */}
          <div style={{ display:"flex",gap:12,background:T.fill4,borderRadius:14,padding:14,marginBottom:22 }}>
            {product.image_url&&<div style={{ width:60,height:72,borderRadius:10,overflow:"hidden",flexShrink:0 }}><img src={product.image_url} alt={product.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/></div>}
            <div style={{ flex:1 }}>
              <p style={{ fontSize:15,fontWeight:700,margin:"0 0 4px" }}>{product.name}</p>
              <p style={{ fontSize:16,fontWeight:700,color:T.black,margin:0 }}>{$p(product.price)}</p>
            </div>
          </div>

          {sent ? (
            <div style={{ textAlign:"center",padding:"32px 0" }}>
              <div style={{ fontSize:52,marginBottom:16 }}>✅</div>
              <p style={{ fontSize:20,fontWeight:700,color:T.black,marginBottom:8 }}>{t.requestSent}</p>
              <p style={{ fontSize:14,color:T.gray4,marginBottom:24,lineHeight:1.6 }}>We'll contact you at <strong>{form.email}</strong> to confirm.</p>
              <Btn onClick={onClose} variant="gray" size="sm">Close</Btn>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {inp(t.yourName,"name","text","e.g. Jane Smith")}
              {inp(t.yourEmail,"email","email","your@email.com")}
              {inp(t.yourPhone,"phone","tel","+1 555 000 0000")}
              {inp(t.deliveryAddress,"address","text","Street, City, Country")}
              {product.sizes?.length>0&&(
                <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                  <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase" }}>{t.size}</label>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {product.sizes.map(s=>(
                      <button key={s} onClick={()=>set("size",s)} style={{ padding:"8px 16px",borderRadius:10,border:`1.5px solid ${form.size===s?T.black:T.gray8}`,background:form.size===s?T.black:T.fill3,color:form.size===s?T.white:T.black,fontSize:13,fontWeight:600,cursor:"pointer" }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                <label style={{ fontSize:12,fontWeight:600,color:T.gray4,letterSpacing:"0.05em",textTransform:"uppercase" }}>{t.noteToSeller}</label>
                <textarea value={form.note} onChange={e=>set("note",e.target.value)} placeholder="Anything we should know…" style={{ padding:"12px 14px",fontSize:14,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",fontFamily:"-apple-system,sans-serif",resize:"vertical",minHeight:72 }}/>
              </div>
              {err&&<p style={{ fontSize:13,color:T.red,background:"#fff0f0",padding:"10px 14px",borderRadius:10,margin:0 }}>{err}</p>}
              <Btn full onClick={submit} disabled={loading} style={{ marginTop:4,padding:"16px",fontSize:16,borderRadius:16 }}>
                {loading?<Spin size={18}/>:t.requestToBuy+" →"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Drawer ────────────────────────────────────────────── */
function CartDrawer({ cart, onClose, onRemove, onQty }) {
  const total = cart.reduce((s,i)=>s+i.price*i.qty, 0);
  const free  = total >= 200;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.36)",zIndex:500,backdropFilter:"blur(4px)" }}/>
      <div style={{ position:"fixed",top:0,right:0,bottom:0,width:"min(440px,100vw)",background:"rgba(255,255,255,0.97)",backdropFilter:"blur(40px)",zIndex:600,display:"flex",flexDirection:"column",animation:"slideInR 0.36s cubic-bezier(.32,0,.28,1)",borderRadius:"20px 0 0 20px",boxShadow:shadow.xxl }}>
        <div style={{ width:40,height:4,borderRadius:2,background:T.gray7,margin:"14px auto 0" }}/>
        <div style={{ padding:"16px 22px 16px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontSize:22,fontWeight:700,letterSpacing:"-0.5px" }}>My Bag</span>
          <IconBtn icon="close" onClick={onClose} size={34}/>
        </div>
        <div style={{ margin:"0 22px 10px",background:T.fill4,borderRadius:14,padding:"12px 16px" }}>
          {free
            ? <p style={{ fontSize:13,fontWeight:600,color:T.green,display:"flex",alignItems:"center",gap:6 }}><Icon name="truck" size={15} color={T.green}/> You qualify for free shipping!</p>
            : <p style={{ fontSize:13,color:T.gray3 }}>Add <strong>{$p(200-total)}</strong> more for free shipping</p>
          }
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"0 22px" }}>
          {cart.length===0 ? (
            <EmptyState icon="🛍️" title="Your bag is empty" body="Add items from the shop to get started."/>
          ) : cart.map((item,i)=>(
            <div key={`${item.id}-${item.sz}`}>
              <div style={{ padding:"16px 0",display:"flex",gap:14 }}>
                <div style={{ width:80,height:100,background:"#f2f2f7",borderRadius:14,flexShrink:0,overflow:"hidden" }}>
                  {item.image_url?<img src={item.image_url} alt={item.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>👗</div>}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:15,fontWeight:600,marginBottom:2 }}>{item.name}</p>
                  {item.sz&&<p style={{ fontSize:13,color:T.gray4,marginBottom:12 }}>Size: {item.sz}</p>}
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <div style={{ display:"flex",alignItems:"center",background:T.gray9,borderRadius:99 }}>
                      <button onClick={()=>onQty(item,item.qty-1)} style={{ width:34,height:34,borderRadius:17,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="minus" size={14} color={T.black}/></button>
                      <span style={{ fontSize:15,fontWeight:600,minWidth:22,textAlign:"center" }}>{item.qty}</span>
                      <button onClick={()=>onQty(item,item.qty+1)} style={{ width:34,height:34,borderRadius:17,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><Icon name="plus" size={14} color={T.black}/></button>
                    </div>
                    <span style={{ fontSize:16,fontWeight:700 }}>{$p(item.price*item.qty)}</span>
                  </div>
                </div>
                <button onClick={()=>onRemove(item)} style={{ background:"none",border:"none",cursor:"pointer",alignSelf:"flex-start",marginTop:2 }}><Icon name="close" size={16} color={T.gray5}/></button>
              </div>
              {i<cart.length-1&&<Divider/>}
            </div>
          ))}
        </div>
        {cart.length>0&&(
          <div style={{ padding:"18px 22px 32px",borderTop:`1px solid ${T.gray8}` }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
              <span style={{ fontSize:15,color:T.gray3 }}>Total</span>
              <span style={{ fontSize:18,fontWeight:700 }}>{$p(free?total:total+12)}</span>
            </div>
            <Btn full style={{ borderRadius:14,padding:"17px",fontSize:16 }}>Checkout →</Btn>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Product Detail ────────────────────────────────────────── */
function ProductDetail({ p, onBack, onAdd, wishlisted, onWishlist, sessionId }) {
  const [sz, setSz]       = useState(null);
  const [done, setDone]   = useState(false);
  const [showReq, setReq] = useState(false);

  const add = () => {
    if (!sz && p.sizes?.length>0) return;
    onAdd({ ...p, sz: sz || null });
    setDone(true); setTimeout(()=>setDone(false), 2200);
  };

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ position:"relative",width:"100%",aspectRatio:"4/5",background:"#f2f2f7",borderRadius:24,overflow:"hidden",marginBottom:24 }}>
        {p.image_url?<img src={p.image_url} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}/>:<div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:64,color:T.gray6 }}>👗</div>}
        {p.badge&&<div style={{ position:"absolute",top:16,left:16,background:p.badge==="Sale"?T.red:"#000",color:"#fff",fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:99,textTransform:"uppercase" }}>{p.badge}</div>}
        <div style={{ position:"absolute",top:14,right:14,display:"flex",flexDirection:"column",gap:10 }}>
          <IconBtn icon={wishlisted?"heart-fill":"heart"} onClick={()=>onWishlist(p.id)} size={40} bg="rgba(255,255,255,0.9)" color={wishlisted?T.red:T.gray3} style={{ backdropFilter:"blur(8px)" }}/>
        </div>
      </div>

      <p style={{ fontSize:12,fontWeight:500,color:T.gray4,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6 }}>{p.category}</p>
      <h1 style={{ fontSize:28,fontWeight:700,letterSpacing:"-0.8px",marginBottom:12,lineHeight:1.2,color:T.black }}>{p.name}</h1>

      {Number(p.rating)>0&&(
        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
          <RatingStars rating={p.rating}/>
          <span style={{ fontSize:13,color:T.gray3 }}>{p.rating} ({p.reviews} reviews)</span>
        </div>
      )}

      <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:20 }}>
        <span style={{ fontSize:30,fontWeight:700,letterSpacing:"-0.8px",color:p.was?T.red:T.black }}>{$p(p.price)}</span>
        {p.was&&<span style={{ fontSize:18,color:T.gray4,textDecoration:"line-through" }}>{$p(p.was)}</span>}
      </div>

      {p.description&&(<><Divider my={16}/><p style={{ fontSize:15,color:T.gray3,lineHeight:1.7,marginBottom:20 }}>{p.description}</p></>)}

      {p.sizes?.length>0&&(
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:13,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12,color:T.gray2 }}>Size</p>
          <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
            {p.sizes.map(s=>(
              <button key={s} onClick={()=>setSz(s)} style={{ minWidth:52,padding:"10px 14px",borderRadius:12,border:`1.5px solid ${sz===s?T.black:T.gray7}`,background:sz===s?T.black:T.fill3,color:sz===s?T.white:T.black,fontSize:14,fontWeight:600,cursor:"pointer" }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex",gap:12,marginBottom:24 }}>
        <Btn full onClick={add} disabled={p.sizes?.length>0&&!sz} style={{ borderRadius:16,padding:"17px",fontSize:16 }}>
          {done?"Added ✓":"Add to Bag"}
        </Btn>
        <Btn variant="gray" onClick={()=>setReq(true)} style={{ borderRadius:16,padding:"17px",whiteSpace:"nowrap" }}>
          Request to Buy
        </Btn>
      </div>

      {showReq&&<PurchaseModal product={p} onClose={()=>setReq(false)} sessionId={sessionId}/>}
    </div>
  );
}

/* ─── Hero Slider ───────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    label:    "SS26 Collection",
    title:    "Refined pieces\nfor modern living.",
    sub:      "New arrivals — just dropped",
    cta:      "Explore →",
    bg:       "linear-gradient(145deg,#1C1C1E,#3A3A3C)",
    textColor:"#fff",
  },
  {
    id: 2,
    label:    "Limited Time",
    title:    "Up to 40% Off\nSelect Styles.",
    sub:      "Shop the sale before it ends",
    cta:      "Shop Sale →",
    bg:       "linear-gradient(145deg,#FF3B30,#C0392B)",
    textColor:"#fff",
  },
  {
    id: 3,
    label:    "Knitwear Edit",
    title:    "Luxuriously soft\ncashmere pieces.",
    sub:      "Crafted for the season",
    cta:      "Discover →",
    bg:       "linear-gradient(145deg,#2C2C2E,#5B4A3A)",
    textColor:"#fff",
  },
];

function HeroSlider({ onNavigate }) {
  const [idx, setIdx]     = useState(0);
  const [drag, setDrag]   = useState(null); // { startX, startIdx }
  const timerRef          = useRef(null);

  const go = (i) => setIdx((i + SLIDES.length) % SLIDES.length);

  // Auto-advance every 4 s
  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 4000);
  };
  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, []);

  // Touch / mouse swipe
  const onDragStart = (clientX) => setDrag({ startX: clientX, startIdx: idx });
  const onDragEnd   = (clientX) => {
    if (!drag) return;
    const dx = drag.startX - clientX;
    if (Math.abs(dx) > 40) { go(idx + (dx > 0 ? 1 : -1)); resetTimer(); }
    setDrag(null);
  };

  const slide = SLIDES[idx];

  return (
    <div
      style={{ position:"relative", borderRadius:24, overflow:"hidden", marginBottom:28, userSelect:"none" }}
      onMouseDown={e=>onDragStart(e.clientX)}
      onMouseUp={e=>onDragEnd(e.clientX)}
      onTouchStart={e=>onDragStart(e.touches[0].clientX)}
      onTouchEnd={e=>onDragEnd(e.changedTouches[0].clientX)}
    >
      {/* Slide panels (CSS translate trick — instant no-flash) */}
      <div style={{ display:"flex", transition:"transform .38s cubic-bezier(.32,0,.28,1)", transform:`translateX(-${idx*100}%)`, willChange:"transform" }}>
        {SLIDES.map((s, i) => (
          <div key={s.id} style={{ minWidth:"100%", background:s.bg, padding:"38px 26px 32px", boxSizing:"border-box" }}>
            <p style={{ fontSize:11,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",color:"rgba(255,255,255,0.45)",marginBottom:10 }}>{s.label}</p>
            <h2 style={{ fontSize:30,fontWeight:800,color:s.textColor,letterSpacing:"-0.8px",lineHeight:1.15,marginBottom:10,whiteSpace:"pre-line" }}>{s.title}</h2>
            <p style={{ fontSize:14,color:"rgba(255,255,255,0.55)",marginBottom:26,lineHeight:1.5 }}>{s.sub}</p>
            <button
              onClick={() => onNavigate("shop")}
              style={{ background:"rgba(255,255,255,0.18)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff",padding:"11px 22px",borderRadius:99,fontSize:14,fontWeight:600,cursor:"pointer",letterSpacing:"-0.1px" }}
            >{s.cta}</button>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div style={{ position:"absolute",bottom:14,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6 }}>
        {SLIDES.map((_,i) => (
          <button
            key={i}
            onClick={()=>{ go(i); resetTimer(); }}
            style={{ width:i===idx?20:6,height:6,borderRadius:3,background:i===idx?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.35)",border:"none",cursor:"pointer",padding:0,transition:"width .25s, background .25s" }}
          />
        ))}
      </div>

      {/* Left / right arrow taps */}
      <button onClick={()=>{ go(idx-1); resetTimer(); }} style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.25)",border:"none",borderRadius:99,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:300 }}>‹</button>
      <button onClick={()=>{ go(idx+1); resetTimer(); }} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.25)",border:"none",borderRadius:99,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:300 }}>›</button>
    </div>
  );
}
function HomeScreen({ products, onSelect, onWishlist, wishlist, onNavigate }) {
  const newP  = products.filter(p=>p.badge==='New').slice(0,8);
  const saleP = products.filter(p=>p.badge==='Sale').slice(0,8);
  const trend = products.slice(0,6);

  if (products.length===0) return <EmptyState icon="🛍️" title="Shop opening soon" body="Our collection is being curated. Check back shortly for new arrivals."/>;

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <HeroSlider onNavigate={onNavigate}/>

      {newP.length>0&&(
        <div style={{ marginBottom:32 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
            <p style={{ fontSize:20,fontWeight:700,letterSpacing:"-0.5px",margin:0 }}>New In ✦</p>
            <button onClick={()=>onNavigate("shop")} style={{ background:"none",border:"none",cursor:"pointer",fontSize:14,color:T.blue,fontWeight:500 }}>See All</button>
          </div>
          <HScroll gap={12}>{newP.map(p=><ProductCard key={p.id} p={p} compact onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>)}</HScroll>
        </div>
      )}

      {saleP.length>0&&(
        <div style={{ background:"linear-gradient(135deg,#fff0f0,#ffe5e5)",borderRadius:20,padding:"22px 20px",marginBottom:28 }}>
          <p style={{ fontSize:12,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.red,marginBottom:4 }}>Limited Time</p>
          <p style={{ fontSize:22,fontWeight:800,letterSpacing:"-0.5px",marginBottom:4 }}>Up to 40% off</p>
          <p style={{ fontSize:13,color:T.gray4,marginBottom:16 }}>Select styles. While stocks last.</p>
          <Btn size="sm" style={{ background:T.red,color:T.white }} onClick={()=>onNavigate("shop")}>Shop Sale →</Btn>
        </div>
      )}

      {trend.length>0&&(
        <div style={{ marginBottom:32 }}>
          <p style={{ fontSize:20,fontWeight:700,letterSpacing:"-0.5px",marginBottom:16 }}>Trending Now 🔥</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 10px" }}>
            {trend.map(p=><ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Shop ──────────────────────────────────────────────────── */
function ShopScreen({ products, onSelect, onWishlist, wishlist }) {
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

  if (products.length===0) return <EmptyState icon="👗" title="Shop is empty" body="Products will appear here once added by the team."/>;

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <HScroll gap={8}>{cats.map(c=><Chip key={c} label={c} active={cat===c} onClick={()=>setCat(c)}/>)}</HScroll>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",margin:"16px 0 20px" }}>
        <span style={{ fontSize:14,color:T.gray4 }}>{filtered.length} items</span>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{ fontSize:14,color:T.black,background:T.fill3,border:"none",padding:"9px 16px",borderRadius:99,cursor:"pointer",outline:"none" }}>
            <option value="featured">Browse</option>
            <option value="new">New In</option>
            <option value="low">Lowest Price</option>
            <option value="high">Highest Price</option>
            <option value="rating">Top Rated</option>
          </select>
          <button onClick={()=>setGrid(g=>!g)} style={{ width:36,height:36,borderRadius:10,background:T.fill3,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Icon name={grid?"list":"grid"} size={16} color={T.black}/>
          </button>
        </div>
      </div>
      {filtered.length===0 ? <EmptyState icon="🔍" title={`No ${cat} items`} body="Try a different category."/> : (
        <div style={{ display:"grid",gridTemplateColumns:grid?"1fr 1fr":"1fr",gap:grid?"16px 10px":"12px" }}>
          {filtered.map(p=>(
            grid ? <ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/> : (
              <div key={p.id} onClick={()=>onSelect(p)} className="pressable" style={{ display:"flex",gap:14,cursor:"pointer",background:T.fill4,borderRadius:18,padding:14 }}>
                <div style={{ width:80,height:100,background:"#f2f2f7",borderRadius:14,flexShrink:0,overflow:"hidden" }}>
                  {p.image_url?<img src={p.image_url} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>👗</div>}
                </div>
                <div style={{ flex:1,minWidth:0,paddingTop:2 }}>
                  <p style={{ fontSize:15,fontWeight:700,marginBottom:4 }}>{p.name}</p>
                  <p style={{ fontSize:12,color:T.gray4,marginBottom:6 }}>{p.category}</p>
                  {Number(p.rating)>0&&<RatingStars rating={p.rating} size={11}/>}
                  <div style={{ marginTop:6 }}><PriceLine price={p.price} was={p.was}/></div>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Search ────────────────────────────────────────────────── */
function SearchScreen({ products, onSelect, onWishlist, wishlist }) {
  const [q, setQ] = useState("");
  const res = useMemo(() => q.trim().length<2 ? [] : products.filter(p=>p.name?.toLowerCase().includes(q.toLowerCase())||p.category?.toLowerCase().includes(q.toLowerCase())), [q,products]);
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ position:"relative",marginBottom:22 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products…" style={{ width:"100%",padding:"15px 20px 15px 48px",fontSize:16,background:T.fill4,border:"none",borderRadius:14,outline:"none",color:T.black,boxSizing:"border-box" }}/>
        <span style={{ position:"absolute",left:16,top:"50%",transform:"translateY(-50%)" }}><Icon name="search" size={19} color={T.gray4}/></span>
        {q&&<button onClick={()=>setQ("")} style={{ position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer" }}><Icon name="close" size={16} color={T.gray4}/></button>}
      </div>
      {q.length<2 ? (
        products.length===0 ? <EmptyState icon="🔍" title="Search products" body="Add products from the admin dashboard to enable search."/> : (
          <><p style={{ fontSize:16,fontWeight:700,marginBottom:14 }}>Trending</p><HScroll gap={10}>{products.slice(0,8).map(p=><ProductCard key={p.id} p={p} compact onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>)}</HScroll></>
        )
      ) : (
        <>
          <p style={{ fontSize:14,color:T.gray4,marginBottom:20 }}>{res.length} result{res.length!==1?"s":""} for "{q}"</p>
          {res.length===0 ? <EmptyState icon="🔍" title="No results" body={`Nothing matched "${q}".`}/> : (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 10px" }}>
              {res.map(p=><ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Wishlist ──────────────────────────────────────────────── */
function WishlistScreen({ products, wishlist, onSelect, onWishlist }) {
  const items = products.filter(p=>wishlist.includes(p.id));
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <p style={{ fontSize:14,color:T.gray4,marginBottom:20 }}>{items.length} saved items</p>
      {items.length===0 ? <EmptyState icon="❤️" title="Your wishlist is empty" body="Tap the heart on any product to save it here."/> : (
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 10px" }}>
          {items.map(p=><ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={true}/>)}
        </div>
      )}
    </div>
  );
}

/* ─── Account ───────────────────────────────────────────────── */
function AccountScreen({ onNavigate }) {
  const rows = [
    { icon:"box",      label:"My Orders",       sub:"Purchase history",    go:"orders"   },
    { icon:"heart",    label:"Wishlist",         sub:"Saved items",         go:"wishlist" },
    { icon:"location", label:"Addresses",        sub:"Delivery addresses",  go:null       },
    { icon:"card",     label:"Payment Methods",  sub:"Saved cards",         go:null       },
    { icon:"gift",     label:"Refer a Friend",   sub:"Give $20, get $20",   go:null       },
    { icon:"bell",     label:"Notifications",    sub:"Manage alerts",       go:null       },
    { icon:"settings", label:"Settings",         sub:"Account preferences", go:null       },
  ];
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ background:"linear-gradient(145deg,#1C1C1E,#3A3A3C)",borderRadius:24,padding:"28px 24px",marginBottom:24,display:"flex",alignItems:"center",gap:18 }}>
        <div style={{ width:64,height:64,borderRadius:32,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <Icon name="person" size={28} color="rgba(255,255,255,0.7)"/>
        </div>
        <div>
          <p style={{ fontSize:20,fontWeight:700,color:T.white,letterSpacing:"-0.5px" }}>Guest User</p>
          <p style={{ fontSize:13,color:"rgba(255,255,255,0.45)",marginTop:3 }}>MSAMBWA Member</p>
        </div>
      </div>
      <div style={{ background:T.fill4,borderRadius:20,overflow:"hidden" }}>
        {rows.map((row,i)=>(
          <div key={row.label}>
            <button onClick={()=>row.go&&onNavigate(row.go)} style={{ width:"100%",display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:"none",border:"none",cursor:row.go?"pointer":"default",textAlign:"left" }}>
              <div style={{ width:38,height:38,borderRadius:10,background:T.white,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:shadow.xs }}>
                <Icon name={row.icon} size={18} color={T.black}/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15,fontWeight:600,margin:0,letterSpacing:"-0.2px" }}>{row.label}</p>
                <p style={{ fontSize:12,color:T.gray4,margin:"2px 0 0" }}>{row.sub}</p>
              </div>
              {row.go&&<Icon name="chevronR" size={16} color={T.gray5}/>}
            </button>
            {i<rows.length-1&&<div style={{ height:1,background:T.gray8,margin:"0 18px" }}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Logo ──────────────────────────────────────────────────── */
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

/* ─── Header ────────────────────────────────────────────────── */
function Header({ screen, cartCount, onCart, onNavigate, canGoBack, onBack }) {
  const titles = { shop:"Shop", search:"Search", wishlist:"Wishlist", account:"Account" };
  const title = titles[screen] || "";
  return (
    <header style={{ background:"rgba(255,255,255,0.94)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:"1px solid rgba(0,0,0,0.07)",position:"sticky",top:0,zIndex:200,userSelect:"none" }}>
      <div style={{ height:64,display:"flex",alignItems:"center",padding:"0 8px",position:"relative" }}>
        <div style={{ display:"flex",alignItems:"center",minWidth:100,flexShrink:0 }}>
          {canGoBack ? (
            <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",color:T.blue,padding:"8px 8px" }}>
              <Icon name="back" size={20} color={T.blue} strokeWidth={2}/>
            </button>
          ) : (
            <button onClick={()=>onNavigate("home")} style={{ background:"none",border:"none",cursor:"pointer",padding:"8px 10px" }}>
              <Logo height={36}/>
            </button>
          )}
        </div>
        <div style={{ position:"absolute",left:"50%",transform:"translateX(-50%)",pointerEvents:"none" }}>
          {canGoBack&&title&&<span style={{ fontSize:17,fontWeight:600,letterSpacing:"-0.3px",color:"#000",whiteSpace:"nowrap" }}>{title}</span>}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:0,marginLeft:"auto",flexShrink:0 }}>
          {screen!=="search"&&(
            <button onClick={()=>onNavigate("search")} style={{ background:"none",border:"none",cursor:"pointer",padding:"8px 10px" }}>
              <Icon name="search" size={22} color={T.black}/>
            </button>
          )}
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
  const tabs = [
    { id:"home",     icon:"home",   label:"Home"    },
    { id:"shop",     icon:"bag",    label:"Shop"    },
    { id:"search",   icon:"search", label:"Search"  },
    { id:"wishlist", icon:"heart",  label:"Saved"   },
    { id:"account",  icon:"person", label:"Account" },
  ];
  return (
    <nav style={{ position:"fixed",bottom:0,left:0,right:0,background:"rgba(255,255,255,0.94)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:`1px solid ${T.gray8}`,display:"flex",justifyContent:"space-around",padding:"8px 0 20px",zIndex:300 }}>
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
function SaleModal({ onClose, onShop }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)" }}/>
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
          <button onClick={onShop} style={{ width:"100%",background:"#000",color:"#fff",border:"none",borderRadius:14,padding:"17px",fontSize:16,fontWeight:600,cursor:"pointer" }}>Shop the Sale →</button>
          <button onClick={onClose} style={{ width:"100%",background:"none",border:"none",padding:"14px",fontSize:14,color:"#8e8e93",cursor:"pointer",marginTop:4 }}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Root App ──────────────────────────────────────────────── */
export default function Page() {
  const [lang, setLang]         = useState("en");
  const t                        = TR[lang] || TR.en;

  /* Products from Supabase */
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* Persistent session */
  const [sessionId, setSid]     = useState(null);

  /* Navigation */
  const [current,  setCurrent]  = useState({ screen:"home" });
  const [history,  setHistory]  = useState([]);

  /* Cart — stored in localStorage keyed by sessionId */
  const [cart,     setCart]     = useState([]);

  /* Wishlist — stored in Supabase wishlists table */
  const [wishlist, setWishlist] = useState([]);

  const [cartOpen,    setCartOpen]    = useState(false);
  const [showSale,    setShowSale]    = useState(false);
  const [showCookies, setShowCookies] = useState(false);

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

      // Fallback: restore cart from localStorage
      try {
        const saved = localStorage.getItem(`cart_${sid}`);
        if (saved) setCart(JSON.parse(saved));
      } catch(_) {}
    }).catch(() => {
      // Even session creation failed — generate a temporary id so the app works
      const fallbackId = `tmp-${Date.now()}`;
      setSid(fallbackId);
    });
  }, []);

  /* ── Persist cart to localStorage + Supabase whenever it changes ── */
  useEffect(() => {
    if (!sessionId) return;
    try { localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cart)); } catch(_) {}
    // Best-effort sync to Supabase (only works if anonymous_sessions table exists)
    try {
      sb.from('anonymous_sessions')
        .update({ cart, last_seen: new Date().toISOString() })
        .eq('id', sessionId)
        .then(() => {});
    } catch(_) {}
  }, [cart, sessionId]);

  /* ── Load wishlist from Supabase ── */
  useEffect(() => {
    if (!sessionId) return;
    sb.from('wishlists').select('product_id').eq('session_id', sessionId)
      .then(({ data }) => {
        if (data) setWishlist(data.map(r => r.product_id));
      });
  }, [sessionId]);

  /* ── Load products ── */
  useEffect(() => {
    sb.from('products').select('*').eq('is_active', true).order('created_at', { ascending:false })
      .then(({ data }) => { setProducts(data||[]); setLoading(false); });
  }, []);

  /* ── Show sale modal after 2s ── */
  useEffect(() => { const t = setTimeout(()=>setShowSale(true), 2000); return ()=>clearTimeout(t); }, []);
  useEffect(() => {
    if (!showSale) { const t = setTimeout(()=>setShowCookies(true), 800); return()=>clearTimeout(t); }
  }, [showSale]);

  /* ── Navigation ── */
  const navigate = (screen, data={}) => {
    setHistory(h=>[...h,current]);
    setCurrent({ screen, ...data });
    window.scrollTo(0,0);
  };
  const goBack = () => {
    const prev = history[history.length-1];
    if (prev) { setHistory(h=>h.slice(0,-1)); setCurrent(prev); }
  };

  /* ── Cart ── */
  const addToCart = item => {
    setCart(c => {
      const ex = c.find(x=>x.id===item.id&&x.sz===item.sz);
      return ex ? c.map(x=>x.id===item.id&&x.sz===item.sz?{...x,qty:x.qty+1}:x) : [...c,{...item,qty:1}];
    });
  };
  const removeFromCart = item => setCart(c=>c.filter(x=>!(x.id===item.id&&x.sz===item.sz)));
  const updateQty = (item,qty) => qty<=0 ? removeFromCart(item) : setCart(c=>c.map(x=>x.id===item.id&&x.sz===item.sz?{...x,qty}:x));

  /* ── Wishlist (synced to Supabase) ── */
  const toggleWishlist = async id => {
    const has = wishlist.includes(id);
    setWishlist(w => has ? w.filter(x=>x!==id) : [...w,id]);
    if (!sessionId) return;
    if (has) {
      await sb.from('wishlists').delete().eq('session_id', sessionId).eq('product_id', id);
    } else {
      await sb.from('wishlists').upsert({ session_id:sessionId, product_id:id });
    }
  };

  const cartCount  = cart.reduce((s,i)=>s+i.qty, 0);
  const canGoBack  = history.length > 0;
  const screenProps = { products, onSelect: p=>navigate("product",{product:p}), onWishlist:toggleWishlist, wishlist, onNavigate:navigate };

  const renderScreen = () => {
    if (loading) return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:16 }}>
        <Spin size={36}/>
        <p style={{ fontSize:14,color:T.gray5 }}>Loading products…</p>
      </div>
    );
    switch (current.screen) {
      case "home":     return <HomeScreen {...screenProps}/>;
      case "shop":     return <ShopScreen {...screenProps}/>;
      case "search":   return <SearchScreen {...screenProps}/>;
      case "wishlist": return <WishlistScreen {...screenProps}/>;
      case "account":  return <AccountScreen onNavigate={navigate}/>;
      case "product":  return <ProductDetail p={current.product} onBack={goBack} onAdd={addToCart} wishlisted={wishlist.includes(current.product?.id)} onWishlist={toggleWishlist} sessionId={sessionId}/>;
      default:         return <HomeScreen {...screenProps}/>;
    }
  };

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      <div style={{ maxWidth:480,margin:"0 auto",minHeight:"100vh",background:T.white,position:"relative" }}>
        <Header screen={current.screen} cartCount={cartCount} onCart={()=>setCartOpen(true)} onNavigate={navigate} canGoBack={canGoBack} onBack={goBack}/>
        <main style={{ padding:"20px 16px 100px" }}>{renderScreen()}</main>
        <BottomNav screen={current.screen} onNavigate={navigate}/>

        {cartOpen&&<CartDrawer cart={cart} onClose={()=>setCartOpen(false)} onRemove={removeFromCart} onQty={updateQty}/>}

        {showSale&&!cartOpen&&<SaleModal onClose={()=>setShowSale(false)} onShop={()=>{setShowSale(false);navigate("shop");}}/>}

        {!showSale&&showCookies&&(
          <div style={{ position:"fixed",bottom:80,left:12,right:12,zIndex:700,background:"rgba(28,28,30,0.96)",backdropFilter:"blur(20px)",borderRadius:20,padding:"18px 20px",animation:"slideUp .36s cubic-bezier(.32,0,.28,1)",maxWidth:560,margin:"0 auto" }}>
            <div style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
              <span style={{ fontSize:26,flexShrink:0 }}>🍪</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15,fontWeight:600,color:"#fff",marginBottom:5 }}>We use cookies</p>
                <p style={{ fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.5,marginBottom:16 }}>We use cookies to personalise your experience.</p>
                <div style={{ display:"flex",gap:10 }}>
                  <button onClick={()=>setShowCookies(false)} style={{ flex:1,background:"#fff",color:"#000",border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:600,cursor:"pointer" }}>Accept</button>
                  <button onClick={()=>setShowCookies(false)} style={{ flex:1,background:"rgba(255,255,255,0.12)",color:"#fff",border:"none",borderRadius:12,padding:"12px",fontSize:14,cursor:"pointer" }}>Decline</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LangCtx.Provider>
  );
}
