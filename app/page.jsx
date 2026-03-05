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
    signIn:"Sign In", signUp:"Sign Up", signOut:"Sign Out",
    email:"Email", password:"Password", confirmPassword:"Confirm Password",
    editProfile:"Edit Profile", profile:"Profile",
    firstName:"First Name", lastName:"Last Name", phone:"Phone",
    saveChanges:"Save Changes", cancel:"Cancel",
    loginRequired:"Sign in required",
    loginRequiredBody:"Create a free account to access this feature.",
    createAccount:"Create Account", alreadyAccount:"Already have an account?",
    noAccount:"No account yet?",
    guestUser:"Guest", member:"MSAMBWA Member",
    loginToUnlock:"Sign in to unlock",
    address:"Address", addAddress:"Add Address",
    street:"Street", city:"City", country:"Country", postcode:"Postcode",
    notificationsDesc:"Manage your notification preferences",
    pushNotifications:"Push Notifications", emailNotifications:"Email Notifications",
    orderUpdates:"Order Updates", promotions:"Promotions", newArrivalsAlert:"New Arrivals",
    settingsDesc:"App preferences",
    darkMode:"Dark Mode", language:"Language", currency:"Currency",
    privacyPolicy:"Privacy Policy", termsOfService:"Terms of Service",
    deleteAccount:"Delete Account",
    ourStoryTitle:"Our Story", ourStoryBody:"MSAMBWA was founded with a simple belief: that beautiful, considered fashion should be accessible to everyone. We source our pieces from ethical manufacturers across the globe, ensuring every garment tells a story of craftsmanship and care.\n\nOur name, MSAMBWA, means 'spirit' in Swahili — a reminder that we put soul into everything we do. From our carefully curated collections to our personal customer service, we believe fashion is more than clothing — it's how you carry yourself through the world.",
    returnsTitle:"Returns & Exchanges", returnsBody:"We want you to love every piece. If you're not completely satisfied, we offer hassle-free returns within 30 days of delivery.\n\nTo start a return, contact us at hello@msambwa.com with your order number and reason for return. Items must be unworn, unwashed, and in original packaging with tags attached.\n\nRefunds are processed within 5–7 business days of receiving your return.",
    sustainabilityTitle:"Sustainability", sustainabilityBody:"At MSAMBWA, sustainability isn't just a buzzword — it's woven into everything we do. We partner only with manufacturers who meet our strict ethical and environmental standards.\n\nOur packaging is 100% recyclable. We offset our carbon emissions through verified reforestation projects. And we design pieces to last — because the most sustainable garment is one you wear for years, not seasons.",
    lookbookTitle:"Lookbook", lookbookSeason:"SS26 Collection",
  },
  sw: {
    home:"Nyumbani", shop:"Duka", search:"Tafuta", saved:"Zilizohifadhiwa", account:"Akaunti",
    wishlist:"Orodha ya Matakwa", myBag:"Mfuko Wangu", checkout:"Malipo →",
    addToBag:"Ongeza Kwenye Mfuko", addedToBag:"Imeongezwa ✓",
    freeShipping:"Usafirishaji Bure", freeReturns:"Kurudisha Bure",
    newIn:"Mpya ✦", trendingNow:"Inayoongoza Sasa 🔥", onSale:"Punguzo",
    viewAll:"Angalia Zote", seeAll:"Angalia Zote", browse:"Tazama",
    noSaved:"Orodha yako ya matakwa ni tupu", saveItemsYouLove:"Hifadhi vitu unavyovipenda",
    emptyBag:"Mfuko wako ni tupu", continueShopping:"Endelea Kununua",
    freeShippingQualify:"Unastahili usafirishaji bure!",
    addMore:"Ongeza", moreForFreeShipping:"zaidi kwa usafirishaji bure",
    noResults:"Hakuna matokeo", tryDifferent:"Jaribu neno tofauti la utafutaji",
    newArrivals:"Waliofika Hivi Karibuni", orders:"Maagizo", myOrders:"Maagizo Yangu",
    addresses:"Anwani", paymentMethods:"Njia za Malipo",
    referFriend:"Mwambie Rafiki", notifications:"Arifa",
    settings:"Mipangilio", ourStory:"Hadithi Yetu", returns:"Kurudisha",
    privacy:"Faragha", lookbook:"Albamu", sustainability:"Uendelevu",
    requestToBuy:"Ombi la Kununua", yourName:"Jina Lako",
    yourEmail:"Barua Pepe Yako", yourPhone:"Simu (si lazima)",
    deliveryAddress:"Anwani ya Usafirishaji", noteToSeller:"Kumbuka (si lazima)",
    submitRequest:"Wasilisha Ombi", requestSent:"Ombi Limetumwa! ✓",
    size:"Ukubwa", colour:"Rangi", description:"Maelezo",
    loading:"Inapakia…", language:"Lugha",
    noProducts:"Hakuna bidhaa bado",
    noProductsBody:"Mkusanyiko wetu unatengenezwa. Rudi hivi karibuni.",
    signIn:"Ingia", signUp:"Jisajili", signOut:"Toka",
    email:"Barua Pepe", password:"Nenosiri", confirmPassword:"Thibitisha Nenosiri",
    editProfile:"Hariri Wasifu", profile:"Wasifu",
    firstName:"Jina la Kwanza", lastName:"Jina la Familia", phone:"Simu",
    saveChanges:"Hifadhi Mabadiliko", cancel:"Ghairi",
    loginRequired:"Inahitajika Kuingia",
    loginRequiredBody:"Fungua akaunti bila malipo kupata huduma hii.",
    createAccount:"Fungua Akaunti", alreadyAccount:"Una akaunti tayari?",
    noAccount:"Huna akaunti bado?",
    guestUser:"Mgeni", member:"Mwanachama wa MSAMBWA",
    loginToUnlock:"Ingia ili ufungue",
    address:"Anwani", addAddress:"Ongeza Anwani",
    street:"Mtaa", city:"Mji", country:"Nchi", postcode:"Msimbo wa Posta",
    notificationsDesc:"Simamia mapendeleo yako ya arifa",
    pushNotifications:"Arifa za Push", emailNotifications:"Arifa za Barua Pepe",
    orderUpdates:"Masasisho ya Maagizo", promotions:"Matangazo", newArrivalsAlert:"Waliofika Wapya",
    settingsDesc:"Mapendeleo ya programu",
    darkMode:"Hali ya Giza", language:"Lugha", currency:"Sarafu",
    privacyPolicy:"Sera ya Faragha", termsOfService:"Masharti ya Huduma",
    deleteAccount:"Futa Akaunti",
    ourStoryTitle:"Hadithi Yetu", ourStoryBody:"MSAMBWA ilianzishwa na imani moja rahisi: kwamba mitindo nzuri na ya kufikiria inapaswa kupatikana kwa kila mtu.",
    returnsTitle:"Kurudisha na Kubadilishana", returnsBody:"Tunataka upende kila kipande. Ikiwa hukuridhika kabisa, tunakupa kurudisha bila shida ndani ya siku 30 za uwasilishaji.",
    sustainabilityTitle:"Uendelevu", sustainabilityBody:"Katika MSAMBWA, uendelevu si tu neno — umefumwa katika kila kitu tunachofanya.",
    lookbookTitle:"Albamu", lookbookSeason:"Mkusanyiko wa SS26",
  },
  fr: {
    home:"Accueil", shop:"Boutique", search:"Rechercher", saved:"Sauvegardés", account:"Compte",
    wishlist:"Liste de souhaits", myBag:"Mon sac", checkout:"Commander →",
    addToBag:"Ajouter au sac", addedToBag:"Ajouté ✓",
    freeShipping:"Livraison gratuite", freeReturns:"Retours gratuits",
    newIn:"Nouveautés ✦", trendingNow:"Tendances 🔥", onSale:"En solde",
    viewAll:"Voir tout", seeAll:"Voir tout", browse:"Parcourir",
    noSaved:"Votre liste de souhaits est vide", saveItemsYouLove:"Sauvegardez vos favoris",
    emptyBag:"Votre sac est vide", continueShopping:"Continuer vos achats",
    freeShippingQualify:"Vous bénéficiez de la livraison gratuite!",
    addMore:"Ajoutez", moreForFreeShipping:"de plus pour la livraison gratuite",
    noResults:"Aucun résultat", tryDifferent:"Essayez un autre terme",
    newArrivals:"Nouveautés", orders:"Commandes", myOrders:"Mes commandes",
    addresses:"Adresses", paymentMethods:"Modes de paiement",
    referFriend:"Parrainer un ami", notifications:"Notifications",
    settings:"Paramètres", ourStory:"Notre histoire", returns:"Retours",
    privacy:"Confidentialité", lookbook:"Lookbook", sustainability:"Durabilité",
    requestToBuy:"Demande d'achat", yourName:"Votre nom",
    yourEmail:"Votre e-mail", yourPhone:"Téléphone (optionnel)",
    deliveryAddress:"Adresse de livraison", noteToSeller:"Note (optionnel)",
    submitRequest:"Soumettre", requestSent:"Demande envoyée! ✓",
    size:"Taille", colour:"Couleur", description:"Description",
    loading:"Chargement…", language:"Langue",
    noProducts:"Pas encore de produits",
    noProductsBody:"Notre collection est en cours de curation. Revenez bientôt.",
    signIn:"Se connecter", signUp:"S'inscrire", signOut:"Se déconnecter",
    email:"E-mail", password:"Mot de passe", confirmPassword:"Confirmer le mot de passe",
    editProfile:"Modifier le profil", profile:"Profil",
    firstName:"Prénom", lastName:"Nom de famille", phone:"Téléphone",
    saveChanges:"Enregistrer", cancel:"Annuler",
    loginRequired:"Connexion requise",
    loginRequiredBody:"Créez un compte gratuit pour accéder à cette fonctionnalité.",
    createAccount:"Créer un compte", alreadyAccount:"Déjà un compte?",
    noAccount:"Pas encore de compte?",
    guestUser:"Invité", member:"Membre MSAMBWA",
    loginToUnlock:"Connectez-vous pour accéder",
    address:"Adresse", addAddress:"Ajouter une adresse",
    street:"Rue", city:"Ville", country:"Pays", postcode:"Code postal",
    notificationsDesc:"Gérez vos préférences de notification",
    pushNotifications:"Notifications push", emailNotifications:"Notifications par e-mail",
    orderUpdates:"Mises à jour des commandes", promotions:"Promotions", newArrivalsAlert:"Nouvelles arrivées",
    settingsDesc:"Préférences de l'application",
    darkMode:"Mode sombre", language:"Langue", currency:"Devise",
    privacyPolicy:"Politique de confidentialité", termsOfService:"Conditions d'utilisation",
    deleteAccount:"Supprimer le compte",
    ourStoryTitle:"Notre Histoire", ourStoryBody:"MSAMBWA a été fondée avec une conviction simple : que la mode belle et réfléchie devrait être accessible à tous.",
    returnsTitle:"Retours & Échanges", returnsBody:"Nous voulons que vous aimiez chaque pièce. Si vous n'êtes pas entièrement satisfait, nous offrons des retours sans tracas dans les 30 jours suivant la livraison.",
    sustainabilityTitle:"Durabilité", sustainabilityBody:"Chez MSAMBWA, la durabilité n'est pas qu'un mot à la mode — elle est tissée dans tout ce que nous faisons.",
    lookbookTitle:"Lookbook", lookbookSeason:"Collection SS26",
  },
};

const LANGS = [
  { code:"en", label:"English",   flag:"🇬🇧" },
  { code:"sw", label:"Kiswahili", flag:"🇰🇪" },
  { code:"fr", label:"Français",  flag:"🇫🇷" },
];

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

/* ─── Auth Gate HOC ─────────────────────────────────────────── */
function AuthGate({ user, onLogin, children, t }) {
  if (user) return children;
  return (
    <div style={{ animation:"fadeIn .25s ease", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 24px", gap:20, textAlign:"center" }}>
      <div style={{ fontSize:56 }}>🔒</div>
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
      <div onClick={onClose} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)" }}/>
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
function AccountScreen({ onNavigate, user, onLogin, onLogout, t }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || t.guestUser;

  const publicRows = [
    { icon:"box",      label:t.myOrders,      sub:"Track your purchases",      go:"orders"       },
    { icon:"heart",    label:t.wishlist,       sub:"Your saved items",          go:"wishlist"     },
    { icon:"share",    label:t.ourStory,       sub:"Who we are",                go:"our-story"    },
    { icon:"truck",    label:t.returns,        sub:"30-day easy returns",       go:"returns"      },
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

  const Row = ({ icon, label, sub, go, auth }) => {
    const locked = auth && !user;
    return (
      <button
        onClick={()=> locked ? onLogin() : onNavigate(go)}
        style={{ width:"100%",display:"flex",alignItems:"center",gap:14,padding:"15px 18px",background:"none",border:"none",cursor:"pointer",textAlign:"left" }}
      >
        <div style={{ width:38,height:38,borderRadius:10,background:T.fill3,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <Icon name={icon} size={18} color={T.black}/>
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
    <div style={{ animation:"fadeIn .25s ease" }}>
      {/* Profile hero */}
      <div style={{ background:"linear-gradient(145deg,#1C1C1E,#3A3A3C)",borderRadius:24,padding:"24px",marginBottom:24 }}>
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

      <p style={{ textAlign:"center",fontSize:12,color:T.gray6,marginBottom:8 }}>MSAMBWA · v1.0.0</p>
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
    <div style={{ animation:"fadeIn .25s ease" }}>
      {saved && (
        <div style={{ background:"#e8faf0",borderRadius:14,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:10 }}>
          <span style={{ fontSize:18 }}>✅</span>
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
function AddressesScreen({ t }) {
  const [addresses, setAddresses] = useState([]);
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState({ street:"", city:"", country:"", postcode:"" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const addAddress = () => {
    if (!form.street || !form.city) return;
    setAddresses(a=>[...a, { ...form, id: Date.now() }]);
    setForm({ street:"", city:"", country:"", postcode:"" });
    setAdding(false);
  };

  const inp = (label, key, placeholder) => (
    <input value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={`${label}…`}
      style={{ width:"100%",padding:"12px 14px",fontSize:15,background:T.fill3,border:`1.5px solid ${T.gray8}`,borderRadius:12,color:T.black,outline:"none",boxSizing:"border-box",fontFamily:"-apple-system,sans-serif",marginBottom:10 }}/>
  );

  return (
    <div style={{ animation:"fadeIn .25s ease" }}>
      {addresses.length === 0 && !adding && (
        <EmptyState icon="📍" title="No addresses saved" body="Add a delivery address to speed up checkout." action={<Btn onClick={()=>setAdding(true)} size="sm">{t.addAddress}</Btn>}/>
      )}
      {addresses.map((a,i) => (
        <div key={a.id} style={{ background:T.fill4,borderRadius:16,padding:"16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:15,fontWeight:600,margin:"0 0 3px" }}>{a.street}</p>
            <p style={{ fontSize:13,color:T.gray4,margin:0 }}>{a.city}{a.postcode ? `, ${a.postcode}` : ""}{a.country ? ` · ${a.country}` : ""}</p>
          </div>
          <button onClick={()=>setAddresses(arr=>arr.filter(x=>x.id!==a.id))} style={{ background:"none",border:"none",cursor:"pointer",padding:4 }}>
            <Icon name="close" size={16} color={T.gray5}/>
          </button>
        </div>
      ))}
      {adding ? (
        <div style={{ background:T.white,borderRadius:20,padding:"18px",boxShadow:shadow.xs }}>
          <p style={{ fontSize:16,fontWeight:700,marginBottom:14 }}>{t.addAddress}</p>
          {inp(t.street,   "street",   t.street)}
          {inp(t.city,     "city",     t.city)}
          {inp(t.postcode, "postcode", t.postcode)}
          {inp(t.country,  "country",  t.country)}
          <div style={{ display:"flex",gap:10,marginTop:4 }}>
            <Btn full onClick={addAddress} style={{ borderRadius:12,padding:"13px" }}>Save</Btn>
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
function NotificationsScreen({ t }) {
  const [prefs, setPrefs] = useState({ push:true, email:true, orders:true, promos:false, newArrivals:true });
  const toggle = k => setPrefs(p=>({...p,[k]:!p[k]}));
  const Toggle = ({ on, onChange }) => (
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
      <Toggle on={prefs[k]} onChange={()=>toggle(k)}/>
    </div>
  );
  return (
    <div style={{ animation:"fadeIn .25s ease" }}>
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
    <div style={{ animation:"fadeIn .25s ease" }}>
      <div style={{ background:T.fill4,borderRadius:20,overflow:"hidden",marginBottom:16 }}>
        <Row label={t.language}>
          <div style={{ display:"flex",gap:8 }}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>setLang(l.code)} style={{ padding:"7px 14px",borderRadius:99,border:`1.5px solid ${lang===l.code?T.black:T.gray8}`,background:lang===l.code?T.black:T.white,color:lang===l.code?T.white:T.black,fontSize:13,fontWeight:lang===l.code?700:400,cursor:"pointer",transition:"all .15s" }}>
                {l.flag} {l.code.toUpperCase()}
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

      <p style={{ textAlign:"center",fontSize:12,color:T.gray6,marginTop:8 }}>MSAMBWA · v1.0.0 · Built with ❤️</p>
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
    <div style={{ animation:"fadeIn .25s ease" }}>
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
    <div style={{ animation:"fadeIn .25s ease" }}>
      <div style={{ background:"linear-gradient(145deg,#1C1C1E,#3A3A3C)",borderRadius:24,padding:"36px 24px",marginBottom:28,textAlign:"center" }}>
        <p style={{ fontSize:40,margin:"0 0 16px" }}>✨</p>
        <h2 style={{ fontSize:28,fontWeight:800,color:"#fff",letterSpacing:"-0.8px",margin:"0 0 10px" }}>{t.ourStoryTitle}</h2>
        <p style={{ fontSize:14,color:"rgba(255,255,255,0.5)",margin:0 }}>Since 2024</p>
      </div>
      {t.ourStoryBody.split("\n\n").map((para,i) => (
        <p key={i} style={{ fontSize:15,color:T.gray3,lineHeight:1.8,marginBottom:20 }}>{para}</p>
      ))}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:8,marginBottom:20 }}>
        {[["🌍","Ethical\nSourcing"],["✂️","Expert\nCraft"],["💚","Sustainable\nFuture"]].map(([e,l])=>(
          <div key={l} style={{ background:T.fill4,borderRadius:16,padding:"18px 12px",textAlign:"center" }}>
            <p style={{ fontSize:28,margin:"0 0 8px" }}>{e}</p>
            <p style={{ fontSize:12,fontWeight:600,color:T.gray3,margin:0,whiteSpace:"pre-line",lineHeight:1.4 }}>{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Returns Screen ────────────────────────────────────────── */
function ReturnsScreen({ t }) {
  const steps = [
    { icon:"✉️", title:"Contact Us",    body:"Email hello@msambwa.com with your order number and reason for return." },
    { icon:"📦", title:"Pack It Up",    body:"Place items in original packaging, unworn and with tags attached." },
    { icon:"🚚", title:"Ship It Back",  body:"We'll email you a prepaid return label within 24 hours." },
    { icon:"💳", title:"Get Refunded",  body:"Refunds processed within 5–7 business days of receiving your return." },
  ];
  return (
    <div style={{ animation:"fadeIn .25s ease" }}>
      <div style={{ background:"#e8f4fd",borderRadius:20,padding:"20px",marginBottom:24,display:"flex",gap:14,alignItems:"flex-start" }}>
        <span style={{ fontSize:28,flexShrink:0 }}>ℹ️</span>
        <div>
          <p style={{ fontSize:15,fontWeight:700,margin:"0 0 4px",color:T.blue }}>30-Day Returns</p>
          <p style={{ fontSize:13,color:T.gray3,margin:0,lineHeight:1.6 }}>Items must be unworn, unwashed, and in original packaging with tags attached.</p>
        </div>
      </div>
      <p style={{ fontSize:18,fontWeight:700,marginBottom:16,letterSpacing:"-0.4px" }}>How it works</p>
      {steps.map((s,i) => (
        <div key={i} style={{ display:"flex",gap:16,marginBottom:20 }}>
          <div style={{ width:44,height:44,borderRadius:22,background:T.fill4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22 }}>{s.icon}</div>
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
    { emoji:"♻️", title:"Recyclable Packaging",  body:"100% of our packaging is made from recycled or recyclable materials. We've eliminated single-use plastics entirely." },
    { emoji:"🌱", title:"Carbon Offset",          body:"We offset 100% of our shipping emissions through verified reforestation projects in East Africa." },
    { emoji:"🤝", title:"Ethical Manufacturing",  body:"All manufacturing partners are audited annually for fair wages, safe conditions, and environmental compliance." },
    { emoji:"👗", title:"Designed to Last",        body:"We design pieces with longevity in mind — the most sustainable garment is one you wear for years, not seasons." },
  ];
  return (
    <div style={{ animation:"fadeIn .25s ease" }}>
      <div style={{ background:"linear-gradient(145deg,#1a4a2e,#2d7a47)",borderRadius:24,padding:"32px 24px",marginBottom:28,textAlign:"center" }}>
        <p style={{ fontSize:40,margin:"0 0 12px" }}>🌿</p>
        <h2 style={{ fontSize:26,fontWeight:800,color:"#fff",letterSpacing:"-0.6px",margin:"0 0 8px" }}>{t.sustainabilityTitle}</h2>
        <p style={{ fontSize:14,color:"rgba(255,255,255,0.6)",margin:0 }}>Fashion that respects the planet</p>
      </div>
      {pillars.map((p,i) => (
        <div key={i} style={{ background:T.fill4,borderRadius:18,padding:"18px",marginBottom:12,display:"flex",gap:14 }}>
          <div style={{ width:48,height:48,borderRadius:14,background:"rgba(52,199,89,0.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:24 }}>{p.emoji}</div>
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
  const featured = products.slice(0, 6);
  const imgs = [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
  ];
  return (
    <div style={{ animation:"fadeIn .25s ease" }}>
      <div style={{ marginBottom:24 }}>
        <p style={{ fontSize:13,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",color:T.gray4,marginBottom:6 }}>{t.lookbookSeason}</p>
        <h2 style={{ fontSize:28,fontWeight:800,letterSpacing:"-0.8px",marginBottom:4 }}>{t.lookbookTitle}</h2>
        <p style={{ fontSize:14,color:T.gray4 }}>Explore the season's most refined pieces</p>
      </div>
      {/* Editorial grid */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:24 }}>
        {imgs.map((src,i) => (
          <div key={i} style={{ aspectRatio: i===0?"2/3":"3/4", borderRadius:18,overflow:"hidden",gridColumn:i===0?"1":"2",gridRow:i===0?"1/3":"auto" }}>
            <img src={src} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
          </div>
        ))}
      </div>
      {/* Shop the look */}
      {featured.length > 0 && (
        <>
          <p style={{ fontSize:18,fontWeight:700,marginBottom:16,letterSpacing:"-0.4px" }}>Shop the Look</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 10px" }}>
            {featured.map(p=>(
              <div key={p.id} onClick={()=>onSelect(p)} className="pressable" style={{ cursor:"pointer" }}>
                <div style={{ aspectRatio:"3/4",background:"#f2f2f7",borderRadius:18,overflow:"hidden",marginBottom:8 }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36 }}>👗</div>}
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
  pending:   { color:"#FF9500", label:"Pending",   icon:"⏳", canCancel:true  },
  confirmed: { color:"#007AFF", label:"Confirmed", icon:"✅", canCancel:true  },
  shipped:   { color:"#30B0C7", label:"Shipped",   icon:"🚚", canCancel:false },
  delivered: { color:"#34C759", label:"Delivered", icon:"📦", canCancel:false },
  cancelled: { color:"#FF3B30", label:"Cancelled", icon:"❌", canCancel:false },
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
  const $$ = v => `$${Number(v||0).toFixed(2)}`;

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"40vh" }}>
      <Spin size={32}/>
    </div>
  );

  if (orders.length === 0) return (
    <EmptyState
      icon="📋"
      title="No orders yet"
      body="Your purchase requests will appear here after you submit them."
    />
  );

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:toast.type==="error"?"#FF3B30":"rgba(28,28,30,0.92)",color:"#fff",padding:"12px 20px",borderRadius:99,fontSize:14,fontWeight:500,whiteSpace:"nowrap",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",animation:"slideUp .2s ease" }}>
          {toast.type==="error" ? "⚠️  " : "✓  "}{toast.msg}
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
                  <p style={{ fontSize:12,color:T.gray4,margin:0 }}>{fmtDate(order.created_at)}</p>
                </div>
                <span style={{ fontSize:12,fontWeight:600,padding:"4px 10px",borderRadius:99,background:`${st.color}18`,color:st.color,marginLeft:10,flexShrink:0 }}>
                  {st.icon} {st.label}
                </span>
              </div>

              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                <div style={{ display:"flex",gap:12 }}>
                  {order.selected_size && <span style={{ fontSize:13,color:T.gray3 }}>Size: <strong>{order.selected_size}</strong></span>}
                  <span style={{ fontSize:13,color:T.gray3 }}>Qty: <strong>{order.quantity}</strong></span>
                </div>
                <span style={{ fontSize:16,fontWeight:700,color:T.black }}>{$$(order.product_price)}</span>
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
                        <div style={{ width:"100%",height:3,borderRadius:99,background:active?"#007AFF":T.gray8,transition:"background .3s" }}/>
                        <span style={{ fontSize:9,color:active?"#007AFF":T.gray5,fontWeight:active?600:400,textTransform:"capitalize" }}>{s}</span>
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
          <div onClick={()=>setSel(null)} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(5px)" }}/>
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
                  <span style={{ fontSize:28 }}>{st.icon}</span>
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
                  <p style={{ fontSize:15,fontWeight:700,margin:0,marginLeft:"auto" }}>{$$(sel.product_price)}</p>
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
          <div onClick={()=>setConfirm(null)} style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)" }}/>
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

/* ─── Header ────────────────────────────────────────────────── */
function Header({ screen, cartCount, onCart, onNavigate, canGoBack, onBack }) {
  const titles = {
    shop:"Shop", search:"Search", wishlist:"Wishlist", account:"Account",
    orders:"My Orders", "edit-profile":"Edit Profile", addresses:"Addresses",
    notifications:"Notifications", settings:"Settings", privacy:"Privacy",
    "our-story":"Our Story", returns:"Returns", sustainability:"Sustainability",
    lookbook:"Lookbook",
  };
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
      case "home":         return <HomeScreen {...screenProps}/>;
      case "shop":         return <ShopScreen {...screenProps}/>;
      case "search":       return <SearchScreen {...screenProps}/>;
      case "wishlist":     return <WishlistScreen {...screenProps}/>;
      case "account":      return <AccountScreen onNavigate={navigate} user={user} onLogin={()=>setShowAuth(true)} onLogout={handleLogout} t={t}/>;
      case "orders":       return <MyOrdersScreen sessionId={sessionId}/>;
      case "edit-profile": return <AuthGate user={user} onLogin={()=>setShowAuth(true)} t={t}><EditProfileScreen user={user} onBack={goBack} t={t}/></AuthGate>;
      case "addresses":    return <AuthGate user={user} onLogin={()=>setShowAuth(true)} t={t}><AddressesScreen t={t}/></AuthGate>;
      case "notifications":return <AuthGate user={user} onLogin={()=>setShowAuth(true)} t={t}><NotificationsScreen t={t}/></AuthGate>;
      case "settings":     return <SettingsScreen t={t} lang={lang} setLang={setLang}/>;
      case "privacy":      return <PrivacyScreen t={t}/>;
      case "our-story":    return <OurStoryScreen t={t}/>;
      case "returns":      return <ReturnsScreen t={t}/>;
      case "sustainability":return <SustainabilityScreen t={t}/>;
      case "lookbook":     return <LookbookScreen products={products} onSelect={p=>navigate("product",{product:p})} t={t}/>;
      case "product":      return <ProductDetail p={current.product} onBack={goBack} onAdd={addToCart} wishlisted={wishlist.includes(current.product?.id)} onWishlist={toggleWishlist} sessionId={sessionId}/>;
      default:             return <HomeScreen {...screenProps}/>;
    }
  };

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      <div style={{ maxWidth:480,margin:"0 auto",minHeight:"100vh",background:T.white,position:"relative" }}>
        <Header screen={current.screen} cartCount={cartCount} onCart={()=>setCartOpen(true)} onNavigate={navigate} canGoBack={canGoBack} onBack={goBack}/>
        <main style={{ padding:"20px 16px 100px" }}>{renderScreen()}</main>
        <BottomNav screen={current.screen} onNavigate={navigate}/>

        {cartOpen&&<CartDrawer cart={cart} onClose={()=>setCartOpen(false)} onRemove={removeFromCart} onQty={updateQty}/>}

        {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} onAuth={u=>{ if(u&&!u.is_anonymous) setUser(u); setShowAuth(false); }} t={t}/>}

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
