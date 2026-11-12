import React from "react";
import { LabelShape } from "./types";

interface LabelShapeThumbnailProps {
  shape?: LabelShape;
  widthMm?: number;
  heightMm?: number;
  className?: string;
}

/**
 * Renders a proportionally accurate physical shape thumbnail for a label roll stock.
 * Corresponds to client feedback callout 2: "Use mm, searchable names and shape thumbnails"
 */
export const LabelShapeThumbnail: React.FC<LabelShapeThumbnailProps> = ({
  shape = "rounded_rectangle",
  widthMm = 57,
  heightMm = 32,
  className = "w-10 h-7 text-slate-700 dark:text-slate-300",
}) => {
  // If special cable flag / jewelry barbell shape
  if (shape === "cable_flag") {
    return (
      <svg
        viewBox="0 0 48 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Left barbell pad */}
        <rect
          x="2"
          y="4"
          width="13"
          height="16"
          rx="2.5"
          className="stroke-current"
          strokeWidth="1.6"
          fill="currentColor"
          fillOpacity="0.05"
        />
        {/* Center bridge */}
        <rect
          x="15"
          y="9"
          width="18"
          height="6"
          className="stroke-current"
          strokeWidth="1.6"
          fill="currentColor"
          fillOpacity="0.05"
        />
        {/* Right barbell pad */}
        <rect
          x="33"
          y="4"
          width="13"
          height="16"
          rx="2.5"
          className="stroke-current"
          strokeWidth="1.6"
          fill="currentColor"
          fillOpacity="0.05"
        />
      </svg>
    );
  }

  // If square
  if (shape === "square" || (widthMm > 0 && Math.abs(widthMm - heightMm) < 4)) {
    return (
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect
          x="4"
          y="4"
          width="24"
          height="24"
          rx="3"
          className="stroke-current"
          strokeWidth="1.6"
          fill="currentColor"
          fillOpacity="0.05"
        />
      </svg>
    );
  }

  // Proportionally scale rectangular dimensions into a 48 x 28 viewport
  const maxViewW = 44;
  const maxViewH = 24;
  const aspect = widthMm && heightMm && heightMm > 0 ? widthMm / heightMm : 1.7;

  let rectW: number;
  let rectH: number;

  if (aspect >= 1) {
    rectW = maxViewW;
    rectH = Math.max(10, Math.min(maxViewH, maxViewW / aspect));
  } else {
    rectH = maxViewH;
    rectW = Math.max(12, Math.min(maxViewW, maxViewH * aspect));
  }

  const x = (48 - rectW) / 2;
  const y = (28 - rectH) / 2;
  const rx = shape === "slim_rectangle" ? 1.5 : 3;

  return (
    <svg
      viewBox="0 0 48 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x={x}
        y={y}
        width={rectW}
        height={rectH}
        rx={rx}
        className="stroke-current"
        strokeWidth="1.6"
        fill="currentColor"
        fillOpacity="0.05"
      />
    </svg>
  );
};
