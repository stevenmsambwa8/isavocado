'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://crekrdcmagswrfrmkiuj.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWtyZGNtYWdzd3Jmcm1raXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODEyNDYsImV4cCI6MjA4ODI1NzI0Nn0.qoUb9wOHW5DbiJtJcIGhCFtYu5Slx9_Fhb7lK_l11kM';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── Design tokens — pure Apple iOS/iPadOS white ── */
const T = {
  white:   '#FFFFFF',
  bg:      '#F2F2F7',
  card:    '#FFFFFF',
  fill:    '#F2F2F7',
  fill2:   '#E5E5EA',
  sep:     'rgba(60,60,67,0.12)',
  label:   '#000000',
  label2:  '#3C3C43',
  label3:  'rgba(60,60,67,0.6)',
  label4:  'rgba(60,60,67,0.3)',
  blue:    '#007AFF',
  green:   '#34C759',
  red:     '#FF3B30',
  orange:  '#FF9500',
  purple:  '#AF52DE',
  teal:    '#30B0C7',
};

const STATUS = {
  pending:   { color: T.orange,  label: 'Pending' },
  confirmed: { color: T.blue,    label: 'Confirmed' },
  shipped:   { color: T.teal,    label: 'Shipped' },
  delivered: { color: T.green,   label: 'Delivered' },
  cancelled: { color: T.red,     label: 'Cancelled' },
};

/* ── Global styles injection ── */
if (typeof document !== 'undefined' && !document.getElementById('__dash_styles')) {
  const el = document.createElement('style');
  el.id = '__dash_styles';
  el.textContent = `
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    body { background: #F2F2F7; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideUp  { from { transform:translateY(100%); } to { transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes scaleIn  { from { transform:scale(0.95); opacity:0; } to { transform:scale(1); opacity:1; } }
    @keyframes spin     { to { transform:rotate(360deg); } }
    .row-press:active   { background: #F2F2F7 !important; }
    .btn-press:active   { opacity: 0.7; transform: scale(0.98); }
    input, textarea, select { font-family: -apple-system, 'SF Pro Text', sans-serif !important; }
    ::-webkit-scrollbar { display: none; }
    input::placeholder  { color: rgba(60,60,67,0.3); }
  `;
  document.head.appendChild(el);
}

/* ── Helpers ── */
const $$ = v => `$${Number(v || 0).toFixed(2)}`;
const dateStr = d => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

/* ── SF-style icon set ── */
function Icon({ name, size = 20, color = T.label, weight = 1.8 }) {
  const p = { fill:'none', stroke:color, strokeWidth:weight, strokeLinecap:'round', strokeLinejoin:'round' };
  const s = { width:size, height:size, display:'block', flexShrink:0 };
  const icons = {
    back:     <svg {...s} viewBox="0 0 24 24"><path {...p} d="M15 18l-6-6 6-6"/></svg>,
    close:    <svg {...s} viewBox="0 0 24 24"><line {...p} x1="18" y1="6" x2="6" y2="18"/><line {...p} x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:     <svg {...s} viewBox="0 0 24 24"><line {...p} x1="12" y1="5" x2="12" y2="19"/><line {...p} x1="5" y1="12" x2="19" y2="12"/></svg>,
    check:    <svg {...s} viewBox="0 0 24 24"><polyline {...p} points="20 6 9 17 4 12"/></svg>,
    box:      <svg {...s} viewBox="0 0 24 24"><path {...p} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline {...p} points="3.27 6.96 12 12.01 20.73 6.96"/><line {...p} x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    orders:   <svg {...s} viewBox="0 0 24 24"><path {...p} d="M9 11l3 3L22 4"/><path {...p} d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    chart:    <svg {...s} viewBox="0 0 24 24"><line {...p} x1="18" y1="20" x2="18" y2="10"/><line {...p} x1="12" y1="20" x2="12" y2="4"/><line {...p} x1="6"  y1="20" x2="6"  y2="14"/></svg>,
    chevronR: <svg {...s} viewBox="0 0 24 24"><polyline {...p} points="9 18 15 12 9 6"/></svg>,
    chevronD: <svg {...s} viewBox="0 0 24 24"><polyline {...p} points="6 9 12 15 18 9"/></svg>,
    image:    <svg {...s} viewBox="0 0 24 24"><rect {...p} x="3" y="3" width="18" height="18" rx="2"/><circle {...p} cx="8.5" cy="8.5" r="1.5"/><polyline {...p} points="21 15 16 10 5 21"/></svg>,
    trash:    <svg {...s} viewBox="0 0 24 24"><polyline {...p} points="3 6 5 6 21 6"/><path {...p} d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path {...p} d="M10 11v6M14 11v6"/><path {...p} d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    edit:     <svg {...s} viewBox="0 0 24 24"><path {...p} d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path {...p} d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    eye:      <svg {...s} viewBox="0 0 24 24"><path {...p} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle {...p} cx="12" cy="12" r="3"/></svg>,
    eyeOff:   <svg {...s} viewBox="0 0 24 24"><path {...p} d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path {...p} d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line {...p} x1="1" y1="1" x2="23" y2="23"/></svg>,
    person:   <svg {...s} viewBox="0 0 24 24"><path {...p} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle {...p} cx="12" cy="7" r="4"/></svg>,
    signout:  <svg {...s} viewBox="0 0 24 24"><path {...p} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline {...p} points="16 17 21 12 16 7"/><line {...p} x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  return icons[name] || <svg {...s} viewBox="0 0 24 24"/>;
}

function Spinner({ size = 22, color = T.blue }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation:'spin .65s linear infinite', flexShrink:0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity=".2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Status pill ── */
function StatusPill({ status }) {
  const s = STATUS[status] || { color: T.label3, label: status };
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, letterSpacing: '-0.1px',
      padding: '4px 10px', borderRadius: 99,
      background: `${s.color}18`, color: s.color,
    }}>{s.label}</span>
  );
}

/* ── iOS-style segmented control ── */
function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display:'flex', background:T.fill2, borderRadius:9, padding:2, gap:2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} className="btn-press" style={{
          flex: 1, padding:'6px 8px', borderRadius:7, border:'none', cursor:'pointer',
          background: value === o.value ? T.white : 'transparent',
          color: value === o.value ? T.label : T.label3,
          fontSize: 13, fontWeight: value === o.value ? 600 : 400,
          boxShadow: value === o.value ? '0 1px 3px rgba(0,0,0,.12)' : 'none',
          transition: 'all .15s', fontFamily: '-apple-system, sans-serif',
          whiteSpace: 'nowrap',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

/* ── iOS grouped list row ── */
function ListRow({ label, value, sublabel, chevron, onPress, first, last, destructive, badge }) {
  return (
    <button onClick={onPress} className="row-press" style={{
      width:'100%', display:'flex', alignItems:'center', gap:12,
      padding:'12px 16px', background:T.white, border:'none', cursor:onPress?'pointer':'default',
      textAlign:'left', borderRadius: first&&last?12 : first?'12px 12px 0 0' : last?'0 0 12px 12px' : 0,
      borderBottom: last ? 'none' : `1px solid ${T.sep}`,
      transition: 'background .1s',
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:15, fontWeight:400, color:destructive?T.red:T.label, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{label}</p>
        {sublabel && <p style={{ fontSize:12, color:T.label3, margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sublabel}</p>}
      </div>
      {badge && <span style={{ fontSize:12, fontWeight:600, background:`${T.orange}18`, color:T.orange, padding:'3px 9px', borderRadius:99 }}>{badge}</span>}
      {value && <span style={{ fontSize:15, color:T.label3 }}>{value}</span>}
      {chevron && <Icon name="chevronR" size={16} color={T.label4}/>}
    </button>
  );
}

/* ── Section wrapper ── */
function Section({ title, children, footer }) {
  return (
    <div style={{ marginBottom:28 }}>
      {title && <p style={{ fontSize:13, fontWeight:400, color:T.label3, textTransform:'uppercase', letterSpacing:'0.04em', margin:'0 4px 6px' }}>{title}</p>}
      <div style={{ borderRadius:12, overflow:'hidden', boxShadow:'0 1px 0 rgba(0,0,0,.04)' }}>
        {children}
      </div>
      {footer && <p style={{ fontSize:13, color:T.label3, margin:'6px 4px 0', lineHeight:1.4 }}>{footer}</p>}
    </div>
  );
}

/* ── iOS-style text field ── */
function Field({ label, error, type='text', ...props }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <p style={{ fontSize:13, color:T.label3, margin:0, fontWeight:400 }}>{label}</p>}
      <div style={{ position:'relative' }}>
        <input
          {...props}
          type={isPass ? (show?'text':'password') : type}
          style={{
            width:'100%', padding: isPass?'13px 44px 13px 16px':'13px 16px',
            fontSize:16, background:T.white, border:`1.5px solid ${error?T.red:T.fill2}`,
            borderRadius:12, color:T.label, outline:'none',
            fontFamily:'-apple-system, sans-serif',
            WebkitAppearance:'none',
            transition:'border-color .15s',
            ...props.style,
          }}
          onFocus={e => e.target.style.borderColor = error ? T.red : T.blue}
          onBlur={e  => e.target.style.borderColor = error ? T.red : T.fill2}
        />
        {isPass && (
          <button onClick={()=>setShow(s=>!s)} type="button" style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4 }}>
            <Icon name={show?'eyeOff':'eye'} size={18} color={T.label3}/>
          </button>
        )}
      </div>
      {error && <p style={{ fontSize:12, color:T.red, margin:0 }}>{error}</p>}
    </div>
  );
}

function TextArea({ label, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <p style={{ fontSize:13, color:T.label3, margin:0 }}>{label}</p>}
      <textarea {...props} style={{ width:'100%', padding:'13px 16px', fontSize:15, background:T.white, border:`1.5px solid ${T.fill2}`, borderRadius:12, color:T.label, outline:'none', fontFamily:'-apple-system, sans-serif', resize:'vertical', minHeight:88, transition:'border-color .15s', ...props.style }}
        onFocus={e=>e.target.style.borderColor=T.blue}
        onBlur={e=>e.target.style.borderColor=T.fill2}
      />
    </div>
  );
}

/* ── Primary button ── */
function PrimaryBtn({ children, loading, destructive, ghost, full, small, onClick, disabled }) {
  const bg = destructive ? T.red : ghost ? T.fill : T.blue;
  const fg = ghost ? T.label : '#fff';
  return (
    <button onClick={onClick} disabled={disabled || loading} className="btn-press" style={{
      display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
      width: full ? '100%' : 'auto',
      padding: small ? '10px 20px' : '14px 24px',
      fontSize: small ? 14 : 16, fontWeight:600,
      background: bg, color: fg, border:'none', borderRadius:13,
      cursor: disabled||loading ? 'not-allowed' : 'pointer',
      opacity: disabled||loading ? .55 : 1,
      fontFamily:'-apple-system, sans-serif',
      letterSpacing:'-0.2px', transition:'opacity .15s',
      WebkitAppearance:'none',
    }}>
      {loading ? <Spinner size={18} color={ghost?T.blue:'#fff'}/> : children}
    </button>
  );
}

/* ── Toast ── */
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return ()=>clearTimeout(t); }, []);
  return (
    <div style={{
      position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)',
      zIndex:9999, animation:'fadeUp .25s ease',
      background: type==='error' ? T.red : 'rgba(50,50,50,0.92)',
      color:'#fff', padding:'12px 20px', borderRadius:99,
      fontSize:14, fontWeight:500, backdropFilter:'blur(20px)',
      boxShadow:'0 4px 20px rgba(0,0,0,.18)', whiteSpace:'nowrap',
    }}>{type==='error'?'⚠️  ':'✓  '}{msg}</div>
  );
}

/* ── Bottom Sheet Modal ── */
function Sheet({ title, onClose, children, noPad }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:800, display:'flex', alignItems:'flex-end' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(4px)', animation:'fadeIn .2s ease' }}/>
      <div style={{
        position:'relative', zIndex:1, width:'100%', maxWidth:640, margin:'0 auto',
        background:T.bg, borderRadius:'20px 20px 0 0',
        maxHeight:'94vh', display:'flex', flexDirection:'column',
        animation:'slideUp .28s cubic-bezier(.32,0,.28,1)',
        paddingBottom:'env(safe-area-inset-bottom)',
      }}>
        <div style={{ width:36, height:5, borderRadius:3, background:T.fill2, margin:'10px auto 0', flexShrink:0 }}/>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px 10px', flexShrink:0 }}>
          <h2 style={{ fontSize:17, fontWeight:600, margin:0, color:T.label }}>{title}</h2>
          <button onClick={onClose} className="btn-press" style={{ width:30, height:30, borderRadius:15, background:T.fill2, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="close" size={14} color={T.label3}/>
          </button>
        </div>
        <div style={{ overflowY:'auto', flex:1, padding: noPad ? 0 : '4px 16px 32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Toggle switch ── */
function Toggle({ value, onChange }) {
  return (
    <div onClick={()=>onChange(!value)} style={{ width:51, height:31, borderRadius:16, background:value?T.green:T.fill2, cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:2, left:value?22:2, width:27, height:27, borderRadius:14, background:'#fff', boxShadow:'0 2px 6px rgba(0,0,0,.2)', transition:'left .2s' }}/>
    </div>
  );
}

/* ── Image uploader ── */
function ImagePicker({ preview, onFile }) {
  const ref = useRef();
  return (
    <div onClick={()=>ref.current.click()} style={{ width:'100%', height:180, borderRadius:12, background:T.fill, border:`1.5px dashed ${T.fill2}`, overflow:'hidden', cursor:'pointer', position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
      {preview ? (
        <>
          <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }}/>
          <div style={{ position:'absolute', bottom:10, right:10, background:'rgba(0,0,0,0.5)', borderRadius:8, padding:'6px 10px' }}>
            <p style={{ fontSize:12, color:'#fff', margin:0, fontWeight:500 }}>Change</p>
          </div>
        </>
      ) : (
        <>
          <div style={{ width:48, height:48, borderRadius:12, background:T.fill2, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon name="image" size={22} color={T.label3}/>
          </div>
          <p style={{ fontSize:14, color:T.label3, margin:0 }}>Tap to add photo</p>
        </>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={e=>{ const f=e.target.files[0]; if(f){ onFile(f, URL.createObjectURL(f)); } }} style={{ display:'none' }}/>
    </div>
  );
}

/* ── PRODUCT FORM ── */
const BLANK = { name:'', description:'', price:'', was:'', category:'Knitwear', sizes:[], badge:'', stock:'', is_active:true };
const CATS  = ['Knitwear','Tailoring','Dresses','Trousers','Tops','Outerwear','Accessories','Footwear','Sale'];
const SIZES = ['XS','S','M','L','XL','XXL','One Size','6','7','8','9','10','11','12'];

function ProductForm({ initial = BLANK, onSave, onCancel, saving }) {
  const [f, setF]       = useState({ ...BLANK, ...initial });
  const [imgFile, setImg]= useState(null);
  const [preview, setPrev]= useState(initial.image_url || null);
  const [err, setErr]    = useState({});

  const set = (k,v) => setF(x=>({...x,[k]:v}));
  const toggleSize = s => set('sizes', f.sizes.includes(s) ? f.sizes.filter(x=>x!==s) : [...f.sizes,s]);

  const validate = () => {
    const e={};
    if (!f.name.trim()) e.name='Required';
    if (!f.price || isNaN(f.price)) e.price='Enter a valid price';
    if (f.stock===''||isNaN(f.stock)) e.stock='Enter stock qty';
    setErr(e); return !Object.keys(e).length;
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <ImagePicker preview={preview} onFile={(file, url)=>{ setImg(file); setPrev(url); }}/>

      <Section title="Product Info">
        <div style={{ background:T.white, borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.sep}` }}>
            <p style={{ fontSize:11, color:T.label3, margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.04em' }}>Name {err.name&&<span style={{color:T.red}}>— {err.name}</span>}</p>
            <input value={f.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Cashmere Jumper" style={{ width:'100%', border:'none', outline:'none', fontSize:16, color:T.label, background:'transparent', padding:0, fontFamily:'-apple-system,sans-serif' }}/>
          </div>
          <div style={{ padding:'12px 16px' }}>
            <p style={{ fontSize:11, color:T.label3, margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.04em' }}>Description</p>
            <textarea value={f.description} onChange={e=>set('description',e.target.value)} placeholder="Describe this product…" style={{ width:'100%', border:'none', outline:'none', fontSize:15, color:T.label, background:'transparent', padding:0, fontFamily:'-apple-system,sans-serif', resize:'none', minHeight:72 }}/>
          </div>
        </div>
      </Section>

      <Section title="Pricing">
        <div style={{ background:T.white, borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.sep}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:15, color:T.label, margin:0 }}>Price {err.price&&<span style={{fontSize:12,color:T.red}}> — {err.price}</span>}</p>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ fontSize:16, color:T.label3 }}>$</span>
              <input type="number" value={f.price} onChange={e=>set('price',e.target.value)} placeholder="0.00" style={{ width:80, border:'none', outline:'none', fontSize:16, color:T.label, background:'transparent', textAlign:'right', fontFamily:'-apple-system,sans-serif' }}/>
            </div>
          </div>
          <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:15, color:T.label, margin:0 }}>Original price <span style={{fontSize:12,color:T.label3}}>(sale)</span></p>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ fontSize:16, color:T.label3 }}>$</span>
              <input type="number" value={f.was} onChange={e=>set('was',e.target.value)} placeholder="0.00" style={{ width:80, border:'none', outline:'none', fontSize:16, color:T.label, background:'transparent', textAlign:'right', fontFamily:'-apple-system,sans-serif' }}/>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Details">
        <div style={{ background:T.white, borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.sep}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:15, color:T.label, margin:0 }}>Category</p>
            <select value={f.category} onChange={e=>set('category',e.target.value)} style={{ border:'none', outline:'none', fontSize:15, color:T.blue, background:'transparent', cursor:'pointer', fontFamily:'-apple-system,sans-serif' }}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.sep}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:15, color:T.label, margin:0 }}>Badge</p>
            <select value={f.badge} onChange={e=>set('badge',e.target.value)} style={{ border:'none', outline:'none', fontSize:15, color:T.blue, background:'transparent', cursor:'pointer', fontFamily:'-apple-system,sans-serif' }}>
              <option value="">None</option>
              <option value="New">New</option>
              <option value="Sale">Sale</option>
              <option value="Hot">Hot</option>
            </select>
          </div>
          <div style={{ padding:'12px 16px', borderBottom:`1px solid ${T.sep}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:15, color:T.label, margin:0 }}>Stock {err.stock&&<span style={{fontSize:12,color:T.red}}> — {err.stock}</span>}</p>
            <input type="number" value={f.stock} onChange={e=>set('stock',e.target.value)} placeholder="0" style={{ width:60, border:'none', outline:'none', fontSize:16, color:T.label, background:'transparent', textAlign:'right', fontFamily:'-apple-system,sans-serif' }}/>
          </div>
          <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ fontSize:15, color:T.label, margin:0 }}>Visible in store</p>
            <Toggle value={f.is_active} onChange={v=>set('is_active',v)}/>
          </div>
        </div>
      </Section>

      <Section title="Available Sizes">
        <div style={{ background:T.white, borderRadius:12, padding:'14px 16px' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {SIZES.map(s=>(
              <button key={s} onClick={()=>toggleSize(s)} className="btn-press" style={{
                padding:'8px 16px', borderRadius:99, border:'none',
                background: f.sizes.includes(s) ? T.blue : T.fill,
                color: f.sizes.includes(s) ? '#fff' : T.label,
                fontSize:14, fontWeight: f.sizes.includes(s)?600:400, cursor:'pointer',
                fontFamily:'-apple-system,sans-serif', transition:'all .15s',
              }}>{s}</button>
            ))}
          </div>
        </div>
      </Section>

      <div style={{ display:'flex', flexDirection:'column', gap:10, paddingBottom:8 }}>
        <PrimaryBtn full loading={saving} onClick={()=>{ if(validate()) onSave({form:f, imgFile}); }}>
          {initial.id ? 'Save Changes' : 'Add Product'}
        </PrimaryBtn>
        <PrimaryBtn full ghost onClick={onCancel}>Cancel</PrimaryBtn>
      </div>
    </div>
  );
}

/* ── PRODUCTS PANEL ── */
function ProductsPanel({ onAdd }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast]       = useState(null);

  const showToast = (msg, type='success') => setToast({ msg, type });

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from('products').select('*').order('created_at',{ascending:false});
    setProducts(data||[]);
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const uploadImg = async (file, id) => {
    const ext = file.name.split('.').pop();
    const path = `${id}.${ext}`;
    await sb.storage.from('product-images').upload(path, file, {upsert:true});
    return sb.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async ({ form, imgFile }) => {
    setSaving(true);
    try {
      const payload = { name:form.name.trim(), description:form.description.trim(), price:parseFloat(form.price), was:form.was?parseFloat(form.was):null, category:form.category, sizes:form.sizes, badge:form.badge||null, stock:parseInt(form.stock), is_active:form.is_active };
      let id = editing?.id;
      if (editing) {
        await sb.from('products').update(payload).eq('id', id);
      } else {
        const { data } = await sb.from('products').insert(payload).select().single();
        id = data.id;
      }
      if (imgFile) {
        const url = await uploadImg(imgFile, id);
        await sb.from('products').update({ image_url:url }).eq('id', id);
      }
      showToast(editing ? 'Product updated' : 'Product added');
      setEditing(null);
      load();
    } catch(e) { showToast(e.message,'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    await sb.from('products').delete().eq('id', id);
    showToast('Deleted'); load();
    setDeleting(null);
  };

  const toggleActive = async p => {
    await sb.from('products').update({is_active:!p.is_active}).eq('id',p.id);
    load();
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',paddingTop:60}}><Spinner size={30}/></div>;

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}

      {products.length === 0 ? (
        <div style={{ textAlign:'center', paddingTop:64, paddingBottom:32 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:T.fill, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Icon name="box" size={32} color={T.label3}/>
          </div>
          <p style={{ fontSize:20, fontWeight:700, color:T.label, margin:'0 0 8px' }}>No products yet</p>
          <p style={{ fontSize:15, color:T.label3, margin:'0 0 28px', lineHeight:1.5 }}>Add your first product to start selling.</p>
          <PrimaryBtn onClick={()=>setEditing({})}>Add First Product</PrimaryBtn>
        </div>
      ) : (
        <Section title={`${products.length} Products`}>
          {products.map((p,i)=>(
            <div key={p.id} style={{ background:T.white, borderBottom:i<products.length-1?`1px solid ${T.sep}`:'none', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderRadius:i===0&&products.length===1?12:i===0?'12px 12px 0 0':i===products.length-1?'0 0 12px 12px':0 }}>
              {/* thumb */}
              <div style={{ width:52, height:60, borderRadius:10, background:T.fill, flexShrink:0, overflow:'hidden' }}>
                {p.image_url ? <img src={p.image_url} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>👗</div>}
              </div>
              {/* info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                  <p style={{ fontSize:15, fontWeight:600, color:T.label, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                  {p.badge && <span style={{ fontSize:11, fontWeight:700, background:`${T.blue}18`, color:T.blue, padding:'2px 7px', borderRadius:99, flexShrink:0 }}>{p.badge}</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:T.label }}>${p.price}</span>
                  <span style={{ fontSize:12, color:T.label3 }}>{p.category}</span>
                  <span style={{ fontSize:12, color:p.stock>0?T.green:T.red }}>Stock {p.stock}</span>
                </div>
              </div>
              {/* actions */}
              <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                <Toggle value={p.is_active} onChange={()=>toggleActive(p)}/>
                <button onClick={()=>setEditing(p)} className="btn-press" style={{ width:34,height:34,borderRadius:10,background:T.fill,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Icon name="edit" size={15} color={T.blue}/>
                </button>
                <button onClick={()=>handleDelete(p.id)} disabled={deleting===p.id} className="btn-press" style={{ width:34,height:34,borderRadius:10,background:`${T.red}12`,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  {deleting===p.id ? <Spinner size={14} color={T.red}/> : <Icon name="trash" size={15} color={T.red}/>}
                </button>
              </div>
            </div>
          ))}
        </Section>
      )}

      {editing && (
        <Sheet title={editing.id ? 'Edit Product' : 'New Product'} onClose={()=>setEditing(null)}>
          <ProductForm initial={editing} onSave={handleSave} onCancel={()=>setEditing(null)} saving={saving}/>
        </Sheet>
      )}
    </div>
  );
}

/* ── ORDERS PANEL ── */
const ORDER_STATUSES = ['pending','confirmed','shipped','delivered','cancelled'];

function OrdersPanel() {
  const [orders, setOrders]   = useState([]);
  const [loading,setLoading]  = useState(true);
  const [sel, setSel]         = useState(null);
  const [filter, setFilter]   = useState('all');
  const [updating,setUpdating]= useState(false);
  const [toast, setToast]     = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await sb.from('purchase_requests').select('*').order('created_at',{ascending:false});
    setOrders(data||[]);
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    await sb.from('purchase_requests').update({status}).eq('id',id);
    setSel(o=>({...o,status}));
    setOrders(os=>os.map(o=>o.id===id?{...o,status}:o));
    setToast({msg:'Status updated'});
    setUpdating(false);
  };

  const filterOptions = [
    {value:'all',label:'All'},
    ...ORDER_STATUSES.map(s=>({value:s,label:STATUS[s].label})),
  ];

  const visible = filter==='all' ? orders : orders.filter(o=>o.status===filter);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',paddingTop:60}}><Spinner size={30}/></div>;

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      {toast && <Toast msg={toast.msg} type={toast.type||'success'} onDone={()=>setToast(null)}/>}

      {/* Filter scroll */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, marginBottom:20, scrollbarWidth:'none' }}>
        {filterOptions.map(o=>(
          <button key={o.value} onClick={()=>setFilter(o.value)} className="btn-press" style={{
            padding:'8px 16px', borderRadius:99, border:'none', flexShrink:0,
            background: filter===o.value ? T.blue : T.white,
            color: filter===o.value ? '#fff' : T.label,
            fontSize:14, fontWeight:filter===o.value?600:400, cursor:'pointer',
            fontFamily:'-apple-system,sans-serif',
            boxShadow: filter===o.value ? 'none' : '0 1px 3px rgba(0,0,0,.08)',
          }}>{o.label}{filter!==o.value&&o.value!=='all' ? ` · ${orders.filter(x=>x.status===o.value).length}` : ''}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign:'center', paddingTop:64 }}>
          <div style={{ width:72, height:72, borderRadius:20, background:T.fill, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Icon name="orders" size={32} color={T.label3}/>
          </div>
          <p style={{ fontSize:20, fontWeight:700, color:T.label, margin:'0 0 8px' }}>No orders yet</p>
          <p style={{ fontSize:15, color:T.label3, lineHeight:1.5 }}>Purchase requests from your store will appear here.</p>
        </div>
      ) : (
        <Section title={`${visible.length} requests`}>
          {visible.map((o,i)=>(
            <button key={o.id} onClick={()=>setSel(o)} className="row-press" style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', background:T.white, border:'none', cursor:'pointer', textAlign:'left', borderBottom:i<visible.length-1?`1px solid ${T.sep}`:'none', borderRadius:i===0&&visible.length===1?12:i===0?'12px 12px 0 0':i===visible.length-1?'0 0 12px 12px':0 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <p style={{ fontSize:15, fontWeight:600, color:T.label, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{o.product_name}</p>
                  <StatusPill status={o.status}/>
                </div>
                <p style={{ fontSize:13, color:T.label3, margin:0 }}>{o.buyer_name} · {o.buyer_email}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:15, fontWeight:700, color:T.label, margin:'0 0 2px' }}>{$$(o.product_price)}</p>
                <p style={{ fontSize:12, color:T.label3, margin:0 }}>{dateStr(o.created_at)}</p>
              </div>
            </button>
          ))}
        </Section>
      )}

      {sel && (
        <Sheet title="Order Detail" onClose={()=>setSel(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <Section title="Product">
              <ListRow first last label={sel.product_name} value={$$(sel.product_price)} sublabel={[sel.selected_size&&`Size: ${sel.selected_size}`,`Qty: ${sel.quantity}`].filter(Boolean).join(' · ')}/>
            </Section>
            <Section title="Buyer">
              <ListRow first label={sel.buyer_name} sublabel={sel.buyer_email}/>
              {sel.buyer_phone   && <ListRow label={sel.buyer_phone}/>}
              {sel.buyer_address && <ListRow last label={sel.buyer_address}/>}
              {!sel.buyer_phone && !sel.buyer_address && <ListRow last label={sel.buyer_email} sublabel="Email only"/>}
            </Section>
            {sel.note && (
              <Section title="Note from buyer">
                <div style={{ background:T.white, borderRadius:12, padding:'14px 16px' }}>
                  <p style={{ fontSize:15, color:T.label, margin:0, lineHeight:1.6 }}>{sel.note}</p>
                </div>
              </Section>
            )}
            <Section title="Update Status">
              <div style={{ background:T.white, borderRadius:12, overflow:'hidden' }}>
                {ORDER_STATUSES.map((s,i)=>(
                  <button key={s} onClick={()=>updateStatus(sel.id,s)} disabled={updating} className="row-press" style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:T.white, border:'none', cursor:'pointer', textAlign:'left', borderBottom:i<ORDER_STATUSES.length-1?`1px solid ${T.sep}`:'none', borderRadius:i===0?'12px 12px 0 0':i===ORDER_STATUSES.length-1?'0 0 12px 12px':0 }}>
                    <span style={{ fontSize:15, color:sel.status===s?STATUS[s].color:T.label, fontWeight:sel.status===s?600:400, textTransform:'capitalize' }}>{STATUS[s].label}</span>
                    {sel.status===s && <Icon name="check" size={18} color={STATUS[s].color}/>}
                  </button>
                ))}
              </div>
            </Section>
            <p style={{ fontSize:13, color:T.label3, textAlign:'center' }}>Received {dateStr(sel.created_at)}</p>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ── OVERVIEW PANEL ── */
function OverviewPanel() {
  const [stats, setStats] = useState(null);

  useEffect(()=>{
    (async()=>{
      const [{ count: tp }, { data: orders }] = await Promise.all([
        sb.from('products').select('*',{count:'exact',head:true}),
        sb.from('purchase_requests').select('status,product_price,quantity'),
      ]);
      const pending = (orders||[]).filter(o=>o.status==='pending').length;
      const revenue = (orders||[]).filter(o=>['confirmed','shipped','delivered'].includes(o.status)).reduce((s,o)=>s+(o.product_price||0)*(o.quantity||1),0);
      setStats({ products:tp||0, orders:(orders||[]).length, pending, revenue });
    })();
  },[]);

  if (!stats) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',paddingTop:60}}><Spinner size={30}/></div>;

  const cards = [
    { label:'Products', value:stats.products, icon:'box',    color:T.blue   },
    { label:'Orders',   value:stats.orders,   icon:'orders', color:T.green  },
    { label:'Pending',  value:stats.pending,  icon:'chart',  color:T.orange },
    { label:'Revenue',  value:`$${stats.revenue.toFixed(0)}`, icon:'chart', color:'#AF52DE' },
  ];

  return (
    <div style={{ animation:'fadeUp .3s ease' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:28 }}>
        {cards.map((c,i)=>(
          <div key={c.label} style={{ background:T.white, borderRadius:16, padding:'18px 16px', boxShadow:'0 1px 3px rgba(0,0,0,.06)', animation:`fadeUp .3s ease ${i*0.05}s both` }}>
            <div style={{ width:38, height:38, borderRadius:10, background:`${c.color}15`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <Icon name={c.icon} size={18} color={c.color}/>
            </div>
            <p style={{ fontSize:28, fontWeight:700, color:T.label, margin:'0 0 2px', letterSpacing:'-0.8px' }}>{c.value}</p>
            <p style={{ fontSize:13, color:T.label3, margin:0 }}>{c.label}</p>
          </div>
        ))}
      </div>

      <Section title="Quick Actions">
        <ListRow first label="Add New Product" sublabel="Upload a photo and details" chevron onPress={()=>document.dispatchEvent(new CustomEvent('dash:tab',{detail:'products'}))}/>
        <ListRow last label="View Purchase Requests" sublabel="Check incoming orders" chevron onPress={()=>document.dispatchEvent(new CustomEvent('dash:tab',{detail:'orders'}))}/>
      </Section>
    </div>
  );
}

/* ── AUTH ── */
function AuthScreen({ onAuth }) {
  const [mode, setMode]   = useState('login');
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [err, setErr]     = useState('');
  const [loading,setLoad] = useState(false);

  const handle = async () => {
    if (!email||!pass) { setErr('Please fill in all fields'); return; }
    setLoad(true); setErr('');
    try {
      const res = mode==='login'
        ? await sb.auth.signInWithPassword({email,password:pass})
        : await sb.auth.signUp({email,password:pass});
      if (res.error) throw res.error;
      onAuth(res.data.user||res.data.session?.user);
    } catch(e) { setErr(e.message); }
    finally { setLoad(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 20px', fontFamily:'-apple-system, "SF Pro Text", sans-serif' }}>
      <div style={{ width:'100%', maxWidth:390, animation:'fadeUp .4s ease' }}>
        {/* App icon */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:80, height:80, borderRadius:22, background:'linear-gradient(145deg,#000,#3A3A3C)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 24px rgba(0,0,0,.18)' }}>
            <span style={{ fontSize:36 }}>🛍️</span>
          </div>
          <h1 style={{ fontSize:28, fontWeight:700, color:T.label, margin:'0 0 4px', letterSpacing:'-0.6px' }}>MSAMBWA</h1>
          <p style={{ fontSize:15, color:T.label3, margin:0 }}>Store Admin</p>
        </div>

        {/* Card */}
        <div style={{ background:T.white, borderRadius:20, padding:'28px 24px', boxShadow:'0 2px 16px rgba(0,0,0,.08)' }}>
          <p style={{ fontSize:22, fontWeight:700, color:T.label, margin:'0 0 24px', letterSpacing:'-0.4px' }}>
            {mode==='login' ? 'Sign In' : 'Create Account'}
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Field label="Email" type="email" placeholder="admin@msambwa.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            <Field label="Password" type="password" placeholder="Enter password" value={pass} onChange={e=>setPass(e.target.value)}/>

            {err && (
              <div style={{ background:`${T.red}10`, borderRadius:10, padding:'12px 14px' }}>
                <p style={{ fontSize:14, color:T.red, margin:0 }}>{err}</p>
              </div>
            )}

            <PrimaryBtn full loading={loading} onClick={handle}>
              {mode==='login' ? 'Sign In' : 'Create Account'}
            </PrimaryBtn>
          </div>
        </div>

        <p style={{ textAlign:'center', fontSize:15, color:T.label3, marginTop:20 }}>
          {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={()=>{setMode(m=>m==='login'?'register':'login');setErr('');}} style={{ background:'none', border:'none', color:T.blue, cursor:'pointer', fontWeight:600, fontSize:15, padding:0, fontFamily:'-apple-system,sans-serif' }}>
            {mode==='login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ── MAIN DASHBOARD ── */
const TABS = [
  { id:'overview', label:'Overview', icon:'chart'  },
  { id:'products', label:'Products', icon:'box'    },
  { id:'orders',   label:'Orders',   icon:'orders' },
];

export default function Dashboard() {
  const [user,   setUser]  = useState(null);
  const [tab,    setTab]   = useState('overview');
  const [chk,    setChk]   = useState(true);

  useEffect(()=>{
    sb.auth.getSession().then(({data})=>{ setUser(data.session?.user||null); setChk(false); });
    const { data:{ subscription } } = sb.auth.onAuthStateChange((_,s)=>setUser(s?.user||null));
    // listen for quick-action events from overview
    const handler = e => setTab(e.detail);
    document.addEventListener('dash:tab', handler);
    return ()=>{ subscription.unsubscribe(); document.removeEventListener('dash:tab',handler); };
  },[]);

  const signOut = async () => { await sb.auth.signOut(); setUser(null); };

  if (chk) return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner size={32}/>
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser}/>;

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:'-apple-system, "SF Pro Text", sans-serif', maxWidth:640, margin:'0 auto' }}>

      {/* Top navigation bar */}
      <div style={{ background:'rgba(242,242,247,0.94)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', position:'sticky', top:0, zIndex:200, borderBottom:`1px solid ${T.sep}`, paddingTop:'env(safe-area-inset-top)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px 10px' }}>
          <div>
            <p style={{ fontSize:22, fontWeight:700, color:T.label, margin:0, letterSpacing:'-0.5px' }}>
              {TABS.find(t=>t.id===tab)?.label}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {tab === 'products' && (
              <button
                onClick={()=>document.dispatchEvent(new CustomEvent('dash:addProduct'))}
                className="btn-press"
                style={{ width:34, height:34, borderRadius:10, background:T.blue, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="plus" size={18} color="#fff" weight={2.5}/>
              </button>
            )}
            <button onClick={signOut} className="btn-press" style={{ width:34, height:34, borderRadius:10, background:T.white, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 3px rgba(0,0,0,.1)' }}>
              <Icon name="signout" size={16} color={T.label3}/>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:'20px 16px 96px' }}>
        {tab === 'overview' && <OverviewPanel/>}
        {tab === 'products' && <ProductsPanel/>}
        {tab === 'orders'   && <OrdersPanel/>}
      </div>

      {/* Bottom tab bar — native iOS style */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:300, background:'rgba(242,242,247,0.94)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderTop:`1px solid ${T.sep}`, paddingBottom:'env(safe-area-inset-bottom)', maxWidth:640, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-around', padding:'8px 0 4px' }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} className="btn-press" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', padding:'4px 20px', minWidth:0 }}>
              <Icon name={t.icon} size={24} color={tab===t.id?T.blue:T.label3} weight={tab===t.id?2.2:1.6}/>
              <span style={{ fontSize:10, fontWeight:tab===t.id?600:400, color:tab===t.id?T.blue:T.label3, letterSpacing:'-0.1px' }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
