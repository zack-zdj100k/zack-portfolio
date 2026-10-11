// Money helpers. Amounts are integer minor units (e.g. DZD centimes) + ISO-4217 code.

export function fractionDigits(currency: string): number {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

export function toMinor(major: number, currency: string): number {
  return Math.round(major * 10 ** fractionDigits(currency));
}

export function toMajor(minor: number, currency: string): number {
  return minor / 10 ** fractionDigits(currency);
}

/** "40,000 DZD" style, localized. Whole amounts drop the decimals. */
export function formatMoney(minor: number, currency: string, locale: string): string {
  const major = toMajor(minor, currency);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "code",
      maximumFractionDigits: Number.isInteger(major) ? 0 : 2,
    }).format(major);
  } catch {
    return `${major} ${currency}`;
  }
}

export function formatRange(min: number, max: number | null, currency: string, locale: string) {
  return max === null ? null : `${formatMoney(min, currency, locale)} - ${formatMoney(max, currency, locale)}`;
}
