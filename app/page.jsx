'use client'
import { useState, useEffect, useRef, useMemo } from "react";
import './layout.css';

const T = {
  white:   "#ffffff",
  black:   "#000000",
  gray1:   "#1c1c1e",
  gray2:   "#3a3a3c",
  gray3:   "#636366",
  gray4:   "#8e8e93",
  gray5:   "#aeaeb2",
  gray6:   "#c7c7cc",
  gray7:   "#d1d1d6",
  gray8:   "#e5e5ea",
  gray9:   "#f2f2f7",
  gray10:  "#f8f8fa",
  blue:    "#007aff",
  red:     "#ff3b30",
  green:   "#34c759",
  orange:  "#ff9500",
};

const shadow = {
  xs:  "0 1px 3px rgba(0,0,0,0.08)",
  sm:  "0 2px 8px rgba(0,0,0,0.08)",
  md:  "0 4px 16px rgba(0,0,0,0.10)",
  lg:  "0 8px 32px rgba(0,0,0,0.12)",
  xl:  "0 16px 48px rgba(0,0,0,0.14)",
  xxl: "0 24px 64px rgba(0,0,0,0.18)",
};

const Icon = ({ name, size=24, color="currentColor", strokeWidth=1.8 }) => {
  const s = { display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 };
  const p = { fill:"none", stroke:color, strokeWidth, strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    home:        <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></>,
    search:      <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></>,
    bag:         <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
    person:      <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    heart:       <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>,
    "heart-fill":<><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={color} stroke="none"/></>,
    back:        <><polyline points="15 18 9 12 15 6"/></>,
    filter:      <><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></>,
    share:       <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    close:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    plus:        <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    minus:       <><line x1="5" y1="12" x2="19" y2="12"/></>,
    check:       <><polyline points="20 6 9 17 4 12"/></>,
    star:        <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    "star-fill": <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={color} stroke="none"/></>,
    truck:       <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    tag:         <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
    box:         <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    location:    <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    card:        <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
    settings:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
    bell:        <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>,
    grid:        <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    list:        <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    sparkle:     <><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></>,
    fire:        <><path d="M12 2c0 0-4 4-4 8 0 2.2 1.8 4 4 4s4-1.8 4-4c0-1.5-.8-2.8-2-3.6C14.5 8 14 10 12 10c0 0 1-2 0-4-1-2-3-4-3-4z"/><path d="M12 22c-3.3 0-6-2.7-6-6 0-3 2-5.5 4-7"/></>,
    chevronR:    <><polyline points="9 18 15 12 9 6"/></>,
    chevronD:    <><polyline points="6 9 12 15 18 9"/></>,
    returns:     <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></>,
    gift:        <><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></>,
    scan:        <><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></>,
    eye:         <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    trending:    <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  };
  return (
    <span style={s}>
      <svg width={size} height={size} viewBox="0 0 24 24" {...p}>{icons[name]}</svg>
    </span>
  );
};

const PRODUCTS = [
  { id:1,  name:"Linen Overshirt",    cat:"Tops",        price:148, was:null, badge:null,   new:false, colors:["#E8E0D5","#2C2C2A","#8B7355"], sizes:["XS","S","M","L","XL"], rating:4.8, reviews:124, desc:"Relaxed-fit overshirt in premium Belgian linen. Slightly oversized with a classic collar and chest pockets. The perfect layering piece.", material:"100% Belgian Linen", care:"Machine wash cold, tumble dry low", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#EDE8E0,#D4C8B5)" },
  { id:2,  name:"Merino Turtleneck",  cat:"Tops",        price:195, was:null, badge:"New",  new:true,  colors:["#F0ECE4","#1A1A18","#8C6B4A"], sizes:["XS","S","M","L"],     rating:4.9, reviews:89,  desc:"Ultra-fine merino wool turtleneck. Naturally temperature-regulating, buttery soft, and wrinkle-resistant.", material:"100% Extra-fine Merino", care:"Hand wash cold or dry clean", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#F0ECE4,#DED4C6)" },
  { id:3,  name:"Wide-Leg Trousers",  cat:"Bottoms",     price:228, was:285,  badge:"Sale", new:false, colors:["#D4CFC8","#3D3830","#C4A882"], sizes:["XS","S","M","L","XL"], rating:4.7, reviews:203, desc:"Tailored wide-leg trousers with a high waist. Ponte-blend fabric that holds its shape and drapes beautifully.", material:"68% Viscose, 28% Polyamide, 4% Elastane", care:"Dry clean recommended", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#DED9D2,#CBBFB2)" },
  { id:4,  name:"Cashmere Cardigan",  cat:"Tops",        price:345, was:null, badge:"New",  new:true,  colors:["#E2DDD6","#6B5E4E","#2C2C2A"], sizes:["XS","S","M","L"],     rating:5.0, reviews:57,  desc:"Hand-finished open-front cardigan in Grade-A cashmere. Ribbed cuffs and hem, relaxed silhouette.", material:"100% Grade-A Cashmere", care:"Dry clean only", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#F0ECE4,#DEDAD2)" },
  { id:5,  name:"Silk Slip Dress",    cat:"Dresses",     price:268, was:null, badge:null,   new:false, colors:["#E8D5C4","#1A1A18","#8B7355"], sizes:["XS","S","M","L"],     rating:4.6, reviews:178, desc:"Bias-cut silk charmeuse slip dress with adjustable spaghetti straps. A timeless silhouette that moves beautifully.", material:"100% Silk Charmeuse", care:"Dry clean only", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#F2E4D8,#E0CCBA)" },
  { id:6,  name:"Tailored Blazer",    cat:"Outerwear",   price:420, was:null, badge:null,   new:false, colors:["#2C2C2A","#8C7355","#E0DBD2"], sizes:["XS","S","M","L","XL"], rating:4.9, reviews:94,  desc:"Single-breasted blazer in fine Italian wool blend. Structured shoulder, clean lapel, two-button closure.", material:"78% Wool, 18% Silk, 4% Cashmere", care:"Dry clean only", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#DEDAD4,#C8C0B6)" },
  { id:7,  name:"Cropped Tank",       cat:"Tops",        price:68,  was:null, badge:null,   new:false, colors:["#F0ECE4","#1A1A18","#C4A882","#8B7355"], sizes:["XS","S","M","L","XL"], rating:4.5, reviews:312, desc:"Ribbed pima cotton tank with a cropped length. A clean minimal essential that pairs with everything.", material:"95% Pima Cotton, 5% Elastane", care:"Machine wash cold", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#F5F2EC,#ECE6DE)" },
  { id:8,  name:"Barrel Jeans",       cat:"Bottoms",     price:185, was:null, badge:"New",  new:true,  colors:["#6B8AB5","#2C2C2A","#8B7355"], sizes:["24","25","26","27","28","29","30"], rating:4.7, reviews:145, desc:"Relaxed barrel-leg jeans cut from Japanese selvedge denim with a subtle stretch.", material:"98% Cotton, 2% Elastane", care:"Machine wash cold, hang dry", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#D8E4F2,#C2D2E4)" },
  { id:9,  name:"Wrap Midi Skirt",    cat:"Bottoms",     price:158, was:198,  badge:"Sale", new:false, colors:["#C4A882","#2C2C2A","#E8D5C4"], sizes:["XS","S","M","L"],     rating:4.8, reviews:201, desc:"Fluid wrap skirt in lightweight viscose crepe. Elegant midi length with adjustable tie closure.", material:"100% Viscose Crepe", care:"Hand wash cold", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#EDE5D8,#DDD0BE)" },
  { id:10, name:"Trench Coat",        cat:"Outerwear",   price:545, was:null, badge:null,   new:false, colors:["#C4A882","#2C2C2A","#E8E0D5"], sizes:["XS","S","M","L","XL"], rating:4.9, reviews:78,  desc:"Classic double-breasted trench in water-resistant cotton gabardine. A wardrobe investment.", material:"100% Cotton Gabardine", care:"Dry clean only", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#E8DDD0,#D8CEBE)" },
  { id:11, name:"Knit Co-ord Set",    cat:"Sets",        price:295, was:null, badge:"New",  new:true,  colors:["#E8E0D5","#6B5E4E"], sizes:["XS","S","M","L"], rating:4.8, reviews:43, desc:"Matching fine-rib knit top and trouser set in merino-cashmere blend. Sold together, worn as separates.", material:"80% Merino, 20% Cashmere", care:"Hand wash cold", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#F0E8E0,#E0D5C8)" },
  { id:12, name:"Leather Belt",       cat:"Accessories", price:88,  was:null, badge:null,   new:false, colors:["#2C2C2A","#8B7355","#C4A882"], sizes:["XS","S","M","L"],     rating:4.6, reviews:167, desc:"Full-grain leather belt with a minimalist rectangular buckle. Develops a beautiful patina over time.", material:"100% Full-grain Leather", care:"Clean with leather conditioner", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#D8D0C8,#C8C0B5)" },
  { id:13, name:"Ribbed Midi Dress",  cat:"Dresses",     price:198, was:248,  badge:"Sale", new:false, colors:["#F0ECE4","#2C2C2A","#C4A882"], sizes:["XS","S","M","L"],     rating:4.7, reviews:89,  desc:"Fine-rib knit midi dress with a boat neckline and subtle flare. Effortlessly elegant.", material:"92% Viscose, 8% Elastane", care:"Machine wash cold", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#EDE8E0,#D8D0C4)" },
  { id:14, name:"Oversized Hoodie",   cat:"Tops",        price:125, was:null, badge:null,   new:false, colors:["#E8E0D5","#2C2C2A","#6B8AB5"], sizes:["XS","S","M","L","XL","XXL"], rating:4.8, reviews:256, desc:"Heavyweight cotton fleece hoodie with a relaxed oversized fit. Garment-dyed for a lived-in look.", material:"100% Organic Cotton Fleece", care:"Machine wash cold", ship:"Free shipping · Arrives in 3–5 days", grad:"linear-gradient(160deg,#EDE8E0,#D8CEBE)" },
];

const CATS = ["All","Tops","Bottoms","Dresses","Outerwear","Sets","Accessories"];

const BANNERS = [
  { id:1, title:"New Season", sub:"SS26 Collection", cta:"Explore", grad:"linear-gradient(135deg,#E8E0D5 0%,#C8BCAA 100%)", textDark:true },
  { id:2, title:"Up to 40% off", sub:"Limited time sale", cta:"Shop Sale", grad:"linear-gradient(135deg,#1C1C1E 0%,#3A3A3C 100%)", textDark:false },
  { id:3, title:"Free Shipping", sub:"On all orders over $200", cta:"Shop Now", grad:"linear-gradient(135deg,#D8E4F2 0%,#B8CADE 100%)", textDark:true },
];

const ORDERS = [
  { id:"ORD-2891", date:"Feb 28, 2026", status:"Delivered",  items:["Linen Overshirt","Cropped Tank"],   total:216, steps:[{l:"Order placed",d:"Feb 20",ok:true},{l:"Processing",d:"Feb 21",ok:true},{l:"Shipped",d:"Feb 23",ok:true},{l:"Out for delivery",d:"Feb 28",ok:true},{l:"Delivered",d:"Feb 28",ok:true}] },
  { id:"ORD-3104", date:"Mar 02, 2026", status:"In Transit", items:["Merino Turtleneck"],                total:195, steps:[{l:"Order placed",d:"Mar 2",ok:true},{l:"Processing",d:"Mar 2",ok:true},{l:"Shipped",d:"Mar 3",ok:true},{l:"Out for delivery",d:"",ok:false},{l:"Delivered",d:"",ok:false}] },
  { id:"ORD-3287", date:"Mar 04, 2026", status:"Processing", items:["Cashmere Cardigan","Leather Belt"], total:433, steps:[{l:"Order placed",d:"Mar 4",ok:true},{l:"Processing",d:"Mar 4",ok:true},{l:"Shipped",d:"",ok:false},{l:"Out for delivery",d:"",ok:false},{l:"Delivered",d:"",ok:false}] },
];

const WISHLIST_IDS = [1, 5, 8];

const $ = n => `$${Number(n).toFixed(0)}`;

function statusColors(s) {
  return { Delivered:["#E8F5EC","#1A7A40"], "In Transit":["#E8F0FB","#1A52B0"], Processing:["#FFF3E8","#B06020"] }[s] || ["#F5F5F5","#666"];
}

function StatusBadge({ status }) {
  const [bg,col] = statusColors(status);
  return <span style={{ fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", background:bg, color:col, padding:"5px 12px", borderRadius:99 }}>{status}</span>;
}

function RatingStars({ rating, size=12 }) {
  return (
    <span style={{ display:"inline-flex", gap:1 }}>
      {[1,2,3,4,5].map(i => (
        <Icon key={i} name={i<=Math.floor(rating)?"star-fill":"star"} size={size} color={i<=Math.floor(rating)?"#FF9500":"#D1D1D6"}/>
      ))}
    </span>
  );
}

function PriceLine({ price, was }) {
  return (
    <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
      <span style={{ fontSize:16, fontWeight:700, color: was ? T.red : T.black }}>{$(price)}</span>
      {was && <span style={{ fontSize:13, color:T.gray4, textDecoration:"line-through" }}>{$(was)}</span>}
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className="pressable-sm" style={{ background: active ? T.black : T.white, color: active ? T.white : T.gray2, border:`1.5px solid ${active ? T.black : T.gray7}`, padding:"9px 18px", borderRadius:99, fontSize:14, fontWeight:500, cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.18s" }}>
      {label}
    </button>
  );
}

function Btn({ children, onClick, variant="black", full, size="md", style:sx={} }) {
  const base = { border:"none", cursor:"pointer", fontWeight:600, fontSize:size==="sm"?13:15, borderRadius:8, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.18s", padding: size==="sm"?"11px 20px":"15px 28px" };
  const v = {
    black:  { background:T.black, color:T.white },
    white:  { background:T.white, color:T.black, border:`1.5px solid ${T.gray7}` },
    gray:   { background:T.gray9, color:T.black },
    red:    { background:T.red,   color:T.white },
    ghost:  { background:"transparent", color:T.gray3 },
  };
  return <button onClick={onClick} className="pressable" style={{ ...base, ...v[variant], ...(full?{width:"100%"}:{}), ...sx }}>{children}</button>;
}

function IconBtn({ icon, onClick, badge, size=44, bg=T.gray9, color=T.black, style:sx={} }) {
  return (
    <button onClick={onClick} className="pressable-sm" style={{ width:size, height:size, borderRadius:size/2, background:bg, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0, ...sx }}>
      <Icon name={icon} size={size*0.46} color={color}/>
      {badge>0 && <span style={{ position:"absolute", top:-2, right:-2, width:18, height:18, borderRadius:9, background:T.red, color:T.white, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{badge}</span>}
    </button>
  );
}

function Divider({ my=0, mx=0 }) {
  return <div style={{ height:1, background:T.gray8, margin:`${my}px ${mx}px` }}/>;
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
      <span style={{ fontSize:20, fontWeight:700, letterSpacing:-0.4 }}>{title}</span>
      {action && <button onClick={onAction} style={{ fontSize:14, color:T.blue, background:"none", border:"none", cursor:"pointer", fontWeight:500 }}>{action}</button>}
    </div>
  );
}

function HScroll({ children, gap=12 }) {
  const ref = useRef(null);
  const drag = useRef({ on:false, startX:0, sl:0 });

  const onMD = e => {
    const el = ref.current; if(!el) return;
    drag.current = { on:true, startX:e.clientX, sl:el.scrollLeft };
    el.style.cursor = "grabbing"; el.style.userSelect = "none";
  };
  const onMM = e => {
    if(!drag.current.on || !ref.current) return;
    e.preventDefault();
    ref.current.scrollLeft = drag.current.sl - (e.clientX - drag.current.startX);
  };
  const onMU = () => {
    drag.current.on = false;
    if(ref.current){ ref.current.style.cursor = "grab"; ref.current.style.userSelect = ""; }
  };

  return (
    <div ref={ref} onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
      style={{ overflowX:"auto", overflowY:"visible",
        WebkitOverflowScrolling:"touch", scrollbarWidth:"none", msOverflowStyle:"none",
        cursor:"grab" }}>
      <div style={{ display:"inline-flex", gap, paddingRight:14, paddingBottom:4 }}>
        {children}
      </div>
    </div>
  );
}

function HeroBanner({ onNavigate }) {
  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);
  const containerRef = useRef(null);
  const touchStartX = useRef(null);
  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) setIdx(i => (i + 1) % BANNERS.length);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  const go = i => { pausedRef.current = true; setIdx(i); };
  const prev = () => go((idx - 1 + BANNERS.length) % BANNERS.length);
  const next = () => go((idx + 1) % BANNERS.length);

  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; pausedRef.current = true; };
  const onTouchEnd   = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    touchStartX.current = null;
  };
  const scrollRef = useRef(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    if (w === 0) return;
    isScrolling.current = true;
    el.scrollTo({ left: idx * w, behavior: "smooth" });
    const t = setTimeout(() => { isScrolling.current = false; }, 500);
    return () => clearTimeout(t);
  }, [idx]);

  const onScroll = () => {
    if (isScrolling.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.offsetWidth);
    if (i !== idx) setIdx(i);
  };

  return (
    <div ref={containerRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      style={{ position:"relative", borderRadius:10, overflow:"hidden", marginBottom:12 }}>
      <div ref={scrollRef} onScroll={onScroll}
        style={{ display:"flex", overflowX:"auto", scrollSnapType:"x mandatory",
          WebkitOverflowScrolling:"touch", scrollbarWidth:"none", msOverflowStyle:"none" }}>
        {BANNERS.map(b => (
          <div key={b.id} style={{ flexShrink:0, minWidth:"100%", scrollSnapAlign:"start",
            background:b.grad, padding:"44px 22px 36px", minHeight:220,
            display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
              color:b.textDark?"rgba(0,0,0,0.38)":"rgba(255,255,255,0.5)", marginBottom:8 }}>{b.sub}</p>
            <h2 style={{ fontSize:34, fontWeight:800, letterSpacing:-1, lineHeight:1.05, marginBottom:20,
              color:b.textDark?T.black:T.white }}>{b.title}</h2>
            <button onClick={()=>onNavigate("shop")} style={{ alignSelf:"flex-start",
              background:b.textDark?T.black:T.white, color:b.textDark?T.white:T.black,
              border:"none", cursor:"pointer", padding:"11px 22px", borderRadius:99, fontSize:13, fontWeight:700 }}>{b.cta}</button>
          </div>
        ))}
      </div>
      <div style={{ position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6 }}>
        {BANNERS.map((_,i) => (
          <button key={i} onClick={()=>go(i)}
            style={{ width:i===idx?20:6, height:6, borderRadius:3, padding:0, border:"none", cursor:"pointer",
              background:i===idx?"rgba(0,0,0,0.6)":"rgba(0,0,0,0.18)", transition:"width 0.3s ease, background 0.3s ease" }}/>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ p, onSelect, onWishlist, wishlisted, compact, grid:inGrid }) {
  const fixedW = compact ? 150 : 200;
  const outerStyle = inGrid
    ? { width:"100%", minWidth:0, cursor:"pointer" }
    : { width:fixedW, flexShrink:0, cursor:"pointer" };
  const imgStyle = inGrid
    ? { position:"relative", width:"100%", aspectRatio:"3/4", background:p.grad, borderRadius:10, overflow:"hidden", marginBottom:10 }
    : { position:"relative", width:fixedW, height:compact?200:260, background:p.grad, borderRadius:10, overflow:"hidden", marginBottom:10 };

  return (
    <div onClick={()=>onSelect(p)} className="pressable" style={outerStyle}>
      <div style={imgStyle}>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:compact?18:22, fontWeight:300, color:"rgba(0,0,0,0.22)", textAlign:"center", padding:"0 12px", lineHeight:1.3, fontStyle:"italic" }}>{p.name}</span>
        </div>
        {p.badge && (
          <div style={{ position:"absolute", top:10, left:10, background:p.badge==="Sale"?T.red:T.black, color:T.white, fontSize:10, fontWeight:700, padding:"4px 9px", borderRadius:99, letterSpacing:"0.06em", textTransform:"uppercase" }}>{p.badge}</div>
        )}
        <button onClick={e=>{e.stopPropagation();onWishlist(p.id);}} className="pressable-sm"
          style={{ position:"absolute", top:10, right:10, width:32, height:32, borderRadius:99, background:"rgba(255,255,255,0.92)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.12)" }}>
          <Icon name={wishlisted?"heart-fill":"heart"} size={15} color={wishlisted?T.red:T.gray4}/>
        </button>
      </div>
      <p style={{ fontSize:13, fontWeight:600, color:T.black, marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</p>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
        <RatingStars rating={p.rating} size={10}/>
        <span style={{ fontSize:11, color:T.gray4 }}>({p.reviews})</span>
      </div>
      <PriceLine price={p.price} was={p.was}/>
    </div>
  );
}

function CartDrawer({ cart, onClose, onRemove, onQty, onNavigate }) {
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const free  = total >= 200;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:500, animation:"fadeIn 0.2s ease" }}/>
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(440px,100vw)", background:T.white, zIndex:600, display:"flex", flexDirection:"column", animation:"slideInR 0.32s cubic-bezier(.4,0,.2,1)", borderRadius:"10px 0 0 10px", boxShadow:shadow.xxl }}>
        <div style={{ width:40, height:4, borderRadius:2, background:T.gray7, margin:"14px auto 0" }}/>
        <div style={{ padding:"16px 20px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:22, fontWeight:700, letterSpacing:-0.4 }}>My Bag</span>
          <IconBtn icon="close" onClick={onClose} size={36}/>
        </div>
        <div style={{ margin:"0 20px 8px", background:T.gray9, borderRadius:8, padding:"12px 14px" }}>
          {free
            ? <p style={{ fontSize:13, fontWeight:600, color:T.green, display:"flex", alignItems:"center", gap:6 }}><Icon name="truck" size={15} color={T.green}/> You qualify for free shipping!</p>
            : <>
                <p style={{ fontSize:13, color:T.gray3, marginBottom:7 }}>Add <strong style={{color:T.black}}>{$(200-total)}</strong> more for free shipping</p>
                <div style={{ height:4, background:T.gray8, borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${Math.min((total/200)*100,100)}%`, background:T.black, borderRadius:2, transition:"width 0.4s" }}/>
                </div>
              </>
          }
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"0 20px" }}>
          {cart.length===0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:16, paddingBottom:80 }}>
              <Icon name="bag" size={56} color={T.gray6}/>
              <p style={{ fontSize:17, fontWeight:600, color:T.gray2 }}>Your bag is empty</p>
              <Btn variant="gray" onClick={onClose} size="sm">Continue Shopping</Btn>
            </div>
          ) : cart.map((item,i)=>(
            <div key={`${item.id}-${item.sz}`}>
              <div style={{ padding:"16px 0", display:"flex", gap:14 }}>
                <div style={{ width:80, height:100, background:item.grad, borderRadius:8, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:18, fontStyle:"italic", color:"rgba(0,0,0,0.25)" }}>{item.name[0]}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:15, fontWeight:600, marginBottom:2 }}>{item.name}</p>
                  <p style={{ fontSize:13, color:T.gray4, marginBottom:12 }}>Size: {item.sz}</p>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", background:T.gray9, borderRadius:99 }}>
                      <button onClick={()=>onQty(item,item.qty-1)} style={{ width:34,height:34,borderRadius:17,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <Icon name="minus" size={14} color={T.black}/>
                      </button>
                      <span style={{ fontSize:15, fontWeight:600, minWidth:22, textAlign:"center" }}>{item.qty}</span>
                      <button onClick={()=>onQty(item,item.qty+1)} style={{ width:34,height:34,borderRadius:17,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <Icon name="plus" size={14} color={T.black}/>
                      </button>
                    </div>
                    <span style={{ fontSize:16, fontWeight:700 }}>{$(item.price*item.qty)}</span>
                  </div>
                </div>
                <button onClick={()=>onRemove(item)} style={{ background:"none",border:"none",cursor:"pointer",color:T.gray4,padding:"2px",alignSelf:"flex-start",marginTop:2 }}>
                  <Icon name="close" size={16} color={T.gray5}/>
                </button>
              </div>
              {i<cart.length-1&&<Divider/>}
            </div>
          ))}
        </div>
        {cart.length>0&&(
          <div style={{ padding:"16px 20px 28px", borderTop:`1px solid ${T.gray8}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:15, color:T.gray3 }}>Subtotal</span>
              <span style={{ fontSize:15 }}>{$(total)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <span style={{ fontSize:15, color:T.gray3 }}>Shipping</span>
              <span style={{ fontSize:15, color:free?T.green:T.black, fontWeight:free?600:400 }}>{free?"Free":$(12)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20, paddingTop:14, borderTop:`1px solid ${T.gray8}` }}>
              <span style={{ fontSize:18, fontWeight:700 }}>Total</span>
              <span style={{ fontSize:18, fontWeight:700 }}>{$(free?total:total+12)}</span>
            </div>
            <Btn full style={{ borderRadius:8, padding:"16px", fontSize:16 }}>Checkout →</Btn>
          </div>
        )}
      </div>
    </>
  );
}

function ProductDetail({ p, onBack, onAdd, wishlisted, onWishlist }) {
  const [ci,setCi]   = useState(0);
  const [sz,setSz]   = useState(null);
  const [done,setDone] = useState(false);
  const [tab,setTab] = useState("desc");

  const add = () => {
    if(!sz) return;
    onAdd({...p, selectedColor:p.colors[ci], sz});
    setDone(true); setTimeout(()=>setDone(false),2200);
  };

  const related = PRODUCTS.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,6);

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ position:"relative", width:"100%", aspectRatio:"4/5", background:p.grad, borderRadius:10, overflow:"hidden", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {p.badge&&<div style={{ position:"absolute", top:14, left:14, background:p.badge==="Sale"?T.red:T.black, color:T.white, fontSize:11, fontWeight:700, padding:"5px 12px", borderRadius:99, letterSpacing:"0.06em", textTransform:"uppercase" }}>{p.badge}</div>}
        <span style={{ fontSize:56, fontWeight:300, color:"rgba(0,0,0,0.18)", textAlign:"center", padding:"0 24px", lineHeight:1.2, fontStyle:"italic" }}>{p.name}</span>
        <div style={{ position:"absolute", top:14, right:14, display:"flex", flexDirection:"column", gap:10 }}>
          <IconBtn icon={wishlisted?"heart-fill":"heart"} onClick={()=>onWishlist(p.id)} size={40} bg="rgba(255,255,255,0.9)" color={wishlisted?T.red:T.gray3}/>
          <IconBtn icon="share" onClick={()=>{}} size={40} bg="rgba(255,255,255,0.9)" color={T.gray3}/>
        </div>
      </div>
      <div style={{ marginBottom:20 }}>
        <p style={{ fontSize:13, fontWeight:500, color:T.gray4, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{p.cat}</p>
        <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:-0.5, marginBottom:10, lineHeight:1.2 }}>{p.name}</h1>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <RatingStars rating={p.rating}/>
          <span style={{ fontSize:13, color:T.gray3 }}>{p.rating} ({p.reviews} reviews)</span>
        </div>
        <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
          <span style={{ fontSize:28, fontWeight:800, color:p.was?T.red:T.black }}>{$(p.price)}</span>
          {p.was&&<span style={{ fontSize:18, color:T.gray4, textDecoration:"line-through" }}>{$(p.was)}</span>}
        </div>
      </div>

      <Divider my={20}/>
      <div style={{ marginBottom:22 }}>
        <p style={{ fontSize:13, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12, color:T.gray2 }}>Colour</p>
        <div style={{ display:"flex", gap:12 }}>
          {p.colors.map((col,i)=>(
            <button key={i} onClick={()=>setCi(i)} style={{ width:30, height:30, borderRadius:15, background:col, border:`2.5px solid ${ci===i?T.black:"transparent"}`, outline:`2px solid ${ci===i?T.black:"transparent"}`, outlineOffset:2, cursor:"pointer", transition:"all 0.15s", flexShrink:0 }}/>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <p style={{ fontSize:13, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", color:T.gray2 }}>Size</p>
          <button style={{ fontSize:13, color:T.blue, background:"none", border:"none", cursor:"pointer", fontWeight:500 }}>Size Guide</button>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {p.sizes.map(s=>(
            <button key={s} onClick={()=>setSz(s)} style={{ minWidth:52, height:44, padding:"0 12px", background:sz===s?T.black:T.white, color:sz===s?T.white:T.gray2, border:`1.5px solid ${sz===s?T.black:T.gray7}`, borderRadius:8, cursor:"pointer", fontSize:14, fontWeight:600, transition:"all 0.15s" }}>{s}</button>
          ))}
        </div>
        {!sz&&<p style={{ fontSize:13, color:T.red, marginTop:8, fontWeight:500 }}>Please select a size</p>}
      </div>
      <Btn full onClick={add} style={{ padding:"18px", borderRadius:8, fontSize:16, opacity:sz?1:0.55, marginBottom:12 }}>
        <Icon name="bag" size={18} color={T.white}/>
        {done?"Added to Bag ✓":"Add to Bag"}
      </Btn>
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
        {[["truck","Free Shipping"],["returns","Free Returns"],["tag","Authenticity Guarantee"]].map(([icon,label])=>(
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6, background:T.gray9, borderRadius:10, padding:"8px 12px" }}>
            <Icon name={icon} size={14} color={T.gray3}/>
            <span style={{ fontSize:12, fontWeight:500, color:T.gray2 }}>{label}</span>
          </div>
        ))}
      </div>

      <Divider my={4}/>
      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${T.gray8}`, marginBottom:20 }}>
        {[["desc","Description"],["details","Details"],["care","Care"]].map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{ flex:1, padding:"14px 0", background:"none", border:"none", cursor:"pointer", fontSize:14, fontWeight:tab===key?700:400, color:tab===key?T.black:T.gray4, borderBottom:`2px solid ${tab===key?T.black:"transparent"}`, transition:"all 0.18s" }}>{label}</button>
        ))}
      </div>
      <div style={{ marginBottom:28 }}>
        {tab==="desc"    && <p style={{ fontSize:15, color:T.gray2, lineHeight:1.75 }}>{p.desc}</p>}
        {tab==="details" && <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${T.gray9}` }}><span style={{ fontSize:14, color:T.gray4 }}>Material</span><span style={{ fontSize:14, fontWeight:500 }}>{p.material}</span></div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${T.gray9}` }}><span style={{ fontSize:14, color:T.gray4 }}>Shipping</span><span style={{ fontSize:14, fontWeight:500 }}>{p.ship}</span></div>
        </div>}
        {tab==="care"    && <p style={{ fontSize:15, color:T.gray2, lineHeight:1.75 }}>{p.care}</p>}
      </div>
      {related.length>0&&(
        <div>
          <SectionHeader title="You May Also Like"/>
          <HScroll>
            {related.map(rp=>(
              <ProductCard key={rp.id} p={rp} compact onSelect={()=>{window.history.pushState({},"");}} onWishlist={()=>{}} wishlisted={false}/>
            ))}
          </HScroll>
        </div>
      )}
    </div>
  );
}

function HomeScreen({ products, onNavigate, onSelect, onWishlist, wishlist }) {
  const newIn    = products.filter(p=>p.new).slice(0,8);
  const trending = [...products].sort((a,b)=>b.reviews-a.reviews).slice(0,8);
  const onSale   = products.filter(p=>p.badge==="Sale").slice(0,6);
  const catGrads = ["linear-gradient(160deg,#F0ECE4,#DDD4C5)","linear-gradient(160deg,#D8E4F0,#C2D2E4)","linear-gradient(160deg,#F0E4D8,#E0D0C0)","linear-gradient(160deg,#DED9D2,#CCC0B4)","linear-gradient(160deg,#F0E8E0,#E0D5C8)","linear-gradient(160deg,#D8D0C8,#C8C0B5)"];

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <HeroBanner onNavigate={onNavigate}/>
      <div style={{ marginBottom:32, marginTop:8 }}>
        <SectionHeader title="Browse" action="See All" onAction={()=>onNavigate("shop")}/>
        <HScroll gap={10}>
          {CATS.slice(1).map((cat,i)=>(
            <button key={cat} onClick={()=>onNavigate("shop")} className="pressable-sm"
              style={{ flexShrink:0, width:100, height:100, background:catGrads[i], borderRadius:10, border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
              <span style={{ fontSize:11, fontWeight:700, color:T.gray2, textTransform:"uppercase", letterSpacing:"0.06em" }}>{cat}</span>
            </button>
          ))}
        </HScroll>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
        {[
          { label:"New Arrivals", sub:"SS26 drops", screen:"new-arrivals", grad:"linear-gradient(135deg,#1C1C1E,#3A3A3C)", dark:true },
          { label:"Sale",         sub:"Up to 40% off", screen:"sale", grad:"linear-gradient(135deg,#FF3B30,#C0392B)", dark:true },
          { label:"Lookbook",     sub:"Styled edits",  screen:"lookbook", grad:"linear-gradient(135deg,#EDE8E0,#D4C8B5)", dark:false },
          { label:"Sustainability",sub:"Our values",   screen:"sustainability", grad:"linear-gradient(135deg,#2E4A2E,#1A2E1A)", dark:true },
        ].map(item=>(
          <button key={item.screen} onClick={()=>onNavigate(item.screen)} className="pressable-sm"
            style={{ background:item.grad, borderRadius:10, padding:"18px 16px", border:"none", cursor:"pointer", textAlign:"left" }}>
            <p style={{ fontSize:15, fontWeight:800, color:item.dark?T.white:T.black, letterSpacing:-0.3, marginBottom:2 }}>{item.label}</p>
            <p style={{ fontSize:12, color:item.dark?"rgba(255,255,255,0.55)":"rgba(0,0,0,0.45)" }}>{item.sub}</p>
          </button>
        ))}
      </div>

      <div style={{ marginBottom:32 }}>
        <SectionHeader title="New In ✦" action="View All" onAction={()=>onNavigate("shop")}/>
        <HScroll>
          {newIn.map(p=>(
            <ProductCard key={p.id} p={p} onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
          ))}
        </HScroll>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:32 }}>
        {[{icon:"truck",label:"Free Shipping",sub:"Orders over $200"},{icon:"returns",label:"Free Returns",sub:"Within 30 days"},{icon:"scan",label:"Authenticity",sub:"Guaranteed"}].map(item=>(
          <div key={item.label} style={{ flex:1, background:T.gray9, borderRadius:10, padding:"14px 12px", display:"flex", flexDirection:"column", alignItems:"center", gap:6, textAlign:"center" }}>
            <Icon name={item.icon} size={22} color={T.black}/>
            <p style={{ fontSize:11, fontWeight:700, color:T.black }}>{item.label}</p>
            <p style={{ fontSize:10, color:T.gray4 }}>{item.sub}</p>
          </div>
        ))}
      </div>
      <div style={{ marginBottom:32 }}>
        <SectionHeader title="Trending Now 🔥" action="View All" onAction={()=>onNavigate("shop")}/>
        <HScroll>
          {trending.map(p=>(
            <ProductCard key={p.id} p={p} onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
          ))}
        </HScroll>
      </div>
      <div style={{ background:T.black, borderRadius:10, padding:"36px 28px", marginBottom:32, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-30, top:-30, width:180, height:180, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }}/>
        <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)", marginBottom:10 }}>Limited Time</p>
        <p style={{ fontSize:28, fontWeight:800, color:T.white, letterSpacing:-0.5, lineHeight:1.1, marginBottom:8 }}>Up to 40% off Sale</p>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", marginBottom:22 }}>Select styles. While stocks last.</p>
        <Btn onClick={()=>onNavigate("shop")} style={{ background:T.white, color:T.black, borderRadius:8 }} size="sm">Shop Sale</Btn>
      </div>
      {onSale.length>0&&(
        <div style={{ marginBottom:32 }}>
          <SectionHeader title="On Sale" action="View All" onAction={()=>onNavigate("shop")}/>
          <HScroll>
            {onSale.map(p=>(
              <ProductCard key={p.id} p={p} onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
            ))}
          </HScroll>
        </div>
      )}
      <div style={{ borderTop:`1px solid ${T.gray8}`, paddingTop:24, paddingBottom:100 }}>
        <div style={{ marginBottom:12 }}><Logo height={14} color={T.gray4}/></div>
        <p style={{ fontSize:13, color:T.gray5, marginBottom:18, lineHeight:1.5 }}>Refined pieces for modern living.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"10px 20px" }}>
          {[["Our Story","sustainability"],["Lookbook","lookbook"],["Sale","sale"],["New Arrivals","new-arrivals"],["Returns",null],["Privacy",null]].map(([l,s])=>(
            <span key={l} onClick={s?()=>onNavigate(s):undefined}
              style={{ fontSize:12, color:T.gray5, cursor:s?"pointer":"default", textDecoration:s?"underline":"none", textDecorationColor:T.gray7 }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShopScreen({ products, onSelect, onWishlist, wishlist }) {
  const [cat,setCat]   = useState("All");
  const [sort,setSort] = useState("featured");
  const [grid,setGrid] = useState(true);
  const filtered = useMemo(()=>{
    let p=cat==="All"?products:products.filter(x=>x.cat===cat);
    if(sort==="low")    p=[...p].sort((a,b)=>a.price-b.price);
    if(sort==="high")   p=[...p].sort((a,b)=>b.price-a.price);
    if(sort==="rating") p=[...p].sort((a,b)=>b.rating-a.rating);
    if(sort==="new")    p=[...p].filter(x=>x.new).concat([...p].filter(x=>!x.new));
    return p;
  },[cat,sort,products]);

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <HScroll gap={8} px={16}>
        {CATS.map(c=><Chip key={c} label={c} active={cat===c} onClick={()=>setCat(c)}/>)}
      </HScroll>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", margin:"16px 0 20px" }}>
        <span style={{ fontSize:14, color:T.gray4 }}>{filtered.length} items</span>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{ fontSize:13, color:T.black, background:T.gray9, border:"none", padding:"8px 14px", borderRadius:99, cursor:"pointer", outline:"none", fontWeight:500 }}>
            <option value="featured">Featured</option>
            <option value="new">New In</option>
            <option value="low">Lowest Price</option>
            <option value="high">Highest Price</option>
            <option value="rating">Top Rated</option>
          </select>
          <button onClick={()=>setGrid(g=>!g)} style={{ width:36,height:36,borderRadius:10,background:T.gray9,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Icon name={grid?"list":"grid"} size={16} color={T.black}/>
          </button>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:grid?"1fr 1fr":"1fr", gap:grid?"16px 10px":"12px" }}>
        {filtered.map(p=>(
          grid ? (
            <ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
          ) : (
            <div key={p.id} onClick={()=>onSelect(p)} className="pressable" style={{ display:"flex", gap:14, cursor:"pointer", background:T.gray9, borderRadius:10, padding:12 }}>
              <div style={{ width:80, height:100, background:p.grad, borderRadius:8, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:18, fontStyle:"italic", color:"rgba(0,0,0,0.22)" }}>{p.name[0]}</span>
              </div>
              <div style={{ flex:1, minWidth:0, paddingTop:2 }}>
                <p style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{p.name}</p>
                <p style={{ fontSize:12, color:T.gray4, marginBottom:6 }}>{p.cat}</p>
                <RatingStars rating={p.rating} size={11}/>
                <div style={{ marginTop:6 }}><PriceLine price={p.price} was={p.was}/></div>
              </div>
            </div>
          )
        ))}
      </div>
      <div style={{ height:120 }}/>
    </div>
  );
}

function SearchScreen({ products, onSelect, onWishlist, wishlist }) {
  const [q,setQ]       = useState("");
  const [recent]       = useState(["Cashmere","Linen","Silk dress","Trench coat"]);
  const res = useMemo(()=>q.trim().length<2?[]:products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.cat.toLowerCase().includes(q.toLowerCase())),[q]);

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ position:"relative", marginBottom:22 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search AVEN…"
          style={{ width:"100%", padding:"15px 20px 15px 48px", fontSize:16, background:T.gray9, border:"none", borderRadius:8, outline:"none", color:T.black, boxSizing:"border-box" }}/>
        <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)" }}>
          <Icon name="search" size={19} color={T.gray4}/>
        </span>
        {q&&<button onClick={()=>setQ("")} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer" }}>
          <Icon name="close" size={16} color={T.gray4}/>
        </button>}
      </div>

      {q.length<2 ? (
        <>
          <p style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>Recent Searches</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:28 }}>
            {recent.map(t=>(
              <button key={t} onClick={()=>setQ(t)} style={{ background:T.gray9, color:T.black, border:"none", padding:"10px 18px", borderRadius:99, fontSize:14, fontWeight:500, cursor:"pointer" }}>{t}</button>
            ))}
          </div>
          <p style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>Trending</p>
          <HScroll gap={10}>
            {products.slice(0,8).map(p=>(
              <ProductCard key={p.id} p={p} compact onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
            ))}
          </HScroll>
        </>
      ) : (
        <>
          <p style={{ fontSize:14, color:T.gray4, marginBottom:20 }}>{res.length} result{res.length!==1?"s":""} for "{q}"</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 10px" }}>
            {res.map(p=>(
              <ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
            ))}
          </div>
          {res.length===0&&(
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <Icon name="search" size={48} color={T.gray6}/>
              <p style={{ fontSize:16, fontWeight:600, marginTop:16, color:T.gray2 }}>No results</p>
              <p style={{ fontSize:14, color:T.gray4, marginTop:6 }}>Try a different search term</p>
            </div>
          )}
        </>
      )}
      <div style={{ height:100 }}/>
    </div>
  );
}

function WishlistScreen({ products, wishlist, onSelect, onWishlist }) {
  const items = products.filter(p=>wishlist.includes(p.id));
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <p style={{ fontSize:14, color:T.gray4, marginBottom:20 }}>{items.length} saved items</p>
      {items.length===0 ? (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:80, gap:16 }}>
          <Icon name="heart" size={56} color={T.gray6}/>
          <p style={{ fontSize:17, fontWeight:600, color:T.gray2 }}>Your wishlist is empty</p>
          <p style={{ fontSize:14, color:T.gray4 }}>Save items you love</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 10px" }}>
          {items.map(p=>(
            <ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={true}/>
          ))}
        </div>
      )}
      <div style={{ height:100 }}/>
    </div>
  );
}

function OrdersScreen() {
  const [sel,setSel] = useState(null);
  if(sel) return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ background:T.gray9, borderRadius:10, padding:20, marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <p style={{ fontSize:18, fontWeight:800, letterSpacing:-0.3, marginBottom:4 }}>{sel.id}</p>
            <p style={{ fontSize:13, color:T.gray4 }}>{sel.date}</p>
          </div>
          <StatusBadge status={sel.status}/>
        </div>
        <p style={{ fontSize:14, color:T.gray3 }}>{sel.items.join(", ")}</p>
      </div>
      <div style={{ background:T.white, borderRadius:10, padding:20, border:`1px solid ${T.gray8}`, marginBottom:20 }}>
        <p style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Tracking</p>
        <div style={{ position:"relative", paddingLeft:32 }}>
          <div style={{ position:"absolute", left:10, top:8, bottom:8, width:2, background:T.gray8, borderRadius:1 }}/>
          {sel.steps.map((step,i)=>(
            <div key={i} style={{ position:"relative", paddingBottom:i<sel.steps.length-1?24:0 }}>
              <div style={{ position:"absolute", left:-26, top:1, width:18, height:18, borderRadius:9, background:step.ok?T.black:T.gray8, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {step.ok&&<Icon name="check" size={10} color={T.white} strokeWidth={3}/>}
              </div>
              <p style={{ fontSize:14, fontWeight:step.ok?600:400, color:step.ok?T.black:T.gray5 }}>{step.l}</p>
              {step.d&&<p style={{ fontSize:12, color:T.gray4, marginTop:2 }}>{step.d}</p>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:T.gray9, borderRadius:10, padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:16, fontWeight:600 }}>Order Total</span>
          <span style={{ fontSize:16, fontWeight:800 }}>{$(sel.total)}</span>
        </div>
      </div>
      <div style={{ height:100 }}/>
    </div>
  );

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {ORDERS.map(o=>(
          <button key={o.id} onClick={()=>setSel(o)} className="pressable" style={{ background:T.gray9, borderRadius:10, padding:20, border:"none", cursor:"pointer", textAlign:"left", width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div>
                <p style={{ fontSize:16, fontWeight:700, letterSpacing:-0.2, marginBottom:3 }}>{o.id}</p>
                <p style={{ fontSize:13, color:T.gray4 }}>{o.date}</p>
              </div>
              <StatusBadge status={o.status}/>
            </div>
            <p style={{ fontSize:14, color:T.gray3, marginBottom:12 }}>{o.items.join(", ")}</p>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:16, fontWeight:700 }}>{$(o.total)}</span>
              <div style={{ display:"flex", alignItems:"center", gap:4, color:T.blue }}>
                <span style={{ fontSize:13, fontWeight:500 }}>Track order</span>
                <Icon name="chevronR" size={14} color={T.blue}/>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div style={{ height:100 }}/>
    </div>
  );
}

function AccountScreen({ onNavigate }) {
  const rows = [
    { icon:"box",      label:"My Orders",        sub:"3 orders",               go:"orders" },
    { icon:"heart",    label:"Wishlist",          sub:"4 saved items",          go:"wishlist" },
    { icon:"location", label:"Addresses",         sub:"2 saved addresses",      go:null },
    { icon:"card",     label:"Payment Methods",   sub:"Visa ····4242",          go:null },
    { icon:"gift",     label:"Refer a Friend",    sub:"Give $20, get $20",      go:null },
    { icon:"bell",     label:"Notifications",     sub:"Manage alerts",          go:null },
    { icon:"settings", label:"Settings",          sub:"Account preferences",    go:null },
  ];
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ background:"linear-gradient(145deg,#1C1C1E,#3A3A3C)", borderRadius:10, padding:"28px 22px", marginBottom:24, display:"flex", alignItems:"center", gap:18 }}>
        <div style={{ width:64, height:64, borderRadius:32, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Icon name="person" size={28} color="rgba(255,255,255,0.7)"/>
        </div>
        <div>
          <p style={{ fontSize:20, fontWeight:800, color:T.white, letterSpacing:-0.3 }}>Alex Johnson</p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", marginTop:3 }}>AVEN Premium Member</p>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
        {[["3","Orders"],["4","Wishlist"],["$862","Spent"]].map(([v,l])=>(
          <div key={l} style={{ background:T.gray9, borderRadius:10, padding:"16px 12px", textAlign:"center" }}>
            <p style={{ fontSize:22, fontWeight:800, letterSpacing:-0.5 }}>{v}</p>
            <p style={{ fontSize:12, color:T.gray4, marginTop:3 }}>{l}</p>
          </div>
        ))}
      </div>
      <div style={{ background:T.gray9, borderRadius:10, overflow:"hidden" }}>
        {rows.map((row,i)=>(
          <div key={row.label}>
            <button onClick={()=>row.go&&onNavigate(row.go)} style={{ width:"100%", display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:"none", border:"none", cursor:row.go?"pointer":"default", textAlign:"left" }}>
              <div style={{ width:38, height:38, borderRadius:8, background:T.white, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:shadow.xs }}>
                <Icon name={row.icon} size={18} color={T.black}/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:15, fontWeight:600, color:T.black }}>{row.label}</p>
                <p style={{ fontSize:12, color:T.gray4, marginTop:1 }}>{row.sub}</p>
              </div>
              <Icon name="chevronR" size={16} color={T.gray5}/>
            </button>
            {i<rows.length-1&&<Divider mx={18}/>}
          </div>
        ))}
      </div>
      <div style={{ height:120 }}/>
    </div>
  );
}

function NewArrivalsScreen({ products, onSelect, onWishlist, wishlist }) {
  const items = products.filter(p=>p.new);
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ background:"linear-gradient(135deg,#1C1C1E 0%,#3A3A3C 100%)", borderRadius:10, padding:"28px 22px", marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)", marginBottom:8 }}>Just dropped</p>
        <h2 style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:-0.8, lineHeight:1.1, marginBottom:4 }}>New Arrivals</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)" }}>SS26 Collection · {items.length} new pieces</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 10px" }}>
        {items.map(p=>(
          <ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
        ))}
      </div>
      <div style={{ height:80 }}/>
    </div>
  );
}

function SaleScreen({ products, onSelect, onWishlist, wishlist }) {
  const items = products.filter(p=>p.badge==="Sale");
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ background:"linear-gradient(135deg,#FF3B30 0%,#C0392B 100%)", borderRadius:10, padding:"28px 22px", marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.55)", marginBottom:8 }}>Limited time</p>
        <h2 style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:-0.8, lineHeight:1.1, marginBottom:4 }}>Sale</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)" }}>Up to 40% off · {items.length} styles</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 10px" }}>
        {items.map(p=>(
          <ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
        ))}
      </div>
      <div style={{ height:80 }}/>
    </div>
  );
}

const LOOKS = [
  { id:1, title:"Morning Light", desc:"Effortless layers for golden hour starts.", products:[1,7,12], grad:"linear-gradient(160deg,#EDE8E0,#D4C8B5)" },
  { id:2, title:"Urban Edge",    desc:"Polished silhouettes for the city commute.", products:[6,3,12], grad:"linear-gradient(160deg,#D8D0C8,#C4BAB0)" },
  { id:3, title:"Weekend Ease",  desc:"Relaxed fits, elevated materials.", products:[14,8,9], grad:"linear-gradient(160deg,#D8E4F2,#C2D2E4)" },
  { id:4, title:"The Edit",      desc:"Our curated selection for the season.", products:[2,11,5], grad:"linear-gradient(160deg,#F0ECE4,#DED4C6)" },
];

function LookbookScreen({ products, onSelect, onWishlist, wishlist }) {
  const [activeLook, setActiveLook] = useState(null);
  const look = activeLook ? LOOKS.find(l=>l.id===activeLook) : null;
  const lookProducts = look ? look.products.map(id=>products.find(p=>p.id===id)).filter(Boolean) : [];

  if(look) return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <button onClick={()=>setActiveLook(null)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", marginBottom:16, color:T.gray3, fontSize:14, fontWeight:500 }}>
        <Icon name="back" size={18} color={T.gray3}/> All Looks
      </button>
      <div style={{ aspectRatio:"4/3", background:look.grad, borderRadius:10, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:36, fontWeight:200, color:"rgba(0,0,0,0.18)", fontStyle:"italic" }}>{look.title}</span>
      </div>
      <h2 style={{ fontSize:22, fontWeight:800, letterSpacing:-0.5, marginBottom:6 }}>{look.title}</h2>
      <p style={{ fontSize:14, color:T.gray4, marginBottom:20, lineHeight:1.6 }}>{look.desc}</p>
      <p style={{ fontSize:13, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14, color:T.gray2 }}>Shop The Look</p>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {lookProducts.map(p=>(
          <div key={p.id} onClick={()=>onSelect(p)} className="pressable" style={{ display:"flex", gap:14, cursor:"pointer", background:T.gray9, borderRadius:10, padding:12 }}>
            <div style={{ width:72, height:90, background:p.grad, borderRadius:8, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:16, fontStyle:"italic", color:"rgba(0,0,0,0.22)" }}>{p.name[0]}</span>
            </div>
            <div style={{ flex:1, minWidth:0, paddingTop:2 }}>
              <p style={{ fontSize:14, fontWeight:700, marginBottom:3 }}>{p.name}</p>
              <p style={{ fontSize:12, color:T.gray4, marginBottom:6 }}>{p.cat}</p>
              <PriceLine price={p.price} was={p.was}/>
            </div>
            <button onClick={e=>{e.stopPropagation();onWishlist(p.id);}} style={{ background:"none", border:"none", cursor:"pointer", alignSelf:"center" }}>
              <Icon name={wishlist.includes(p.id)?"heart-fill":"heart"} size={18} color={wishlist.includes(p.id)?T.red:T.gray5}/>
            </button>
          </div>
        ))}
      </div>
      <div style={{ height:80 }}/>
    </div>
  );

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ marginBottom:16 }}>
        <p style={{ fontSize:22, fontWeight:800, letterSpacing:-0.5, marginBottom:4 }}>Lookbook</p>
        <p style={{ fontSize:14, color:T.gray4 }}>SS26 — Curated edits for the season</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {LOOKS.map((look, i) => (
          <button key={look.id} onClick={()=>setActiveLook(look.id)} className="pressable" style={{ width:"100%", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
            <div style={{ aspectRatio: i%2===0?"16/9":"4/3", background:look.grad, borderRadius:10, marginBottom:10, display:"flex", alignItems:"flex-end", padding:20 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(0,0,0,0.4)", marginBottom:4 }}>Look {String(look.id).padStart(2,"0")}</p>
                <p style={{ fontSize:22, fontWeight:800, color:T.black, letterSpacing:-0.5 }}>{look.title}</p>
              </div>
            </div>
            <p style={{ fontSize:13, color:T.gray4 }}>{look.desc}</p>
          </button>
        ))}
      </div>
      <div style={{ height:80 }}/>
    </div>
  );
}

function SustainabilityScreen() {
  const pillars = [
    { icon:"sparkle", title:"Responsible Materials", body:"We source only certified organic, recycled, and sustainably-farmed fibres. Every fabric is traceable from field to finished garment." },
    { icon:"trending", title:"Carbon Neutral by 2028", body:"We've mapped our full supply chain emissions and are investing in verified offset programmes while reducing at source." },
    { icon:"box",     title:"Zero-Waste Packaging",  body:"All our packaging is made from 100% recycled or FSC-certified materials. No single-use plastics. Ever." },
    { icon:"returns", title:"Circular Programme",    body:"Return worn pieces for store credit. We repair, resell, or responsibly recycle — keeping garments in use for longer." },
  ];
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ background:"linear-gradient(135deg,#1A2E1A 0%,#2E4A2E 100%)", borderRadius:10, padding:"32px 22px", marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)", marginBottom:8 }}>Our commitment</p>
        <h2 style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:-0.8, lineHeight:1.1, marginBottom:8 }}>Better Fashion</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>We believe beautiful clothes and a healthier planet are not in conflict.</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
        {pillars.map(p=>(
          <div key={p.title} style={{ background:T.gray9, borderRadius:10, padding:"18px 16px", display:"flex", gap:14, alignItems:"flex-start" }}>
            <div style={{ width:40, height:40, borderRadius:8, background:T.black, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon name={p.icon} size={18} color={T.white}/>
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{p.title}</p>
              <p style={{ fontSize:13, color:T.gray3, lineHeight:1.6 }}>{p.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:"linear-gradient(135deg,#E8F5EC,#D8EDD8)", borderRadius:10, padding:"20px 18px", marginBottom:16 }}>
        <p style={{ fontSize:16, fontWeight:800, color:"#1A5C1A", marginBottom:4 }}>2025 Impact Report</p>
        <p style={{ fontSize:13, color:"#2E7A2E", lineHeight:1.6 }}>78% of materials certified sustainable · 42% emissions reduction since 2022 · 12,000+ garments returned & rehomed</p>
      </div>
      <div style={{ height:80 }}/>
    </div>
  );
}

function Logo({ color = "#000", height = 18 }) {
  return (
    <svg height={height} viewBox="0 0 220 32" fill="none" xmlns="http:
      <path d="M2 28V4h3.5l6.5 14L18.5 4H22v24h-3.5V11l-5.5 12h-2L5.5 11V28H2z" fill={color}/>
      <path d="M28 22.5c1.2 1.2 2.8 2 5 2 2 0 3.4-.9 3.4-2.4 0-1.3-.8-2-3.2-2.8-3.2-1-5.2-2.3-5.2-5.1 0-2.9 2.4-4.9 5.8-4.9 2.2 0 4 .7 5.3 1.8l-1.8 2.4c-1-.9-2.2-1.4-3.6-1.4-1.8 0-2.8.9-2.8 2.1 0 1.3.9 1.9 3.4 2.7 3.2 1 5 2.4 5 5.2 0 3-2.4 5.2-6.4 5.2-2.6 0-4.8-.9-6.4-2.4l1.5-2.4z" fill={color}/>
      <path d="M48 28l7-18.5h3.5L65.5 28H62l-1.6-4.5h-7.8L51 28h-3zm5.5-7.2h5.8l-2.9-8-2.9 8z" fill={color}/>
      <path d="M70 28V9.5h3.5l6.5 14 6.5-14H90V28h-3.5V16l-5.5 12h-2L73.5 16V28H70z" fill={color}/>
      <path d="M96 28V9.5h7c3.4 0 5.5 1.8 5.5 4.5 0 1.8-.9 3.1-2.3 3.8 1.8.6 3 2.1 3 4.2 0 3.2-2.3 6-7.2 6H96zm3.4-10.8h3.4c1.8 0 2.8-.9 2.8-2.3 0-1.4-1-2.2-2.8-2.2h-3.4v4.5zm0 8h4c2.2 0 3.4-1.1 3.4-3 0-1.8-1.2-2.8-3.4-2.8h-4v5.8z" fill={color}/>
      <path d="M113 9.5h3.6l3.9 14 4-14h3.2l4 14 3.9-14h3.6L134 28h-3.5l-3.9-13.5L122.7 28h-3.5L113 9.5z" fill={color}/>
      <path d="M140 28l7-18.5h3.5L157.5 28H154l-1.6-4.5h-7.8L143 28h-3zm5.5-7.2h5.8l-2.9-8-2.9 8z" fill={color}/>
      <rect x="162" y="9" width="1" height="20" fill={color} opacity="0.2"/>
      <path d="M172 18.8c0-5.6 3.8-9.8 9-9.8 3 0 5.2 1.2 6.8 3.2l-2.4 2c-1.1-1.4-2.6-2.2-4.4-2.2-3.2 0-5.4 2.6-5.4 6.8 0 4.2 2.2 6.8 5.4 6.8 1.8 0 3.3-.8 4.4-2.2l2.4 2c-1.6 2-3.8 3.2-6.8 3.2-5.2 0-9-4.2-9-9.8z" fill={color}/>
    </svg>
  );
}

function Header({ screen, cartCount, onCart, onNavigate, canGoBack, onBack, wishlistCount }) {
  const screenTitles = { home:"", shop:"Shop", search:"Search", wishlist:"Wishlist", account:"Account", orders:"Orders", product:"", "new-arrivals":"New Arrivals", sale:"Sale", lookbook:"Lookbook", sustainability:"Sustainability" };
  const title = screenTitles[screen] || "";

  return (
    <header style={{ background:"rgba(255,255,255,0.94)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${T.gray8}`, position:"sticky", top:0, zIndex:200, userSelect:"none" }}>
      <div style={{ height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:4, minWidth:80 }}>
          {canGoBack
            ? <IconBtn icon="back" onClick={onBack} size={36} bg="transparent"/>
            : <button onClick={()=>onNavigate("home")} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 0" }}>
                <Logo height={16}/>
              </button>
          }
        </div>
        <span style={{ fontSize:17, fontWeight:700, letterSpacing:-0.3, position:"absolute", left:"50%", transform:"translateX(-50%)" }}>
          {canGoBack ? title : ""}
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:80, justifyContent:"flex-end" }}>
          {screen!=="search"  && <IconBtn icon="search"  onClick={()=>onNavigate("search")}   size={36} bg="transparent"/>}
          {screen!=="wishlist"&& <IconBtn icon="heart"   onClick={()=>onNavigate("wishlist")} size={36} bg="transparent" badge={wishlistCount>0?wishlistCount:0}/>}
          <IconBtn icon="bag" onClick={onCart} size={36} bg="transparent" badge={cartCount}/>
        </div>
      </div>
    </header>
  );
}

function BottomNav({ screen, onNavigate }) {
  const tabs = [
    { s:"home",     icon:"home",    label:"Home" },
    { s:"shop",     icon:"grid",    label:"Shop" },
    { s:"search",   icon:"search",  label:"Search" },
    { s:"wishlist", icon:"heart",   label:"Saved" },
    { s:"account",  icon:"person",  label:"Account" },
  ];
  const mainScreens = ["home","shop","search","wishlist","account"];
  const active = mainScreens.includes(screen) ? screen : "shop";

  return (
    <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderTop:`1px solid ${T.gray8}`, zIndex:200, paddingBottom:"env(safe-area-inset-bottom)" }}>
      <div style={{ display:"flex", height:64 }}>
        {tabs.map(tab=>{
          const isActive = active===tab.s;
          return (
            <button key={tab.s} onClick={()=>onNavigate(tab.s)}
              style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, background:"none", border:"none", cursor:"pointer", position:"relative", transition:"opacity 0.15s" }}>
              {isActive && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:28, height:3, background:T.black, borderRadius:"0 0 3px 3px" }}/>}
              <Icon name={tab.icon} size={26} color={isActive?T.black:T.gray5} strokeWidth={isActive?2.2:1.6}/>
              <span style={{ fontSize:10, fontWeight:isActive?700:400, color:isActive?T.black:T.gray5, letterSpacing:"0.02em" }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function Page() {
  const [history,  setHistory]  = useState([{screen:"home"}]);
  const [cart,     setCart]     = useState([]);
  const [wishlist, setWishlist] = useState(WISHLIST_IDS);
  const [cartOpen, setCartOpen] = useState(false);

  const current    = history[history.length-1];
  const canGoBack  = history.length > 1;

  const navigate = (screen, data=null) => {
    window.history.pushState({ idx:history.length }, "");
    setHistory(prev=>[...prev,{ screen, data }]);
    setTimeout(()=>{ const el=document.getElementById("__main"); if(el) el.scrollTop=0; },10);
  };

  const goBack = () => {
    setHistory(prev => prev.length>1 ? prev.slice(0,-1) : prev);
    setTimeout(()=>{ const el=document.getElementById("__main"); if(el) el.scrollTop=0; },10);
  };
  useEffect(()=>{
    const h = () => { if(cartOpen){ setCartOpen(false); return; } goBack(); };
    window.addEventListener("popstate", h);
    return () => window.removeEventListener("popstate", h);
  }, [history, cartOpen]);
  const addToCart = p => {
    setCart(prev=>{
      const key=`${p.id}-${p.sz}`;
      const ex=prev.find(i=>`${i.id}-${i.sz}`===key);
      if(ex) return prev.map(i=>`${i.id}-${i.sz}`===key?{...i,qty:i.qty+1}:i);
      return [...prev,{...p,qty:1}];
    });
    setCartOpen(true);
  };
  const quickAdd       = p => addToCart({...p, sz:p.sizes[0]});
  const removeFromCart = item => setCart(prev=>prev.filter(i=>!(i.id===item.id&&i.sz===item.sz)));
  const updateQty      = (item,qty) => { if(qty<1){removeFromCart(item);return;} setCart(prev=>prev.map(i=>i.id===item.id&&i.sz===item.sz?{...i,qty}:i)); };
  const cartCount      = cart.reduce((s,i)=>s+i.qty,0);
  const toggleWishlist = id => setWishlist(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);

  const sp = { onSelect:p=>navigate("product",p), onWishlist:toggleWishlist, wishlist };

  const renderScreen = () => {
    const {screen,data} = current;
    if(screen==="home")          return <HomeScreen   products={PRODUCTS} onNavigate={navigate} {...sp}/>;
    if(screen==="shop")          return <ShopScreen   products={PRODUCTS} {...sp}/>;
    if(screen==="search")        return <SearchScreen products={PRODUCTS} {...sp}/>;
    if(screen==="wishlist")      return <WishlistScreen products={PRODUCTS} wishlist={wishlist} onSelect={p=>navigate("product",p)} onWishlist={toggleWishlist}/>;
    if(screen==="orders")        return <OrdersScreen/>;
    if(screen==="account")       return <AccountScreen onNavigate={navigate}/>;
    if(screen==="product")       return <ProductDetail p={data} onBack={goBack} onAdd={addToCart} wishlisted={wishlist.includes(data?.id)} onWishlist={toggleWishlist}/>;
    if(screen==="new-arrivals")  return <NewArrivalsScreen products={PRODUCTS} {...sp}/>;
    if(screen==="sale")          return <SaleScreen products={PRODUCTS} {...sp}/>;
    if(screen==="lookbook")      return <LookbookScreen products={PRODUCTS} {...sp}/>;
    if(screen==="sustainability") return <SustainabilityScreen/>;
    return <HomeScreen products={PRODUCTS} onNavigate={navigate} {...sp}/>;
  };

  const screenTitles = { home:"", shop:"Shop", search:"Search", wishlist:"Wishlist", account:"Account", orders:"Orders", product:"", "new-arrivals":"New Arrivals", sale:"Sale", lookbook:"Lookbook", sustainability:"Sustainability" };

  return (
    <>
<div style={{ height:"100dvh", display:"flex", flexDirection:"column", background:T.white, fontFamily:"'Geist',-apple-system,sans-serif", overflow:"hidden" }}>
        <Header
          screen={current.screen}
          cartCount={cartCount}
          onCart={()=>setCartOpen(true)}
          onNavigate={navigate}
          canGoBack={canGoBack}
          onBack={goBack}
          wishlistCount={wishlist.length}
        />

        <div id="__main" style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          <div style={{ maxWidth:600, margin:"0 auto", padding:"10px 14px 80px" }}>
            {renderScreen()}
          </div>
        </div>

        <BottomNav screen={current.screen} onNavigate={navigate}/>

        {cartOpen && (
          <CartDrawer
            cart={cart}
            onClose={()=>setCartOpen(false)}
            onRemove={removeFromCart}
            onQty={updateQty}
            onNavigate={navigate}
          />
        )}
      </div>
    </>
  );
}
