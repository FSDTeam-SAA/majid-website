export interface RepairColourOption {
  name: string;
  hex: string;
}

export const REPAIR_DEFAULT_COLOURS: RepairColourOption[] = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#DC2626" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Green", hex: "#16A34A" },
  { name: "Grey", hex: "#6B7280" },
  { name: "Black", hex: "#111827" },
  { name: "Silver", hex: "#C0C5CE" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#9333EA" },
  { name: "Orange", hex: "#F97316" },
  { name: "Brown", hex: "#78350F" },
];

export function colourHexFor(name?: string | null): string {
  const lower = (name || "").trim().toLowerCase();
  const match = REPAIR_DEFAULT_COLOURS.find((c) => c.name.toLowerCase() === lower);
  return match ? match.hex : "#94A3B8";
}

export const DEAD_DEVICE_CATEGORY = "Dead Device / No Power";

export interface RepairIssueCategoryConfig {
  id: string;
  label: string;
  defaultTime: string;
  defaultPrice: number;
  optionalPrice?: boolean;
  problems: string[];
}

export const REPAIR_ISSUE_CATEGORIES: RepairIssueCategoryConfig[] = [
  {
    id: DEAD_DEVICE_CATEGORY,
    label: DEAD_DEVICE_CATEGORY,
    defaultTime: "Diagnostic Needed",
    defaultPrice: 0,
    optionalPrice: true,
    problems: [
      "Will not turn on",
      "No charging draw",
      "Stuck on logo / boot loop",
      "Liquid / water damage",
      "Shorted motherboard / PMIC",
      "Battery completely drained",
    ],
  },
  {
    id: "Screen / Display",
    label: "Screen / Display",
    defaultTime: "1–2 Hours",
    defaultPrice: 120,
    problems: [
      "Cracked / Broken",
      "Touch Not Responding",
      "Lines on Screen",
      "Flickering",
      "No Display",
      "Other",
    ],
  },
  {
    id: "Battery / Charging Issue",
    label: "Battery / Charging Issue",
    defaultTime: "30–60 Mins",
    defaultPrice: 45,
    problems: [
      "Draining Fast",
      "Not Charging",
      "Swollen Battery",
      "Overheating",
      "Restarting Randomly",
      "Other",
    ],
  },
  {
    id: "Charging Port",
    label: "Charging Port",
    defaultTime: "1 Hour",
    defaultPrice: 55,
    problems: [
      "Loose Cable",
      "Slow Charging",
      "No Power",
      "Damaged Pins",
      "Debris in Port",
    ],
  },
  {
    id: "Back Cover / Housing",
    label: "Back Cover / Housing",
    defaultTime: "2–3 Hours",
    defaultPrice: 70,
    problems: ["Cracked Glass", "Bent Frame", "Scratched", "Dented"],
  },
  {
    id: "Camera - Front / Rear",
    label: "Camera - Front / Rear",
    defaultTime: "1–2 Hours",
    defaultPrice: 80,
    problems: ["Blurry Images", "Black Screen", "Cracked Lens", "Focus Issue"],
  },
  {
    id: "Speaker / Microphone",
    label: "Speaker / Microphone",
    defaultTime: "1–2 Hours",
    defaultPrice: 50,
    problems: ["No Sound", "Distorted Audio", "Mic Not Working on Calls", "Low Volume"],
  },
  {
    id: "Buttons",
    label: "Buttons",
    defaultTime: "1 Hour",
    defaultPrice: 45,
    problems: ["Power Button Stuck", "Volume Buttons Broken", "Mute Switch Faulty"],
  },
  {
    id: "Water / Liquid Damage",
    label: "Water / Liquid Damage",
    defaultTime: "1–3 Days",
    defaultPrice: 0,
    optionalPrice: true,
    problems: ["Liquid Spill", "Submerged in Water", "Corrosion Visible"],
  },
  {
    id: "Software / Network",
    label: "Software / Network",
    defaultTime: "1–2 Hours",
    defaultPrice: 40,
    problems: [
      "Bootloop / Apple Logo",
      "No Signal / SIM Failure",
      "WiFi Issue",
      "FRP / Google Lock",
    ],
  },
  {
    id: "Motherboard / Logic Board",
    label: "Motherboard / Logic Board",
    defaultTime: "2–5 Days",
    defaultPrice: 0,
    optionalPrice: true,
    problems: [
      "Short circuit / power IC",
      "No network / Baseband",
      "Audio IC fault",
      "Data recovery",
    ],
  },
];

export function isIssuePriceOptional(categoryName?: string | null): boolean {
  const lower = (categoryName || "").trim().toLowerCase();
  return (
    lower.includes("dead device") ||
    lower.includes("no power") ||
    lower.includes("water") ||
    lower.includes("liquid") ||
    lower.includes("motherboard")
  );
}

export function issueCategoryFromRaw(raw: Record<string, any>): string {
  return String(raw?.category || raw?.issueCategory || "Repair Issue").trim();
}

export function issueProblemsFromRaw(raw: Record<string, any>): string[] {
  const list = raw?.problems ?? raw?.commonProblems;
  if (Array.isArray(list)) {
    return list.map((x) => String(x || "").trim()).filter(Boolean);
  }
  if (typeof list === "string" && list.trim()) return [list.trim()];
  return [];
}

export function issuePriceFromRaw(raw: Record<string, any>): number {
  const val = Number(raw?.estimatedPrice ?? raw?.price ?? 0);
  return Number.isFinite(val) && val >= 0 ? val : 0;
}

export function formatDeviceCatalogTitle(brand: string, modelName: string): string {
  const b = (brand || "").trim();
  const m = (modelName || "").trim();
  if (!m) return b;
  if (!b) return m;
  if (m.toLowerCase().startsWith(b.toLowerCase())) return m;
  return `${b} ${m}`;
}

export function resolveCanonicalBarcode(repair: Record<string, any>): string {
  const rawOrder = String(repair?.orderNumber || "").trim();
  if (rawOrder) {
    return rawOrder.replace(/^#+/, "").toUpperCase();
  }
  const id = String(repair?._id || repair?.id || "").trim();
  if (id) {
    const suffix = id.length > 5 ? id.slice(-5) : id;
    return `R-${suffix.toUpperCase()}`;
  }
  return "R-JOB";
}
