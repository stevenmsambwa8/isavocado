'use client'
import { useState, useEffect, useMemo } from "react";

/* ─── Fonts & Global Reset ──────────────────────────── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: #f8f7f4; }
    body { font-family: 'DM Sans', sans-serif; color: #1c1c1a; -webkit-font-smoothing: antialiased; }
    * { -webkit-tap-highlight-color: transparent; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: #e2ddd8; border-radius: 4px; }
    input, button, select { font-family: 'DM Sans', sans-serif; }
    @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes slideUp  { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
    @keyframes slideInR { from { transform:translateX(110%); } to { transform:translateX(0); } }
  `}</style>
);

/* ─── Design Tokens ─────────────────────────────────── */
const C = {
  bg:"#f8f7f4", surface:"#ffffff", s2:"#f2f0ec", s3:"#ebe8e3",
  border:"#eae6e0", text:"#1c1c1a", muted:"#9a9590",
  accent:"#1c1c1a", green:"#2d6a4f", red:"#c94a32",
};
const R = { sm:12, md:16, lg:20, xl:24, full:999 };
const shadow = {
  sm:"0 2px 8px rgba(0,0,0,0.06)", md:"0 4px 20px rgba(0,0,0,0.08)",
  lg:"0 8px 40px rgba(0,0,0,0.10)", xl:"0 20px 60px rgba(0,0,0,0.12)",
};

/* ─── Data ──────────────────────────────────────────── */
const PRODUCTS = [
  { id:1,  name:"Linen Overshirt",    cat:"Tops",       price:148, was:null, badge:null,   colors:["#e8e0d5","#2c2c2a","#8b7355"], sizes:["XS","S","M","L","XL"], rating:4.8, reviews:124, desc:"Relaxed-fit overshirt in premium Belgian linen. Slightly oversized with chest pockets.", material:"100% Belgian Linen", care:"Machine wash cold.", grad:"linear-gradient(145deg,#ede8e0,#d8cfc2)" },
  { id:2,  name:"Merino Turtleneck",  cat:"Tops",       price:195, was:null, badge:"New",  colors:["#f0ece4","#1a1a18","#8c6b4a"], sizes:["XS","S","M","L"],     rating:4.9, reviews:89,  desc:"Ultra-fine merino turtleneck. Naturally temperature-regulating and buttery soft.", material:"100% Extra-fine Merino", care:"Hand wash cold.", grad:"linear-gradient(145deg,#f0ece4,#e0d8cc)" },
  { id:3,  name:"Wide-Leg Trousers",  cat:"Bottoms",    price:228, was:285,  badge:"Sale", colors:["#d4cfc8","#3d3830","#c4a882"], sizes:["XS","S","M","L","XL"], rating:4.7, reviews:203, desc:"Tailored wide-leg trousers with a high waist. Ponte-blend that holds shape beautifully.", material:"68% Viscose, 28% Polyamide, 4% Elastane", care:"Dry clean.", grad:"linear-gradient(145deg,#dedad4,#cec8c0)" },
  { id:4,  name:"Cashmere Cardigan",  cat:"Tops",       price:345, was:null, badge:"New",  colors:["#e2ddd6","#6b5e4e","#2c2c2a"], sizes:["XS","S","M","L"],     rating:5.0, reviews:57,  desc:"Hand-finished open-front cardigan in Grade-A cashmere with ribbed cuffs.", material:"100% Grade-A Cashmere", care:"Dry clean only.", grad:"linear-gradient(145deg,#f0ece4,#e0d8cc)" },
  { id:5,  name:"Silk Slip Dress",    cat:"Dresses",    price:268, was:null, badge:null,   colors:["#e8d5c4","#1a1a18","#8b7355"], sizes:["XS","S","M","L"],     rating:4.6, reviews:178, desc:"Bias-cut silk charmeuse slip dress with adjustable spaghetti straps.", material:"100% Silk Charmeuse", care:"Dry clean only.", grad:"linear-gradient(145deg,#f0e4d8,#e0d0c0)" },
  { id:6,  name:"Tailored Blazer",    cat:"Outerwear",  price:420, was:null, badge:null,   colors:["#2c2c2a","#8c7355","#e0dbd2"], sizes:["XS","S","M","L","XL"], rating:4.9, reviews:94,  desc:"Single-breasted blazer in fine Italian wool blend. Structured shoulder, clean lapel.", material:"78% Wool, 18% Silk, 4% Cashmere", care:"Dry clean only.", grad:"linear-gradient(145deg,#dedad4,#ccc4b8)" },
  { id:7,  name:"Cropped Tank",       cat:"Tops",       price:68,  was:null, badge:null,   colors:["#f0ece4","#1a1a18","#c4a882","#8b7355"], sizes:["XS","S","M","L","XL"], rating:4.5, reviews:312, desc:"Ribbed pima cotton tank with a cropped length. A minimal wardrobe essential.", material:"95% Pima Cotton, 5% Elastane", care:"Machine wash cold.", grad:"linear-gradient(145deg,#f5f2ec,#ece7e0)" },
  { id:8,  name:"Barrel Jeans",       cat:"Bottoms",    price:185, was:null, badge:"New",  colors:["#6b8ab5","#2c2c2a","#8b7355"], sizes:["24","25","26","27","28","29","30"], rating:4.7, reviews:145, desc:"Relaxed barrel-leg jeans in Japanese selvedge denim with slight stretch.", material:"98% Cotton, 2% Elastane", care:"Machine wash cold.", grad:"linear-gradient(145deg,#d8e4f0,#c8d5e5)" },
  { id:9,  name:"Wrap Midi Skirt",    cat:"Bottoms",    price:158, was:198,  badge:"Sale", colors:["#c4a882","#2c2c2a","#e8d5c4"], sizes:["XS","S","M","L"],     rating:4.8, reviews:201, desc:"Fluid wrap skirt in lightweight viscose crepe. Elegant midi length.", material:"100% Viscose Crepe", care:"Hand wash cold.", grad:"linear-gradient(145deg,#ede5d8,#ddd0be)" },
  { id:10, name:"Trench Coat",        cat:"Outerwear",  price:545, was:null, badge:null,   colors:["#c4a882","#2c2c2a","#e8e0d5"], sizes:["XS","S","M","L","XL"], rating:4.9, reviews:78,  desc:"Classic double-breasted trench in water-resistant cotton gabardine.", material:"100% Cotton Gabardine", care:"Dry clean only.", grad:"linear-gradient(145deg,#e8ddd0,#d8cebe)" },
  { id:11, name:"Knit Co-ord Set",    cat:"Sets",       price:295, was:null, badge:"New",  colors:["#e8e0d5","#6b5e4e"], sizes:["XS","S","M","L"], rating:4.8, reviews:43, desc:"Matching fine-rib knit top and trouser set in merino-cashmere blend.", material:"80% Merino, 20% Cashmere", care:"Hand wash cold.", grad:"linear-gradient(145deg,#f0e8e0,#e0d5c8)" },
  { id:12, name:"Leather Belt",       cat:"Accessories",price:88,  was:null, badge:null,   colors:["#2c2c2a","#8b7355","#c4a882"], sizes:["XS","S","M","L"],     rating:4.6, reviews:167, desc:"Full-grain leather belt with a minimalist rectangular buckle. Gets better with age.", material:"100% Full-grain Leather", care:"Leather conditioner.", grad:"linear-gradient(145deg,#d8d0c8,#c8c0b5)" },
];

const CATS = ["All","Tops","Bottoms","Dresses","Outerwear","Sets","Accessories"];

const ORDERS = [
  { id:"ORD-2891", date:"Feb 28, 2026", status:"Delivered",  items:["Linen Overshirt","Cropped Tank"],   total:216, steps:[{l:"Order placed",d:"Feb 20",ok:true},{l:"Processing",d:"Feb 21",ok:true},{l:"Shipped",d:"Feb 23",ok:true},{l:"Out for delivery",d:"Feb 28",ok:true},{l:"Delivered",d:"Feb 28",ok:true}] },
  { id:"ORD-3104", date:"Mar 02, 2026", status:"In Transit", items:["Merino Turtleneck"],                total:195, steps:[{l:"Order placed",d:"Mar 2",ok:true},{l:"Processing",d:"Mar 2",ok:true},{l:"Shipped",d:"Mar 3",ok:true},{l:"Out for delivery",d:"",ok:false},{l:"Delivered",d:"",ok:false}] },
  { id:"ORD-3287", date:"Mar 04, 2026", status:"Processing", items:["Cashmere Cardigan","Leather Belt"], total:433, steps:[{l:"Order placed",d:"Mar 4",ok:true},{l:"Processing",d:"Mar 4",ok:true},{l:"Shipped",d:"",ok:false},{l:"Out for delivery",d:"",ok:false},{l:"Delivered",d:"",ok:false}] },
];

/* ─── Helpers ───────────────────────────────────────── */
const $ = n => `$${n.toFixed(0)}`;
function pillColors(status) {
  return { Delivered:["#e6f4ec","#1f7a4a"], "In Transit":["#e8f0fb","#2952a3"], Processing:["#fef3e8","#b06020"] }[status] || ["#f0ede8","#9a9590"];
}

/* ─── Atoms ─────────────────────────────────────────── */
function Pill({ status }) {
  const [bg,col] = pillColors(status);
  return <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", background:bg, color:col, padding:"5px 12px", borderRadius:R.full }}>{status}</span>;
}
function Stars({ r }) {
  return <span style={{ color:"#c4a052", fontSize:11, letterSpacing:1 }}>{"★".repeat(Math.floor(r))}{"☆".repeat(5-Math.floor(r))}</span>;
}
function Bdg({ label }) {
  if(!label) return null;
  return <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", background:label==="Sale"?C.red:C.accent, color:"#fff", padding:"4px 10px", borderRadius:R.full }}>{label}</span>;
}
function Btn({ children, onClick, variant="dark", full, style={} }) {
  const base = { border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:13, letterSpacing:"0.04em", borderRadius:R.full, transition:"all 0.2s", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px 28px", whiteSpace:"nowrap" };
  const v = { dark:{ background:C.accent, color:"#fff" }, light:{ background:C.surface, color:C.text, border:`1px solid ${C.border}` }, ghost:{ background:"transparent", color:C.muted, padding:"8px 14px" } };
  return <button onClick={onClick} style={{ ...base, ...v[variant], ...(full?{width:"100%"}:{}), ...style }}>{children}</button>;
}
function Tag({ children, active, onClick }) {
  return <button onClick={onClick} style={{ background:active?C.accent:C.s2, color:active?"#fff":C.muted, border:"none", cursor:"pointer", padding:"9px 20px", borderRadius:R.full, fontSize:12, fontWeight:500, fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s", whiteSpace:"nowrap" }}>{children}</button>;
}
function CDot({ color, selected, onClick }) {
  return <button onClick={onClick} style={{ width:24, height:24, borderRadius:"50%", background:color, border:`2.5px solid ${selected?C.accent:"transparent"}`, outline:`2px solid ${selected?C.accent:"transparent"}`, outlineOffset:2, cursor:"pointer", transition:"all 0.15s", flexShrink:0 }}/>;
}
function SBtn({ size, selected, onClick }) {
  return <button onClick={onClick} style={{ minWidth:44, height:38, padding:"0 10px", background:selected?C.accent:C.surface, color:selected?"#fff":C.muted, border:`1.5px solid ${selected?C.accent:C.border}`, borderRadius:R.sm, cursor:"pointer", fontSize:12, fontWeight:500, fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>{size}</button>;
}
function Card({ children, style={}, onClick }) {
  return <div onClick={onClick} style={{ background:C.surface, borderRadius:R.xl, border:`1px solid ${C.border}`, overflow:"hidden", ...style }}>{children}</div>;
}
function Divider({ my=0 }) { return <div style={{ height:1, background:C.border, margin:`${my}px 0` }}/>; }

/* ─── Product Card ──────────────────────────────────── */
function PCard({ p, onSelect, onAdd }) {
  const [hov,setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{ cursor:"pointer", animation:"fadeUp 0.45s ease both" }}>
      <div onClick={()=>onSelect(p)} style={{ position:"relative", aspectRatio:"3/4", background:p.grad, borderRadius:R.xl, overflow:"hidden", marginBottom:14, boxShadow:hov?shadow.md:shadow.sm, transition:"box-shadow 0.25s" }}>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:400, fontStyle:"italic", color:"rgba(255,255,255,0.5)", textAlign:"center", padding:"0 14px", lineHeight:1.3 }}>{p.name}</span>
        </div>
        {p.badge && <div style={{ position:"absolute", top:12, left:12 }}><Bdg label={p.badge}/></div>}
        {hov && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:14, background:"rgba(255,255,255,0.96)", animation:"slideUp 0.2s ease" }}>
            <Btn full onClick={e=>{e.stopPropagation();onAdd(p);}} style={{ borderRadius:R.lg, padding:"12px" }}>Quick Add</Btn>
          </div>
        )}
      </div>
      <div onClick={()=>onSelect(p)}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
          <p style={{ fontSize:13, fontWeight:500, color:C.text, flex:1, paddingRight:8 }}>{p.name}</p>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            {p.was && <p style={{ fontSize:10, color:C.muted, textDecoration:"line-through" }}>{$(p.was)}</p>}
            <p style={{ fontSize:13, fontWeight:600, color:p.was?C.red:C.text }}>{$(p.price)}</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          <Stars r={p.rating}/>
          <span style={{ fontSize:11, color:C.muted }}>({p.reviews})</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Drawer ───────────────────────────────────── */
function CartDrawer({ cart, onClose, onRemove, onQty }) {
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const free  = total>=200;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:300, animation:"fadeIn 0.2s ease", backdropFilter:"blur(4px)" }}/>
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(420px,100vw)", background:C.surface, zIndex:400, display:"flex", flexDirection:"column", animation:"slideInR 0.3s cubic-bezier(.4,0,.2,1)", borderRadius:`${R.xl}px 0 0 ${R.xl}px`, boxShadow:shadow.xl }}>
        <div style={{ padding:"24px 24px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${C.border}` }}>
          <div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500 }}>Cart</p>
            <p style={{ fontSize:12, color:C.muted, marginTop:2 }}>{cart.reduce((s,i)=>s+i.qty,0)} items</p>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:"50%", background:C.s2, border:"none", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted }}>✕</button>
        </div>
        {!free && (
          <div style={{ padding:"12px 24px", background:C.s2 }}>
            <p style={{ fontSize:11, color:C.muted, marginBottom:6 }}>Add {$(200-total)} more for free shipping</p>
            <div style={{ height:4, background:C.s3, borderRadius:R.full }}>
              <div style={{ height:"100%", width:`${Math.min((total/200)*100,100)}%`, background:C.accent, borderRadius:R.full, transition:"width 0.3s" }}/>
            </div>
          </div>
        )}
        {free && <div style={{ padding:"12px 24px", background:"#e6f4ec" }}><p style={{ fontSize:11, color:C.green, fontWeight:500 }}>✓ Free shipping applied!</p></div>}
        <div style={{ flex:1, overflowY:"auto", padding:"8px 24px" }}>
          {cart.length===0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:14 }}>
              <div style={{ width:72, height:72, borderRadius:R.xl, background:C.s2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>🛍</div>
              <p style={{ fontSize:14, color:C.muted }}>Your cart is empty</p>
              <Btn variant="light" onClick={onClose}>Continue Shopping</Btn>
            </div>
          ) : cart.map((item,i)=>(
            <div key={`${item.id}-${item.sz}`}>
              <div style={{ padding:"18px 0", display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:76, height:96, background:item.grad, borderRadius:R.lg, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontStyle:"italic", color:"rgba(255,255,255,0.6)" }}>{item.name[0]}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:500, marginBottom:3 }}>{item.name}</p>
                  <p style={{ fontSize:11, color:C.muted, marginBottom:12 }}>Size: {item.sz}</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", background:C.s2, borderRadius:R.full, overflow:"hidden" }}>
                      <button onClick={()=>onQty(item,item.qty-1)} style={{ width:32, height:32, background:"none", border:"none", cursor:"pointer", fontSize:16, color:C.text, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                      <span style={{ fontSize:13, minWidth:20, textAlign:"center", fontWeight:500 }}>{item.qty}</span>
                      <button onClick={()=>onQty(item,item.qty+1)} style={{ width:32, height:32, background:"none", border:"none", cursor:"pointer", fontSize:16, color:C.text, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                    </div>
                    <p style={{ fontSize:13, fontWeight:600 }}>{$(item.price*item.qty)}</p>
                  </div>
                </div>
                <button onClick={()=>onRemove(item)} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:14, padding:4 }}>✕</button>
              </div>
              {i<cart.length-1&&<Divider/>}
            </div>
          ))}
        </div>
        {cart.length>0 && (
          <div style={{ padding:"20px 24px", borderTop:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontSize:13, color:C.muted }}>Subtotal</span><span style={{ fontSize:13 }}>{$(total)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}><span style={{ fontSize:13, color:C.muted }}>Shipping</span><span style={{ fontSize:13, color:free?C.green:C.text }}>{free?"Free":$(12)}</span></div>
            <Divider/>
            <div style={{ display:"flex", justifyContent:"space-between", margin:"14px 0 18px" }}><span style={{ fontSize:15, fontWeight:600 }}>Total</span><span style={{ fontSize:15, fontWeight:700 }}>{$(free?total:total+12)}</span></div>
            <Btn full style={{ padding:"16px", borderRadius:R.lg }}>Checkout →</Btn>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Product Detail ────────────────────────────────── */
function ProductDetail({ p, onBack, onAdd }) {
  const [ci,setCi] = useState(0);
  const [sz,setSz] = useState(null);
  const [done,setDone] = useState(false);
  const add = () => {
    if(!sz) return;
    onAdd({...p, selectedColor:p.colors[ci], sz});
    setDone(true); setTimeout(()=>setDone(false),2000);
  };
  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:13, fontFamily:"'DM Sans',sans-serif", padding:"0 0 20px", fontWeight:500 }}>← Back</button>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:40 }}>
        <div style={{ position:"relative", aspectRatio:"3/4", background:p.grad, borderRadius:R.xl, overflow:"hidden", boxShadow:shadow.lg, display:"flex", alignItems:"center", justifyContent:"center" }}>
          {p.badge&&<div style={{ position:"absolute", top:16, left:16 }}><Bdg label={p.badge}/></div>}
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:48, fontWeight:400, fontStyle:"italic", color:"rgba(255,255,255,0.42)", textAlign:"center", padding:"0 20px", lineHeight:1.3 }}>{p.name}</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          <div>
            <p style={{ fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10 }}>{p.cat}</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:500, lineHeight:1.2, marginBottom:12 }}>{p.name}</h1>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}><Stars r={p.rating}/><span style={{ fontSize:12, color:C.muted }}>{p.rating} · {p.reviews} reviews</span></div>
            <div style={{ display:"flex", alignItems:"baseline", gap:12 }}>
              <p style={{ fontSize:26, fontWeight:700, color:p.was?C.red:C.text }}>{$(p.price)}</p>
              {p.was&&<p style={{ fontSize:16, color:C.muted, textDecoration:"line-through" }}>{$(p.was)}</p>}
            </div>
          </div>
          <Divider/>
          <div>
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12, color:C.muted }}>Colour</p>
            <div style={{ display:"flex", gap:10 }}>{p.colors.map((col,i)=><CDot key={i} color={col} selected={ci===i} onClick={()=>setCi(i)}/>)}</div>
          </div>
          <div>
            <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:12, color:C.muted }}>
              Size {!sz&&<span style={{ color:C.red, fontWeight:400, textTransform:"none", fontSize:11 }}>— select one</span>}
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>{p.sizes.map(s=><SBtn key={s} size={s} selected={sz===s} onClick={()=>setSz(s)}/>)}</div>
          </div>
          <Btn full onClick={add} style={{ padding:"16px", borderRadius:R.lg, opacity:sz?1:0.55 }}>
            {done?"✓ Added to Cart":"Add to Cart"}
          </Btn>
          <Divider/>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[["Description",p.desc],["Material",p.material],["Care",p.care]].map(([label,val])=>(
              <div key={label}>
                <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:C.muted, marginBottom:6 }}>{label}</p>
                <p style={{ fontSize:14, color:C.muted, lineHeight:1.7 }}>{val}</p>
              </div>
            ))}
          </div>
          <Card style={{ padding:16, background:C.s2, border:"none" }}>
            <p style={{ fontSize:13, color:C.muted, marginBottom:6 }}>✓ Free shipping on orders over $200</p>
            <p style={{ fontSize:13, color:C.muted }}>✓ Free returns within 30 days</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── Search ────────────────────────────────────────── */
function SearchScreen({ products, onSelect, onAdd }) {
  const [q,setQ] = useState("");
  const res = useMemo(()=>q.trim().length<2?[]:products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.cat.toLowerCase().includes(q.toLowerCase())),[q]);
  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ position:"relative", marginBottom:28 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search pieces…" autoFocus
          style={{ width:"100%", padding:"16px 20px 16px 48px", fontSize:15, background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:R.full, outline:"none", color:C.text, boxShadow:shadow.sm, boxSizing:"border-box" }}/>
        <span style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-50%)", fontSize:18, color:C.muted }}>⌕</span>
      </div>
      {q.length<2 ? (
        <div>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:C.muted, marginBottom:14 }}>Trending</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {["Linen","Cashmere","Trench","Silk dress","Merino","Blazer"].map(t=><Tag key={t} onClick={()=>setQ(t)}>{t}</Tag>)}
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize:12, color:C.muted, marginBottom:20 }}>{res.length} result{res.length!==1?"s":""} for "<strong>{q}</strong>"</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"32px 16px" }}>
            {res.map(p=><PCard key={p.id} p={p} onSelect={onSelect} onAdd={onAdd}/>)}
          </div>
          {res.length===0&&<div style={{ textAlign:"center", padding:"60px 0" }}><p style={{ fontSize:36, marginBottom:12 }}>🔍</p><p style={{ fontSize:14, color:C.muted }}>No results for "{q}"</p></div>}
        </div>
      )}
    </div>
  );
}

/* ─── Shop ──────────────────────────────────────────── */
function ShopScreen({ products, onSelect, onAdd }) {
  const [cat,setCat] = useState("All");
  const [sort,setSort] = useState("featured");
  const filtered = useMemo(()=>{
    let p=cat==="All"?products:products.filter(x=>x.cat===cat);
    if(sort==="low")    p=[...p].sort((a,b)=>a.price-b.price);
    if(sort==="high")   p=[...p].sort((a,b)=>b.price-a.price);
    if(sort==="rating") p=[...p].sort((a,b)=>b.rating-a.rating);
    return p;
  },[cat,sort,products]);
  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>Collection</p>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:500, lineHeight:1.1 }}>All Pieces</h1>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{CATS.map(c=><Tag key={c} active={cat===c} onClick={()=>setCat(c)}>{c}</Tag>)}</div>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{ fontSize:12, color:C.muted, background:C.surface, border:`1px solid ${C.border}`, padding:"9px 16px", borderRadius:R.full, cursor:"pointer", outline:"none" }}>
          <option value="featured">Featured</option><option value="low">Price: Low–High</option>
          <option value="high">Price: High–Low</option><option value="rating">Top Rated</option>
        </select>
      </div>
      <p style={{ fontSize:12, color:C.muted, marginBottom:24 }}>{filtered.length} pieces</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"40px 20px" }}>
        {filtered.map(p=><PCard key={p.id} p={p} onSelect={onSelect} onAdd={onAdd}/>)}
      </div>
    </div>
  );
}

/* ─── Orders ────────────────────────────────────────── */
function OrdersScreen() {
  const [sel,setSel] = useState(null);
  if(sel) return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <button onClick={()=>setSel(null)} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:13, fontFamily:"'DM Sans',sans-serif", padding:"0 0 20px", fontWeight:500 }}>← Orders</button>
      <Card style={{ padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
          <div><p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, marginBottom:4 }}>{sel.id}</p><p style={{ fontSize:12, color:C.muted }}>{sel.date} · {sel.items.join(", ")}</p></div>
          <Pill status={sel.status}/>
        </div>
        <div style={{ position:"relative", paddingLeft:30 }}>
          <div style={{ position:"absolute", left:9, top:8, bottom:8, width:2, background:C.border, borderRadius:2 }}/>
          {sel.steps.map((step,i)=>(
            <div key={i} style={{ position:"relative", paddingBottom:i<sel.steps.length-1?24:0 }}>
              <div style={{ position:"absolute", left:-25, top:1, width:16, height:16, borderRadius:"50%", background:step.ok?C.accent:C.border, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:step.ok?shadow.sm:"none" }}>
                {step.ok&&<span style={{ color:"#fff", fontSize:8, fontWeight:700 }}>✓</span>}
              </div>
              <p style={{ fontSize:13, fontWeight:step.ok?500:400, color:step.ok?C.text:C.muted }}>{step.l}</p>
              {step.d&&<p style={{ fontSize:11, color:C.muted, marginTop:2 }}>{step.d}</p>}
            </div>
          ))}
        </div>
        <Divider my={20}/>
        <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:14, fontWeight:500 }}>Order Total</span><span style={{ fontSize:14, fontWeight:700 }}>{$(sel.total)}</span></div>
      </Card>
    </div>
  );
  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>Account</p>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:500 }}>Your Orders</h1>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {ORDERS.map(o=>(
          <Card key={o.id} onClick={()=>setSel(o)} style={{ padding:22, cursor:"pointer" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div><p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:500, marginBottom:3 }}>{o.id}</p><p style={{ fontSize:12, color:C.muted }}>{o.date}</p></div>
              <Pill status={o.status}/>
            </div>
            <p style={{ fontSize:13, color:C.muted, marginBottom:12 }}>{o.items.join(", ")}</p>
            <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:13, fontWeight:600 }}>{$(o.total)}</span><span style={{ fontSize:12, color:C.muted }}>View →</span></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── Account ───────────────────────────────────────── */
function AccountScreen({ onNavigate }) {
  const rows=[{icon:"📦",label:"Your Orders",sub:"Track and manage",go:"orders"},{icon:"♡",label:"Wishlist",sub:"14 saved items",go:null},{icon:"📍",label:"Addresses",sub:"2 saved addresses",go:null},{icon:"💳",label:"Payment",sub:"Visa ····4242",go:null},{icon:"⚙️",label:"Settings",sub:"Notifications, privacy",go:null},{icon:"↩️",label:"Returns",sub:"Start a return",go:null}];
  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <Card style={{ padding:0, marginBottom:24, overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(145deg,#e8e0d5,#d4c9b8)", padding:"32px 24px 24px" }}>
          <div style={{ width:68, height:68, borderRadius:"50%", background:C.surface, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:26, color:C.muted, boxShadow:shadow.md, marginBottom:16 }}>A</div>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500 }}>Alex Johnson</p>
          <p style={{ fontSize:13, color:"rgba(28,28,26,0.55)", marginTop:4 }}>alex@example.com · Member since 2023</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderTop:`1px solid ${C.border}` }}>
          {[["142","Following"],["38","Followers"],["12","Playlists"]].map(([v,l],i)=>(
            <div key={l} style={{ textAlign:"center", padding:"16px 8px", borderRight:i<2?`1px solid ${C.border}`:"none" }}>
              <p style={{ fontSize:18, fontWeight:700, color:C.text }}>{v}</p>
              <p style={{ fontSize:11, color:C.muted, marginTop:2 }}>{l}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        {rows.map((row,i)=>(
          <div key={row.label}>
            <div onClick={()=>row.go&&onNavigate(row.go)} style={{ display:"flex", alignItems:"center", gap:16, padding:"18px 20px", cursor:row.go?"pointer":"default" }}>
              <div style={{ width:40, height:40, borderRadius:R.md, background:C.s2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{row.icon}</div>
              <div style={{ flex:1 }}><p style={{ fontSize:14, fontWeight:500, color:C.text }}>{row.label}</p><p style={{ fontSize:12, color:C.muted, marginTop:1 }}>{row.sub}</p></div>
              <span style={{ color:C.muted, fontSize:16 }}>›</span>
            </div>
            {i<rows.length-1&&<Divider/>}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ─── Home ──────────────────────────────────────────── */
function HomeScreen({ products, onNavigate, onSelect, onAdd }) {
  const newIn  = products.filter(p=>p.badge==="New").slice(0,4);
  const onSale = products.filter(p=>p.badge==="Sale").slice(0,3);
  const cats   = CATS.slice(1);
  const grads  = ["linear-gradient(145deg,#f0ece4,#e0d8cc)","linear-gradient(145deg,#d8e4f0,#c8d5e5)","linear-gradient(145deg,#f0e4d8,#e0d0c0)","linear-gradient(145deg,#dedad4,#ccc4b8)","linear-gradient(145deg,#f0e8e0,#e0d5c8)","linear-gradient(145deg,#d8d0c8,#c8c0b5)"];
  return (
    <div style={{ animation:"fadeIn 0.35s ease" }}>
      {/* Hero */}
      <Card style={{ padding:"56px 40px", marginBottom:40, background:"linear-gradient(145deg,#ede8e0 0%,#d8cfc4 60%,#ccc4b8 100%)", border:"none", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-40, top:-40, width:280, height:280, background:"rgba(255,255,255,0.18)", borderRadius:"50%" }}/>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(28,28,26,0.45)", marginBottom:14 }}>SS26 Collection</p>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(30px,5vw,56px)", fontWeight:400, fontStyle:"italic", lineHeight:1.1, color:"rgba(28,28,26,0.8)", marginBottom:18, maxWidth:420 }}>Dressed for the in-between</h1>
        <p style={{ fontSize:14, color:"rgba(28,28,26,0.5)", marginBottom:28, maxWidth:320, lineHeight:1.75 }}>Refined pieces for modern living. Timeless materials, considered details.</p>
        <Btn onClick={()=>onNavigate("shop")} style={{ borderRadius:R.lg }}>Shop Collection</Btn>
      </Card>

      {/* Category pills */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:10, marginBottom:48 }}>
        {cats.map((cat,i)=>(
          <button key={cat} onClick={()=>onNavigate("shop")} style={{ background:grads[i], borderRadius:R.lg, padding:"20px 12px", cursor:"pointer", border:"none", textAlign:"left", fontFamily:"'DM Sans',sans-serif", boxShadow:shadow.sm }}>
            <p style={{ fontSize:12, fontWeight:500, color:C.text }}>{cat}</p>
            <p style={{ fontSize:10, color:C.muted, marginTop:3 }}>Shop →</p>
          </button>
        ))}
      </div>

      {/* New In */}
      <section style={{ marginBottom:48 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:500 }}>New In</h2>
          <button onClick={()=>onNavigate("shop")} style={{ fontSize:12, color:C.muted, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", fontFamily:"'DM Sans',sans-serif" }}>View all</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"36px 16px" }}>
          {newIn.map(p=><PCard key={p.id} p={p} onSelect={onSelect} onAdd={onAdd}/>)}
        </div>
      </section>

      {/* Banner */}
      <Card style={{ padding:"36px 32px", marginBottom:48, background:C.accent, border:"none", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:18 }}>
        <div>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:400, color:"#fff", marginBottom:6 }}>Free shipping over $200</p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.55)" }}>On all orders. Free returns within 30 days.</p>
        </div>
        <Btn onClick={()=>onNavigate("shop")} style={{ background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius:R.lg }}>Shop Now</Btn>
      </Card>

      {/* Sale */}
      {onSale.length>0&&(
        <section style={{ marginBottom:48 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:20 }}>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:500 }}>On Sale</h2>
            <button onClick={()=>onNavigate("shop")} style={{ fontSize:12, color:C.muted, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", fontFamily:"'DM Sans',sans-serif" }}>View all</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"36px 16px" }}>
            {onSale.map(p=><PCard key={p.id} p={p} onSelect={onSelect} onAdd={onAdd}/>)}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ borderTop:`1px solid ${C.border}`, paddingTop:36, paddingBottom:100, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:28 }}>
        {[{title:"AVEN",links:["Our Story","Sustainability","Careers","Press"]},{title:"Help",links:["Size Guide","Shipping","Returns","Contact"]},{title:"Legal",links:["Privacy","Terms","Cookies"]}].map(col=>(
          <div key={col.title}><p style={{ fontFamily:"'Playfair Display',serif", fontSize:15, marginBottom:12 }}>{col.title}</p>{col.links.map(l=><p key={l} style={{ fontSize:12, color:C.muted, marginBottom:8, cursor:"pointer" }}>{l}</p>)}</div>
        ))}
      </footer>
    </div>
  );
}

/* ─── Top Navbar ────────────────────────────────────── */
function Navbar({ cartCount, onCart, onNavigate, canGoBack, onBack }) {
  return (
    <header style={{ background:"rgba(248,247,244,0.94)", backdropFilter:"blur(14px)", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          {canGoBack&&(
            <button onClick={onBack} style={{ width:36, height:36, borderRadius:"50%", background:C.s2, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:16, marginRight:8 }}>←</button>
          )}
          <button onClick={()=>onNavigate("home")} style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:500, letterSpacing:3, background:"none", border:"none", cursor:"pointer", color:C.text }}>AVEN</button>
        </div>
        <nav style={{ display:"flex", gap:4, position:"absolute", left:"50%", transform:"translateX(-50%)" }}>
          {[["Shop","shop"],["Search","search"],["Account","account"]].map(([l,s])=>(
            <button key={s} onClick={()=>onNavigate(s)} style={{ fontSize:12, fontWeight:500, letterSpacing:"0.06em", textTransform:"uppercase", background:"none", border:"none", cursor:"pointer", color:C.muted, fontFamily:"'DM Sans',sans-serif", padding:"6px 14px", borderRadius:R.full }}>{l}</button>
          ))}
        </nav>
        <button onClick={onCart} style={{ position:"relative", background:C.surface, border:`1px solid ${C.border}`, borderRadius:R.full, padding:"8px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:8, boxShadow:shadow.sm }}>
          <span style={{ fontSize:15 }}>🛍</span>
          {cartCount>0&&<span style={{ fontSize:12, fontWeight:600, color:C.text }}>{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}

/* ─── Mobile Bottom Nav ─────────────────────────────── */
function BottomNav({ screen, onNavigate, cartCount, onCart }) {
  const items=[{icon:"⊞",label:"Shop",s:"shop"},{icon:"⌕",label:"Search",s:"search"},{icon:"🛍",label:"Cart",s:"cart",cart:true},{icon:"⊙",label:"Account",s:"account"}];
  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(16px)", borderTop:`1px solid ${C.border}`, display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom)", boxShadow:"0 -4px 24px rgba(0,0,0,0.07)" }}>
      {items.map(item=>{
        const active=screen===item.s;
        return (
          <button key={item.label} onClick={()=>item.cart?onCart():onNavigate(item.s)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"10px 0 8px", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:9.5, fontWeight:500, letterSpacing:"0.04em", color:active?C.accent:C.muted, position:"relative", transition:"color 0.15s" }}>
            <div style={{ position:"relative" }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              {item.cart&&cartCount>0&&<span style={{ position:"absolute", top:-4, right:-7, width:16, height:16, borderRadius:"50%", background:C.red, color:"#fff", fontSize:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{cartCount}</span>}
            </div>
            <span>{item.label}</span>
            {active&&<div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:24, height:3, background:C.accent, borderRadius:R.full }}/>}
          </button>
        );
      })}
    </nav>
  );
}

/* ─── Root App ──────────────────────────────────────── */
export default function Page() {
  const [history,setHistory]   = useState([{screen:"home"}]);
  const [cart,setCart]         = useState([]);
  const [cartOpen,setCartOpen] = useState(false);

  const current   = history[history.length-1];
  const canGoBack = history.length>1;

  const navigate = (screen,data=null) => {
    window.history.pushState({idx:history.length},"");
    setHistory(prev=>[...prev,{screen,data}]);
    setTimeout(()=>{ const el=document.getElementById("__scroll"); if(el) el.scrollTop=0; },10);
  };

  const goBack = () => {
    setHistory(prev=>prev.length>1?prev.slice(0,-1):prev);
    setTimeout(()=>{ const el=document.getElementById("__scroll"); if(el) el.scrollTop=0; },10);
  };

  /* Physical back button + browser back */
  useEffect(()=>{
    const handler=()=>{ if(cartOpen){setCartOpen(false);return;} goBack(); };
    window.addEventListener("popstate",handler);
    return ()=>window.removeEventListener("popstate",handler);
  },[history,cartOpen]);

  const addToCart = p => {
    setCart(prev=>{
      const key=`${p.id}-${p.sz}`;
      const ex=prev.find(i=>`${i.id}-${i.sz}`===key);
      if(ex) return prev.map(i=>`${i.id}-${i.sz}`===key?{...i,qty:i.qty+1}:i);
      return [...prev,{...p,qty:1}];
    });
    setCartOpen(true);
  };
  const quickAdd       = p=>addToCart({...p,sz:p.sizes[0]});
  const removeFromCart = item=>setCart(prev=>prev.filter(i=>!(i.id===item.id&&i.sz===item.sz)));
  const updateQty      = (item,qty)=>{ if(qty<1){removeFromCart(item);return;} setCart(prev=>prev.map(i=>i.id===item.id&&i.sz===item.sz?{...i,qty}:i)); };
  const cartCount      = cart.reduce((s,i)=>s+i.qty,0);

  const sp = {onSelect:p=>navigate("product",p), onAdd:quickAdd};

  const renderScreen = () => {
    const {screen,data}=current;
    if(screen==="home")    return <HomeScreen    products={PRODUCTS} onNavigate={navigate} {...sp}/>;
    if(screen==="shop")    return <ShopScreen    products={PRODUCTS} {...sp}/>;
    if(screen==="product") return <ProductDetail p={data} onBack={goBack} onAdd={addToCart}/>;
    if(screen==="search")  return <SearchScreen  products={PRODUCTS} {...sp}/>;
    if(screen==="account") return <AccountScreen onNavigate={navigate}/>;
    if(screen==="orders")  return <OrdersScreen/>;
    return <HomeScreen products={PRODUCTS} onNavigate={navigate} {...sp}/>;
  };

  return (
    <>
      <G/>
      <div style={{ height:"100dvh", display:"flex", flexDirection:"column", background:C.bg, fontFamily:"'DM Sans',sans-serif" }}>
        <Navbar cartCount={cartCount} onCart={()=>setCartOpen(true)} onNavigate={navigate} canGoBack={canGoBack} onBack={goBack}/>
        <div id="__scroll" style={{ flex:1, overflowY:"auto" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 20px 120px" }}>
            {renderScreen()}
          </div>
        </div>
        <BottomNav screen={current.screen} onNavigate={navigate} cartCount={cartCount} onCart={()=>setCartOpen(true)}/>
        {cartOpen&&<CartDrawer cart={cart} onClose={()=>setCartOpen(false)} onRemove={removeFromCart} onQty={updateQty}/>}
      </div>
    </>
  );
}
