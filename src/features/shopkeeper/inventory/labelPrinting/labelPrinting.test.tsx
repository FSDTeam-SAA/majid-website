import React from "react";
import { render } from "@testing-library/react";
import {
  PRINTER_BRANDS,
  LABEL_TEMPLATES,
  getTemplatesForBrand,
  getPrinterAdapter,
  normalizeBarcodeValue,
  LabelPreview,
  CommonLabelData,
  ZebraPrinterAdapter,
  EpsonPrinterAdapter,
  DymoPrinterAdapter,
  BrotherPrinterAdapter,
  RolloPrinterAdapter,
  GenericPrinterAdapter,
} from "./index";

describe("Label Printing Architecture & Adapters", () => {
  const sampleLabelData: CommonLabelData = {
    itemName: "iPhone 15 Pro Case",
    sku: "SKU-990123",
    gtin: "190199123456",
    variationName: "256GB Black",
    price: 49.99,
    unitAbbreviation: "pcs",
    barcode: "356782084912443",
    barcodeFormat: "CODE128",
    labelWidth: 64,
    labelHeight: 19,
    unit: "mm",
    location: "Mobile Kit Distribution",
    currencySymbol: "£",
    fields: {
      sku: true,
      gtin: true,
      variationName: true,
      price: true,
      itemName: true,
      unitAbbreviation: true,
    },
    template: LABEL_TEMPLATES[0], // DYMO 1933085
  };

  test("1. All required printer brands are supported in the registry", () => {
    expect(PRINTER_BRANDS).toContain("DYMO");
    expect(PRINTER_BRANDS).toContain("Zebra");
    expect(PRINTER_BRANDS).toContain("Brother");
    expect(PRINTER_BRANDS).toContain("Rollo");
    expect(PRINTER_BRANDS).toContain("Epson");
    expect(PRINTER_BRANDS).toContain("Generic");
  });

  test("2. DYMO adapter preserves existing label formats and generates XML", async () => {
    const dymoTemplates = getTemplatesForBrand("DYMO");
    const dymoIds = dymoTemplates.map((t) => t.label_name);

    expect(dymoIds).toContain("DYMO 1933085 - LW Durable 19 mm x 64 mm");
    expect(dymoIds).toContain("DYMO 30336 - 1 x 2-1/8 in");

    const adapter = getPrinterAdapter("DYMO");
    expect(adapter).toBeInstanceOf(DymoPrinterAdapter);
    expect(adapter.brand).toBe("DYMO");

    const xml = adapter.generateRawCommands(sampleLabelData);
    expect(xml).toContain("<DieCutLabel");
    expect(xml).toContain("iPhone 15 Pro Case");
    expect(xml).toContain("356782084912443");

    let printTriggered = false;
    const result = await adapter.print(sampleLabelData, {
      triggerBrowserPrint: () => {
        printTriggered = true;
      },
    });

    expect(result.success).toBe(true);
    expect(printTriggered).toBe(true);
  });

  test("3. Zebra adapter generates valid ZPL II with custom and standard dimensions", async () => {
    const zebraTemplates = getTemplatesForBrand("Zebra");
    expect(zebraTemplates.some((t) => t.label_name.includes("2 x 1"))).toBe(
      true,
    );
    expect(
      zebraTemplates.some((t) => t.label_name.includes("2.25 x 1.25")),
    ).toBe(true);
    expect(zebraTemplates.some((t) => t.label_name.includes("4 x 6"))).toBe(
      true,
    );
    expect(zebraTemplates.some((t) => t.isCustom)).toBe(true);

    const adapter = getPrinterAdapter("Zebra");
    expect(adapter).toBeInstanceOf(ZebraPrinterAdapter);

    const zebraData: CommonLabelData = {
      ...sampleLabelData,
      labelWidth: 2,
      labelHeight: 1,
      unit: "inch",
      barcodeFormat: "CODE128",
      template: zebraTemplates[0],
    };

    const zpl = adapter.generateRawCommands(zebraData);
    expect(zpl).toContain("^XA");
    expect(zpl).toContain("^PW406"); // 2 inches at 203 DPI = 406 dots
    expect(zpl).toContain("^LL203"); // 1 inch at 203 DPI = 203 dots
    expect(zpl).toContain("^BCN"); // Code 128
    expect(zpl).toContain("^XZ");

    // Test QR Code ZPL generation
    const zplQR = adapter.generateRawCommands({
      ...zebraData,
      barcodeFormat: "QR Code",
    });
    expect(zplQR).toContain("^BQN");
  });

  test("4. Brother adapter supports DK formats and generates command sequence", async () => {
    const brotherTemplates = getTemplatesForBrand("Brother");
    expect(brotherTemplates.some((t) => t.label_name.includes("DK-1201"))).toBe(
      true,
    );
    expect(brotherTemplates.some((t) => t.label_name.includes("DK-1202"))).toBe(
      true,
    );
    expect(brotherTemplates.some((t) => t.label_name.includes("DK-1204"))).toBe(
      true,
    );

    const adapter = getPrinterAdapter("Brother");
    expect(adapter).toBeInstanceOf(BrotherPrinterAdapter);

    const commands = adapter.generateRawCommands({
      ...sampleLabelData,
      template: brotherTemplates[0],
    });
    expect(commands).toContain("ESC/P");
    expect(commands).toContain("BARCODE_DATA=356782084912443");
  });

  test("5. Rollo adapter supports standard thermal sizes and generates TSPL", async () => {
    const rolloTemplates = getTemplatesForBrand("Rollo");
    expect(rolloTemplates.some((t) => t.label_name.includes("4 x 6"))).toBe(
      true,
    );
    expect(rolloTemplates.some((t) => t.label_name.includes("2 x 1"))).toBe(
      true,
    );

    const adapter = getPrinterAdapter("Rollo");
    expect(adapter).toBeInstanceOf(RolloPrinterAdapter);

    const commands = adapter.generateRawCommands({
      ...sampleLabelData,
      labelWidth: 4,
      labelHeight: 6,
      unit: "inch",
    });
    expect(commands).toContain("SIZE 4 , 6");
    expect(commands).toContain("PRINT 1,1");
  });

  test("6. Epson adapter is modular and differentiates TM ePOS XML vs ColorWorks", async () => {
    const epsonTemplates = getTemplatesForBrand("Epson");
    const tmTemplate = epsonTemplates.find((t) =>
      t.printer_model?.includes("TM-L90"),
    )!;
    const cwTemplate = epsonTemplates.find((t) =>
      t.printer_model?.includes("ColorWorks"),
    )!;
    const t88Template = epsonTemplates.find((t) =>
      t.printer_model?.includes("TM-T88"),
    )!;

    expect(tmTemplate).toBeDefined();
    expect(cwTemplate).toBeDefined();
    expect(t88Template).toBeDefined();

    const adapter = getPrinterAdapter("Epson");
    expect(adapter).toBeInstanceOf(EpsonPrinterAdapter);

    // TM-L90 ePOS XML
    const eposXml = adapter.generateRawCommands({
      ...sampleLabelData,
      template: tmTemplate,
    });
    expect(eposXml).toContain("epos-print");
    expect(eposXml).toContain("<barcode");

    // ColorWorks ESC/Label
    const cwCommands = adapter.generateRawCommands({
      ...sampleLabelData,
      template: cwTemplate,
    });
    expect(cwCommands).toContain("Epson ColorWorks");

    // TM-T88 ESC/POS
    const escPos = adapter.generateRawCommands({
      ...sampleLabelData,
      template: t88Template,
    });
    expect(escPos).toContain("ESC/POS Command Stream");
  });

  test("7. Generic adapter provides standard OS/browser printing", async () => {
    const adapter = getPrinterAdapter("Generic");
    expect(adapter).toBeInstanceOf(GenericPrinterAdapter);

    let printCalled = false;
    const result = await adapter.print(sampleLabelData, {
      triggerBrowserPrint: () => {
        printCalled = true;
      },
    });

    expect(result.success).toBe(true);
    expect(printCalled).toBe(true);
  });

  test("8. Barcode normalization handles EAN-13, EAN-8, UPC-A, and alphanumeric fallbacks", () => {
    // EAN-13 with 12 digits calculates 13th check digit
    const ean13 = normalizeBarcodeValue("123456789012", "EAN-13");
    expect(ean13.effectiveFormat).toBe("EAN-13");
    expect(ean13.value.length).toBe(13);

    // EAN-8 with 7 digits calculates 8th check digit
    const ean8 = normalizeBarcodeValue("1234567", "EAN-8");
    expect(ean8.effectiveFormat).toBe("EAN-8");
    expect(ean8.value.length).toBe(8);

    // UPC-A with 11 digits calculates 12th check digit
    const upca = normalizeBarcodeValue("01234567890", "UPC-A");
    expect(upca.effectiveFormat).toBe("UPC-A");
    expect(upca.value.length).toBe(12);

    // Alphanumeric string with numeric symbology safely falls back to CODE128
    const fallback = normalizeBarcodeValue("IPHONE-CASE-BLUE", "EAN-13");
    expect(fallback.effectiveFormat).toBe("CODE128");
    expect(fallback.value).toBe("IPHONE-CASE-BLUE");

    // QR Code accepts any string verbatim
    const qr = normalizeBarcodeValue(
      "https://imoscan.com/item/10042",
      "QR Code",
    );
    expect(qr.effectiveFormat).toBe("QR Code");
    expect(qr.value).toBe("https://imoscan.com/item/10042");
  });

  test("9. LabelPreview renders selected fields and barcode cleanly", () => {
    const { container, getByText } = render(
      <LabelPreview data={sampleLabelData} />,
    );

    expect(getByText("iPhone 15 Pro Case")).toBeInTheDocument();
    expect(getByText("256GB Black")).toBeInTheDocument();
    expect(getByText("£49.99")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument(); // Barcode SVG
  });
});
