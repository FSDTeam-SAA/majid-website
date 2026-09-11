import React, { forwardRef, useMemo } from "react";
import Barcode from "react-barcode";
import QRCode from "react-qr-code";
import { CommonLabelData } from "./types";
import { normalizeBarcodeValue } from "./barcodeUtils";

interface LabelPreviewProps {
  data: CommonLabelData;
  scale?: number;
  className?: string;
}

export const LabelPreview = forwardRef<HTMLDivElement, LabelPreviewProps>(
  ({ data, scale = 1, className = "" }, ref) => {
    const {
      itemName,
      sku,
      gtin,
      variationName,
      price,
      unitAbbreviation,
      barcode,
      barcodeFormat,
      labelWidth,
      labelHeight,
      unit,
      fields,
      currencySymbol = "£",
    } = data;

    // Normalize barcode format and payload
    const normalized = useMemo(() => {
      return normalizeBarcodeValue(barcode, barcodeFormat);
    }, [barcode, barcodeFormat]);

    // Compute dimensions in millimeters for standard internal scaling
    const widthMm = unit === "inch" ? labelWidth * 25.4 : labelWidth;
    const heightMm = unit === "inch" ? labelHeight * 25.4 : labelHeight;

    const isVeryCompact = heightMm <= 22 || widthMm <= 30;
    const isSquare = Math.abs(widthMm - heightMm) < 6 && heightMm <= 30;
    const isLarge = widthMm >= 90 && heightMm >= 90;

    // Calculate dynamic typography and barcode heights based on label physical dimensions
    const priceFontSize = isVeryCompact ? "11px" : isLarge ? "20px" : "13px";
    const titleFontSize = isVeryCompact ? "9px" : isLarge ? "14px" : "10px";
    const metaFontSize = isVeryCompact ? "8px" : isLarge ? "11px" : "8.5px";
    const barcodeHeight = isVeryCompact
      ? 16
      : isSquare
        ? 20
        : isLarge
          ? 55
          : Math.max(18, Math.min(Math.round(heightMm * 1.1), 32));
    const barcodeWidth = isVeryCompact ? 0.9 : isLarge ? 1.5 : 1.1;

    // Map format string to react-barcode format
    const reactBarcodeFormat: "CODE128" | "EAN13" | "EAN8" | "UPC" =
      useMemo(() => {
        switch (normalized.effectiveFormat) {
          case "EAN-13":
            return "EAN13";
          case "EAN-8":
            return "EAN8";
          case "UPC-A":
            return "UPC";
          case "CODE128":
          default:
            return "CODE128";
        }
      }, [normalized.effectiveFormat]);

    const displayVariation =
      fields.variationName && variationName ? variationName : "";

    const displayMeta = [
      fields.sku && sku ? `SKU: ${sku}` : null,
      fields.gtin && gtin ? `GTIN: ${gtin}` : null,
      fields.unitAbbreviation && unitAbbreviation ? unitAbbreviation : null,
    ]
      .filter(Boolean)
      .join(" • ");

    return (
      <div
        ref={ref}
        className={`bg-white text-black font-sans select-none overflow-hidden ${className}`}
        style={{
          width: unit === "inch" ? `${labelWidth}in` : `${labelWidth}mm`,
          height: unit === "inch" ? `${labelHeight}in` : `${labelHeight}mm`,
          padding: isVeryCompact ? "1.5mm" : isLarge ? "5mm" : "2.5mm",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          lineHeight: 1.15,
          transformOrigin: "top left",
          transform: scale !== 1 ? `scale(${scale})` : undefined,
        }}
      >
        {/* Header: Price & Brand/Model info */}
        <div className="flex items-start justify-between gap-1">
          {fields.price && price !== undefined && (
            <div
              className="font-black tracking-tight text-black"
              style={{ fontSize: priceFontSize }}
            >
              {currencySymbol}
              {price.toFixed(2)}
            </div>
          )}
          {data.location && (
            <div
              className="text-gray-500 uppercase font-bold tracking-wider truncate text-right ml-auto"
              style={{ fontSize: metaFontSize }}
            >
              {data.location}
            </div>
          )}
        </div>

        {/* Item Title & Variation */}
        {(fields.itemName || fields.variationName) && (
          <div
            className="font-semibold text-gray-900 leading-tight line-clamp-2 my-0.5"
            style={{
              fontSize: titleFontSize,
              maxHeight: isVeryCompact ? "22px" : "36px",
            }}
          >
            {fields.itemName && <span>{itemName}</span>}
            {displayVariation && (
              <span className="text-gray-600 font-normal">
                {" "}
                {displayVariation}
              </span>
            )}
          </div>
        )}

        {/* Metadata Line: SKU / GTIN / Unit */}
        {displayMeta && (
          <div
            className="text-gray-500 font-medium truncate"
            style={{ fontSize: metaFontSize }}
          >
            {displayMeta}
          </div>
        )}

        {/* Barcode / QR Code Area */}
        <div className="flex items-center justify-center pt-0.5 mt-auto overflow-hidden">
          {normalized.effectiveFormat === "QR Code" ? (
            <div className="flex flex-col items-center justify-center p-0.5">
              <div
                style={{
                  width: isVeryCompact ? 34 : isLarge ? 80 : 44,
                  height: isVeryCompact ? 34 : isLarge ? 80 : 44,
                }}
              >
                <QRCode
                  value={normalized.value}
                  size={isVeryCompact ? 34 : isLarge ? 80 : 44}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <span
                className="text-gray-600 font-mono mt-0.5"
                style={{ fontSize: "7px" }}
              >
                {normalized.value}
              </span>
            </div>
          ) : (
            <div className="max-w-full overflow-hidden flex justify-center">
              <Barcode
                value={normalized.value}
                format={reactBarcodeFormat}
                width={barcodeWidth}
                height={barcodeHeight}
                fontSize={isVeryCompact ? 7.5 : 9}
                margin={0}
                displayValue={true}
              />
            </div>
          )}
        </div>

        {/* Fallback Notice for User (if barcode was normalized/padded) */}
        {normalized.note && (
          <div
            className="text-[7px] text-amber-700 italic text-center print:hidden truncate"
            title={normalized.note}
          >
            ℹ️ {normalized.note}
          </div>
        )}
      </div>
    );
  },
);

LabelPreview.displayName = "LabelPreview";
