export interface TradeInGrade {
  name: string;
  price: number;
  weeklyChange: number;
  trend: "up" | "down" | "none";
}

export interface TradeInDevice {
  id: string;
  brand: string;
  category: string;
  deviceName: string;
  modelNumber: string;
  storage: string;
  color: string;
  imageUrl?: string;
  upc?: string;
  ean?: string;
  grades: {
    A: TradeInGrade;
    B: TradeInGrade;
    C: TradeInGrade;
  };
  lastUpdated: string;
  source: string;
}

const QUERY_ALIASES: Array<[RegExp, string]> = [
  [/\bps5\b/g, "playstation 5"],
  [/\bps4\b/g, "playstation 4"],
  [/\bps3\b/g, "playstation 3"],
  [/\bps2\b/g, "playstation 2"],
  [/\bps1\b|\bpsone\b/g, "playstation"],
  [/\bmbp\b/g, "macbook pro"],
  [/\bmba\b/g, "macbook air"],
];

const EXACT_ONLY_TOKENS = new Set([
  "pro",
  "air",
  "max",
  "mini",
  "plus",
  "duo",
  "neo",
  "red",
  "one",
  "se",
  "fe",
  "xr",
  "xs",
  "tab",
]);

const BRAND_PREFIX_RE = /^(apple|samsung|sony|microsoft|nintendo)\s+/i;

function normalizeQuery(raw: string): string {
  let q = raw.trim().toLowerCase();
  for (const [pattern, replacement] of QUERY_ALIASES) {
    q = q.replace(pattern, replacement);
  }
  return q.replace(/\s+/g, " ").trim();
}

export function tokenizeField(text: string): string[] {
  const cleaned = text.toLowerCase().replace(/\(product\)/g, " ");
  const rawTokens = cleaned.match(/[a-z0-9+.-]+/g) || [];
  const out = new Set<string>();

  for (const tok of rawTokens) {
    const parts = tok.split(/[.-]+/).filter(Boolean);
    const candidates = parts.length > 1 ? [tok, ...parts] : [tok];
    for (const item of candidates) {
      if (!item) continue;
      out.add(item);
      if (item.endsWith("+") && item.length > 1) {
        out.add(item.slice(0, -1));
      }
      const unitMatch = item.match(/^(\d+)(gb|tb|mb|mm)$/);
      if (unitMatch) {
        out.add(unitMatch[1]);
      }
    }
  }
  return Array.from(out);
}

function tokenMatches(
  tokens: string[],
  modelTokens: string[],
  queryToken: string
): "exact" | "prefix" | false {
  if (tokens.includes(queryToken)) {
    return "exact";
  }

  const isPureDigits = /^\d+$/.test(queryToken);
  if (isPureDigits) {
    return false;
  }

  const isAlphaNumCode = /^[a-z]+\d+[a-z]*$/.test(queryToken);
  if (isAlphaNumCode) {
    if (queryToken.length >= 3 && modelTokens.some((t) => t.startsWith(queryToken))) {
      return "prefix";
    }
    return false;
  }

  if (queryToken.length >= 3 && !EXACT_ONLY_TOKENS.has(queryToken)) {
    if (tokens.some((t) => t.startsWith(queryToken))) {
      return "prefix";
    }
  }

  return false;
}

function parseStorageGb(storage: string): number {
  const m = storage.match(/(\d+)\s*(TB|GB|MB)/i);
  if (!m) return Number.MAX_SAFE_INTEGER;
  const val = Number(m[1]);
  const unit = m[2].toUpperCase();
  if (unit === "TB") return val * 1024;
  if (unit === "GB") return val;
  return val / 1024;
}

export function searchTradeInDevices(
  catalog: TradeInDevice[],
  rawQuery: string,
  limit = 30
): TradeInDevice[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) return [];

  // Barcode scan: pure digits of length >= 8 matches UPC/EAN only
  if (/^\d{8,}$/.test(trimmed)) {
    const normalizedNoZero = trimmed.replace(/^0+/, "");
    return catalog
      .filter((d) => {
        const upc = (d.upc || "").trim();
        const ean = (d.ean || "").trim();
        return (
          upc === trimmed ||
          ean === trimmed ||
          (normalizedNoZero.length >= 8 &&
            (upc.replace(/^0+/, "") === normalizedNoZero ||
              ean.replace(/^0+/, "") === normalizedNoZero)) ||
          upc.startsWith(trimmed) ||
          ean.startsWith(trimmed)
        );
      })
      .slice(0, limit);
  }

  const query = normalizeQuery(trimmed);
  if (!query) return [];
  const queryTokens = query.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return [];

  const queryNoBrand = query.replace(BRAND_PREFIX_RE, "").trim();
  const queryNoBrandTokens = queryNoBrand.split(/\s+/).filter(Boolean);

  const scored: Array<{ device: TradeInDevice; score: number }> = [];

  for (const device of catalog) {
    const nameTokens = tokenizeField(`${device.brand} ${device.deviceName}`);
    const modelTokens = tokenizeField(device.modelNumber || "");
    const extraTokens = tokenizeField(`${device.storage} ${device.color}`);
    const allTokens = [...nameTokens, ...modelTokens, ...extraTokens];

    let allMatched = true;
    let nameMatches = 0;
    let exactMatches = 0;

    for (const qt of queryTokens) {
      const mAll = tokenMatches(allTokens, modelTokens, qt);
      if (!mAll) {
        allMatched = false;
        break;
      }
      if (mAll === "exact") exactMatches += 1;
      if (tokenMatches(nameTokens, modelTokens, qt)) {
        nameMatches += 1;
      }
    }

    if (!allMatched) continue;

    const fullName = device.deviceName.toLowerCase();
    const shortName = fullName.replace(BRAND_PREFIX_RE, "").trim();
    const shortModel = shortName.replace(/^galaxy\s+/i, "").trim();
    const cleanModel = (device.modelNumber || "")
      .replace(/^Model\s*/i, "")
      .trim()
      .toLowerCase();

    let score = 0;
    const isExact =
      shortName === query ||
      shortName === queryNoBrand ||
      shortName === `iphone ${queryNoBrand}` ||
      shortModel === query ||
      shortModel === queryNoBrand ||
      fullName === query;

    // Exact model or device name matches get highest rank
    if (isExact) {
      score += 10000;
    } else if (cleanModel && cleanModel === query) {
      score += 9000;
    } else if (
      shortName.startsWith(query) ||
      (queryNoBrand && shortName.startsWith(queryNoBrand)) ||
      (queryNoBrand && shortModel.startsWith(queryNoBrand)) ||
      fullName.startsWith(query)
    ) {
      score += 5000;
    } else if (
      shortName.includes(query) ||
      (queryNoBrand && shortName.includes(queryNoBrand)) ||
      fullName.includes(query)
    ) {
      score += 3500;
    }

    if (nameMatches === queryTokens.length) {
      score += 2000;
    } else {
      score += nameMatches * 300;
    }

    score += exactMatches * 150;

    // Penalize extra unmatched words in deviceName so "iPhone 15" beats "iPhone 15 Pro Max"
    const shortNameWords = shortName.split(/\s+/).filter(Boolean);
    const extraWords = Math.max(0, shortNameWords.length - queryNoBrandTokens.length);
    score -= extraWords * 50;

    // Among broad non-exact family matches (e.g. "iPad Pro", "MacBook Pro"), prefer current higher-tier releases over 2012 legacy entries
    if (!isExact) {
      score += Math.min(400, Math.round((device.grades?.B?.price || 0) / 3));
    }

    scored.push({ device, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const nameCmp = a.device.deviceName.localeCompare(b.device.deviceName);
    if (nameCmp !== 0) return nameCmp;
    const stA = parseStorageGb(a.device.storage);
    const stB = parseStorageGb(b.device.storage);
    if (stA !== stB) return stA - stB;
    return a.device.color.localeCompare(b.device.color);
  });

  return scored.slice(0, limit).map((s) => s.device);
}
