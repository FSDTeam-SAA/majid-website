import type { CategoryFormAttributes } from "../component/forms/CategorySpecificFormFields";
import type { Category } from "../types";

export const KNOWN_BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "Lenovo",
  "Dell",
  "HP",
  "Asus",
  "Acer",
  "Microsoft",
  "MSI",
  "Razer",
  "Huawei",
  "Xiaomi",
  "Oppo",
  "Vivo",
  "Sony",
  "LG",
  "Nokia",
  "OnePlus",
  "Motorola",
  "Nothing",
  "Honor",
  "Realme",
  "Alienware",
  "Toshiba",
  "Other",
] as const;

export const COMMON_COLORS = [
  "Natural Titanium",
  "Black Titanium",
  "White Titanium",
  "Blue Titanium",
  "Space Black",
  "Space Gray",
  "Midnight",
  "Starlight",
  "Alpine Green",
  "Sierra Blue",
  "Deep Purple",
  "Phantom Black",
  "Rose Gold",
  "Sky Blue",
  "Black",
  "White",
  "Silver",
  "Blue",
  "Red",
  "Green",
  "Gold",
  "Titanium",
  "Yellow",
  "Purple",
  "Pink",
  "Coral",
  "Orange",
  "Gray",
  "Grey",
  "Graphite",
  "Cream",
  "Lavender",
];

const KNOWN_KEYS = [
  "Manufacturer",
  "Brand",
  "Make",
  "Series",
  "Family",
  "Model",
  "Model Number",
  "Model Code",
  "MPN",
  "Part Number",
  "Screen Size",
  "Display Size",
  "Display",
  "Touchscreen",
  "Processor",
  "CPU",
  "Speed",
  "Clock Speed",
  "Clock",
  "RAM",
  "Memory",
  "Installed RAM",
  "Solid State Drive",
  "SSD",
  "Hard Drive",
  "HDD",
  "Storage",
  "ROM",
  "Operating System",
  "OS",
  "Color",
  "Colour",
  "Category",
  "Product Details",
  "Condition",
  "Physical Condition",
  "State",
  "Serial Number",
  "Serial",
  "S/N",
  "IMEI",
  "IMEI Number",
  "Battery Health",
  "Connectivity",
  "GPU",
  "Graphics",
  "Video Card",
];

const KEY_DELIMITER = `(?=\\.(?:\\s+|$)|[;\\n\\r]|\\s+(?:${KNOWN_KEYS.join("|")})\\s*:|$)`;

export function getLabeledFieldValue(
  text: string,
  keyNames: string[],
): string | undefined {
  const pattern = new RegExp(
    `(?:${keyNames.join("|")})\\s*[:=-]\\s*([\\s\\S]*?)${KEY_DELIMITER}`,
    "i",
  );
  const match = text.match(pattern);
  return match ? match[1].trim() : undefined;
}

export interface ExtractedSpecs {
  brand?: string;
  isCustomBrand?: boolean;
  modelNumber?: string;
  series?: string;
  color?: string;
  storage?: string;
  processor?: string;
  ram?: string;
  gpu?: string;
  screenSize?: string;
  condition?: string;
  currentState?: "new" | "good condition" | string;
  serialNumber?: string;
  imeiNumber?: string;
  batteryHealth?: string;
  connectivity?: "Wi-Fi" | "Cellular";
  categoryHint?:
    "laptop" | "phone" | "tablet" | "gaming" | "watch" | "audio" | "camera";
  matchedCategoryId?: string;
  categoryAttributes: CategoryFormAttributes;
}

/**
 * Parses freeform product text, product title, description, or raw API response
 * and extracts all device specifications into structured form fields.
 */
export function extractSpecsFromText(
  text: string,
  rawData?: Record<string, unknown>,
  categories?: Category[],
): ExtractedSpecs {
  const rawDataParts: string[] = [];
  if (rawData && typeof rawData === "object") {
    Object.entries(rawData).forEach(([k, v]) => {
      if (typeof v === "string" || typeof v === "number") {
        rawDataParts.push(`${k}: ${v}`);
      }
    });
  }

  const raw = `${text || ""} ${rawDataParts.join(". ")}`.trim();

  // 1. Brand Extraction
  let brand =
    getLabeledFieldValue(raw, ["Manufacturer", "Brand", "Make"]) ||
    (typeof rawData?.manufacturer === "string" ? rawData.manufacturer : "") ||
    (typeof rawData?.brand === "string" ? rawData.brand : "");

  let isCustomBrand = false;
  if (!brand) {
    for (const b of KNOWN_BRANDS) {
      if (b === "Other") continue;
      const r = new RegExp(`\\b${b}\\b`, "i");
      if (r.test(raw)) {
        brand = b;
        break;
      }
    }
  }

  if (brand) {
    const matchedBrand = KNOWN_BRANDS.find(
      (b) => b.toLowerCase() === brand.trim().toLowerCase(),
    );
    if (matchedBrand && matchedBrand !== "Other") {
      brand = matchedBrand;
      isCustomBrand = false;
    } else {
      brand = brand.trim();
      isCustomBrand = true;
    }
  }

  // 2. Model / Part Number
  let modelNumber =
    getLabeledFieldValue(raw, [
      "Model",
      "Model Number",
      "Model Code",
      "MPN",
      "Part Number",
    ]) ||
    (typeof rawData?.model === "string" ? rawData.model : "") ||
    (typeof rawData?.mpn === "string" ? rawData.mpn : "");

  if (!modelNumber) {
    const m = raw.match(/\b(20[A-Z0-9]{8}|A\d{4}|SM-[A-Z]\d{3,4}[A-Z0-9]?)\b/i);
    if (m) modelNumber = m[1].toUpperCase();
  }

  // Series / Family (e.g. ThinkPad X380 Yoga)
  const series = getLabeledFieldValue(raw, ["Series", "Family"]);

  // 3. RAM Extraction
  let ramNum: number | null = null;
  const ramField =
    getLabeledFieldValue(raw, ["RAM", "Memory", "Installed RAM"]) ||
    (typeof rawData?.ram === "string" ? rawData.ram : "");

  if (ramField) {
    const m = ramField.match(/(\d+)\s*(?:GB|MB|TB)/i);
    if (m) ramNum = parseInt(m[1], 10);
  }
  if (!ramNum) {
    const m = raw.match(
      /\b(\d+)\s*GB\s+(?:RAM|Memory|Unified\s+Memory|LPDDR\w*|DDR\w*)\b/i,
    );
    if (m) ramNum = parseInt(m[1], 10);
  }

  let ram: string | undefined = undefined;
  if (ramNum) {
    const standardRamOptions = [
      "8 GB",
      "16 GB",
      "24 GB",
      "32 GB",
      "64 GB",
      "128 GB",
    ];
    const matchOpt = standardRamOptions.find(
      (opt) => parseInt(opt, 10) === ramNum,
    );
    ram = matchOpt || `${ramNum} GB`;
  }

  // 4. Storage Extraction
  let storageNum: number | null = null;
  let isSsd = false;
  const ssdField =
    getLabeledFieldValue(raw, [
      "Solid State Drive",
      "SSD",
      "Hard Drive",
      "HDD",
    ]) || (typeof rawData?.storage === "string" ? rawData.storage : "");

  if (ssdField) {
    const m = ssdField.match(/(\d+)\s*(?:GB|TB)/i);
    if (m) {
      storageNum = parseInt(m[1], 10);
      isSsd = /SSD|Solid State Drive/i.test(ssdField) || true;
    }
  }

  if (!storageNum) {
    const storageField = getLabeledFieldValue(raw, ["Storage", "ROM"]);
    if (storageField) {
      const nums = [...storageField.matchAll(/(\d+)\s*(?:GB|TB)/gi)].map((m) =>
        parseInt(m[1], 10),
      );
      // Filter out values matching RAM size
      const filtered = nums.filter((n) => n !== ramNum);
      if (filtered.length > 0) {
        storageNum = filtered[filtered.length - 1];
        isSsd = true;
      }
    }
  }

  if (!storageNum) {
    const m = raw.match(
      /\b(\d+)\s*(?:GB|TB)\s*(?:SSD|NVMe|PCIe|M\.2|Solid State Drive)\b/i,
    );
    if (m) {
      storageNum = parseInt(m[1], 10);
      isSsd = true;
    }
  }

  if (!storageNum) {
    // Phone / general storage match (filter out RAM size)
    const matches = [...raw.matchAll(/\b(64|128|256|512|1024)\s*(?:GB|TB)\b/gi)]
      .map((m) => parseInt(m[1], 10))
      .filter((n) => n !== ramNum);
    if (matches.length > 0) storageNum = matches[0];
  }

  let storage: string | undefined = undefined;
  if (storageNum) {
    if (isSsd) {
      if (storageNum >= 1000) storage = `${storageNum / 1000} TB SSD`;
      else storage = `${storageNum} GB SSD`;
    } else {
      if (storageNum >= 1000) storage = `${storageNum / 1000} TB`;
      else storage = `${storageNum} GB`;
    }
  }

  // 5. Processor Extraction
  let processor =
    getLabeledFieldValue(raw, ["Processor", "CPU"]) ||
    (typeof rawData?.processor === "string" ? rawData.processor : "");

  const speed =
    getLabeledFieldValue(raw, ["Speed", "Clock Speed", "Clock"]) ||
    (typeof rawData?.speed === "string" ? rawData.speed : "");

  if (processor) {
    if (speed && !processor.toLowerCase().includes(speed.toLowerCase())) {
      processor = `${processor} @ ${speed}`;
    }
    if (/^i[3579]-/i.test(processor) && !/intel/i.test(processor)) {
      processor = `Intel Core ${processor}`;
    }
  } else {
    const m = raw.match(
      /\b(Intel(?:\s+Core)?\s+(?:i[3579]|m[357]|Ultra\s+[579])[- ]\w+(?:\s+@?\s*[\d.]+\s*GHz)?|i[3579]-?\d{4,5}[A-Z]*(?:\s+@?\s*[\d.]+\s*GHz)?|Ryzen\s+[3579](?:\s+Pro)?\s+\w+(?:\s+@?\s*[\d.]+\s*GHz)?|Apple\s+M[1234](?:\s+(?:Pro|Max|Ultra))?|M[1234]\s+(?:Pro|Max|Ultra)|M[1234]\b|Snapdragon\s+[\w\d\s]+|Celeron\s+\w+|Pentium\s+\w+|Xeon\s+\w+)/i,
    );
    if (m) {
      processor = m[1].trim();
      if (/^i[3579]-/i.test(processor) && !/intel/i.test(processor)) {
        processor = `Intel Core ${processor}`;
      }
    }
  }

  // 6. GPU Extraction
  let gpu =
    getLabeledFieldValue(raw, ["Graphics", "GPU", "Video Card"]) ||
    (typeof rawData?.gpu === "string" ? rawData.gpu : "");

  if (!gpu) {
    const m = raw.match(
      /\b(Intel\s+(?:UHD|Iris|HD)\s+Graphics(?:\s+\d+)?|NVIDIA\s+GeForce\s+(?:RTX|GTX|MX)\s*[\w\d\s]+|GeForce\s+(?:RTX|GTX)\s*\d{3,4}(?:\s*Ti|\s*Super)?|RTX\s*\d{3,4}(?:\s*Ti|\s*Super)?|AMD\s+Radeon(?:\s+RX)?\s*[\w\d\s]+|Apple\s+\d+-core\s+GPU|Integrated(?:\s+Graphics)?)\b/i,
    );
    if (m) gpu = m[1].trim();
  }

  // 7. Screen Size Extraction
  let screenSize =
    getLabeledFieldValue(raw, ["Screen Size", "Display Size", "Display"]) ||
    (typeof rawData?.screenSize === "string" ? rawData.screenSize : "");

  if (screenSize) {
    const m = screenSize.match(/([\d.]+)\s*(?:["”]|inch(?:es)?|')?/i);
    if (m) screenSize = `${m[1]}-inch`;
  } else {
    const m =
      raw.match(
        /\b([\d.]+)\s*(?:["”]|inch(?:es)?|')(?:\s*(?:FHD|UHD|QHD|OLED|IPS|Retina|Touchscreen|Display|Screen|\d+x\d+))/i,
      ) || raw.match(/\b([\d.]+)\s*(?:["”]|inch(?:es)?)\b/i);
    if (m) screenSize = `${m[1]}-inch`;
  }

  // 8. Color Extraction
  let color =
    getLabeledFieldValue(raw, ["Color", "Colour"]) ||
    (typeof rawData?.color === "string" ? rawData.color : "");

  if (color) {
    const found = COMMON_COLORS.find(
      (c) => c.toLowerCase() === color.trim().toLowerCase(),
    );
    if (found) color = found;
    else color = color.trim();
  } else {
    for (const c of COMMON_COLORS) {
      const r = new RegExp(`\\b${c}\\b`, "i");
      if (r.test(raw)) {
        color = c;
        break;
      }
    }
  }

  // 9. Condition Extraction
  let condition = "Like New";
  let currentState: "new" | "good condition" = "good condition";

  const condField = getLabeledFieldValue(raw, [
    "Condition",
    "Physical Condition",
    "State",
  ]);
  const textToScanForCondition = `${condField || ""} ${raw}`;

  if (
    /\b(?:brand\s*new|sealed|unopened|brand-new)\b/i.test(
      textToScanForCondition,
    )
  ) {
    condition = "Brand New";
    currentState = "new";
  } else if (/\b(?:refurbished|renewed)\b/i.test(textToScanForCondition)) {
    condition = "Like New";
    currentState = "good condition";
  } else if (
    /\b(?:like\s*new|open\s*box|open-box)\b/i.test(textToScanForCondition)
  ) {
    condition = "Like New";
    currentState = "good condition";
  } else if (
    /\b(?:excellent(?:\s*condition)?)\b/i.test(textToScanForCondition)
  ) {
    condition = "Excellent";
    currentState = "good condition";
  } else if (
    /\b(?:good(?:\s*condition)?|used|pre-owned|preowned)\b/i.test(
      textToScanForCondition,
    )
  ) {
    condition = "Good";
    currentState = "good condition";
  } else if (/\b(?:fair(?:\s*condition)?)\b/i.test(textToScanForCondition)) {
    condition = "Fair";
    currentState = "good condition";
  }

  // 10. Serial Number & IMEI
  const serialNumber =
    getLabeledFieldValue(raw, ["Serial Number", "Serial", "S/N"]) ||
    (typeof rawData?.serialNumber === "string"
      ? rawData.serialNumber
      : undefined);

  let imeiNumber =
    getLabeledFieldValue(raw, ["IMEI", "IMEI Number"]) ||
    (typeof rawData?.imei === "string" ? rawData.imei : undefined) ||
    (typeof rawData?.imeiNumber === "string" ? rawData.imeiNumber : undefined);

  if (!imeiNumber) {
    const m = raw.match(/\b\d{15}\b/);
    if (m) imeiNumber = m[0];
  }

  // 11. Battery Health
  let batteryHealth: string | undefined = undefined;
  const bhMatch = raw.match(
    /\b(?:Battery(?:\s*Health)?)\s*[:=-]?\s*(\d{2,3}%?)/i,
  );
  if (bhMatch) {
    batteryHealth = bhMatch[1].endsWith("%") ? bhMatch[1] : `${bhMatch[1]}%`;
  }

  // 12. Connectivity
  let connectivity: "Wi-Fi" | "Cellular" | undefined = undefined;
  if (/\b(?:Cellular|4G|5G|LTE|SIM)\b/i.test(raw)) connectivity = "Cellular";
  else if (/\b(?:Wi-Fi|WiFi|Wlan)\b/i.test(raw)) connectivity = "Wi-Fi";

  // 13. Category Detection
  let categoryHint: ExtractedSpecs["categoryHint"] = undefined;
  if (
    /\b(?:thinkpad|yoga|macbook|laptop|notebook|chromebook|ideapad|zenbook|latitude|precision|inspiron|xps|pavilion|envy|spectre|elitebook|omen|legion|surface laptop|surface pro|surface book)\b/i.test(
      raw,
    ) ||
    (processor && ram && isSsd)
  ) {
    categoryHint = "laptop";
  } else if (
    /\b(?:iphone|galaxy s\d|galaxy a\d|galaxy z|pixel|redmi|smartphone|mobile phone)\b/i.test(
      raw,
    )
  ) {
    categoryHint = "phone";
  } else if (/\b(?:ipad|galaxy tab|tablet|mediapad)\b/i.test(raw)) {
    categoryHint = "tablet";
  } else if (
    /\b(?:playstation|ps5|ps4|xbox|nintendo switch|console)\b/i.test(raw)
  ) {
    categoryHint = "gaming";
  } else if (/\b(?:apple watch|galaxy watch|smartwatch)\b/i.test(raw)) {
    categoryHint = "watch";
  }

  let matchedCategoryId: string | undefined = undefined;
  if (categoryHint && Array.isArray(categories) && categories.length > 0) {
    const match = categories.find((c) => {
      const n = (c.name || "").toLowerCase();
      if (categoryHint === "laptop") {
        return (
          n.includes("laptop") ||
          n.includes("macbook") ||
          n.includes("computer")
        );
      }
      if (categoryHint === "phone") return n.includes("phone");
      if (categoryHint === "tablet") {
        return n.includes("tablet") || n.includes("ipad");
      }
      if (categoryHint === "gaming") {
        return n.includes("gaming") || n.includes("console");
      }
      if (categoryHint === "watch") {
        return n.includes("watch") || n.includes("accessor");
      }
      return false;
    });
    if (match) matchedCategoryId = match._id;
  }

  return {
    brand: brand || undefined,
    isCustomBrand,
    modelNumber: modelNumber || undefined,
    series: series || undefined,
    color: color || undefined,
    storage: storage || undefined,
    processor: processor || undefined,
    ram: ram || undefined,
    gpu: gpu || undefined,
    screenSize: screenSize || undefined,
    condition,
    currentState,
    serialNumber,
    imeiNumber,
    batteryHealth,
    connectivity,
    categoryHint,
    matchedCategoryId,
    categoryAttributes: {
      color,
      storage,
      processor,
      ram,
      gpu,
      screenSize,
      condition,
      serialNumber,
      imeiNumber,
      batteryHealth,
      connectivity,
    },
  };
}
