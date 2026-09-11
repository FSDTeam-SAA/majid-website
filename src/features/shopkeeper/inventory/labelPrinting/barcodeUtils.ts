import { BarcodeFormat } from "./types";

/**
 * Calculates EAN-13 checksum digit for a 12-digit string
 */
function calculateEan13Checksum(digits12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return check.toString();
}

/**
 * Calculates EAN-8 checksum digit for a 7-digit string
 */
function calculateEan8Checksum(digits7: string): string {
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const digit = parseInt(digits7[i], 10);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const check = (10 - (sum % 10)) % 10;
  return check.toString();
}

/**
 * Calculates UPC-A checksum digit for an 11-digit string
 */
function calculateUpcaChecksum(digits11: string): string {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(digits11[i], 10);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const check = (10 - (sum % 10)) % 10;
  return check.toString();
}

/**
 * Validates and sanitizes a value for the target barcode format.
 * Returns the normalized barcode value and whether any fallback occurred.
 */
export function normalizeBarcodeValue(
  rawValue: string,
  format: BarcodeFormat,
): { value: string; effectiveFormat: BarcodeFormat; note?: string } {
  const cleanRaw = (rawValue || "000000").trim();

  if (format === "QR Code") {
    return {
      value: cleanRaw,
      effectiveFormat: "QR Code",
    };
  }

  if (format === "CODE128") {
    // Code 128 accepts standard ASCII
    return {
      value: cleanRaw.length > 0 ? cleanRaw : "000000",
      effectiveFormat: "CODE128",
    };
  }

  // Extract only numeric digits for 1D retail symbologies
  const numericOnly = cleanRaw.replace(/\D/g, "");

  if (format === "EAN-13") {
    if (numericOnly.length >= 13) {
      return {
        value: numericOnly.slice(0, 13),
        effectiveFormat: "EAN-13",
      };
    }
    if (numericOnly.length === 12) {
      const check = calculateEan13Checksum(numericOnly);
      return {
        value: numericOnly + check,
        effectiveFormat: "EAN-13",
      };
    }
    if (numericOnly.length > 0) {
      // Pad to 12 digits then add check
      const padded12 = numericOnly.padStart(12, "0").slice(-12);
      const check = calculateEan13Checksum(padded12);
      return {
        value: padded12 + check,
        effectiveFormat: "EAN-13",
        note: "Padded to 13 digits for EAN-13",
      };
    }
    // If no digits exist in rawValue (e.g. "ITEM-SKU"), fall back gracefully to CODE128
    return {
      value: cleanRaw,
      effectiveFormat: "CODE128",
      note: "Switched to Code 128 (alphanumeric SKU not compatible with EAN-13)",
    };
  }

  if (format === "EAN-8") {
    if (numericOnly.length >= 8) {
      return {
        value: numericOnly.slice(0, 8),
        effectiveFormat: "EAN-8",
      };
    }
    if (numericOnly.length === 7) {
      const check = calculateEan8Checksum(numericOnly);
      return {
        value: numericOnly + check,
        effectiveFormat: "EAN-8",
      };
    }
    if (numericOnly.length > 0) {
      const padded7 = numericOnly.padStart(7, "0").slice(-7);
      const check = calculateEan8Checksum(padded7);
      return {
        value: padded7 + check,
        effectiveFormat: "EAN-8",
        note: "Padded to 8 digits for EAN-8",
      };
    }
    return {
      value: cleanRaw,
      effectiveFormat: "CODE128",
      note: "Switched to Code 128 (requires numbers for EAN-8)",
    };
  }

  if (format === "UPC-A") {
    if (numericOnly.length >= 12) {
      return {
        value: numericOnly.slice(0, 12),
        effectiveFormat: "UPC-A",
      };
    }
    if (numericOnly.length === 11) {
      const check = calculateUpcaChecksum(numericOnly);
      return {
        value: numericOnly + check,
        effectiveFormat: "UPC-A",
      };
    }
    if (numericOnly.length > 0) {
      const padded11 = numericOnly.padStart(11, "0").slice(-11);
      const check = calculateUpcaChecksum(padded11);
      return {
        value: padded11 + check,
        effectiveFormat: "UPC-A",
        note: "Padded to 12 digits for UPC-A",
      };
    }
    return {
      value: cleanRaw,
      effectiveFormat: "CODE128",
      note: "Switched to Code 128 (requires numbers for UPC-A)",
    };
  }

  return {
    value: cleanRaw,
    effectiveFormat: "CODE128",
  };
}
