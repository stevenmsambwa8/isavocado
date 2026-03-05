'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://crekrdcmagswrfrmkiuj.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWtyZGNtYWdzd3Jmcm1raXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODEyNDYsImV4cCI6MjA4ODI1NzI0Nn0.qoUb9wOHW5DbiJtJcIGhCFtYu5Slx9_Fhb7lK_l11kM';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ─── Design tokens — pure white iOS light ─────────────────── */
const T = {
  white:  '#FFFFFF',
  bg:     '#F2F2F7',
  fill:   '#F2F2F7',
  fill2:  '#E5E5EA',
  sep:    'rgba(60,60,67,0.12)',
  label:  '#000000',
  label2: '#1C1C1E',
  label3: 'rgba(60,60,67,0.6)',
  label4: 'rgba(60,60,67,0.28)',
  blue:   '#007AFF',
  green:  '#34C759',
  red:    '#FF3B30',
  orange: '#FF9500',
  teal:   '#30B0C7',
  purple: '#AF52DE',
  yellow: '#FFD60A',
};

const STATUS = {
  pending:   { color: T.orange, label: 'Pending'   },
  confirmed: { color: T.blue,   label: 'Confirmed' },
  shipped:   { color: T.teal,   label: 'Shipped'   },
  delivered: { color: T.green,  label: 'Delivered' },
  cancelled: { color: T.red,    label: 'Cancelled' },
};

/* ─── Global CSS ────────────────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('__d_css')) {
  const s = document.createElement('style');
  s.id = '__d_css';
  s.textContent = `
    *, *::before, *::after { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
    html, body { background:#F2F2F7 !important; color:#000; margin:0; padding:0; }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    .tap:active        { opacity:.55 !important; transition:opacity .05s; }
    .rowbtn:active     { background: #EBEBF0 !important; }
    input, textarea, select { font-family:-apple-system,"SF Pro Text",system-ui,sans-serif !important; }
    ::-webkit-scrollbar { display:none; }
    input::placeholder, textarea::placeholder { color:rgba(60,60,67,0.3); }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  `;
  document.head.appendChild(s);
}

/* ─── Helpers ───────────────────────────────────────────────── */
const money   = v => `$${Number(v||0).toFixed(2)}`;
const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

/* ─── Image compression to ≤83 KB ──────────────────────────── */
async function compressImage(file, maxKB = 83) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      // start at natural size then scale down if needed
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      // cap at 1200px wide to keep things reasonable
      const MAX_W = 1200;
      if (w > MAX_W) { h = Math.round(h * MAX_W / w); w = MAX_W; }
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      // binary-search for the quality that hits ≤ maxKB
      let lo = 0.01, hi = 0.92, quality = 0.6;
      const tryQuality = (q) =>
        new Promise(res => canvas.toBlob(b => res(b), 'image/jpeg', q));

      (async () => {
        // quick first pass
        let blob = await tryQuality(hi);
        if (blob.size <= maxKB * 1024) {
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          return;
        }
        // binary search
        for (let i = 0; i < 10; i++) {
          quality = (lo + hi) / 2;
          blob = await tryQuality(quality);
          if (blob.size <= maxKB * 1024) lo = quality;
          else hi = quality;
          if (hi - lo < 0.01) break;
        }
        blob = await tryQuality(lo);
        // if still too big, scale canvas down
        let scale = 0.85;
        while (blob.size > maxKB * 1024 && scale > 0.1) {
          const nw = Math.round(w * scale), nh = Math.round(h * scale);
          canvas.width = nw; canvas.height = nh;
          ctx.drawImage(img, 0, 0, nw, nh);
          blob = await tryQuality(lo);
          scale -= 0.1;
        }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
      })();
    };
    img.src = url;
  });
}

/* ─── Icons ─────────────────────────────────────────────────── */
function Ic({ n, size=20, color=T.label, w=1.8 }) {
  const p = { fill:'none', stroke:color, strokeWidth:w, strokeLinecap:'round', strokeLinejoin:'round' };
  const d = { width:size, height:size, display:'block', flexShrink:0 };
  const set = {
    back:   <svg {...d} viewBox="0 0 24 24"><path {...p} d="M15 18l-6-6 6-6"/></svg>,
    close:  <svg {...d} viewBox="0 0 24 24"><line {...p} x1="18" y1="6" x2="6" y2="18"/><line {...p} x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:   <svg {...d} viewBox="0 0 24 24"><line {...p} x1="12" y1="5" x2="12" y2="19"/><line {...p} x1="5" y1="12" x2="19" y2="12"/></svg>,
    check:  <svg {...d} viewBox="0 0 24 24"><polyline {...p} points="20 6 9 17 4 12"/></svg>,
    box:    <svg {...d} viewBox="0 0 24 24"><path {...p} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline {...p} points="3.27 6.96 12 12.01 20.73 6.96"/><line {...p} x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    orders: <svg {...d} viewBox="0 0 24 24"><path {...p} d="M9 11l3 3L22 4"/><path {...p} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    chart:  <svg {...d} viewBox="0 0 24 24"><line {...p} x1="18" y1="20" x2="18" y2="10"/><line {...p} x1="12" y1="20" x2="12" y2="4"/><line {...p} x1="6" y1="20" x2="6" y2="14"/></svg>,
    chevR:  <svg {...d} viewBox="0 0 24 24"><polyline {...p} points="9 18 15 12 9 6"/></svg>,
    img:    <svg {...d} viewBox="0 0 24 24"><rect {...p} x="3" y="3" width="18" height="18" rx="2"/><circle {...p} cx="8.5" cy="8.5" r="1.5"/><polyline {...p} points="21 15 16 10 5 21"/></svg>,
    trash:  <svg {...d} viewBox="0 0 24 24"><polyline {...p} points="3 6 5 6 21 6"/><path {...p} d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path {...p} d="M10 11v6M14 11v6"/><path {...p} d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    edit:   <svg {...d} viewBox="0 0 24 24"><path {...p} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path {...p} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    eye:    <svg {...d} viewBox="0 0 24 24"><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...p} cx="12" cy="12" r="3"/></svg>,
    eyeOff: <svg {...d} viewBox="0 0 24 24"><path {...p} d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path {...p} d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line {...p} x1="1" y1="1" x2="23" y2="23"/></svg>,
    out:    <svg {...d} viewBox="0 0 24 24"><path {...p} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline {...p} points="16 17 21 12 16 7"/><line {...p} x1="21" y1="12" x2="9" y2="12"/></svg>,
    gear:   <svg {...d} viewBox="0 0 24 24"><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    star:   <svg {...d} viewBox="0 0 24 24"><polygon fill={color} stroke="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    starE:  <svg {...d} viewBox="0 0 24 24"><polygon {...p} fill="none" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  };
  return set[n] || <svg {...d} viewBox="0 0 24 24"/>;
}

function Spin({ size=22, color=T.blue }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation:'spin .65s linear infinite', flexShrink:0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity=".18"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Toggle ────────────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <div onClick={()=>onChange(!on)} className="tap" style={{ width:51, height:31, borderRadius:16, background:on?T.green:T.fill2, cursor:'pointer', position:'relative', transition:'background .18s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:2, left:on?22:2, width:27, height:27, borderRadius:14, background:T.white, boxShadow:'0 2px 8px rgba(0,0,0,.22)', transition:'left .18s' }}/>
    </div>
  );
}

/* ─── Status pill ───────────────────────────────────────────── */
function Pill({ status }) {
  const s = STATUS[status] || { color:T.label3, label:status };
  return <span style={{ fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:99, background:`${s.color}18`, color:s.color }}>{s.label}</span>;
}

/* ─── Toast ─────────────────────────────────────────────────── */
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:'fixed', bottom:88, left:'50%', transform:'translateX(-50%)', zIndex:9999, animation:'fadeUp .2s ease', background:type==='error'?T.red:'rgba(30,30,30,0.9)', color:T.white, padding:'12px 20px', borderRadius:99, fontSize:14, fontWeight:500, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', boxShadow:'0 4px 20px rgba(0,0,0,.2)', whiteSpace:'nowrap' }}>
      {type==='error'?'⚠️  ':'✓  '}{msg}
    </div>
  );
}

/* ─── Bottom sheet ──────────────────────────────────────────── */
function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:800, display:'flex', alignItems:'flex-end' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.3)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)', animation:'fadeIn .18s ease' }}/>
      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:640, margin:'0 auto', background:T.bg, borderRadius:'22px 22px 0 0', maxHeight:'94dvh', display:'flex', flexDirection:'column', animation:'slideUp .26s cubic-bezier(.32,0,.28,1)', paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
        <div style={{ width:36, height:5, borderRadius:3, background:T.fill2, margin:'10px auto 0', flexShrink:0 }}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 20px 8px', flexShrink:0, borderBottom:`1px solid ${T.sep}` }}>
          <h3 style={{ fontSize:17, fontWeight:600, margin:0, color:T.label }}>{title}</h3>
          <button onClick={onClose} className="tap" style={{ width:30, height:30, borderRadius:15, background:T.fill2, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Ic n="close" size={14} color={T.label3}/>
          </button>
        </div>
        <div style={{ overflowY:'auto', flex:1, padding:'12px 16px 36px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Card / grouped section ────────────────────────────────── */
function Card({ title, footer, children, style:s }) {
  return (
    <div style={{ marginBottom:22, ...s }}>
      {title && <p style={{ fontSize:13, fontWeight:400, color:T.label3, textTransform:'uppercase', letterSpacing:'0.04em', margin:'0 4px 6px' }}>{title}</p>}
      <div style={{ borderRadius:12, overflow:'hidden', background:T.white }}>{children}</div>
      {footer && <p style={{ fontSize:13, color:T.label3, margin:'6px 4px 0', lineHeight:1.4 }}>{footer}</p>}
    </div>
  );
}

/* ─── Separator ─────────────────────────────────────────────── */
const Sep = () => <div style={{ height:1, background:T.sep, marginLeft:16 }}/>;

/* ─── Row inside a card ─────────────────────────────────────── */
function Row({ label, sub, right, onPress, last, destructive }) {
  return (
    <button onClick={onPress} className={onPress ? 'rowbtn' : ''} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'13px 16px', background:T.white, border:'none', cursor:onPress?'pointer':'default', textAlign:'left' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:15, fontWeight:400, color:destructive?T.red:T.label, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</p>
        {sub && <p style={{ fontSize:12, color:T.label3, margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</p>}
      </div>
      {right}
      {onPress && !right && <Ic n="chevR" size={16} color={T.label4}/>}
    </button>
  );
}

/* ─── Primary button ────────────────────────────────────────── */
function Btn({ children, onClick, full, ghost, danger, small, loading, disabled }) {
  const bg = danger ? T.red : ghost ? T.fill2 : T.blue;
  const fg = ghost ? T.label : T.white;
  return (
    <button onClick={onClick} disabled={disabled||loading} className="tap" style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, width:full?'100%':'auto', padding:small?'10px 18px':'14px 22px', fontSize:small?14:16, fontWeight:600, background:bg, color:fg, border:'none', borderRadius:13, cursor:disabled||loading?'not-allowed':'pointer', opacity:disabled||loading?.5:1, fontFamily:'-apple-system,sans-serif', letterSpacing:'-0.2px', transition:'opacity .12s', WebkitAppearance:'none' }}>
      {loading ? <Spin size={18} color={ghost?T.blue:T.white}/> : children}
    </button>
  );
}

/* ─── Inline editable field inside white card ───────────────── */
function FieldRow({ label, value, onChange, type='text', placeholder, last, error, multiline }) {
  if (multiline) return (
    <div style={{ padding:'12px 16px' }}>
      <p style={{ fontSize:11, color:T.label3, margin:'0 0 5px', textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}{error&&<span style={{color:T.red}}> — {error}</span>}</p>
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ width:'100%', border:'none', outline:'none', fontSize:15, color:T.label, background:'transparent', padding:0, fontFamily:'-apple-system,sans-serif', resize:'none', minHeight:72 }}/>
    </div>
  );
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px' }}>
      <p style={{ fontSize:15, color:T.label, margin:0, flexShrink:0 }}>{label}{error&&<span style={{fontSize:12,color:T.red}}> — {error}</span>}</p>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ border:'none', outline:'none', fontSize:15, color:T.label, background:'transparent', textAlign:'right', width:150, fontFamily:'-apple-system,sans-serif', padding:0 }}/>
    </div>
  );
}

/* ─── Star rating picker ────────────────────────────────────── */
function StarPicker({ value, onChange }) {
  const [hov, setHov] = useState(0);
  const display = hov || Number(value) || 0;
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(i => (
        <button key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(0)} onClick={()=>onChange(i)} style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
          <Ic n={i<=display?'star':'starE'} size={28} color={i<=display?T.yellow:'#C7C7CC'} w={1.5}/>
        </button>
      ))}
    </div>
  );
}

/* ─── Multi-image picker (up to 6 photos) ───────────────────── */
function MultiImagePicker({ slots, onAdd, onRemove, onReorder, compressingIdx }) {
  const ref = useRef();
  const MAX = 6;
  const canAdd = slots.length < MAX;

  return (
    <div style={{ marginBottom:20 }}>
      <p style={{ fontSize:11, fontWeight:600, color:T.label3, textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 10px' }}>
        Photos ({slots.length}/{MAX}) — first photo is the cover
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
        {slots.map((slot, i) => (
          <div key={slot.id} style={{ position:'relative', aspectRatio:'3/4', borderRadius:12, overflow:'hidden', background:T.fill2 }}>
            <img src={slot.preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            {/* Cover badge */}
            {i === 0 && (
              <div style={{ position:'absolute', top:6, left:6, background:'rgba(0,0,0,.65)', borderRadius:6, padding:'2px 7px' }}>
                <p style={{ fontSize:10, color:'#fff', margin:0, fontWeight:700 }}>COVER</p>
              </div>
            )}
            {/* Compressing overlay */}
            {compressingIdx === i && (
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.45)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}>
                <Spin size={20} color="#fff"/>
                <p style={{ fontSize:11, color:'#fff', margin:0 }}>Compressing…</p>
              </div>
            )}
            {/* Remove button */}
            <button
              onClick={() => onRemove(i)}
              style={{ position:'absolute', top:6, right:6, width:24, height:24, borderRadius:12, background:'rgba(0,0,0,.6)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
            >
              <Ic n="close" size={12} color="#fff" w={2.5}/>
            </button>
            {/* Move left */}
            {i > 0 && (
              <button
                onClick={() => onReorder(i, i - 1)}
                style={{ position:'absolute', bottom:6, left:6, width:24, height:24, borderRadius:12, background:'rgba(0,0,0,.5)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff' }}
              >‹</button>
            )}
            {/* Move right */}
            {i < slots.length - 1 && (
              <button
                onClick={() => onReorder(i, i + 1)}
                style={{ position:'absolute', bottom:6, right:6, width:24, height:24, borderRadius:12, background:'rgba(0,0,0,.5)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'#fff' }}
              >›</button>
            )}
          </div>
        ))}

        {/* Add slot */}
        {canAdd && (
          <div
            onClick={() => ref.current.click()}
            className="tap"
            style={{ aspectRatio:'3/4', borderRadius:12, background:T.fill, border:`1.5px dashed ${T.fill2}`, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6 }}
          >
            <div style={{ width:36, height:36, borderRadius:10, background:T.fill2, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Ic n="plus" size={18} color={T.label3} w={2}/>
            </div>
            <p style={{ fontSize:11, color:T.label4, margin:0 }}>Add photo</p>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        onChange={async e => {
          const files = Array.from(e.target.files).slice(0, MAX - slots.length);
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const previewUrl = URL.createObjectURL(f);
            const slotId = Date.now() + i; // capture once before await so both calls share the same ID
            onAdd({ id: slotId, preview: previewUrl, file: null, compressing: true }, slots.length + i);
            const compressed = await compressImage(f);
            onAdd({ id: slotId, preview: URL.createObjectURL(compressed), file: compressed, compressing: false }, slots.length + i, true);
          }
          e.target.value = '';
        }}
        style={{ display:'none' }}
      />
    </div>
  );
}

/* ─── PRODUCT FORM ──────────────────────────────────────────── */
const BLANK = { name:'', description:'', price:'', was:'', category:'Knitwear', sizes:[], badge:'', stock:'', rating:'0', reviews:'0', is_active:true };
const CATS  = ['Knitwear','Tailoring','Dresses','Trousers','Tops','Outerwear','Accessories','Footwear','Sale'];
const SIZES_ALPHA   = ['XS','S','M','L','XL','XXL','3XL','4XL','5XL','6XL','7XL','8XL','9XL','10XL'];
const SIZES_NUMERIC = Array.from({length:101}, (_,i) => String(i));
const SIZES = [...SIZES_ALPHA, ...SIZES_NUMERIC];

function ProductForm({ initial=BLANK, onSave, onCancel, saving }) {
  const [f, setF]  = useState({ ...BLANK, ...initial, rating: String(initial.rating ?? 0), reviews: String(initial.reviews ?? 0) });
  const existingUrls = initial.image_urls || (initial.image_url ? [initial.image_url] : []);
  const [slots, setSlots] = useState(existingUrls.map((url, i) => ({ id: i, preview: url, file: null, compressing: false })));
  const [compressingIdx, setCompIdx] = useState(null);
  const [err, setErr] = useState({});
  const set = (k, v) => setF(x => ({ ...x, [k]:v }));
  const toggleSz = s => set('sizes', f.sizes.includes(s) ? f.sizes.filter(x=>x!==s) : [...f.sizes, s]);

  const handleAdd = (slot, idx, isUpdate = false) => {
    if (isUpdate) {
      setSlots(prev => prev.map(s => s.id === slot.id ? slot : s));
      setCompIdx(null);
    } else {
      setSlots(prev => { const next = [...prev]; next.splice(idx, 0, slot); return next; });
      setCompIdx(idx);
    }
  };
  const handleRemove  = idx => setSlots(prev => prev.filter((_, i) => i !== idx));
  const handleReorder = (from, to) => setSlots(prev => {
    const next = [...prev]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next;
  });

  const isCompressing = slots.some(s => s.compressing);

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Required';
    if (!f.price || isNaN(f.price)) e.price = 'Enter price';
    if (f.stock==='' || isNaN(f.stock)) e.stock = 'Enter qty';
    setErr(e);
    return !Object.keys(e).length;
  };

  return (
    <div>
      <MultiImagePicker
        slots={slots}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onReorder={handleReorder}
        compressingIdx={compressingIdx}
      />

      <Card title="Product Info">
        <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.sep}` }}>
          <p style={{ fontSize:11, color:T.label3, margin:'0 0 5px', textTransform:'uppercase', letterSpacing:'0.04em' }}>
            Name {err.name && <span style={{color:T.red}}>— {err.name}</span>}
          </p>
          <input value={f.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Cashmere Jumper" style={{ width:'100%', border:'none', outline:'none', fontSize:16, color:T.label, background:'transparent', padding:0 }}/>
        </div>
        <div style={{ padding:'12px 16px' }}>
          <p style={{ fontSize:11, color:T.label3, margin:'0 0 5px', textTransform:'uppercase', letterSpacing:'0.04em' }}>Description</p>
          <textarea value={f.description} onChange={e=>set('description',e.target.value)} placeholder="Describe this product…" style={{ width:'100%', border:'none', outline:'none', fontSize:15, color:T.label, background:'transparent', padding:0, resize:'none', minHeight:68 }}/>
        </div>
      </Card>

      <Card title="Pricing">
        <FieldRow label="Price (TZS)" value={f.price} onChange={v=>set('price',v)} type="number" placeholder="0" error={err.price}/>
        <Sep/>
        <FieldRow label="Original / Sale Price (TZS)" value={f.was} onChange={v=>set('was',v)} type="number" placeholder="0" last/>
      </Card>

      <Card title="Details">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', borderBottom:`1px solid ${T.sep}` }}>
          <p style={{ fontSize:15, color:T.label, margin:0 }}>Category</p>
          <select value={f.category} onChange={e=>set('category',e.target.value)} style={{ border:'none', outline:'none', fontSize:15, color:T.blue, background:'transparent', cursor:'pointer', maxWidth:160 }}>
            {CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Sep/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', borderBottom:`1px solid ${T.sep}` }}>
          <p style={{ fontSize:15, color:T.label, margin:0 }}>Badge</p>
          <select value={f.badge} onChange={e=>set('badge',e.target.value)} style={{ border:'none', outline:'none', fontSize:15, color:T.blue, background:'transparent', cursor:'pointer' }}>
            <option value="">None</option>
            <option value="New">New</option>
            <option value="Sale">Sale</option>
            <option value="Hot">Hot</option>
          </select>
        </div>
        <Sep/>
        <FieldRow label="Stock" value={f.stock} onChange={v=>set('stock',v)} type="number" placeholder="0" error={err.stock}/>
        <Sep/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px' }}>
          <p style={{ fontSize:15, color:T.label, margin:0 }}>Visible in store</p>
          <Toggle on={f.is_active} onChange={v=>set('is_active',v)}/>
        </div>
      </Card>

      {/* ── Rating & Reviews ── */}
      <Card title="Rating & Reviews" footer="These numbers appear on the product page for customers.">
        <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.sep}` }}>
          <p style={{ fontSize:13, color:T.label3, margin:'0 0 10px' }}>Star Rating</p>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <StarPicker value={f.rating} onChange={v=>set('rating',String(v))}/>
            <span style={{ fontSize:15, fontWeight:600, color:T.label, minWidth:28 }}>{f.rating}</span>
          </div>
          <p style={{ fontSize:12, color:T.label4, margin:'8px 0 0' }}>Tap a star to set rating (1–5)</p>
        </div>
        <Sep/>
        <div style={{ padding:'13px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:15, color:T.label, margin:0 }}>Review count</p>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={()=>set('reviews',String(Math.max(0,Number(f.reviews)-1)))} className="tap" style={{ width:32,height:32,borderRadius:16,background:T.fill2,border:'none',cursor:'pointer',fontSize:18,color:T.label,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:300 }}>−</button>
            <input type="number" value={f.reviews} onChange={e=>set('reviews',e.target.value)} style={{ width:60, border:'none', outline:'none', fontSize:16, fontWeight:600, color:T.label, background:'transparent', textAlign:'center' }}/>
            <button onClick={()=>set('reviews',String(Number(f.reviews)+1))} className="tap" style={{ width:32,height:32,borderRadius:16,background:T.fill2,border:'none',cursor:'pointer',fontSize:18,color:T.label,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:300 }}>+</button>
          </div>
        </div>
      </Card>

      <Card title="Available Sizes">
        <div style={{ padding:'14px 16px 16px' }}>
          <p style={{ fontSize:11, fontWeight:600, color:T.label3, letterSpacing:'0.05em', textTransform:'uppercase', margin:'0 0 8px' }}>Clothing</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:18 }}>
            {SIZES_ALPHA.map(s => (
              <button key={s} onClick={()=>toggleSz(s)} className="tap" style={{ padding:'7px 14px', borderRadius:99, border:'none', background:f.sizes.includes(s)?T.blue:T.fill, color:f.sizes.includes(s)?T.white:T.label, fontSize:14, fontWeight:f.sizes.includes(s)?700:400, cursor:'pointer', transition:'all .12s' }}>{s}</button>
            ))}
          </div>
          <p style={{ fontSize:11, fontWeight:600, color:T.label3, letterSpacing:'0.05em', textTransform:'uppercase', margin:'0 0 8px' }}>Numeric (0 – 100)</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, maxHeight:150, overflowY:'auto', paddingRight:4 }}>
            {SIZES_NUMERIC.map(s => (
              <button key={s} onClick={()=>toggleSz(s)} className="tap" style={{ padding:'6px 10px', borderRadius:8, border:'none', background:f.sizes.includes(s)?T.blue:T.fill, color:f.sizes.includes(s)?T.white:T.label, fontSize:13, fontWeight:f.sizes.includes(s)?700:400, cursor:'pointer', transition:'all .12s', minWidth:40, textAlign:'center' }}>{s}</button>
            ))}
          </div>
          {f.sizes.length > 0 && (
            <p style={{ fontSize:12, color:T.blue, margin:'10px 0 0', lineHeight:1.5 }}>
              Selected ({f.sizes.length}): {f.sizes.join(' · ')}
            </p>
          )}
        </div>
      </Card>

      <div style={{ display:'flex', flexDirection:'column', gap:10, paddingBottom:8 }}>
        <Btn full loading={saving || isCompressing} onClick={()=>{ if(validate()) onSave({form:f, slots}); }}>
          {isCompressing ? 'Compressing…' : initial.id ? 'Save Changes' : 'Add Product'}
        </Btn>
        <Btn full ghost onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

/* ─── PRODUCTS PANEL ────────────────────────────────────────── */
function ProductsPanel() {
  const [products,setProducts] = useState([]);
  const [loading,setLoading]   = useState(true);
  const [editing,setEditing]   = useState(null);
  const [saving,setSaving]     = useState(false);
  const [deleting,setDeleting] = useState(null);
  const [toast,setToast]       = useState(null);

  const showToast = (msg, type='success') => setToast({ msg, type });

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from('products').select('*').order('created_at',{ascending:false});
    setProducts(data||[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const h = () => setEditing({});
    document.addEventListener('dash:add', h);
    return () => document.removeEventListener('dash:add', h);
  }, []);

  const uploadImg = async (file, id, index) => {
    const ext  = file.name.split('.').pop();
    const path = `${id}_${index}.${ext}`;
    await sb.storage.from('product-images').upload(path, file, { upsert:true });
    return sb.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async ({ form, slots }) => {
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       parseFloat(form.price),
        was:         form.was ? parseFloat(form.was) : null,
        category:    form.category,
        sizes:       form.sizes,
        badge:       form.badge || null,
        stock:       parseInt(form.stock),
        rating:      parseFloat(form.rating) || 0,
        reviews:     parseInt(form.reviews)  || 0,
        is_active:   form.is_active,
      };
      let id = editing?.id;
      if (editing?.id) {
        await sb.from('products').update(payload).eq('id', id);
      } else {
        const { data } = await sb.from('products').insert(payload).select().single();
        id = data.id;
      }
      // Upload any new files and build final URLs array
      const urls = [];
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (slot.file) {
          // New upload
          const url = await uploadImg(slot.file, id, i);
          urls.push(url);
        } else {
          // Already-uploaded URL (kept from existing)
          urls.push(slot.preview);
        }
      }
      await sb.from('products').update({
        image_url:  urls[0] || null,   // keep legacy column for compatibility
        image_urls: urls,
      }).eq('id', id);
      showToast(editing?.id ? 'Product updated' : 'Product added');
      setEditing(null);
      load();
    } catch(e) { showToast(e.message, 'error'); }
    finally    { setSaving(false); }
  };

  const del = async id => {
    setDeleting(id);
    await sb.from('products').delete().eq('id', id);
    showToast('Deleted');
    load();
    setDeleting(null);
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',paddingTop:80}}><Spin size={30}/></div>;

  return (
    <div style={{ animation:'fadeUp .28s ease' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}

      {products.length === 0 ? (
        <div style={{ textAlign:'center', paddingTop:72 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:T.fill, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
            <Ic n="box" size={32} color={T.label3}/>
          </div>
          <p style={{ fontSize:20, fontWeight:700, color:T.label, margin:'0 0 8px' }}>No products yet</p>
          <p style={{ fontSize:15, color:T.label3, margin:'0 0 28px', lineHeight:1.5 }}>Tap + to add your first product.</p>
          <Btn onClick={()=>setEditing({})}>Add Product</Btn>
        </div>
      ) : (
        <Card title={`${products.length} product${products.length!==1?'s':''}`}>
          {products.map((p, i) => (
            <div key={p.id}>
              <div style={{ background:T.white, padding:'13px 16px', display:'flex', alignItems:'center', gap:12 }}>
                {/* Thumbnail */}
                <div style={{ width:52, height:60, borderRadius:10, background:T.fill, flexShrink:0, overflow:'hidden', position:'relative' }}>
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>👗</div>
                  }
                  {p.image_urls?.length > 1 && (
                    <div style={{ position:'absolute', bottom:3, right:3, background:'rgba(0,0,0,.6)', borderRadius:5, padding:'1px 5px' }}>
                      <p style={{ fontSize:9, color:'#fff', margin:0, fontWeight:700 }}>+{p.image_urls.length - 1}</p>
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <p style={{ fontSize:15, fontWeight:600, color:T.label, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                    {p.badge && <span style={{ fontSize:11, fontWeight:700, background:`${T.blue}18`, color:T.blue, padding:'2px 7px', borderRadius:99, flexShrink:0 }}>{p.badge}</span>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:14, fontWeight:600, color:T.label }}>${p.price}</span>
                    <span style={{ fontSize:12, color:T.label3 }}>{p.category}</span>
                    {p.rating > 0 && (
                      <span style={{ fontSize:12, color:T.label3, display:'flex', alignItems:'center', gap:2 }}>
                        ★ {p.rating} ({p.reviews})
                      </span>
                    )}
                    <span style={{ fontSize:12, color:p.stock>0?T.green:T.red }}>· {p.stock} left</span>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                  <Toggle on={p.is_active} onChange={async () => { await sb.from('products').update({is_active:!p.is_active}).eq('id',p.id); load(); }}/>
                  <button onClick={()=>setEditing(p)} className="tap" style={{ width:34,height:34,borderRadius:10,background:T.fill,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    <Ic n="edit" size={15} color={T.blue}/>
                  </button>
                  <button onClick={()=>del(p.id)} disabled={deleting===p.id} className="tap" style={{ width:34,height:34,borderRadius:10,background:`${T.red}14`,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {deleting===p.id ? <Spin size={14} color={T.red}/> : <Ic n="trash" size={15} color={T.red}/>}
                  </button>
                </div>
              </div>
              {i < products.length-1 && <Sep/>}
            </div>
          ))}
        </Card>
      )}

      {editing !== null && (
        <Sheet title={editing.id ? 'Edit Product' : 'New Product'} onClose={()=>setEditing(null)}>
          <ProductForm initial={editing} onSave={handleSave} onCancel={()=>setEditing(null)} saving={saving}/>
        </Sheet>
      )}
    </div>
  );
}

/* ─── ORDERS PANEL ──────────────────────────────────────────── */
const S_LIST = ['pending','confirmed','shipped','delivered','cancelled'];

function OrdersPanel() {
  const [orders,setOrders]     = useState([]);
  const [loading,setLoading]   = useState(true);
  const [sel,setSel]           = useState(null);
  const [filter,setFilter]     = useState('all');
  const [updating,setUpdating] = useState(false);
  const [toast,setToast]       = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from('purchase_requests').select('*').order('created_at',{ascending:false});
    setOrders(data||[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    await sb.from('purchase_requests').update({status}).eq('id', id);
    setSel(o => ({...o, status}));
    setOrders(os => os.map(o => o.id===id ? {...o,status} : o));
    setToast({ msg:'Status updated' });
    setUpdating(false);
  };

  const visible = filter==='all' ? orders : orders.filter(o=>o.status===filter);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',paddingTop:80}}><Spin size={30}/></div>;

  return (
    <div style={{ animation:'fadeUp .28s ease' }}>
      {toast && <Toast msg={toast.msg} type={toast.type||'success'} onDone={()=>setToast(null)}/>}

      {/* Filter chips */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2, marginBottom:20 }}>
        {['all',...S_LIST].map(v => {
          const cnt = v==='all' ? orders.length : orders.filter(o=>o.status===v).length;
          const active = filter===v;
          return (
            <button key={v} onClick={()=>setFilter(v)} className="tap" style={{ padding:'8px 16px', borderRadius:99, border:'none', flexShrink:0, background:active?T.blue:T.white, color:active?T.white:T.label, fontSize:14, fontWeight:active?600:400, cursor:'pointer', boxShadow:active?'none':'0 1px 3px rgba(0,0,0,.07)' }}>
              {v==='all'?'All':STATUS[v].label} · {cnt}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign:'center', paddingTop:72 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:T.fill, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
            <Ic n="orders" size={32} color={T.label3}/>
          </div>
          <p style={{ fontSize:20, fontWeight:700, color:T.label, margin:'0 0 8px' }}>No orders yet</p>
          <p style={{ fontSize:15, color:T.label3, lineHeight:1.5, maxWidth:260, margin:'0 auto' }}>Purchase requests from your storefront will show up here.</p>
        </div>
      ) : (
        <Card title={`${visible.length} request${visible.length!==1?'s':''}`}>
          {visible.map((o, i) => (
            <div key={o.id}>
              <button onClick={()=>setSel(o)} className="rowbtn" style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:T.white, border:'none', cursor:'pointer', textAlign:'left' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <p style={{ fontSize:15, fontWeight:600, color:T.label, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{o.product_name}</p>
                    <Pill status={o.status}/>
                  </div>
                  <p style={{ fontSize:13, color:T.label3, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.buyer_name} · {o.buyer_email}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:15, fontWeight:700, color:T.label, margin:'0 0 2px' }}>{money(o.product_price)}</p>
                  <p style={{ fontSize:12, color:T.label3, margin:0 }}>{fmtDate(o.created_at)}</p>
                </div>
              </button>
              {i < visible.length-1 && <Sep/>}
            </div>
          ))}
        </Card>
      )}

      {sel && (
        <Sheet title="Purchase Request" onClose={()=>setSel(null)}>
          <Card title="Product">
            <Row label={sel.product_name} sub={[sel.selected_size&&`Size ${sel.selected_size}`,`Qty ${sel.quantity}`].filter(Boolean).join(' · ')} right={<span style={{fontSize:15,fontWeight:700,color:T.label}}>{money(sel.product_price)}</span>} last/>
          </Card>
          <Card title="Buyer">
            <Row label={sel.buyer_name} sub={sel.buyer_email}/>
            {sel.buyer_phone   && <><Sep/><Row label={sel.buyer_phone}/></>}
            {sel.buyer_address && <><Sep/><Row label={sel.buyer_address}/></>}
            <Sep/><Row label={fmtDate(sel.created_at)} sub="Request date" last/>
          </Card>
          {sel.note && (
            <Card title="Note from buyer">
              <div style={{ padding:'14px 16px' }}>
                <p style={{ fontSize:15, color:T.label, margin:0, lineHeight:1.6 }}>{sel.note}</p>
              </div>
            </Card>
          )}
          <Card title="Update Status">
            {S_LIST.map((s, i) => (
              <div key={s}>
                <button onClick={()=>updateStatus(sel.id,s)} disabled={updating} className="rowbtn" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:T.white, border:'none', cursor:'pointer', textAlign:'left' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:10, height:10, borderRadius:5, background:STATUS[s].color, flexShrink:0 }}/>
                    <span style={{ fontSize:15, color:sel.status===s?STATUS[s].color:T.label, fontWeight:sel.status===s?600:400 }}>{STATUS[s].label}</span>
                  </div>
                  {sel.status===s && <Ic n="check" size={18} color={STATUS[s].color}/>}
                </button>
                {i<S_LIST.length-1 && <Sep/>}
              </div>
            ))}
          </Card>
        </Sheet>
      )}
    </div>
  );
}

/* ─── OVERVIEW ──────────────────────────────────────────────── */
function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const [{ count:tp }, { data:ord }] = await Promise.all([
        sb.from('products').select('*', {count:'exact', head:true}),
        sb.from('purchase_requests').select('status,product_price,quantity'),
      ]);
      const pending = (ord||[]).filter(o=>o.status==='pending').length;
      const revenue = (ord||[]).filter(o=>['confirmed','shipped','delivered'].includes(o.status)).reduce((s,o)=>s+(o.product_price||0)*(o.quantity||1),0);
      setStats({ products:tp||0, orders:(ord||[]).length, pending, revenue });
    })();
  }, []);

  if (!stats) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',paddingTop:80}}><Spin size={30}/></div>;

  const cards = [
    { label:'Products', value:stats.products,                  emoji:'📦', color:T.blue   },
    { label:'Orders',   value:stats.orders,                    emoji:'🧾', color:T.green  },
    { label:'Pending',  value:stats.pending,                   emoji:'⏳', color:T.orange },
    { label:'Revenue',  value:`TZS ${Number(stats.revenue||0).toLocaleString('en-US',{maximumFractionDigits:0})}`, emoji:'💰', color:T.purple },
  ];

  return (
    <div style={{ animation:'fadeUp .28s ease' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:26 }}>
        {cards.map((c, i) => (
          <div key={c.label} style={{ background:T.white, borderRadius:16, padding:'18px 16px', boxShadow:'0 1px 3px rgba(0,0,0,.05)', animation:`fadeUp .3s ease ${i*0.06}s both` }}>
            <p style={{ fontSize:26, margin:'0 0 8px' }}>{c.emoji}</p>
            <p style={{ fontSize:28, fontWeight:700, color:T.label, margin:'0 0 2px', letterSpacing:'-0.8px' }}>{c.value}</p>
            <p style={{ fontSize:13, color:T.label3, margin:0 }}>{c.label}</p>
          </div>
        ))}
      </div>
      <Card title="Quick actions">
        <Row label="Add New Product" sub="Upload photo & details" onPress={()=>document.dispatchEvent(new CustomEvent('dash:nav',{detail:'products'}))}/>
        <Sep/>
        <Row label="View Purchase Requests" sub="Check incoming orders" onPress={()=>document.dispatchEvent(new CustomEvent('dash:nav',{detail:'orders'}))} last/>
      </Card>
    </div>
  );
}

/* ─── AUTH ──────────────────────────────────────────────────── */
function Auth({ onAuth }) {
  const [mode, setMode]   = useState('login');
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [show,  setShow]  = useState(false);
  const [err,   setErr]   = useState('');
  const [busy,  setBusy]  = useState(false);

  const go = async () => {
    if (!email || !pass) { setErr('Please fill in all fields'); return; }
    setBusy(true); setErr('');
    try {
      const res = mode==='login'
        ? await sb.auth.signInWithPassword({ email, password:pass })
        : await sb.auth.signUp({ email, password:pass });
      if (res.error) throw res.error;
      onAuth(res.data.user || res.data.session?.user);
    } catch(e) { setErr(e.message); }
    finally    { setBusy(false); }
  };

  return (
    <div style={{ minHeight:'100dvh', background:T.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
      <div style={{ width:'100%', maxWidth:390, animation:'fadeUp .35s ease' }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:84, height:84, borderRadius:22, background:T.label, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 28px rgba(0,0,0,.16)' }}>
            <span style={{ fontSize:42 }}>🛍️</span>
          </div>
          <h1 style={{ fontSize:26, fontWeight:700, color:T.label, margin:'0 0 4px', letterSpacing:'-0.5px' }}>MSAMBWA</h1>
          <p style={{ fontSize:15, color:T.label3, margin:0 }}>Store Admin</p>
        </div>

        <div style={{ background:T.white, borderRadius:20, padding:'26px 20px', boxShadow:'0 2px 16px rgba(0,0,0,.07)' }}>
          <p style={{ fontSize:22, fontWeight:700, color:T.label, margin:'0 0 20px', letterSpacing:'-0.4px' }}>
            {mode==='login' ? 'Sign In' : 'Create Account'}
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ borderRadius:12, background:T.fill, overflow:'hidden' }}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" style={{ width:'100%', padding:'14px 16px', fontSize:16, border:'none', outline:'none', background:'transparent', color:T.label }}/>
            </div>
            <div style={{ borderRadius:12, background:T.fill, overflow:'hidden', display:'flex', alignItems:'center' }}>
              <input type={show?'text':'password'} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Password" style={{ flex:1, padding:'14px 16px', fontSize:16, border:'none', outline:'none', background:'transparent', color:T.label }}/>
              <button onClick={()=>setShow(s=>!s)} style={{ padding:'0 14px', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
                <Ic n={show?'eyeOff':'eye'} size={18} color={T.label3}/>
              </button>
            </div>
            {err && <div style={{ background:`${T.red}12`, borderRadius:10, padding:'11px 14px' }}><p style={{ fontSize:14, color:T.red, margin:0 }}>{err}</p></div>}
            <Btn full loading={busy} onClick={go}>{mode==='login'?'Sign In':'Create Account'}</Btn>
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:15, color:T.label3, marginTop:18 }}>
          {mode==='login' ? 'No account? ' : 'Have an account? '}
          <button onClick={()=>{ setMode(m=>m==='login'?'register':'login'); setErr(''); }} style={{ background:'none', border:'none', color:T.blue, cursor:'pointer', fontWeight:600, fontSize:15, padding:0 }}>
            {mode==='login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ─── SETTINGS PANEL ────────────────────────────────────────── */
function SettingsPanel() {
  const DEF = { delivery_enabled:true, delivery_cost:30000, free_delivery_threshold:500000 };
  const [cfg,    setCfg]  = useState(DEF);
  const [loaded, setLoad] = useState(false);
  const [saving, setSave] = useState(false);
  const [toast,  setToast]= useState(null);

  useEffect(()=>{
    sb.from('store_settings').select('*').eq('id',1).maybeSingle()
      .then(({ data })=>{ if(data) setCfg({ delivery_enabled: data.delivery_enabled ?? true, delivery_cost: data.delivery_cost ?? 30000, free_delivery_threshold: data.free_delivery_threshold ?? 500000 }); setLoad(true); });
  },[]);

  const save = async () => {
    setSave(true);
    const { error } = await sb.from('store_settings').upsert({ id:1, ...cfg }, { onConflict:'id' });
    setToast(error ? { msg:error.message, type:'error' } : { msg:'Delivery settings saved' });
    setSave(false);
  };

  const set = (k,v) => setCfg(c=>({...c,[k]:v}));

  if (!loaded) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',paddingTop:80}}><Spin size={30}/></div>;

  return (
    <div style={{ animation:'fadeUp .28s ease' }}>
      {toast && <Toast msg={toast.msg} type={toast.type||'success'} onDone={()=>setToast(null)}/>}

      <Card title="Delivery" footer={cfg.delivery_enabled ? `Customers pay TZS ${Number(cfg.delivery_cost).toLocaleString()} on orders below TZS ${Number(cfg.free_delivery_threshold).toLocaleString()}` : 'Delivery is always free for customers'}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:`1px solid ${T.sep}` }}>
          <div>
            <p style={{ fontSize:15, color:T.label, margin:0, fontWeight:500 }}>Charge delivery fee</p>
            <p style={{ fontSize:13, color:T.label3, margin:'2px 0 0' }}>Turn off to always offer free delivery</p>
          </div>
          <Toggle on={cfg.delivery_enabled} onChange={v=>set('delivery_enabled',v)}/>
        </div>
        {cfg.delivery_enabled && (<>
          <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.sep}` }}>
            <p style={{ fontSize:11, fontWeight:600, color:T.label3, letterSpacing:'0.05em', textTransform:'uppercase', margin:'0 0 6px' }}>Delivery Cost (TZS)</p>
            <input type="number" value={cfg.delivery_cost} onChange={e=>set('delivery_cost',Number(e.target.value))}
              style={{ width:'100%', border:'none', outline:'none', fontSize:22, fontWeight:700, color:T.label, background:'transparent', padding:0 }}/>
            <p style={{ fontSize:12, color:T.label4, margin:'4px 0 0' }}>Charged when order is below the free threshold</p>
          </div>
          <div style={{ padding:'14px 16px' }}>
            <p style={{ fontSize:11, fontWeight:600, color:T.label3, letterSpacing:'0.05em', textTransform:'uppercase', margin:'0 0 6px' }}>Free Delivery Threshold (TZS)</p>
            <input type="number" value={cfg.free_delivery_threshold} onChange={e=>set('free_delivery_threshold',Number(e.target.value))}
              style={{ width:'100%', border:'none', outline:'none', fontSize:22, fontWeight:700, color:T.label, background:'transparent', padding:0 }}/>
            <p style={{ fontSize:12, color:T.label4, margin:'4px 0 0' }}>Orders at or above this amount get free delivery</p>
          </div>
        </>)}
      </Card>

      <Btn full loading={saving} onClick={save}>Save Settings</Btn>
    </div>
  );
}

/* ─── ROOT DASHBOARD ────────────────────────────────────────── */
const TABS = [
  { id:'overview', label:'Overview',  icon:'chart'  },
  { id:'products', label:'Products',  icon:'box'    },
  { id:'orders',   label:'Orders',    icon:'orders' },
  { id:'settings', label:'Settings',  icon:'gear'   },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tab,  setTab]  = useState('overview');
  const [chk,  setChk]  = useState(true);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setUser(data.session?.user||null); setChk(false); });
    const { data:{ subscription } } = sb.auth.onAuthStateChange((_, s) => setUser(s?.user||null));
    const nav = e => setTab(e.detail);
    document.addEventListener('dash:nav', nav);
    return () => { subscription.unsubscribe(); document.removeEventListener('dash:nav', nav); };
  }, []);

  if (chk) return <div style={{ minHeight:'100dvh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center' }}><Spin size={32}/></div>;
  if (!user) return <Auth onAuth={setUser}/>;

  return (
    <div style={{ minHeight:'100dvh', background:T.bg, fontFamily:'-apple-system,"SF Pro Text",system-ui,sans-serif', maxWidth:640, margin:'0 auto' }}>

      {/* Sticky top bar */}
      <div style={{ background:'rgba(242,242,247,0.92)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:200, borderBottom:`1px solid ${T.sep}`, paddingTop:'env(safe-area-inset-top,0px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px 11px' }}>
          <p style={{ fontSize:22, fontWeight:700, color:T.label, margin:0, letterSpacing:'-0.5px' }}>
            {TABS.find(t=>t.id===tab)?.label}
          </p>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {tab==='products' && (
              <button onClick={()=>document.dispatchEvent(new CustomEvent('dash:add'))} className="tap" style={{ width:34, height:34, borderRadius:10, background:T.blue, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Ic n="plus" size={18} color={T.white} w={2.5}/>
              </button>
            )}
            <button onClick={()=>sb.auth.signOut().then(()=>setUser(null))} className="tap" style={{ width:34, height:34, borderRadius:10, background:T.white, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 3px rgba(0,0,0,.1)' }}>
              <Ic n="out" size={16} color={T.label3}/>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:'20px 16px 96px' }}>
        {tab==='overview'  && <Overview/>}
        {tab==='products'  && <ProductsPanel/>}
        {tab==='orders'    && <OrdersPanel/>}
        {tab==='settings'  && <SettingsPanel/>}
      </div>

      {/* Bottom tab bar */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:300, background:'rgba(242,242,247,0.92)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderTop:`1px solid ${T.sep}`, paddingBottom:'env(safe-area-inset-bottom,0px)' }}>
        <div style={{ display:'flex', justifyContent:'space-around', padding:'8px 0 2px', maxWidth:640, margin:'0 auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className="tap" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', padding:'4px 24px' }}>
              <Ic n={t.icon} size={24} color={tab===t.id?T.blue:T.label3} w={tab===t.id?2.2:1.6}/>
              <span style={{ fontSize:10, fontWeight:tab===t.id?600:400, color:tab===t.id?T.blue:T.label3 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
