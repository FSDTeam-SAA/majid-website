import React, { useMemo } from "react";
import { CommonLabelData } from "./types";
import { LabelPreview } from "./LabelPreview";

interface DimensionGuidePreviewProps {
  data: CommonLabelData;
  layoutWidthMm: number;
  layoutHeightMm: number;
  className?: string;
}

/**
 * Renders the dimensioned visual diagram matching Image 2 ("Choose label sizes easily").
 * Displays physical millimeter indicators (<--- 32 mm ---> and <--- 57 mm --->)
 * around the live label preview with dimension guide lines.
 * Automatically scales down large labels (such as Epson 4x6" or 80mm) to prevent horizontal overflow.
 */
export const DimensionGuidePreview: React.FC<DimensionGuidePreviewProps> = ({
  data,
  layoutWidthMm,
  layoutHeightMm,
  className = "",
}) => {
  const {
    scale,
    naturalWidthPx,
    naturalHeightPx,
    displayWidthPx,
    displayHeightPx,
  } = useMemo(() => {
    const widthMm =
      data.unit === "inch" ? data.labelWidth * 25.4 : data.labelWidth;
    const heightMm =
      data.unit === "inch" ? data.labelHeight * 25.4 : data.labelHeight;

    const pxPerMm = 3.7795;
    const naturalW = Math.max(1, Math.round(widthMm * pxPerMm));
    const naturalH = Math.max(1, Math.round(heightMm * pxPerMm));

    // Maximum bounding box inside the modal column
    const MAX_PREVIEW_W = 240;
    const MAX_PREVIEW_H = 145;

    const s = Math.min(1, MAX_PREVIEW_W / naturalW, MAX_PREVIEW_H / naturalH);
    const dispW = Math.round(naturalW * s);
    const dispH = Math.round(naturalH * s);

    return {
      scale: s,
      naturalWidthPx: naturalW,
      naturalHeightPx: naturalH,
      displayWidthPx: dispW,
      displayHeightPx: dispH,
    };
  }, [data.unit, data.labelWidth, data.labelHeight]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-full overflow-hidden ${className}`}
    >
      <div className="relative inline-flex flex-col items-center max-w-full">
        {/* Top/Center Label Container with Left Dimension Guide */}
        <div className="flex items-center gap-2.5 max-w-full">
          {/* Vertical Dimension Indicator (Left) */}
          <div
            style={{ height: `${displayHeightPx}px` }}
            className="flex flex-col items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300 select-none py-0.5 shrink-0"
          >
            <span className="text-[9px] text-slate-400">▲</span>
            <div className="flex-1 w-[1px] bg-slate-300 dark:bg-slate-700 my-0.5" />
            <span className="my-1 whitespace-nowrap font-semibold px-0.5 text-[11px]">
              {layoutHeightMm} mm
            </span>
            <div className="flex-1 w-[1px] bg-slate-300 dark:bg-slate-700 my-0.5" />
            <span className="text-[9px] text-slate-400">▼</span>
          </div>

          {/* Actual Label Preview Card with Scale Wrapper */}
          <div
            style={{
              width: `${displayWidthPx}px`,
              height: `${displayHeightPx}px`,
            }}
            className="relative rounded-xl shadow-md border border-slate-300 dark:border-slate-700 overflow-hidden bg-white shrink-0"
          >
            <div
              style={{
                width: `${naturalWidthPx}px`,
                height: `${naturalHeightPx}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <LabelPreview data={data} scale={1} />
            </div>
          </div>
        </div>

        {/* Horizontal Dimension Indicator (Bottom, precisely aligned under the preview card) */}
        <div className="flex items-center w-full max-w-full mt-2.5">
          {/* Invisible spacer matching the vertical indicator + gap on the left */}
          <div className="w-[38px] shrink-0" aria-hidden="true" />

          {/* Horizontal Indicator matching the preview width */}
          <div
            style={{ width: `${displayWidthPx}px` }}
            className="flex items-center justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300 select-none"
          >
            <span className="text-[9px] text-slate-400">◀</span>
            <div className="flex-1 h-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />
            <span className="whitespace-nowrap font-semibold px-1.5 text-[11px]">
              {layoutWidthMm} mm
            </span>
            <div className="flex-1 h-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />
            <span className="text-[9px] text-slate-400">▶</span>
          </div>
        </div>
      </div>
    </div>
  );
};
