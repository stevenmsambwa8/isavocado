'use client'
import { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import './layout.css';

const LANGS = {
  en:"English", sw:"Swahili", fr:"Français", de:"Deutsch",
  es:"Español", pt:"Português", ar:"العربية", zh:"中文",
  ja:"日本語", ko:"한국어", hi:"हिन्दी", ru:"Русский",
  it:"Italiano", nl:"Nederlands",
};

const TR = {
  en:{ home:"Home",shop:"Shop",search:"Search",saved:"Saved",account:"Account",wishlist:"Wishlist",myBag:"My Bag",checkout:"Checkout →",addToBag:"Add to Bag",addedToBag:"Added to Bag ✓",sizeGuide:"Size Guide",selectSize:"Please select a size",colour:"Colour",size:"Size",description:"Description",details:"Details",care:"Care",youMayLike:"You May Also Like",freeShipping:"Free Shipping",freeReturns:"Free Returns",authenticityGuarantee:"Authenticity Guarantee",ordersOver:"Orders over $200",within30:"Within 30 days",guaranteed:"Guaranteed",newIn:"New In ✦",trendingNow:"Trending Now 🔥",onSale:"On Sale",viewAll:"View All",seeAll:"See All",browse:"Browse",savedItems:"saved items",noSaved:"Your wishlist is empty",saveItemsYouLove:"Save items you love",material:"Material",shipping:"Shipping",subtotal:"Subtotal",total:"Total",emptyBag:"Your bag is empty",continueShopping:"Continue Shopping",freeShippingQualify:"You qualify for free shipping!",addMore:"Add",moreForFreeShipping:"more for free shipping",recentSearches:"Recent Searches",trending:"Trending",noResults:"No results",tryDifferent:"Try a different search term",results:"result",resultsPlural:"results",forQuery:"for",newArrivals:"New Arrivals",justDropped:"Just dropped",ss26:"SS26 Collection",newPieces:"new pieces",limitedTime:"Limited time",upTo40:"Up to 40% off",styles:"styles",lookbook:"Lookbook",ss26Edits:"SS26 — Curated edits for the season",shopTheLook:"Shop The Look",allLooks:"All Looks",sustainability:"Sustainability",ourCommitment:"Our commitment",betterFashion:"Better Fashion",orders:"Orders",trackOrder:"Track order",orderTotal:"Order Total",tracking:"Tracking",orderPlaced:"Order placed",myOrders:"My Orders",addresses:"Addresses",paymentMethods:"Payment Methods",referFriend:"Refer a Friend",notifications:"Notifications",settings:"Settings",premiumMember:"MSAMBWA Premium Member",ourStory:"Our Story",returns:"Returns",privacy:"Privacy",refinedPieces:"Refined pieces for modern living.",limitedTimeOffer:"Limited Time Offer",upTo40Sale:"Up to 40% off Sale",selectStyles:"Select styles. While stocks last.",shopSale:"Shop Sale",exploreBtn:"Explore",shopNow:"Shop Now",shopSaleBtn:"Shop Sale",language:"Language" },
  sw:{ home:"Nyumbani",shop:"Duka",search:"Tafuta",saved:"Zilizohifadhiwa",account:"Akaunti",wishlist:"Orodha ya Matakwa",myBag:"Mkoba Wangu",checkout:"Lipia →",addToBag:"Weka Mkobani",addedToBag:"Imeongezwa ✓",sizeGuide:"Mwongozo wa Ukubwa",selectSize:"Tafadhali chagua ukubwa",colour:"Rangi",size:"Ukubwa",description:"Maelezo",details:"Maelezo ya Kina",care:"Utunzaji",youMayLike:"Unaweza Kupenda Pia",freeShipping:"Usafirishaji Bure",freeReturns:"Kurudisha Bure",authenticityGuarantee:"Dhamana ya Uhalisi",ordersOver:"Maagizo zaidi ya $200",within30:"Ndani ya siku 30",guaranteed:"Imehakikishwa",newIn:"Vipya ✦",trendingNow:"Inayoongoza Sasa 🔥",onSale:"Punguzo",viewAll:"Ona Yote",seeAll:"Ona Yote",browse:"Vinjari",savedItems:"vitu vilivyohifadhiwa",noSaved:"Orodha yako ya matakwa iko tupu",saveItemsYouLove:"Hifadhi vitu unavyopenda",material:"Nyenzo",shipping:"Usafirishaji",subtotal:"Jumla ndogo",total:"Jumla",emptyBag:"Mkoba wako uko tupu",continueShopping:"Endelea Kununua",freeShippingQualify:"Unastahili usafirishaji bure!",addMore:"Ongeza",moreForFreeShipping:"zaidi kwa usafirishaji bure",recentSearches:"Utafutaji wa Hivi Karibuni",trending:"Inayoongoza",noResults:"Hakuna matokeo",tryDifferent:"Jaribu neno tofauti la utafutaji",results:"matokeo",resultsPlural:"matokeo",forQuery:"kwa",newArrivals:"Bidhaa Mpya",justDropped:"Imewasili tu",ss26:"Mkusanyiko SS26",newPieces:"vipande vipya",limitedTime:"Muda mfupi",upTo40:"Hadi punguzo la 40%",styles:"mitindo",lookbook:"Kitabu cha Mitindo",ss26Edits:"SS26 — Makusanyo yaliyochaguliwa kwa msimu",shopTheLook:"Nunua Mtindo Huu",allLooks:"Mitindo Yote",sustainability:"Uendelevu",ourCommitment:"Ahadi yetu",betterFashion:"Mitindo Bora",orders:"Maagizo",trackOrder:"Fuatilia agizo",orderTotal:"Jumla ya Agizo",tracking:"Ufuatiliaji",orderPlaced:"Agizo limewekwa",myOrders:"Maagizo Yangu",addresses:"Anwani",paymentMethods:"Njia za Malipo",referFriend:"Mualike Rafiki",notifications:"Arifa",settings:"Mipangilio",premiumMember:"Mwanachama wa MSAMBWA Premium",ourStory:"Hadithi Yetu",returns:"Kurudisha",privacy:"Faragha",refinedPieces:"Vipande vilivyosafishwa kwa maisha ya kisasa.",limitedTimeOffer:"Muda Mfupi",upTo40Sale:"Hadi 40% Punguzo",selectStyles:"Mitindo iliyochaguliwa. Wakati hifadhi inapoisha.",shopSale:"Nunua Punguzo",exploreBtn:"Gundua",shopNow:"Nunua Sasa",shopSaleBtn:"Nunua Punguzo",language:"Lugha" },
  fr:{ home:"Accueil",shop:"Boutique",search:"Rechercher",saved:"Sauvegardés",account:"Compte",wishlist:"Liste de souhaits",myBag:"Mon Panier",checkout:"Commander →",addToBag:"Ajouter au panier",addedToBag:"Ajouté ✓",sizeGuide:"Guide des tailles",selectSize:"Veuillez choisir une taille",colour:"Couleur",size:"Taille",description:"Description",details:"Détails",care:"Entretien",youMayLike:"Vous aimerez aussi",freeShipping:"Livraison gratuite",freeReturns:"Retours gratuits",authenticityGuarantee:"Garantie d'authenticité",ordersOver:"Commandes > 200$",within30:"Sous 30 jours",guaranteed:"Garanti",newIn:"Nouveautés ✦",trendingNow:"Tendances 🔥",onSale:"En solde",viewAll:"Tout voir",seeAll:"Tout voir",browse:"Explorer",savedItems:"articles sauvegardés",noSaved:"Votre liste est vide",saveItemsYouLove:"Sauvegardez vos coups de cœur",material:"Matière",shipping:"Livraison",subtotal:"Sous-total",total:"Total",emptyBag:"Votre panier est vide",continueShopping:"Continuer mes achats",freeShippingQualify:"Livraison gratuite incluse !",addMore:"Ajoutez",moreForFreeShipping:"de plus pour la livraison gratuite",recentSearches:"Recherches récentes",trending:"Tendances",noResults:"Aucun résultat",tryDifferent:"Essayez un autre terme",results:"résultat",resultsPlural:"résultats",forQuery:"pour",newArrivals:"Nouveautés",justDropped:"Vient d'arriver",ss26:"Collection SS26",newPieces:"nouvelles pièces",limitedTime:"Durée limitée",upTo40:"Jusqu'à -40%",styles:"styles",lookbook:"Lookbook",ss26Edits:"SS26 — Sélections de la saison",shopTheLook:"Acheter le look",allLooks:"Tous les looks",sustainability:"Durabilité",ourCommitment:"Notre engagement",betterFashion:"Une mode meilleure",orders:"Commandes",trackOrder:"Suivre la commande",orderTotal:"Total commande",tracking:"Suivi",orderPlaced:"Commande passée",myOrders:"Mes commandes",addresses:"Adresses",paymentMethods:"Paiements",referFriend:"Parrainer un ami",notifications:"Notifications",settings:"Paramètres",premiumMember:"Membre Premium MSAMBWA",ourStory:"Notre histoire",returns:"Retours",privacy:"Confidentialité",refinedPieces:"Des pièces raffinées pour la vie moderne.",limitedTimeOffer:"Offre limitée",upTo40Sale:"Jusqu'à -40%",selectStyles:"Styles sélectionnés. Jusqu'à épuisement.",shopSale:"Acheter les soldes",exploreBtn:"Explorer",shopNow:"Acheter",shopSaleBtn:"Voir les soldes",language:"Langue" },
  de:{ home:"Startseite",shop:"Shop",search:"Suchen",saved:"Gespeichert",account:"Konto",wishlist:"Wunschliste",myBag:"Mein Warenkorb",checkout:"Zur Kasse →",addToBag:"In den Warenkorb",addedToBag:"Hinzugefügt ✓",sizeGuide:"Größentabelle",selectSize:"Bitte wählen Sie eine Größe",colour:"Farbe",size:"Größe",description:"Beschreibung",details:"Details",care:"Pflege",youMayLike:"Das könnte Ihnen gefallen",freeShipping:"Kostenloser Versand",freeReturns:"Kostenlose Rücksendung",authenticityGuarantee:"Echtheitszertifikat",ordersOver:"Bestellungen über 200$",within30:"Innerhalb von 30 Tagen",guaranteed:"Garantiert",newIn:"Neuheiten ✦",trendingNow:"Trends 🔥",onSale:"On Sale",viewAll:"Alle anzeigen",seeAll:"Alle anzeigen",browse:"Stöbern",savedItems:"gespeicherte Artikel",noSaved:"Ihre Wunschliste ist leer",saveItemsYouLove:"Speichern Sie Ihre Lieblingsartikel",material:"Material",shipping:"Versand",subtotal:"Zwischensumme",total:"Gesamt",emptyBag:"Ihr Warenkorb ist leer",continueShopping:"Weiter einkaufen",freeShippingQualify:"Kostenloser Versand inklusive!",addMore:"Fügen Sie",moreForFreeShipping:"hinzu für kostenlosen Versand",recentSearches:"Letzte Suchen",trending:"Trends",noResults:"Keine Ergebnisse",tryDifferent:"Versuchen Sie einen anderen Suchbegriff",results:"Ergebnis",resultsPlural:"Ergebnisse",forQuery:"für",newArrivals:"Neuankömmlinge",justDropped:"Gerade eingetroffen",ss26:"SS26 Kollektion",newPieces:"neue Teile",limitedTime:"Begrenzte Zeit",upTo40:"Bis zu -40%",styles:"Styles",lookbook:"Lookbook",ss26Edits:"SS26 — Kuratierte Editionen",shopTheLook:"Den Look shoppen",allLooks:"Alle Looks",sustainability:"Nachhaltigkeit",ourCommitment:"Unser Versprechen",betterFashion:"Bessere Mode",orders:"Bestellungen",trackOrder:"Bestellung verfolgen",orderTotal:"Bestellsumme",tracking:"Verfolgung",orderPlaced:"Bestellung aufgegeben",myOrders:"Meine Bestellungen",addresses:"Adressen",paymentMethods:"Zahlungsmethoden",referFriend:"Freunde werben",notifications:"Benachrichtigungen",settings:"Einstellungen",premiumMember:"MSAMBWA Premium Mitglied",ourStory:"Unsere Geschichte",returns:"Rücksendungen",privacy:"Datenschutz",refinedPieces:"Raffinierte Stücke für das moderne Leben.",limitedTimeOffer:"Zeitlich begrenzt",upTo40Sale:"Bis zu -40%",selectStyles:"Ausgewählte Styles. Solange Vorrat.",shopSale:"Sale shoppen",exploreBtn:"Entdecken",shopNow:"Jetzt shoppen",shopSaleBtn:"Sale ansehen",language:"Sprache" },
  es:{ home:"Inicio",shop:"Tienda",search:"Buscar",saved:"Guardados",account:"Cuenta",wishlist:"Lista de deseos",myBag:"Mi bolsa",checkout:"Pagar →",addToBag:"Añadir a la bolsa",addedToBag:"Añadido ✓",sizeGuide:"Guía de tallas",selectSize:"Por favor selecciona una talla",colour:"Color",size:"Talla",description:"Descripción",details:"Detalles",care:"Cuidado",youMayLike:"También te puede gustar",freeShipping:"Envío gratis",freeReturns:"Devoluciones gratuitas",authenticityGuarantee:"Garantía de autenticidad",ordersOver:"Pedidos > $200",within30:"En 30 días",guaranteed:"Garantizado",newIn:"Novedades ✦",trendingNow:"Tendencias 🔥",onSale:"Rebajas",viewAll:"Ver todo",seeAll:"Ver todo",browse:"Explorar",savedItems:"artículos guardados",noSaved:"Tu lista de deseos está vacía",saveItemsYouLove:"Guarda lo que te encanta",material:"Material",shipping:"Envío",subtotal:"Subtotal",total:"Total",emptyBag:"Tu bolsa está vacía",continueShopping:"Seguir comprando",freeShippingQualify:"¡Envío gratuito incluido!",addMore:"Añade",moreForFreeShipping:"más para envío gratis",recentSearches:"Búsquedas recientes",trending:"Tendencias",noResults:"Sin resultados",tryDifferent:"Prueba otro término",results:"resultado",resultsPlural:"resultados",forQuery:"para",newArrivals:"Novedades",justDropped:"Recién llegado",ss26:"Colección SS26",newPieces:"nuevas piezas",limitedTime:"Tiempo limitado",upTo40:"Hasta -40%",styles:"estilos",lookbook:"Lookbook",ss26Edits:"SS26 — Selecciones de temporada",shopTheLook:"Comprar el look",allLooks:"Todos los looks",sustainability:"Sostenibilidad",ourCommitment:"Nuestro compromiso",betterFashion:"Moda mejor",orders:"Pedidos",trackOrder:"Rastrear pedido",orderTotal:"Total pedido",tracking:"Seguimiento",orderPlaced:"Pedido realizado",myOrders:"Mis pedidos",addresses:"Direcciones",paymentMethods:"Pagos",referFriend:"Recomendar amigo",notifications:"Notificaciones",settings:"Ajustes",premiumMember:"Miembro Premium MSAMBWA",ourStory:"Nuestra historia",returns:"Devoluciones",privacy:"Privacidad",refinedPieces:"Piezas refinadas para la vida moderna.",limitedTimeOffer:"Oferta limitada",upTo40Sale:"Hasta -40%",selectStyles:"Estilos seleccionados. Hasta agotar existencias.",shopSale:"Ver rebajas",exploreBtn:"Explorar",shopNow:"Comprar ahora",shopSaleBtn:"Ver rebajas",language:"Idioma" },
  pt:{ home:"Início",shop:"Loja",search:"Pesquisar",saved:"Guardados",account:"Conta",wishlist:"Lista de desejos",myBag:"Minha bolsa",checkout:"Finalizar →",addToBag:"Adicionar à bolsa",addedToBag:"Adicionado ✓",sizeGuide:"Guia de tamanhos",selectSize:"Selecione um tamanho",colour:"Cor",size:"Tamanho",description:"Descrição",details:"Detalhes",care:"Cuidados",youMayLike:"Você também pode gostar",freeShipping:"Frete grátis",freeReturns:"Devoluções gratuitas",authenticityGuarantee:"Garantia de autenticidade",ordersOver:"Pedidos acima de $200",within30:"Em 30 dias",guaranteed:"Garantido",newIn:"Novidades ✦",trendingNow:"Tendências 🔥",onSale:"Promoção",viewAll:"Ver tudo",seeAll:"Ver tudo",browse:"Explorar",savedItems:"itens guardados",noSaved:"Sua lista está vazia",saveItemsYouLove:"Guarde o que você ama",material:"Material",shipping:"Frete",subtotal:"Subtotal",total:"Total",emptyBag:"Sua bolsa está vazia",continueShopping:"Continuar comprando",freeShippingQualify:"Frete grátis incluído!",addMore:"Adicione",moreForFreeShipping:"para frete grátis",recentSearches:"Pesquisas recentes",trending:"Tendências",noResults:"Sem resultados",tryDifferent:"Tente outro termo",results:"resultado",resultsPlural:"resultados",forQuery:"para",newArrivals:"Novidades",justDropped:"Recém chegado",ss26:"Coleção SS26",newPieces:"novas peças",limitedTime:"Tempo limitado",upTo40:"Até -40%",styles:"estilos",lookbook:"Lookbook",ss26Edits:"SS26 — Seleções da temporada",shopTheLook:"Comprar o look",allLooks:"Todos os looks",sustainability:"Sustentabilidade",ourCommitment:"Nosso compromisso",betterFashion:"Moda melhor",orders:"Pedidos",trackOrder:"Rastrear pedido",orderTotal:"Total do pedido",tracking:"Rastreamento",orderPlaced:"Pedido realizado",myOrders:"Meus pedidos",addresses:"Endereços",paymentMethods:"Pagamentos",referFriend:"Indicar amigo",notifications:"Notificações",settings:"Configurações",premiumMember:"Membro Premium MSAMBWA",ourStory:"Nossa história",returns:"Devoluções",privacy:"Privacidade",refinedPieces:"Peças refinadas para a vida moderna.",limitedTimeOffer:"Oferta limitada",upTo40Sale:"Até -40%",selectStyles:"Estilos selecionados. Enquanto durar o estoque.",shopSale:"Ver promoções",exploreBtn:"Explorar",shopNow:"Comprar agora",shopSaleBtn:"Ver promoções",language:"Idioma" },
  ar:{ home:"الرئيسية",shop:"المتجر",search:"بحث",saved:"المحفوظة",account:"الحساب",wishlist:"قائمة الأمنيات",myBag:"حقيبتي",checkout:"الدفع →",addToBag:"أضف للحقيبة",addedToBag:"تمت الإضافة ✓",sizeGuide:"دليل المقاسات",selectSize:"يرجى اختيار مقاس",colour:"اللون",size:"المقاس",description:"الوصف",details:"التفاصيل",care:"العناية",youMayLike:"قد يعجبك أيضاً",freeShipping:"شحن مجاني",freeReturns:"إرجاع مجاني",authenticityGuarantee:"ضمان الأصالة",ordersOver:"طلبات فوق $200",within30:"خلال 30 يوماً",guaranteed:"مضمون",newIn:"جديد ✦",trendingNow:"الأكثر رواجاً 🔥",onSale:"تخفيضات",viewAll:"عرض الكل",seeAll:"عرض الكل",browse:"تصفح",savedItems:"عناصر محفوظة",noSaved:"قائمة أمنياتك فارغة",saveItemsYouLove:"احفظ ما تحب",material:"المادة",shipping:"الشحن",subtotal:"المجموع الفرعي",total:"الإجمالي",emptyBag:"حقيبتك فارغة",continueShopping:"مواصلة التسوق",freeShippingQualify:"مؤهل للشحن المجاني!",addMore:"أضف",moreForFreeShipping:"للحصول على شحن مجاني",recentSearches:"عمليات البحث الأخيرة",trending:"الأكثر رواجاً",noResults:"لا توجد نتائج",tryDifferent:"جرب مصطلحاً مختلفاً",results:"نتيجة",resultsPlural:"نتائج",forQuery:"لـ",newArrivals:"وصل حديثاً",justDropped:"وصل للتو",ss26:"مجموعة SS26",newPieces:"قطع جديدة",limitedTime:"وقت محدود",upTo40:"حتى 40% خصم",styles:"أنماط",lookbook:"كتاب الأزياء",ss26Edits:"SS26 — تشكيلات منتقاة",shopTheLook:"تسوق هذا الإطلالة",allLooks:"جميع الإطلالات",sustainability:"الاستدامة",ourCommitment:"التزامنا",betterFashion:"أزياء أفضل",orders:"الطلبات",trackOrder:"تتبع الطلب",orderTotal:"إجمالي الطلب",tracking:"التتبع",orderPlaced:"تم تقديم الطلب",myOrders:"طلباتي",addresses:"العناوين",paymentMethods:"طرق الدفع",referFriend:"أحل صديقاً",notifications:"الإشعارات",settings:"الإعدادات",premiumMember:"عضو MSAMBWA المميز",ourStory:"قصتنا",returns:"الإرجاع",privacy:"الخصوصية",refinedPieces:"قطع راقية للحياة العصرية.",limitedTimeOffer:"عرض محدود",upTo40Sale:"حتى 40% خصم",selectStyles:"أنماط مختارة. حتى نفاد الكمية.",shopSale:"تسوق التخفيضات",exploreBtn:"استكشف",shopNow:"تسوق الآن",shopSaleBtn:"تسوق التخفيضات",language:"اللغة" },
  zh:{ home:"首页",shop:"商店",search:"搜索",saved:"已保存",account:"账户",wishlist:"心愿单",myBag:"我的购物袋",checkout:"去结账 →",addToBag:"加入购物袋",addedToBag:"已加入 ✓",sizeGuide:"尺码指南",selectSize:"请选择尺码",colour:"颜色",size:"尺码",description:"描述",details:"详情",care:"护理",youMayLike:"您可能还喜欢",freeShipping:"免费配送",freeReturns:"免费退货",authenticityGuarantee:"正品保证",ordersOver:"订单满$200",within30:"30天内",guaranteed:"已保证",newIn:"新品 ✦",trendingNow:"热门 🔥",onSale:"特卖",viewAll:"查看全部",seeAll:"查看全部",browse:"浏览",savedItems:"件已保存",noSaved:"您的心愿单为空",saveItemsYouLove:"保存您喜欢的商品",material:"材质",shipping:"配送",subtotal:"小计",total:"合计",emptyBag:"购物袋为空",continueShopping:"继续购物",freeShippingQualify:"您已享受免费配送！",addMore:"再加",moreForFreeShipping:"享受免费配送",recentSearches:"最近搜索",trending:"热门",noResults:"无结果",tryDifferent:"请尝试其他搜索词",results:"个结果",resultsPlural:"个结果",forQuery:"关于",newArrivals:"新品到货",justDropped:"刚刚上架",ss26:"SS26系列",newPieces:"件新品",limitedTime:"限时",upTo40:"低至六折",styles:"款",lookbook:"时尚手册",ss26Edits:"SS26 — 本季精选",shopTheLook:"购买本套搭配",allLooks:"全部造型",sustainability:"可持续发展",ourCommitment:"我们的承诺",betterFashion:"更好的时尚",orders:"订单",trackOrder:"追踪订单",orderTotal:"订单总计",tracking:"追踪",orderPlaced:"已下单",myOrders:"我的订单",addresses:"地址",paymentMethods:"支付方式",referFriend:"推荐好友",notifications:"通知",settings:"设置",premiumMember:"MSAMBWA高级会员",ourStory:"我们的故事",returns:"退货",privacy:"隐私",refinedPieces:"精致单品，现代生活。",limitedTimeOffer:"限时优惠",upTo40Sale:"低至六折",selectStyles:"精选款式，售完即止。",shopSale:"购买特卖",exploreBtn:"探索",shopNow:"立即购买",shopSaleBtn:"查看特卖",language:"语言" },
  ja:{ home:"ホーム",shop:"ショップ",search:"検索",saved:"保存済み",account:"アカウント",wishlist:"ウィッシュリスト",myBag:"マイバッグ",checkout:"注文する →",addToBag:"バッグに追加",addedToBag:"追加されました ✓",sizeGuide:"サイズガイド",selectSize:"サイズを選択してください",colour:"カラー",size:"サイズ",description:"商品説明",details:"詳細",care:"お手入れ",youMayLike:"あなたへのおすすめ",freeShipping:"送料無料",freeReturns:"返品無料",authenticityGuarantee:"正規品保証",ordersOver:"$200以上のご注文",within30:"30日以内",guaranteed:"保証済み",newIn:"新着 ✦",trendingNow:"トレンド 🔥",onSale:"セール",viewAll:"すべて見る",seeAll:"すべて見る",browse:"ブラウズ",savedItems:"件保存済み",noSaved:"ウィッシュリストは空です",saveItemsYouLove:"お気に入りを保存しよう",material:"素材",shipping:"配送",subtotal:"小計",total:"合計",emptyBag:"バッグは空です",continueShopping:"ショッピングを続ける",freeShippingQualify:"送料無料の対象です！",addMore:"あと",moreForFreeShipping:"で送料無料",recentSearches:"最近の検索",trending:"トレンド",noResults:"結果なし",tryDifferent:"別のキーワードを試してください",results:"件の結果",resultsPlural:"件の結果",forQuery:"の",newArrivals:"新着アイテム",justDropped:"入荷したばかり",ss26:"SS26コレクション",newPieces:"点の新アイテム",limitedTime:"期間限定",upTo40:"最大40%OFF",styles:"スタイル",lookbook:"ルックブック",ss26Edits:"SS26 — 今季のセレクション",shopTheLook:"このコーデを買う",allLooks:"すべてのルック",sustainability:"サステナビリティ",ourCommitment:"私たちの約束",betterFashion:"より良いファッション",orders:"注文",trackOrder:"注文を追跡",orderTotal:"注文合計",tracking:"追跡",orderPlaced:"注文完了",myOrders:"私の注文",addresses:"住所",paymentMethods:"お支払い方法",referFriend:"友達を紹介",notifications:"通知",settings:"設定",premiumMember:"MSAMBWAプレミアム会員",ourStory:"ブランドストーリー",returns:"返品",privacy:"プライバシー",refinedPieces:"現代の生活のための洗練されたアイテム。",limitedTimeOffer:"期間限定",upTo40Sale:"最大40%OFF",selectStyles:"セレクトスタイル。在庫限り。",shopSale:"セールを見る",exploreBtn:"探索する",shopNow:"今すぐ購入",shopSaleBtn:"セールを見る",language:"言語" },
  ko:{ home:"홈",shop:"쇼핑",search:"검색",saved:"저장됨",account:"계정",wishlist:"위시리스트",myBag:"내 가방",checkout:"결제하기 →",addToBag:"가방에 추가",addedToBag:"추가됨 ✓",sizeGuide:"사이즈 가이드",selectSize:"사이즈를 선택해 주세요",colour:"색상",size:"사이즈",description:"상품 설명",details:"상세 정보",care:"관리 방법",youMayLike:"이런 상품도 좋아하실 거예요",freeShipping:"무료 배송",freeReturns:"무료 반품",authenticityGuarantee:"정품 보증",ordersOver:"$200 이상 주문",within30:"30일 이내",guaranteed:"보증됨",newIn:"신상품 ✦",trendingNow:"인기 상품 🔥",onSale:"세일",viewAll:"전체 보기",seeAll:"전체 보기",browse:"탐색",savedItems:"개 저장됨",noSaved:"위시리스트가 비어 있습니다",saveItemsYouLove:"좋아하는 상품을 저장하세요",material:"소재",shipping:"배송",subtotal:"소계",total:"합계",emptyBag:"가방이 비어 있습니다",continueShopping:"쇼핑 계속하기",freeShippingQualify:"무료 배송 대상입니다!",addMore:"추가로",moreForFreeShipping:"더 담으면 무료 배송",recentSearches:"최근 검색어",trending:"인기",noResults:"검색 결과 없음",tryDifferent:"다른 검색어를 시도해 보세요",results:"개 결과",resultsPlural:"개 결과",forQuery:"",newArrivals:"신상품",justDropped:"방금 입고",ss26:"SS26 컬렉션",newPieces:"개 신상품",limitedTime:"한정 기간",upTo40:"최대 40% 할인",styles:"스타일",lookbook:"룩북",ss26Edits:"SS26 — 이번 시즌 큐레이션",shopTheLook:"이 룩 쇼핑하기",allLooks:"모든 룩",sustainability:"지속 가능성",ourCommitment:"우리의 약속",betterFashion:"더 나은 패션",orders:"주문",trackOrder:"주문 추적",orderTotal:"주문 합계",tracking:"추적",orderPlaced:"주문 완료",myOrders:"내 주문",addresses:"주소",paymentMethods:"결제 방법",referFriend:"친구 추천",notifications:"알림",settings:"설정",premiumMember:"MSAMBWA 프리미엄 회원",ourStory:"브랜드 스토리",returns:"반품",privacy:"개인정보",refinedPieces:"현대적인 삶을 위한 세련된 제품.",limitedTimeOffer:"한정 오퍼",upTo40Sale:"최대 40% 할인",selectStyles:"엄선된 스타일. 재고 소진 시까지.",shopSale:"세일 보기",exploreBtn:"탐색",shopNow:"지금 구매",shopSaleBtn:"세일 보기",language:"언어" },
  hi:{ home:"होम",shop:"दुकान",search:"खोजें",saved:"सहेजे गए",account:"खाता",wishlist:"इच्छा सूची",myBag:"मेरा बैग",checkout:"चेकआउट →",addToBag:"बैग में जोड़ें",addedToBag:"जोड़ा गया ✓",sizeGuide:"साइज़ गाइड",selectSize:"कृपया साइज़ चुनें",colour:"रंग",size:"साइज़",description:"विवरण",details:"विस्तृत जानकारी",care:"देखभाल",youMayLike:"आपको यह भी पसंद आ सकता है",freeShipping:"मुफ़्त शिपिंग",freeReturns:"मुफ़्त वापसी",authenticityGuarantee:"प्रामाणिकता गारंटी",ordersOver:"$200 से अधिक के ऑर्डर",within30:"30 दिनों के भीतर",guaranteed:"गारंटीड",newIn:"नया आया ✦",trendingNow:"ट्रेंडिंग 🔥",onSale:"बिक्री पर",viewAll:"सभी देखें",seeAll:"सभी देखें",browse:"ब्राउज़ करें",savedItems:"आइटम सहेजे गए",noSaved:"आपकी इच्छा सूची खाली है",saveItemsYouLove:"जो पसंद हो उसे सहेजें",material:"सामग्री",shipping:"शिपिंग",subtotal:"उप-योग",total:"कुल",emptyBag:"आपका बैग खाली है",continueShopping:"खरीदारी जारी रखें",freeShippingQualify:"मुफ़्त शिपिंग के योग्य!",addMore:"और जोड़ें",moreForFreeShipping:"मुफ़्त शिपिंग के लिए",recentSearches:"हाल की खोजें",trending:"ट्रेंडिंग",noResults:"कोई परिणाम नहीं",tryDifferent:"कोई अन्य शब्द आज़माएं",results:"परिणाम",resultsPlural:"परिणाम",forQuery:"के लिए",newArrivals:"नई आमद",justDropped:"अभी आया",ss26:"SS26 कलेक्शन",newPieces:"नए पीस",limitedTime:"सीमित समय",upTo40:"40% तक छूट",styles:"स्टाइल",lookbook:"लुकबुक",ss26Edits:"SS26 — सीज़न के क्यूरेटेड संपादन",shopTheLook:"यह लुक खरीदें",allLooks:"सभी लुक",sustainability:"स्थिरता",ourCommitment:"हमारी प्रतिबद्धता",betterFashion:"बेहतर फ़ैशन",orders:"ऑर्डर",trackOrder:"ऑर्डर ट्रैक करें",orderTotal:"ऑर्डर कुल",tracking:"ट्रैकिंग",orderPlaced:"ऑर्डर दिया गया",myOrders:"मेरे ऑर्डर",addresses:"पते",paymentMethods:"भुगतान के तरीके",referFriend:"दोस्त को रेफर करें",notifications:"सूचनाएं",settings:"सेटिंग्स",premiumMember:"MSAMBWA प्रीमियम सदस्य",ourStory:"हमारी कहानी",returns:"वापसी",privacy:"गोपनीयता",refinedPieces:"आधुनिक जीवन के लिए परिष्कृत वस्त्र।",limitedTimeOffer:"सीमित समय का ऑफर",upTo40Sale:"40% तक छूट",selectStyles:"चुनिंदा स्टाइल। स्टॉक रहने तक।",shopSale:"सेल देखें",exploreBtn:"एक्सप्लोर करें",shopNow:"अभी खरीदें",shopSaleBtn:"सेल देखें",language:"भाषा" },
  ru:{ home:"Главная",shop:"Магазин",search:"Поиск",saved:"Сохранённые",account:"Аккаунт",wishlist:"Список желаний",myBag:"Моя сумка",checkout:"Оформить →",addToBag:"В сумку",addedToBag:"Добавлено ✓",sizeGuide:"Таблица размеров",selectSize:"Пожалуйста, выберите размер",colour:"Цвет",size:"Размер",description:"Описание",details:"Детали",care:"Уход",youMayLike:"Вам также может понравиться",freeShipping:"Бесплатная доставка",freeReturns:"Бесплатный возврат",authenticityGuarantee:"Гарантия подлинности",ordersOver:"Заказы от $200",within30:"В течение 30 дней",guaranteed:"Гарантировано",newIn:"Новинки ✦",trendingNow:"В тренде 🔥",onSale:"Скидки",viewAll:"Смотреть всё",seeAll:"Смотреть всё",browse:"Просмотр",savedItems:"сохранённых товаров",noSaved:"Ваш список желаний пуст",saveItemsYouLove:"Сохраняйте понравившееся",material:"Материал",shipping:"Доставка",subtotal:"Промежуточный итог",total:"Итого",emptyBag:"Ваша сумка пуста",continueShopping:"Продолжить покупки",freeShippingQualify:"Бесплатная доставка включена!",addMore:"Добавьте",moreForFreeShipping:"для бесплатной доставки",recentSearches:"Недавние поиски",trending:"В тренде",noResults:"Нет результатов",tryDifferent:"Попробуйте другой запрос",results:"результат",resultsPlural:"результатов",forQuery:"по запросу",newArrivals:"Новые поступления",justDropped:"Только что поступило",ss26:"Коллекция SS26",newPieces:"новых изделий",limitedTime:"Ограниченное время",upTo40:"До -40%",styles:"стилей",lookbook:"Лукбук",ss26Edits:"SS26 — Кураторские подборки",shopTheLook:"Купить образ",allLooks:"Все образы",sustainability:"Устойчивость",ourCommitment:"Наши обязательства",betterFashion:"Лучшая мода",orders:"Заказы",trackOrder:"Отследить заказ",orderTotal:"Итого по заказу",tracking:"Отслеживание",orderPlaced:"Заказ оформлен",myOrders:"Мои заказы",addresses:"Адреса",paymentMethods:"Способы оплаты",referFriend:"Пригласить друга",notifications:"Уведомления",settings:"Настройки",premiumMember:"Премиум-участник MSAMBWA",ourStory:"Наша история",returns:"Возврат",privacy:"Конфиденциальность",refinedPieces:"Изысканные вещи для современной жизни.",limitedTimeOffer:"Ограниченное предложение",upTo40Sale:"До -40%",selectStyles:"Избранные стили. Пока есть в наличии.",shopSale:"Смотреть скидки",exploreBtn:"Исследовать",shopNow:"Купить сейчас",shopSaleBtn:"Смотреть скидки",language:"Язык" },
  it:{ home:"Home",shop:"Negozio",search:"Cerca",saved:"Salvati",account:"Account",wishlist:"Lista desideri",myBag:"La mia borsa",checkout:"Acquista →",addToBag:"Aggiungi alla borsa",addedToBag:"Aggiunto ✓",sizeGuide:"Guida alle taglie",selectSize:"Seleziona una taglia",colour:"Colore",size:"Taglia",description:"Descrizione",details:"Dettagli",care:"Cura",youMayLike:"Potrebbe piacerti anche",freeShipping:"Spedizione gratuita",freeReturns:"Resi gratuiti",authenticityGuarantee:"Garanzia di autenticità",ordersOver:"Ordini oltre $200",within30:"Entro 30 giorni",guaranteed:"Garantito",newIn:"Novità ✦",trendingNow:"Tendenze 🔥",onSale:"Saldi",viewAll:"Vedi tutto",seeAll:"Vedi tutto",browse:"Esplora",savedItems:"articoli salvati",noSaved:"La tua lista è vuota",saveItemsYouLove:"Salva ciò che ami",material:"Materiale",shipping:"Spedizione",subtotal:"Subtotale",total:"Totale",emptyBag:"La tua borsa è vuota",continueShopping:"Continua gli acquisti",freeShippingQualify:"Spedizione gratuita inclusa!",addMore:"Aggiungi",moreForFreeShipping:"per la spedizione gratuita",recentSearches:"Ricerche recenti",trending:"Tendenze",noResults:"Nessun risultato",tryDifferent:"Prova un altro termine",results:"risultato",resultsPlural:"risultati",forQuery:"per",newArrivals:"Nuovi arrivi",justDropped:"Appena arrivato",ss26:"Collezione SS26",newPieces:"nuovi pezzi",limitedTime:"Tempo limitato",upTo40:"Fino al -40%",styles:"stili",lookbook:"Lookbook",ss26Edits:"SS26 — Selezioni stagionali",shopTheLook:"Acquista il look",allLooks:"Tutti i look",sustainability:"Sostenibilità",ourCommitment:"Il nostro impegno",betterFashion:"Moda migliore",orders:"Ordini",trackOrder:"Traccia ordine",orderTotal:"Totale ordine",tracking:"Tracciamento",orderPlaced:"Ordine effettuato",myOrders:"I miei ordini",addresses:"Indirizzi",paymentMethods:"Pagamenti",referFriend:"Invita un amico",notifications:"Notifiche",settings:"Impostazioni",premiumMember:"Membro Premium MSAMBWA",ourStory:"La nostra storia",returns:"Resi",privacy:"Privacy",refinedPieces:"Pezzi raffinati per la vita moderna.",limitedTimeOffer:"Offerta limitata",upTo40Sale:"Fino al -40%",selectStyles:"Stili selezionati. Fino ad esaurimento.",shopSale:"Vai ai saldi",exploreBtn:"Esplora",shopNow:"Acquista ora",shopSaleBtn:"Vai ai saldi",language:"Lingua" },
  nl:{ home:"Home",shop:"Winkel",search:"Zoeken",saved:"Opgeslagen",account:"Account",wishlist:"Verlanglijst",myBag:"Mijn tas",checkout:"Afrekenen →",addToBag:"In tas",addedToBag:"Toegevoegd ✓",sizeGuide:"Maatgids",selectSize:"Kies een maat",colour:"Kleur",size:"Maat",description:"Beschrijving",details:"Details",care:"Verzorging",youMayLike:"Misschien vind je dit ook leuk",freeShipping:"Gratis verzending",freeReturns:"Gratis retour",authenticityGuarantee:"Echtheidsgarantie",ordersOver:"Bestellingen boven $200",within30:"Binnen 30 dagen",guaranteed:"Gegarandeerd",newIn:"Nieuw ✦",trendingNow:"Trending 🔥",onSale:"Sale",viewAll:"Alles bekijken",seeAll:"Alles bekijken",browse:"Bladeren",savedItems:"opgeslagen items",noSaved:"Je verlanglijst is leeg",saveItemsYouLove:"Sla op wat je mooi vindt",material:"Materiaal",shipping:"Verzending",subtotal:"Subtotaal",total:"Totaal",emptyBag:"Je tas is leeg",continueShopping:"Doorgaan met winkelen",freeShippingQualify:"Gratis verzending inbegrepen!",addMore:"Voeg",moreForFreeShipping:"toe voor gratis verzending",recentSearches:"Recente zoekopdrachten",trending:"Trending",noResults:"Geen resultaten",tryDifferent:"Probeer een andere zoekterm",results:"resultaat",resultsPlural:"resultaten",forQuery:"voor",newArrivals:"Nieuw binnen",justDropped:"Zojuist binnen",ss26:"SS26 Collectie",newPieces:"nieuwe stukken",limitedTime:"Beperkte tijd",upTo40:"Tot -40%",styles:"stijlen",lookbook:"Lookbook",ss26Edits:"SS26 — Gecureerde selecties",shopTheLook:"Shop de look",allLooks:"Alle looks",sustainability:"Duurzaamheid",ourCommitment:"Onze belofte",betterFashion:"Betere mode",orders:"Bestellingen",trackOrder:"Bestelling volgen",orderTotal:"Bestelingstotaal",tracking:"Volgen",orderPlaced:"Bestelling geplaatst",myOrders:"Mijn bestellingen",addresses:"Adressen",paymentMethods:"Betaalmethoden",referFriend:"Vriend doorverwijzen",notifications:"Meldingen",settings:"Instellingen",premiumMember:"MSAMBWA Premium lid",ourStory:"Ons verhaal",returns:"Retours",privacy:"Privacy",refinedPieces:"Verfijnde stukken voor het moderne leven.",limitedTimeOffer:"Beperkte aanbieding",upTo40Sale:"Tot -40%",selectStyles:"Geselecteerde stijlen. Zolang de voorraad strekt.",shopSale:"Bekijk sale",exploreBtn:"Ontdekken",shopNow:"Nu kopen",shopSaleBtn:"Bekijk sale",language:"Taal" },
};

const LangCtx = createContext({ lang:"en", t:TR.en, setLang:()=>{} });
const useLang = () => useContext(LangCtx);

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
  const { t } = useLang();
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
                <p style={{ fontSize:13, color:T.gray3, marginBottom:7 }}>{t.addMore} <strong style={{color:T.black}}>{$(200-total)}</strong> {t.moreForFreeShipping}</p>
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
  const { t } = useLang();
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
        {[["truck",t.freeShipping],["returns",t.freeReturns],["tag",t.authenticityGuarantee]].map(([icon,label])=>(
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6, background:T.gray9, borderRadius:10, padding:"8px 12px" }}>
            <Icon name={icon} size={14} color={T.gray3}/>
            <span style={{ fontSize:12, fontWeight:500, color:T.gray2 }}>{label}</span>
          </div>
        ))}
      </div>

      <Divider my={4}/>
      <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${T.gray8}`, marginBottom:20 }}>
        {[["desc",t.description],["details",t.details],["care",t.care]].map(([key,label])=>(
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
  const { t } = useLang();
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
          { label:t.lookbook,     sub:"Styled edits",  screen:"lookbook", grad:"linear-gradient(135deg,#EDE8E0,#D4C8B5)", dark:false },
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
        {[{icon:"truck",label:t.freeShipping,sub:t.ordersOver},{icon:"returns",label:t.freeReturns,sub:t.within30},{icon:"scan",label:t.authenticityGuarantee,sub:t.guaranteed}].map(item=>(
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
      <div style={{ borderTop:`1px solid ${T.gray8}`, paddingTop:24, paddingBottom:20 }}>
        <div style={{ marginBottom:12 }}><Logo height={14} color={T.gray4}/></div>
        <p style={{ fontSize:13, color:T.gray5, marginBottom:18, lineHeight:1.5 }}>Refined pieces for modern living.</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"10px 20px" }}>
          {[[t.ourStory,"sustainability"],[t.lookbook,"lookbook"],[t.onSale,"sale"],[t.newArrivals,"new-arrivals"],[t.returns,null],[t.privacy,null]].map(([l,s])=>(
            <span key={l} onClick={s?()=>onNavigate(s):undefined}
              style={{ fontSize:12, color:T.gray5, cursor:s?"pointer":"default", textDecoration:s?"underline":"none", textDecorationColor:T.gray7 }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShopScreen({ products, onSelect, onWishlist, wishlist }) {
  const { t } = useLang();
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
            <option value="featured">{t.browse}</option>
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
    </div>
  );
}

function SearchScreen({ products, onSelect, onWishlist, wishlist }) {
  const { t } = useLang();
  const [q,setQ]       = useState("");
  const [recent]       = useState(["Cashmere","Linen","Silk dress","Trench coat"]);
  const res = useMemo(()=>q.trim().length<2?[]:products.filter(p=>p.name.toLowerCase().includes(q.toLowerCase())||p.cat.toLowerCase().includes(q.toLowerCase())),[q]);

  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ position:"relative", marginBottom:22 }}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.search+"…"}
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
    </div>
  );
}

function WishlistScreen({ products, wishlist, onSelect, onWishlist }) {
  const { t } = useLang();
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
    </div>
  );
}

function AccountScreen({ onNavigate }) {
  const { t } = useLang();
  const rows = [
    { icon:"box",      label:t.myOrders,          sub:"3 orders",               go:"orders" },
    { icon:"heart",    label:t.wishlist,           sub:"4 saved items",          go:"wishlist" },
    { icon:"location", label:t.addresses,          sub:"2 saved addresses",      go:null },
    { icon:"card",     label:t.paymentMethods,     sub:"Visa ····4242",          go:null },
    { icon:"gift",     label:t.referFriend,        sub:"Give $20, get $20",      go:null },
    { icon:"bell",     label:t.notifications,      sub:"Manage alerts",          go:null },
    { icon:"settings", label:t.settings,           sub:"Account preferences",    go:null },
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
    </div>
  );
}

function NewArrivalsScreen({ products, onSelect, onWishlist, wishlist }) {
  const { t } = useLang();
  const items = products.filter(p=>p.new);
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ background:"linear-gradient(135deg,#1C1C1E 0%,#3A3A3C 100%)", borderRadius:10, padding:"28px 22px", marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)", marginBottom:8 }}>Just dropped</p>
        <h2 style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:-0.8, lineHeight:1.1, marginBottom:4 }}>New Arrivals</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)" }}>{t.ss26} · {items.length} {t.newPieces}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 10px" }}>
        {items.map(p=>(
          <ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
        ))}
      </div>
    </div>
  );
}

function SaleScreen({ products, onSelect, onWishlist, wishlist }) {
  const { t } = useLang();
  const items = products.filter(p=>p.badge==="Sale");
  return (
    <div style={{ animation:"fadeIn 0.25s ease" }}>
      <div style={{ background:"linear-gradient(135deg,#FF3B30 0%,#C0392B 100%)", borderRadius:10, padding:"28px 22px", marginBottom:20 }}>
        <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", color:"rgba(255,255,255,0.55)", marginBottom:8 }}>Limited time</p>
        <h2 style={{ fontSize:30, fontWeight:900, color:"#fff", letterSpacing:-0.8, lineHeight:1.1, marginBottom:4 }}>Sale</h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)" }}>{t.upTo40} · {items.length} {t.styles}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 10px" }}>
        {items.map(p=>(
          <ProductCard key={p.id} p={p} grid onSelect={onSelect} onWishlist={onWishlist} wishlisted={wishlist.includes(p.id)}/>
        ))}
      </div>
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
  const { t } = useLang();
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
    </div>
  );
}

function SustainabilityScreen() {
  const { t } = useLang();
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
    </div>
  );
}

function Logo({ color = "#000", height = 18 }) {
  return (
    <svg height={height} viewBox="0 0 220 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display:"block" }}>
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

function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const t = useLang().t;
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(o=>!o)} className="pressable-sm"
        style={{ display:"flex", alignItems:"center", gap:5, background:T.gray9, border:"none",
          borderRadius:99, padding:"6px 12px 6px 10px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
        <span style={{ fontSize:15 }}>
          {lang==="en"?"🇬🇧":lang==="sw"?"🇹🇿":lang==="fr"?"🇫🇷":lang==="de"?"🇩🇪":
           lang==="es"?"🇪🇸":lang==="pt"?"🇧🇷":lang==="ar"?"🇸🇦":lang==="zh"?"🇨🇳":
           lang==="ja"?"🇯🇵":lang==="ko"?"🇰🇷":lang==="hi"?"🇮🇳":lang==="ru"?"🇷🇺":
           lang==="it"?"🇮🇹":"🇳🇱"}
        </span>
        <span style={{ color:T.gray2 }}>{LANGS[lang]}</span>
      </button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{ position:"fixed", inset:0, zIndex:299 }}/>
          <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:T.white,
            borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.15)", zIndex:300,
            minWidth:170, overflow:"hidden", border:`1px solid ${T.gray8}` }}>
            {Object.entries(LANGS).map(([code, name]) => (
              <button key={code} onClick={()=>{ setLang(code); setOpen(false); }}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10,
                  padding:"11px 16px", background:lang===code?T.gray9:T.white,
                  border:"none", cursor:"pointer", fontSize:14,
                  fontWeight:lang===code?700:400, color:T.black, textAlign:"left" }}>
                <span style={{ fontSize:16 }}>
                  {code==="en"?"🇬🇧":code==="sw"?"🇹🇿":code==="fr"?"🇫🇷":code==="de"?"🇩🇪":
                   code==="es"?"🇪🇸":code==="pt"?"🇧🇷":code==="ar"?"🇸🇦":code==="zh"?"🇨🇳":
                   code==="ja"?"🇯🇵":code==="ko"?"🇰🇷":code==="hi"?"🇮🇳":code==="ru"?"🇷🇺":
                   code==="it"?"🇮🇹":"🇳🇱"}
                </span>
                {name}
                {lang===code && <span style={{ marginLeft:"auto", color:T.black }}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Header({ screen, cartCount, onCart, onNavigate, canGoBack, onBack, wishlistCount, lang, setLang }) {
  const { t } = useLang();
  const screenTitles = { home:"", shop:t.shop, search:t.search, wishlist:t.wishlist, account:t.account, orders:t.orders, product:"", "new-arrivals":t.newArrivals, sale:t.onSale, lookbook:t.lookbook, sustainability:t.sustainability };
  const title = screenTitles[screen] || "";

  return (
    <header style={{ background:"rgba(255,255,255,0.94)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${T.gray8}`, position:"sticky", top:0, zIndex:200, userSelect:"none" }}>
      {!canGoBack && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 16px 0", borderBottom:`1px solid ${T.gray8}` }}>
          <button onClick={()=>onNavigate("home")} style={{ background:"none", border:"none", cursor:"pointer", padding:"2px 0" }}>
            <Logo height={13}/>
          </button>
          <LanguageSwitcher lang={lang} setLang={setLang}/>
        </div>
      )}
      <div style={{ height:52, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:4, minWidth:80 }}>
          {canGoBack && <IconBtn icon="back" onClick={onBack} size={36} bg="transparent"/>}
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
  const { t } = useLang();
  const tabs = [
    { s:"home",     icon:"home",    label:t.home },
    { s:"shop",     icon:"grid",    label:t.shop },
    { s:"search",   icon:"search",  label:t.search },
    { s:"wishlist", icon:"heart",   label:t.saved },
    { s:"account",  icon:"person",  label:t.account },
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

  const [lang, setLang] = useState("en");
  const t = TR[lang] || TR.en;

  return (
    <LangCtx.Provider value={{ lang, t, setLang }}>
      <div style={{ height:"100dvh", display:"flex", flexDirection:"column", background:T.white, fontFamily:"'Geist',-apple-system,sans-serif", overflow:"hidden" }}>
        <Header
          screen={current.screen}
          cartCount={cartCount}
          onCart={()=>setCartOpen(true)}
          onNavigate={navigate}
          canGoBack={canGoBack}
          onBack={goBack}
          wishlistCount={wishlist.length}
          lang={lang}
          setLang={setLang}
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
    </LangCtx.Provider>
  );
}
