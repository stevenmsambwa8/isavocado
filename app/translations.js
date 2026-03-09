/* ─────────────────────────────────────────────────────────────
   MSAMBWA — Translations
   Supported languages: en (English), sw (Kiswahili), fr (Français)
   To add a new language: copy the `en` block, change the key,
   and translate every value. Then add it to LANGS below.
───────────────────────────────────────────────────────────── */

export const TR = {
  en: {
    /* ── Navigation ── */
    home:"Home", shop:"Shop", search:"Search", saved:"Saved", account:"Account",

    /* ── Bag & Checkout ── */
    wishlist:"Wishlist", myBag:"My Bag", checkout:"Checkout →",
    addToBag:"Add to Bag", addedToBag:"Added",
    emptyBag:"Your bag is empty", continueShopping:"Continue Shopping",
    freeDeliveryQualify:"You qualify for free delivery!",
    addMore:"Add", moreForFreeDelivery:"more for free delivery",
    delivery:"Delivery", noDeliveryNeeded:"No delivery needed",
    deliveryOptOut:"I'll collect / no delivery needed",
    cartCheckoutTitle:"Send Order Request",
    cartCheckoutSub:"We'll reach out to confirm your order.",
    cartPhoneLabel:"Your Phone Number",
    cartNotePlaceholder:"Anything we should know about your order…",
    cartSubmit:"Send Request",
    cartSent:"Order Request Sent!",
    cartSentBody:"We'll contact you shortly to confirm.",
    subtotal:"Subtotal", total:"Total", free:"Free",

    /* ── Store labels ── */
    freeDelivery:"Free Delivery", freeReturns:"Free Returns",
    newIn:"New In", trendingNow:"Trending Now", onSale:"On Sale",
    viewAll:"View All", seeAll:"See All", browse:"Browse",
    priceOnRequest:"Members only",
    addToBagReveal:"Add to Bag", requestReveal:"Request to Buy",
    signInToContinue:"Sign in to continue",
    limitedTime:"Limited Time", upTo40:"Up to 40% off",
    whileStocks:"Select styles. While stocks last.", shopSale:"Shop Sale →",
    shopOpeningSoon:"Shop opening soon",
    curatingCollection:"Our collection is being curated. Check back shortly for new arrivals.",
    shopEmpty:"Shop is empty",
    shopEmptyBody:"Products will appear here once added by the team.",
    sortFeatured:"Browse", sortNew:"New In", sortLow:"Lowest Price",
    sortHigh:"Highest Price", sortRating:"Top Rated",
    items:"items", tryCategory:"Try a different category.",
    trending:"Trending", searchPlaceholder:"Search products…",
    noResultsFor:"No results for", nothingMatched:"Nothing matched",
    noResults:"No results", tryDifferent:"Try a different search term",
    noProducts:"No products yet",
    noProductsBody:"Our collection is being curated. Check back soon.",

    /* ── Wishlist ── */
    savedItems:"saved items",
    wishlistEmpty:"Your wishlist is empty",
    wishlistEmptyBody:"Tap the heart on any product to save it here.",
    noSaved:"Your wishlist is empty", saveItemsYouLove:"Save items you love",

    /* ── Product detail ── */
    size:"Size", colour:"Colour", description:"Description", reviewsLabel:"reviews",
    pickExactImage:"Pick the exact item",
    pickExactImageSub:"Select which photo matches what you want to order",
    pickRequired:"Please select the exact item picture first.",
    pinchZoom:"Pinch or double-tap to zoom",

    /* ── Request to Buy / Purchase modal ── */
    requestToBuy:"Request to Buy",
    yourName:"Your Name", yourEmail:"Your Email",
    yourPhone:"Phone (optional)", deliveryAddress:"Delivery Address",
    noteToSeller:"Note (optional)",
    submitRequest:"Submit Request", requestSent:"Request Sent!",
    requestFormPrefilled:"Your details have been pre-filled from your account.",
    requestFormGuestNote:"Tip: create an account to save your details for faster checkout.",

    /* ── Post-purchase account nudge ── */
    createAccountNudgeTitle:"Save your details for next time",
    createAccountNudgeBody:"Your request was sent. Add a password to turn your email into a full account — track orders, save addresses and more.",
    createAccountNudgePasswordLabel:"Choose a password",
    createAccountNudgePasswordPlaceholder:"At least 8 characters",
    createAccountNudgeCreate:"Create Account",
    createAccountNudgeSkip:"No thanks",
    createAccountNudgeDontShow:"Don't show again",
    createAccountNudgeSuccess:"Account created! Welcome.",
    createAccountNudgeError:"Couldn't create account. Try again.",

    /* ── Auth ── */
    signIn:"Sign In", signUp:"Sign Up", signOut:"Sign Out",
    email:"Email", password:"Password", confirmPassword:"Confirm Password",
    editProfile:"Edit Profile", profile:"Profile",
    firstName:"First Name", lastName:"Last Name", phone:"Phone",
    saveChanges:"Save Changes", cancel:"Cancel",
    loginRequired:"Sign in required",
    loginRequiredBody:"Create a free account to access this feature.",
    createAccount:"Create Account",
    alreadyAccount:"Already have an account?", noAccount:"No account yet?",
    guestUser:"Guest", member:"MSAMBWA Member",
    loginToUnlock:"Sign in to unlock",

    /* ── Account screens ── */
    newArrivals:"New Arrivals", orders:"Orders", myOrders:"My Orders",
    addresses:"Addresses", paymentMethods:"Payment Methods",
    referFriend:"Refer a Friend", notifications:"Notifications",
    settings:"Settings", ourStory:"Our Story", returns:"Returns",
    privacy:"Privacy", lookbook:"Lookbook", sustainability:"Sustainability",
    address:"Address", addAddress:"Add Address",
    street:"Street", city:"City", country:"Country", postcode:"Postcode",
    notificationsDesc:"Manage your notification preferences",
    pushNotifications:"Push Notifications", emailNotifications:"Email Notifications",
    orderUpdates:"Order Updates", promotions:"Promotions", newArrivalsAlert:"New Arrivals",
    settingsDesc:"App preferences",
    darkMode:"Dark Mode", language:"Language", currency:"Currency",
    privacyPolicy:"Privacy Policy", termsOfService:"Terms of Service",
    deleteAccount:"Delete Account",

    /* ── Static pages ── */
    ourStoryTitle:"Our Story",
    ourStoryBody:"MSAMBWA was founded with a simple belief: that beautiful, considered fashion should be accessible to everyone. We source our pieces from ethical manufacturers across the globe, ensuring every garment tells a story of craftsmanship and care.\n\nOur name, MSAMBWA, means 'spirit' in Swahili — a reminder that we put soul into everything we do. From our carefully curated collections to our personal customer service, we believe fashion is more than clothing — it's how you carry yourself through the world.",

    returnsTitle:"Returns & Exchanges",
    returnsBody:"We want you to love every piece. If you're not completely satisfied, we offer returns within 3–5 days of delivery.\n\nTo start a return, contact us at hello@msambwa.com with your order number and reason for return. Items must be unworn, unwashed, and in original packaging with tags attached.\n\nRefunds are processed within 3–5 business days of receiving your return.",

    sustainabilityTitle:"Sustainability",
    sustainabilityBody:"At MSAMBWA, sustainability isn't just a buzzword — it's woven into everything we do. We partner only with manufacturers who meet our strict ethical and environmental standards.\n\nOur packaging is 100% recyclable. We offset our carbon emissions through verified reforestation projects. And we design pieces to last — because the most sustainable garment is one you wear for years, not seasons.",

    lookbookTitle:"Lookbook", lookbookSeason:"SS26 Collection",

    /* ── Hero slides ── */
    heroNewLabel:"SS26 Collection",
    heroNewTitle:"Refined pieces\nfor modern living.",
    heroNewSub:"New arrivals — just dropped",
    heroNewCta:"Explore New In →",
    heroHotLabel:"Trending Now",
    heroHotTitle:"Everyone's\ntalking about it.",
    heroHotSub:"Most loved styles right now",
    heroHotCta:"Shop Trending →",
    heroSaleLabel:"Limited Time Sale",
    heroSaleTitle:"Up to 40% Off\nSelect Styles.",
    heroSaleSub:"Shop before it ends",
    heroSaleCta:"Shop Sale →",

    /* ── Misc ── */
    loading:"Loading…",
    helpFeedback:"Help us improve",
    helpFeedbackSub:"Share feedback — we read every message",
    version:"v1.0.0",
  },

  sw: {
    /* ── Navigation ── */
    home:"Nyumbani", shop:"Duka", search:"Tafuta", saved:"Zilizohifadhiwa", account:"Akaunti",

    /* ── Bag & Checkout ── */
    wishlist:"Orodha ya Matakwa", myBag:"Mfuko Wangu", checkout:"Malipo →",
    addToBag:"Ongeza Kwenye Mfuko", addedToBag:"Imeongezwa",
    emptyBag:"Mfuko wako ni tupu", continueShopping:"Endelea Kununua",
    freeDeliveryQualify:"Unastahili usafirishaji bure!",
    addMore:"Ongeza", moreForFreeDelivery:"zaidi kwa usafirishaji bure",
    delivery:"Uwasilishaji", noDeliveryNeeded:"Hakuna uwasilishaji",
    deliveryOptOut:"Nitakuja kuchukua / hakuna uwasilishaji",
    cartCheckoutTitle:"Tuma Ombi la Agizo",
    cartCheckoutSub:"Tutawasiliana nawe kuthibitisha agizo lako.",
    cartPhoneLabel:"Nambari Yako ya Simu",
    cartNotePlaceholder:"Kuna kitu chochote tunachopaswa kujua kuhusu agizo lako…",
    cartSubmit:"Tuma Ombi",
    cartSent:"Ombi la Agizo Limetumwa!",
    cartSentBody:"Tutawasiliana nawe hivi karibuni kuthibitisha.",
    subtotal:"Jumla Ndogo", total:"Jumla", free:"Bure",

    /* ── Store labels ── */
    freeDelivery:"Usafirishaji Bure", freeReturns:"Kurudisha Bure",
    newIn:"Mpya", trendingNow:"Inayoongoza Sasa", onSale:"Punguzo",
    viewAll:"Angalia Zote", seeAll:"Angalia Zote", browse:"Tazama",
    priceOnRequest:"Wanachama tu",
    addToBagReveal:"Ongeza Mfukoni", requestReveal:"Ombi la Kununua",
    signInToContinue:"Ingia kuendelea",
    limitedTime:"Wakati Mdogo", upTo40:"Hadi 40% punguzo",
    whileStocks:"Mitindo iliyochaguliwa. Hadi stoki itakapokwisha.", shopSale:"Nunua Punguzo →",
    shopOpeningSoon:"Duka linafunguliwa hivi karibuni",
    curatingCollection:"Mkusanyiko wetu unatengenezwa. Rudi hivi karibuni.",
    shopEmpty:"Duka ni tupu",
    shopEmptyBody:"Bidhaa zitaonekana hapa zikishaongezwa.",
    sortFeatured:"Tazama", sortNew:"Mpya", sortLow:"Bei ya Chini",
    sortHigh:"Bei ya Juu", sortRating:"Zilizopimwa Zaidi",
    items:"bidhaa", tryCategory:"Jaribu aina tofauti.",
    trending:"Inayoongoza", searchPlaceholder:"Tafuta bidhaa…",
    noResultsFor:"Hakuna matokeo kwa", nothingMatched:"Hakuna kilicholingana",
    noResults:"Hakuna matokeo", tryDifferent:"Jaribu neno tofauti la utafutaji",
    noProducts:"Hakuna bidhaa bado",
    noProductsBody:"Mkusanyiko wetu unatengenezwa. Rudi hivi karibuni.",

    /* ── Wishlist ── */
    savedItems:"vitu vilivyohifadhiwa",
    wishlistEmpty:"Orodha yako ya matakwa ni tupu",
    wishlistEmptyBody:"Gusa moyo kwenye bidhaa yoyote kuihifadhi hapa.",
    noSaved:"Orodha yako ya matakwa ni tupu",
    saveItemsYouLove:"Hifadhi vitu unavyovipenda",

    /* ── Product detail ── */
    size:"Ukubwa", colour:"Rangi", description:"Maelezo", reviewsLabel:"maoni",
    pickExactImage:"Chagua kipande halisi",
    pickExactImageSub:"Chagua picha inayolingana na unachotaka kuagiza",
    pickRequired:"Tafadhali chagua picha halisi ya bidhaa kwanza.",
    pinchZoom:"Pinch au gonga mara mbili kuzoom",

    /* ── Request to Buy / Purchase modal ── */
    requestToBuy:"Ombi la Kununua",
    yourName:"Jina Lako", yourEmail:"Barua Pepe Yako",
    yourPhone:"Simu (si lazima)", deliveryAddress:"Anwani ya Usafirishaji",
    noteToSeller:"Kumbuka (si lazima)",
    submitRequest:"Wasilisha Ombi", requestSent:"Ombi Limetumwa!",
    requestFormPrefilled:"Maelezo yako yamejazwa mapema kutoka kwa akaunti yako.",
    requestFormGuestNote:"Kidokezo: fungua akaunti kuhifadhi maelezo yako kwa malipo ya haraka.",

    /* ── Post-purchase account nudge ── */
    createAccountNudgeTitle:"Hifadhi maelezo yako kwa wakati ujao",
    createAccountNudgeBody:"Ombi lako limetumwa. Ongeza nenosiri ili kubadilisha barua pepe yako kuwa akaunti kamili — fuatilia maagizo, hifadhi anwani na zaidi.",
    createAccountNudgePasswordLabel:"Chagua nenosiri",
    createAccountNudgePasswordPlaceholder:"Angalau herufi 8",
    createAccountNudgeCreate:"Fungua Akaunti",
    createAccountNudgeSkip:"Hapana asante",
    createAccountNudgeDontShow:"Usionyeshe tena",
    createAccountNudgeSuccess:"Akaunti imeundwa! Karibu.",
    createAccountNudgeError:"Haikuweza kuunda akaunti. Jaribu tena.",

    /* ── Auth ── */
    signIn:"Ingia", signUp:"Jisajili", signOut:"Toka",
    email:"Barua Pepe", password:"Nenosiri", confirmPassword:"Thibitisha Nenosiri",
    editProfile:"Hariri Wasifu", profile:"Wasifu",
    firstName:"Jina la Kwanza", lastName:"Jina la Familia", phone:"Simu",
    saveChanges:"Hifadhi Mabadiliko", cancel:"Ghairi",
    loginRequired:"Inahitajika Kuingia",
    loginRequiredBody:"Fungua akaunti bila malipo kupata huduma hii.",
    createAccount:"Fungua Akaunti",
    alreadyAccount:"Una akaunti tayari?", noAccount:"Huna akaunti bado?",
    guestUser:"Mgeni", member:"Mwanachama wa MSAMBWA",
    loginToUnlock:"Ingia ili ufungue",

    /* ── Account screens ── */
    newArrivals:"Waliofika Hivi Karibuni", orders:"Maagizo", myOrders:"Maagizo Yangu",
    addresses:"Anwani", paymentMethods:"Njia za Malipo",
    referFriend:"Mwambie Rafiki", notifications:"Arifa",
    settings:"Mipangilio", ourStory:"Hadithi Yetu", returns:"Kurudisha",
    privacy:"Faragha", lookbook:"Albamu", sustainability:"Uendelevu",
    address:"Anwani", addAddress:"Ongeza Anwani",
    street:"Mtaa", city:"Mji", country:"Nchi", postcode:"Msimbo wa Posta",
    notificationsDesc:"Simamia mapendeleo yako ya arifa",
    pushNotifications:"Arifa za Push", emailNotifications:"Arifa za Barua Pepe",
    orderUpdates:"Masasisho ya Maagizo", promotions:"Matangazo", newArrivalsAlert:"Waliofika Wapya",
    settingsDesc:"Mapendeleo ya programu",
    darkMode:"Hali ya Giza", language:"Lugha", currency:"Sarafu",
    privacyPolicy:"Sera ya Faragha", termsOfService:"Masharti ya Huduma",
    deleteAccount:"Futa Akaunti",

    /* ── Static pages ── */
    ourStoryTitle:"Hadithi Yetu",
    ourStoryBody:"MSAMBWA ilianzishwa na imani moja rahisi: kwamba mitindo nzuri na ya kufikiria inapaswa kupatikana kwa kila mtu. Tunachagua vipande vyetu kutoka kwa watengenezaji wa maadili duniani kote, kuhakikisha kila vazi linasimulia hadithi ya ujuzi na utunzaji.\n\nJina letu, MSAMBWA, linamaanisha 'roho' kwa Kiswahili — ukumbusho kwamba tunaweka moyo katika kila kitu tunachofanya.",

    returnsTitle:"Kurudisha na Kubadilishana",
    returnsBody:"Tunataka upende kila kipande. Ikiwa hukuridhika kabisa, tunakupa kurudisha ndani ya siku 3–5 za uwasilishaji.\n\nKuanza kurudisha, wasiliana nasi kwa hello@msambwa.com na nambari yako ya agizo na sababu ya kurudisha. Vitu lazima visivaliwe, visioshe, na katika ufungaji wa asili na lebo zimeshikamana.\n\nMarejesho yanashughulikiwa ndani ya siku 3–5 za biashara za kupokea urejesho wako.",

    sustainabilityTitle:"Uendelevu",
    sustainabilityBody:"Katika MSAMBWA, uendelevu si tu neno — umefumwa katika kila kitu tunachofanya. Tunashirikiana tu na watengenezaji wanaokidhi viwango vyetu vikali vya kimaadili na mazingira.\n\nUfungaji wetu unaweza kusindikwa 100%. Tunalipa fidia za uzalishaji wa kaboni kupitia miradi ya upandaji miti iliyothibitishwa. Na tunaunda vipande kudumu — kwa sababu vazi endelevu zaidi ni lile unalovaa kwa miaka, si misimu.",

    lookbookTitle:"Albamu", lookbookSeason:"Mkusanyiko wa SS26",

    /* ── Hero slides ── */
    heroNewLabel:"Mkusanyiko SS26",
    heroNewTitle:"Vipande bora\nkwa maisha ya kisasa.",
    heroNewSub:"Waliofika wapya — wamepatikana",
    heroNewCta:"Angalia Mpya →",
    heroHotLabel:"Inayoongoza Sasa",
    heroHotTitle:"Kila mtu\nanapenda hivi.",
    heroHotSub:"Mitindo inayopendwa zaidi sasa hivi",
    heroHotCta:"Nunua Inayoongoza →",
    heroSaleLabel:"Punguzo la Muda Mfupi",
    heroSaleTitle:"Hadi 40% Punguzo\nMitindo Iliyochaguliwa.",
    heroSaleSub:"Nunua kabla haijamalizika",
    heroSaleCta:"Nunua Punguzo →",

    /* ── Misc ── */
    loading:"Inapakia…",
    helpFeedback:"Tusaidie kuboresha",
    helpFeedbackSub:"Shiriki maoni — tunasoma kila ujumbe",
    version:"v1.0.0",
  },

  fr: {
    /* ── Navigation ── */
    home:"Accueil", shop:"Boutique", search:"Rechercher", saved:"Sauvegardés", account:"Compte",

    /* ── Bag & Checkout ── */
    wishlist:"Liste de souhaits", myBag:"Mon sac", checkout:"Commander →",
    addToBag:"Ajouter au sac", addedToBag:"Ajouté",
    emptyBag:"Votre sac est vide", continueShopping:"Continuer vos achats",
    freeDeliveryQualify:"Vous bénéficiez de la livraison gratuite!",
    addMore:"Ajoutez", moreForFreeDelivery:"de plus pour la livraison gratuite",
    delivery:"Livraison", noDeliveryNeeded:"Pas de livraison",
    deliveryOptOut:"Je viendrai chercher / pas de livraison",
    cartCheckoutTitle:"Envoyer la demande",
    cartCheckoutSub:"Nous vous contacterons pour confirmer votre commande.",
    cartPhoneLabel:"Votre numéro de téléphone",
    cartNotePlaceholder:"Quelque chose que nous devrions savoir sur votre commande…",
    cartSubmit:"Envoyer",
    cartSent:"Demande envoyée!",
    cartSentBody:"Nous vous contacterons prochainement pour confirmer.",
    subtotal:"Sous-total", total:"Total", free:"Gratuit",

    /* ── Store labels ── */
    freeDelivery:"Livraison gratuite", freeReturns:"Retours gratuits",
    newIn:"Nouveautés", trendingNow:"Tendances", onSale:"En solde",
    viewAll:"Voir tout", seeAll:"Voir tout", browse:"Parcourir",
    priceOnRequest:"Membres uniquement",
    addToBagReveal:"Ajouter au sac", requestReveal:"Demande d'achat",
    signInToContinue:"Connectez-vous pour continuer",
    limitedTime:"Durée limitée", upTo40:"Jusqu'à -40%",
    whileStocks:"Styles sélectionnés. Jusqu'à épuisement des stocks.", shopSale:"Voir les soldes →",
    shopOpeningSoon:"Ouverture prochaine",
    curatingCollection:"Notre collection est en cours de sélection. Revenez bientôt.",
    shopEmpty:"La boutique est vide",
    shopEmptyBody:"Les produits apparaîtront ici une fois ajoutés.",
    sortFeatured:"Parcourir", sortNew:"Nouveautés", sortLow:"Prix croissant",
    sortHigh:"Prix décroissant", sortRating:"Mieux notés",
    items:"articles", tryCategory:"Essayez une autre catégorie.",
    trending:"Tendances", searchPlaceholder:"Rechercher…",
    noResultsFor:"Aucun résultat pour", nothingMatched:"Rien ne correspond à",
    noResults:"Aucun résultat", tryDifferent:"Essayez un autre terme",
    noProducts:"Pas encore de produits",
    noProductsBody:"Notre collection est en cours de curation. Revenez bientôt.",

    /* ── Wishlist ── */
    savedItems:"articles sauvegardés",
    wishlistEmpty:"Votre liste de souhaits est vide",
    wishlistEmptyBody:"Appuyez sur le cœur d'un produit pour le sauvegarder ici.",
    noSaved:"Votre liste de souhaits est vide",
    saveItemsYouLove:"Sauvegardez vos favoris",

    /* ── Product detail ── */
    size:"Taille", colour:"Couleur", description:"Description", reviewsLabel:"avis",
    pickExactImage:"Choisissez l'article exact",
    pickExactImageSub:"Sélectionnez la photo correspondant à ce que vous souhaitez commander",
    pickRequired:"Veuillez d'abord sélectionner la photo exacte de l'article.",
    pinchZoom:"Pincez ou double-tapez pour zoomer",

    /* ── Request to Buy / Purchase modal ── */
    requestToBuy:"Demande d'achat",
    yourName:"Votre nom", yourEmail:"Votre e-mail",
    yourPhone:"Téléphone (optionnel)", deliveryAddress:"Adresse de livraison",
    noteToSeller:"Note (optionnel)",
    submitRequest:"Soumettre", requestSent:"Demande envoyée!",
    requestFormPrefilled:"Vos coordonnées ont été pré-remplies depuis votre compte.",
    requestFormGuestNote:"Astuce : créez un compte pour enregistrer vos coordonnées et accélérer vos prochaines commandes.",

    /* ── Post-purchase account nudge ── */
    createAccountNudgeTitle:"Enregistrez vos coordonnées pour la prochaine fois",
    createAccountNudgeBody:"Votre demande a été envoyée. Ajoutez un mot de passe pour transformer votre e-mail en compte complet — suivez vos commandes, enregistrez vos adresses et plus encore.",
    createAccountNudgePasswordLabel:"Choisissez un mot de passe",
    createAccountNudgePasswordPlaceholder:"Au moins 8 caractères",
    createAccountNudgeCreate:"Créer un compte",
    createAccountNudgeSkip:"Non merci",
    createAccountNudgeDontShow:"Ne plus afficher",
    createAccountNudgeSuccess:"Compte créé ! Bienvenue.",
    createAccountNudgeError:"Impossible de créer le compte. Réessayez.",

    /* ── Auth ── */
    signIn:"Se connecter", signUp:"S'inscrire", signOut:"Se déconnecter",
    email:"E-mail", password:"Mot de passe", confirmPassword:"Confirmer le mot de passe",
    editProfile:"Modifier le profil", profile:"Profil",
    firstName:"Prénom", lastName:"Nom de famille", phone:"Téléphone",
    saveChanges:"Enregistrer", cancel:"Annuler",
    loginRequired:"Connexion requise",
    loginRequiredBody:"Créez un compte gratuit pour accéder à cette fonctionnalité.",
    createAccount:"Créer un compte",
    alreadyAccount:"Déjà un compte?", noAccount:"Pas encore de compte?",
    guestUser:"Invité", member:"Membre MSAMBWA",
    loginToUnlock:"Connectez-vous pour accéder",

    /* ── Account screens ── */
    newArrivals:"Nouveautés", orders:"Commandes", myOrders:"Mes commandes",
    addresses:"Adresses", paymentMethods:"Modes de paiement",
    referFriend:"Parrainer un ami", notifications:"Notifications",
    settings:"Paramètres", ourStory:"Notre histoire", returns:"Retours",
    privacy:"Confidentialité", lookbook:"Lookbook", sustainability:"Durabilité",
    address:"Adresse", addAddress:"Ajouter une adresse",
    street:"Rue", city:"Ville", country:"Pays", postcode:"Code postal",
    notificationsDesc:"Gérez vos préférences de notification",
    pushNotifications:"Notifications push", emailNotifications:"Notifications par e-mail",
    orderUpdates:"Mises à jour des commandes", promotions:"Promotions", newArrivalsAlert:"Nouvelles arrivées",
    settingsDesc:"Préférences de l'application",
    darkMode:"Mode sombre", language:"Langue", currency:"Devise",
    privacyPolicy:"Politique de confidentialité", termsOfService:"Conditions d'utilisation",
    deleteAccount:"Supprimer le compte",

    /* ── Static pages ── */
    ourStoryTitle:"Notre Histoire",
    ourStoryBody:"MSAMBWA a été fondée avec une conviction simple : que la mode belle et réfléchie devrait être accessible à tous. Nous sélectionnons nos pièces auprès de fabricants éthiques à travers le monde, en veillant à ce que chaque vêtement raconte une histoire de savoir-faire et d'attention.\n\nNotre nom, MSAMBWA, signifie 'esprit' en swahili — un rappel que nous mettons de l'âme dans tout ce que nous faisons.",

    returnsTitle:"Retours & Échanges",
    returnsBody:"Nous voulons que vous aimiez chaque pièce. Si vous n'êtes pas entièrement satisfait, nous offrons des retours dans les 3–5 jours suivant la livraison.\n\nPour initier un retour, contactez-nous à hello@msambwa.com avec votre numéro de commande et la raison du retour. Les articles doivent être non portés, non lavés, dans leur emballage d'origine avec les étiquettes attachées.\n\nLes remboursements sont traités dans les 3–5 jours ouvrables suivant la réception de votre retour.",

    sustainabilityTitle:"Durabilité",
    sustainabilityBody:"Chez MSAMBWA, la durabilité n'est pas qu'un mot à la mode — elle est tissée dans tout ce que nous faisons. Nous ne nous associons qu'à des fabricants qui respectent nos normes éthiques et environnementales strictes.\n\nNos emballages sont recyclables à 100%. Nous compensons nos émissions de carbone grâce à des projets de reforestation vérifiés. Et nous concevons des pièces pour durer — car le vêtement le plus durable est celui que vous portez pendant des années, pas des saisons.",

    lookbookTitle:"Lookbook", lookbookSeason:"Collection SS26",

    /* ── Hero slides ── */
    heroNewLabel:"Collection SS26",
    heroNewTitle:"Des pièces raffinées\npour la vie moderne.",
    heroNewSub:"Nouvelles arrivées — vient de tomber",
    heroNewCta:"Découvrir les nouveautés →",
    heroHotLabel:"Tendances du moment",
    heroHotTitle:"Tout le monde\nen parle.",
    heroHotSub:"Les styles les plus aimés en ce moment",
    heroHotCta:"Voir les tendances →",
    heroSaleLabel:"Offre limitée",
    heroSaleTitle:"Jusqu'à -40%\nStyles sélectionnés.",
    heroSaleSub:"Profitez avant la fin",
    heroSaleCta:"Voir les soldes →",

    /* ── Misc ── */
    loading:"Chargement…",
    helpFeedback:"Aidez-nous à nous améliorer",
    helpFeedbackSub:"Partagez vos commentaires — nous lisons chaque message",
    version:"v1.0.0",
  },
};

export const LANGS = [
  { code:"en", label:"English" },
  { code:"sw", label:"Kiswahili" },
  { code:"fr", label:"Français" },
];
