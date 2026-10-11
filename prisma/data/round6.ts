// Round 6 seed content: skill groups, AI services and draft project architecture.
// Non-English text is machine-drafted (reviewed = false). es-MX / es-CO fall back to "es".
import type { Locale } from "../../src/lib/i18n/locales";

type Tr = Partial<Record<Locale, string>>;

/** The owner's own list (2026-10-11). No usage text or linked projects until the owner writes them. */
export const SKILL_GROUPS: { key: string; name: Tr; skills: string[] }[] = [
  {
    key: "languages",
    skills: ["Python", "Java", "C++", "SQL", "JavaScript", "Dart"],
    name: {
      en: "Programming languages",
      fr: "Langages de programmation",
      ar: "لغات البرمجة",
      it: "Linguaggi di programmazione",
      tr: "Programlama dilleri",
      es: "Lenguajes de programación",
      "pt-BR": "Linguagens de programação",
      ru: "Языки программирования",
      uk: "Мови програмування",
      nb: "Programmeringsspråk",
      nl: "Programmeertalen",
    },
  },
  {
    key: "web",
    skills: ["HTML", "CSS", "React", "Tailwind CSS", "TypeScript", "Next.js"],
    name: {
      en: "Web foundations",
      fr: "Bases du web",
      ar: "أساسيات الويب",
      it: "Fondamenti del web",
      tr: "Web temelleri",
      es: "Bases de la web",
      "pt-BR": "Fundamentos da web",
      ru: "Основы веба",
      uk: "Основи вебу",
      nb: "Grunnleggende web",
      nl: "Webbasis",
    },
  },
  {
    key: "mobile",
    skills: ["Flutter"],
    name: {
      en: "Mobile development",
      fr: "Développement mobile",
      ar: "تطوير تطبيقات الجوال",
      it: "Sviluppo mobile",
      tr: "Mobil geliştirme",
      es: "Desarrollo móvil",
      "pt-BR": "Desenvolvimento mobile",
      ru: "Мобильная разработка",
      uk: "Мобільна розробка",
      nb: "Mobilutvikling",
      nl: "Mobiele ontwikkeling",
    },
  },
  {
    key: "database",
    skills: ["SQLite", "MySQL", "Prisma ORM", "Prisma Migrate"],
    name: {
      en: "Database",
      fr: "Base de données",
      ar: "قاعدة البيانات",
      it: "Database",
      tr: "Veritabanı",
      es: "Base de datos",
      "pt-BR": "Banco de dados",
      ru: "База данных",
      uk: "База даних",
      nb: "Database",
      nl: "Database",
    },
  },
  {
    key: "data",
    skills: ["Python", "Power BI", "SQL", "R"],
    name: {
      en: "Data and reporting",
      fr: "Données et rapports",
      ar: "البيانات والتقارير",
      it: "Dati e reportistica",
      tr: "Veri ve raporlama",
      es: "Datos e informes",
      "pt-BR": "Dados e relatórios",
      ru: "Данные и отчёты",
      uk: "Дані та звіти",
      nb: "Data og rapportering",
      nl: "Data en rapportage",
    },
  },
  {
    key: "db-tools",
    skills: ["Prisma ORM", "Prisma Migrate"],
    name: {
      en: "Database tools",
      fr: "Outils de base de données",
      ar: "أدوات قواعد البيانات",
      it: "Strumenti per database",
      tr: "Veritabanı araçları",
      es: "Herramientas de base de datos",
      "pt-BR": "Ferramentas de banco de dados",
      ru: "Инструменты для баз данных",
      uk: "Інструменти для баз даних",
      nb: "Databaseverktøy",
      nl: "Databasetools",
    },
  },
];

/**
 * The earlier stack, taken from the owner's own projects. The owner asked to keep it next to the new
 * groups. Group names come from the message files (about.skills.<key>) in every language.
 */
export const EARLIER_SKILL_GROUPS: { key: "frontend" | "backend" | "databases" | "tools"; skills: string[] }[] = [
  { key: "frontend", skills: ["Next.js", "React", "TypeScript", "Tailwind CSS"] },
  { key: "backend", skills: ["TypeScript", "Next.js", "REST APIs", "Node.js", "NestJS"] },
  { key: "databases", skills: ["PostgreSQL", "Prisma", "Drizzle ORM"] },
  { key: "tools", skills: ["Git", "Playwright", "Vitest", "Cloudinary"] },
];

type AiSeed = {
  key: string;
  status: "AVAILABLE" | "COMING_SOON";
  /** The owner asked (2026-10-11) for AI agents and automations to be shown as available now. */
  publish: "DRAFT" | "PUBLISHED";
  cta: "CONTACT" | "WAITLIST";
  financial: boolean;
  icon: string;
  title: Tr;
  description: Tr;
};

export const AI_SERVICES: AiSeed[] = [
  {
    key: "ai-agents",
    status: "AVAILABLE",
    publish: "PUBLISHED",
    cta: "CONTACT",
    financial: false,
    icon: "bot",
    title: {
      en: "AI agents",
      fr: "Agents IA",
      ar: "وكلاء الذكاء الاصطناعي",
      it: "Agenti IA",
      tr: "Yapay zekâ ajanları",
      es: "Agentes de IA",
      "pt-BR": "Agentes de IA",
      ru: "ИИ-агенты",
      uk: "ШІ-агенти",
      nb: "KI-agenter",
      nl: "AI-agents",
    },
    description: {
      en: "I build AI agents that take on a defined task for your business, such as answering common questions or sorting incoming requests, and hand over to a person when needed.",
      fr: "Des assistants qui prennent en charge une tâche précise pour votre activité, comme répondre aux questions fréquentes ou trier les demandes entrantes, et passent la main à une personne si besoin.",
      ar: "مساعدون يتولّون مهمة محددة لنشاطك، مثل الرد على الأسئلة الشائعة أو فرز الطلبات الواردة، ويحيلون الأمر إلى شخص عند الحاجة.",
      it: "Assistenti che svolgono un compito preciso per la tua attività, come rispondere alle domande frequenti o smistare le richieste in arrivo, e passano la mano a una persona quando serve.",
      tr: "İşletmeniz için belirli bir görevi üstlenen asistanlar: sık sorulan soruları yanıtlamak ya da gelen talepleri ayırmak gibi. Gerektiğinde bir kişiye devrederler.",
      es: "Asistentes que se encargan de una tarea concreta de su negocio, como responder preguntas frecuentes u ordenar las solicitudes entrantes, y pasan el caso a una persona cuando hace falta.",
      "pt-BR": "Assistentes que assumem uma tarefa definida do seu negócio, como responder perguntas frequentes ou organizar solicitações recebidas, e passam para uma pessoa quando necessário.",
      ru: "Помощники, которые берут на себя конкретную задачу вашего бизнеса, например отвечают на частые вопросы или сортируют входящие заявки, и при необходимости передают дело человеку.",
      uk: "Помічники, які беруть на себе конкретне завдання вашого бізнесу, наприклад відповідають на поширені запитання чи сортують вхідні заявки, і за потреби передають справу людині.",
      nb: "Assistenter som tar seg av en bestemt oppgave for virksomheten din, som å svare på vanlige spørsmål eller sortere innkommende henvendelser, og overlater til et menneske ved behov.",
      nl: "Assistenten die een duidelijke taak voor je bedrijf oppakken, zoals veelgestelde vragen beantwoorden of binnenkomende aanvragen sorteren, en doorgeven aan een mens wanneer dat nodig is.",
    },
  },
  {
    key: "ai-automations",
    status: "AVAILABLE",
    publish: "PUBLISHED",
    cta: "CONTACT",
    financial: false,
    icon: "workflow",
    title: {
      en: "AI automations and workflows",
      fr: "Automatisations IA",
      ar: "الأتمتة بالذكاء الاصطناعي",
      it: "Automazioni IA",
      tr: "Yapay zekâ otomasyonları",
      es: "Automatizaciones con IA",
      "pt-BR": "Automações com IA",
      ru: "ИИ-автоматизация",
      uk: "ШІ-автоматизація",
      nb: "KI-automatisering",
      nl: "AI-automatiseringen",
    },
    description: {
      en: "I build automation workflows that connect the tools you already use and take repetitive steps off your team, such as drafting replies, summarising messages or filling in records.",
      fr: "Des automatisations qui relient les outils que vous utilisez déjà et retirent les tâches répétitives à votre équipe : rédiger des réponses, résumer des messages ou remplir des fiches.",
      ar: "أتمتة تربط الأدوات التي تستخدمها بالفعل وتخفّف عن فريقك الخطوات المتكررة، مثل صياغة الردود أو تلخيص الرسائل أو تعبئة السجلات.",
      it: "Automazioni che collegano gli strumenti che usi già e tolgono al tuo team i passaggi ripetitivi, come preparare risposte, riassumere messaggi o compilare schede.",
      tr: "Zaten kullandığınız araçları birbirine bağlayan ve ekibinizi tekrarlayan adımlardan kurtaran otomasyonlar: yanıt taslağı hazırlamak, mesajları özetlemek ya da kayıtları doldurmak gibi.",
      es: "Automatizaciones que conectan las herramientas que ya usa y quitan a su equipo los pasos repetitivos, como redactar respuestas, resumir mensajes o completar registros.",
      "pt-BR": "Automações que conectam as ferramentas que você já usa e tiram da sua equipe as etapas repetitivas, como redigir respostas, resumir mensagens ou preencher registros.",
      ru: "Автоматизация, которая связывает уже используемые вами инструменты и снимает с команды повторяющиеся шаги: черновики ответов, краткие пересказы сообщений, заполнение записей.",
      uk: "Автоматизація, що поєднує інструменти, якими ви вже користуєтеся, і знімає з команди повторювані кроки: чернетки відповідей, короткі підсумки повідомлень, заповнення записів.",
      nb: "Automatiseringer som kobler sammen verktøyene du allerede bruker og tar repeterende steg bort fra teamet, som å skrive svarutkast, oppsummere meldinger eller fylle ut registre.",
      nl: "Automatiseringen die de tools die je al gebruikt verbinden en je team herhalende stappen uit handen nemen, zoals antwoorden opstellen, berichten samenvatten of gegevens invullen.",
    },
  },
  {
    key: "ai-apps",
    status: "COMING_SOON",
    publish: "PUBLISHED",
    cta: "WAITLIST",
    financial: false,
    icon: "app-window",
    title: {
      en: "AI-powered apps and web applications",
      fr: "Applications et applications web avec IA",
      ar: "تطبيقات وتطبيقات ويب مدعومة بالذكاء الاصطناعي",
      it: "App e applicazioni web con IA",
      tr: "Yapay zekâ destekli uygulamalar ve web uygulamaları",
      es: "Apps y aplicaciones web con IA",
      "pt-BR": "Apps e aplicações web com IA",
      ru: "Приложения и веб-приложения с ИИ",
      uk: "Застосунки та вебзастосунки з ШІ",
      nb: "Apper og nettapplikasjoner med KI",
      nl: "Apps en webapplicaties met AI",
    },
    description: {
      en: "Websites and apps with AI features built into them.",
      fr: "Des sites et des applications avec des fonctions d'IA intégrées.",
      ar: "مواقع وتطبيقات مدمجة بها ميزات الذكاء الاصطناعي.",
      it: "Siti e app con funzioni di IA integrate.",
      tr: "Yapay zekâ özellikleri yerleşik web siteleri ve uygulamalar.",
      es: "Sitios web y apps con funciones de IA integradas.",
      "pt-BR": "Sites e apps com recursos de IA integrados.",
      ru: "Сайты и приложения со встроенными функциями ИИ.",
      uk: "Сайти та застосунки з вбудованими функціями ШІ.",
      nb: "Nettsider og apper med innebygde KI-funksjoner.",
      nl: "Websites en apps met ingebouwde AI-functies.",
    },
  },
  {
    key: "finance-ai",
    status: "COMING_SOON",
    publish: "PUBLISHED",
    cta: "WAITLIST",
    financial: true,
    icon: "chart-pie",
    title: {
      en: "Finance AI",
      fr: "IA pour la finance",
      ar: "الذكاء الاصطناعي للمالية",
      it: "IA per la finanza",
      tr: "Finans için yapay zekâ",
      es: "IA para finanzas",
      "pt-BR": "IA para finanças",
      ru: "ИИ для финансов",
      uk: "ШІ для фінансів",
      nb: "KI for økonomi",
      nl: "AI voor financiën",
    },
    description: {
      en: "Software that helps organise and read financial data.",
      fr: "Des logiciels qui aident à organiser et à lire des données financières.",
      ar: "برامج تساعد على تنظيم البيانات المالية وقراءتها.",
      it: "Software che aiuta a organizzare e leggere i dati finanziari.",
      tr: "Finansal verileri düzenlemeye ve okumaya yardımcı olan yazılımlar.",
      es: "Software que ayuda a ordenar y leer datos financieros.",
      "pt-BR": "Software que ajuda a organizar e ler dados financeiros.",
      ru: "Программы, которые помогают упорядочивать и читать финансовые данные.",
      uk: "Програми, які допомагають упорядковувати й читати фінансові дані.",
      nb: "Programvare som hjelper å ordne og lese økonomiske data.",
      nl: "Software die helpt financiële gegevens te ordenen en te lezen.",
    },
  },
  {
    key: "trading-ai",
    status: "COMING_SOON",
    publish: "PUBLISHED",
    cta: "WAITLIST",
    financial: true,
    icon: "candlestick-chart",
    title: {
      en: "Stock-market and trading bots",
      fr: "Bots de bourse et de trading",
      ar: "روبوتات البورصة والتداول",
      it: "Bot per borsa e trading",
      tr: "Borsa ve alım-satım botları",
      es: "Bots de bolsa y trading",
      "pt-BR": "Bots de bolsa e trading",
      ru: "Боты для биржи и трейдинга",
      uk: "Боти для біржі та трейдингу",
      nb: "Børs- og tradingroboter",
      nl: "Beurs- en tradingbots",
    },
    description: {
      en: "Software tools for market data and trading workflows.",
      fr: "Des outils logiciels pour les données de marché et les processus de trading.",
      ar: "أدوات برمجية لبيانات السوق وسير عمل التداول.",
      it: "Strumenti software per i dati di mercato e i flussi di trading.",
      tr: "Piyasa verileri ve alım-satım iş akışları için yazılım araçları.",
      es: "Herramientas de software para datos de mercado y flujos de trading.",
      "pt-BR": "Ferramentas de software para dados de mercado e fluxos de trading.",
      ru: "Программные инструменты для рыночных данных и торговых процессов.",
      uk: "Програмні інструменти для ринкових даних і торгових процесів.",
      nb: "Programvareverktøy for markedsdata og handelsprosesser.",
      nl: "Softwaretools voor marktgegevens en tradingprocessen.",
    },
  },
];

type ArchText = { frontend: string; backend: string; database: string; flow: string };
type ArchNodeSeed = { kind: "CLIENT" | "FRONTEND" | "API" | "BACKEND" | "DATABASE" | "EXTERNAL"; technology?: string; label?: Tr };

/**
 * Drafted from each project's technology list and features, so every graph is seeded as PROPOSED
 * ("Concept / proposed architecture") until the owner confirms it.
 */
export const ARCHITECTURE: Record<string, { nodes: ArchNodeSeed[]; text: Partial<Record<Locale, ArchText>> }> = {
  "king-253": {
    nodes: [
      { kind: "CLIENT" },
      { kind: "FRONTEND", technology: "Next.js · React · Tailwind CSS" },
      { kind: "BACKEND", technology: "Next.js server" },
      { kind: "DATABASE", technology: "PostgreSQL · Drizzle ORM" },
    ],
    text: {
      en: {
        frontend: "Built with Next.js, React and Tailwind CSS. Shoppers browse collections and product pages, keep a wishlist, manage their account and check out, on a phone or a computer.",
        backend: "The Next.js server renders the pages and runs the shop's logic: accounts, cart, orders and order tracking, plus the admin dashboard.",
        database: "PostgreSQL, used through Drizzle ORM. It stores products and collections, customer accounts, wishlists and orders.",
        flow: "The shopper's browser asks for a page or sends an action, such as checking out. The Next.js server checks it, reads or saves the data in PostgreSQL, and sends back the updated page.",
      },
      fr: {
        frontend: "Développé avec Next.js, React et Tailwind CSS. Les clients parcourent les collections et les fiches produits, gardent une liste d'envies, gèrent leur compte et passent commande, sur téléphone ou ordinateur.",
        backend: "Le serveur Next.js génère les pages et gère la logique de la boutique : comptes, panier, commandes et suivi, ainsi que le tableau de bord d'administration.",
        database: "PostgreSQL, utilisé via Drizzle ORM. On y trouve les produits et collections, les comptes clients, les listes d'envies et les commandes.",
        flow: "Le navigateur du client demande une page ou envoie une action, comme valider une commande. Le serveur Next.js la vérifie, lit ou enregistre les données dans PostgreSQL, puis renvoie la page à jour.",
      },
      ar: {
        frontend: "مبني باستخدام Next.js وReact وTailwind CSS. يتصفح المتسوقون المجموعات وصفحات المنتجات، ويحفظون قائمة الأمنيات، ويديرون حساباتهم ويُتمّون الشراء، على الهاتف أو الحاسوب.",
        backend: "يعرض خادم Next.js الصفحات ويدير منطق المتجر: الحسابات والسلة والطلبات وتتبعها، إضافة إلى لوحة الإدارة.",
        database: "PostgreSQL عبر Drizzle ORM. تُخزَّن فيها المنتجات والمجموعات وحسابات العملاء وقوائم الأمنيات والطلبات.",
        flow: "يطلب متصفح المتسوق صفحة أو يرسل إجراءً مثل إتمام الشراء. يتحقق خادم Next.js منه، ويقرأ البيانات أو يحفظها في PostgreSQL، ثم يعيد الصفحة محدّثة.",
      },
      it: {
        frontend: "Realizzato con Next.js, React e Tailwind CSS. I clienti sfogliano collezioni e schede prodotto, salvano una lista dei desideri, gestiscono l'account e completano l'acquisto, da telefono o computer.",
        backend: "Il server Next.js genera le pagine e gestisce la logica del negozio: account, carrello, ordini e tracciamento, oltre alla dashboard di amministrazione.",
        database: "PostgreSQL, usato tramite Drizzle ORM. Contiene prodotti e collezioni, account dei clienti, liste dei desideri e ordini.",
        flow: "Il browser del cliente chiede una pagina o invia un'azione, come completare l'acquisto. Il server Next.js la verifica, legge o salva i dati in PostgreSQL e restituisce la pagina aggiornata.",
      },
      tr: {
        frontend: "Next.js, React ve Tailwind CSS ile yapıldı. Müşteriler koleksiyonlara ve ürün sayfalarına göz atar, istek listesi tutar, hesaplarını yönetir ve telefondan ya da bilgisayardan alışverişi tamamlar.",
        backend: "Next.js sunucusu sayfaları oluşturur ve mağazanın mantığını yürütür: hesaplar, sepet, siparişler ve sipariş takibi, ayrıca yönetim paneli.",
        database: "Drizzle ORM üzerinden PostgreSQL. Ürünleri ve koleksiyonları, müşteri hesaplarını, istek listelerini ve siparişleri saklar.",
        flow: "Müşterinin tarayıcısı bir sayfa ister ya da ödeme gibi bir işlem gönderir. Next.js sunucusu bunu kontrol eder, PostgreSQL'de veriyi okur veya kaydeder ve güncellenmiş sayfayı geri gönderir.",
      },
      es: {
        frontend: "Hecho con Next.js, React y Tailwind CSS. Los clientes recorren colecciones y fichas de producto, guardan una lista de deseos, gestionan su cuenta y compran, desde el móvil o el ordenador.",
        backend: "El servidor Next.js genera las páginas y lleva la lógica de la tienda: cuentas, carrito, pedidos y seguimiento, además del panel de administración.",
        database: "PostgreSQL, usado a través de Drizzle ORM. Guarda productos y colecciones, cuentas de clientes, listas de deseos y pedidos.",
        flow: "El navegador del cliente pide una página o envía una acción, como finalizar la compra. El servidor Next.js la comprueba, lee o guarda los datos en PostgreSQL y devuelve la página actualizada.",
      },
      "pt-BR": {
        frontend: "Feito com Next.js, React e Tailwind CSS. Os clientes navegam por coleções e páginas de produto, salvam uma lista de desejos, gerenciam a conta e finalizam a compra, no celular ou no computador.",
        backend: "O servidor Next.js gera as páginas e cuida da lógica da loja: contas, carrinho, pedidos e rastreamento, além do painel administrativo.",
        database: "PostgreSQL, usado via Drizzle ORM. Guarda produtos e coleções, contas de clientes, listas de desejos e pedidos.",
        flow: "O navegador do cliente pede uma página ou envia uma ação, como finalizar a compra. O servidor Next.js verifica, lê ou salva os dados no PostgreSQL e devolve a página atualizada.",
      },
      ru: {
        frontend: "Сделан на Next.js, React и Tailwind CSS. Покупатели смотрят коллекции и карточки товаров, ведут список желаний, управляют аккаунтом и оформляют заказ с телефона или компьютера.",
        backend: "Сервер Next.js формирует страницы и ведёт логику магазина: аккаунты, корзину, заказы и их отслеживание, а также панель администратора.",
        database: "PostgreSQL через Drizzle ORM. Здесь хранятся товары и коллекции, аккаунты покупателей, списки желаний и заказы.",
        flow: "Браузер покупателя запрашивает страницу или отправляет действие, например оформление заказа. Сервер Next.js проверяет его, читает или сохраняет данные в PostgreSQL и возвращает обновлённую страницу.",
      },
      uk: {
        frontend: "Створено на Next.js, React і Tailwind CSS. Покупці переглядають колекції та сторінки товарів, ведуть список бажань, керують акаунтом і оформлюють замовлення з телефона чи комп'ютера.",
        backend: "Сервер Next.js формує сторінки й веде логіку магазину: акаунти, кошик, замовлення та їх відстеження, а також панель адміністратора.",
        database: "PostgreSQL через Drizzle ORM. Тут зберігаються товари й колекції, акаунти покупців, списки бажань і замовлення.",
        flow: "Браузер покупця запитує сторінку або надсилає дію, наприклад оформлення замовлення. Сервер Next.js перевіряє її, читає чи зберігає дані в PostgreSQL і повертає оновлену сторінку.",
      },
      nb: {
        frontend: "Laget med Next.js, React og Tailwind CSS. Kundene blar i kolleksjoner og produktsider, har en ønskeliste, styrer kontoen sin og handler, på mobil eller datamaskin.",
        backend: "Next.js-serveren lager sidene og styrer butikkens logikk: kontoer, handlekurv, bestillinger og sporing, pluss administrasjonspanelet.",
        database: "PostgreSQL, brukt via Drizzle ORM. Her lagres produkter og kolleksjoner, kundekontoer, ønskelister og bestillinger.",
        flow: "Kundens nettleser ber om en side eller sender en handling, som å fullføre et kjøp. Next.js-serveren sjekker den, leser eller lagrer data i PostgreSQL og sender tilbake den oppdaterte siden.",
      },
      nl: {
        frontend: "Gebouwd met Next.js, React en Tailwind CSS. Klanten bekijken collecties en productpagina's, houden een verlanglijst bij, beheren hun account en rekenen af, op telefoon of computer.",
        backend: "De Next.js-server maakt de pagina's en regelt de logica van de winkel: accounts, winkelwagen, bestellingen en tracking, plus het beheerdashboard.",
        database: "PostgreSQL, gebruikt via Drizzle ORM. Hierin staan producten en collecties, klantaccounts, verlanglijsten en bestellingen.",
        flow: "De browser van de klant vraagt een pagina op of stuurt een actie, zoals afrekenen. De Next.js-server controleert die, leest of bewaart de gegevens in PostgreSQL en stuurt de bijgewerkte pagina terug.",
      },
    },
  },
  "boulboul-art-wall": {
    nodes: [
      { kind: "CLIENT" },
      { kind: "FRONTEND", technology: "Next.js · React · Tailwind CSS" },
      { kind: "BACKEND", technology: "Next.js server" },
      { kind: "DATABASE", technology: "PostgreSQL · Prisma" },
    ],
    text: {
      en: {
        frontend: "Built with Next.js, React and Tailwind CSS. Visitors browse artworks and LED mirrors, pick a size to see its price, send a custom design request with an image, and leave reviews.",
        backend: "The Next.js server works out size-based prices and handles customer accounts, reviews and design requests. It also runs the admin back-office.",
        database: "PostgreSQL, used through Prisma. It stores the catalogue and its prices per size, customer accounts, reviews and design requests.",
        flow: "The visitor's browser asks for a page or sends a form, such as a design request. The Next.js server checks it, reads or saves the data in PostgreSQL through Prisma, and answers with the updated page.",
      },
      fr: {
        frontend: "Développé avec Next.js, React et Tailwind CSS. Les visiteurs parcourent les œuvres et miroirs LED, choisissent une taille pour voir son prix, envoient une demande de design personnalisé avec une image et laissent des avis.",
        backend: "Le serveur Next.js calcule les prix selon la taille et gère les comptes clients, les avis et les demandes de design. Il fait aussi tourner l'espace d'administration.",
        database: "PostgreSQL, utilisé via Prisma. On y trouve le catalogue et ses prix par taille, les comptes clients, les avis et les demandes de design.",
        flow: "Le navigateur du visiteur demande une page ou envoie un formulaire, comme une demande de design. Le serveur Next.js le vérifie, lit ou enregistre les données dans PostgreSQL via Prisma, puis répond avec la page à jour.",
      },
      ar: {
        frontend: "مبني باستخدام Next.js وReact وTailwind CSS. يتصفح الزوار الأعمال الفنية والمرايا المضيئة، ويختارون مقاسًا لرؤية سعره، ويرسلون طلب تصميم مخصص مع صورة، ويتركون تقييماتهم.",
        backend: "يحسب خادم Next.js الأسعار حسب المقاس ويدير حسابات العملاء والتقييمات وطلبات التصميم، كما يشغّل لوحة الإدارة.",
        database: "PostgreSQL عبر Prisma. تُخزَّن فيها الكتالوج وأسعاره لكل مقاس، وحسابات العملاء، والتقييمات، وطلبات التصميم.",
        flow: "يطلب متصفح الزائر صفحة أو يرسل نموذجًا مثل طلب تصميم. يتحقق خادم Next.js منه، ويقرأ البيانات أو يحفظها في PostgreSQL عبر Prisma، ثم يردّ بالصفحة المحدّثة.",
      },
      it: {
        frontend: "Realizzato con Next.js, React e Tailwind CSS. I visitatori sfogliano opere e specchi LED, scelgono una misura per vederne il prezzo, inviano una richiesta di design personalizzato con un'immagine e lasciano recensioni.",
        backend: "Il server Next.js calcola i prezzi in base alla misura e gestisce account dei clienti, recensioni e richieste di design. Fa funzionare anche il back-office.",
        database: "PostgreSQL, usato tramite Prisma. Contiene il catalogo con i prezzi per misura, gli account dei clienti, le recensioni e le richieste di design.",
        flow: "Il browser del visitatore chiede una pagina o invia un modulo, come una richiesta di design. Il server Next.js lo verifica, legge o salva i dati in PostgreSQL tramite Prisma e risponde con la pagina aggiornata.",
      },
      tr: {
        frontend: "Next.js, React ve Tailwind CSS ile yapıldı. Ziyaretçiler sanat eserlerine ve LED aynalara göz atar, fiyatını görmek için bir ölçü seçer, görselli özel tasarım talebi gönderir ve yorum bırakır.",
        backend: "Next.js sunucusu ölçüye göre fiyatı hesaplar; müşteri hesaplarını, yorumları ve tasarım taleplerini yönetir. Yönetim panelini de çalıştırır.",
        database: "Prisma üzerinden PostgreSQL. Kataloğu ve ölçüye göre fiyatlarını, müşteri hesaplarını, yorumları ve tasarım taleplerini saklar.",
        flow: "Ziyaretçinin tarayıcısı bir sayfa ister ya da tasarım talebi gibi bir form gönderir. Next.js sunucusu bunu kontrol eder, Prisma aracılığıyla PostgreSQL'de veriyi okur veya kaydeder ve güncellenmiş sayfayla yanıt verir.",
      },
      es: {
        frontend: "Hecho con Next.js, React y Tailwind CSS. Los visitantes recorren obras y espejos LED, eligen un tamaño para ver su precio, envían una solicitud de diseño personalizado con una imagen y dejan reseñas.",
        backend: "El servidor Next.js calcula los precios según el tamaño y gestiona cuentas de clientes, reseñas y solicitudes de diseño. También hace funcionar el panel de administración.",
        database: "PostgreSQL, usado a través de Prisma. Guarda el catálogo con sus precios por tamaño, las cuentas de clientes, las reseñas y las solicitudes de diseño.",
        flow: "El navegador del visitante pide una página o envía un formulario, como una solicitud de diseño. El servidor Next.js lo comprueba, lee o guarda los datos en PostgreSQL mediante Prisma y responde con la página actualizada.",
      },
      "pt-BR": {
        frontend: "Feito com Next.js, React e Tailwind CSS. Os visitantes navegam por obras e espelhos de LED, escolhem um tamanho para ver o preço, enviam um pedido de design personalizado com imagem e deixam avaliações.",
        backend: "O servidor Next.js calcula os preços por tamanho e cuida das contas de clientes, avaliações e pedidos de design. Ele também roda o painel administrativo.",
        database: "PostgreSQL, usado via Prisma. Guarda o catálogo com os preços por tamanho, as contas de clientes, as avaliações e os pedidos de design.",
        flow: "O navegador do visitante pede uma página ou envia um formulário, como um pedido de design. O servidor Next.js verifica, lê ou salva os dados no PostgreSQL via Prisma e responde com a página atualizada.",
      },
      ru: {
        frontend: "Сделан на Next.js, React и Tailwind CSS. Посетители смотрят картины и LED-зеркала, выбирают размер, чтобы увидеть цену, отправляют заявку на индивидуальный дизайн с изображением и оставляют отзывы.",
        backend: "Сервер Next.js рассчитывает цену по размеру и обрабатывает аккаунты, отзывы и заявки на дизайн. На нём же работает панель администратора.",
        database: "PostgreSQL через Prisma. Здесь хранятся каталог с ценами по размерам, аккаунты покупателей, отзывы и заявки на дизайн.",
        flow: "Браузер посетителя запрашивает страницу или отправляет форму, например заявку на дизайн. Сервер Next.js проверяет её, читает или сохраняет данные в PostgreSQL через Prisma и отвечает обновлённой страницей.",
      },
      uk: {
        frontend: "Створено на Next.js, React і Tailwind CSS. Відвідувачі переглядають картини та LED-дзеркала, обирають розмір, щоб побачити ціну, надсилають запит на індивідуальний дизайн із зображенням і залишають відгуки.",
        backend: "Сервер Next.js рахує ціну за розміром і обробляє акаунти, відгуки та запити на дизайн. На ньому ж працює панель адміністратора.",
        database: "PostgreSQL через Prisma. Тут зберігаються каталог із цінами за розмірами, акаунти покупців, відгуки та запити на дизайн.",
        flow: "Браузер відвідувача запитує сторінку або надсилає форму, наприклад запит на дизайн. Сервер Next.js перевіряє її, читає чи зберігає дані в PostgreSQL через Prisma і відповідає оновленою сторінкою.",
      },
      nb: {
        frontend: "Laget med Next.js, React og Tailwind CSS. Besøkende blar i kunstverk og LED-speil, velger en størrelse for å se prisen, sender en forespørsel om eget design med bilde og legger igjen anmeldelser.",
        backend: "Next.js-serveren regner ut pris etter størrelse og håndterer kundekontoer, anmeldelser og designforespørsler. Den kjører også administrasjonen.",
        database: "PostgreSQL, brukt via Prisma. Her lagres katalogen med priser per størrelse, kundekontoer, anmeldelser og designforespørsler.",
        flow: "Den besøkendes nettleser ber om en side eller sender et skjema, som en designforespørsel. Next.js-serveren sjekker det, leser eller lagrer data i PostgreSQL via Prisma og svarer med den oppdaterte siden.",
      },
      nl: {
        frontend: "Gebouwd met Next.js, React en Tailwind CSS. Bezoekers bekijken kunstwerken en ledspiegels, kiezen een formaat om de prijs te zien, sturen een aanvraag voor een eigen ontwerp met afbeelding en laten reviews achter.",
        backend: "De Next.js-server berekent prijzen per formaat en verwerkt klantaccounts, reviews en ontwerpaanvragen. Ook de beheeromgeving draait erop.",
        database: "PostgreSQL, gebruikt via Prisma. Hierin staan de catalogus met prijzen per formaat, klantaccounts, reviews en ontwerpaanvragen.",
        flow: "De browser van de bezoeker vraagt een pagina op of stuurt een formulier, zoals een ontwerpaanvraag. De Next.js-server controleert het, leest of bewaart de gegevens in PostgreSQL via Prisma en antwoordt met de bijgewerkte pagina.",
      },
    },
  },
  "zodic-car": {
    nodes: [
      { kind: "CLIENT" },
      { kind: "FRONTEND", technology: "Next.js · React · Tailwind CSS" },
      { kind: "API", technology: "NestJS REST API" },
      { kind: "DATABASE", technology: "PostgreSQL · Prisma" },
    ],
    text: {
      en: {
        frontend: "Built with Next.js, React and Tailwind CSS. Visitors search and filter vehicles, open detailed specifications and save favourites in their dashboard.",
        backend: "A separate NestJS server provides a REST API. The website calls it for listings, search, accounts and favourites, and the admin panel uses it to manage vehicles.",
        database: "PostgreSQL, used through Prisma. It stores vehicles and their specifications, user accounts and favourites.",
        flow: "The browser loads the Next.js website, which asks the NestJS REST API for data. The API checks the request, queries PostgreSQL through Prisma and returns the results to display.",
      },
      fr: {
        frontend: "Développé avec Next.js, React et Tailwind CSS. Les visiteurs recherchent et filtrent les véhicules, consultent les fiches techniques détaillées et enregistrent leurs favoris dans leur espace.",
        backend: "Un serveur NestJS séparé fournit une API REST. Le site l'appelle pour les annonces, la recherche, les comptes et les favoris, et le panneau d'administration s'en sert pour gérer les véhicules.",
        database: "PostgreSQL, utilisé via Prisma. On y trouve les véhicules et leurs caractéristiques, les comptes utilisateurs et les favoris.",
        flow: "Le navigateur charge le site Next.js, qui demande les données à l'API REST NestJS. L'API vérifie la requête, interroge PostgreSQL via Prisma et renvoie les résultats à afficher.",
      },
      ar: {
        frontend: "مبني باستخدام Next.js وReact وTailwind CSS. يبحث الزوار عن السيارات ويصفّونها، ويفتحون المواصفات التفصيلية، ويحفظون المفضلة في لوحتهم.",
        backend: "خادم NestJS منفصل يوفّر واجهة REST API. يستدعيها الموقع للإعلانات والبحث والحسابات والمفضلة، وتستخدمها لوحة الإدارة لإدارة السيارات.",
        database: "PostgreSQL عبر Prisma. تُخزَّن فيها السيارات ومواصفاتها وحسابات المستخدمين والمفضلة.",
        flow: "يحمّل المتصفح موقع Next.js الذي يطلب البيانات من واجهة NestJS REST API. تتحقق الواجهة من الطلب، وتستعلم PostgreSQL عبر Prisma، وتعيد النتائج لعرضها.",
      },
      it: {
        frontend: "Realizzato con Next.js, React e Tailwind CSS. I visitatori cercano e filtrano i veicoli, aprono le schede tecniche dettagliate e salvano i preferiti nella loro area.",
        backend: "Un server NestJS separato fornisce un'API REST. Il sito la chiama per annunci, ricerca, account e preferiti, e il pannello di amministrazione la usa per gestire i veicoli.",
        database: "PostgreSQL, usato tramite Prisma. Contiene i veicoli e le loro specifiche, gli account degli utenti e i preferiti.",
        flow: "Il browser carica il sito Next.js, che chiede i dati all'API REST NestJS. L'API verifica la richiesta, interroga PostgreSQL tramite Prisma e restituisce i risultati da mostrare.",
      },
      tr: {
        frontend: "Next.js, React ve Tailwind CSS ile yapıldı. Ziyaretçiler araçları arar ve filtreler, ayrıntılı teknik özellikleri açar ve favorilerini panellerine kaydeder.",
        backend: "Ayrı bir NestJS sunucusu REST API sağlar. Site ilanlar, arama, hesaplar ve favoriler için onu çağırır; yönetim paneli de araçları yönetmek için kullanır.",
        database: "Prisma üzerinden PostgreSQL. Araçları ve özelliklerini, kullanıcı hesaplarını ve favorileri saklar.",
        flow: "Tarayıcı Next.js sitesini yükler; site verileri NestJS REST API'den ister. API isteği kontrol eder, Prisma ile PostgreSQL'i sorgular ve gösterilecek sonuçları döndürür.",
      },
      es: {
        frontend: "Hecho con Next.js, React y Tailwind CSS. Los visitantes buscan y filtran vehículos, abren las fichas técnicas detalladas y guardan favoritos en su panel.",
        backend: "Un servidor NestJS aparte ofrece una API REST. El sitio la llama para anuncios, búsqueda, cuentas y favoritos, y el panel de administración la usa para gestionar los vehículos.",
        database: "PostgreSQL, usado a través de Prisma. Guarda los vehículos y sus especificaciones, las cuentas de usuario y los favoritos.",
        flow: "El navegador carga el sitio Next.js, que pide los datos a la API REST de NestJS. La API comprueba la solicitud, consulta PostgreSQL mediante Prisma y devuelve los resultados que se muestran.",
      },
      "pt-BR": {
        frontend: "Feito com Next.js, React e Tailwind CSS. Os visitantes buscam e filtram veículos, abrem as fichas técnicas detalhadas e salvam favoritos no painel.",
        backend: "Um servidor NestJS separado oferece uma API REST. O site a chama para anúncios, busca, contas e favoritos, e o painel administrativo a usa para gerenciar os veículos.",
        database: "PostgreSQL, usado via Prisma. Guarda os veículos e suas especificações, as contas de usuário e os favoritos.",
        flow: "O navegador carrega o site Next.js, que pede os dados à API REST em NestJS. A API verifica o pedido, consulta o PostgreSQL via Prisma e devolve os resultados para exibir.",
      },
      ru: {
        frontend: "Сделан на Next.js, React и Tailwind CSS. Посетители ищут и фильтруют автомобили, открывают подробные характеристики и сохраняют избранное в личном кабинете.",
        backend: "Отдельный сервер на NestJS предоставляет REST API. Сайт обращается к нему за объявлениями, поиском, аккаунтами и избранным, а панель администратора управляет через него автомобилями.",
        database: "PostgreSQL через Prisma. Здесь хранятся автомобили и их характеристики, аккаунты пользователей и избранное.",
        flow: "Браузер загружает сайт на Next.js, который запрашивает данные у REST API на NestJS. API проверяет запрос, обращается к PostgreSQL через Prisma и возвращает результаты для показа.",
      },
      uk: {
        frontend: "Створено на Next.js, React і Tailwind CSS. Відвідувачі шукають і фільтрують автомобілі, відкривають детальні характеристики й зберігають обране в особистому кабінеті.",
        backend: "Окремий сервер на NestJS надає REST API. Сайт звертається до нього по оголошення, пошук, акаунти й обране, а панель адміністратора керує через нього автомобілями.",
        database: "PostgreSQL через Prisma. Тут зберігаються автомобілі та їхні характеристики, акаунти користувачів і обране.",
        flow: "Браузер завантажує сайт на Next.js, який запитує дані в REST API на NestJS. API перевіряє запит, звертається до PostgreSQL через Prisma і повертає результати для показу.",
      },
      nb: {
        frontend: "Laget med Next.js, React og Tailwind CSS. Besøkende søker og filtrerer biler, åpner detaljerte spesifikasjoner og lagrer favoritter i dashbordet sitt.",
        backend: "En egen NestJS-server tilbyr et REST-API. Nettsiden kaller det for annonser, søk, kontoer og favoritter, og administrasjonspanelet bruker det til å styre bilene.",
        database: "PostgreSQL, brukt via Prisma. Her lagres biler og spesifikasjoner, brukerkontoer og favoritter.",
        flow: "Nettleseren laster Next.js-nettsiden, som ber NestJS REST-API-et om data. API-et sjekker forespørselen, spør PostgreSQL via Prisma og sender tilbake resultatene som skal vises.",
      },
      nl: {
        frontend: "Gebouwd met Next.js, React en Tailwind CSS. Bezoekers zoeken en filteren voertuigen, openen gedetailleerde specificaties en bewaren favorieten in hun dashboard.",
        backend: "Een aparte NestJS-server levert een REST-API. De website roept die aan voor advertenties, zoeken, accounts en favorieten, en het beheerpaneel gebruikt hem om voertuigen te beheren.",
        database: "PostgreSQL, gebruikt via Prisma. Hierin staan voertuigen en hun specificaties, gebruikersaccounts en favorieten.",
        flow: "De browser laadt de Next.js-website, die gegevens opvraagt bij de NestJS REST-API. De API controleert het verzoek, raadpleegt PostgreSQL via Prisma en stuurt de resultaten terug om te tonen.",
      },
    },
  },
};

/** Icons for the seeded How I Work steps (keys match src/messages about.howIWork.*). */
export const PROCESS_STEPS = [
  { key: "understand", icon: "messages-square" },
  { key: "plan", icon: "clipboard-list" },
  { key: "build", icon: "hammer" },
  { key: "review", icon: "circle-check" },
  { key: "improve", icon: "refresh-cw" },
] as const;

/** Referral texts for fresh databases, split into eligibility / payout / terms. */
export const REFERRAL_TEXT: Partial<Record<Locale, { eligibility: string; payoutConditions: string; terms: string }>> = {
  en: {
    eligibility: "The business or person you refer must be a new client and must agree to be contacted. Self-referrals don't qualify.",
    payoutConditions: "When the client you referred signs the project agreement and pays the first instalment.",
    terms: "One reward per referred client. The reward is paid after the first instalment is received.",
  },
};
