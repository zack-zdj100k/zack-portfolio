// Woman Cares: the beauty and self-care marketplace for women in Algeria (owner's own project, still
// in progress). Used by prisma/seed.ts for fresh databases and by the data migration that adds the
// project to an existing one. Non-English text is machine-drafted (reviewed = false).
import type { Locale } from "../../src/lib/i18n/locales";

export const WOMAN_CARES_SLUG = "woman-cares";
export const WOMAN_CARES_TITLE = "Woman Cares";
export const WOMAN_CARES_TECHNOLOGIES = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL"];
export const WOMAN_CARES_LIVE_URL = "https://woman-cares.vercel.app";

/** Screenshots in /public/projects/woman-cares, taken from the live site (which uses demo profiles). */
export const WOMAN_CARES_IMAGES = [
  { file: "0-d", kind: "REAL", width: 1600, height: 1000 },
  { file: "1-d", kind: "DEMO", width: 1600, height: 1000 },
  { file: "2-d", kind: "DEMO", width: 1600, height: 1000 },
  { file: "0-m", kind: "REAL", width: 780, height: 1688 },
] as const;

export const WOMAN_CARES_ARCHITECTURE_NODES = [
  { kind: "CLIENT", technology: null },
  { kind: "FRONTEND", technology: "Next.js · React · Tailwind CSS" },
  { kind: "BACKEND", technology: "Next.js server" },
  { kind: "DATABASE", technology: "PostgreSQL · Prisma" },
] as const;

type Copy = {
  summary: string;
  features: [string, string, string, string];
  /** One alt text per screenshot, in the order of WOMAN_CARES_IMAGES. */
  alts: [string, string, string, string];
  frontend: string;
  backend: string;
  database: string;
  flow: string;
};

export const WOMAN_CARES_COPY: Partial<Record<Locale, Copy>> = {
  en: {
    summary:
      "A beauty and self-care marketplace for women in Algeria, in French and Arabic. Clients find hairdressers, aestheticians, nail, lash, massage and Botox professionals near them, compare their work and prices, and request an appointment. Professionals manage their profiles, schedule and bookings.",
    features: [
      "Six beauty categories with filters by wilaya, service and distance",
      "Professional profiles with services, photos and opening hours",
      "Appointment requests: accept, decline or propose a new time",
      "Dashboards for clients, professionals and admins",
    ],
    alts: ["Woman Cares home page", "Woman Cares hairdressers directory with filters", "Woman Cares professional profile page (demo data)", "Woman Cares home page on a phone"],
    frontend: "Built with Next.js, React and Tailwind CSS, in French and Arabic (right to left). Clients search by category, wilaya and distance, open a profile and request an appointment. Professionals and admins use their own dashboards.",
    backend: "The Next.js server checks every sign-in and role, works out the free time slots, takes booking requests without double-booking, sends the email notifications and runs the admin review and billing.",
    database: "PostgreSQL, used through Prisma. It stores accounts and roles, one profile per category, services, schedules, bookings, reviews, subscriptions and invoices. Photos are kept on Cloudinary.",
    flow: "The browser asks for a page or sends a booking request. The Next.js server checks the person's role, reads or saves the data in PostgreSQL through Prisma, sends the email notifications and answers with the updated page.",
  },
  fr: {
    summary:
      "Une place de marché beauté et bien-être pour les femmes en Algérie, en français et en arabe. Les clientes trouvent près de chez elles coiffeuses, esthéticiennes, spécialistes des ongles, des cils, du massage et du Botox, comparent leur travail et leurs tarifs, puis demandent un rendez-vous. Les professionnelles gèrent leurs profils, leur planning et leurs réservations.",
    features: [
      "Six catégories beauté avec filtres par wilaya, prestation et distance",
      "Profils de professionnelles avec prestations, photos et horaires",
      "Demandes de rendez-vous : accepter, refuser ou proposer un autre horaire",
      "Tableaux de bord pour clientes, professionnelles et administrateurs",
    ],
    alts: ["Page d'accueil de Woman Cares", "Annuaire des coiffeuses de Woman Cares avec filtres", "Profil d'une professionnelle sur Woman Cares (données de démonstration)", "Page d'accueil de Woman Cares sur téléphone"],
    frontend: "Développé avec Next.js, React et Tailwind CSS, en français et en arabe (de droite à gauche). Les clientes cherchent par catégorie, wilaya et distance, ouvrent un profil et demandent un rendez-vous. Professionnelles et administrateurs ont chacun leur tableau de bord.",
    backend: "Le serveur Next.js vérifie chaque connexion et chaque rôle, calcule les créneaux libres, enregistre les demandes sans double réservation, envoie les e-mails de notification et fait tourner la validation des profils et la facturation.",
    database: "PostgreSQL, utilisé via Prisma. On y trouve les comptes et rôles, un profil par catégorie, les prestations, les plannings, les réservations, les avis, les abonnements et les factures. Les photos sont stockées sur Cloudinary.",
    flow: "Le navigateur demande une page ou envoie une demande de rendez-vous. Le serveur Next.js vérifie le rôle de la personne, lit ou enregistre les données dans PostgreSQL via Prisma, envoie les e-mails de notification, puis répond avec la page à jour.",
  },
  ar: {
    summary:
      "منصة للجمال والعناية بالمرأة في الجزائر، بالفرنسية والعربية. تجد العميلات قريبًا منهن مصففات الشعر وخبيرات التجميل والأظافر والرموش والمساج والبوتوكس، ويقارنّ أعمالهن وأسعارهن ثم يطلبن موعدًا. وتدير المحترفات ملفاتهن وجداولهن وحجوزاتهن.",
    features: [
      "ست فئات للتجميل مع فلاتر حسب الولاية والخدمة والمسافة",
      "ملفات للمحترفات مع الخدمات والصور وأوقات العمل",
      "طلبات المواعيد: قبول أو رفض أو اقتراح موعد جديد",
      "لوحات تحكم للعميلات والمحترفات والمسؤولين",
    ],
    alts: ["الصفحة الرئيسية لـ Woman Cares", "دليل مصففات الشعر في Woman Cares مع الفلاتر", "ملف محترفة على Woman Cares (بيانات تجريبية)", "الصفحة الرئيسية لـ Woman Cares على الهاتف"],
    frontend: "مبني باستخدام Next.js وReact وTailwind CSS بالفرنسية والعربية (من اليمين إلى اليسار). تبحث العميلات حسب الفئة والولاية والمسافة، وتفتح الملف وتطلب موعدًا. وللمحترفات والمسؤولين لوحة تحكم خاصة بكل منهم.",
    backend: "يتحقق خادم Next.js من كل تسجيل دخول وصلاحية، ويحسب الأوقات الفارغة، ويستقبل طلبات الحجز دون تعارض بين موعدين، ويرسل رسائل البريد، ويدير مراجعة الملفات والفوترة.",
    database: "PostgreSQL عبر Prisma. تُخزَّن فيها الحسابات والصلاحيات، وملف لكل فئة، والخدمات، والجداول، والحجوزات، والتقييمات، والاشتراكات، والفواتير. أما الصور فتُحفظ على Cloudinary.",
    flow: "يطلب المتصفح صفحة أو يرسل طلب حجز. يتحقق خادم Next.js من صلاحية الشخص، ويقرأ البيانات أو يحفظها في PostgreSQL عبر Prisma، ويرسل رسائل البريد، ثم يردّ بالصفحة المحدَّثة.",
  },
  it: {
    summary:
      "Un marketplace di bellezza e cura per le donne in Algeria, in francese e arabo. Le clienti trovano vicino a sé parrucchiere, estetiste e professioniste di unghie, ciglia, massaggi e Botox, confrontano lavori e prezzi e richiedono un appuntamento. Le professioniste gestiscono profili, agenda e prenotazioni.",
    features: [
      "Sei categorie di bellezza con filtri per wilaya, servizio e distanza",
      "Profili delle professioniste con servizi, foto e orari",
      "Richieste di appuntamento: accettare, rifiutare o proporre un altro orario",
      "Dashboard per clienti, professioniste e amministratori",
    ],
    alts: ["Home page di Woman Cares", "Elenco parrucchiere di Woman Cares con filtri", "Profilo di una professionista su Woman Cares (dati dimostrativi)", "Home page di Woman Cares su telefono"],
    frontend: "Realizzato con Next.js, React e Tailwind CSS, in francese e arabo (da destra a sinistra). Le clienti cercano per categoria, wilaya e distanza, aprono un profilo e richiedono un appuntamento. Professioniste e amministratori hanno ciascuno la propria dashboard.",
    backend: "Il server Next.js verifica ogni accesso e ruolo, calcola gli orari liberi, riceve le richieste senza doppie prenotazioni, invia le email di notifica e gestisce la revisione dei profili e la fatturazione.",
    database: "PostgreSQL, usato tramite Prisma. Contiene account e ruoli, un profilo per categoria, servizi, orari, prenotazioni, recensioni, abbonamenti e fatture. Le foto sono su Cloudinary.",
    flow: "Il browser chiede una pagina o invia una richiesta di prenotazione. Il server Next.js verifica il ruolo della persona, legge o salva i dati in PostgreSQL tramite Prisma, invia le email di notifica e risponde con la pagina aggiornata.",
  },
  tr: {
    summary:
      "Cezayir'deki kadınlar için Fransızca ve Arapça bir güzellik ve bakım pazaryeri. Müşteriler yakınlarındaki kuaförleri, estetisyenleri, tırnak, kirpik, masaj ve botoks uzmanlarını bulur, işlerini ve fiyatlarını karşılaştırır, randevu ister. Uzmanlar profillerini, takvimlerini ve rezervasyonlarını yönetir.",
    features: [
      "Vilayet, hizmet ve mesafeye göre filtreli altı güzellik kategorisi",
      "Hizmetleri, fotoğrafları ve çalışma saatleriyle uzman profilleri",
      "Randevu talepleri: kabul et, reddet veya yeni saat öner",
      "Müşteriler, uzmanlar ve yöneticiler için paneller",
    ],
    alts: ["Woman Cares ana sayfası", "Woman Cares kuaför rehberi ve filtreleri", "Woman Cares uzman profil sayfası (demo verileri)", "Woman Cares ana sayfası, telefonda"],
    frontend: "Next.js, React ve Tailwind CSS ile, Fransızca ve Arapça (sağdan sola) yapıldı. Müşteriler kategori, vilayet ve mesafeye göre arar, bir profili açar ve randevu ister. Uzmanların ve yöneticilerin kendi panelleri vardır.",
    backend: "Next.js sunucusu her girişi ve rolü kontrol eder, boş saatleri hesaplar, çifte rezervasyon olmadan talepleri alır, bildirim e-postalarını gönderir; profil incelemesini ve faturalamayı yürütür.",
    database: "Prisma üzerinden PostgreSQL. Hesapları ve rolleri, kategori başına bir profili, hizmetleri, takvimleri, rezervasyonları, yorumları, abonelikleri ve faturaları saklar. Fotoğraflar Cloudinary'de tutulur.",
    flow: "Tarayıcı bir sayfa ister ya da rezervasyon talebi gönderir. Next.js sunucusu kişinin rolünü kontrol eder, Prisma aracılığıyla PostgreSQL'de veriyi okur veya kaydeder, bildirim e-postalarını gönderir ve güncellenmiş sayfayla yanıt verir.",
  },
  es: {
    summary:
      "Un marketplace de belleza y cuidado para mujeres en Argelia, en francés y árabe. Las clientas encuentran cerca de ellas peluqueras, esteticistas y profesionales de uñas, pestañas, masajes y Botox, comparan su trabajo y precios y piden una cita. Las profesionales gestionan sus perfiles, agenda y reservas.",
    features: [
      "Seis categorías de belleza con filtros por wilaya, servicio y distancia",
      "Perfiles de profesionales con servicios, fotos y horarios",
      "Solicitudes de cita: aceptar, rechazar o proponer otra hora",
      "Paneles para clientas, profesionales y administradores",
    ],
    alts: ["Página de inicio de Woman Cares", "Directorio de peluqueras de Woman Cares con filtros", "Perfil de una profesional en Woman Cares (datos de demostración)", "Página de inicio de Woman Cares en un teléfono"],
    frontend: "Hecho con Next.js, React y Tailwind CSS, en francés y árabe (de derecha a izquierda). Las clientas buscan por categoría, wilaya y distancia, abren un perfil y piden una cita. Profesionales y administradores tienen su propio panel.",
    backend: "El servidor Next.js comprueba cada inicio de sesión y rol, calcula los huecos libres, recibe las solicitudes sin dobles reservas, envía los correos de aviso y se encarga de la revisión de perfiles y la facturación.",
    database: "PostgreSQL, usado a través de Prisma. Guarda cuentas y roles, un perfil por categoría, servicios, horarios, reservas, reseñas, suscripciones y facturas. Las fotos están en Cloudinary.",
    flow: "El navegador pide una página o envía una solicitud de reserva. El servidor Next.js comprueba el rol de la persona, lee o guarda los datos en PostgreSQL mediante Prisma, envía los correos de aviso y responde con la página actualizada.",
  },
  "pt-BR": {
    summary:
      "Um marketplace de beleza e bem-estar para mulheres na Argélia, em francês e árabe. As clientes encontram perto delas cabeleireiras, esteticistas e profissionais de unhas, cílios, massagem e Botox, comparam trabalhos e preços e pedem um horário. As profissionais gerenciam perfis, agenda e reservas.",
    features: [
      "Seis categorias de beleza com filtros por wilaya, serviço e distância",
      "Perfis de profissionais com serviços, fotos e horários",
      "Pedidos de horário: aceitar, recusar ou propor outro horário",
      "Painéis para clientes, profissionais e administradores",
    ],
    alts: ["Página inicial do Woman Cares", "Diretório de cabeleireiras do Woman Cares com filtros", "Perfil de uma profissional no Woman Cares (dados de demonstração)", "Página inicial do Woman Cares no celular"],
    frontend: "Feito com Next.js, React e Tailwind CSS, em francês e árabe (da direita para a esquerda). As clientes buscam por categoria, wilaya e distância, abrem um perfil e pedem um horário. Profissionais e administradores têm cada um o seu painel.",
    backend: "O servidor Next.js verifica cada login e permissão, calcula os horários livres, recebe os pedidos sem reservas duplicadas, envia os e-mails de aviso e cuida da análise dos perfis e da cobrança.",
    database: "PostgreSQL, usado via Prisma. Guarda contas e permissões, um perfil por categoria, serviços, agendas, reservas, avaliações, assinaturas e faturas. As fotos ficam no Cloudinary.",
    flow: "O navegador pede uma página ou envia um pedido de reserva. O servidor Next.js verifica a permissão da pessoa, lê ou salva os dados no PostgreSQL via Prisma, envia os e-mails de aviso e responde com a página atualizada.",
  },
  ru: {
    summary:
      "Маркетплейс красоты и ухода для женщин в Алжире, на французском и арабском. Клиентки находят рядом парикмахеров, косметологов и мастеров маникюра, ресниц, массажа и ботокса, сравнивают работы и цены и записываются. Мастера ведут свои профили, расписание и записи.",
    features: [
      "Шесть категорий красоты с фильтрами по вилайе, услуге и расстоянию",
      "Профили мастеров с услугами, фото и часами работы",
      "Заявки на запись: принять, отклонить или предложить другое время",
      "Панели для клиенток, мастеров и администраторов",
    ],
    alts: ["Главная страница Woman Cares", "Каталог парикмахеров Woman Cares с фильтрами", "Профиль мастера в Woman Cares (демо-данные)", "Главная страница Woman Cares на телефоне"],
    frontend: "Сделан на Next.js, React и Tailwind CSS, на французском и арабском (справа налево). Клиентки ищут по категории, вилайе и расстоянию, открывают профиль и отправляют заявку. У мастеров и администраторов свои панели.",
    backend: "Сервер Next.js проверяет каждый вход и роль, считает свободное время, принимает заявки без двойных записей, отправляет письма-уведомления и ведёт проверку профилей и выставление счетов.",
    database: "PostgreSQL через Prisma. Здесь хранятся аккаунты и роли, профиль на каждую категорию, услуги, расписания, записи, отзывы, подписки и счета. Фото лежат в Cloudinary.",
    flow: "Браузер запрашивает страницу или отправляет заявку на запись. Сервер Next.js проверяет роль человека, читает или сохраняет данные в PostgreSQL через Prisma, отправляет уведомления по почте и отвечает обновлённой страницей.",
  },
  uk: {
    summary:
      "Маркетплейс краси та догляду для жінок в Алжирі, французькою й арабською. Клієнтки знаходять поруч перукарок, косметологинь і майстринь манікюру, вій, масажу та ботоксу, порівнюють роботи й ціни та записуються. Майстрині ведуть свої профілі, розклад і записи.",
    features: [
      "Шість категорій краси з фільтрами за вілаєю, послугою та відстанню",
      "Профілі майстринь з послугами, фото та годинами роботи",
      "Запити на запис: прийняти, відхилити або запропонувати інший час",
      "Панелі для клієнток, майстринь і адміністраторів",
    ],
    alts: ["Головна сторінка Woman Cares", "Каталог перукарок Woman Cares з фільтрами", "Профіль майстрині в Woman Cares (демо-дані)", "Головна сторінка Woman Cares на телефоні"],
    frontend: "Створено на Next.js, React і Tailwind CSS, французькою та арабською (справа наліво). Клієнтки шукають за категорією, вілаєю та відстанню, відкривають профіль і надсилають запит. Майстрині й адміністратори мають власні панелі.",
    backend: "Сервер Next.js перевіряє кожен вхід і роль, рахує вільний час, приймає запити без подвійних записів, надсилає листи-сповіщення та веде перевірку профілів і виставлення рахунків.",
    database: "PostgreSQL через Prisma. Тут зберігаються акаунти й ролі, профіль на кожну категорію, послуги, розклади, записи, відгуки, підписки та рахунки. Фото лежать у Cloudinary.",
    flow: "Браузер запитує сторінку або надсилає запит на запис. Сервер Next.js перевіряє роль людини, читає чи зберігає дані в PostgreSQL через Prisma, надсилає сповіщення поштою й відповідає оновленою сторінкою.",
  },
  nb: {
    summary:
      "En markedsplass for skjønnhet og velvære for kvinner i Algerie, på fransk og arabisk. Kundene finner frisører, hudpleiere og fagfolk innen negler, øyenvipper, massasje og Botox i nærheten, sammenligner arbeid og priser og ber om en time. Fagfolkene styrer profiler, timeplan og bestillinger.",
    features: [
      "Seks skjønnhetskategorier med filtre for wilaya, tjeneste og avstand",
      "Profiler for fagfolk med tjenester, bilder og åpningstider",
      "Timeforespørsler: godta, avslå eller foreslå nytt tidspunkt",
      "Dashbord for kunder, fagfolk og administratorer",
    ],
    alts: ["Forsiden til Woman Cares", "Frisørkatalogen til Woman Cares med filtre", "Profilside for en fagperson på Woman Cares (demodata)", "Forsiden til Woman Cares på mobil"],
    frontend: "Laget med Next.js, React og Tailwind CSS, på fransk og arabisk (høyre mot venstre). Kundene søker etter kategori, wilaya og avstand, åpner en profil og ber om en time. Fagfolk og administratorer har hvert sitt dashbord.",
    backend: "Next.js-serveren sjekker hver innlogging og rolle, regner ut ledige tider, tar imot forespørsler uten dobbeltbooking, sender e-postvarsler og kjører vurderingen av profiler og faktureringen.",
    database: "PostgreSQL, brukt via Prisma. Her lagres kontoer og roller, én profil per kategori, tjenester, timeplaner, bestillinger, anmeldelser, abonnementer og fakturaer. Bildene ligger på Cloudinary.",
    flow: "Nettleseren ber om en side eller sender en bestilling. Next.js-serveren sjekker rollen til personen, leser eller lagrer data i PostgreSQL via Prisma, sender e-postvarsler og svarer med den oppdaterte siden.",
  },
  nl: {
    summary:
      "Een marktplaats voor schoonheid en verzorging voor vrouwen in Algerije, in het Frans en Arabisch. Klanten vinden kappers, schoonheidsspecialisten en professionals voor nagels, wimpers, massage en Botox bij hen in de buurt, vergelijken werk en prijzen en vragen een afspraak aan. Professionals beheren hun profielen, agenda en boekingen.",
    features: [
      "Zes schoonheidscategorieën met filters op wilaya, dienst en afstand",
      "Profielen van professionals met diensten, foto's en openingstijden",
      "Afspraakaanvragen: accepteren, weigeren of een ander tijdstip voorstellen",
      "Dashboards voor klanten, professionals en beheerders",
    ],
    alts: ["Startpagina van Woman Cares", "Kapperscatalogus van Woman Cares met filters", "Profielpagina van een professional op Woman Cares (demogegevens)", "Startpagina van Woman Cares op een telefoon"],
    frontend: "Gebouwd met Next.js, React en Tailwind CSS, in het Frans en Arabisch (van rechts naar links). Klanten zoeken op categorie, wilaya en afstand, openen een profiel en vragen een afspraak aan. Professionals en beheerders hebben elk hun eigen dashboard.",
    backend: "De Next.js-server controleert elke login en rol, berekent de vrije tijden, neemt aanvragen aan zonder dubbele boekingen, stuurt de e-mailmeldingen en doet de beoordeling van profielen en de facturatie.",
    database: "PostgreSQL, gebruikt via Prisma. Hierin staan accounts en rollen, één profiel per categorie, diensten, agenda's, boekingen, reviews, abonnementen en facturen. De foto's staan op Cloudinary.",
    flow: "De browser vraagt een pagina op of stuurt een boekingsaanvraag. De Next.js-server controleert de rol van de persoon, leest of bewaart de gegevens in PostgreSQL via Prisma, stuurt de e-mailmeldingen en antwoordt met de bijgewerkte pagina.",
  },
};
