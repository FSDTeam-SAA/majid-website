import { PrinterBrand } from "../types";
import { PrinterAdapter } from "./PrinterAdapter";
import { DymoPrinterAdapter } from "./DymoPrinterAdapter";
import { ZebraPrinterAdapter } from "./ZebraPrinterAdapter";
import { BrotherPrinterAdapter } from "./BrotherPrinterAdapter";
import { RolloPrinterAdapter } from "./RolloPrinterAdapter";
import { EpsonPrinterAdapter } from "./EpsonPrinterAdapter";
import { GenericPrinterAdapter } from "./GenericPrinterAdapter";

export * from "./PrinterAdapter";
export * from "./DymoPrinterAdapter";
export * from "./ZebraPrinterAdapter";
export * from "./BrotherPrinterAdapter";
export * from "./RolloPrinterAdapter";
export * from "./EpsonPrinterAdapter";
export * from "./GenericPrinterAdapter";

const adapterCache: Partial<Record<PrinterBrand, PrinterAdapter>> = {};

/**
 * Factory that returns the singleton adapter for the selected printer brand.
 */
export function getPrinterAdapter(brand: PrinterBrand): PrinterAdapter {
  if (!adapterCache[brand]) {
    switch (brand) {
      case "DYMO":
        adapterCache[brand] = new DymoPrinterAdapter();
        break;
      case "Zebra":
        adapterCache[brand] = new ZebraPrinterAdapter();
        break;
      case "Brother":
        adapterCache[brand] = new BrotherPrinterAdapter();
        break;
      case "Rollo":
        adapterCache[brand] = new RolloPrinterAdapter();
        break;
      case "Epson":
        adapterCache[brand] = new EpsonPrinterAdapter();
        break;
      case "Generic":
      default:
        adapterCache[brand] = new GenericPrinterAdapter();
        break;
    }
  }
  return adapterCache[brand]!;
}
