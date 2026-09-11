import {
  CommonLabelData,
  PrintOptions,
  PrintResult,
  PrinterBrand,
  PrintingProtocol,
} from "../types";
import { PrinterAdapter } from "./PrinterAdapter";

export class EpsonPrinterAdapter extends PrinterAdapter {
  readonly brand: PrinterBrand = "Epson";
  readonly defaultProtocol: PrintingProtocol = "epos";
  readonly description =
    "Epson Label & POS Printers (ePOS-Print XML, ESC/POS & ColorWorks Support)";

  async print(
    data: CommonLabelData,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    const rawCommands = this.generateRawCommands(data);
    const model = data.template.printer_model || "Epson Universal";

    try {
      if (options?.triggerBrowserPrint) {
        options.triggerBrowserPrint();
        return {
          success: true,
          protocol: data.template.printing_protocol,
          message: `Label sent to Epson ${model} (${this.getWidthCss(data)} x ${this.getHeightCss(data)})`,
          rawOutput: rawCommands,
        };
      }

      window.print();
      return {
        success: true,
        protocol: data.template.printing_protocol,
        message: `Triggered system print dialog for Epson ${model}`,
        rawOutput: rawCommands,
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to dispatch print job to Epson printer";
      return {
        success: false,
        protocol: data.template.printing_protocol,
        message: errMsg,
        rawOutput: rawCommands,
      };
    }
  }

  /**
   * Dispatches command generation to the appropriate Epson model/protocol generator.
   */
  generateRawCommands(data: CommonLabelData): string {
    const protocol = data.template.printing_protocol;
    const model = data.template.printer_model?.toLowerCase() || "";

    if (model.includes("colorworks")) {
      return this.generateColorWorksCommands(data);
    }

    if (protocol === "esc_pos" || model.includes("t88")) {
      return this.generateEscPosCommands(data);
    }

    // Default for TM-L90 & ePOS networked printers
    return this.generateEposXml(data);
  }

  /**
   * Generates official Epson ePOS-Print XML for networked TM-L90 / TM-T series
   */
  private generateEposXml(data: CommonLabelData): string {
    const isQR = data.barcodeFormat === "QR Code";

    return `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    <epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
      <text font="font_a" width="1" height="1" smooth="true" />
      ${
        data.fields.price && data.price !== undefined
          ? `<text width="2" height="2" em="true">${data.currencySymbol || "£"}${data.price.toFixed(2)}&#10;</text>`
          : ""
      }
      ${
        data.fields.itemName
          ? `<text width="1" height="1">${this.escapeXml(data.itemName.slice(0, 32))}&#10;</text>`
          : ""
      }
      ${
        data.fields.variationName && data.variationName
          ? `<text width="1" height="1">${this.escapeXml(data.variationName)}&#10;</text>`
          : ""
      }
      ${
        data.fields.sku && data.sku
          ? `<text width="1" height="1">SKU: ${this.escapeXml(data.sku)}&#10;</text>`
          : ""
      }
      <feed line="1" />
      ${
        isQR
          ? `<symbol type="qrcode_model_2" level="level_m" width="4" height="4">${this.escapeXml(data.barcode)}</symbol>`
          : `<barcode type="${this.mapToEposBarcodeType(data.barcodeFormat)}" width="2" height="48" hri="below">${this.escapeXml(data.barcode)}</barcode>`
      }
      <feed line="2" />
      <cut type="feed" />
    </epos-print>
  </s:Body>
</s:Envelope>`;
  }

  /**
   * Generates ESC/POS direct binary-style text commands for receipt/label hybrid printers
   */
  private generateEscPosCommands(data: CommonLabelData): string {
    return [
      `[ESC/POS Command Stream - Model: ${data.template.printer_model || "TM Series"}]`,
      `1B 40 (Initialize)`,
      `1B 61 01 (Center Align)`,
      data.fields.price && data.price !== undefined
        ? `1D 21 11 (Double Width/Height) "${data.currencySymbol || "£"}${data.price.toFixed(2)}" 0A`
        : "",
      data.fields.itemName
        ? `1D 21 00 (Normal Text) "${data.itemName.slice(0, 30)}" 0A`
        : "",
      data.barcodeFormat === "QR Code"
        ? `1D 28 6B (Print QR Code: "${data.barcode}")`
        : `1D 6B (Print Barcode ${data.barcodeFormat}: "${data.barcode}")`,
      `1D 56 41 00 (Feed and Cut)`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  /**
   * Generates high-resolution raster specification for Epson ColorWorks
   */
  private generateColorWorksCommands(data: CommonLabelData): string {
    return [
      `[Epson ColorWorks ESC/Label Command Header]`,
      `DEVICE=EPSON_${data.template.printer_model?.replace(/[^a-zA-Z0-9]/g, "_") || "CW"}`,
      `MEDIA_WIDTH=${data.labelWidth}${data.unit}`,
      `MEDIA_HEIGHT=${data.labelHeight}${data.unit}`,
      `PRINT_QUALITY=HIGH`,
      `COLOR_MODE=FULL_COLOR`,
      `ITEM_TITLE="${data.fields.itemName ? data.itemName : ""}"`,
      `PRICE="${data.fields.price && data.price !== undefined ? `${data.currencySymbol || "£"}${data.price.toFixed(2)}` : ""}"`,
      `BARCODE_SYMBOLOGY=${data.barcodeFormat}`,
      `BARCODE_PAYLOAD="${data.barcode}"`,
    ].join("\n");
  }

  private mapToEposBarcodeType(format: string): string {
    switch (format) {
      case "EAN-13":
        return "ean13";
      case "EAN-8":
        return "ean8";
      case "UPC-A":
        return "upca";
      default:
        return "code128";
    }
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  }
}
