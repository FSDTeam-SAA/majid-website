import React from "react";
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
 */
export const DimensionGuidePreview: React.FC<DimensionGuidePreviewProps> = ({
  data,
  layoutWidthMm,
  layoutHeightMm,
  className = "",
}) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 ${className}`}
    >
      <div className="relative inline-flex flex-col items-center">
        {/* Top/Center Label Container with Left Dimension Guide */}
        <div className="flex items-center gap-3">
          {/* Vertical Dimension Indicator (Left) */}
          <div className="flex flex-col items-center justify-between self-stretch text-[11px] font-bold text-slate-700 dark:text-slate-300 select-none py-1">
            <span className="text-[10px] text-slate-400">▲</span>
            <div className="flex-1 w-[1px] bg-slate-300 dark:bg-slate-700 my-0.5" />
            <span className="my-1.5 whitespace-nowrap text-xs font-semibold px-1">
              {layoutHeightMm} mm
            </span>
            <div className="flex-1 w-[1px] bg-slate-300 dark:bg-slate-700 my-0.5" />
            <span className="text-[10px] text-slate-400">▼</span>
          </div>

          {/* Actual Label Preview Card */}
          <div className="relative p-1 bg-white rounded-xl shadow-md border border-slate-300 dark:border-slate-700 overflow-hidden">
            <LabelPreview data={data} className="rounded-lg" scale={1} />
          </div>
        </div>

        {/* Horizontal Dimension Indicator (Bottom) */}
        <div className="flex items-center justify-between w-full max-w-[280px] text-[11px] font-bold text-slate-700 dark:text-slate-300 select-none mt-3 pl-8">
          <span className="text-[10px] text-slate-400">◀</span>
          <div className="flex-1 h-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />
          <span className="whitespace-nowrap text-xs font-semibold px-2">
            {layoutWidthMm} mm
          </span>
          <div className="flex-1 h-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />
          <span className="text-[10px] text-slate-400">▶</span>
        </div>
      </div>
    </div>
  );
};
