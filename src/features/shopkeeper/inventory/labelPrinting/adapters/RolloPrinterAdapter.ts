import {
  CommonLabelData,
  PrintOptions,
  PrintResult,
  PrinterBrand,
  PrintingProtocol,
} from "../types";
import { PrinterAdapter } from "./PrinterAdapter";

export class RolloPrinterAdapter extends PrinterAdapter {
  readonly brand: PrinterBrand = "Rollo";
  readonly defaultProtocol: PrintingProtocol = "browser";
  readonly description =
    "Rollo High-Speed Thermal Label Printers (Standard & Shipping Sizes)";

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
          protocol: "browser",
          message: `Label sent to Rollo thermal printer (${this.getWidthCss(data)} x ${this.getHeightCss(data)})`,
          rawOutput: rawCommands,
        };
      }

      window.print();
      return {
        success: true,
        protocol: "browser",
        message: "Triggered system print dialog for Rollo thermal printer",
        rawOutput: rawCommands,
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to dispatch print job to Rollo printer";
      return {
        success: false,
        protocol: "browser",
        message: errMsg,
        rawOutput: rawCommands,
      };
    }
  }

  /**
   * Generates standard TSPL / EPL thermal commands for Rollo direct thermal engine
   */
  generateRawCommands(data: CommonLabelData): string {
    return [
      `SIZE ${data.labelWidth} ${data.unit === "inch" ? "" : "mm"}, ${data.labelHeight} ${data.unit === "inch" ? "" : "mm"}`,
      `GAP 3 mm, 0 mm`,
      `DIRECTION 1`,
      `CLS`,
      data.fields.price && data.price !== undefined
        ? `TEXT 20,20,"3",0,1,1,"${data.currencySymbol || "£"}${data.price.toFixed(2)}"`
        : "",
      data.fields.itemName
        ? `TEXT 20,70,"2",0,1,1,"${data.itemName.slice(0, 30)}"`
        : "",
      data.barcodeFormat === "QR Code"
        ? `QRCODE 20,120,L,4,A,0,"${data.barcode}"`
        : `BARCODE 20,120,"128",50,1,0,2,2,"${data.barcode}"`,
      `PRINT 1,1`,
    ]
      .filter(Boolean)
      .join("\n");
  }
}
