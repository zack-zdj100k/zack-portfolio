/**
 * Roadmaps shown under "How it's built" on a project page: the owner's own diagrams of how each
 * project works (use cases, request sequence, sitemap, order flow), redrawn as animated graphs.
 *
 * Flow diagrams are laid out by hand on a canvas (units ≈ CSS pixels at full size): x / y are a
 * node's top-left corner. Edges are routed as right-angled lines between nodes; `at` moves the
 * bend of an edge (a y for vertical edges, an x for sideways ones) when the middle would cross
 * another node. Text is per language; missing languages fall back (es-MX → es → en).
 */
import { fallbackChain, type Locale } from "@/lib/i18n/locales";

type Lang = "fr" | "ar" | "it" | "tr" | "es" | "pt-BR" | "ru" | "uk" | "nb" | "nl";
/** A plain string is the same in every language (code, product names). */
type Text = string | ({ en: string } & Partial<Record<Lang, string>>);

/** Positional shorthand: en, fr, ar, it, tr, es, pt-BR, ru, uk, nb, nl. */
const L = (en: string, fr: string, ar: string, it: string, tr: string, es: string, pt: string, ru: string, uk: string, nb: string, nl: string): Text => ({
  en, fr, ar, it, tr, es, "pt-BR": pt, ru, uk, nb, nl,
});

export type NodeKind = "actor" | "case" | "page" | "step" | "admin" | "note" | "decision" | "db";
type FlowNodeData = { id: string; label: Text; x: number; y: number; w: number; h?: number; kind?: NodeKind };
type FlowEdgeData = {
  from: string;
  to: string;
  label?: Text;
  dashed?: boolean;
  /** Leave and enter through the sides (actor → use case) instead of top / bottom. */
  side?: boolean;
  /** Go round the whole diagram on this side (a loop back to the start). */
  around?: "left" | "right";
  at?: number;
  /** Where along the side the connector leaves / arrives (0 → 1); spread evenly when left out. */
  fx?: number;
  tx?: number;
};
type FlowData = {
  type: "flow";
  width: number;
  height: number;
  /** Dashed frames behind the boxes (a system boundary, or layers); `start` puts the name at the top-left. */
  groups?: { label: Text; x: number; y: number; w: number; h: number; align?: "start" }[];
  /** Many crossing connectors: draw them faintly so the one being traced stands out. */
  dense?: boolean;
  nodes: FlowNodeData[];
  edges: FlowEdgeData[];
};
type SequenceData = {
  type: "sequence";
  participants: { id: string; label: Text; actor?: boolean }[];
  messages: { from: string; to: string; label: Text; reply?: boolean }[];
};
type RoadmapData = { key: string; title: Text; intro: Text; diagram: FlowData | SequenceData };

// What the components receive: the same shapes, with every text already in the page's language.
type Resolved<T> = T extends string ? T : T extends { en: string } ? string : T extends (infer U)[] ? Resolved<U>[] : T extends object ? { [K in keyof T]: Resolved<T[K]> } : T;
export type FlowDiagram = Resolved<FlowData>;
export type SequenceDiagram = Resolved<SequenceData>;
export type Roadmap = Resolved<RoadmapData>;

const H = 56; // default node height

/* ------------------------------------------------------------------------------------------ */
/* ZODIC CAR                                                                                   */
/* ------------------------------------------------------------------------------------------ */

const zodicUseCases: RoadmapData = {
  key: "use-cases",
  title: L("Who does what", "Qui fait quoi", "من يفعل ماذا", "Chi fa cosa", "Kim ne yapar", "Quién hace qué", "Quem faz o quê", "Кто что делает", "Хто що робить", "Hvem gjør hva", "Wie doet wat"),
  intro: L(
    "Visitors browse, filter and open cars in their language, then send a request. The request is routed to the dealership's team, who also manage the listings.",
    "Les visiteurs parcourent, filtrent et ouvrent les voitures dans leur langue, puis envoient une demande. Elle est transmise à l'équipe du concessionnaire, qui gère aussi les annonces.",
    "يتصفّح الزوار السيارات ويرشّحونها ويفتحونها بلغتهم، ثم يرسلون طلبًا. يُحوَّل الطلب إلى فريق الوكالة الذي يدير الإعلانات أيضًا.",
    "I visitatori sfogliano, filtrano e aprono le auto nella loro lingua, poi inviano una richiesta. La richiesta arriva al team della concessionaria, che gestisce anche gli annunci.",
    "Ziyaretçiler arabalara kendi dillerinde göz atar, filtreler ve açar, ardından talep gönderir. Talep, ilanları da yöneten bayi ekibine iletilir.",
    "Los visitantes exploran, filtran y abren los coches en su idioma y luego envían una solicitud. La solicitud llega al equipo del concesionario, que también gestiona los anuncios.",
    "Os visitantes navegam, filtram e abrem os carros no seu idioma e depois enviam um pedido. O pedido vai para a equipe da concessionária, que também gerencia os anúncios.",
    "Посетители смотрят, фильтруют и открывают машины на своём языке, затем отправляют заявку. Заявка попадает к команде дилера, которая также ведёт объявления.",
    "Відвідувачі переглядають, фільтрують і відкривають авто своєю мовою, а потім надсилають заявку. Заявка потрапляє до команди дилера, яка також веде оголошення.",
    "Besøkende blar, filtrerer og åpner biler på sitt språk og sender så en forespørsel. Den går til forhandlerens team, som også styrer annonsene.",
    "Bezoekers bladeren, filteren en openen auto's in hun eigen taal en sturen dan een aanvraag. Die gaat naar het team van de dealer, dat ook de advertenties beheert.",
  ),
  diagram: {
    type: "flow",
    width: 1100,
    height: 690,
    groups: [{ label: "ZODIC CAR website", x: 330, y: 0, w: 770, h: 690 }],
    nodes: [
      { id: "customer", kind: "actor", x: 0, y: 73, w: 210, h: 90, label: L("Customer / visitor", "Client / visiteur", "عميل / زائر", "Cliente / visitatore", "Müşteri / ziyaretçi", "Cliente / visitante", "Cliente / visitante", "Клиент / посетитель", "Клієнт / відвідувач", "Kunde / besøkende", "Klant / bezoeker") },
      { id: "browse", kind: "case", x: 370, y: 60, w: 270, label: L("Browse the vehicle catalog", "Parcourir le catalogue", "تصفّح كتالوج السيارات", "Sfogliare il catalogo", "Araç kataloğuna göz atmak", "Explorar el catálogo", "Navegar pelo catálogo", "Смотреть каталог", "Переглядати каталог", "Bla i bilkatalogen", "De catalogus bekijken") },
      { id: "search", kind: "case", x: 370, y: 140, w: 270, label: L("Search or filter listings", "Rechercher ou filtrer", "البحث أو التصفية", "Cercare o filtrare", "Aramak veya filtrelemek", "Buscar o filtrar", "Buscar ou filtrar", "Искать и фильтровать", "Шукати й фільтрувати", "Søke eller filtrere", "Zoeken of filteren") },
      { id: "details", kind: "case", x: 370, y: 220, w: 270, label: L("View vehicle details", "Voir la fiche d'une voiture", "عرض تفاصيل السيارة", "Vedere i dettagli dell'auto", "Araç ayrıntılarını görmek", "Ver los detalles del coche", "Ver os detalhes do carro", "Открыть карточку авто", "Відкрити картку авто", "Se detaljer om bilen", "Details van de auto bekijken") },
      { id: "language", kind: "case", x: 370, y: 300, w: 270, h: 70, label: L("Choose the language: French, Arabic or English", "Choisir la langue : français, arabe ou anglais", "اختيار اللغة: الفرنسية أو العربية أو الإنجليزية", "Scegliere la lingua: francese, arabo o inglese", "Dil seçmek: Fransızca, Arapça veya İngilizce", "Elegir el idioma: francés, árabe o inglés", "Escolher o idioma: francês, árabe ou inglês", "Выбрать язык: французский, арабский или английский", "Обрати мову: французька, арабська чи англійська", "Velge språk: fransk, arabisk eller engelsk", "De taal kiezen: Frans, Arabisch of Engels") },
      { id: "submit", kind: "case", x: 370, y: 400, w: 270, h: 70, label: L("Send an inquiry or booking request", "Envoyer une demande ou une réservation", "إرسال استفسار أو طلب حجز", "Inviare una richiesta o prenotazione", "Bilgi veya rezervasyon talebi göndermek", "Enviar una consulta o reserva", "Enviar uma consulta ou reserva", "Отправить запрос или бронь", "Надіслати запит або бронювання", "Sende en forespørsel eller bestilling", "Een vraag of reservering sturen") },
      { id: "receive", kind: "case", x: 830, y: 407, w: 255, label: L("Receive the request for follow-up", "Recevoir la demande pour la suivre", "استلام الطلب لمتابعته", "Ricevere la richiesta da seguire", "Talebi takip için almak", "Recibir la solicitud para seguirla", "Receber o pedido para acompanhar", "Получить заявку в работу", "Отримати заявку в роботу", "Motta forespørselen til oppfølging", "De aanvraag ontvangen voor opvolging") },
      { id: "manage", kind: "case", x: 370, y: 530, w: 270, label: L("Manage vehicle listings", "Gérer les annonces", "إدارة إعلانات السيارات", "Gestire gli annunci", "Araç ilanlarını yönetmek", "Gestionar los anuncios", "Gerenciar os anúncios", "Управлять объявлениями", "Керувати оголошеннями", "Styre bilannonsene", "Advertenties beheren") },
      { id: "review", kind: "case", x: 370, y: 610, w: 270, label: L("Review customer requests", "Traiter les demandes clients", "مراجعة طلبات العملاء", "Esaminare le richieste", "Müşteri taleplerini incelemek", "Revisar las solicitudes", "Revisar os pedidos", "Разбирать заявки клиентов", "Розглядати заявки клієнтів", "Gå gjennom forespørsler", "Aanvragen van klanten bekijken") },
      { id: "staff", kind: "actor", x: 0, y: 545, w: 210, h: 90, label: L("Dealership staff", "Équipe du concessionnaire", "فريق الوكالة", "Staff della concessionaria", "Bayi ekibi", "Equipo del concesionario", "Equipe da concessionária", "Сотрудники дилера", "Працівники дилера", "Forhandlerens ansatte", "Medewerkers van de dealer") },
    ],
    edges: [
      { from: "customer", to: "browse", side: true },
      { from: "customer", to: "search", side: true },
      { from: "customer", to: "details", side: true },
      { from: "customer", to: "language", side: true },
      { from: "customer", to: "submit", side: true },
      {
        from: "submit", to: "receive", side: true, dashed: true,
        label: L("routed for follow-up", "transmise pour suivi", "يُحوَّل للمتابعة", "inoltrata per il seguito", "takip için iletilir", "enviada para seguimiento", "enviado para acompanhamento", "передаётся в работу", "передається в роботу", "sendes til oppfølging", "doorgestuurd voor opvolging"),
      },
      { from: "staff", to: "manage", side: true },
      { from: "staff", to: "review", side: true },
    ],
  },
};

const zodicSequence: RoadmapData = {
  key: "sequence",
  title: L("From catalog to request", "Du catalogue à la demande", "من الكتالوج إلى الطلب", "Dal catalogo alla richiesta", "Katalogdan talebe", "Del catálogo a la solicitud", "Do catálogo ao pedido", "От каталога до заявки", "Від каталогу до заявки", "Fra katalog til forespørsel", "Van catalogus tot aanvraag"),
  intro: L(
    "What happens, message by message, when a customer opens the catalog, picks a car and sends a request.",
    "Ce qui se passe, message par message, quand un client ouvre le catalogue, choisit une voiture et envoie une demande.",
    "ما يحدث، رسالة برسالة، عندما يفتح العميل الكتالوج ويختار سيارة ويرسل طلبًا.",
    "Cosa succede, messaggio per messaggio, quando un cliente apre il catalogo, sceglie un'auto e invia una richiesta.",
    "Bir müşteri kataloğu açıp araba seçtiğinde ve talep gönderdiğinde, mesaj mesaj neler olur.",
    "Lo que pasa, mensaje a mensaje, cuando un cliente abre el catálogo, elige un coche y envía una solicitud.",
    "O que acontece, mensagem por mensagem, quando um cliente abre o catálogo, escolhe um carro e envia um pedido.",
    "Что происходит, шаг за шагом, когда клиент открывает каталог, выбирает машину и отправляет заявку.",
    "Що відбувається, крок за кроком, коли клієнт відкриває каталог, обирає авто й надсилає заявку.",
    "Hva som skjer, melding for melding, når en kunde åpner katalogen, velger en bil og sender en forespørsel.",
    "Wat er gebeurt, bericht voor bericht, als een klant de catalogus opent, een auto kiest en een aanvraag stuurt.",
  ),
  diagram: {
    type: "sequence",
    participants: [
      { id: "customer", actor: true, label: L("Customer", "Client", "العميل", "Cliente", "Müşteri", "Cliente", "Cliente", "Клиент", "Клієнт", "Kunde", "Klant") },
      { id: "web", label: "Next.js website" },
      { id: "api", label: "NestJS API" },
      { id: "db", label: "PostgreSQL · Prisma" },
      { id: "team", label: L("Dealership follow-up", "Suivi concessionnaire", "متابعة الوكالة", "Seguito concessionaria", "Bayi takibi", "Seguimiento del concesionario", "Acompanhamento da concessionária", "Работа дилера", "Робота дилера", "Oppfølging hos forhandler", "Opvolging door de dealer") },
    ],
    messages: [
      { from: "customer", to: "web", label: L("Open the catalog (fr / ar / en)", "Ouvre le catalogue (fr / ar / en)", "يفتح الكتالوج (fr / ar / en)", "Apre il catalogo (fr / ar / en)", "Kataloğu açar (fr / ar / en)", "Abre el catálogo (fr / ar / en)", "Abre o catálogo (fr / ar / en)", "Открывает каталог (fr / ar / en)", "Відкриває каталог (fr / ar / en)", "Åpner katalogen (fr / ar / en)", "Opent de catalogus (fr / ar / en)") },
      { from: "web", to: "api", label: "GET /vehicles?locale=…" },
      { from: "api", to: "db", label: L("Published listings + translations", "Annonces publiées + traductions", "الإعلانات المنشورة + الترجمات", "Annunci pubblicati + traduzioni", "Yayındaki ilanlar + çeviriler", "Anuncios publicados + traducciones", "Anúncios publicados + traduções", "Опубликованные объявления + переводы", "Опубліковані оголошення + переклади", "Publiserte annonser + oversettelser", "Gepubliceerde advertenties + vertalingen") },
      { from: "db", to: "api", reply: true, label: L("Listing results", "Résultats", "النتائج", "Risultati", "Sonuçlar", "Resultados", "Resultados", "Результаты", "Результати", "Treff", "Resultaten") },
      { from: "api", to: "web", reply: true, label: L("Catalog data", "Données du catalogue", "بيانات الكتالوج", "Dati del catalogo", "Katalog verisi", "Datos del catálogo", "Dados do catálogo", "Данные каталога", "Дані каталогу", "Katalogdata", "Catalogusgegevens") },
      { from: "web", to: "customer", reply: true, label: L("Catalog in the chosen language", "Catalogue dans la langue choisie", "الكتالوج باللغة المختارة", "Catalogo nella lingua scelta", "Seçilen dilde katalog", "Catálogo en el idioma elegido", "Catálogo no idioma escolhido", "Каталог на выбранном языке", "Каталог обраною мовою", "Katalogen på valgt språk", "Catalogus in de gekozen taal") },
      { from: "customer", to: "web", label: L("Select a vehicle", "Choisit une voiture", "يختار سيارة", "Sceglie un'auto", "Bir araç seçer", "Elige un coche", "Escolhe um carro", "Выбирает машину", "Обирає авто", "Velger en bil", "Kiest een auto") },
      { from: "web", to: "api", label: "GET /vehicles/{id}?locale=…" },
      { from: "api", to: "db", label: L("Vehicle details + translations", "Fiche + traductions", "تفاصيل السيارة + الترجمات", "Dettagli + traduzioni", "Araç ayrıntıları + çeviriler", "Detalles + traducciones", "Detalhes + traduções", "Карточка авто + переводы", "Картка авто + переклади", "Bildetaljer + oversettelser", "Autodetails + vertalingen") },
      { from: "db", to: "api", reply: true, label: L("Vehicle details", "Fiche de la voiture", "تفاصيل السيارة", "Dettagli dell'auto", "Araç ayrıntıları", "Detalles del coche", "Detalhes do carro", "Карточка авто", "Картка авто", "Bildetaljer", "Autodetails") },
      { from: "api", to: "web", reply: true, label: L("Vehicle details", "Fiche de la voiture", "تفاصيل السيارة", "Dettagli dell'auto", "Araç ayrıntıları", "Detalles del coche", "Detalhes do carro", "Карточка авто", "Картка авто", "Bildetaljer", "Autodetails") },
      { from: "web", to: "customer", reply: true, label: L("Vehicle page", "Page de la voiture", "صفحة السيارة", "Pagina dell'auto", "Araç sayfası", "Página del coche", "Página do carro", "Страница авто", "Сторінка авто", "Bilside", "Autopagina") },
      { from: "customer", to: "web", label: L("Send an inquiry or booking", "Envoie une demande ou réservation", "يرسل استفسارًا أو حجزًا", "Invia richiesta o prenotazione", "Talep veya rezervasyon gönderir", "Envía consulta o reserva", "Envia consulta ou reserva", "Отправляет запрос или бронь", "Надсилає запит або бронь", "Sender forespørsel eller bestilling", "Stuurt vraag of reservering") },
      { from: "web", to: "web", label: L("Check required fields", "Vérifie les champs requis", "يتحقق من الحقول المطلوبة", "Controlla i campi obbligatori", "Zorunlu alanları kontrol eder", "Revisa los campos obligatorios", "Confere os campos obrigatórios", "Проверяет обязательные поля", "Перевіряє обов'язкові поля", "Sjekker påkrevde felt", "Controleert verplichte velden") },
      { from: "web", to: "api", label: "POST /customer-requests" },
      { from: "api", to: "api", label: L("Validate the payload", "Valide les données", "يتحقق من البيانات", "Valida i dati", "Veriyi doğrular", "Valida los datos", "Valida os dados", "Проверяет данные", "Перевіряє дані", "Validerer dataene", "Valideert de gegevens") },
      { from: "api", to: "db", label: L("Save the request, linked to the car", "Enregistre la demande liée à la voiture", "يحفظ الطلب مرتبطًا بالسيارة", "Salva la richiesta collegata all'auto", "Talebi araca bağlı kaydeder", "Guarda la solicitud ligada al coche", "Salva o pedido ligado ao carro", "Сохраняет заявку с привязкой к авто", "Зберігає заявку з прив'язкою до авто", "Lagrer forespørselen koblet til bilen", "Slaat de aanvraag op, gekoppeld aan de auto") },
      { from: "db", to: "api", reply: true, label: L("Request ID", "Identifiant de la demande", "رقم الطلب", "ID della richiesta", "Talep kimliği", "ID de la solicitud", "ID do pedido", "ID заявки", "ID заявки", "Forespørsels-ID", "Aanvraag-ID") },
      { from: "api", to: "web", reply: true, label: L("Accepted + reference", "Acceptée + référence", "مقبول + مرجع", "Accettata + riferimento", "Kabul + referans", "Aceptada + referencia", "Aceito + referência", "Принято + номер", "Прийнято + номер", "Godtatt + referanse", "Geaccepteerd + referentie") },
      { from: "web", to: "customer", reply: true, label: L("“Request received” message", "Message « demande reçue »", "رسالة «تم استلام الطلب»", "Messaggio «richiesta ricevuta»", "“Talep alındı” mesajı", "Mensaje «solicitud recibida»", "Mensagem “pedido recebido”", "Сообщение «заявка получена»", "Повідомлення «заявку отримано»", "Melding «forespørsel mottatt»", "Melding ‘aanvraag ontvangen’") },
      { from: "api", to: "team", reply: true, label: L("Request ready for follow-up", "Demande prête à être suivie", "الطلب جاهز للمتابعة", "Richiesta pronta da seguire", "Talep takibe hazır", "Solicitud lista para seguimiento", "Pedido pronto para acompanhamento", "Заявка готова к работе", "Заявка готова до роботи", "Forespørselen er klar til oppfølging", "Aanvraag klaar voor opvolging") },
    ],
  },
};

/* ------------------------------------------------------------------------------------------ */
/* KING 253                                                                                    */
/* ------------------------------------------------------------------------------------------ */

// Sitemap: four columns, rows 144 apart. The loop back from the confirmation goes round the right.
const C = [40, 326, 612, 898];
const R = [0, 144, 288, 432, 576, 720];
const kingSitemap: RoadmapData = {
  key: "sitemap",
  title: L("Sitemap", "Plan du site", "خريطة الموقع", "Mappa del sito", "Site haritası", "Mapa del sitio", "Mapa do site", "Карта сайта", "Карта сайту", "Nettstedskart", "Sitemap"),
  intro: L(
    "Every page of the shop and where it leads, from the home page to the cash-on-delivery order and back.",
    "Chaque page de la boutique et où elle mène, de l'accueil à la commande en paiement à la livraison, puis retour.",
    "كل صفحات المتجر وإلى أين تقود، من الصفحة الرئيسية إلى طلب الدفع عند الاستلام ثم العودة.",
    "Ogni pagina del negozio e dove porta, dalla home all'ordine con pagamento alla consegna, e ritorno.",
    "Mağazanın her sayfası ve nereye götürdüğü: ana sayfadan kapıda ödemeli siparişe ve geri.",
    "Cada página de la tienda y adónde lleva, desde el inicio hasta el pedido contra reembolso, y de vuelta.",
    "Cada página da loja e para onde leva, do início ao pedido com pagamento na entrega, e de volta.",
    "Все страницы магазина и куда они ведут: от главной до заказа с оплатой при получении и обратно.",
    "Усі сторінки магазину й куди вони ведуть: від головної до замовлення з оплатою при отриманні й назад.",
    "Alle sidene i butikken og hvor de fører, fra forsiden til bestilling med betaling ved levering og tilbake.",
    "Elke pagina van de winkel en waar die heen leidt, van de homepage tot de bestelling met rembours en terug.",
  ),
  diagram: {
    type: "flow",
    width: 1180,
    height: 784,
    nodes: [
      { id: "home", kind: "page", x: 469, y: R[0], w: 240, label: L("Home", "Accueil", "الرئيسية", "Home", "Ana sayfa", "Inicio", "Início", "Главная", "Головна", "Forside", "Home") },
      { id: "who", kind: "page", x: C[0], y: R[1], w: 240, label: L("Who is King", "Qui est King", "من هو King", "Chi è King", "King kimdir", "Quién es King", "Quem é King", "Кто такой King", "Хто такий King", "Hvem er King", "Wie is King") },
      { id: "shop", kind: "page", x: C[1], y: R[1], w: 240, label: L("Clothes / shop", "Vêtements / boutique", "الملابس / المتجر", "Abbigliamento / negozio", "Giyim / mağaza", "Ropa / tienda", "Roupas / loja", "Одежда / магазин", "Одяг / магазин", "Klær / butikk", "Kleding / winkel") },
      { id: "location", kind: "page", x: C[2], y: R[1], w: 240, label: L("Store locations", "Nos boutiques", "مواقع المحلات", "Negozi", "Mağaza konumları", "Tiendas", "Lojas", "Адреса магазинов", "Адреси магазинів", "Butikker", "Winkels") },
      { id: "signin", kind: "page", x: C[3], y: R[1], w: 240, label: L("Sign in", "Connexion", "تسجيل الدخول", "Accedi", "Giriş", "Iniciar sesión", "Entrar", "Вход", "Вхід", "Logg inn", "Inloggen") },
      { id: "product", kind: "page", x: C[1], y: R[2], w: 240, label: L("Product details", "Fiche produit", "تفاصيل المنتج", "Dettaglio prodotto", "Ürün ayrıntıları", "Detalle del producto", "Detalhes do produto", "Карточка товара", "Картка товару", "Produktside", "Productdetails") },
      { id: "wishlist", kind: "page", x: C[0], y: R[3], w: 240, label: L("Wishlist", "Favoris", "قائمة الأمنيات", "Lista dei desideri", "İstek listesi", "Lista de deseos", "Lista de desejos", "Избранное", "Обране", "Ønskeliste", "Verlanglijst") },
      { id: "cart", kind: "page", x: C[2], y: R[3], w: 240, label: L("Shopping cart", "Panier", "سلة التسوق", "Carrello", "Sepet", "Carrito", "Carrinho", "Корзина", "Кошик", "Handlekurv", "Winkelwagen") },
      { id: "admin", kind: "admin", x: C[3], y: R[3], w: 240, label: L("Admin dashboard", "Tableau de bord admin", "لوحة الإدارة", "Dashboard admin", "Yönetim paneli", "Panel de administración", "Painel admin", "Админ-панель", "Адмін-панель", "Adminpanel", "Beheerdashboard") },
      { id: "cod", kind: "page", x: C[2], y: R[4], w: 240, label: L("Cash-on-delivery form", "Formulaire paiement à la livraison", "نموذج الدفع عند الاستلام", "Modulo contrassegno", "Kapıda ödeme formu", "Formulario contra reembolso", "Formulário de pagamento na entrega", "Форма оплаты при получении", "Форма оплати при отриманні", "Skjema for betaling ved levering", "Rembours-formulier") },
      { id: "confirm", kind: "page", x: C[2], y: R[5], w: 240, label: L("Order confirmation", "Confirmation de commande", "تأكيد الطلب", "Conferma d'ordine", "Sipariş onayı", "Confirmación del pedido", "Confirmação do pedido", "Подтверждение заказа", "Підтвердження замовлення", "Ordrebekreftelse", "Orderbevestiging") },
    ],
    edges: [
      { from: "home", to: "who", at: 92 },
      { from: "home", to: "shop", at: 106 },
      { from: "home", to: "location", at: 106 },
      { from: "home", to: "signin", at: 92 },
      { from: "shop", to: "product" },
      { from: "product", to: "shop" },
      { from: "signin", to: "wishlist", at: 230 },
      { from: "signin", to: "cart", at: 248 },
      { from: "signin", to: "admin", tx: 2 / 3 },
      { from: "product", to: "wishlist", at: 380 },
      { from: "product", to: "cart", at: 380 },
      { from: "cart", to: "cod" },
      { from: "cod", to: "confirm" },
      { from: "confirm", to: "home", around: "right" },
    ],
  },
};

// Cash-on-delivery order flow: the customer's steps on the left, what follows the order on the right.
const kingOrderFlow: RoadmapData = {
  key: "cod-order",
  title: L("Cash-on-delivery order", "Commande en paiement à la livraison", "طلب الدفع عند الاستلام", "Ordine in contrassegno", "Kapıda ödemeli sipariş", "Pedido contra reembolso", "Pedido com pagamento na entrega", "Заказ с оплатой при получении", "Замовлення з оплатою при отриманні", "Bestilling med betaling ved levering", "Bestelling met rembours"),
  intro: L(
    "From choosing a product to the parcel leaving with the delivery service, including what happens when the form is incomplete.",
    "Du choix d'un produit jusqu'au départ du colis avec le livreur, y compris quand le formulaire est incomplet.",
    "من اختيار المنتج حتى خروج الطرد مع خدمة التوصيل، بما في ذلك ما يحدث عندما يكون النموذج ناقصًا.",
    "Dalla scelta di un prodotto alla partenza del pacco con il corriere, compreso cosa succede se il modulo è incompleto.",
    "Ürün seçiminden kolinin kargoyla çıkışına kadar; form eksik olduğunda olanlar dahil.",
    "Desde elegir un producto hasta que el paquete sale con la mensajería, incluido qué pasa si el formulario está incompleto.",
    "Da escolha do produto até o pacote sair com a transportadora, incluindo o que acontece quando o formulário está incompleto.",
    "От выбора товара до передачи посылки в доставку, включая случай, когда форма заполнена не полностью.",
    "Від вибору товару до передачі посилки в доставку, включно з випадком, коли форму заповнено не повністю.",
    "Fra valg av produkt til pakken går med budet, også hva som skjer når skjemaet er ufullstendig.",
    "Van het kiezen van een product tot het pakket met de bezorger meegaat, ook wat er gebeurt als het formulier onvolledig is.",
  ),
  diagram: {
    type: "flow",
    width: 760,
    height: 1044,
    nodes: [
      { id: "select", kind: "step", x: 0, y: 0, w: 320, label: L("Customer selects a product", "Le client choisit un produit", "يختار العميل منتجًا", "Il cliente sceglie un prodotto", "Müşteri ürün seçer", "El cliente elige un producto", "O cliente escolhe um produto", "Клиент выбирает товар", "Клієнт обирає товар", "Kunden velger et produkt", "De klant kiest een product") },
      { id: "options", kind: "step", x: 0, y: 120, w: 320, label: L("Size, colour and quantity", "Taille, couleur et quantité", "المقاس واللون والكمية", "Taglia, colore e quantità", "Beden, renk ve adet", "Talla, color y cantidad", "Tamanho, cor e quantidade", "Размер, цвет и количество", "Розмір, колір і кількість", "Størrelse, farge og antall", "Maat, kleur en aantal") },
      { id: "add", kind: "step", x: 0, y: 240, w: 320, label: L("Add to cart or buy now", "Ajouter au panier ou acheter", "أضف إلى السلة أو اشترِ الآن", "Aggiungi al carrello o compra ora", "Sepete ekle veya hemen al", "Añadir al carrito o comprar ya", "Adicionar ao carrinho ou comprar já", "В корзину или купить сейчас", "У кошик або купити зараз", "Legg i handlekurv eller kjøp nå", "In winkelwagen of nu kopen") },
      { id: "form", kind: "step", x: 0, y: 400, w: 320, label: L("Fill in the delivery form", "Remplir le formulaire de livraison", "ملء نموذج التوصيل", "Compilare il modulo di consegna", "Teslimat formunu doldurmak", "Rellenar el formulario de entrega", "Preencher o formulário de entrega", "Заполнить форму доставки", "Заповнити форму доставки", "Fylle ut leveringsskjemaet", "Het bezorgformulier invullen") },
      { id: "validate", kind: "step", x: 420, y: 120, w: 340, h: 70, label: L("Check the customer's details", "Vérifier les informations du client", "التحقق من بيانات العميل", "Verificare i dati del cliente", "Müşteri bilgilerini kontrol etmek", "Comprobar los datos del cliente", "Conferir os dados do cliente", "Проверить данные клиента", "Перевірити дані клієнта", "Sjekke kundens opplysninger", "De gegevens van de klant controleren") },
      { id: "save", kind: "step", x: 420, y: 400, w: 340, label: L("Save the order in the database", "Enregistrer la commande", "حفظ الطلب في قاعدة البيانات", "Salvare l'ordine nel database", "Siparişi veritabanına kaydetmek", "Guardar el pedido en la base de datos", "Salvar o pedido no banco de dados", "Сохранить заказ в базе", "Зберегти замовлення в базі", "Lagre ordren i databasen", "De bestelling opslaan in de database") },
      { id: "notify", kind: "step", x: 420, y: 520, w: 340, label: L("Email the shop about the order", "Prévenir la boutique par e-mail", "إشعار المتجر بالبريد الإلكتروني", "Avvisare il negozio via email", "Mağazaya e-postayla bildirmek", "Avisar a la tienda por email", "Avisar a loja por e-mail", "Уведомить магазин по почте", "Повідомити магазин поштою", "Varsle butikken på e-post", "De winkel mailen over de bestelling") },
      { id: "review", kind: "admin", x: 420, y: 640, w: 340, label: L("The admin reviews the order", "L'admin vérifie la commande", "يراجع المسؤول الطلب", "L'admin controlla l'ordine", "Yönetici siparişi inceler", "El admin revisa el pedido", "O admin revisa o pedido", "Админ проверяет заказ", "Адмін перевіряє замовлення", "Admin går gjennom ordren", "De beheerder bekijkt de bestelling") },
      { id: "confirm", kind: "admin", x: 420, y: 760, w: 340, label: L("Confirm the order", "Confirmer la commande", "تأكيد الطلب", "Confermare l'ordine", "Siparişi onaylamak", "Confirmar el pedido", "Confirmar o pedido", "Подтвердить заказ", "Підтвердити замовлення", "Bekrefte ordren", "De bestelling bevestigen") },
      { id: "email", kind: "step", x: 420, y: 880, w: 340, label: L("Send the confirmation email", "Envoyer l'e-mail de confirmation", "إرسال بريد التأكيد", "Inviare l'email di conferma", "Onay e-postasını göndermek", "Enviar el email de confirmación", "Enviar o e-mail de confirmação", "Отправить письмо-подтверждение", "Надіслати лист-підтвердження", "Sende bekreftelse på e-post", "De bevestigingsmail sturen") },
      { id: "ship", kind: "step", x: 420, y: 988, w: 340, label: L("Hand the order to the delivery service", "Confier la commande au livreur", "تسليم الطلب لخدمة التوصيل", "Affidare l'ordine al corriere", "Siparişi kargoya teslim etmek", "Entregar el pedido a la mensajería", "Entregar o pedido à transportadora", "Передать заказ в доставку", "Передати замовлення в доставку", "Gi ordren til budet", "De bestelling aan de bezorger geven") },
    ],
    edges: [
      { from: "select", to: "options" },
      { from: "options", to: "add" },
      { from: "add", to: "form", fx: 0.5, tx: 0.5 },
      { from: "form", to: "validate", at: 362, fx: 0.82, tx: 0.4 },
      { from: "validate", to: "form", at: 322, fx: 0.2, tx: 0.66, label: L("Incomplete", "Incomplet", "ناقص", "Incompleto", "Eksik", "Incompleto", "Incompleto", "Не заполнено", "Не заповнено", "Ufullstendig", "Onvolledig") },
      { from: "validate", to: "save", fx: 0.75, tx: 0.75, label: L("Valid", "Valide", "صحيح", "Valido", "Geçerli", "Válido", "Válido", "Верно", "Вірно", "Gyldig", "Geldig") },
      { from: "save", to: "notify" },
      { from: "notify", to: "review" },
      { from: "review", to: "confirm" },
      { from: "confirm", to: "email" },
      { from: "email", to: "ship" },
    ],
  },
};

// Boulboul layers: the four screens, the eight services behind them in one row, the data underneath.
// Orders sits between Pricing and Email (the two it calls); each connector has its own lane.
const BX = { custom: 20, cms: 176, products: 332, pricing: 488, orders: 684, email: 880, returns: 1036, auth: 1192 };
const boulboulLayers: RoadmapData = {
  key: "layers",
  title: L("Three layers", "Trois couches", "ثلاث طبقات", "Tre livelli", "Üç katman", "Tres capas", "Três camadas", "Три слоя", "Три шари", "Tre lag", "Drie lagen"),
  intro: L(
    "The screens visitors and the admin use, the small services behind them, and where everything is stored. Each line is one part calling another.",
    "Les écrans des visiteurs et de l'admin, les petits services derrière eux, et l'endroit où tout est stocké. Chaque ligne est un appel d'une partie à une autre.",
    "الشاشات التي يستخدمها الزوار والمسؤول، والخدمات الصغيرة خلفها، ومكان تخزين كل شيء. كل خط هو جزء يستدعي جزءًا آخر.",
    "Le schermate di visitatori e admin, i piccoli servizi dietro di esse e dove viene salvato tutto. Ogni linea è una parte che ne chiama un'altra.",
    "Ziyaretçilerin ve yöneticinin kullandığı ekranlar, arkalarındaki küçük servisler ve her şeyin saklandığı yer. Her çizgi bir parçanın diğerini çağırmasıdır.",
    "Las pantallas de visitantes y admin, los pequeños servicios detrás y dónde se guarda todo. Cada línea es una parte que llama a otra.",
    "As telas de visitantes e admin, os pequenos serviços por trás delas e onde tudo é guardado. Cada linha é uma parte chamando outra.",
    "Экраны посетителей и админа, небольшие сервисы за ними и место, где всё хранится. Каждая линия — вызов одной части другой.",
    "Екрани відвідувачів і адміна, невеликі сервіси за ними та місце, де все зберігається. Кожна лінія — виклик однієї частини іншою.",
    "Skjermene besøkende og admin bruker, de små tjenestene bak dem, og hvor alt lagres. Hver linje er én del som kaller en annen.",
    "De schermen voor bezoekers en beheerder, de kleine services erachter en waar alles wordt opgeslagen. Elke lijn is een deel dat een ander aanroept.",
  ),
  diagram: {
    type: "flow",
    width: 1352,
    height: 488,
    dense: true,
    groups: [
      { align: "start", x: 0, y: 0, w: 1352, h: 116, label: L("Presentation · Next.js, React, Tailwind", "Présentation · Next.js, React, Tailwind", "العرض · Next.js, React, Tailwind", "Presentazione · Next.js, React, Tailwind", "Sunum · Next.js, React, Tailwind", "Presentación · Next.js, React, Tailwind", "Apresentação · Next.js, React, Tailwind", "Интерфейс · Next.js, React, Tailwind", "Інтерфейс · Next.js, React, Tailwind", "Presentasjon · Next.js, React, Tailwind", "Presentatie · Next.js, React, Tailwind") },
      { align: "start", x: 0, y: 208, w: 1352, h: 120, label: L("Backend · Next.js route handlers", "Backend · route handlers Next.js", "الخادم · Next.js route handlers", "Backend · route handler Next.js", "Sunucu · Next.js route handlers", "Backend · route handlers de Next.js", "Backend · route handlers do Next.js", "Сервер · Next.js route handlers", "Сервер · Next.js route handlers", "Backend · Next.js route handlers", "Backend · Next.js route handlers") },
      { align: "start", x: 0, y: 376, w: 1352, h: 112, label: L("Data", "Données", "البيانات", "Dati", "Veri", "Datos", "Dados", "Данные", "Дані", "Data", "Data") },
    ],
    nodes: [
      { id: "store", kind: "page", x: 43, y: 44, w: 250, label: L("Public storefront", "Boutique publique", "واجهة المتجر", "Vetrina pubblica", "Mağaza vitrini", "Tienda pública", "Loja pública", "Витрина магазина", "Вітрина магазину", "Nettbutikk", "Openbare winkel") },
      { id: "product", kind: "page", x: 355, y: 44, w: 250, label: L("Product page + pricing", "Fiche produit + prix", "صفحة المنتج + السعر", "Scheda prodotto + prezzo", "Ürün sayfası + fiyat", "Ficha de producto + precio", "Página do produto + preço", "Карточка товара + цена", "Картка товару + ціна", "Produktside + pris", "Productpagina + prijs") },
      { id: "account", kind: "page", x: 735, y: 44, w: 250, label: L("Customer account", "Compte client", "حساب العميل", "Account cliente", "Müşteri hesabı", "Cuenta de cliente", "Conta do cliente", "Личный кабинет", "Особистий кабінет", "Kundekonto", "Klantaccount") },
      { id: "admin", kind: "admin", x: 1059, y: 44, w: 250, label: L("Admin dashboard", "Tableau de bord admin", "لوحة الإدارة", "Dashboard admin", "Yönetim paneli", "Panel de administración", "Painel admin", "Админ-панель", "Адмін-панель", "Adminpanel", "Beheerdashboard") },
      { id: "custom", kind: "step", x: BX.custom, y: 248, w: 140, h: 64, label: L("Custom design", "Sur mesure", "التصميم حسب الطلب", "Design su misura", "Özel tasarım", "Diseño a medida", "Design sob medida", "Свой дизайн", "Свій дизайн", "Spesialdesign", "Ontwerp op maat") },
      { id: "cms", kind: "step", x: BX.cms, y: 248, w: 140, h: 64, label: L("CMS & media", "CMS et médias", "المحتوى والوسائط", "CMS e media", "CMS ve medya", "CMS y medios", "CMS e mídia", "CMS и медиа", "CMS і медіа", "CMS og medier", "CMS en media") },
      { id: "products", kind: "step", x: BX.products, y: 248, w: 140, h: 64, label: L("Products & categories", "Produits et catégories", "المنتجات والأصناف", "Prodotti e categorie", "Ürün ve kategoriler", "Productos y categorías", "Produtos e categorias", "Товары и категории", "Товари й категорії", "Produkter og kategorier", "Producten en categorieën") },
      { id: "pricing", kind: "step", x: BX.pricing, y: 248, w: 140, h: 64, label: L("Pricing", "Tarification", "التسعير", "Prezzi", "Fiyatlandırma", "Precios", "Preços", "Цены", "Ціни", "Prising", "Prijzen") },
      { id: "orders", kind: "step", x: BX.orders, y: 248, w: 140, h: 64, label: L("Orders", "Commandes", "الطلبات", "Ordini", "Siparişler", "Pedidos", "Pedidos", "Заказы", "Замовлення", "Ordrer", "Bestellingen") },
      { id: "email", kind: "step", x: BX.email, y: 248, w: 140, h: 64, label: L("Email", "E-mails", "البريد", "Email", "E-posta", "Email", "E-mail", "Почта", "Пошта", "E-post", "E-mail") },
      { id: "returns", kind: "step", x: BX.returns, y: 248, w: 140, h: 64, label: L("Returns & exchanges", "Retours et échanges", "الإرجاع والاستبدال", "Resi e cambi", "İade ve değişim", "Devoluciones y cambios", "Devoluções e trocas", "Возвраты и обмены", "Повернення й обмін", "Retur og bytte", "Retour en ruil") },
      { id: "auth", kind: "step", x: BX.auth, y: 248, w: 140, h: 64, label: L("Sign-in & roles", "Connexion et rôles", "الدخول والصلاحيات", "Accesso e ruoli", "Giriş ve roller", "Acceso y roles", "Login e permissões", "Вход и роли", "Вхід і ролі", "Innlogging og roller", "Inloggen en rollen") },
      { id: "images", kind: "db", x: 43, y: 416, w: 250, label: L("Image & design storage", "Stockage images et designs", "تخزين الصور والتصاميم", "Archivio immagini e design", "Görsel ve tasarım deposu", "Imágenes y diseños", "Imagens e designs", "Хранилище изображений", "Сховище зображень", "Bilde- og designlager", "Beelden en ontwerpen") },
      { id: "prisma", kind: "step", x: 574, y: 416, w: 360, label: "Prisma ORM" },
      { id: "db", kind: "db", x: 1059, y: 416, w: 250, label: "PostgreSQL" },
    ],
    edges: [
      { from: "store", to: "custom", at: 160 },
      { from: "store", to: "cms", at: 160 },
      { from: "store", to: "products", at: 140 },
      { from: "product", to: "products", fx: 0.188 },
      { from: "product", to: "pricing", at: 168 },
      { from: "product", to: "orders", at: 152 },
      { from: "account", to: "orders", at: 192 },
      { from: "account", to: "returns", at: 176 },
      { from: "account", to: "auth", at: 160 },
      { from: "admin", to: "cms", at: 124 },
      { from: "admin", to: "products", at: 136 },
      { from: "admin", to: "orders", at: 148 },
      { from: "admin", to: "auth", at: 192 },
      { from: "orders", to: "pricing" },
      { from: "orders", to: "email" },
      { from: "custom", to: "images" },
      { from: "cms", to: "images" },
      { from: "products", to: "prisma", at: 352 },
      { from: "pricing", to: "prisma", at: 336 },
      { from: "orders", to: "prisma" },
      { from: "returns", to: "prisma", at: 336 },
      { from: "auth", to: "prisma", at: 352 },
      { from: "email", to: "db", at: 324 },
      { from: "prisma", to: "db" },
    ],
  },
};

// Boulboul sitemap: five sections under the home page. The order path turns at the price check
// and runs along the bottom, so the graph stays wide rather than tall.
const BC = [0, 254, 508, 762, 1016];
const BR = [0, 116, 212, 324, 420, 540, 636];
const boulboulSitemap: RoadmapData = {
  key: "sitemap",
  title: L("Sitemap and ordering", "Plan du site et commande", "خريطة الموقع والطلب", "Mappa del sito e ordine", "Site haritası ve sipariş", "Mapa del sitio y pedido", "Mapa do site e pedido", "Карта сайта и заказ", "Карта сайту й замовлення", "Nettstedskart og bestilling", "Sitemap en bestellen"),
  intro: L(
    "Every page of the shop, and what happens once a size is chosen: a priced size goes straight to checkout, any other size becomes a made-to-measure request.",
    "Chaque page de la boutique, et ce qui se passe une fois la taille choisie : une taille avec prix va directement à la commande, toute autre devient une demande sur mesure.",
    "كل صفحات المتجر، وما يحدث بعد اختيار المقاس: المقاس المسعّر يذهب مباشرة إلى الطلب، وأي مقاس آخر يصبح طلبًا حسب المقاس.",
    "Ogni pagina del negozio e cosa succede dopo la scelta della misura: una misura con prezzo va dritta all'ordine, ogni altra diventa una richiesta su misura.",
    "Mağazanın her sayfası ve ölçü seçildikten sonra olanlar: fiyatı olan ölçü doğrudan siparişe gider, diğerleri özel ölçü talebine dönüşür.",
    "Cada página de la tienda y qué pasa al elegir una medida: una medida con precio va directa al pedido, cualquier otra se convierte en una solicitud a medida.",
    "Cada página da loja e o que acontece depois de escolher a medida: uma medida com preço vai direto ao pedido, qualquer outra vira um pedido sob medida.",
    "Все страницы магазина и что происходит после выбора размера: размер с ценой сразу ведёт к заказу, любой другой становится заявкой на заказ.",
    "Усі сторінки магазину й що відбувається після вибору розміру: розмір із ціною веде одразу до замовлення, будь-який інший стає заявкою.",
    "Alle sidene i butikken, og hva som skjer når en størrelse er valgt: en størrelse med pris går rett til bestilling, alle andre blir en forespørsel på mål.",
    "Elke pagina van de winkel en wat er gebeurt na het kiezen van een maat: een maat met prijs gaat direct naar bestellen, elke andere wordt een aanvraag op maat.",
  ),
  diagram: {
    type: "flow",
    width: 1206,
    height: 692,
    nodes: [
      { id: "home", kind: "page", x: BC[2], y: BR[0], w: 190, label: L("Home", "Accueil", "الرئيسية", "Home", "Ana sayfa", "Inicio", "Início", "Главная", "Головна", "Forside", "Home") },
      { id: "catalog", kind: "page", x: BC[0], y: BR[1], w: 190, label: L("Wall art catalog", "Catalogue wall art", "كتالوج اللوحات", "Catalogo wall art", "Duvar sanatı kataloğu", "Catálogo wall art", "Catálogo wall art", "Каталог панно", "Каталог панно", "Veggkunstkatalog", "Wall-art-catalogus") },
      { id: "custom", kind: "page", x: BC[1], y: BR[1], w: 190, label: L("Made to measure", "Sur mesure", "حسب الطلب", "Su misura", "Ölçüye özel", "A medida", "Sob medida", "На заказ", "На замовлення", "Skreddersydd", "Op maat") },
      { id: "about", kind: "page", x: BC[2], y: BR[1], w: 190, label: L("About us", "Qui sommes-nous ?", "من نحن", "Chi siamo", "Hakkımızda", "Quiénes somos", "Quem somos", "О нас", "Про нас", "Om oss", "Over ons") },
      { id: "why", kind: "page", x: BC[3], y: BR[1], w: 190, label: L("Why Boulboul", "Pourquoi Boulboul ?", "لماذا Boulboul", "Perché Boulboul", "Neden Boulboul", "Por qué Boulboul", "Por que Boulboul", "Почему Boulboul", "Чому Boulboul", "Hvorfor Boulboul", "Waarom Boulboul") },
      { id: "account", kind: "page", x: BC[4], y: BR[1], w: 190, label: L("Customer account", "Compte client", "حساب العميل", "Account cliente", "Müşteri hesabı", "Cuenta de cliente", "Conta do cliente", "Личный кабинет", "Особистий кабінет", "Kundekonto", "Klantaccount") },
      { id: "product", kind: "page", x: BC[0], y: BR[2], w: 190, label: L("Product page", "Fiche produit", "صفحة المنتج", "Scheda prodotto", "Ürün sayfası", "Ficha de producto", "Página do produto", "Карточка товара", "Картка товару", "Produktside", "Productpagina") },
      { id: "upload", kind: "step", x: BC[1], y: BR[2], w: 190, h: 72, label: L("Upload design, size and description", "Upload design + dimensions + description", "رفع التصميم والمقاسات والوصف", "Carica design, misure e descrizione", "Tasarım, ölçü ve açıklama yükle", "Subir diseño, medidas y descripción", "Enviar design, medidas e descrição", "Дизайн, размеры и описание", "Дизайн, розміри й опис", "Last opp design, mål og beskrivelse", "Ontwerp, maten en beschrijving") },
      { id: "story", kind: "page", x: BC[2], y: BR[2], w: 190, h: 72, label: L("Partners, story and socials", "Partenaires, histoire et réseaux", "الشركاء والقصة والشبكات", "Partner, storia e social", "Ortaklar, hikâye ve sosyal medya", "Socios, historia y redes", "Parceiros, história e redes", "Партнёры, история и соцсети", "Партнери, історія й соцмережі", "Partnere, historie og sosiale medier", "Partners, verhaal en socials") },
      { id: "quality", kind: "page", x: BC[3], y: BR[2], w: 190, h: 72, label: L("Quality, materials and real guarantees", "Qualité, matériaux et garanties réelles", "الجودة والمواد وضمانات حقيقية", "Qualità, materiali e garanzie reali", "Kalite, malzeme ve gerçek garanti", "Calidad, materiales y garantías reales", "Qualidade, materiais e garantias reais", "Качество, материалы и гарантии", "Якість, матеріали й гарантії", "Kvalitet, materialer og ekte garantier", "Kwaliteit, materialen en echte garanties") },
      { id: "login", kind: "page", x: BC[4], y: BR[2], w: 190, label: L("Log in / Register", "Connexion / Inscription", "الدخول / التسجيل", "Accedi / Registrati", "Giriş / Kayıt", "Entrar / Registrarse", "Entrar / Cadastrar", "Вход / Регистрация", "Вхід / Реєстрація", "Logg inn / Registrer", "Inloggen / Registreren") },
      { id: "size", kind: "step", x: BC[0], y: BR[3], w: 190, label: L("Choose width and height", "Choisir longueur et hauteur", "اختيار الطول والارتفاع", "Scegli larghezza e altezza", "En ve boy seç", "Elegir largo y alto", "Escolher largura e altura", "Выбрать длину и высоту", "Обрати довжину й висоту", "Velg lengde og høyde", "Lengte en hoogte kiezen") },
      { id: "request", kind: "step", x: BC[1], y: BR[3], w: 190, label: L("Custom request", "Demande personnalisée", "طلب مخصص", "Richiesta personalizzata", "Özel talep", "Solicitud personalizada", "Pedido personalizado", "Индивидуальная заявка", "Індивідуальна заявка", "Egen forespørsel", "Aanvraag op maat") },
      { id: "study", kind: "admin", x: BC[2], y: BR[3], w: 190, label: L("Admin reviews it", "L'admin étudie la demande", "يدرسه المسؤول", "L'admin la valuta", "Yönetici inceler", "El admin la estudia", "O admin analisa", "Админ изучает", "Адмін вивчає", "Admin vurderer den", "Beheerder bekijkt het") },
      { id: "profile", kind: "page", x: BC[4], y: BR[3], w: 190, label: L("Profile and orders", "Profil et commandes", "الملف والطلبات", "Profilo e ordini", "Profil ve siparişler", "Perfil y pedidos", "Perfil e pedidos", "Профиль и заказы", "Профіль і замовлення", "Profil og ordrer", "Profiel en bestellingen") },
      { id: "priced", kind: "decision", x: BC[0], y: BR[4], w: 190, label: L("Is this size priced?", "Prix configuré ?", "هل للمقاس سعر؟", "Prezzo configurato?", "Fiyatı var mı?", "¿Tiene precio?", "Tem preço?", "Цена задана?", "Ціну задано?", "Har den pris?", "Heeft die een prijs?") },
      { id: "quote", kind: "step", x: BC[1], y: BR[4], w: 190, label: L("Made-to-measure price request", "Demande de prix sur mesure", "طلب سعر حسب المقاس", "Richiesta di prezzo su misura", "Özel fiyat talebi", "Pedir precio a medida", "Pedir preço sob medida", "Запрос цены на заказ", "Запит ціни на замовлення", "Be om pris på mål", "Prijs op maat aanvragen") },
      { id: "price", kind: "step", x: BC[0], y: BR[5], w: 190, label: L("Price calculated", "Calcul du prix", "حساب السعر", "Calcolo del prezzo", "Fiyat hesaplanır", "Cálculo del precio", "Cálculo do preço", "Расчёт цены", "Розрахунок ціни", "Prisen beregnes", "Prijs berekend") },
      { id: "buy", kind: "step", x: BC[1], y: BR[5], w: 190, label: L("Buy now", "Acheter maintenant", "اشترِ الآن", "Compra ora", "Hemen al", "Comprar ahora", "Comprar agora", "Купить сейчас", "Купити зараз", "Kjøp nå", "Nu kopen") },
      { id: "details", kind: "step", x: BC[2], y: BR[5], w: 190, label: L("Customer details", "Informations client", "بيانات العميل", "Dati del cliente", "Müşteri bilgileri", "Datos del cliente", "Dados do cliente", "Данные клиента", "Дані клієнта", "Kundeopplysninger", "Klantgegevens") },
      { id: "summary", kind: "step", x: BC[3], y: BR[5], w: 190, label: L("Order summary", "Récapitulatif commande", "ملخص الطلب", "Riepilogo ordine", "Sipariş özeti", "Resumen del pedido", "Resumo do pedido", "Сводка заказа", "Підсумок замовлення", "Ordresammendrag", "Besteloverzicht") },
      { id: "confirm", kind: "step", x: BC[4], y: BR[5], w: 190, label: L("Confirm the order", "Confirmer la commande", "تأكيد الطلب", "Conferma l'ordine", "Siparişi onayla", "Confirmar el pedido", "Confirmar o pedido", "Подтвердить заказ", "Підтвердити замовлення", "Bekreft ordren", "Bestelling bevestigen") },
      { id: "pending", kind: "step", x: BC[4], y: BR[6], w: 190, label: L("Order pending", "Commande en attente", "الطلب قيد الانتظار", "Ordine in attesa", "Sipariş beklemede", "Pedido pendiente", "Pedido pendente", "Заказ ожидает", "Замовлення очікує", "Ordren venter", "Bestelling in afwachting") },
      { id: "notify", kind: "admin", x: BC[3], y: BR[6], w: 190, label: L("Email to the admin", "E-mail à l'administrateur", "بريد إلى المسؤول", "Email all'admin", "Yöneticiye e-posta", "Email al admin", "E-mail ao admin", "Письмо админу", "Лист адміну", "E-post til admin", "Mail naar beheerder") },
    ],
    edges: [
      { from: "home", to: "catalog", at: 80 },
      { from: "home", to: "custom", at: 96 },
      { from: "home", to: "about" },
      { from: "home", to: "why", at: 96 },
      { from: "home", to: "account", at: 80 },
      { from: "catalog", to: "product" },
      { from: "product", to: "size" },
      { from: "size", to: "priced" },
      { from: "priced", to: "price", label: L("Yes", "Oui", "نعم", "Sì", "Evet", "Sí", "Sim", "Да", "Так", "Ja", "Ja") },
      { from: "priced", to: "quote", label: L("No", "Non", "لا", "No", "Hayır", "No", "Não", "Нет", "Ні", "Nei", "Nee") },
      { from: "price", to: "buy" },
      { from: "buy", to: "details" },
      { from: "details", to: "summary" },
      { from: "summary", to: "confirm" },
      { from: "confirm", to: "pending" },
      { from: "pending", to: "notify" },
      { from: "custom", to: "upload" },
      { from: "upload", to: "request" },
      { from: "request", to: "study" },
      { from: "about", to: "story" },
      { from: "why", to: "quality" },
      { from: "account", to: "login" },
      { from: "login", to: "profile" },
    ],
  },
};

/* ------------------------------------------------------------------------------------------ */
/* Woman Cares                                                                                 */
/* ------------------------------------------------------------------------------------------ */

/** English, French and Arabic; the other languages show the English wording until they are translated. */
const T3 = (en: string, fr: string, ar: string): Text => ({ en, fr, ar });
const YES = L("Yes", "Oui", "نعم", "Sì", "Evet", "Sí", "Sim", "Да", "Так", "Ja", "Ja");
const NO = L("No", "Non", "لا", "No", "Hayır", "No", "Não", "Нет", "Ні", "Nei", "Nee");

// Finding a professional: home → category → search → profile → appointment request, then the
// "signed in?" check decides between booking at once and signing in first.
const WR = [0, 90, 180, 270, 360, 450, 540, 630, 720, 825];
const WC = (c: number) => c * 190;
const womanCaresFind: RoadmapData = {
  key: "find-and-request",
  title: T3("From the home page to an appointment request", "De l'accueil à la demande de rendez-vous", "من الصفحة الرئيسية إلى طلب الموعد"),
  intro: T3(
    "A visitor picks one of six beauty categories, filters the professionals, opens a profile and asks for an appointment. If she is already signed in the booking is created at once; if not, she signs in or creates an account first.",
    "La visiteuse choisit l'une des six catégories beauté, filtre les professionnelles, ouvre un profil et demande un rendez-vous. Si elle est déjà connectée, la réservation est créée tout de suite ; sinon, elle se connecte ou crée d'abord un compte.",
    "تختار الزائرة إحدى فئات التجميل الست، وتصفّي المحترفات، وتفتح ملفًا وتطلب موعدًا. إذا كانت مسجّلة الدخول يُنشأ الحجز فورًا، وإلا فإنها تسجّل الدخول أو تنشئ حسابًا أولًا.",
  ),
  diagram: {
    type: "flow",
    width: 1120,
    height: 881,
    nodes: [
      { id: "home", kind: "page", x: 475, y: WR[0], w: 170, label: T3("Home page", "Page d'accueil", "الصفحة الرئيسية") },
      { id: "about", kind: "page", x: 0, y: WR[1], w: 170, label: T3("About Woman Cares", "À propos de Woman Cares", "عن Woman Cares") },
      { id: "cats", kind: "page", x: 475, y: WR[1], w: 170, label: T3("Beauty categories", "Catégories beauté", "فئات التجميل") },
      { id: "services", kind: "page", x: 950, y: WR[1], w: 170, label: T3("About our services", "À propos de nos services", "عن خدماتنا") },
      { id: "hair", kind: "page", x: WC(0), y: WR[2], w: 170, label: T3("Hairdressers", "Coiffeuses", "مصففات الشعر") },
      { id: "aesthetics", kind: "page", x: WC(1), y: WR[2], w: 170, label: T3("Aesthetics", "Esthétique", "التجميل") },
      { id: "massage", kind: "page", x: WC(2), y: WR[2], w: 170, label: T3("Massage", "Massage", "المساج") },
      { id: "nails", kind: "page", x: WC(3), y: WR[2], w: 170, label: T3("Nails", "Ongles", "الأظافر") },
      { id: "lashes", kind: "page", x: WC(4), y: WR[2], w: 170, label: T3("Lash extensions", "Extensions de cils", "تمديد الرموش") },
      { id: "botox", kind: "page", x: WC(5), y: WR[2], w: 170, label: T3("Botox", "Botox", "البوتوكس") },
      { id: "search", kind: "step", x: 475, y: WR[3], w: 170, label: T3("Search & filters", "Recherche et filtres", "البحث والفلاتر") },
      { id: "cards", kind: "step", x: 475, y: WR[4], w: 170, label: T3("Provider cards", "Cartes des professionnelles", "بطاقات المحترفات") },
      { id: "profile", kind: "page", x: 475, y: WR[5], w: 170, label: T3("Category profile details", "Profil par catégorie", "تفاصيل ملف الفئة") },
      { id: "prices", kind: "step", x: 190, y: WR[6], w: 170, label: T3("Services & prices", "Prestations et tarifs", "الخدمات والأسعار") },
      { id: "photos", kind: "step", x: 380, y: WR[6], w: 170, label: T3("Photos & videos", "Photos et vidéos", "الصور والفيديو") },
      { id: "location", kind: "step", x: 570, y: WR[6], w: 170, label: T3("Location & distance", "Lieu et distance", "الموقع والمسافة") },
      { id: "calendar", kind: "step", x: 760, y: WR[6], w: 170, label: T3("Calendar & availability", "Calendrier et disponibilités", "التقويم والتوفر") },
      { id: "request", kind: "step", x: 760, y: WR[7], w: 170, label: T3("Appointment request", "Demande de rendez-vous", "طلب موعد") },
      { id: "signed", kind: "decision", x: 760, y: WR[8], w: 170, label: T3("Client signed in?", "Cliente connectée ?", "هل العميلة مسجّلة؟") },
      { id: "booking", kind: "step", x: 570, y: WR[9], w: 170, label: T3("Create booking", "Créer la réservation", "إنشاء الحجز") },
      { id: "signin", kind: "page", x: 950, y: WR[9], w: 170, label: T3("Sign in / sign up", "Connexion / inscription", "الدخول / التسجيل") },
    ],
    edges: [
      { from: "home", to: "about" },
      { from: "home", to: "cats" },
      { from: "home", to: "services" },
      { from: "cats", to: "hair" },
      { from: "cats", to: "aesthetics" },
      { from: "cats", to: "massage" },
      { from: "cats", to: "nails" },
      { from: "cats", to: "lashes" },
      { from: "cats", to: "botox" },
      { from: "hair", to: "search" },
      { from: "aesthetics", to: "search" },
      { from: "massage", to: "search" },
      { from: "nails", to: "search" },
      { from: "lashes", to: "search" },
      { from: "botox", to: "search" },
      { from: "search", to: "cards" },
      { from: "cards", to: "profile" },
      { from: "profile", to: "prices" },
      { from: "profile", to: "photos" },
      { from: "profile", to: "location" },
      { from: "profile", to: "calendar" },
      { from: "calendar", to: "request" },
      { from: "request", to: "signed" },
      { from: "signed", to: "booking", label: YES },
      { from: "signed", to: "signin", label: NO },
    ],
  },
};

// The booking itself: the professional answers a pending request in one of three ways. A new time
// goes back to the client, who confirms it by booking again.
const womanCaresBooking: RoadmapData = {
  key: "booking-flow",
  title: T3("From request to confirmed appointment", "De la demande au rendez-vous confirmé", "من الطلب إلى الموعد المؤكَّد"),
  intro: T3(
    "A booking starts as a pending request in the professional's dashboard. She accepts it, declines it or proposes another time. The client is told by email and in the app, and a proposed time sends her back to book again.",
    "Une réservation commence comme demande en attente dans le tableau de bord de la professionnelle. Elle l'accepte, la refuse ou propose un autre horaire. La cliente est prévenue par e-mail et dans l'application, et un nouvel horaire la ramène à la réservation.",
    "يبدأ الحجز طلبًا معلّقًا في لوحة المحترفة. تقبله أو ترفضه أو تقترح وقتًا آخر. تُبلَّغ العميلة بالبريد وفي التطبيق، ويعيدها الوقت المقترح إلى الحجز من جديد.",
  ),
  diagram: {
    type: "flow",
    width: 640,
    height: 516,
    nodes: [
      { id: "create", kind: "step", x: 200, y: 0, w: 190, label: T3("Create booking", "Créer la réservation", "إنشاء الحجز") },
      { id: "pending", kind: "step", x: 200, y: 92, w: 190, label: T3("Pending request", "Demande en attente", "طلب معلّق") },
      { id: "dash", kind: "page", x: 200, y: 184, w: 190, label: T3("Provider dashboard", "Tableau de bord de la professionnelle", "لوحة المحترفة") },
      { id: "notify", kind: "admin", x: 440, y: 184, w: 190, label: T3("Email & in-app notifications", "Notifications e-mail et dans l'app", "إشعارات البريد والتطبيق") },
      { id: "decision", kind: "decision", x: 200, y: 276, w: 190, h: 64, label: T3("Accept / reject / reschedule", "Accepter / refuser / reporter", "قبول / رفض / إعادة جدولة") },
      { id: "newtime", kind: "step", x: 0, y: 368, w: 190, label: T3("New time proposed", "Nouvel horaire proposé", "وقت جديد مقترح") },
      { id: "rejected", kind: "step", x: 200, y: 368, w: 190, label: T3("Rejected request", "Demande refusée", "طلب مرفوض") },
      { id: "confirmed", kind: "step", x: 400, y: 368, w: 190, label: T3("Confirmed appointment", "Rendez-vous confirmé", "موعد مؤكَّد") },
      { id: "client", kind: "page", x: 300, y: 460, w: 190, label: T3("Client dashboard", "Tableau de bord cliente", "لوحة العميلة") },
    ],
    edges: [
      { from: "create", to: "pending" },
      { from: "pending", to: "dash" },
      { from: "dash", to: "notify", side: true },
      { from: "dash", to: "decision" },
      { from: "decision", to: "newtime" },
      { from: "decision", to: "rejected" },
      { from: "decision", to: "confirmed" },
      { from: "confirmed", to: "client" },
      { from: "rejected", to: "client" },
      { from: "newtime", to: "create", dashed: true, around: "left" },
    ],
  },
};

// Accounts: one sign-in page, three roles. A professional can hold several categories and still sees
// one dashboard; the admin's seven areas run along the bottom.
const womanCaresAccounts: RoadmapData = {
  key: "accounts",
  title: T3("Accounts and dashboards", "Comptes et tableaux de bord", "الحسابات ولوحات التحكم"),
  intro: T3(
    "One sign-in page leads to three kinds of account. A professional chooses one or more categories and manages them all from a single dashboard; the admin dashboard covers users, categories, pricing, content, verification, moderation and analytics.",
    "Une seule page de connexion mène à trois types de compte. Une professionnelle choisit une ou plusieurs catégories et les gère toutes depuis un seul tableau de bord ; celui de l'administrateur couvre utilisateurs, catégories, tarifs, contenu, vérification, modération et statistiques.",
    "صفحة دخول واحدة تقود إلى ثلاثة أنواع من الحسابات. تختار المحترفة فئة أو أكثر وتديرها كلها من لوحة واحدة، وتغطّي لوحة المسؤول المستخدمين والفئات والأسعار والمحتوى والتحقق والإشراف والإحصاءات.",
  ),
  diagram: {
    type: "flow",
    width: 1110,
    height: 584,
    nodes: [
      { id: "signin", kind: "page", x: 380, y: 0, w: 190, label: T3("Sign in / sign up", "Connexion / inscription", "الدخول / التسجيل") },
      { id: "client", kind: "page", x: 0, y: 100, w: 190, label: T3("Client dashboard", "Tableau de bord cliente", "لوحة العميلة") },
      { id: "onboarding", kind: "step", x: 380, y: 100, w: 190, label: T3("Professional onboarding", "Accueil des professionnelles", "تسجيل المحترفة") },
      { id: "multi", kind: "step", x: 380, y: 200, w: 190, label: T3("Select multiple categories", "Choisir plusieurs catégories", "اختيار عدة فئات") },
      { id: "unified", kind: "page", x: 380, y: 300, w: 190, h: 64, label: T3("One unified provider dashboard", "Un seul tableau de bord", "لوحة واحدة موحّدة") },
      { id: "p1", kind: "step", x: 0, y: 410, w: 150, h: 64, label: T3("Manage category profiles", "Gérer les profils", "إدارة ملفات الفئات") },
      { id: "p2", kind: "step", x: 160, y: 410, w: 150, h: 64, label: T3("Manage all bookings", "Gérer les réservations", "إدارة كل الحجوزات") },
      { id: "p3", kind: "step", x: 320, y: 410, w: 150, h: 64, label: T3("Manage schedules", "Gérer les plannings", "إدارة الجداول") },
      { id: "p4", kind: "step", x: 480, y: 410, w: 150, h: 64, label: T3("Earnings & payment records", "Revenus et paiements", "الأرباح والمدفوعات") },
      { id: "p5", kind: "step", x: 640, y: 410, w: 150, h: 64, label: T3("Visitor analytics", "Statistiques de visites", "إحصاءات الزيارات") },
      { id: "p6", kind: "step", x: 800, y: 410, w: 150, h: 64, label: T3("Subscriptions & billing", "Abonnements et facturation", "الاشتراكات والفوترة") },
      { id: "admin", kind: "admin", x: 920, y: 100, w: 190, label: T3("Admin dashboard", "Tableau de bord admin", "لوحة المسؤول") },
      { id: "a1", kind: "admin", x: 0, y: 520, w: 150, h: 64, label: T3("User management", "Gestion des utilisateurs", "إدارة المستخدمين") },
      { id: "a2", kind: "admin", x: 160, y: 520, w: 150, h: 64, label: T3("Category management", "Gestion des catégories", "إدارة الفئات") },
      { id: "a3", kind: "admin", x: 320, y: 520, w: 150, h: 64, label: T3("Pricing & subscriptions", "Tarifs et abonnements", "الأسعار والاشتراكات") },
      { id: "a4", kind: "admin", x: 480, y: 520, w: 150, h: 64, label: T3("Website content", "Contenu du site", "محتوى الموقع") },
      { id: "a5", kind: "admin", x: 640, y: 520, w: 150, h: 64, label: T3("Provider verification", "Vérification des professionnelles", "التحقق من المحترفات") },
      { id: "a6", kind: "admin", x: 800, y: 520, w: 150, h: 64, label: T3("Moderation", "Modération", "الإشراف") },
      { id: "a7", kind: "admin", x: 960, y: 520, w: 150, h: 64, label: T3("Platform analytics", "Statistiques de la plateforme", "إحصاءات المنصة") },
    ],
    edges: [
      { from: "signin", to: "client", label: T3("Client", "Cliente", "عميلة") },
      { from: "signin", to: "onboarding", label: T3("Professional", "Professionnelle", "محترفة") },
      { from: "signin", to: "admin", label: T3("Admin", "Admin", "مسؤول") },
      { from: "onboarding", to: "multi" },
      { from: "multi", to: "unified" },
      { from: "unified", to: "p1" },
      { from: "unified", to: "p2" },
      { from: "unified", to: "p3" },
      { from: "unified", to: "p4" },
      { from: "unified", to: "p5" },
      { from: "unified", to: "p6" },
      { from: "admin", to: "a1", at: 497, fx: 0.5 },
      { from: "admin", to: "a2", at: 497, fx: 0.57 },
      { from: "admin", to: "a3", at: 497, fx: 0.64 },
      { from: "admin", to: "a4", at: 497, fx: 0.71 },
      { from: "admin", to: "a5", at: 497, fx: 0.78 },
      { from: "admin", to: "a6", at: 497, fx: 0.85 },
      { from: "admin", to: "a7", at: 497, fx: 0.92 },
    ],
  },
};

// Who can do what: clients, beauty professionals and the Super Admin, with the two outside services
// (email, and the payment provider behind subscriptions).
const womanCaresRoles: RoadmapData = {
  key: "roles",
  title: T3("Who does what", "Qui fait quoi", "من يفعل ماذا"),
  intro: T3(
    "Clients search and request appointments; beauty professionals run their listings, availability and bookings; the Super Admin looks after accounts, approvals, subscription plans, content and analytics. Email notifications and the payment provider sit outside the platform.",
    "Les clientes cherchent et demandent des rendez-vous ; les professionnelles gèrent leurs annonces, leurs disponibilités et leurs réservations ; le Super Admin s'occupe des comptes, des validations, des abonnements, du contenu et des statistiques. Les e-mails et le prestataire de paiement restent en dehors de la plateforme.",
    "تبحث العميلات وتطلب المواعيد، وتدير المحترفات إعلاناتهن وتوفرهن وحجوزاتهن، ويتولى المسؤول الأعلى الحسابات والموافقات وخطط الاشتراك والمحتوى والإحصاءات. أما البريد ومزوّد الدفع فهما خارج المنصة.",
  ),
  diagram: {
    type: "flow",
    width: 1070,
    height: 706,
    nodes: [
      { id: "client", kind: "actor", x: 440, y: 0, w: 190, label: T3("Client", "Cliente", "العميلة") },
      { id: "c1", kind: "case", x: 0, y: 90, w: 170, h: 64, label: T3("Search and filter providers", "Chercher et filtrer", "البحث وتصفية المحترفات") },
      { id: "c2", kind: "case", x: 180, y: 90, w: 170, h: 64, label: T3("View profiles and portfolios", "Voir profils et réalisations", "عرض الملفات والأعمال") },
      { id: "c3", kind: "case", x: 360, y: 90, w: 170, h: 64, label: T3("Request an appointment", "Demander un rendez-vous", "طلب موعد") },
      { id: "c4", kind: "case", x: 540, y: 90, w: 170, h: 64, label: T3("Manage favorites", "Gérer les favoris", "إدارة المفضلة") },
      { id: "c5", kind: "case", x: 720, y: 90, w: 170, h: 64, label: T3("Submit a review", "Laisser un avis", "كتابة تقييم") },
      { id: "c6", kind: "case", x: 900, y: 90, w: 170, h: 64, label: T3("Manage client dashboard", "Gérer son tableau de bord", "إدارة لوحة العميلة") },
      { id: "pro", kind: "actor", x: 440, y: 190, w: 190, label: T3("Beauty professional", "Professionnelle beauté", "المحترفة") },
      { id: "p1", kind: "case", x: 0, y: 280, w: 190, h: 64, label: T3("Manage listings and services", "Gérer annonces et prestations", "إدارة الإعلانات والخدمات") },
      { id: "p2", kind: "case", x: 220, y: 280, w: 190, h: 64, label: T3("Manage appointment requests", "Gérer les demandes de rendez-vous", "إدارة طلبات المواعيد") },
      { id: "p3", kind: "case", x: 440, y: 280, w: 190, h: 64, label: T3("View earnings and payments", "Voir revenus et paiements", "عرض الأرباح والمدفوعات") },
      { id: "p4", kind: "case", x: 660, y: 280, w: 190, h: 64, label: T3("Manage availability", "Gérer les disponibilités", "إدارة التوفر") },
      { id: "p5", kind: "case", x: 880, y: 280, w: 190, h: 64, label: T3("View visitor analytics", "Voir les statistiques de visites", "عرض إحصاءات الزيارات") },
      { id: "email", kind: "note", x: 220, y: 370, w: 190, h: 64, label: T3("Email notification service", "Service de notifications e-mail", "خدمة إشعارات البريد") },
      { id: "admin", kind: "actor", x: 440, y: 470, w: 190, label: T3("Super Admin", "Super Admin", "المسؤول الأعلى") },
      { id: "a1", kind: "case", x: 0, y: 560, w: 190, h: 64, label: T3("Manage accounts and roles", "Gérer comptes et rôles", "إدارة الحسابات والأدوار") },
      { id: "a2", kind: "case", x: 220, y: 560, w: 190, h: 64, label: T3("Approve and moderate providers", "Valider et modérer les professionnelles", "الموافقة على المحترفات والإشراف") },
      { id: "a3", kind: "case", x: 440, y: 560, w: 190, h: 64, label: T3("Manage subscription plans", "Gérer les abonnements", "إدارة خطط الاشتراك") },
      { id: "a4", kind: "case", x: 660, y: 560, w: 190, h: 64, label: T3("Manage website content", "Gérer le contenu du site", "إدارة محتوى الموقع") },
      { id: "a5", kind: "case", x: 880, y: 560, w: 190, h: 64, label: T3("View platform analytics", "Voir les statistiques de la plateforme", "عرض إحصاءات المنصة") },
      { id: "payment", kind: "note", x: 440, y: 650, w: 190, label: T3("Payment provider", "Prestataire de paiement", "مزوّد الدفع") },
    ],
    edges: [
      { from: "client", to: "c1" },
      { from: "client", to: "c2" },
      { from: "client", to: "c3" },
      { from: "client", to: "c4" },
      { from: "client", to: "c5" },
      { from: "client", to: "c6" },
      { from: "pro", to: "p1" },
      { from: "pro", to: "p2" },
      { from: "pro", to: "p3" },
      { from: "pro", to: "p4" },
      { from: "pro", to: "p5" },
      { from: "p2", to: "email", dashed: true },
      { from: "admin", to: "a1" },
      { from: "admin", to: "a2" },
      { from: "admin", to: "a3" },
      { from: "admin", to: "a4" },
      { from: "admin", to: "a5" },
      { from: "a3", to: "payment", dashed: true },
    ],
  },
};

/** Per project slug. */
const ROADMAPS: Record<string, RoadmapData[]> = {
  "zodic-car": [zodicUseCases, zodicSequence],
  "king-253": [kingSitemap, kingOrderFlow],
  "boulboul-art-wall": [boulboulLayers, boulboulSitemap],
  "woman-cares": [womanCaresFind, womanCaresBooking, womanCaresAccounts, womanCaresRoles],
};

function pick(text: Text, locale: Locale): string {
  if (typeof text === "string") return text;
  for (const l of fallbackChain(locale)) {
    const v = (text as Record<string, string | undefined>)[l];
    if (v) return v;
  }
  return text.en;
}

function resolve<T>(value: T, locale: Locale): Resolved<T> {
  if (typeof value === "string") return value as Resolved<T>;
  if (Array.isArray(value)) return value.map((v) => resolve(v, locale)) as Resolved<T>;
  if (value && typeof value === "object") {
    if ("en" in value && typeof (value as { en: unknown }).en === "string") return pick(value as Text, locale) as Resolved<T>;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, locale)])) as Resolved<T>;
  }
  return value as Resolved<T>;
}

/** The project's roadmaps in the page's language (an empty list when it has none yet). */
export function roadmapsFor(slug: string, locale: Locale): Roadmap[] {
  return (ROADMAPS[slug] ?? []).map((r) => resolve(r, locale));
}

export { H as NODE_HEIGHT };
