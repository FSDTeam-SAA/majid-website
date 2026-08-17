import { shouldAutoDetectCurrency } from "./currencyDetection";

describe("shouldAutoDetectCurrency", () => {
  it("returns true when the profile has no currency configured", () => {
    expect(shouldAutoDetectCurrency()).toBe(true);
    expect(shouldAutoDetectCurrency(null)).toBe(true);
    expect(shouldAutoDetectCurrency("")).toBe(true);
    expect(shouldAutoDetectCurrency("   ")).toBe(true);
  });

  it("returns false when a currency is already configured", () => {
    expect(shouldAutoDetectCurrency("USD")).toBe(false);
    expect(shouldAutoDetectCurrency(" usd ")).toBe(false);
    expect(shouldAutoDetectCurrency("EUR")).toBe(false);
    expect(shouldAutoDetectCurrency("gbp")).toBe(false);
    expect(shouldAutoDetectCurrency("BDT")).toBe(false);
  });
});
