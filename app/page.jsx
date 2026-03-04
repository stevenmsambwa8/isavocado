import { useState, useEffect, useMemo } from "react";

const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    * { -webkit-tap-highlight-color: transparent; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-thumb { background: #e0ddd8; border-radius: 2px; }
    input, button { font-family: 'Jost', sans-serif; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
  `}</style>
);

const PRODUCTS = [
  { id:1,  name:"Linen Overshirt",   category:"Tops",    price:148, originalPrice:null, badge:null,   colors:["#e8e0d5","#2c2c2a","#8b7355"], sizes:["XS","S","M","L","XL"], rating:4.8, reviews:124, description:"Relaxed-fit overshirt crafted from premium Belgian linen. Features a classic collar, chest pockets, and a slightly oversized silhouette.", material:"100% Belgian Linen", care:"Machine wash cold.", gradient:"linear-gradient(135deg,#e8e0d5,#d4c9b8)" },
  { id:2,  name:"Merino Turtleneck", category:"Tops",    price:195, originalPrice:null, badge:"New",  colors:["#f0ece4","#1a1a18","#8c6b4a"], sizes:["XS","S","M","L"],     rating:4.9, reviews:89,  description:"Ultra-fine merino wool turtleneck with a slim, elegant fit.", material:"100% Extra-fine Merino Wool", care:"Hand wash cold.", gradient:"linear-gradient(135deg,#f0ece4,#ddd4c5)" },
  { id:3,  name:"Wide-Leg Trousers", category:"Bottoms", price:228, originalPrice:285,  badge:"Sale", colors:["#d4cfc8","#3d3830","#c4a882"], sizes:["XS","S","M","L","XL"], rating:4.7, reviews:203, description:"Tailored wide-leg trousers with a high waist and clean drape.", material:"68% Viscose, 28% Polyamide, 4% Elastane", care:"Dry clean.", gradient:"linear-gradient(135deg,#d4cfc8,#bfb8ae)" },
  { id:4,  name:"Cashmere Cardigan", category:"Tops",    price:345, originalPrice:null, badge:"New",  colors:["#e2ddd6","#6b5e4e","#2c2c2a"], sizes:["XS","S","M","L"],     rating:5.0, reviews:57,  description:"Hand-finished cardigan in Grade-A cashmere.", material:"100% Grade-A Cashmere", care:"Dry clean only.", gradient:"linear-gradient(135deg,#f5f0e8,#e2ddd6)" },
  { id:5,  name:"Silk Slip Dress",   category:"Dresses", price:268, originalPrice:null, badge:null,   colors:["#e8d5c4","#1a1a18","#8b7355"], sizes:["XS","S","M","L"],     rating:4.6, reviews:178, description:"Fluid silk charmeuse slip dress with adjustable straps.", material:"100% Silk Charmeuse", care:"Dry clean only.", gradient:"linear-gradient(135deg,#f0e8de,#e0d0c0)" },
  { id:6,  name:"Tailored Blazer",   category:"Outerwear",price:420,originalPrice:null, badge:null,   colors:["#2c2c2a","#8c7355","#e0dbd2"], sizes:["XS","S","M","L","XL"], rating:4.9, reviews:94,  description:"Single-breasted blazer in fine Italian wool blend.", material:"78% Wool, 18% Silk, 4% Cashmere", care:"Dry clean only.", gradient:"linear-gradient(135deg,#d8d3cc,#c8c0b5)" },
  { id:7,  name:"Cropped Tank",      category:"Tops",    price:68,  originalPrice:null, badge:null,   colors:["#f0ece4","#1a1a18","#c4a882","#8b7355"], sizes:["XS","S","M","L","XL"], rating:4.5, reviews:312, description:"Ribbed cotton tank with a cropped length.", material:"95% Pima Cotton, 5% Elastane", care:"Machine wash cold.", gradient:"linear-gradient(135deg,#f5f2ec,#e8e3da)" },
  { id:8,  name:"Barrel Jeans",      category:"Bottoms", price:185, originalPrice:null, badge:"New",  colors:["#6b8ab5","#2c2c2a","#8b7355"], sizes:["24","25","26","27","28","29","30"], rating:4.7, reviews:145, description:"Relaxed barrel-leg jeans in Japanese selvedge denim.", material:"98% Cotton, 2% Elastane", care:"Machine wash cold.", gradient:"linear-gradient(135deg,#d8e4f0,#c8d5e5)" },
  { id:9,  name:"Wrap Midi Skirt",   category:"Bottoms", price:158, originalPrice:198,  badge:"Sale", colors:["#c4a882","#2c2c2a","#e8d5c4"], sizes:["XS","S","M","L"],     rating:4.8, reviews:201, description:"Fluid wrap skirt in lightweight viscose crepe.", material:"100% Viscose Crepe", care:"Hand wash cold.", gradient:"linear-gradient(135deg,#ede5d8,#ddd0be)" },
  { id:10, name:"Trench Coat",       category:"Outerwear",price:545,originalPrice:null, badge:null,   colors:["#c4a882","#2c2c2a","#e8e0d5"], sizes:["XS","S","M","L","XL"], rating:4.9, reviews:78,  description:"Classic double-breasted trench in water-resistant cotton.", material:"100% Cotton Gabardine", care:"Dry clean only.", gradient:"linear-gradient(135deg,#e8ddd0,#d8cebe)" },
  { id:11, name:"Knit Co-ord Set",   category:"Sets",    price:295, originalPrice:null, badge:"New",  colors:["#e8e0d5","#6b5e4e"], sizes:["XS","S","M","L"],     rating:4.8, reviews:43,  description:"Matching merino knit top and trouser set.", material:"80% Merino Wool, 20% Cashmere", care:"Hand wash cold.", gradient:"linear-gradient(135deg,#f0e8e0,#e0d5c8)" },
  { id:12, name:"Leather Belt",      category:"Accessories",price:88,originalPrice:null,badge:null,   colors:["#2c2c2a","#8b7355","#c4a882"], sizes:["XS","S","M","L"],     rating:4.6, reviews:167, description:"Full-grain leather belt with minimalist buckle.", material:"100% Full-grain Leather", care:"Leather conditioner.", gradient:"linear-gradient(135deg,#d8d0c8,#c8c0b5)" },
];

const CATEGORIES = ["All","Tops","Bottoms","Dresses","Outerwear","Sets","Accessories"];
const ORDERS = [
  { id:"ORD-2891", date:"Feb 28, 2026", status:"Delivered",  items:["Linen Overshirt","Cropped Tank"],   total:216, tracking:[{label:"Order placed",date:"Feb 20",done:true},{label:"Processing",date:"Feb 21",done:true},{label:"Shipped",date:"Feb 23",done:true},{label:"Out for delivery",date:"Feb 28",done:true},{label:"Delivered",date:"Feb 28",done:true}] },
  { id:"ORD-3104", date:"Mar 02, 2026", status:"In Transit", items:["Merino Turtleneck"],                total:195, tracking:[{label:"Order placed",date:"Mar 2",done:true},{label:"Processing",date:"Mar 2",done:true},{label:"Shipped",date:"Mar 3",done:true},{label:"Out for delivery",date:"",done:false},{label:"Delivered",date:"",done:false}] },
  { id:"ORD-3287", date:"Mar 04, 2026", status:"Processing", items:["Cashmere Cardigan","Leather Belt"], total:433, tracking:[{label:"Order placed",date:"Mar 4",done:true},{label:"Processing",date:"Mar 4",done:true},{label:"Shipped",date:"",done:false},{label:"Out for delivery",date:"",done:false},{label:"Delivered",date:"",done:false}] },
];

const T = { bg:"#fafaf8", surface:"#ffffff", s2:"#f5f2ed", border:"#e8e4de", text:"#1a1a18", muted:"#8c8880", accent:"#1a1a18", tag:"#f0ede8" };
const fmt = n => `$${n.toFixed(0)}`;

function Stars({ rating }) {
  return <span style={{fontSize:11,color:"#1a1a18",letterSpacing:1}}>{"★".repeat(Math.floor(rating))}{"☆".repeat(5-Math.floor(rating))}</span>;
}
function Badge({ label }) {
  if(!label) return null;
  return <span style={{fontSize:9,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",background:label==="Sale"?"#d4472a":"#1a1a18",color:"#fff",padding:"3px 8px",borderRadius:2}}>{label}</span>;
}
function Btn({ children, onClick, variant="primary", style={} }) {
  const base = {border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:500,letterSpacing:"0.05em",borderRadius:2,transition:"all 0.2s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8};
  const v = {primary:{background:T.accent,color:"#fff",padding:"14px 28px",fontSize:13},secondary:{background:"transparent",color:T.text,border:`1px solid ${T.border}`,padding:"13px 28px",fontSize:13},ghost:{background:"transparent",color:T.muted,padding:"8px 12px",fontSize:13},icon:{background:"transparent",color:T.text,padding:8,borderRadius:"50%"}};
  return <button onClick={onClick} style={{...base,...v[variant],...style}}>{children}</button>;
}
function Tag({ children, active, onClick }) {
  return <button onClick={onClick} style={{background:active?T.accent:T.tag,color:active?"#fff":T.muted,border:"none",cursor:"pointer",padding:"8px 18px",borderRadius:2,fontSize:12,fontWeight:500,letterSpacing:"0.04em",fontFamily:"'Jost',sans-serif",transition:"all 0.18s",whiteSpace:"nowrap"}}>{children}</button>;
}
function ColorDot({ color, selected, onClick }) {
  return <button onClick={onClick} style={{width:22,height:22,borderRadius:"50%",background:color,border:selected?`2px solid ${T.accent}`:"2px solid transparent",outline:selected?`1px solid ${T.accent}`:"none",outlineOffset:2,cursor:"pointer",transition:"all 0.15s"}} />;
}
function SizeBtn({ size, selected, onClick }) {
  return <button onClick={onClick} style={{minWidth:42,height:36,padding:"0 10px",background:selected?T.accent:"transparent",color:selected?"#fff":T.muted,border:`1px solid ${selected?T.accent:T.border}`,borderRadius:2,cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'Jost',sans-serif",transition:"all 0.15s"}}>{size}</button>;
}
function Divider() { return <div style={{height:1,background:T.border}} />; }
function StatusPill({ status }) {
  const map={Delivered:["#e8f5ee","#2d6a4f"],"In Transit":["#e8f0fb","#2a52a0"],Processing:["#fef5e8","#a0662a"]};
  const [bg,col]=map[status]||[T.tag,T.muted];
  return <span style={{fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",background:bg,color:col,padding:"4px 10px",borderRadius:2}}>{status}</span>;
}

function ProductCard({ product, onSelect, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{cursor:"pointer",animation:"fadeUp 0.5s ease both"}}>
      <div onClick={()=>onSelect(product)} style={{position:"relative",aspectRatio:"3/4",background:product.gradient,borderRadius:4,overflow:"hidden",marginBottom:14}}>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:300,color:"rgba(255,255,255,0.55)",letterSpacing:2,textAlign:"center",padding:"0 12px"}}>{product.name}</span>
        </div>
        {product.badge && <div style={{position:"absolute",top:12,left:12}}><Badge label={product.badge}/></div>}
        {hovered && (
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:12,background:"rgba(255,255,255,0.95)",animation:"fadeUp 0.2s ease"}}>
            <Btn onClick={e=>{e.stopPropagation();onAddToCart(product);}} style={{width:"100%",fontSize:12,padding:"12px"}}>Quick Add</Btn>
          </div>
        )}
      </div>
      <div onClick={()=>onSelect(product)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <p style={{fontSize:13,fontWeight:500,color:T.text,letterSpacing:"0.02em"}}>{product.name}</p>
          <div style={{textAlign:"right"}}>
            {product.originalPrice && <p style={{fontSize:11,color:T.muted,textDecoration:"line-through"}}>{fmt(product.originalPrice)}</p>}
            <p style={{fontSize:13,fontWeight:500,color:product.originalPrice?"#d4472a":T.text}}>{fmt(product.price)}</p>
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <Stars rating={product.rating}/>
          <span style={{fontSize:11,color:T.muted}}>({product.reviews})</span>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onRemove, onUpdateQty }) {
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:300,animation:"fadeIn 0.2s ease"}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:"min(400px,100%)",background:T.surface,zIndex:400,display:"flex",flexDirection:"column",animation:"slideIn 0.3s ease",boxShadow:"-8px 0 40px rgba(0,0,0,0.08)"}}>
        <div style={{padding:"24px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400}}>Your Cart</p>
            <p style={{fontSize:12,color:T.muted,marginTop:2}}>{cart.length} items</p>
          </div>
          <Btn variant="icon" onClick={onClose} style={{fontSize:18}}>✕</Btn>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"0 24px"}}>
          {cart.length===0 ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12}}>
              <span style={{fontSize:40}}>🛍</span>
              <p style={{fontSize:14,color:T.muted}}>Your cart is empty</p>
            </div>
          ) : cart.map((item,i)=>(
            <div key={`${item.id}-${item.selectedSize}`}>
              <div style={{padding:"18px 0",display:"flex",gap:14}}>
                <div style={{width:72,height:90,background:item.gradient,borderRadius:3,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"rgba(255,255,255,0.6)"}}>{item.name[0]}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:500,marginBottom:3}}>{item.name}</p>
                  <p style={{fontSize:11,color:T.muted,marginBottom:10}}>Size: {item.selectedSize}</p>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,border:`1px solid ${T.border}`,borderRadius:2}}>
                      <Btn variant="ghost" onClick={()=>onUpdateQty(item,item.qty-1)} style={{padding:"3px 10px",fontSize:16}}>−</Btn>
                      <span style={{fontSize:13,minWidth:16,textAlign:"center"}}>{item.qty}</span>
                      <Btn variant="ghost" onClick={()=>onUpdateQty(item,item.qty+1)} style={{padding:"3px 10px",fontSize:16}}>+</Btn>
                    </div>
                    <p style={{fontSize:13,fontWeight:500}}>{fmt(item.price*item.qty)}</p>
                  </div>
                </div>
                <Btn variant="ghost" onClick={()=>onRemove(item)} style={{padding:"0 4px",color:T.muted,alignSelf:"flex-start",fontSize:16}}>✕</Btn>
              </div>
              {i<cart.length-1&&<Divider/>}
            </div>
          ))}
        </div>
        {cart.length>0&&(
          <div style={{padding:24,borderTop:`1px solid ${T.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,color:T.muted}}>Subtotal</span><span style={{fontSize:13}}>{fmt(total)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,color:T.muted}}>Shipping</span><span style={{fontSize:13}}>{total>200?"Free":"$12"}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:18,paddingTop:12,borderTop:`1px solid ${T.border}`}}><span style={{fontSize:14,fontWeight:600}}>Total</span><span style={{fontSize:14,fontWeight:600}}>{fmt(total>200?total:total+12)}</span></div>
            {total>200&&<p style={{fontSize:11,color:"#2d6a4f",textAlign:"center",marginBottom:12}}>✓ Free shipping applied</p>}
            <Btn style={{width:"100%",padding:"15px",fontSize:13,letterSpacing:"0.08em"}}>Checkout</Btn>
          </div>
        )}
      </div>
    </>
  );
}

function ProductDetail({ product, onBack, onAddToCart }) {
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    if(!selectedSize) return;
    onAddToCart({...product,selectedColor:product.colors[selectedColor],selectedColorName:`Color ${selectedColor+1}`,selectedSize});
    setAdded(true); setTimeout(()=>setAdded(false),2000);
  };
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{padding:"16px 0 0"}}><Btn variant="ghost" onClick={onBack} style={{color:T.muted,padding:"8px 0",fontSize:13}}>← Back</Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:40,paddingTop:8}}>
        <div style={{aspectRatio:"3/4",background:product.gradient,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
          {product.badge&&<div style={{position:"absolute",top:16,left:16}}><Badge label={product.badge}/></div>}
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:52,fontWeight:300,color:"rgba(255,255,255,0.5)",textAlign:"center",padding:"0 16px"}}>{product.name}</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:22}}>
          <div>
            <p style={{fontSize:11,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>{product.category}</p>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:400,lineHeight:1.15,marginBottom:10}}>{product.name}</h1>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><Stars rating={product.rating}/><span style={{fontSize:12,color:T.muted}}>{product.rating} · {product.reviews} reviews</span></div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <p style={{fontSize:22,fontWeight:500,color:product.originalPrice?"#d4472a":T.text}}>{fmt(product.price)}</p>
              {product.originalPrice&&<p style={{fontSize:16,color:T.muted,textDecoration:"line-through"}}>{fmt(product.originalPrice)}</p>}
            </div>
          </div>
          <Divider/>
          <div>
            <p style={{fontSize:11,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10,color:T.muted}}>Colour</p>
            <div style={{display:"flex",gap:10}}>{product.colors.map((col,i)=><ColorDot key={i} color={col} selected={selectedColor===i} onClick={()=>setSelectedColor(i)}/>)}</div>
          </div>
          <div>
            <p style={{fontSize:11,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10,color:T.muted}}>Size</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{product.sizes.map(sz=><SizeBtn key={sz} size={sz} selected={selectedSize===sz} onClick={()=>setSelectedSize(sz)}/>)}</div>
            {!selectedSize&&<p style={{fontSize:11,color:T.muted,marginTop:8}}>Please select a size</p>}
          </div>
          <Btn onClick={handleAdd} style={{width:"100%",padding:"15px",fontSize:13,letterSpacing:"0.08em",opacity:selectedSize?1:0.5}}>{added?"✓ Added to Cart":"Add to Cart"}</Btn>
          <Divider/>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><p style={{fontSize:11,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6,color:T.muted}}>Description</p><p style={{fontSize:14,lineHeight:1.75,color:T.muted}}>{product.description}</p></div>
            <div><p style={{fontSize:11,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6,color:T.muted}}>Material</p><p style={{fontSize:14,color:T.muted}}>{product.material}</p></div>
            <div><p style={{fontSize:11,fontWeight:500,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6,color:T.muted}}>Care</p><p style={{fontSize:14,color:T.muted}}>{product.care}</p></div>
            <div style={{background:T.s2,borderRadius:4,padding:14}}>
              <p style={{fontSize:13,color:T.muted}}>✓ Free shipping on orders over $200</p>
              <p style={{fontSize:13,color:T.muted,marginTop:5}}>✓ Free returns within 30 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTracking() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:28}}>
        <p style={{fontSize:11,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Account</p>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:34,fontWeight:400}}>Your Orders</h1>
      </div>
      {!selected ? (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {ORDERS.map(order=>(
            <div key={order.id} onClick={()=>setSelected(order)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:4,padding:22,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:400,marginBottom:3}}>{order.id}</p><p style={{fontSize:12,color:T.muted}}>{order.date}</p></div><StatusPill status={order.status}/></div>
              <p style={{fontSize:13,color:T.muted,marginBottom:10}}>{order.items.join(", ")}</p>
              <div style={{display:"flex",justifyContent:"space-between"}}><p style={{fontSize:13,fontWeight:500}}>{fmt(order.total)}</p><span style={{fontSize:12,color:T.muted}}>View details →</span></div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{animation:"fadeIn 0.3s ease"}}>
          <Btn variant="ghost" onClick={()=>setSelected(null)} style={{color:T.muted,padding:"8px 0",fontSize:13,marginBottom:20}}>← All Orders</Btn>
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:4,padding:26}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}><div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,marginBottom:3}}>{selected.id}</p><p style={{fontSize:13,color:T.muted}}>{selected.date} · {selected.items.join(", ")}</p></div><StatusPill status={selected.status}/></div>
            <div style={{position:"relative",paddingLeft:26}}>
              <div style={{position:"absolute",left:7,top:8,bottom:8,width:1,background:T.border}}/>
              {selected.tracking.map((step,i)=>(
                <div key={i} style={{position:"relative",paddingBottom:i<selected.tracking.length-1?24:0}}>
                  <div style={{position:"absolute",left:-22,top:2,width:13,height:13,borderRadius:"50%",background:step.done?T.accent:T.border,display:"flex",alignItems:"center",justifyContent:"center"}}>{step.done&&<span style={{color:"#fff",fontSize:7}}>✓</span>}</div>
                  <p style={{fontSize:13,fontWeight:step.done?500:400,color:step.done?T.text:T.muted}}>{step.label}</p>
                  {step.date&&<p style={{fontSize:11,color:T.muted,marginTop:1}}>{step.date}</p>}
                </div>
              ))}
            </div>
            <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:14,fontWeight:500}}>Order Total</span><span style={{fontSize:14,fontWeight:600}}>{fmt(selected.total)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function AccountPage({ onNavigate }) {
  const sections=[{label:"Your Orders",sub:"Track your orders",icon:"📦",action:"orders"},{label:"Wishlist",sub:"14 saved items",icon:"♡",action:null},{label:"Addresses",sub:"2 saved addresses",icon:"📍",action:null},{label:"Payment",sub:"Visa ending in 4242",icon:"💳",action:null},{label:"Settings",sub:"Notifications, privacy",icon:"⚙️",action:null}];
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{background:"linear-gradient(135deg,#e8e0d5,#d4c9b8)",borderRadius:4,padding:"36px 28px",marginBottom:32,display:"flex",alignItems:"center",gap:20}}>
        <div style={{width:66,height:66,borderRadius:"50%",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:T.muted,boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>A</div>
        <div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400}}>Alex Johnson</p><p style={{fontSize:13,color:T.muted,marginTop:3}}>alex@example.com · Member since 2023</p></div>
      </div>
      <div style={{display:"flex",flexDirection:"column"}}>
        {sections.map((s,i)=>(
          <div key={s.label}>
            <div onClick={()=>s.action&&onNavigate(s.action)} style={{display:"flex",alignItems:"center",gap:16,padding:"18px 4px",cursor:s.action?"pointer":"default"}}>
              <span style={{fontSize:20,width:34,textAlign:"center"}}>{s.icon}</span>
              <div style={{flex:1}}><p style={{fontSize:14,fontWeight:500}}>{s.label}</p><p style={{fontSize:12,color:T.muted,marginTop:2}}>{s.sub}</p></div>
              <span style={{color:T.muted,fontSize:16}}>→</span>
            </div>
            {i<sections.length-1&&<Divider/>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShopScreen({ products, onSelect, onAddToCart }) {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const filtered = useMemo(()=>{
    let p = category==="All"?products:products.filter(x=>x.category===category);
    if(sort==="price-asc") p=[...p].sort((a,b)=>a.price-b.price);
    if(sort==="price-desc") p=[...p].sort((a,b)=>b.price-a.price);
    if(sort==="rating") p=[...p].sort((a,b)=>b.rating-a.rating);
    return p;
  },[category,sort,products]);
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:28}}><p style={{fontSize:11,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Collection</p><h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:36,fontWeight:300,lineHeight:1.1}}>All Pieces</h1></div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:14,marginBottom:28}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{CATEGORIES.map(cat=><Tag key={cat} active={category===cat} onClick={()=>setCategory(cat)}>{cat}</Tag>)}</div>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{fontSize:12,color:T.muted,background:"none",border:`1px solid ${T.border}`,padding:"8px 14px",borderRadius:2,cursor:"pointer",fontFamily:"'Jost',sans-serif",outline:"none"}}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
      <p style={{fontSize:12,color:T.muted,marginBottom:22}}>{filtered.length} pieces</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"36px 20px"}}>
        {filtered.map(p=><ProductCard key={p.id} product={p} onSelect={onSelect} onAddToCart={onAddToCart}/>)}
      </div>
    </div>
  );
}

function SearchScreen({ products, onSelect, onAddToCart }) {
  const [q, setQ] = useState("");
  const results = useMemo(()=>q.trim().length<2?[]:products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.category.toLowerCase().includes(q.toLowerCase())),[q]);
  return (
    <div style={{animation:"fadeIn 0.3s ease"}}>
      <div style={{marginBottom:28}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search for pieces…" autoFocus style={{width:"100%",padding:"12px 0",fontSize:26,fontFamily:"'Cormorant Garamond',serif",fontWeight:300,background:"none",border:"none",borderBottom:`2px solid ${T.accent}`,outline:"none",color:T.text}}/>
      </div>
      {q.length<2&&(
        <div>
          <p style={{fontSize:11,fontWeight:500,letterSpacing:"0.08em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>Trending</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{["Linen","Cashmere","Trench","Silk","Merino"].map(t=><Tag key={t} onClick={()=>setQ(t)}>{t}</Tag>)}</div>
        </div>
      )}
      {q.length>=2&&(
        <div>
          <p style={{fontSize:12,color:T.muted,marginBottom:18}}>{results.length} result{results.length!==1?"s":""} for "{q}"</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"32px 20px"}}>
            {results.map(p=><ProductCard key={p.id} product={p} onSelect={onSelect} onAddToCart={onAddToCart}/>)}
          </div>
          {results.length===0&&<p style={{fontSize:14,color:T.muted,textAlign:"center",marginTop:40}}>No results found.</p>}
        </div>
      )}
    </div>
  );
}

function HomeScreen({ products, onNavigate, onSelect, onAddToCart }) {
  const newIn  = products.filter(p=>p.badge==="New").slice(0,4);
  const onSale = products.filter(p=>p.badge==="Sale").slice(0,4);
  return (
    <div style={{animation:"fadeIn 0.35s ease"}}>
      <div style={{background:"linear-gradient(135deg,#e8e0d5 0%,#d4c9b8 50%,#c8bfb0 100%)",borderRadius:4,padding:"64px 40px",marginBottom:52,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-20,top:-20,width:260,height:260,background:"rgba(255,255,255,0.15)",borderRadius:"50%"}}/>
        <p style={{fontSize:10,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(26,26,24,0.5)",marginBottom:14}}>SS26 Collection</p>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,62px)",fontWeight:300,lineHeight:1.05,letterSpacing:-0.5,color:"rgba(26,26,24,0.85)",marginBottom:20,maxWidth:420}}>Dressed for the <em>in-between</em></h1>
        <p style={{fontSize:14,color:"rgba(26,26,24,0.55)",marginBottom:28,maxWidth:320,lineHeight:1.7}}>Refined pieces for modern living. Timeless materials, thoughtful cuts.</p>
        <Btn onClick={()=>onNavigate("shop")} style={{background:"rgba(26,26,24,0.85)",color:"#fff",fontSize:12,letterSpacing:"0.1em"}}>Shop the Collection</Btn>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10,marginBottom:52}}>
        {["Tops","Bottoms","Dresses","Outerwear","Sets","Accessories"].map((cat,i)=>{
          const grads=["linear-gradient(135deg,#f0ece4,#ddd4c5)","linear-gradient(135deg,#d8e4f0,#c8d5e5)","linear-gradient(135deg,#f0e8de,#e0d0c0)","linear-gradient(135deg,#d8d3cc,#c8c0b5)","linear-gradient(135deg,#f0e8e0,#e0d5c8)","linear-gradient(135deg,#d8d0c8,#c8c0b5)"];
          return <button key={cat} onClick={()=>onNavigate("shop")} style={{background:grads[i],borderRadius:4,padding:"20px 14px",cursor:"pointer",border:"none",textAlign:"left",fontFamily:"'Jost',sans-serif"}}><p style={{fontSize:12,fontWeight:500,color:T.text}}>{cat}</p><p style={{fontSize:10,color:T.muted,marginTop:3}}>Shop →</p></button>;
        })}
      </div>

      <section style={{marginBottom:52}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:22}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:400}}>New In</h2>
          <button onClick={()=>onNavigate("shop")} style={{fontSize:12,color:T.muted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"'Jost',sans-serif"}}>View all</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"36px 20px"}}>
          {newIn.map(p=><ProductCard key={p.id} product={p} onSelect={onSelect} onAddToCart={onAddToCart}/>)}
        </div>
      </section>

      <div style={{background:T.accent,borderRadius:4,padding:"40px 32px",marginBottom:52,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
        <div><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:300,color:"#fff",marginBottom:6}}>Free shipping over $200</p><p style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>On all orders worldwide. Free returns within 30 days.</p></div>
        <Btn onClick={()=>onNavigate("shop")} style={{background:"#fff",color:T.accent,fontSize:12,letterSpacing:"0.08em"}}>Shop Now</Btn>
      </div>

      {onSale.length>0&&(
        <section style={{marginBottom:52}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:22}}>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:400}}>On Sale</h2>
            <button onClick={()=>onNavigate("shop")} style={{fontSize:12,color:T.muted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"'Jost',sans-serif"}}>View all</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"36px 20px"}}>
            {onSale.map(p=><ProductCard key={p.id} product={p} onSelect={onSelect} onAddToCart={onAddToCart}/>)}
          </div>
        </section>
      )}

      <footer style={{borderTop:`1px solid ${T.border}`,paddingTop:36,paddingBottom:20,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:28}}>
        {[{title:"AVEN",links:["Our Story","Sustainability","Careers"]},{title:"Help",links:["Sizing","Shipping","Returns","Contact"]},{title:"Legal",links:["Privacy","Terms","Cookies"]}].map(col=>(
          <div key={col.title}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,marginBottom:12}}>{col.title}</p>{col.links.map(l=><p key={l} style={{fontSize:12,color:T.muted,marginBottom:7,cursor:"pointer"}}>{l}</p>)}</div>
        ))}
      </footer>
    </div>
  );
}

export default function App() {
  const [history, setHistory]     = useState([{screen:"home"}]);
  const [cart, setCart]           = useState([]);
  const [cartOpen, setCartOpen]   = useState(false);
  const current   = history[history.length-1];
  const canGoBack = history.length>1;

  const navigate = (screen, data=null) => {
    setHistory(prev=>[...prev,{screen,data}]);
    setTimeout(()=>{ const el=document.getElementById("scroll-root"); if(el) el.scrollTop=0; },10);
  };
  const goBack = () => setHistory(prev=>prev.length>1?prev.slice(0,-1):prev);

  const addToCart = (product) => {
    setCart(prev=>{
      const key=`${product.id}-${product.selectedColor}-${product.selectedSize}`;
      const ex=prev.find(i=>`${i.id}-${i.selectedColor}-${i.selectedSize}`===key);
      if(ex) return prev.map(i=>`${i.id}-${i.selectedColor}-${i.selectedSize}`===key?{...i,qty:i.qty+1}:i);
      return [...prev,{...product,qty:1}];
    });
    setCartOpen(true);
  };
  const removeFromCart = (item) => setCart(prev=>prev.filter(i=>!(i.id===item.id&&i.selectedSize===item.selectedSize)));
  const updateQty = (item,qty) => { if(qty<1){removeFromCart(item);return;} setCart(prev=>prev.map(i=>i.id===item.id&&i.selectedSize===item.selectedSize?{...i,qty}:i)); };
  const cartCount = cart.reduce((s,i)=>s+i.qty,0);

  const quickAdd = (p) => addToCart({...p,selectedColor:p.colors[0],selectedColorName:"Default",selectedSize:p.sizes[0]});

  const renderScreen = () => {
    const {screen,data}=current;
    if(screen==="home")    return <HomeScreen products={PRODUCTS} onNavigate={navigate} onSelect={p=>navigate("product",p)} onAddToCart={quickAdd}/>;
    if(screen==="shop")    return <ShopScreen products={PRODUCTS} onSelect={p=>navigate("product",p)} onAddToCart={quickAdd}/>;
    if(screen==="product") return <ProductDetail product={data} onBack={goBack} onAddToCart={addToCart}/>;
    if(screen==="search")  return <SearchScreen products={PRODUCTS} onSelect={p=>navigate("product",p)} onAddToCart={quickAdd}/>;
    if(screen==="account") return <AccountPage onNavigate={navigate}/>;
    if(screen==="orders")  return <OrderTracking/>;
    return <HomeScreen products={PRODUCTS} onNavigate={navigate} onSelect={p=>navigate("product",p)} onAddToCart={quickAdd}/>;
  };

  const NavBtn = ({label,scr}) => (
    <button onClick={()=>navigate(scr)} style={{fontSize:11,fontWeight:500,letterSpacing:"0.08em",textTransform:"uppercase",background:"none",border:"none",cursor:"pointer",color:current.screen===scr?T.text:T.muted,fontFamily:"'Jost',sans-serif",paddingBottom:2,borderBottom:current.screen===scr?`1px solid ${T.text}`:"1px solid transparent"}}>
      {label}
    </button>
  );

  return (
    <>
      <FontLink/>
      <div style={{height:"100vh",display:"flex",flexDirection:"column",background:T.bg,fontFamily:"'Jost',sans-serif"}}>
        {/* Navbar */}
        <header style={{background:T.surface,borderBottom:`1px solid ${T.border}`,flexShrink:0,zIndex:50}}>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>navigate("home")} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:400,letterSpacing:3,background:"none",border:"none",cursor:"pointer",color:T.text}}>AVEN</button>
            <nav style={{display:"flex",gap:28,position:"absolute",left:"50%",transform:"translateX(-50%)"}}>
              <NavBtn label="Shop" scr="shop"/><NavBtn label="Search" scr="search"/><NavBtn label="Account" scr="account"/>
            </nav>
            <div style={{display:"flex",alignItems:"center",gap:2}}>
              {canGoBack&&<button onClick={goBack} style={{fontSize:11,color:T.muted,background:"none",border:`1px solid ${T.border}`,borderRadius:2,padding:"5px 12px",cursor:"pointer",fontFamily:"'Jost',sans-serif",marginRight:8}}>← Back</button>}
              <button onClick={()=>setCartOpen(true)} style={{position:"relative",background:"none",border:"none",cursor:"pointer",fontSize:18,padding:6}}>
                🛍{cartCount>0&&<span style={{position:"absolute",top:2,right:2,width:15,height:15,borderRadius:"50%",background:T.accent,color:"#fff",fontSize:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{cartCount}</span>}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div id="scroll-root" style={{flex:1,overflowY:"auto"}}>
          <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 20px 60px"}}>
            {renderScreen()}
          </div>
        </div>

        {cartOpen&&<CartDrawer cart={cart} onClose={()=>setCartOpen(false)} onRemove={removeFromCart} onUpdateQty={updateQty}/>}
      </div>
    </>
  );
}
