// Machine-drafted translations of the seed content. Stored with reviewed = false; the site shows a
// "translation under review" note until the owner marks the language as reviewed in the admin.
// es-MX and es-CO need no rows: they fall back to "es" automatically.
import type { Locale } from "../src/lib/i18n/locales";

export type SeedTranslation = {
  profile: { title: string; intro: string; bio: string };
  services: { name: string; description: string; examples: string[] }[];
  packages: { name: string; description: string; features: string[] }[];
  offers: { whenEarned: string; terms: string }[];
  projects: { summary: string; features: string[]; alts: string[] }[];
};

export const translations: Partial<Record<Locale, SeedTranslation>> = {
  fr: {
    profile: {
      title: "Ingénieur logiciel : sites web, applications et logiciels de bureau pour les entreprises, les startups et les nouveaux projets.",
      intro:
        "Je conçois et développe des logiciels adaptés au fonctionnement de votre entreprise : des sites qui attirent des clients, des applications qu'ils utilisent chaque jour et des outils de bureau sur lesquels votre équipe s'appuie. Chaque projet part de vos besoins et de son périmètre.",
      bio: "Je suis Zack, ingénieur logiciel. Je conçois et développe des sites web, des boutiques en ligne, des plateformes, des applications et des logiciels de bureau pour les entreprises. J'accompagne chaque projet du premier échange jusqu'à la mise en ligne, j'explique les choix en chemin et je garde le périmètre et le prix clairs, par écrit.",
    },
    services: [
      {
        name: "Sites web et plateformes",
        description:
          "D'un site d'une page à une plateforme complète : pages d'atterrissage, sites vitrines, boutiques en ligne, sites de restaurants et de réservation, places de marché et systèmes de rendez-vous.",
        examples: ["Pages d'atterrissage", "Sites d'entreprise", "Boutiques en ligne", "Sites de restaurants", "Plateformes de réservation", "Places de marché automobile", "Plateformes médicales et de rendez-vous", "Plateformes d'IA"],
      },
      {
        name: "Applications",
        description: "Des applications pour vos clients et votre équipe : commandes, fidélité, outils internes et tableaux de bord pour boutiques, entreprises et restaurants.",
        examples: ["Boutiques", "Entreprises", "Restaurants", "Autres activités"],
      },
      {
        name: "Logiciels de bureau",
        description: "Des logiciels installés sur vos ordinateurs pour le quotidien : ventes, stock, commandes, factures et personnel, même quand Internet est lent.",
        examples: ["Boutiques", "Entreprises", "Restaurants", "Cafés", "Autres activités"],
      },
    ],
    packages: [
      { name: "Page d'atterrissage", description: "Une page claire pour présenter votre activité ou une offre.", features: ["Design adapté au mobile", "Formulaire de contact", "Bases du référencement", "6 mois de domaine et hébergement"] },
      { name: "Site d'entreprise", description: "Un site de plusieurs pages que vous pouvez mettre à jour vous-même.", features: ["Jusqu'à environ 6 pages", "Espace admin pour modifier le contenu", "Contact et WhatsApp", "6 mois de domaine et hébergement"] },
      { name: "Boutique en ligne ou réservation", description: "Vendez en ligne ou prenez des réservations, avec un espace admin pour tout gérer.", features: ["Catalogue ou calendrier de réservation", "Gestion des commandes", "Notifications aux clients", "6 mois de domaine et hébergement"] },
      { name: "Plateforme ou application sur mesure", description: "Places de marché, plateformes multi-utilisateurs, applications et logiciels de bureau.", features: ["Fonctionnalités sur mesure", "Comptes et rôles utilisateurs", "Tableau de bord admin", "6 mois de domaine et hébergement"] },
    ],
    offers: [
      {
        whenEarned: "Quand l'entreprise recommandée signe l'accord de projet et paie son premier versement.",
        terms: "Une récompense par entreprise recommandée. L'entreprise doit être un nouveau client et accepter d'être contactée. On ne peut pas se recommander soi-même. La récompense est versée après réception du premier versement.",
      },
      {
        whenEarned: "Quand l'entreprise recommandée signe l'accord de projet et paie son premier versement.",
        terms: "Une récompense par entreprise recommandée. L'entreprise doit être un nouveau client et accepter d'être contactée. On ne peut pas se recommander soi-même. La récompense est versée après réception du premier versement.",
      },
    ],
    projects: [
      { summary: "Une boutique en ligne de streetwear : collections, fiches produits, panier, paiement et suivi de commande.", features: ["Collections et fiches produits", "Liste d'envies et comptes clients", "Paiement et suivi de commande", "Tableau de bord admin"], alts: ["Page d'accueil de KING 253", "Page collection de KING 253", "Page histoire de la marque KING 253", "Page d'accueil de KING 253 sur téléphone"] },
      { summary: "Une boutique en ligne d'art mural et de décoration : œuvres et miroirs LED avec prix selon la taille, et demandes de design sur mesure.", features: ["Catalogue avec prix selon la taille", "Demandes de design sur mesure avec envoi d'image", "Comptes clients et avis", "Back-office d'administration"], alts: ["Page d'accueil de Boulboul Art Wall", "Catalogue de Boulboul Art Wall", "Formulaire de design sur mesure de Boulboul Art Wall", "Page d'accueil de Boulboul Art Wall sur téléphone"] },
      { summary: "Une plateforme de vente de voitures inspirée des petites annonces locales, pensée pour évoluer : fiches détaillées, recherche et filtres, comptes et panneau d'administration.", features: ["Catalogue de véhicules avec recherche et filtres", "Caractéristiques détaillées par voiture", "Espace client et favoris", "Panneau admin et API REST"], alts: ["Page d'accueil de ZODIC CAR", "Catalogue de véhicules de ZODIC CAR", "Page à propos de ZODIC CAR", "Page d'accueil de ZODIC CAR sur téléphone"] },
    ],
  },
  ar: {
    profile: {
      title: "مهندس برمجيات يطوّر مواقع وتطبيقات وبرامج مكتبية للشركات والشركات الناشئة والمشاريع الجديدة.",
      intro:
        "أخطط وأبني برامج تناسب طريقة عمل شركتك: مواقع تجذب العملاء، وتطبيقات يستخدمونها كل يوم، وأدوات مكتبية يعتمد عليها فريقك. كل مشروع يبدأ من احتياجاتك ونطاقه.",
      bio: "أنا زاك، مهندس برمجيات. أصمم وأطوّر مواقع ويب ومتاجر إلكترونية ومنصات وتطبيقات وبرامج مكتبية للشركات. أرافق المشروع من أول محادثة حتى الإطلاق، وأشرح الخيارات خلال العمل، وأحافظ على وضوح النطاق والسعر كتابيًا.",
    },
    services: [
      {
        name: "مواقع ومنصات",
        description: "من موقع بصفحة واحدة إلى منصة متكاملة: صفحات هبوط، مواقع شركات، متاجر إلكترونية، مواقع مطاعم وحجوزات، أسواق إلكترونية وأنظمة مواعيد.",
        examples: ["صفحات هبوط", "مواقع شركات", "متاجر إلكترونية", "مواقع مطاعم", "منصات حجز", "أسواق السيارات", "منصات طبية ومواعيد", "منصات ذكاء اصطناعي"],
      },
      {
        name: "تطبيقات",
        description: "تطبيقات للعملاء والموظفين: الطلبات، الولاء، الأدوات الداخلية ولوحات التحكم للمتاجر والشركات والمطاعم.",
        examples: ["المتاجر", "الشركات", "المطاعم", "أعمال أخرى"],
      },
      {
        name: "برامج مكتبية",
        description: "برامج تُثبَّت على حواسيبك للعمل اليومي: المبيعات، المخزون، الطلبات، الفواتير والموظفون، حتى عندما يكون الإنترنت بطيئًا.",
        examples: ["المتاجر", "الشركات", "المطاعم", "المقاهي", "أعمال أخرى"],
      },
    ],
    packages: [
      { name: "صفحة هبوط", description: "صفحة واحدة مركّزة لتقديم عملك أو عرض واحد.", features: ["تصميم متجاوب", "نموذج تواصل", "إعداد أساسي لمحركات البحث", "6 أشهر نطاق واستضافة"] },
      { name: "موقع شركة", description: "موقع متعدد الصفحات يمكنك تحديثه بنفسك.", features: ["حتى 6 صفحات تقريبًا", "لوحة لتعديل المحتوى", "تواصل وواتساب", "6 أشهر نطاق واستضافة"] },
      { name: "متجر إلكتروني أو نظام حجز", description: "بِع منتجاتك أو استقبل الحجوزات عبر الإنترنت، مع لوحة تحكم لإدارتها.", features: ["كتالوج أو تقويم حجوزات", "إدارة الطلبات", "إشعارات للعملاء", "6 أشهر نطاق واستضافة"] },
      { name: "منصة أو تطبيق حسب الطلب", description: "أسواق إلكترونية، منصات متعددة المستخدمين، تطبيقات وبرامج مكتبية.", features: ["ميزات حسب الطلب", "حسابات وصلاحيات المستخدمين", "لوحة تحكم", "6 أشهر نطاق واستضافة"] },
    ],
    offers: [
      {
        whenEarned: "عندما توقّع الشركة التي أحلتها اتفاقية المشروع وتدفع الدفعة الأولى.",
        terms: "مكافأة واحدة لكل شركة مُحالة. يجب أن تكون الشركة عميلًا جديدًا وأن توافق على التواصل معها. لا تُقبل الإحالة الذاتية. تُدفع المكافأة بعد استلام الدفعة الأولى.",
      },
      {
        whenEarned: "عندما توقّع الشركة التي أحلتها اتفاقية المشروع وتدفع الدفعة الأولى.",
        terms: "مكافأة واحدة لكل شركة مُحالة. يجب أن تكون الشركة عميلًا جديدًا وأن توافق على التواصل معها. لا تُقبل الإحالة الذاتية. تُدفع المكافأة بعد استلام الدفعة الأولى.",
      },
    ],
    projects: [
      { summary: "متجر إلكتروني لملابس الستريت وير: مجموعات، صفحات منتجات، سلة، دفع وتتبع الطلبات.", features: ["مجموعات وصفحات منتجات", "قائمة الأمنيات وحسابات العملاء", "الدفع وتتبع الطلبات", "لوحة تحكم"], alts: ["الصفحة الرئيسية لـ KING 253", "صفحة المجموعة في KING 253", "صفحة قصة علامة KING 253", "الصفحة الرئيسية لـ KING 253 على الهاتف"] },
      { summary: "متجر إلكتروني للوحات الجدارية والديكور: أعمال فنية ومرايا LED بأسعار حسب المقاس، مع طلبات تصميم خاص.", features: ["كتالوج بأسعار حسب المقاس", "طلبات تصميم خاص مع رفع صورة", "حسابات العملاء والتقييمات", "لوحة إدارة"], alts: ["الصفحة الرئيسية لـ Boulboul Art Wall", "كتالوج Boulboul Art Wall", "نموذج التصميم الخاص في Boulboul Art Wall", "الصفحة الرئيسية لـ Boulboul Art Wall على الهاتف"] },
      { summary: "منصة لبيع السيارات مستوحاة من مواقع الإعلانات المحلية، ومصممة للتوسع: إعلانات مفصلة، بحث وتصفية، حسابات ولوحة إدارة.", features: ["كتالوج سيارات مع بحث وتصفية", "مواصفات مفصلة لكل سيارة", "لوحة العميل والمفضلة", "لوحة إدارة وواجهة REST"], alts: ["الصفحة الرئيسية لـ ZODIC CAR", "كتالوج السيارات في ZODIC CAR", "صفحة من نحن في ZODIC CAR", "الصفحة الرئيسية لـ ZODIC CAR على الهاتف"] },
    ],
  },
  it: {
    profile: {
      title: "Ingegnere del software: siti web, app e software desktop per aziende, startup e nuovi progetti.",
      intro:
        "Progetto e sviluppo software attorno al modo in cui lavora la tua azienda: siti che portano clienti, app che usano ogni giorno e strumenti desktop su cui il tuo team fa affidamento. Ogni progetto parte dalle tue esigenze e dal suo perimetro.",
      bio: "Sono Zack, ingegnere del software. Progetto e sviluppo siti web, negozi online, piattaforme, app e software desktop per le aziende. Seguo ogni progetto dalla prima conversazione al lancio, spiego le scelte lungo il percorso e tengo perimetro e prezzo chiari, per iscritto.",
    },
    services: [
      {
        name: "Siti web e piattaforme",
        description: "Da un sito di una pagina a una piattaforma completa: landing page, siti aziendali, negozi online, siti per ristoranti e prenotazioni, marketplace e sistemi di appuntamenti.",
        examples: ["Landing page", "Siti aziendali", "Negozi online", "Siti per ristoranti", "Piattaforme di prenotazione", "Marketplace di auto", "Piattaforme mediche e appuntamenti", "Piattaforme di IA"],
      },
      {
        name: "App",
        description: "App per clienti e personale: ordini, fidelizzazione, strumenti interni e dashboard per negozi, aziende e ristoranti.",
        examples: ["Negozi", "Aziende", "Ristoranti", "Altre attività"],
      },
      {
        name: "Software desktop",
        description: "Software installato sui tuoi computer per il lavoro quotidiano: vendite, magazzino, ordini, fatture e personale, anche quando internet è lento.",
        examples: ["Negozi", "Aziende", "Ristoranti", "Bar", "Altre attività"],
      },
    ],
    packages: [
      { name: "Landing page", description: "Una pagina mirata per presentare la tua attività o un'offerta.", features: ["Design responsive", "Modulo di contatto", "SEO di base", "6 mesi di dominio e hosting"] },
      { name: "Sito aziendale", description: "Un sito di più pagine che puoi aggiornare da solo.", features: ["Fino a circa 6 pagine", "Pannello per modificare i contenuti", "Contatti e WhatsApp", "6 mesi di dominio e hosting"] },
      { name: "Negozio online o prenotazioni", description: "Vendi online o ricevi prenotazioni, con un pannello per gestire tutto.", features: ["Catalogo o calendario prenotazioni", "Gestione ordini", "Notifiche ai clienti", "6 mesi di dominio e hosting"] },
      { name: "Piattaforma o app su misura", description: "Marketplace, piattaforme multiutente, app e software desktop.", features: ["Funzionalità su misura", "Account e ruoli utente", "Dashboard di amministrazione", "6 mesi di dominio e hosting"] },
    ],
    offers: [
      {
        whenEarned: "Quando l'azienda segnalata firma l'accordo di progetto e paga la prima rata.",
        terms: "Una ricompensa per ogni azienda segnalata. L'azienda deve essere un nuovo cliente e accettare di essere contattata. Non è possibile segnalare se stessi. La ricompensa viene pagata dopo aver ricevuto la prima rata.",
      },
      {
        whenEarned: "Quando l'azienda segnalata firma l'accordo di progetto e paga la prima rata.",
        terms: "Una ricompensa per ogni azienda segnalata. L'azienda deve essere un nuovo cliente e accettare di essere contattata. Non è possibile segnalare se stessi. La ricompensa viene pagata dopo aver ricevuto la prima rata.",
      },
    ],
    projects: [
      { summary: "Un negozio online di streetwear: collezioni, pagine prodotto, carrello, pagamento e tracciamento ordini.", features: ["Collezioni e pagine prodotto", "Lista desideri e account clienti", "Pagamento e tracciamento ordini", "Dashboard di amministrazione"], alts: ["Home page di KING 253", "Pagina collezione di KING 253", "Pagina storia del brand KING 253", "Home page di KING 253 su smartphone"] },
      { summary: "Un negozio online di quadri e decorazioni da parete: opere e specchi LED con prezzo in base alla misura, più richieste di design personalizzato.", features: ["Catalogo con prezzi in base alla misura", "Richieste di design con caricamento immagine", "Account clienti e recensioni", "Back-office di amministrazione"], alts: ["Home page di Boulboul Art Wall", "Catalogo di Boulboul Art Wall", "Modulo di design personalizzato di Boulboul Art Wall", "Home page di Boulboul Art Wall su smartphone"] },
      { summary: "Una piattaforma di vendita auto ispirata agli annunci locali, pensata per crescere: schede dettagliate, ricerca e filtri, account e pannello di amministrazione.", features: ["Catalogo auto con ricerca e filtri", "Specifiche dettagliate per ogni auto", "Area cliente e preferiti", "Pannello admin e API REST"], alts: ["Home page di ZODIC CAR", "Catalogo veicoli di ZODIC CAR", "Pagina chi siamo di ZODIC CAR", "Home page di ZODIC CAR su smartphone"] },
    ],
  },
  tr: {
    profile: {
      title: "İşletmeler, girişimler ve yeni projeler için web siteleri, uygulamalar ve masaüstü yazılımlar geliştiren yazılım mühendisi.",
      intro:
        "İşletmenizin çalışma şekline uygun yazılımlar planlar ve geliştiririm: müşteri getiren web siteleri, her gün kullandıkları uygulamalar ve ekibinizin güvendiği masaüstü araçlar. Her proje ihtiyaçlarınızdan ve kapsamından başlar.",
      bio: "Ben Zack, yazılım mühendisiyim. İşletmeler için web siteleri, online mağazalar, platformlar, uygulamalar ve masaüstü yazılımlar tasarlayıp geliştiriyorum. Projeyi ilk görüşmeden yayına kadar yürütür, seçimleri yol boyunca açıklar, kapsamı ve fiyatı yazılı olarak net tutarım.",
    },
    services: [
      {
        name: "Web siteleri ve platformlar",
        description: "Tek sayfalık siteden tam bir platforma: açılış sayfaları, kurumsal siteler, online mağazalar, restoran ve rezervasyon siteleri, pazar yerleri ve randevu sistemleri.",
        examples: ["Açılış sayfaları", "Kurumsal siteler", "Online mağazalar", "Restoran siteleri", "Rezervasyon platformları", "Araç pazar yerleri", "Sağlık ve randevu platformları", "Yapay zekâ platformları"],
      },
      {
        name: "Uygulamalar",
        description: "Müşteriler ve çalışanlar için uygulamalar: sipariş, sadakat, iç araçlar ve mağazalar, şirketler ve restoranlar için paneller.",
        examples: ["Mağazalar", "Şirketler", "Restoranlar", "Diğer işletmeler"],
      },
      {
        name: "Masaüstü yazılımlar",
        description: "Günlük işler için bilgisayarlarınıza kurulan yazılımlar: satış, stok, sipariş, fatura ve personel; internet yavaş olsa bile çalışır.",
        examples: ["Mağazalar", "Şirketler", "Restoranlar", "Kafeler", "Diğer işletmeler"],
      },
    ],
    packages: [
      { name: "Açılış sayfası", description: "İşletmenizi veya tek bir teklifi tanıtan odaklı bir sayfa.", features: ["Mobil uyumlu tasarım", "İletişim formu", "Temel SEO ayarları", "6 ay alan adı ve barındırma"] },
      { name: "Kurumsal web sitesi", description: "Kendiniz güncelleyebileceğiniz çok sayfalı bir site.", features: ["Yaklaşık 6 sayfaya kadar", "İçerik düzenleme paneli", "İletişim ve WhatsApp", "6 ay alan adı ve barındırma"] },
      { name: "Online mağaza veya rezervasyon", description: "Ürün satın veya online rezervasyon alın; hepsini yönetmek için bir panelle.", features: ["Katalog veya rezervasyon takvimi", "Sipariş yönetimi", "Müşteri bildirimleri", "6 ay alan adı ve barındırma"] },
      { name: "Özel platform veya uygulama", description: "Pazar yerleri, çok kullanıcılı platformlar, uygulamalar ve masaüstü yazılımlar.", features: ["Özel özellikler", "Kullanıcı hesapları ve rolleri", "Yönetim paneli", "6 ay alan adı ve barındırma"] },
    ],
    offers: [
      {
        whenEarned: "Tavsiye ettiğiniz işletme proje sözleşmesini imzalayıp ilk taksiti ödediğinde.",
        terms: "Tavsiye edilen her işletme için bir ödül. İşletme yeni bir müşteri olmalı ve iletişime geçilmesini kabul etmelidir. Kişi kendini tavsiye edemez. Ödül, ilk taksit alındıktan sonra ödenir.",
      },
      {
        whenEarned: "Tavsiye ettiğiniz işletme proje sözleşmesini imzalayıp ilk taksiti ödediğinde.",
        terms: "Tavsiye edilen her işletme için bir ödül. İşletme yeni bir müşteri olmalı ve iletişime geçilmesini kabul etmelidir. Kişi kendini tavsiye edemez. Ödül, ilk taksit alındıktan sonra ödenir.",
      },
    ],
    projects: [
      { summary: "Bir streetwear giyim mağazası: koleksiyonlar, ürün sayfaları, sepet, ödeme ve sipariş takibi.", features: ["Koleksiyonlar ve ürün sayfaları", "İstek listesi ve müşteri hesapları", "Ödeme ve sipariş takibi", "Yönetim paneli"], alts: ["KING 253 ana sayfası", "KING 253 koleksiyon sayfası", "KING 253 marka hikâyesi sayfası", "KING 253 ana sayfası telefonda"] },
      { summary: "Duvar sanatı ve dekorasyon için online mağaza: ölçüye göre fiyatlanan eserler ve LED aynalar, ayrıca özel tasarım talepleri.", features: ["Ölçüye göre fiyatlı katalog", "Görsel yüklemeli özel tasarım talepleri", "Müşteri hesapları ve yorumlar", "Yönetim paneli"], alts: ["Boulboul Art Wall ana sayfası", "Boulboul Art Wall kataloğu", "Boulboul Art Wall özel tasarım formu", "Boulboul Art Wall ana sayfası telefonda"] },
      { summary: "Yerel ilan sitelerinden ilham alan, büyümeye hazır bir araç satış platformu: ayrıntılı ilanlar, arama ve filtreler, hesaplar ve yönetim paneli.", features: ["Arama ve filtreli araç kataloğu", "Her araç için ayrıntılı özellikler", "Müşteri paneli ve favoriler", "Yönetim paneli ve REST API"], alts: ["ZODIC CAR ana sayfası", "ZODIC CAR araç kataloğu", "ZODIC CAR hakkında sayfası", "ZODIC CAR ana sayfası telefonda"] },
    ],
  },
  es: {
    profile: {
      title: "Ingeniero de software: sitios web, apps y software de escritorio para empresas, startups y nuevos proyectos.",
      intro:
        "Planifico y desarrollo software según cómo funciona tu negocio: sitios web que atraen clientes, apps que usan cada día y herramientas de escritorio en las que confía tu equipo. Cada proyecto parte de tus necesidades y de su alcance.",
      bio: "Soy Zack, ingeniero de software. Diseño y desarrollo sitios web, tiendas online, plataformas, apps y software de escritorio para empresas. Acompaño cada proyecto desde la primera conversación hasta el lanzamiento, explico las decisiones por el camino y mantengo el alcance y el precio claros, por escrito.",
    },
    services: [
      {
        name: "Sitios web y plataformas",
        description: "De una web de una página a una plataforma completa: landing pages, webs de empresa, tiendas online, webs de restaurantes y reservas, marketplaces y sistemas de citas.",
        examples: ["Landing pages", "Webs de empresa", "Tiendas online", "Webs de restaurantes", "Plataformas de reservas", "Marketplaces de coches", "Plataformas médicas y de citas", "Plataformas de IA"],
      },
      {
        name: "Apps",
        description: "Aplicaciones para clientes y personal: pedidos, fidelización, herramientas internas y paneles para tiendas, empresas y restaurantes.",
        examples: ["Tiendas", "Empresas", "Restaurantes", "Otros negocios"],
      },
      {
        name: "Software de escritorio",
        description: "Software instalado en tus ordenadores para el día a día: ventas, inventario, pedidos, facturas y personal, incluso con internet lento.",
        examples: ["Tiendas", "Empresas", "Restaurantes", "Cafeterías", "Otros negocios"],
      },
    ],
    packages: [
      { name: "Landing page", description: "Una página enfocada para presentar tu negocio o una oferta.", features: ["Diseño adaptable a móvil", "Formulario de contacto", "SEO básico", "6 meses de dominio y alojamiento"] },
      { name: "Web de empresa", description: "Una web de varias páginas que puedes actualizar tú mismo.", features: ["Hasta unas 6 páginas", "Panel para editar el contenido", "Contacto y WhatsApp", "6 meses de dominio y alojamiento"] },
      { name: "Tienda online o reservas", description: "Vende productos o acepta reservas online, con un panel para gestionarlo todo.", features: ["Catálogo o calendario de reservas", "Gestión de pedidos", "Avisos a clientes", "6 meses de dominio y alojamiento"] },
      { name: "Plataforma o app a medida", description: "Marketplaces, plataformas multiusuario, apps y software de escritorio.", features: ["Funciones a medida", "Cuentas y roles de usuario", "Panel de administración", "6 meses de dominio y alojamiento"] },
    ],
    offers: [
      {
        whenEarned: "Cuando la empresa que recomendaste firma el acuerdo del proyecto y paga el primer pago.",
        terms: "Una recompensa por cada empresa recomendada. La empresa debe ser un cliente nuevo y aceptar ser contactada. No se admiten autorrecomendaciones. La recompensa se paga tras recibir el primer pago.",
      },
      {
        whenEarned: "Cuando la empresa que recomendaste firma el acuerdo del proyecto y paga el primer pago.",
        terms: "Una recompensa por cada empresa recomendada. La empresa debe ser un cliente nuevo y aceptar ser contactada. No se admiten autorrecomendaciones. La recompensa se paga tras recibir el primer pago.",
      },
    ],
    projects: [
      { summary: "Una tienda online de ropa streetwear: colecciones, fichas de producto, carrito, pago y seguimiento de pedidos.", features: ["Colecciones y fichas de producto", "Lista de deseos y cuentas de cliente", "Pago y seguimiento de pedidos", "Panel de administración"], alts: ["Página de inicio de KING 253", "Página de colección de KING 253", "Página de la historia de la marca KING 253", "Página de inicio de KING 253 en un móvil"] },
      { summary: "Una tienda online de arte mural y decoración: obras y espejos LED con precio según el tamaño, y encargos de diseño personalizado.", features: ["Catálogo con precios según el tamaño", "Encargos de diseño con subida de imagen", "Cuentas de cliente y reseñas", "Panel de gestión"], alts: ["Página de inicio de Boulboul Art Wall", "Catálogo de Boulboul Art Wall", "Formulario de diseño personalizado de Boulboul Art Wall", "Página de inicio de Boulboul Art Wall en un móvil"] },
      { summary: "Una plataforma de venta de coches inspirada en los anuncios clasificados locales, pensada para crecer: fichas detalladas, búsqueda y filtros, cuentas y panel de administración.", features: ["Catálogo de vehículos con búsqueda y filtros", "Especificaciones detalladas de cada coche", "Área de cliente y favoritos", "Panel de administración y API REST"], alts: ["Página de inicio de ZODIC CAR", "Catálogo de vehículos de ZODIC CAR", "Página sobre nosotros de ZODIC CAR", "Página de inicio de ZODIC CAR en un móvil"] },
    ],
  },
  "pt-BR": {
    profile: {
      title: "Engenheiro de software: sites, aplicativos e softwares desktop para empresas, startups e novos projetos.",
      intro:
        "Planejo e desenvolvo software de acordo com o jeito que a sua empresa funciona: sites que trazem clientes, aplicativos que eles usam todo dia e ferramentas desktop em que a sua equipe confia. Cada projeto começa pelas suas necessidades e pelo escopo.",
      bio: "Sou o Zack, engenheiro de software. Crio e desenvolvo sites, lojas virtuais, plataformas, aplicativos e softwares desktop para empresas. Acompanho cada projeto da primeira conversa até o lançamento, explico as decisões no caminho e mantenho escopo e preço claros, por escrito.",
    },
    services: [
      {
        name: "Sites e plataformas",
        description: "De um site de uma página a uma plataforma completa: landing pages, sites institucionais, lojas virtuais, sites de restaurantes e reservas, marketplaces e sistemas de agendamento.",
        examples: ["Landing pages", "Sites institucionais", "Lojas virtuais", "Sites de restaurantes", "Plataformas de reserva", "Marketplaces de carros", "Plataformas médicas e de agendamento", "Plataformas de IA"],
      },
      {
        name: "Aplicativos",
        description: "Aplicativos para clientes e equipe: pedidos, fidelidade, ferramentas internas e painéis para lojas, empresas e restaurantes.",
        examples: ["Lojas", "Empresas", "Restaurantes", "Outros negócios"],
      },
      {
        name: "Software desktop",
        description: "Software instalado nos seus computadores para o dia a dia: vendas, estoque, pedidos, notas e equipe, funcionando mesmo com internet lenta.",
        examples: ["Lojas", "Empresas", "Restaurantes", "Cafés", "Outros negócios"],
      },
    ],
    packages: [
      { name: "Landing page", description: "Uma página focada para apresentar o seu negócio ou uma oferta.", features: ["Design responsivo", "Formulário de contato", "SEO básico", "6 meses de domínio e hospedagem"] },
      { name: "Site institucional", description: "Um site com várias páginas que você mesmo pode atualizar.", features: ["Até cerca de 6 páginas", "Painel para editar o conteúdo", "Contato e WhatsApp", "6 meses de domínio e hospedagem"] },
      { name: "Loja virtual ou reservas", description: "Venda produtos ou receba reservas online, com um painel para gerenciar tudo.", features: ["Catálogo ou agenda de reservas", "Gestão de pedidos", "Avisos para clientes", "6 meses de domínio e hospedagem"] },
      { name: "Plataforma ou app sob medida", description: "Marketplaces, plataformas com vários usuários, aplicativos e softwares desktop.", features: ["Funcionalidades sob medida", "Contas e permissões de usuários", "Painel administrativo", "6 meses de domínio e hospedagem"] },
    ],
    offers: [
      {
        whenEarned: "Quando a empresa indicada assina o contrato do projeto e paga a primeira parcela.",
        terms: "Uma recompensa por empresa indicada. A empresa precisa ser um cliente novo e concordar em ser contatada. Não vale indicar a si mesmo. A recompensa é paga depois do recebimento da primeira parcela.",
      },
      {
        whenEarned: "Quando a empresa indicada assina o contrato do projeto e paga a primeira parcela.",
        terms: "Uma recompensa por empresa indicada. A empresa precisa ser um cliente novo e concordar em ser contatada. Não vale indicar a si mesmo. A recompensa é paga depois do recebimento da primeira parcela.",
      },
    ],
    projects: [
      { summary: "Uma loja virtual de roupas streetwear: coleções, páginas de produto, carrinho, pagamento e rastreio de pedidos.", features: ["Coleções e páginas de produto", "Lista de desejos e contas de cliente", "Pagamento e rastreio de pedidos", "Painel administrativo"], alts: ["Página inicial da KING 253", "Página de coleção da KING 253", "Página da história da marca KING 253", "Página inicial da KING 253 no celular"] },
      { summary: "Uma loja virtual de arte de parede e decoração: obras e espelhos de LED com preço pelo tamanho, além de pedidos de design personalizado.", features: ["Catálogo com preço pelo tamanho", "Pedidos de design com envio de imagem", "Contas de cliente e avaliações", "Painel de gestão"], alts: ["Página inicial da Boulboul Art Wall", "Catálogo da Boulboul Art Wall", "Formulário de design personalizado da Boulboul Art Wall", "Página inicial da Boulboul Art Wall no celular"] },
      { summary: "Uma plataforma de venda de carros inspirada nos classificados locais, feita para crescer: anúncios detalhados, busca e filtros, contas e painel administrativo.", features: ["Catálogo de veículos com busca e filtros", "Especificações detalhadas de cada carro", "Área do cliente e favoritos", "Painel administrativo e API REST"], alts: ["Página inicial da ZODIC CAR", "Catálogo de veículos da ZODIC CAR", "Página sobre da ZODIC CAR", "Página inicial da ZODIC CAR no celular"] },
    ],
  },
  ru: {
    profile: {
      title: "Инженер-программист: сайты, приложения и программы для ПК для бизнеса, стартапов и новых проектов.",
      intro:
        "Я планирую и создаю программы под то, как работает ваш бизнес: сайты, которые приводят клиентов, приложения, которыми пользуются каждый день, и программы для ПК, на которые опирается ваша команда. Каждый проект начинается с ваших задач и его объёма.",
      bio: "Меня зовут Зак, я инженер-программист. Проектирую и разрабатываю сайты, интернет-магазины, платформы, приложения и программы для ПК для бизнеса. Веду проект от первого разговора до запуска, объясняю решения по ходу работы и фиксирую объём и цену письменно.",
    },
    services: [
      {
        name: "Сайты и платформы",
        description: "От одностраничного сайта до полноценной платформы: лендинги, сайты компаний, интернет-магазины, сайты ресторанов и бронирования, маркетплейсы и системы записи.",
        examples: ["Лендинги", "Сайты компаний", "Интернет-магазины", "Сайты ресторанов", "Платформы бронирования", "Автомобильные маркетплейсы", "Медицинские платформы и запись", "ИИ-платформы"],
      },
      {
        name: "Приложения",
        description: "Приложения для клиентов и сотрудников: заказы, программы лояльности, внутренние инструменты и панели для магазинов, компаний и ресторанов.",
        examples: ["Магазины", "Компании", "Рестораны", "Другой бизнес"],
      },
      {
        name: "Программы для ПК",
        description: "Программы на ваших компьютерах для ежедневной работы: продажи, склад, заказы, счета и персонал, даже при медленном интернете.",
        examples: ["Магазины", "Компании", "Рестораны", "Кафе", "Другой бизнес"],
      },
    ],
    packages: [
      { name: "Лендинг", description: "Одна страница, чтобы представить ваш бизнес или одно предложение.", features: ["Адаптивный дизайн", "Форма обратной связи", "Базовая SEO-настройка", "6 месяцев домена и хостинга"] },
      { name: "Сайт компании", description: "Многостраничный сайт, который вы сможете обновлять сами.", features: ["До ~6 страниц", "Админка для редактирования", "Контакты и WhatsApp", "6 месяцев домена и хостинга"] },
      { name: "Интернет-магазин или бронирование", description: "Продавайте товары или принимайте брони онлайн, с панелью для управления.", features: ["Каталог или календарь бронирований", "Управление заказами", "Уведомления клиентам", "6 месяцев домена и хостинга"] },
      { name: "Платформа или приложение на заказ", description: "Маркетплейсы, многопользовательские платформы, приложения и программы для ПК.", features: ["Индивидуальные функции", "Учётные записи и роли", "Панель администратора", "6 месяцев домена и хостинга"] },
    ],
    offers: [
      {
        whenEarned: "Когда рекомендованная вами компания подписывает договор на проект и вносит первый платёж.",
        terms: "Одно вознаграждение за каждую рекомендованную компанию. Компания должна быть новым клиентом и согласиться на контакт. Рекомендовать самого себя нельзя. Вознаграждение выплачивается после получения первого платежа.",
      },
      {
        whenEarned: "Когда рекомендованная вами компания подписывает договор на проект и вносит первый платёж.",
        terms: "Одно вознаграждение за каждую рекомендованную компанию. Компания должна быть новым клиентом и согласиться на контакт. Рекомендовать самого себя нельзя. Вознаграждение выплачивается после получения первого платежа.",
      },
    ],
    projects: [
      { summary: "Интернет-магазин уличной одежды: коллекции, карточки товаров, корзина, оплата и отслеживание заказов.", features: ["Коллекции и карточки товаров", "Избранное и аккаунты покупателей", "Оплата и отслеживание заказов", "Панель администратора"], alts: ["Главная страница KING 253", "Страница коллекции KING 253", "Страница истории бренда KING 253", "Главная страница KING 253 на телефоне"] },
      { summary: "Интернет-магазин настенного искусства и декора: картины и LED-зеркала с ценой по размеру, а также заказы индивидуального дизайна.", features: ["Каталог с ценой по размеру", "Заказ дизайна с загрузкой изображения", "Аккаунты покупателей и отзывы", "Панель управления"], alts: ["Главная страница Boulboul Art Wall", "Каталог Boulboul Art Wall", "Форма индивидуального дизайна Boulboul Art Wall", "Главная страница Boulboul Art Wall на телефоне"] },
      { summary: "Платформа продажи автомобилей по образцу местных досок объявлений, рассчитанная на рост: подробные объявления, поиск и фильтры, аккаунты и админ-панель.", features: ["Каталог авто с поиском и фильтрами", "Подробные характеристики каждой машины", "Личный кабинет и избранное", "Админ-панель и REST API"], alts: ["Главная страница ZODIC CAR", "Каталог автомобилей ZODIC CAR", "Страница о компании ZODIC CAR", "Главная страница ZODIC CAR на телефоне"] },
    ],
  },
  uk: {
    profile: {
      title: "Інженер-програміст: сайти, застосунки та програми для ПК для бізнесу, стартапів і нових проєктів.",
      intro:
        "Я планую та створюю програми під те, як працює ваш бізнес: сайти, що приводять клієнтів, застосунки, якими користуються щодня, і програми для ПК, на які спирається ваша команда. Кожен проєкт починається з ваших потреб і його обсягу.",
      bio: "Мене звати Зак, я інженер-програміст. Проєктую та розробляю сайти, інтернет-магазини, платформи, застосунки й програми для ПК для бізнесу. Веду проєкт від першої розмови до запуску, пояснюю рішення в процесі та фіксую обсяг і ціну письмово.",
    },
    services: [
      {
        name: "Сайти та платформи",
        description: "Від односторінкового сайту до повноцінної платформи: лендинги, сайти компаній, інтернет-магазини, сайти ресторанів і бронювання, маркетплейси та системи запису.",
        examples: ["Лендинги", "Сайти компаній", "Інтернет-магазини", "Сайти ресторанів", "Платформи бронювання", "Автомобільні маркетплейси", "Медичні платформи й запис", "ШІ-платформи"],
      },
      {
        name: "Застосунки",
        description: "Застосунки для клієнтів і працівників: замовлення, програми лояльності, внутрішні інструменти й панелі для магазинів, компаній і ресторанів.",
        examples: ["Магазини", "Компанії", "Ресторани", "Інший бізнес"],
      },
      {
        name: "Програми для ПК",
        description: "Програми на ваших комп'ютерах для щоденної роботи: продажі, склад, замовлення, рахунки й персонал, навіть за повільного інтернету.",
        examples: ["Магазини", "Компанії", "Ресторани", "Кав'ярні", "Інший бізнес"],
      },
    ],
    packages: [
      { name: "Лендинг", description: "Одна сторінка, щоб представити ваш бізнес або одну пропозицію.", features: ["Адаптивний дизайн", "Форма зворотного зв'язку", "Базове SEO-налаштування", "6 місяців домену й хостингу"] },
      { name: "Сайт компанії", description: "Багатосторінковий сайт, який ви зможете оновлювати самі.", features: ["До ~6 сторінок", "Адмінка для редагування", "Контакти й WhatsApp", "6 місяців домену й хостингу"] },
      { name: "Інтернет-магазин або бронювання", description: "Продавайте товари чи приймайте бронювання онлайн, з панеллю для керування.", features: ["Каталог або календар бронювань", "Керування замовленнями", "Сповіщення клієнтам", "6 місяців домену й хостингу"] },
      { name: "Платформа чи застосунок на замовлення", description: "Маркетплейси, багатокористувацькі платформи, застосунки та програми для ПК.", features: ["Індивідуальні функції", "Облікові записи та ролі", "Панель адміністратора", "6 місяців домену й хостингу"] },
    ],
    offers: [
      {
        whenEarned: "Коли рекомендована вами компанія підписує договір на проєкт і сплачує перший внесок.",
        terms: "Одна винагорода за кожну рекомендовану компанію. Компанія має бути новим клієнтом і погодитися на контакт. Рекомендувати самого себе не можна. Винагороду виплачують після отримання першого внеску.",
      },
      {
        whenEarned: "Коли рекомендована вами компанія підписує договір на проєкт і сплачує перший внесок.",
        terms: "Одна винагорода за кожну рекомендовану компанію. Компанія має бути новим клієнтом і погодитися на контакт. Рекомендувати самого себе не можна. Винагороду виплачують після отримання першого внеску.",
      },
    ],
    projects: [
      { summary: "Інтернет-магазин вуличного одягу: колекції, картки товарів, кошик, оплата й відстеження замовлень.", features: ["Колекції та картки товарів", "Обране й акаунти покупців", "Оплата й відстеження замовлень", "Панель адміністратора"], alts: ["Головна сторінка KING 253", "Сторінка колекції KING 253", "Сторінка історії бренду KING 253", "Головна сторінка KING 253 на телефоні"] },
      { summary: "Інтернет-магазин настінного мистецтва й декору: картини та LED-дзеркала з ціною за розміром, а також замовлення індивідуального дизайну.", features: ["Каталог з ціною за розміром", "Замовлення дизайну із завантаженням зображення", "Акаунти покупців і відгуки", "Панель керування"], alts: ["Головна сторінка Boulboul Art Wall", "Каталог Boulboul Art Wall", "Форма індивідуального дизайну Boulboul Art Wall", "Головна сторінка Boulboul Art Wall на телефоні"] },
      { summary: "Платформа продажу автомобілів за зразком місцевих дошок оголошень, розрахована на зростання: детальні оголошення, пошук і фільтри, акаунти та адмінпанель.", features: ["Каталог авто з пошуком і фільтрами", "Детальні характеристики кожного авто", "Особистий кабінет і обране", "Адмінпанель і REST API"], alts: ["Головна сторінка ZODIC CAR", "Каталог автомобілів ZODIC CAR", "Сторінка про компанію ZODIC CAR", "Головна сторінка ZODIC CAR на телефоні"] },
    ],
  },
  nb: {
    profile: {
      title: "Programvareutvikler som lager nettsider, apper og skrivebordsprogrammer for bedrifter, oppstartsselskaper og nye prosjekter.",
      intro:
        "Jeg planlegger og bygger programvare rundt måten bedriften din jobber på: nettsider som gir kunder, apper de bruker hver dag, og skrivebordsverktøy teamet ditt stoler på. Hvert prosjekt starter med dine behov og omfanget.",
      bio: "Jeg er Zack, programvareutvikler. Jeg designer og bygger nettsider, nettbutikker, plattformer, apper og skrivebordsprogrammer for bedrifter. Jeg følger prosjektet fra første samtale til lansering, forklarer valgene underveis og holder omfang og pris tydelig, skriftlig.",
    },
    services: [
      {
        name: "Nettsider og plattformer",
        description: "Fra en enkel side til en full plattform: landingssider, bedriftsnettsider, nettbutikker, restaurant- og bookingsider, markedsplasser og timebestillingssystemer.",
        examples: ["Landingssider", "Bedriftsnettsider", "Nettbutikker", "Restaurantsider", "Bookingplattformer", "Bilmarkedsplasser", "Helse- og timebestillingsplattformer", "AI-plattformer"],
      },
      {
        name: "Apper",
        description: "Apper for kunder og ansatte: bestillinger, lojalitet, interne verktøy og dashbord for butikker, bedrifter og restauranter.",
        examples: ["Butikker", "Bedrifter", "Restauranter", "Andre virksomheter"],
      },
      {
        name: "Skrivebordsprogrammer",
        description: "Programmer installert på datamaskinene dine for den daglige driften: salg, lager, bestillinger, fakturaer og ansatte, også når nettet er tregt.",
        examples: ["Butikker", "Bedrifter", "Restauranter", "Kafeer", "Andre virksomheter"],
      },
    ],
    packages: [
      { name: "Landingsside", description: "Én fokusert side som presenterer bedriften din eller ett tilbud.", features: ["Responsivt design", "Kontaktskjema", "Grunnleggende SEO", "6 måneder domene og hosting"] },
      { name: "Bedriftsnettside", description: "En nettside med flere sider som du kan oppdatere selv.", features: ["Opptil ca. 6 sider", "Admin for å redigere innhold", "Kontakt og WhatsApp", "6 måneder domene og hosting"] },
      { name: "Nettbutikk eller booking", description: "Selg produkter eller ta imot bestillinger på nett, med en admin for å styre alt.", features: ["Katalog eller bookingkalender", "Ordrehåndtering", "Varsler til kunder", "6 måneder domene og hosting"] },
      { name: "Skreddersydd plattform eller app", description: "Markedsplasser, plattformer med mange brukere, apper og skrivebordsprogrammer.", features: ["Skreddersydde funksjoner", "Brukerkontoer og roller", "Admin-dashbord", "6 måneder domene og hosting"] },
    ],
    offers: [
      {
        whenEarned: "Når bedriften du henviste signerer prosjektavtalen og betaler første avdrag.",
        terms: "Én belønning per henvist bedrift. Bedriften må være en ny kunde og godta å bli kontaktet. Du kan ikke henvise deg selv. Belønningen utbetales etter at første avdrag er mottatt.",
      },
      {
        whenEarned: "Når bedriften du henviste signerer prosjektavtalen og betaler første avdrag.",
        terms: "Én belønning per henvist bedrift. Bedriften må være en ny kunde og godta å bli kontaktet. Du kan ikke henvise deg selv. Belønningen utbetales etter at første avdrag er mottatt.",
      },
    ],
    projects: [
      { summary: "En nettbutikk for streetwear: kolleksjoner, produktsider, handlekurv, betaling og ordresporing.", features: ["Kolleksjoner og produktsider", "Ønskeliste og kundekontoer", "Betaling og ordresporing", "Admin-dashbord"], alts: ["Forsiden til KING 253", "Kolleksjonssiden til KING 253", "Merkevarehistorien til KING 253", "Forsiden til KING 253 på mobil"] },
      { summary: "En nettbutikk for veggkunst og dekor: kunstverk og LED-speil priset etter størrelse, pluss bestilling av eget design.", features: ["Katalog med priser etter størrelse", "Bestilling av design med bildeopplasting", "Kundekontoer og omtaler", "Administrasjonspanel"], alts: ["Forsiden til Boulboul Art Wall", "Katalogen til Boulboul Art Wall", "Designskjemaet til Boulboul Art Wall", "Forsiden til Boulboul Art Wall på mobil"] },
      { summary: "En plattform for bilsalg inspirert av lokale annonsesider, bygget for å vokse: detaljerte annonser, søk og filtre, kontoer og adminpanel.", features: ["Bilkatalog med søk og filtre", "Detaljerte spesifikasjoner per bil", "Kundeside og favoritter", "Adminpanel og REST API"], alts: ["Forsiden til ZODIC CAR", "Bilkatalogen til ZODIC CAR", "Om-siden til ZODIC CAR", "Forsiden til ZODIC CAR på mobil"] },
    ],
  },
  nl: {
    profile: {
      title: "Software engineer die websites, apps en desktopsoftware bouwt voor bedrijven, startups en nieuwe projecten.",
      intro:
        "Ik plan en bouw software rond de manier waarop jouw bedrijf werkt: websites die klanten opleveren, apps die ze elke dag gebruiken en desktoptools waar je team op vertrouwt. Elk project begint bij jouw behoeften en de scope.",
      bio: "Ik ben Zack, software engineer. Ik ontwerp en bouw websites, webshops, platforms, apps en desktopsoftware voor bedrijven. Ik begeleid elk project van het eerste gesprek tot de lancering, leg keuzes onderweg uit en houd scope en prijs helder, op papier.",
    },
    services: [
      {
        name: "Websites en platforms",
        description: "Van een website van één pagina tot een compleet platform: landingspagina's, bedrijfswebsites, webshops, restaurant- en reserveringssites, marktplaatsen en afsprakensystemen.",
        examples: ["Landingspagina's", "Bedrijfswebsites", "Webshops", "Restaurantwebsites", "Reserveringsplatforms", "Automarktplaatsen", "Medische en afsprakenplatforms", "AI-platforms"],
      },
      {
        name: "Apps",
        description: "Apps voor klanten en personeel: bestellingen, loyaliteit, interne tools en dashboards voor winkels, bedrijven en restaurants.",
        examples: ["Winkels", "Bedrijven", "Restaurants", "Andere bedrijven"],
      },
      {
        name: "Desktopsoftware",
        description: "Software op je eigen computers voor de dagelijkse gang van zaken: verkoop, voorraad, bestellingen, facturen en personeel, ook als het internet traag is.",
        examples: ["Winkels", "Bedrijven", "Restaurants", "Cafés", "Andere bedrijven"],
      },
    ],
    packages: [
      { name: "Landingspagina", description: "Eén gerichte pagina om je bedrijf of één aanbod te presenteren.", features: ["Responsive ontwerp", "Contactformulier", "Basis-SEO", "6 maanden domein en hosting"] },
      { name: "Bedrijfswebsite", description: "Een website met meerdere pagina's die je zelf kunt bijwerken.", features: ["Tot ongeveer 6 pagina's", "Beheeromgeving voor de inhoud", "Contact en WhatsApp", "6 maanden domein en hosting"] },
      { name: "Webshop of reserveringen", description: "Verkoop producten of neem reserveringen aan, met een beheeromgeving voor alles.", features: ["Catalogus of reserveringskalender", "Orderbeheer", "Meldingen aan klanten", "6 maanden domein en hosting"] },
      { name: "Platform of app op maat", description: "Marktplaatsen, platforms met meerdere gebruikers, apps en desktopsoftware.", features: ["Functies op maat", "Gebruikersaccounts en rollen", "Beheerdashboard", "6 maanden domein en hosting"] },
    ],
    offers: [
      {
        whenEarned: "Wanneer het bedrijf dat je hebt doorverwezen de projectovereenkomst tekent en de eerste termijn betaalt.",
        terms: "Eén beloning per doorverwezen bedrijf. Het bedrijf moet een nieuwe klant zijn en instemmen met contact. Jezelf doorverwijzen telt niet. De beloning wordt uitbetaald nadat de eerste termijn is ontvangen.",
      },
      {
        whenEarned: "Wanneer het bedrijf dat je hebt doorverwezen de projectovereenkomst tekent en de eerste termijn betaalt.",
        terms: "Eén beloning per doorverwezen bedrijf. Het bedrijf moet een nieuwe klant zijn en instemmen met contact. Jezelf doorverwijzen telt niet. De beloning wordt uitbetaald nadat de eerste termijn is ontvangen.",
      },
    ],
    projects: [
      { summary: "Een webshop voor streetwear: collecties, productpagina's, winkelwagen, afrekenen en het volgen van bestellingen.", features: ["Collecties en productpagina's", "Verlanglijst en klantaccounts", "Afrekenen en bestellingen volgen", "Beheerdashboard"], alts: ["Homepagina van KING 253", "Collectiepagina van KING 253", "Merkverhaal-pagina van KING 253", "Homepagina van KING 253 op een telefoon"] },
      { summary: "Een webshop voor wandkunst en decoratie: kunstwerken en ledspiegels met een prijs per formaat, plus aanvragen voor een eigen ontwerp.", features: ["Catalogus met prijzen per formaat", "Ontwerpaanvragen met afbeelding uploaden", "Klantaccounts en reviews", "Beheeromgeving"], alts: ["Homepagina van Boulboul Art Wall", "Catalogus van Boulboul Art Wall", "Ontwerpformulier van Boulboul Art Wall", "Homepagina van Boulboul Art Wall op een telefoon"] },
      { summary: "Een platform voor autoverkoop naar het voorbeeld van lokale advertentiesites, gebouwd om te groeien: uitgebreide advertenties, zoeken en filters, accounts en een beheerpaneel.", features: ["Autocatalogus met zoeken en filters", "Uitgebreide specificaties per auto", "Klantomgeving en favorieten", "Beheerpaneel en REST API"], alts: ["Homepagina van ZODIC CAR", "Autocatalogus van ZODIC CAR", "Over-pagina van ZODIC CAR", "Homepagina van ZODIC CAR op een telefoon"] },
    ],
  },
};
