import {
  normalizeLogoSettings,
  resolveLogoSettings,
  getPdfLogoStyles,
  getThermalReceiptLogoHtml,
  getWebLogoPreviewStyle,
} from "./logoHelper";
import { DEFAULT_LOGO_SETTINGS } from "@/features/shopkeeper/settings/types";

describe("logoHelper", () => {
  it("normalizes empty settings to default", () => {
    const result = normalizeLogoSettings(null);
    expect(result).toEqual(DEFAULT_LOGO_SETTINGS);
  });

  it("resolves logo settings from profile or defaults", () => {
    expect(resolveLogoSettings(null)).toEqual(DEFAULT_LOGO_SETTINGS);
    expect(resolveLogoSettings({ zoom: 1.8 })).toEqual(
      expect.objectContaining({ zoom: 1.8 }),
    );
  });

  it("clamps zoom and pan values within safe ranges", () => {
    const result = normalizeLogoSettings({
      zoom: 10,
      x: 250,
      y: -300,
      fit: "contain",
    });

    expect(result.zoom).toBe(4.0);
    expect(result.x).toBe(100);
    expect(result.y).toBe(-100);
    expect(result.fit).toBe("contain");
  });

  it("generates correct React-PDF styles", () => {
    const styles = getPdfLogoStyles(
      { zoom: 1.5, x: 10, y: -5, fit: "cover" },
      40,
      40,
    );

    expect(styles.container.width).toBe(40);
    expect(styles.container.height).toBe(40);
    expect(styles.container.overflow).toBe("hidden");
    expect(styles.image.width).toBe("150%");
    expect(styles.image.height).toBe("150%");
    expect(styles.image.left).toBe("10%");
    expect(styles.image.top).toBe("-5%");
    expect(styles.image.objectFit).toBe("cover");
  });

  it("generates thermal receipt HTML with logo styling", () => {
    const html = getThermalReceiptLogoHtml(
      "https://example.com/logo.png",
      "My Shop",
      {
        zoom: 1.2,
        x: 5,
        y: -2,
        fit: "contain",
      },
    );

    expect(html).toContain("logo-wrapper");
    expect(html).toContain("https://example.com/logo.png");
    expect(html).toContain("transform: translate(5%, -2%) scale(1.2)");
    expect(html).toContain("object-fit: contain");
  });

  it("generates web preview inline style object", () => {
    const style = getWebLogoPreviewStyle({
      zoom: 1.2,
      x: 20,
      y: -10,
      fit: "contain",
      rotation: 0,
    });

    expect(style.transform).toBe(
      "translate(20%, -10%) scale(1.2) rotate(0deg)",
    );
    expect(style.objectFit).toBe("contain");
  });
});
