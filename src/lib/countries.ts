// Country list for forms and market selectors, labelled in the visitor's language via Intl.

export const COUNTRY_CODES = [
  "DZ", "MA", "TN", "LY", "EG", "MR", "SA", "AE", "QA", "KW", "BH", "OM", "JO", "LB", "IQ", "PS", "SY", "YE",
  "FR", "BE", "CH", "LU", "DE", "AT", "NL", "IT", "ES", "PT", "GB", "IE", "NO", "SE", "DK", "FI", "IS", "PL",
  "CZ", "SK", "HU", "RO", "BG", "GR", "HR", "SI", "RS", "TR", "UA", "RU", "BY", "MD", "GE", "AZ", "AM", "KZ",
  "US", "CA", "MX", "CO", "BR", "AR", "CL", "PE", "VE", "EC", "BO", "UY", "PY", "CR", "PA", "DO", "GT", "CU",
  "SN", "CI", "ML", "NE", "BF", "CM", "NG", "GH", "KE", "ZA", "ET",
  "CN", "JP", "KR", "IN", "PK", "BD", "ID", "MY", "SG", "TH", "VN", "PH", "AU", "NZ",
] as const;

export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function sortedCountries(locale: string) {
  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) })).sort((a, b) =>
    a.name.localeCompare(b.name, locale),
  );
}
