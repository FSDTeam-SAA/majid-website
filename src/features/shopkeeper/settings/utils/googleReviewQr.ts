import QRCode from "qrcode";

export const normalizeGoogleReviewPageUrl = (value?: string | null) => {
  const trimmed = value?.trim() || "";

  if (!trimmed) {
    return "";
  }

  try {
    const normalized = new URL(trimmed);
    if (!/^https?:$/i.test(normalized.protocol)) {
      return "";
    }

    return normalized.toString();
  } catch {
    return "";
  }
};

export const generateGoogleReviewQrCodeDataUrl = async (
  value?: string | null,
) => {
  const normalizedUrl = normalizeGoogleReviewPageUrl(value);

  if (!normalizedUrl) {
    return null;
  }

  const qrCodeDataUrl = await QRCode.toDataURL(normalizedUrl, {
    margin: 1,
    width: 220,
  });

  return {
    normalizedUrl,
    qrCodeDataUrl,
  };
};
