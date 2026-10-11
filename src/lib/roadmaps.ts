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

export type NodeKind = "actor" | "case" | "page" | "step" | "admin" | "note";
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
type FlowData = { type: "flow"; width: number; height: number; group?: { label: Text; x: number; y: number; w: number; h: number }; nodes: FlowNodeData[]; edges: FlowEdgeData[] };
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
    group: { label: "ZODIC CAR website", x: 330, y: 0, w: 770, h: 690 },
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

/** Per project slug. Boulboul Art Wall's roadmap is added when its diagram arrives. */
const ROADMAPS: Record<string, RoadmapData[]> = {
  "zodic-car": [zodicUseCases, zodicSequence],
  "king-253": [kingSitemap, kingOrderFlow],
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
