export type InvoiceTemplateCategory = "All" | "Modern" | "Traditional";

export interface InvoiceTemplateDefinition {
  id: string;
  name: string;
  category: "Modern" | "Traditional";
  description: string;
  isDefault?: boolean;
  primaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  headerColor?: string;
  badge?: string;
  fontFamily?: string;
  features: string[];
}

export const INVOICE_TEMPLATES: InvoiceTemplateDefinition[] = [
  {
    id: "default",
    name: "Default (Classic Teal)",
    category: "Modern",
    description:
      "The original emerald and teal invoice layout with clean item listing, metadata grid, and balanced total band.",
    isDefault: true,
    primaryColor: "#155E63",
    accentColor: "#84CC16",
    backgroundColor: "#FFFFFF",
    headerColor: "#F8FAFC",
    badge: "Current Theme",
    features: [
      "Standard emerald & lime accents",
      "Two-column customer & store panels",
      "Item IMEI / Model listing",
      "Dual status highlight",
    ],
  },
  {
    id: "classic-editorial",
    name: "Classic Editorial",
    category: "Traditional",
    description:
      "Distinguished serif typography, rich burgundy accents, crisp formal divider rules, and editorial billing structure.",
    isDefault: false,
    primaryColor: "#800020",
    accentColor: "#991B1B",
    backgroundColor: "#FFFFFF",
    headerColor: "#FFFFFF",
    badge: "Editorial Reference",
    fontFamily: "Times-Roman",
    features: [
      "Classic serif font styling",
      "Rich burgundy & wine accents",
      "Formal horizontal rule dividers",
      "Paid badge & barcode display",
    ],
  },
  {
    id: "warm-minimal",
    name: "Warm Minimalist",
    category: "Traditional",
    description:
      "Warm parchment backdrop, thin framing border, centered traditional letterhead, and elegant underlined items.",
    isDefault: false,
    primaryColor: "#1C1917",
    accentColor: "#84CC16",
    backgroundColor: "#FFFDEB",
    headerColor: "#FFFDEB",
    badge: "Warm Parchment",
    features: [
      "Warm cream / parchment paper tone",
      "Thin document framing border",
      "Centered brand header with letter spacing",
      "Pastel green highlight for Total & Paid",
    ],
  },
  {
    id: "neo-bold",
    name: "Neo Bold",
    category: "Modern",
    description:
      "High-contrast neo-brutalist styling with vibrant electric lime banners, rounded cards, and bold grotesque type.",
    isDefault: false,
    primaryColor: "#0F172A",
    accentColor: "#D4FF32",
    backgroundColor: "#FDF4F5",
    headerColor: "#D4FF32",
    badge: "Electric Lime",
    features: [
      "Electric lime top & bottom banners",
      "High-contrast black bold typography",
      "Segmented card-based layout",
      "Vibrant Total Amount callout card",
    ],
  },
  {
    id: "modern-retail",
    name: "Modern Retail",
    category: "Modern",
    description:
      "Contemporary retail invoice with calming sage green table header, checkmark paid badge, and customer promo banner.",
    isDefault: false,
    primaryColor: "#2D3748",
    accentColor: "#8EA085",
    backgroundColor: "#FFFFFF",
    headerColor: "#8EA085",
    badge: "Sage Retail",
    features: [
      "Calming sage green table banner",
      "Clean sans-serif modern header",
      "Circular checkmark PAID pill badge",
      "Customer trade-in / buyback promo footer",
    ],
  },
  {
    id: "nordic-modern",
    name: "Nordic Slate",
    category: "Modern",
    description:
      "Spacious Scandinavian design with extra-large typography, prominent total highlight box, and cool slate tones.",
    isDefault: false,
    primaryColor: "#0F172A",
    accentColor: "#84CC16",
    backgroundColor: "#FFFFFF",
    headerColor: "#F1F5F9",
    badge: "Nordic Slate",
    features: [
      "Extra-large bold INVOICE title",
      "Pill highlight on customer name",
      "Top-level Invoice Total prominent box",
      "Cool slate gray table header",
    ],
  },
];

export function getInvoiceTemplate(
  id?: string | null,
): InvoiceTemplateDefinition {
  if (!id) return INVOICE_TEMPLATES[0];
  const found = INVOICE_TEMPLATES.find((t) => t.id === id);
  return found || INVOICE_TEMPLATES[0];
}
