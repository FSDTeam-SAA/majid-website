import {
  BarcodeFormat,
  InstalledPrinterDevice,
  LabelDimensionUnit,
  LabelFields,
  LabelOrientation,
  LabelTemplate,
  PrinterBrand,
} from "./types";

const ALL_FIELDS: Array<keyof LabelFields> = [
  "sku",
  "gtin",
  "variationName",
  "price",
  "itemName",
  "unitAbbreviation",
];

const STANDARD_BARCODES: BarcodeFormat[] = [
  "CODE128",
  "EAN-13",
  "EAN-8",
  "UPC-A",
  "QR Code",
];

export const INSTALLED_PRINTER_DEVICES: InstalledPrinterDevice[] = [
  {
    id: "dymo-lw-450-turbo-main",
    name: "DYMO LabelWriter 450 Turbo",
    brand: "DYMO",
    location: "Main Store",
    isDefault: true,
  },
  {
    id: "dymo-lw-450-counter",
    name: "DYMO LabelWriter 450",
    brand: "DYMO",
    location: "Front Counter",
  },
  {
    id: "dymo-lw-550-turbo-main",
    name: "DYMO LabelWriter 550 Turbo",
    brand: "DYMO",
    location: "Main Store",
  },
  {
    id: "zebra-zd421-main",
    name: "Zebra ZD421 (203 dpi)",
    brand: "Zebra",
    location: "Main Store",
  },
  {
    id: "brother-ql-820-pack",
    name: "Brother QL-820NWB",
    brand: "Brother",
    location: "Packing Station",
  },
  {
    id: "rollo-thermal-shipping",
    name: "Rollo Wireless Thermal",
    brand: "Rollo",
    location: "Shipping Desk",
  },
  {
    id: "epson-tm-l90-pos",
    name: "Epson TM-L90 Plus",
    brand: "Epson",
    location: "POS Terminal",
  },
  {
    id: "generic-system-printer",
    name: "Standard Desktop / System Printer",
    brand: "Generic",
    location: "Office",
  },
];

export const LABEL_TEMPLATES: LabelTemplate[] = [
  // ──────────────────────────────────────────
  // 1. DYMO
  // ──────────────────────────────────────────
  {
    id: "dymo-s0722540",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "Multipurpose Labels",
    product_code: "S0722540",
    stock_width_mm: 32,
    stock_height_mm: 57,
    shape: "rounded_rectangle",
    default_orientation: "landscape",
    width: 57,
    height: 32,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description:
      "Standard multipurpose product, bin, and price tag label (32 x 57 mm)",
  },
  {
    id: "dymo-s0722520",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "Large Return Address Labels",
    product_code: "S0722520",
    stock_width_mm: 25,
    stock_height_mm: 54,
    shape: "rounded_rectangle",
    default_orientation: "landscape",
    width: 54,
    height: 25,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Standard address and long barcode label (25 x 54 mm)",
  },
  {
    id: "dymo-1976411",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "Durable Labels",
    product_code: "1976411",
    stock_width_mm: 25,
    stock_height_mm: 54,
    shape: "rounded_rectangle",
    default_orientation: "landscape",
    width: 54,
    height: 25,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description:
      "Tear-resistant durable label for retail and storage (25 x 54 mm)",
  },
  {
    id: "dymo-1933084",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "Durable Labels",
    product_code: "1933084",
    stock_width_mm: 57,
    stock_height_mm: 32,
    shape: "rounded_rectangle",
    default_orientation: "landscape",
    width: 57,
    height: 32,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description:
      "Heavy-duty durable label resistant to moisture and abrasion (57 x 32 mm)",
  },
  {
    id: "dymo-1933081",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "Durable Labels",
    product_code: "1933081",
    stock_width_mm: 25,
    stock_height_mm: 89,
    shape: "slim_rectangle",
    default_orientation: "landscape",
    width: 89,
    height: 25,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Long durable shelf and equipment asset label (25 x 89 mm)",
  },
  {
    id: "dymo-1933085",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "DYMO 1933085 - LW Durable 19 mm x 64 mm",
    product_code: "1933085",
    stock_width_mm: 19,
    stock_height_mm: 64,
    shape: "cable_flag",
    default_orientation: "landscape",
    width: 64,
    height: 19,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Compact durable jewelry & cable flag / retail barcode label",
  },
  {
    id: "dymo-30336",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "DYMO 30336 - 1 x 2-1/8 in",
    product_code: "30336",
    stock_width_mm: 25,
    stock_height_mm: 54,
    shape: "rounded_rectangle",
    default_orientation: "landscape",
    width: 2.125,
    height: 1,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Standard multipurpose product, bin, and price tag label",
  },
  {
    id: "dymo-30252",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "DYMO 30252 - Address 1-1/8 x 3-1/2 in",
    product_code: "30252",
    stock_width_mm: 28,
    stock_height_mm: 89,
    shape: "rounded_rectangle",
    default_orientation: "landscape",
    width: 3.5,
    height: 1.125,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Standard address and long barcode label",
  },
  {
    id: "dymo-30334",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "DYMO 30334 - Multi-Purpose 2-1/4 x 1-1/4 in",
    product_code: "30334",
    stock_width_mm: 32,
    stock_height_mm: 57,
    shape: "rounded_rectangle",
    default_orientation: "landscape",
    width: 2.25,
    height: 1.25,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Medium barcode tag with item name, variation, and price",
  },
  {
    id: "dymo-30332",
    printer_brand: "DYMO",
    printer_model: "LabelWriter 450 / 450 Turbo / 550 / 4XL",
    label_name: "DYMO 30332 - 1 x 1 in (Square)",
    product_code: "30332",
    stock_width_mm: 25,
    stock_height_mm: 25,
    shape: "square",
    default_orientation: "portrait",
    width: 1,
    height: 1,
    unit: "inch",
    barcode_format: ["CODE128", "QR Code"],
    supported_fields: ["sku", "price", "itemName"],
    printing_protocol: "browser",
    description: "Compact 1-inch square label optimal for QR codes",
  },

  // ──────────────────────────────────────────
  // 2. ZEBRA
  // ──────────────────────────────────────────
  {
    id: "zebra-2x1",
    printer_brand: "Zebra",
    printer_model: "ZD410 / ZD421 / GX420d / ZT230",
    label_name: "Zebra 2 x 1 inch",
    product_code: "ZD-2x1",
    stock_width_mm: 25,
    stock_height_mm: 51,
    shape: "rounded_rectangle",
    default_orientation: "landscape",
    width: 2,
    height: 1,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "zpl",
    description:
      "Common retail shelf tag and item pricing label (ZPL / Browser)",
  },
  {
    id: "zebra-2.25x1.25",
    printer_brand: "Zebra",
    printer_model: "ZD410 / ZD420 / ZD421 / GK420d",
    label_name: "Zebra 2.25 x 1.25 inch",
    product_code: "ZD-2.25x1.25",
    stock_width_mm: 32,
    stock_height_mm: 57,
    shape: "rounded_rectangle",
    default_orientation: "landscape",
    width: 2.25,
    height: 1.25,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "zpl",
    description: "Standard POS inventory & variation tag (ZPL / Browser)",
  },
  {
    id: "zebra-3x1",
    printer_brand: "Zebra",
    printer_model: "ZD421 / GX420d / ZT411",
    label_name: "Zebra 3 x 1 inch",
    product_code: "ZD-3x1",
    stock_width_mm: 25,
    stock_height_mm: 76,
    shape: "slim_rectangle",
    default_orientation: "landscape",
    width: 3,
    height: 1,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "zpl",
    description: "Wide product barcode tag with extra title space",
  },
  {
    id: "zebra-2x2",
    printer_brand: "Zebra",
    printer_model: "ZD410 / ZD420 / ZD421 / ZT230",
    label_name: "Zebra 2 x 2 inch",
    product_code: "ZD-2x2",
    stock_width_mm: 51,
    stock_height_mm: 51,
    shape: "square",
    default_orientation: "portrait",
    width: 2,
    height: 2,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "zpl",
    description: "Square retail tag with large QR code and item specs",
  },
  {
    id: "zebra-4x6",
    printer_brand: "Zebra",
    printer_model: "ZD421 / ZD620 / ZT411 / 4XL",
    label_name: "Zebra 4 x 6 inch",
    width: 4,
    height: 6,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "zpl",
    description: "Logistics, master carton, and repair intake box label",
  },
  {
    id: "zebra-custom",
    printer_brand: "Zebra",
    printer_model: "Zebra Universal (ZPL)",
    label_name: "Zebra Custom Size",
    width: 2.5,
    height: 1.5,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "zpl",
    description: "User-configurable dimensions with ZPL generation",
    isCustom: true,
  },

  // ──────────────────────────────────────────
  // 3. BROTHER
  // ──────────────────────────────────────────
  {
    id: "brother-dk-1201",
    printer_brand: "Brother",
    printer_model: "QL-700 / QL-800 / QL-810W / QL-820NWB",
    label_name: "Brother DK-1201 - Standard Address 29 mm x 90 mm",
    width: 90,
    height: 29,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "brother_raster",
    description: "Die-cut standard label for device model and barcode",
  },
  {
    id: "brother-dk-1202",
    printer_brand: "Brother",
    printer_model: "QL-800 / QL-820NWB / QL-1100",
    label_name: "Brother DK-1202 - Shipping 62 mm x 100 mm",
    width: 100,
    height: 62,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "brother_raster",
    description: "Large shipping and repair intake package label",
  },
  {
    id: "brother-dk-1209",
    printer_brand: "Brother",
    printer_model: "QL-700 / QL-800 / QL-820NWB",
    label_name: "Brother DK-1209 - Small Address 29 mm x 62 mm",
    width: 62,
    height: 29,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "brother_raster",
    description: "Compact product and accessory pricing label",
  },
  {
    id: "brother-dk-1204",
    printer_brand: "Brother",
    printer_model: "QL-700 / QL-800 / QL-820NWB",
    label_name: "Brother DK-1204 - Multi-Purpose 17 mm x 54 mm",
    width: 54,
    height: 17,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "brother_raster",
    description: "Slim shelf edge and parts bin barcode label",
  },
  {
    id: "brother-dk-1221",
    printer_brand: "Brother",
    printer_model: "QL-800 / QL-820NWB",
    label_name: "Brother DK-1221 - Square 23 mm x 23 mm",
    width: 23,
    height: 23,
    unit: "mm",
    barcode_format: ["CODE128", "QR Code"],
    supported_fields: ["sku", "price"],
    printing_protocol: "brother_raster",
    description: "Miniature square label ideal for QR and small items",
  },
  {
    id: "brother-dk-2205",
    printer_brand: "Brother",
    printer_model: "QL-700 / QL-800 / QL-820NWB / QL-1100",
    label_name: "Brother DK-2205 - Continuous 62 mm Roll",
    width: 62,
    height: 38,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "brother_raster",
    description: "Continuous roll auto-cut to item content length",
  },

  // ──────────────────────────────────────────
  // 4. ROLLO
  // ──────────────────────────────────────────
  {
    id: "rollo-4x6",
    printer_brand: "Rollo",
    printer_model: "Rollo Wireless / USB Direct Thermal",
    label_name: "Rollo 4 x 6 inch (Shipping / Logistics)",
    width: 4,
    height: 6,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Standard high-speed direct thermal shipping label",
  },
  {
    id: "rollo-2x1",
    printer_brand: "Rollo",
    printer_model: "Rollo Wireless / USB Direct Thermal",
    label_name: "Rollo 2 x 1 inch (Barcode / Shelf Tag)",
    width: 2,
    height: 1,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Direct thermal retail barcode and price tag",
  },
  {
    id: "rollo-2.25x1.25",
    printer_brand: "Rollo",
    printer_model: "Rollo Wireless / USB Direct Thermal",
    label_name: "Rollo 2.25 x 1.25 inch (Product Label)",
    width: 2.25,
    height: 1.25,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "General merchandise and SKU barcode label",
  },
  {
    id: "rollo-3x2",
    printer_brand: "Rollo",
    printer_model: "Rollo Wireless / USB Direct Thermal",
    label_name: "Rollo 3 x 2 inch (Inventory Label)",
    width: 3,
    height: 2,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Medium inventory label with price, SKU, and variation",
  },

  // ──────────────────────────────────────────
  // 5. EPSON
  // ──────────────────────────────────────────
  {
    id: "epson-tm-l90-58",
    printer_brand: "Epson",
    printer_model: "TM-L90 / TM-L90 Plus",
    label_name: "Epson TM-L90 - 58 mm x 38 mm (Die-cut Label)",
    width: 58,
    height: 38,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "epos",
    description: "Direct thermal POS label via ePOS-Print XML / ESC-POS",
  },
  {
    id: "epson-tm-l90-80",
    printer_brand: "Epson",
    printer_model: "TM-L90 / TM-L90 Plus",
    label_name: "Epson TM-L90 - 80 mm x 40 mm (Product Label)",
    width: 80,
    height: 40,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "epos",
    description: "Wide product and repair tracking label via ePOS / Driver",
  },
  {
    id: "epson-cw-c4000-2x1",
    printer_brand: "Epson",
    printer_model: "ColorWorks CW-C4000",
    label_name: "Epson ColorWorks - 2 x 1 inch",
    width: 2,
    height: 1,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Precision on-demand color label (ESC/Label / Windows Driver)",
  },
  {
    id: "epson-cw-c4000-3x2",
    printer_brand: "Epson",
    printer_model: "ColorWorks CW-C4000 / CW-C6000",
    label_name: "Epson ColorWorks - 3 x 2 inch",
    width: 3,
    height: 2,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Vibrant high-resolution item & brand label",
  },
  {
    id: "epson-cw-c6000-4x6",
    printer_brand: "Epson",
    printer_model: "ColorWorks CW-C6000 / CW-C6500",
    label_name: "Epson ColorWorks - 4 x 6 inch",
    width: 4,
    height: 6,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Full-color logistics, hazardous, or device compliance label",
  },
  {
    id: "epson-tm-t88",
    printer_brand: "Epson",
    printer_model: "TM-T88VI / TM-T88VII",
    label_name: "Epson TM-T88 - 80 mm Continuous Strip",
    width: 80,
    height: 45,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "esc_pos",
    description: "Linerless / continuous receipt paper barcode tag",
  },

  // ──────────────────────────────────────────
  // 6. GENERIC / STANDARD PRINTER
  // ──────────────────────────────────────────
  {
    id: "generic-2x1",
    printer_brand: "Generic",
    printer_model: "Standard OS / Thermal Driver",
    label_name: "Generic 2 x 1 inch (Standard Thermal)",
    width: 2,
    height: 1,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Compatible with any Windows/macOS/Linux thermal label driver",
  },
  {
    id: "generic-2.25x1.25",
    printer_brand: "Generic",
    printer_model: "Standard OS / Thermal Driver",
    label_name: "Generic 2.25 x 1.25 inch",
    width: 2.25,
    height: 1.25,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Standard retail barcode tag for general thermal printers",
  },
  {
    id: "generic-3x2",
    printer_brand: "Generic",
    printer_model: "Standard OS / Thermal Driver",
    label_name: "Generic 3 x 2 inch",
    width: 3,
    height: 2,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Medium warehouse, inventory, and bin label",
  },
  {
    id: "generic-4x6",
    printer_brand: "Generic",
    printer_model: "Standard OS / Thermal Driver",
    label_name: "Generic 4 x 6 inch (Shipping / Large)",
    width: 4,
    height: 6,
    unit: "inch",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Standard 4x6 packaging and shipping label",
  },
  {
    id: "generic-50x30",
    printer_brand: "Generic",
    printer_model: "Standard OS / Thermal Driver",
    label_name: "Generic 50 mm x 30 mm (Metric)",
    width: 50,
    height: 30,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description: "Standard European / metric retail price sticker",
  },
  {
    id: "generic-a4-sheet",
    printer_brand: "Generic",
    printer_model: "Desktop Laser / Inkjet Printer",
    label_name: "Generic A4 Sheet (Single Label Preview)",
    width: 105,
    height: 74,
    unit: "mm",
    barcode_format: STANDARD_BARCODES,
    supported_fields: ALL_FIELDS,
    printing_protocol: "browser",
    description:
      "Quarter A4 (A7 size) for regular office laser / inkjet printing",
  },
];

export const PRINTER_BRANDS: PrinterBrand[] = [
  "DYMO",
  "Zebra",
  "Brother",
  "Rollo",
  "Epson",
  "Generic",
];

export function getTemplatesForBrand(brand: PrinterBrand): LabelTemplate[] {
  return LABEL_TEMPLATES.filter((t) => t.printer_brand === brand);
}

export function getTemplateById(id: string): LabelTemplate | undefined {
  return LABEL_TEMPLATES.find((t) => t.id === id);
}

export function getDefaultTemplateForBrand(brand: PrinterBrand): LabelTemplate {
  if (brand === "DYMO") {
    const dymoMultipurpose = LABEL_TEMPLATES.find(
      (t) => t.id === "dymo-s0722540",
    );
    if (dymoMultipurpose) return dymoMultipurpose;
  }
  const brandTemplates = getTemplatesForBrand(brand);
  return brandTemplates[0] || LABEL_TEMPLATES[0];
}

/**
 * Calculates print layout dimensions keeping stock size separate from rotation.
 * In landscape: width is the longer dimension, height is the shorter dimension.
 * In portrait: width is the shorter dimension, height is the longer dimension.
 */
export function getPrintLayoutDimensions(
  template: LabelTemplate,
  orientation: LabelOrientation = "landscape",
): { width: number; height: number; unit: LabelDimensionUnit } {
  // If stock dimensions are defined in mm
  if (template.stock_width_mm && template.stock_height_mm) {
    const minDim = Math.min(template.stock_width_mm, template.stock_height_mm);
    const maxDim = Math.max(template.stock_width_mm, template.stock_height_mm);
    if (orientation === "landscape") {
      return { width: maxDim, height: minDim, unit: "mm" };
    } else {
      return { width: minDim, height: maxDim, unit: "mm" };
    }
  }

  // Fallback to width & height in template
  const minDim = Math.min(template.width, template.height);
  const maxDim = Math.max(template.width, template.height);
  if (orientation === "landscape") {
    return { width: maxDim, height: minDim, unit: template.unit };
  } else {
    return { width: minDim, height: maxDim, unit: template.unit };
  }
}

/**
 * Searches templates by name, product code, description, or dimensions
 */
export function searchTemplates(
  query: string,
  brand?: PrinterBrand,
): LabelTemplate[] {
  const normalizedQuery = query.toLowerCase().trim();
  const pool = brand ? getTemplatesForBrand(brand) : LABEL_TEMPLATES;

  if (!normalizedQuery) return pool;

  return pool.filter((tpl) => {
    const nameMatch = tpl.label_name.toLowerCase().includes(normalizedQuery);
    const codeMatch = tpl.product_code?.toLowerCase().includes(normalizedQuery);
    const descMatch = tpl.description?.toLowerCase().includes(normalizedQuery);
    const dimMmMatch =
      tpl.stock_width_mm &&
      tpl.stock_height_mm &&
      `${tpl.stock_width_mm}x${tpl.stock_height_mm}`.includes(
        normalizedQuery.replace(/\s+/g, ""),
      );
    const dimInMatch = `${tpl.width}x${tpl.height}`.includes(
      normalizedQuery.replace(/\s+/g, ""),
    );

    return nameMatch || codeMatch || descMatch || dimMmMatch || dimInMatch;
  });
}
