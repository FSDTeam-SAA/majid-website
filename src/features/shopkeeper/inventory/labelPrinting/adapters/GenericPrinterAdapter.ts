import {
  CommonLabelData,
  PrintOptions,
  PrintResult,
  PrinterBrand,
  PrintingProtocol,
} from "../types";
import { PrinterAdapter } from "./PrinterAdapter";

export class GenericPrinterAdapter extends PrinterAdapter {
  readonly brand: PrinterBrand = "Generic";
  readonly defaultProtocol: PrintingProtocol = "generic";
  readonly description =
    "Standard OS / Browser Printer (Desktop Thermal, Inkjet, Laser or PDF)";

  async print(
    data: CommonLabelData,
    options?: PrintOptions,
  ): Promise<PrintResult> {
    try {
      if (options?.triggerBrowserPrint) {
        options.triggerBrowserPrint();
        return {
          success: true,
          protocol: "generic",
          message: `Label sent to system print dialog (${this.getWidthCss(data)} x ${this.getHeightCss(data)})`,
        };
      }

      window.print();
      return {
        success: true,
        protocol: "generic",
        message: "Triggered standard browser print dialog",
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Failed to trigger browser printing";
      return {
        success: false,
        protocol: "generic",
        message: errMsg,
      };
    }
  }

  generateRawCommands(data: CommonLabelData): string {
    return [
      `[Standard System Print Driver Specification]`,
      `Target Dimensions: ${this.getWidthCss(data)} x ${this.getHeightCss(data)}`,
      `Barcode Type: ${data.barcodeFormat}`,
      `Payload: ${data.barcode}`,
      `Item: ${data.itemName}`,
      `Price: ${data.currencySymbol || "£"}${data.price?.toFixed(2) || "0.00"}`,
      `Driver Protocol: Standard OS Graphics Subsystem (GDI / CUPS / AirPrint)`,
    ].join("\n");
  }
}
