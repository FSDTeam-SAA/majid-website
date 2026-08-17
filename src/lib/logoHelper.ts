import { CSSProperties } from "react";
import {
  LogoSettings,
  DEFAULT_LOGO_SETTINGS,
} from "@/features/shopkeeper/settings/types";

const LOCAL_STORAGE_KEY = "imoscan_shopkeeper_logo_settings";

/**
 * Ensures LogoSettings has valid values with fallbacks to defaults.
 */
export function normalizeLogoSettings(
  settings?: Partial<LogoSettings> | null,
): LogoSettings {
  if (!settings) {
    return { ...DEFAULT_LOGO_SETTINGS };
  }

  const zoom =
    typeof settings.zoom === "number" && !isNaN(settings.zoom)
      ? Math.max(0.1, Math.min(4.0, settings.zoom))
      : DEFAULT_LOGO_SETTINGS.zoom;

  const x =
    typeof settings.x === "number" && !isNaN(settings.x)
      ? Math.max(-100, Math.min(100, settings.x))
      : DEFAULT_LOGO_SETTINGS.x;

  const y =
    typeof settings.y === "number" && !isNaN(settings.y)
      ? Math.max(-100, Math.min(100, settings.y))
      : DEFAULT_LOGO_SETTINGS.y;

  const validFits = ["contain", "cover", "fill", "none"] as const;
  const fit =
    settings.fit && (validFits as readonly string[]).includes(settings.fit)
      ? (settings.fit as "contain" | "cover" | "fill" | "none")
      : DEFAULT_LOGO_SETTINGS.fit;

  const rotation =
    typeof settings.rotation === "number" && !isNaN(settings.rotation)
      ? settings.rotation
      : DEFAULT_LOGO_SETTINGS.rotation;

  const backgroundColor =
    settings.backgroundColor || DEFAULT_LOGO_SETTINGS.backgroundColor;

  return {
    zoom,
    x,
    y,
    fit,
    rotation,
    backgroundColor,
  };
}

/**
 * Gets cached logo settings from localStorage (for immediate client-side responsiveness).
 */
export function getLocalLogoSettings(): LogoSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return normalizeLogoSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Saves logo settings to localStorage cache.
 */
export function setLocalLogoSettings(settings: LogoSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Resolves the active LogoSettings given user profile and local cache.
 */
export function resolveLogoSettings(
  profileSettings?: Partial<LogoSettings> | null,
): LogoSettings {
  if (
    profileSettings &&
    (profileSettings.zoom !== undefined || profileSettings.fit !== undefined)
  ) {
    return normalizeLogoSettings(profileSettings);
  }
  const local = getLocalLogoSettings();
  if (local) return local;
  return { ...DEFAULT_LOGO_SETTINGS };
}

/**
 * Generates styles for React-PDF (@react-pdf/renderer) logo container & image.
 */
export function getPdfLogoStyles(
  settings?: Partial<LogoSettings> | null,
  containerWidth = 36,
  containerHeight = 36,
) {
  const s = normalizeLogoSettings(settings);
  const zoomFactor = s.zoom || 1;

  return {
    container: {
      width: containerWidth,
      height: containerHeight,
      overflow: "hidden" as const,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      backgroundColor:
        s.backgroundColor === "white" ||
        s.backgroundColor === "#FFFFFF" ||
        s.backgroundColor === "#fff"
          ? "#FFFFFF"
          : "transparent",
      borderRadius: 6,
      marginRight: 8,
    },
    image: {
      width: `${Math.round(zoomFactor * 100)}%`,
      height: `${Math.round(zoomFactor * 100)}%`,
      objectFit: s.fit || "contain",
      position: "relative" as const,
      left: `${s.x || 0}%`,
      top: `${s.y || 0}%`,
    },
  };
}

/**
 * Generates inline CSS for HTML Thermal Receipts.
 */
export function getThermalReceiptLogoHtml(
  logoUrl: string,
  shopName: string,
  settings?: Partial<LogoSettings> | null,
): string {
  const s = normalizeLogoSettings(settings);
  const bg =
    s.backgroundColor && s.backgroundColor !== "transparent"
      ? `background-color: ${s.backgroundColor};`
      : "";

  return `
    <div class="logo-wrapper" style="width: auto; max-width: 48mm; max-height: 16mm; overflow: hidden; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px; border-radius: 4px; ${bg}">
      <img class="logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(shopName)}" style="display: block; max-width: 100%; max-height: 100%; object-fit: ${s.fit || "contain"}; transform: translate(${s.x || 0}%, ${s.y || 0}%) scale(${s.zoom || 1});" onerror="this.closest('.logo-wrapper').style.display='none';var b=this.closest('header').querySelector('.brand');if(b)b.style.display='block';" />
    </div>
  `.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates Web CSS preview styles for interactive UI.
 */
export function getWebLogoPreviewStyle(settings: LogoSettings): CSSProperties {
  return {
    transform: `translate(${settings.x}%, ${settings.y}%) scale(${settings.zoom}) rotate(${settings.rotation || 0}deg)`,
    transformOrigin: "center center",
    objectFit: settings.fit,
    transition: "transform 0.05s linear",
  };
}
