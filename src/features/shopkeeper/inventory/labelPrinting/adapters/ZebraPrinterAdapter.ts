import {
  CommonLabelData,
  PrintOptions,
  PrintResult,
  PrinterBrand,
  PrintingProtocol,
} from "../types";
import { PrinterAdapter } from "./PrinterAdapter";

export class ZebraPrinterAdapter extends PrinterAdapter {
  readonly brand: PrinterBrand = "Zebra";
  readonly defaultProtocol: PrintingProtocol = "zpl";
  readonly description =
    "Zebra Thermal Printers (ZPL II Code Generator & High-DPI Browser Print)";

  async print(
    data: CommonLabelData,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    const zplCode = this.generateRawCommands(data);

    try {
      if (options?.triggerBrowserPrint) {
        options.triggerBrowserPrint();
        return {
          success: true,
          protocol: "zpl",
          message: `Label dispatched to Zebra printer (${this.getWidthCss(data)} x ${this.getHeightCss(data)})`,
          rawOutput: zplCode,
        };
      }

      window.print();
      return {
        success: true,
        protocol: "zpl",
        message: "Triggered system print dialog for Zebra printer",
        rawOutput: zplCode,
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to dispatch print job to Zebra printer";
      return {
        success: false,
        protocol: "zpl",
        message: errMsg,
        rawOutput: zplCode,
      };
    }
  }

  /**
   * Generates standard ZPL II thermal printer code
   */
  generateRawCommands(data: CommonLabelData): string {
    const dpi = 203; // Standard 8 dots/mm Zebra desktop printhead
    const widthDots = this.toDots(data.labelWidth, data.unit, dpi);
    const heightDots = this.toDots(data.labelHeight, data.unit, dpi);

    const lines: string[] = [
      "^XA",
      `^PW${widthDots}`,
      `^LL${heightDots}`,
      "^LH0,0",
      "^PR3", // Print speed 3 inches/sec
      "^MD15", // Darkness setting
    ];

    let yOffset = 24;

    // 1. Price
    if (data.fields.price && data.price !== undefined) {
      const formattedPrice = `${data.currencySymbol || "£"}${data.price.toFixed(2)}`;
      lines.push(`^FO30,${yOffset}^A0N,36,36^FD${formattedPrice}^FS`);
      yOffset += 44;
    }

    // 2. Item Name & Variation
    if (data.fields.itemName || data.fields.variationName) {
      const parts = [
        data.fields.itemName ? data.itemName : "",
        data.fields.variationName ? data.variationName : "",
      ].filter(Boolean);
      const title = parts.join(" ");
      if (title) {
        const truncated =
          title.length > 38 ? `${title.slice(0, 35)}...` : title;
        lines.push(`^FO30,${yOffset}^A0N,24,24^FD${truncated}^FS`);
        yOffset += 32;
      }
    }

    // 3. SKU / GTIN text
    const metaParts = [];
    if (data.fields.sku && data.sku) metaParts.push(`SKU: ${data.sku}`);
    if (data.fields.gtin && data.gtin) metaParts.push(`GTIN: ${data.gtin}`);
    if (data.fields.unitAbbreviation && data.unitAbbreviation) {
      metaParts.push(data.unitAbbreviation);
    }
    if (metaParts.length > 0) {
      lines.push(`^FO30,${yOffset}^A0N,18,18^FD${metaParts.join(" | ")}^FS`);
      yOffset += 26;
    }

    // 4. Barcode rendering in ZPL
    const barcodeHeight = Math.max(30, Math.min(heightDots - yOffset - 30, 90));

    if (data.barcodeFormat === "QR Code") {
      // ^BQ: QR Code Model 2, magnification 3
      lines.push(`^FO30,${yOffset}^BQN,2,4^FDQA,${data.barcode}^FS`);
    } else if (data.barcodeFormat === "EAN-13") {
      lines.push(
        `^FO30,${yOffset}^BEN,${barcodeHeight},Y,N^FD${data.barcode}^FS`,
      );
    } else if (data.barcodeFormat === "EAN-8") {
      lines.push(
        `^FO30,${yOffset}^B8N,${barcodeHeight},Y,N^FD${data.barcode}^FS`,
      );
    } else if (data.barcodeFormat === "UPC-A") {
      lines.push(
        `^FO30,${yOffset}^BUN,${barcodeHeight},Y,N^FD${data.barcode}^FS`,
      );
    } else {
      // Default: Code 128
      lines.push(
        `^FO30,${yOffset}^BCN,${barcodeHeight},Y,N,N^FD${data.barcode}^FS`,
      );
    }

    lines.push("^XZ");
    return lines.join("\n");
  }
}
