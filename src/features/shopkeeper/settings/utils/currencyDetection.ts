export function shouldAutoDetectCurrency(currency?: string | null): boolean {
  const normalized = (currency ?? "").trim().toUpperCase();
  return !normalized;
}
