import tradeInCatalogRaw from "../../inventory/data/tradeInCatalog.json";
import { TradeInDevice, searchTradeInDevices } from "./tradeInSearch";

const catalog: TradeInDevice[] =
  (tradeInCatalogRaw as { items?: TradeInDevice[] }).items ||
  (tradeInCatalogRaw as unknown as TradeInDevice[]);

describe("Trade-in catalog prices and search accuracy", () => {
  test("every catalog item has positive, monotonic A >= B >= C prices", () => {
    expect(catalog.length).toBeGreaterThan(8000);
    for (const item of catalog) {
      expect(item.grades.A.price).toBeGreaterThan(0);
      expect(item.grades.B.price).toBeGreaterThan(0);
      expect(item.grades.C.price).toBeGreaterThan(0);
      expect(item.grades.A.price).toBeGreaterThanOrEqual(item.grades.B.price);
      expect(item.grades.B.price).toBeGreaterThanOrEqual(item.grades.C.price);
    }
  });

  test("iPhone 16 Pro Max 256GB, iPhone Duo, iPhone 18 Pro Max, iPhone 17 Pro Max have realistic CeX 95% prices", () => {
    const p16pm = searchTradeInDevices(catalog, "iphone 16 pro max 256", 5);
    expect(p16pm.length).toBeGreaterThan(0);
    expect(p16pm[0].deviceName).toBe("Apple iPhone 16 Pro Max");
    expect(p16pm[0].modelNumber).toBe("Model A3296");
    expect(p16pm[0].grades.A.price).toBe(433);
    expect(p16pm[0].grades.B.price).toBe(380);
    expect(p16pm[0].grades.C.price).toBe(325);

    const duo = searchTradeInDevices(catalog, "apple duo", 10);
    expect(duo.length).toBeGreaterThan(0);
    expect(duo[0].deviceName).toBe("Apple iPhone Duo");
    expect(duo[0].modelNumber).toBe("Model A3720");
    expect(duo[0].grades.A.price).toBeGreaterThanOrEqual(1000);

    const p18pm = searchTradeInDevices(catalog, "iphone 18 pro max 256", 5);
    expect(p18pm[0].deviceName).toBe("Apple iPhone 18 Pro Max");
    expect(p18pm[0].grades.A.price).toBe(748);

    const p17pm = searchTradeInDevices(catalog, "iphone 17 pro max 256", 5);
    expect(p17pm[0].deviceName).toBe("Apple iPhone 17 Pro Max");
    expect(p17pm[0].grades.A.price).toBe(539);
  });

  test("searching specific iPhone models never returns unrelated models matched by EAN or storage digits", () => {
    const r15 = searchTradeInDevices(catalog, "iphone 15", 10);
    expect(r15.length).toBeGreaterThan(0);
    expect(r15[0].deviceName).toBe("Apple iPhone 15");
    expect(r15.every((d) => d.deviceName.includes("iPhone 15"))).toBe(true);

    const r15pro = searchTradeInDevices(catalog, "iphone 15 pro", 10);
    expect(r15pro.length).toBeGreaterThan(0);
    expect(r15pro[0].deviceName).toBe("Apple iPhone 15 Pro");
    expect(r15pro.every((d) => d.deviceName.includes("Pro"))).toBe(true);

    const r12 = searchTradeInDevices(catalog, "iphone 12", 10);
    expect(r12.length).toBeGreaterThan(0);
    expect(r12[0].deviceName).toBe("Apple iPhone 12");
    expect(r12.every((d) => d.deviceName.includes("iPhone 12"))).toBe(true);

    const r5 = searchTradeInDevices(catalog, "iphone 5", 10);
    expect(r5.length).toBeGreaterThan(0);
    expect(r5[0].deviceName).toBe("Apple iPhone 5");
    expect(r5.some((d) => d.deviceName.includes("15"))).toBe(false);
  });

  test("quick-chip and multi-category queries return exact matching models", () => {
    const ipadPro = searchTradeInDevices(catalog, "iPad Pro", 10);
    expect(ipadPro.length).toBeGreaterThan(0);
    expect(ipadPro.every((d) => d.deviceName.includes("iPad Pro"))).toBe(true);

    const s24 = searchTradeInDevices(catalog, "Samsung S24", 10);
    expect(s24.length).toBeGreaterThan(0);
    expect(s24[0].deviceName).toBe("Samsung Galaxy S24");

    const mbp = searchTradeInDevices(catalog, "MacBook Pro", 10);
    expect(mbp.length).toBeGreaterThan(0);
    expect(mbp.every((d) => d.deviceName.includes("MacBook Pro"))).toBe(true);

    const ps5 = searchTradeInDevices(catalog, "ps5", 10);
    expect(ps5.length).toBeGreaterThan(0);
    expect(ps5.every((d) => d.deviceName.includes("PlayStation 5"))).toBe(true);

    const w10 = searchTradeInDevices(catalog, "watch series 10", 10);
    expect(w10.length).toBeGreaterThan(0);
    expect(w10.every((d) => d.deviceName.includes("Series 10"))).toBe(true);
  });

  test("barcode scan query matches exact UPC/EAN", () => {
    const hit = searchTradeInDevices(catalog, "195951406206", 5);
    expect(hit.length).toBeGreaterThan(0);
    expect(hit[0].deviceName).toBe("Apple iPhone Duo");
  });
});
