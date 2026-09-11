import {
  CommonLabelData,
  PrintOptions,
  PrintResult,
  PrinterBrand,
  PrintingProtocol,
} from "../types";

export abstract class PrinterAdapter {
  abstract readonly brand: PrinterBrand;
  abstract readonly defaultProtocol: PrintingProtocol;
  abstract readonly description: string;

  /**
   * Dispatches the print job according to the printer brand and environment.
   */
  abstract print(
    data: CommonLabelData,
    options?: PrintOptions,
  ): Promise<PrintResult>;

  /**
   * Generates native command language (ZPL, ESC/POS, ePOS XML, etc.)
   * when supported by the printer brand.
   */
  abstract generateRawCommands(data: CommonLabelData): string;

  /**
   * Returns formatted width string for CSS/print styles (e.g. "64mm", "2in")
   */
  public getWidthCss(data: CommonLabelData): string {
    return data.unit === "inch"
      ? `${data.labelWidth}in`
      : `${data.labelWidth}mm`;
  }

  /**
   * Returns formatted height string for CSS/print styles (e.g. "19mm", "1in")
   */
  public getHeightCss(data: CommonLabelData): string {
    return data.unit === "inch"
      ? `${data.labelHeight}in`
      : `${data.labelHeight}mm`;
  }

  /**
   * Converts dimensions to dots at a given DPI (default 203 DPI for thermal)
   */
  protected toDots(value: number, unit: "mm" | "inch", dpi = 203): number {
    if (unit === "inch") {
      return Math.round(value * dpi);
    }
    // 1 inch = 25.4 mm
    return Math.round((value / 25.4) * dpi);
  }
}
