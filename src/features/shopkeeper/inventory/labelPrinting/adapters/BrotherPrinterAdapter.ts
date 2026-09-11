import {
  CommonLabelData,
  PrintOptions,
  PrintResult,
  PrinterBrand,
  PrintingProtocol,
} from "../types";
import { PrinterAdapter } from "./PrinterAdapter";

export class BrotherPrinterAdapter extends PrinterAdapter {
  readonly brand: PrinterBrand = "Brother";
  readonly defaultProtocol: PrintingProtocol = "brother_raster";
  readonly description =
    "Brother QL Series (DK Die-Cut Labels, P-Touch Template & Browser Driver)";

  async print(
    data: CommonLabelData,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    const rawCommands = this.generateRawCommands(data);

    try {
      if (options?.triggerBrowserPrint) {
        options.triggerBrowserPrint();
        return {
          success: true,
          protocol: "brother_raster",
          message: `Label sent to Brother QL printer (${this.getWidthCss(data)} x ${this.getHeightCss(data)})`,
          rawOutput: rawCommands,
        };
      }

      window.print();
      return {
        success: true,
        protocol: "brother_raster",
        message: "Triggered system print dialog for Brother printer",
        rawOutput: rawCommands,
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to dispatch print job to Brother printer";
      return {
        success: false,
        protocol: "brother_raster",
        message: errMsg,
        rawOutput: rawCommands,
      };
    }
  }

  /**
   * Generates Brother ESC/P raster & P-Touch Template command string
   */
  generateRawCommands(data: CommonLabelData): string {
    const isQR = data.barcodeFormat === "QR Code";
    const templateId = data.template.id.toUpperCase();

    return [
      `[ESC/P P-Touch Command Sequence - ${templateId}]`,
      `ESC @ (Initialize)`,
      `ESC i a 00h (Select ESC/P mode)`,
      `ESC i z (Set media info: ${data.labelWidth}mm x ${data.labelHeight}mm DK Die-cut)`,
      `^TITLE=${data.fields.itemName ? data.itemName : ""}`,
      `^PRICE=${data.fields.price && data.price !== undefined ? `${data.currencySymbol || "£"}${data.price.toFixed(2)}` : ""}`,
      `^SKU=${data.fields.sku ? data.sku : ""}`,
      `^BARCODE_TYPE=${isQR ? "QR_CODE" : data.barcodeFormat}`,
      `^BARCODE_DATA=${data.barcode}`,
      `FF (Form Feed / Cut Label)`,
    ].join("\n");
  }
}
