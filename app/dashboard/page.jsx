'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://crekrdcmagswrfrmkiuj.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWtyZGNtYWdzd3Jmcm1raXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODEyNDYsImV4cCI6MjA4ODI1NzI0Nn0.qoUb9wOHW5DbiJtJcIGhCFtYu5Slx9_Fhb7lK_l11kM';
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── palette ─────────────────────────────────────────────────
const C = {
  bg:      '#0A0A0B',
  surface: '#111114',
  card:    '#18181C',
  border:  '#252529',
  accent:  '#6C63FF',
  accentL: '#8B84FF',
  green:   '#22C55E',
  red:     '#EF4444',
  amber:   '#F59E0B',
  text:    '#F0EFF8',
  muted:   '#8B8A9B',
  subtle:  '#2A2A2E',
};

const STATUS_COLOR = {
  pending:   C.amber,
  confirmed: C.accent,
  shipped:   C.accentL,
  delivered: C.green,
  cancelled: C.red,
};

// ── tiny helpers ─────────────────────────────────────────────
const $n = v => `$${Number(v).toFixed(2)}`;
const dateStr = d => new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });

function Badge({ status }) {
  return (
    <span style={{
      fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
      padding:'4px 10px', borderRadius:99,
      background: `${STATUS_COLOR[status] ?? C.muted}20`,
      color: STATUS_COLOR[status] ?? C.muted,
      border: `1px solid ${STATUS_COLOR[status] ?? C.muted}40`,
    }}>{status}</span>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:C.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>}
      <input {...props} style={{
        width:'100%', padding:'11px 14px', fontSize:14, background:C.subtle,
        border:`1.5px solid ${error ? C.red : C.border}`, borderRadius:10,
        color:C.text, outline:'none', boxSizing:'border-box', fontFamily:'inherit',
        transition:'border-color .15s',
        ...props.style,
      }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e  => e.target.style.borderColor = error ? C.red : C.border}
      />
      {error && <span style={{ fontSize:12, color:C.red }}>{error}</span>}
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {label && <label style={{ fontSize:12, fontWeight:600, color:C.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</label>}
      <textarea {...props} style={{
        width:'100%', padding:'11px 14px', fontSize:14, background:C.subtle,
        border:`1.5px solid ${C.border}`, borderRadius:10, color:C.text, outline:'none',
        boxSizing:'border-box', fontFamily:'inherit', resize:'vertical', minHeight:90,
        transition:'border-color .15s', ...props.style,
      }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e  => e.target.style.borderColor = C.border}
      />
    </div>
  );
}

function Btn({ children, variant='primary', loading, small, ...props }) {
  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
    padding: small ? '8px 16px' : '12px 22px',
    fontSize: small ? 13 : 14, fontWeight:600, borderRadius:10, border:'none',
    cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
    transition:'all .15s', fontFamily:'inherit', letterSpacing:'-0.1px',
    opacity: props.disabled || loading ? 0.6 : 1,
  };
  const styles = {
    primary:  { background:`linear-gradient(135deg, ${C.accent}, ${C.accentL})`, color:'#fff', boxShadow:`0 4px 14px ${C.accent}40` },
    ghost:    { background:C.subtle, color:C.text, border:`1px solid ${C.border}` },
    danger:   { background:`${C.red}15`, color:C.red, border:`1px solid ${C.red}30` },
    success:  { background:`${C.green}15`, color:C.green, border:`1px solid ${C.green}30` },
  };
  return (
    <button {...props} style={{ ...base, ...styles[variant], ...props.style }}>
      {loading ? <Spinner size={14}/> : children}
    </button>
  );
}

function Spinner({ size = 20, color = C.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation:'spin .7s linear infinite', flexShrink:0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity=".25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:900, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)' }}/>
      <div style={{
        position:'relative', width:'100%', maxWidth:width, background:C.card,
        borderRadius:20, border:`1px solid ${C.border}`, padding:28,
        maxHeight:'90vh', overflowY:'auto', animation:'modalIn .2s ease',
      }}>
        <style>{`@keyframes modalIn{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h3 style={{ fontSize:18, fontWeight:700, color:C.text, margin:0, letterSpacing:'-0.4px' }}>{title}</h3>
          <button onClick={onClose} style={{ background:C.subtle, border:'none', color:C.muted, cursor:'pointer', width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── empty state ───────────────────────────────────────────────
function Empty({ icon, title, body, action }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'64px 24px', gap:16, textAlign:'center' }}>
      <div style={{ fontSize:48, opacity:.35 }}>{icon}</div>
      <p style={{ fontSize:18, fontWeight:700, color:C.text, margin:0 }}>{title}</p>
      <p style={{ fontSize:14, color:C.muted, margin:0, maxWidth:320, lineHeight:1.6 }}>{body}</p>
      {action}
    </div>
  );
}

// ── PRODUCT FORM ──────────────────────────────────────────────
const BLANK_PRODUCT = { name:'', description:'', price:'', was:'', category:'Knitwear', sizes:[], colors:[], badge:'', stock:'', is_active:true };
const CATEGORIES = ['Knitwear','Tailoring','Dresses','Trousers','Tops','Outerwear','Accessories','Footwear','Sale'];
const SIZE_OPTIONS = ['XS','S','M','L','XL','XXL','One Size','6','7','8','9','10','11','12'];

function ProductForm({ initial = BLANK_PRODUCT, onSave, onCancel, loading }) {
  const [form, setForm]     = useState({ ...BLANK_PRODUCT, ...initial });
  const [imgFile, setImg]   = useState(null);
  const [preview, setPrev]  = useState(initial.image_url || null);
  const [err, setErr]       = useState({});
  const fileRef             = useRef();

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const toggleSize = s => set('sizes', form.sizes.includes(s) ? form.sizes.filter(x=>x!==s) : [...form.sizes, s]);

  const handleImg = e => {
    const f = e.target.files[0];
    if (!f) return;
    setImg(f);
    setPrev(URL.createObjectURL(f));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name  = 'Product name is required';
    if (!form.price || isNaN(form.price)) e.price = 'Enter a valid price';
    if (!form.stock || isNaN(form.stock)) e.stock = 'Enter stock quantity';
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ form, imgFile });
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      {/* Image upload */}
      <div>
        <label style={{ fontSize:12, fontWeight:600, color:C.muted, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:8 }}>Product Image</label>
        <div
          onClick={() => fileRef.current.click()}
          style={{
            width:'100%', height:180, borderRadius:12,
            border:`2px dashed ${C.border}`, background:C.subtle,
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            cursor:'pointer', overflow:'hidden', position:'relative', gap:8,
          }}
        >
          {preview
            ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <>
                <div style={{ fontSize:32 }}>🖼️</div>
                <p style={{ color:C.muted, fontSize:13, margin:0 }}>Click to upload image</p>
              </>
          }
          {preview && (
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', opacity:0, display:'flex', alignItems:'center', justifyContent:'center', transition:'opacity .2s' }}
              onMouseEnter={e=>e.currentTarget.style.opacity=1}
              onMouseLeave={e=>e.currentTarget.style.opacity=0}>
              <span style={{ color:'#fff', fontSize:13, fontWeight:600 }}>Change image</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display:'none' }}/>
        </div>
      </div>

      <Input label="Product Name" placeholder="e.g. Cashmere Oversized Jumper" value={form.name} onChange={e=>set('name',e.target.value)} error={err.name}/>
      <Textarea label="Description" placeholder="Describe this product…" value={form.description} onChange={e=>set('description',e.target.value)}/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <Input label="Price ($)" type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e=>set('price',e.target.value)} error={err.price}/>
        <Input label="Original Price (sale)" type="number" min="0" step="0.01" placeholder="0.00" value={form.was} onChange={e=>set('was',e.target.value)}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>Category</label>
          <select value={form.category} onChange={e=>set('category',e.target.value)}
            style={{ padding:'11px 14px', fontSize:14, background:C.subtle, border:`1.5px solid ${C.border}`, borderRadius:10, color:C.text, outline:'none', fontFamily:'inherit' }}>
            {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.muted, letterSpacing:'0.06em', textTransform:'uppercase' }}>Badge</label>
          <select value={form.badge} onChange={e=>set('badge',e.target.value)}
            style={{ padding:'11px 14px', fontSize:14, background:C.subtle, border:`1.5px solid ${C.border}`, borderRadius:10, color:C.text, outline:'none', fontFamily:'inherit' }}>
            <option value="">None</option>
            <option value="New">New</option>
            <option value="Sale">Sale</option>
            <option value="Hot">Hot</option>
          </select>
        </div>
      </div>

      <Input label="Stock Quantity" type="number" min="0" step="1" placeholder="0" value={form.stock} onChange={e=>set('stock',e.target.value)} error={err.stock}/>

      {/* Sizes */}
      <div>
        <label style={{ fontSize:12, fontWeight:600, color:C.muted, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:8 }}>Available Sizes</label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {SIZE_OPTIONS.map(s=>(
            <button key={s} type="button" onClick={()=>toggleSize(s)} style={{
              padding:'7px 14px', borderRadius:8, border:`1.5px solid ${form.sizes.includes(s)?C.accent:C.border}`,
              background:form.sizes.includes(s)?`${C.accent}20`:C.subtle, color:form.sizes.includes(s)?C.accentL:C.muted,
              fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Active toggle */}
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div onClick={()=>set('is_active',!form.is_active)}
          style={{ width:44, height:24, borderRadius:12, background:form.is_active?C.accent:C.subtle, cursor:'pointer', position:'relative', transition:'background .2s', border:`1px solid ${C.border}` }}>
          <div style={{ position:'absolute', top:3, left:form.is_active?22:3, width:16, height:16, borderRadius:8, background:'#fff', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.3)' }}/>
        </div>
        <span style={{ fontSize:14, color:C.muted }}>Product visible in store</span>
      </div>

      <div style={{ display:'flex', gap:12, paddingTop:8 }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex:1 }}>Cancel</Btn>
        <Btn onClick={handleSubmit} loading={loading} style={{ flex:2 }}>Save Product</Btn>
      </div>
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode]     = useState('login'); // login | register
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [err, setErr]       = useState('');
  const [loading, setLoad]  = useState(false);

  const handle = async () => {
    if (!email || !pass) { setErr('Please fill in all fields'); return; }
    setLoad(true); setErr('');
    try {
      let res;
      if (mode === 'login') {
        res = await sb.auth.signInWithPassword({ email, password: pass });
      } else {
        res = await sb.auth.signUp({ email, password: pass });
      }
      if (res.error) throw res.error;
      onAuth(res.data.user || res.data.session?.user);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'"DM Sans", system-ui, sans-serif' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🛍️</div>
          <h1 style={{ fontSize:28, fontWeight:800, color:C.text, margin:0, letterSpacing:'-0.8px' }}>MSAMBWA</h1>
          <p style={{ fontSize:14, color:C.muted, marginTop:6 }}>Admin Dashboard</p>
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:32 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.text, margin:'0 0 24px', letterSpacing:'-0.4px' }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Input label="Email" type="email" placeholder="admin@msambwa.com" value={email} onChange={e=>setEmail(e.target.value)}/>
            <Input label="Password" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)}/>
            {err && <p style={{ fontSize:13, color:C.red, margin:0, background:`${C.red}12`, padding:'10px 14px', borderRadius:8, border:`1px solid ${C.red}25` }}>{err}</p>}
            <Btn onClick={handle} loading={loading} style={{ width:'100%', padding:'14px', fontSize:15 }}>
              {mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </Btn>
          </div>

          <p style={{ textAlign:'center', fontSize:14, color:C.muted, marginTop:20, marginBottom:0 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={()=>{ setMode(m=>m==='login'?'register':'login'); setErr(''); }}
              style={{ background:'none', border:'none', color:C.accentL, cursor:'pointer', fontWeight:600, fontSize:14, padding:0 }}>
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── PRODUCTS PANEL ────────────────────────────────────────────
function ProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null);
  const [deleting, setDeleting] = useState(null);

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await sb.from('products').select('*').order('created_at', { ascending: false });
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const uploadImage = async (file, productId) => {
    const ext  = file.name.split('.').pop();
    const path = `${productId}.${ext}`;
    const { error } = await sb.storage.from('product-images').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = sb.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async ({ form, imgFile }) => {
    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       parseFloat(form.price),
        was:         form.was ? parseFloat(form.was) : null,
        category:    form.category,
        sizes:       form.sizes,
        colors:      form.colors,
        badge:       form.badge || null,
        stock:       parseInt(form.stock),
        is_active:   form.is_active,
      };

      let id = editing?.id;

      if (editing) {
        const { error } = await sb.from('products').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await sb.from('products').insert(payload).select().single();
        if (error) throw error;
        id = data.id;
      }

      if (imgFile) {
        const url = await uploadImage(imgFile, id);
        await sb.from('products').update({ image_url: url }).eq('id', id);
      }

      showToast(editing ? 'Product updated!' : 'Product added!');
      setShowForm(false);
      setEditing(null);
      load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else { showToast('Product deleted'); load(); }
    setDeleting(null);
  };

  const toggleActive = async (p) => {
    await sb.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    load();
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:320 }}>
      <Spinner size={32}/>
    </div>
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:999, background:toast.type==='error'?C.red:C.green, color:'#fff', padding:'14px 20px', borderRadius:12, fontSize:14, fontWeight:600, boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
          {toast.type==='error'?'⚠️ ':'✅ '}{toast.msg}
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.text, margin:0, letterSpacing:'-0.4px' }}>Products</h2>
          <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>{products.length} products</p>
        </div>
        <Btn onClick={()=>{ setEditing(null); setShowForm(true); }}>+ Add Product</Btn>
      </div>

      {products.length === 0 ? (
        <Empty icon="📦" title="No products yet" body="Add your first product to start selling."
          action={<Btn onClick={()=>setShowForm(true)}>+ Add your first product</Btn>}/>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {products.map(p => (
            <div key={p.id} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:16 }}>
              {/* Image */}
              <div style={{ width:60, height:70, borderRadius:10, overflow:'hidden', flexShrink:0, background:C.subtle }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🖼️</div>
                }
              </div>
              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                  <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                  {p.badge && <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:`${C.accent}20`, color:C.accentL, letterSpacing:'0.06em' }}>{p.badge}</span>}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:C.text }}>${p.price}</span>
                  {p.was && <span style={{ fontSize:12, color:C.muted, textDecoration:'line-through' }}>${p.was}</span>}
                  <span style={{ fontSize:12, color:C.muted }}>{p.category}</span>
                  <span style={{ fontSize:12, color:p.stock>0?C.green:C.red }}>Stock: {p.stock}</span>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <div onClick={()=>toggleActive(p)}
                  style={{ width:38, height:20, borderRadius:10, background:p.is_active?C.accent:C.subtle, cursor:'pointer', position:'relative', transition:'background .2s', border:`1px solid ${C.border}` }}>
                  <div style={{ position:'absolute', top:2, left:p.is_active?19:2, width:14, height:14, borderRadius:7, background:'#fff', transition:'left .2s' }}/>
                </div>
                <Btn small variant="ghost" onClick={()=>{ setEditing(p); setShowForm(true); }}>Edit</Btn>
                <Btn small variant="danger" loading={deleting===p.id} onClick={()=>handleDelete(p.id)}>Delete</Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? 'Edit Product' : 'Add New Product'} onClose={()=>{ setShowForm(false); setEditing(null); }} width={580}>
          <ProductForm initial={editing || BLANK_PRODUCT} onSave={handleSave} onCancel={()=>{ setShowForm(false); setEditing(null); }} loading={saving}/>
        </Modal>
      )}
    </div>
  );
}

// ── ORDERS PANEL ──────────────────────────────────────────────
const ORDER_STATUSES = ['pending','confirmed','shipped','delivered','cancelled'];

function OrdersPanel() {
  const [orders,    setOrders]  = useState([]);
  const [loading,   setLoading] = useState(true);
  const [selected,  setSelected]= useState(null);
  const [updating,  setUpdating]= useState(null);
  const [filter,    setFilter]  = useState('all');

  const load = async () => {
    setLoading(true);
    const { data, error } = await sb
      .from('purchase_requests')
      .select('*, products(name, image_url)')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await sb.from('purchase_requests').update({ status }).eq('id', id);
    load();
    if (selected?.id === id) setSelected(o => ({ ...o, status }));
    setUpdating(null);
  };

  const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:320 }}>
      <Spinner size={32}/>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:C.text, margin:0, letterSpacing:'-0.4px' }}>Purchase Requests</h2>
          <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>{orders.length} total</p>
        </div>
        <button onClick={load} style={{ background:C.subtle, border:`1px solid ${C.border}`, color:C.muted, padding:'8px 14px', borderRadius:8, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>↻ Refresh</button>
      </div>

      {/* Filter chips */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['all',...ORDER_STATUSES].map(s => (
          <button key={s} onClick={()=>setFilter(s)} style={{
            padding:'7px 16px', borderRadius:99, border:`1.5px solid ${filter===s?C.accent:C.border}`,
            background:filter===s?`${C.accent}20`:C.subtle, color:filter===s?C.accentL:C.muted,
            fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textTransform:'capitalize',
          }}>{s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o=>o.status===s).length})`}</button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Empty icon="🧾" title="No orders yet" body="Purchase requests from your store will appear here. No sign-in required for customers."/>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {visible.map(o => (
            <div key={o.id} onClick={()=>setSelected(o)} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 18px', cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'border-color .15s' }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                  <p style={{ fontSize:14, fontWeight:700, color:C.text, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.product_name}</p>
                  <Badge status={o.status}/>
                </div>
                <p style={{ fontSize:13, color:C.muted, margin:0 }}>{o.buyer_name} · {o.buyer_email}</p>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:0 }}>{$n(o.product_price || 0)}</p>
                <p style={{ fontSize:12, color:C.muted, marginTop:2 }}>{dateStr(o.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order detail modal */}
      {selected && (
        <Modal title="Purchase Request" onClose={()=>setSelected(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:C.subtle, borderRadius:12, padding:16 }}>
              <p style={{ fontSize:12, color:C.muted, margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Product</p>
              <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:0 }}>{selected.product_name}</p>
              <div style={{ display:'flex', gap:12, marginTop:6 }}>
                {selected.selected_size  && <span style={{ fontSize:13, color:C.muted }}>Size: {selected.selected_size}</span>}
                {selected.selected_color && <span style={{ fontSize:13, color:C.muted }}>Color: {selected.selected_color}</span>}
                <span style={{ fontSize:13, color:C.muted }}>Qty: {selected.quantity}</span>
                <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{$n(selected.product_price || 0)}</span>
              </div>
            </div>

            <div style={{ background:C.subtle, borderRadius:12, padding:16 }}>
              <p style={{ fontSize:12, color:C.muted, margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Buyer</p>
              <p style={{ fontSize:15, fontWeight:600, color:C.text, margin:'0 0 4px' }}>{selected.buyer_name}</p>
              <p style={{ fontSize:13, color:C.muted, margin:'0 0 2px' }}>{selected.buyer_email}</p>
              {selected.buyer_phone   && <p style={{ fontSize:13, color:C.muted, margin:'0 0 2px' }}>{selected.buyer_phone}</p>}
              {selected.buyer_address && <p style={{ fontSize:13, color:C.muted, margin:0 }}>{selected.buyer_address}</p>}
            </div>

            {selected.note && (
              <div style={{ background:C.subtle, borderRadius:12, padding:16 }}>
                <p style={{ fontSize:12, color:C.muted, margin:'0 0 6px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Note</p>
                <p style={{ fontSize:14, color:C.text, margin:0, lineHeight:1.6 }}>{selected.note}</p>
              </div>
            )}

            <div>
              <p style={{ fontSize:12, color:C.muted, margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>Update Status</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {ORDER_STATUSES.map(s => (
                  <button key={s} disabled={updating===selected.id} onClick={()=>updateStatus(selected.id, s)} style={{
                    padding:'8px 16px', borderRadius:8, border:`1.5px solid ${selected.status===s?STATUS_COLOR[s]:C.border}`,
                    background:selected.status===s?`${STATUS_COLOR[s]}20`:C.subtle, color:selected.status===s?STATUS_COLOR[s]:C.muted,
                    fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', textTransform:'capitalize',
                  }}>{updating===selected.id && selected.status!==s ? '…' : s}</button>
                ))}
              </div>
            </div>

            <p style={{ fontSize:12, color:C.muted, margin:0 }}>Received {dateStr(selected.created_at)}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── STATS PANEL ───────────────────────────────────────────────
function StatsPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const [{ count: totalProducts }, { data: orders }] = await Promise.all([
        sb.from('products').select('*', { count:'exact', head:true }),
        sb.from('purchase_requests').select('status, product_price, quantity'),
      ]);
      const pending   = (orders||[]).filter(o=>o.status==='pending').length;
      const revenue   = (orders||[]).filter(o=>['confirmed','shipped','delivered'].includes(o.status))
                          .reduce((s,o)=>s+(o.product_price||0)*(o.quantity||1), 0);
      setStats({ totalProducts: totalProducts||0, totalOrders:(orders||[]).length, pending, revenue });
    })();
  }, []);

  const cards = stats ? [
    { label:'Total Products', value:stats.totalProducts, icon:'📦', color:C.accent },
    { label:'Total Orders',   value:stats.totalOrders,   icon:'🧾', color:C.green },
    { label:'Pending',        value:stats.pending,        icon:'⏳', color:C.amber },
    { label:'Revenue',        value:`$${stats.revenue.toFixed(2)}`, icon:'💰', color:'#EC4899' },
  ] : [];

  return (
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.text, margin:'0 0 20px', letterSpacing:'-0.4px' }}>Overview</h2>
      {!stats ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}><Spinner size={32}/></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:14 }}>
          {cards.map(c => (
            <div key={c.label} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'20px 18px' }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{c.icon}</div>
              <p style={{ fontSize:26, fontWeight:800, color:c.color, margin:'0 0 4px', letterSpacing:'-1px' }}>{c.value}</p>
              <p style={{ fontSize:13, color:C.muted, margin:0 }}>{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────
const TABS = [
  { id:'overview',  label:'Overview',  icon:'📊' },
  { id:'products',  label:'Products',  icon:'📦' },
  { id:'orders',    label:'Orders',    icon:'🧾' },
];

export default function Dashboard() {
  const [user,    setUser]   = useState(null);
  const [tab,     setTab]    = useState('overview');
  const [chkAuth, setChk]    = useState(true);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setChk(false);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await sb.auth.signOut(); setUser(null); };

  if (chkAuth) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner size={36}/>
    </div>
  );

  if (!user) return <AuthScreen onAuth={setUser}/>;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'"DM Sans", system-ui, sans-serif', color:C.text }}>
      {/* Sidebar */}
      <div style={{ position:'fixed', top:0, left:0, bottom:0, width:220, background:C.surface, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', zIndex:100 }}>
        {/* Logo */}
        <div style={{ padding:'28px 20px 20px' }}>
          <div style={{ fontSize:20, marginBottom:2 }}>🛍️</div>
          <p style={{ fontSize:16, fontWeight:800, color:C.text, margin:0, letterSpacing:'-0.5px' }}>MSAMBWA</p>
          <p style={{ fontSize:11, color:C.muted, margin:'2px 0 0', letterSpacing:'0.05em' }}>ADMIN</p>
        </div>

        <div style={{ height:1, background:C.border, margin:'0 20px' }}/>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 12px 0' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 12px',
              borderRadius:10, border:'none', cursor:'pointer', textAlign:'left', marginBottom:4,
              background: tab===t.id ? `${C.accent}20` : 'none',
              color:      tab===t.id ? C.accentL : C.muted,
              fontFamily:'inherit', fontSize:14, fontWeight:tab===t.id?600:400,
              transition:'all .15s',
            }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding:'16px 14px', borderTop:`1px solid ${C.border}` }}>
          <p style={{ fontSize:12, color:C.muted, margin:'0 0 8px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</p>
          <Btn small variant="ghost" onClick={signOut} style={{ width:'100%' }}>Sign Out</Btn>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginLeft:220, padding:'32px 32px 48px', maxWidth:900 + 220, boxSizing:'border-box' }}>
        <div style={{ maxWidth:900 }}>
          {tab === 'overview' && <StatsPanel/>}
          {tab === 'products' && <ProductsPanel/>}
          {tab === 'orders'   && <OrdersPanel/>}
        </div>
      </div>
    </div>
  );
}
