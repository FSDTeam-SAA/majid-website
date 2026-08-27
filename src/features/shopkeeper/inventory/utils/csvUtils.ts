import type { Category, InventoryItem } from "../types";

export interface CsvColumnDef {
  name: string;
  label: string;
  required: boolean;
  type: string;
  example: string;
  description: string;
}

export const CSV_COLUMNS_SPEC: CsvColumnDef[] = [
  {
    name: "itemName",
    label: "Item Name",
    required: true,
    type: "Text",
    example: "Apple iPhone 15 Pro Max",
    description: "Full product name or model title.",
  },
  {
    name: "brand",
    label: "Brand",
    required: false,
    type: "Text",
    example: "Apple",
    description: "Manufacturer or brand name.",
  },
  {
    name: "color",
    label: "Color",
    required: false,
    type: "Text",
    example: "Natural Titanium",
    description: "Device color or variant.",
  },
  {
    name: "storage",
    label: "Storage / Memory",
    required: false,
    type: "Text",
    example: "256GB",
    description: "Storage capacity (e.g. 128GB, 256GB, 1TB).",
  },
  {
    name: "size",
    label: "Screen / Size",
    required: false,
    type: "Text",
    example: "6.7 inch",
    description: "Screen size or dimensions.",
  },
  {
    name: "imeiNumber",
    label: "IMEI / Serial",
    required: true,
    type: "Text / Number",
    example: "356789012345678",
    description: "Unique IMEI, Serial number, or Barcode code.",
  },
  {
    name: "sku",
    label: "SKU",
    required: false,
    type: "Text",
    example: "SKU-IPH15PM-256-NT",
    description: "Stock Keeping Unit code.",
  },
  {
    name: "modelNumber",
    label: "Model Number",
    required: false,
    type: "Text",
    example: "A2849",
    description: "Official hardware model number.",
  },
  {
    name: "quantity",
    label: "Quantity",
    required: false,
    type: "Number",
    example: "1",
    description: "Initial stock count (default: 1).",
  },
  {
    name: "purchasePrice",
    label: "Buy Price",
    required: false,
    type: "Number",
    example: "850",
    description: "Cost / purchase price per unit.",
  },
  {
    name: "expectedPrice",
    label: "Sell Price",
    required: false,
    type: "Number",
    example: "1150",
    description: "Expected retail / selling price.",
  },
  {
    name: "category",
    label: "Category",
    required: false,
    type: "Text",
    example: "Smartphones",
    description:
      "Category name or ID. Automatically matched to existing categories.",
  },
  {
    name: "supplier",
    label: "Supplier",
    required: false,
    type: "Text",
    example: "Apple Authorized Distributor",
    description: "Supplier name or ID.",
  },
  {
    name: "currentState",
    label: "Condition",
    required: false,
    type: "Select",
    example: "new",
    description: "new · good condition · fair · refurbished · for parts",
  },
  {
    name: "productDetails",
    label: "Details / Notes",
    required: false,
    type: "Text",
    example: "Mint condition, unlocked global version",
    description: "Additional specifications or item notes.",
  },
  {
    name: "minStockLevel",
    label: "Min Stock Alert",
    required: false,
    type: "Number",
    example: "2",
    description: "Low stock alert threshold (default: 2).",
  },
];

const escapeCsv = (val: unknown) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

export const downloadCsvTemplate = (categories?: Category[]) => {
  const headers = CSV_COLUMNS_SPEC.map((c) => c.name);
  const defaultCategoryName =
    categories && categories.length > 0 ? categories[0].name : "Smartphones";
  const secondCategoryName =
    categories && categories.length > 1 ? categories[1].name : "Tablets";

  const sampleRows = [
    [
      "Apple iPhone 15 Pro Max",
      "Apple",
      "Natural Titanium",
      "256GB",
      "6.7 inch",
      "356789012345678",
      "SKU-IPH15PM-256-NT",
      "A2849",
      "1",
      "850",
      "1150",
      defaultCategoryName,
      "Apple Authorized Distributor",
      "new",
      "Mint condition, factory unlocked",
      "2",
    ],
    [
      "Samsung Galaxy S24 Ultra",
      "Samsung",
      "Titanium Black",
      "512GB",
      "6.8 inch",
      "359876543210987",
      "SKU-S24U-512-TB",
      "SM-S928B",
      "1",
      "780",
      "1050",
      defaultCategoryName,
      "Global Tech Supplier",
      "new",
      "Brand new sealed with S-Pen",
      "2",
    ],
    [
      "Apple iPad Pro 11-inch M4",
      "Apple",
      "Space Black",
      "256GB",
      "11 inch",
      "354567890123456",
      "SKU-IPADM4-256-SB",
      "A2836",
      "1",
      "700",
      "950",
      secondCategoryName,
      "Apple Authorized Distributor",
      "new",
      "OLED display, Wi-Fi + Cellular",
      "1",
    ],
  ];

  const csvContent = [
    headers.join(","),
    ...sampleRows.map((r) => r.map(escapeCsv).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "inventory-import-template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportInventoryToCsv = (
  items: InventoryItem[],
  filename = "inventory-export.csv",
) => {
  const headers = CSV_COLUMNS_SPEC.map((c) => c.name);

  const rows = items.map((item) => {
    const colorStr = Array.isArray(item.color)
      ? item.color.join(", ")
      : item.color || "";
    const storageStr = Array.isArray(item.storage)
      ? item.storage.join(", ")
      : item.storage || "";
    const categoryName =
      typeof item.categoryId === "object" && item.categoryId !== null
        ? (item.categoryId as { name?: string }).name || ""
        : "";
    const supplierName =
      typeof item.supplierId === "object" && item.supplierId !== null
        ? (item.supplierId as { name?: string }).name || ""
        : "";

    return [
      escapeCsv(item.itemName),
      escapeCsv(item.brand || ""),
      escapeCsv(colorStr),
      escapeCsv(storageStr),
      escapeCsv(item.size || ""),
      escapeCsv(item.imeiNumber || item.sku || ""),
      escapeCsv(item.sku || ""),
      escapeCsv(item.modelNumber || ""),
      escapeCsv(item.quantity ?? 1),
      escapeCsv(item.purchasePrice ?? ""),
      escapeCsv(item.expectedPrice ?? item.salePrice ?? ""),
      escapeCsv(categoryName),
      escapeCsv(supplierName),
      escapeCsv(item.currentState || "new"),
      escapeCsv(item.productDetails || ""),
      escapeCsv(item.minStockLevel ?? 2),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
