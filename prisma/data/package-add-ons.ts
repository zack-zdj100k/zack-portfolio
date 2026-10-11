/**
 * Default "optional additions" per package type, from the owner's brief (extra pages, features,
 * integrations, custom design). Text only, never prices. The seed fills them in only where a package
 * translation has none; after that they are edited in Admin → Services & pricing.
 */
type Line = Record<string, string>;

const pages: Line = {
  en: "Extra pages", fr: "Pages supplémentaires", ar: "صفحات إضافية", it: "Pagine extra", tr: "Ek sayfalar", es: "Páginas extra",
  "pt-BR": "Páginas extras", ru: "Дополнительные страницы", uk: "Додаткові сторінки", nb: "Ekstra sider", nl: "Extra pagina's",
};
const features: Line = {
  en: "Extra features", fr: "Fonctionnalités supplémentaires", ar: "ميزات إضافية", it: "Funzioni extra", tr: "Ek özellikler", es: "Funciones extra",
  "pt-BR": "Funcionalidades extras", ru: "Дополнительные функции", uk: "Додаткові функції", nb: "Ekstra funksjoner", nl: "Extra functies",
};
const integrations: Line = {
  en: "Integrations (payment, delivery, other tools)", fr: "Intégrations (paiement, livraison, autres outils)", ar: "تكاملات (الدفع، التوصيل، أدوات أخرى)",
  it: "Integrazioni (pagamento, consegna, altri strumenti)", tr: "Entegrasyonlar (ödeme, teslimat, diğer araçlar)", es: "Integraciones (pago, envíos, otras herramientas)",
  "pt-BR": "Integrações (pagamento, entrega, outras ferramentas)", ru: "Интеграции (оплата, доставка, другие сервисы)", uk: "Інтеграції (оплата, доставка, інші сервіси)",
  nb: "Integrasjoner (betaling, levering, andre verktøy)", nl: "Koppelingen (betaling, bezorging, andere tools)",
};
const design: Line = {
  en: "Custom design", fr: "Design sur mesure", ar: "تصميم مخصّص", it: "Design su misura", tr: "Özel tasarım", es: "Diseño a medida",
  "pt-BR": "Design personalizado", ru: "Индивидуальный дизайн", uk: "Індивідуальний дизайн", nb: "Skreddersydd design", nl: "Ontwerp op maat",
};

/** Additions for a package of this category, in this language (English when a language is missing). */
export function defaultAddOns(category: string | null, locale: string): string[] {
  const lines = category === "WEBSITE" ? [pages, features, integrations, design] : [features, integrations, design];
  return lines.map((l) => l[locale] ?? l.en);
}
