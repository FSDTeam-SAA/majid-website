export type PrinterBrand =
  "DYMO" | "Zebra" | "Brother" | "Rollo" | "Epson" | "Generic";

export type BarcodeFormat =
  "CODE128" | "EAN-13" | "EAN-8" | "UPC-A" | "QR Code";

export type LabelDimensionUnit = "mm" | "inch";

export type PrintingProtocol =
  "browser" | "zpl" | "brother_raster" | "epos" | "esc_pos" | "generic";

export interface LabelFields {
  sku: boolean;
  gtin: boolean;
  variationName: boolean;
  price: boolean;
  itemName: boolean;
  unitAbbreviation: boolean;
}

export interface LabelTemplate {
  id: string;
  printer_brand: PrinterBrand;
  printer_model?: string;
  label_name: string;
  width: number;
  height: number;
  unit: LabelDimensionUnit;
  barcode_format: BarcodeFormat[];
  supported_fields: Array<keyof LabelFields>;
  printing_protocol: PrintingProtocol;
  description?: string;
  isCustom?: boolean;
}

export interface CommonLabelData {
  itemName: string;
  sku: string;
  gtin?: string;
  variationName?: string;
  price?: number;
  unitAbbreviation?: string;
  barcode: string;
  barcodeFormat: BarcodeFormat;
  labelWidth: number;
  labelHeight: number;
  unit: LabelDimensionUnit;
  location?: string;
  currencySymbol?: string;
  fields: LabelFields;
  template: LabelTemplate;
}

export interface PrintResult {
  success: boolean;
  protocol: PrintingProtocol;
  message?: string;
  rawOutput?: string;
}

export interface PrintOptions {
  contentRef?: React.RefObject<HTMLDivElement | null>;
  copies?: number;
  dpi?: number;
  onBeforePrint?: () => Promise<void> | void;
  onAfterPrint?: () => void;
  triggerBrowserPrint?: () => void;
}
