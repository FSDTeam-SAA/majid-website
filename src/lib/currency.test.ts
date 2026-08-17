import {
  formatCurrency,
  getCurrencySymbol,
  normalizeCurrencyCode,
  getExchangeRate,
  convertCurrencyAmount,
} from "./currency";

describe("Currency utilities", () => {
  describe("normalizeCurrencyCode", () => {
    it("normalizes currency codes properly", () => {
      expect(normalizeCurrencyCode("usd")).toBe("USD");
      expect(normalizeCurrencyCode(" gbp ")).toBe("GBP");
      expect(normalizeCurrencyCode("")).toBe("USD");
      expect(normalizeCurrencyCode(null)).toBe("USD");
    });
  });

  describe("getCurrencySymbol", () => {
    it("returns correct symbols for common currencies", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
      expect(getCurrencySymbol("GBP")).toBe("£");
      expect(getCurrencySymbol("EUR")).toBe("€");
      expect(getCurrencySymbol("BDT")).toBe("৳");
      expect(getCurrencySymbol("INR")).toBe("₹");
    });
  });

  describe("formatCurrency", () => {
    it("formats amounts in specified currency without exchange conversion", () => {
      const formattedUSD = formatCurrency(960, "USD");
      expect(formattedUSD).toContain("960.00");
      expect(formattedUSD).toContain("$");

      const formattedGBP = formatCurrency(88, "GBP");
      expect(formattedGBP).toContain("88.00");
      expect(formattedGBP).toContain("£");

      const formattedEUR = formatCurrency(120, "EUR");
      expect(formattedEUR).toContain("120.00");
      expect(formattedEUR).toContain("€");
    });

    it("handles zero and decimal amounts correctly", () => {
      expect(formatCurrency(0, "USD")).toContain("0.00");
      expect(formatCurrency(88.5, "GBP")).toContain("88.50");
    });
  });

  describe("convertCurrencyAmount & getExchangeRate", () => {
    const mockRates: Record<string, number> = {
      USD: 1,
      GBP: 0.8,
      EUR: 0.9,
      BDT: 110,
    };

    it("returns 1 for same currency", () => {
      expect(getExchangeRate(mockRates, "USD", "USD")).toBe(1);
      expect(getExchangeRate(mockRates, "GBP", "GBP")).toBe(1);
      expect(convertCurrencyAmount(88, mockRates, "GBP", "GBP")).toBe(88);
    });

    it("converts USD to target currency accurately", () => {
      expect(convertCurrencyAmount(100, mockRates, "USD", "GBP")).toBe(80);
      expect(convertCurrencyAmount(100, mockRates, "USD", "BDT")).toBe(11000);
    });

    it("converts from non-USD to USD accurately", () => {
      expect(convertCurrencyAmount(80, mockRates, "GBP", "USD")).toBe(100);
    });

    it("converts between two non-USD currencies accurately", () => {
      // 80 GBP -> 100 USD -> 90 EUR
      expect(convertCurrencyAmount(80, mockRates, "GBP", "EUR")).toBe(90);
    });
  });
});
