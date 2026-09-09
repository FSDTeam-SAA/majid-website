export interface CatalogDevice {
  brand: string;
  itemName: string;
  storage?: string;
  storages: string[];
  color?: string;
  colors: string[];
  currentState: "new" | "good condition";
}

export const COMMON_STORAGES = [
  "32GB",
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
  "2TB",
];

export const COMMON_COLORS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Space Gray",
  "Space Black",
  "Midnight",
  "Starlight",
  "Gold",
  "Rose Gold",
  "Natural Titanium",
  "Black Titanium",
  "White Titanium",
  "Blue Titanium",
  "Desert Titanium",
  "Titanium Gray",
  "Titanium Black",
  "Phantom Black",
  "Cream",
  "Green",
  "Blue",
  "Deep Purple",
  "Purple",
  "Red",
  "Yellow",
  "Obsidian",
  "Porcelain",
  "Hazel",
  "Rose",
  "Mint",
];

export const COMMON_CONDITIONS = [
  "new",
  "good condition",
  "used",
  "refurbished",
];

export const DEVICE_CATALOG: CatalogDevice[] = [
  // ── Apple iPhone 16 Series ──
  {
    brand: "Apple",
    itemName: "Apple iPhone 16 Pro Max",
    storages: ["256GB", "512GB", "1TB"],
    colors: [
      "Natural Titanium",
      "Desert Titanium",
      "White Titanium",
      "Black Titanium",
    ],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 16 Pro",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: [
      "Natural Titanium",
      "Desert Titanium",
      "White Titanium",
      "Black Titanium",
    ],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 16 Plus",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Black", "White", "Pink", "Teal", "Ultramarine"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 16",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Black", "White", "Pink", "Teal", "Ultramarine"],
    currentState: "new",
  },

  // ── Apple iPhone 15 Series ──
  {
    brand: "Apple",
    itemName: "Apple iPhone 15 Pro Max",
    storages: ["256GB", "512GB", "1TB"],
    colors: [
      "Natural Titanium",
      "Blue Titanium",
      "White Titanium",
      "Black Titanium",
    ],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 15 Pro",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: [
      "Natural Titanium",
      "Blue Titanium",
      "White Titanium",
      "Black Titanium",
    ],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 15 Plus",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Black", "Blue", "Green", "Yellow", "Pink"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 15",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Black", "Blue", "Green", "Yellow", "Pink"],
    currentState: "new",
  },

  // ── Apple iPhone 14 Series ──
  {
    brand: "Apple",
    itemName: "Apple iPhone 14 Pro Max",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Space Black", "Silver", "Gold", "Deep Purple"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 14 Pro",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Space Black", "Silver", "Gold", "Deep Purple"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 14 Plus",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Midnight", "Starlight", "Blue", "Purple", "Red", "Yellow"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 14",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Midnight", "Starlight", "Blue", "Purple", "Red", "Yellow"],
    currentState: "new",
  },

  // ── Apple iPhone 13 Series ──
  {
    brand: "Apple",
    itemName: "Apple iPhone 13 Pro Max",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 13 Pro",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 13",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Midnight", "Starlight", "Blue", "Pink", "Green", "Red"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 13 mini",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Midnight", "Starlight", "Blue", "Pink", "Green", "Red"],
    currentState: "new",
  },

  // ── Apple iPhone 12 & 11 Series ──
  {
    brand: "Apple",
    itemName: "Apple iPhone 12 Pro Max",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Graphite", "Silver", "Gold", "Pacific Blue"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 12 Pro",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Graphite", "Silver", "Gold", "Pacific Blue"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 12",
    storages: ["64GB", "128GB", "256GB"],
    colors: ["Black", "White", "Blue", "Green", "Purple", "Red"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 11 Pro Max",
    storages: ["64GB", "256GB", "512GB"],
    colors: ["Space Gray", "Silver", "Gold", "Midnight Green"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone 11",
    storages: ["64GB", "128GB", "256GB"],
    colors: ["Black", "White", "Purple", "Yellow", "Green", "Red"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPhone SE (3rd generation)",
    storages: ["64GB", "128GB", "256GB"],
    colors: ["Midnight", "Starlight", "Red"],
    currentState: "new",
  },

  // ── Apple iPad ──
  {
    brand: "Apple",
    itemName: "Apple iPad Pro 11-inch (M4)",
    storages: ["256GB", "512GB", "1TB", "2TB"],
    colors: ["Space Black", "Silver"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPad Pro 13-inch (M4)",
    storages: ["256GB", "512GB", "1TB", "2TB"],
    colors: ["Space Black", "Silver"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPad Air 11-inch (M2)",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Space Gray", "Starlight", "Purple", "Blue"],
    currentState: "new",
  },
  {
    brand: "Apple",
    itemName: "Apple iPad (10th generation)",
    storages: ["64GB", "256GB"],
    colors: ["Silver", "Blue", "Pink", "Yellow"],
    currentState: "new",
  },

  // ── Samsung Galaxy S25 & S24 Series ──
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S25 Ultra",
    storages: ["256GB", "512GB", "1TB"],
    colors: [
      "Titanium Silver",
      "Titanium Black",
      "Titanium Gray",
      "Titanium Blue",
    ],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S25+",
    storages: ["256GB", "512GB"],
    colors: [
      "Moon Night Blue",
      "Silver Shadow",
      "Sparking Blue",
      "Sparking Green",
    ],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S25",
    storages: ["128GB", "256GB", "512GB"],
    colors: [
      "Moon Night Blue",
      "Silver Shadow",
      "Sparking Blue",
      "Sparking Green",
    ],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S24 Ultra",
    storages: ["256GB", "512GB", "1TB"],
    colors: [
      "Titanium Gray",
      "Titanium Black",
      "Titanium Violet",
      "Titanium Yellow",
    ],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S24+",
    storages: ["256GB", "512GB"],
    colors: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S24",
    storages: ["128GB", "256GB"],
    colors: ["Onyx Black", "Marble Gray", "Cobalt Violet", "Amber Yellow"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S24 FE",
    storages: ["128GB", "256GB"],
    colors: ["Blue", "Graphite", "Gray", "Mint", "Yellow"],
    currentState: "new",
  },

  // ── Samsung Galaxy S23 & S22 Series ──
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S23 Ultra",
    storages: ["256GB", "512GB", "1TB"],
    colors: ["Phantom Black", "Cream", "Green", "Lavender"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S23+",
    storages: ["256GB", "512GB"],
    colors: ["Phantom Black", "Cream", "Green", "Lavender"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S23",
    storages: ["128GB", "256GB"],
    colors: ["Phantom Black", "Cream", "Green", "Lavender"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy S22 Ultra",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Phantom Black", "Phantom White", "Burgundy", "Green"],
    currentState: "new",
  },

  // ── Samsung Galaxy Fold / Flip ──
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy Z Fold 6",
    storages: ["256GB", "512GB", "1TB"],
    colors: ["Silver Shadow", "Navy", "Pink"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy Z Flip 6",
    storages: ["256GB", "512GB"],
    colors: ["Silver Shadow", "Blue", "Mint", "Yellow"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy Z Fold 5",
    storages: ["256GB", "512GB", "1TB"],
    colors: ["Icy Blue", "Phantom Black", "Cream"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy Z Flip 5",
    storages: ["256GB", "512GB"],
    colors: ["Mint", "Graphite", "Cream", "Lavender"],
    currentState: "new",
  },

  // ── Samsung Galaxy A Series ──
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy A55 5G",
    storages: ["128GB", "256GB"],
    colors: [
      "Awesome Iceblue",
      "Awesome Navy",
      "Awesome Lilac",
      "Awesome Lemon",
    ],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy A54 5G",
    storages: ["128GB", "256GB"],
    colors: [
      "Awesome Graphite",
      "Awesome White",
      "Awesome Violet",
      "Awesome Lime",
    ],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy A35 5G",
    storages: ["128GB", "256GB"],
    colors: [
      "Awesome Navy",
      "Awesome Iceblue",
      "Awesome Lilac",
      "Awesome Lemon",
    ],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy A25 5G",
    storages: ["128GB", "256GB"],
    colors: ["Brave Black", "Personality Yellow", "Fantasy Blue", "Blue Black"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy A15",
    storages: ["128GB", "256GB"],
    colors: ["Blue Black", "Blue", "Light Blue", "Yellow"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy A14",
    storages: ["64GB", "128GB"],
    colors: ["Black", "Light Green", "Silver"],
    currentState: "new",
  },
  {
    brand: "Samsung",
    itemName: "Samsung Galaxy A05s",
    storages: ["64GB", "128GB"],
    colors: ["Black", "Silver", "Light Green"],
    currentState: "new",
  },

  // ── Google Pixel ──
  {
    brand: "Google",
    itemName: "Google Pixel 9 Pro XL",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"],
    currentState: "new",
  },
  {
    brand: "Google",
    itemName: "Google Pixel 9 Pro",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"],
    currentState: "new",
  },
  {
    brand: "Google",
    itemName: "Google Pixel 9",
    storages: ["128GB", "256GB"],
    colors: ["Obsidian", "Porcelain", "Wintergreen", "Peony"],
    currentState: "new",
  },
  {
    brand: "Google",
    itemName: "Google Pixel 8 Pro",
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Obsidian", "Porcelain", "Bay", "Mint"],
    currentState: "new",
  },
  {
    brand: "Google",
    itemName: "Google Pixel 8",
    storages: ["128GB", "256GB"],
    colors: ["Obsidian", "Hazel", "Rose", "Mint"],
    currentState: "new",
  },
  {
    brand: "Google",
    itemName: "Google Pixel 8a",
    storages: ["128GB", "256GB"],
    colors: ["Obsidian", "Porcelain", "Bay", "Aloe"],
    currentState: "new",
  },
  {
    brand: "Google",
    itemName: "Google Pixel 7 Pro",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Obsidian", "Snow", "Hazel"],
    currentState: "new",
  },
  {
    brand: "Google",
    itemName: "Google Pixel 7",
    storages: ["128GB", "256GB"],
    colors: ["Obsidian", "Snow", "Lemongrass"],
    currentState: "new",
  },
  {
    brand: "Google",
    itemName: "Google Pixel 7a",
    storages: ["128GB"],
    colors: ["Charcoal", "Snow", "Sea", "Coral"],
    currentState: "new",
  },

  // ── Xiaomi / Redmi / Poco ──
  {
    brand: "Xiaomi",
    itemName: "Xiaomi 14 Ultra",
    storages: ["256GB", "512GB", "1TB"],
    colors: ["Black", "White", "Blue"],
    currentState: "new",
  },
  {
    brand: "Xiaomi",
    itemName: "Xiaomi 14",
    storages: ["256GB", "512GB"],
    colors: ["Black", "White", "Jade Green"],
    currentState: "new",
  },
  {
    brand: "Xiaomi",
    itemName: "Xiaomi 13T Pro",
    storages: ["256GB", "512GB", "1TB"],
    colors: ["Alpine Blue", "Meadow Green", "Black"],
    currentState: "new",
  },
  {
    brand: "Xiaomi",
    itemName: "Xiaomi Redmi Note 13 Pro+ 5G",
    storages: ["256GB", "512GB"],
    colors: ["Midnight Black", "Moonlight White", "Aurora Purple"],
    currentState: "new",
  },
  {
    brand: "Xiaomi",
    itemName: "Xiaomi Redmi Note 13 Pro",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Midnight Black", "Lavender Purple", "Forest Green"],
    currentState: "new",
  },
  {
    brand: "Xiaomi",
    itemName: "Xiaomi Redmi Note 13",
    storages: ["128GB", "256GB"],
    colors: ["Midnight Black", "Mint Green", "Ice Blue"],
    currentState: "new",
  },
  {
    brand: "Xiaomi",
    itemName: "Xiaomi Redmi Note 12 Pro",
    storages: ["128GB", "256GB"],
    colors: ["Frosted Blue", "Onyx Black", "Polar White"],
    currentState: "new",
  },
  {
    brand: "Xiaomi",
    itemName: "Xiaomi Redmi 13C",
    storages: ["128GB", "256GB"],
    colors: ["Midnight Black", "Navy Blue", "Glacier White", "Clover Green"],
    currentState: "new",
  },
  {
    brand: "Poco",
    itemName: "Poco X6 Pro",
    storages: ["256GB", "512GB"],
    colors: ["Black", "Yellow", "Grey"],
    currentState: "new",
  },
  {
    brand: "Poco",
    itemName: "Poco F6 Pro",
    storages: ["256GB", "512GB", "1TB"],
    colors: ["Black", "White"],
    currentState: "new",
  },

  // ── OnePlus ──
  {
    brand: "OnePlus",
    itemName: "OnePlus 12",
    storages: ["256GB", "512GB"],
    colors: ["Silky Black", "Flowy Emerald"],
    currentState: "new",
  },
  {
    brand: "OnePlus",
    itemName: "OnePlus 12R",
    storages: ["128GB", "256GB"],
    colors: ["Iron Gray", "Cool Blue"],
    currentState: "new",
  },
  {
    brand: "OnePlus",
    itemName: "OnePlus 11",
    storages: ["128GB", "256GB"],
    colors: ["Titan Black", "Eternal Green"],
    currentState: "new",
  },
  {
    brand: "OnePlus",
    itemName: "OnePlus Nord 4",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Nordic Hang", "Oasis Green", "Obsidian Midnight"],
    currentState: "new",
  },
  {
    brand: "OnePlus",
    itemName: "OnePlus Nord CE 4",
    storages: ["128GB", "256GB"],
    colors: ["Dark Chrome", "Celadon Marble"],
    currentState: "new",
  },

  // ── Vivo / iQOO / Oppo / Realme ──
  {
    brand: "Vivo",
    itemName: "Vivo V30 Pro",
    storages: ["256GB", "512GB"],
    colors: ["Andaman Blue", "Classic Black"],
    currentState: "new",
  },
  {
    brand: "Vivo",
    itemName: "Vivo V30",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Andaman Blue", "Peacock Green", "Classic Black"],
    currentState: "new",
  },
  {
    brand: "Vivo",
    itemName: "Vivo Y200",
    storages: ["128GB", "256GB"],
    colors: ["Desert Gold", "Jungle Green"],
    currentState: "new",
  },
  {
    brand: "Oppo",
    itemName: "Oppo Reno 12 Pro",
    storages: ["256GB", "512GB"],
    colors: ["Space Brown", "Sunset Gold"],
    currentState: "new",
  },
  {
    brand: "Oppo",
    itemName: "Oppo A78",
    storages: ["128GB", "256GB"],
    colors: ["Glowing Black", "Aqua Green"],
    currentState: "new",
  },
  {
    brand: "Realme",
    itemName: "Realme 12 Pro+ 5G",
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Submarine Blue", "Navigator Beige"],
    currentState: "new",
  },
  {
    brand: "Realme",
    itemName: "Realme C67",
    storages: ["128GB", "256GB"],
    colors: ["Sunny Oasis", "Black Rock"],
    currentState: "new",
  },
];

/**
 * Searches the common device catalog with case-insensitive multi-word matching.
 */
export function searchDeviceCatalog(
  query: string,
  limit = 25,
): CatalogDevice[] {
  const q = (query || "").trim().toLowerCase();
  if (!q) {
    return DEVICE_CATALOG.slice(0, limit);
  }

  const queryTerms = q.split(/\s+/).filter(Boolean);

  return DEVICE_CATALOG.filter((device) => {
    const target =
      `${device.brand} ${device.itemName} ${device.storages.join(" ")} ${device.colors.join(" ")}`.toLowerCase();
    return queryTerms.every((term) => target.includes(term));
  }).slice(0, limit);
}
