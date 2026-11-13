export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  BDT: "৳",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  PKR: "₨",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  BRL: "R$",
  RUB: "₽",
  TRY: "₺",
  NGN: "₦",
  EGP: "E£",
  ZAR: "R",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  HKD: "HK$",
  MXN: "MX$",
  PHP: "₱",
  THB: "฿",
  IDR: "Rp",
  MYR: "RM",
  VND: "₫",
  AED: "د.إ",
  SAR: "﷼",
  QAR: "ر.ق",
  KWD: "د.ك",
  BHD: "BD",
  OMR: "ر.ع",
  ILS: "₪",
  PLN: "zł",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  CZK: "Kč",
  HUF: "Ft",
  CHF: "CHF",
  TWD: "NT$",
  NZD: "NZ$",
  LKR: "Rs",
  NPR: "Rs",
  GHS: "GH₵",
  KES: "KSh",
  TZS: "TSh",
  UGX: "USh",
  MAD: "MAD",
  DZD: "د.ج",
  TND: "د.ت",
  JOD: "JD",
  LBP: "L£",
  MMK: "K",
  LAK: "₭",
  KHR: "៛",
  BND: "B$",
  FJD: "FJ$",
  PGK: "K",
  MUR: "₨",
  MVR: "Rf",
  BTN: "Nu.",
  BWP: "P",
  SZL: "E",
  LSL: "L",
  NAD: "N$",
  WST: "WS$",
  TOP: "T$",
  VUV: "VT",
  XPF: "₣",
};

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRatesResponse {
  success: boolean;
  base: string;
  rates: Record<string, number>;
}

export const CURRENCY_LIST: CurrencyOption[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BD" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Rs" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨" },
  { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf" },
  { code: "BTN", name: "Bhutanese Ngultrum", symbol: "Nu." },
  { code: "BWP", name: "Botswana Pula", symbol: "P" },
  { code: "NAD", name: "Namibian Dollar", symbol: "N$" },
];

export function getCurrencySymbol(code?: string | null): string {
  const upper = (code || "GBP").toUpperCase();
  return CURRENCY_SYMBOLS[upper] || upper;
}

export function normalizeCurrencyCode(code?: string | null): string {
  return (code || "GBP").trim().toUpperCase();
}

export function formatCurrency(
  amount: number,
  currencyCode: string = "GBP",
): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: (currencyCode || "GBP").toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export function getCurrencyByCode(
  code?: string | null,
): CurrencyOption | undefined {
  return CURRENCY_LIST.find((c) => c.code === (code || "GBP").toUpperCase());
}

export function getExchangeRate(
  rates: Record<string, number> | undefined,
  fromCurrency: string = "USD",
  toCurrency: string = "USD",
): number {
  const from = normalizeCurrencyCode(fromCurrency);
  const to = normalizeCurrencyCode(toCurrency);

  if (from === to) {
    return 1;
  }

  if (from === "USD") {
    const directRate = Number(rates?.[to]);
    return Number.isFinite(directRate) && directRate > 0 ? directRate : 1;
  }

  if (to === "USD") {
    const fromRate = Number(rates?.[from]);
    return Number.isFinite(fromRate) && fromRate > 0 ? 1 / fromRate : 1;
  }

  const usdToFrom = Number(rates?.[from]);
  const usdToTo = Number(rates?.[to]);

  if (!Number.isFinite(usdToFrom) || usdToFrom <= 0) {
    return 1;
  }

  if (!Number.isFinite(usdToTo) || usdToTo <= 0) {
    return 1;
  }

  return usdToTo / usdToFrom;
}

export function convertCurrencyAmount(
  amount: number,
  rates: Record<string, number> | undefined,
  fromCurrency: string = "USD",
  toCurrency: string = "USD",
): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  const rate = getExchangeRate(rates, fromCurrency, toCurrency);
  return amount * rate;
}

export async function fetchExchangeRates(
  baseCurrency: string = "USD",
): Promise<ExchangeRatesResponse> {
  const base = normalizeCurrencyCode(baseCurrency);
  const response = await fetch(`/api/exchange-rates?base=${base}`);

  if (!response.ok) {
    throw new Error("Failed to fetch exchange rates");
  }

  return response.json();
}
