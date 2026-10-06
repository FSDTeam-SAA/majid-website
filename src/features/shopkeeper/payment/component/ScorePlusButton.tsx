"use client";

import React from "react";
import Image from "next/image";

interface ScorePlusButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

export const ScorePlusButton: React.FC<ScorePlusButtonProps> = ({
  onClick,
  className = "",
  disabled = false,
}) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onClick) onClick(e);
      }}
      role="button"
      tabIndex={0}
      title="Open review request preview"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && onClick) onClick(e as unknown as React.MouseEvent);
        }
      }}
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-[16px] border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer select-none shrink-0 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${className}`}
    >
      {/* Score+ original logo asset unchanged - enlarged for prominent clarity */}
      <Image
        src="/images/score-plus.png"
        alt="Score+"
        width={96}
        height={32}
        unoptimized
        className="h-8 w-auto object-contain shrink-0"
        priority
      />

      {/* Subtle vertical divider */}
      <span className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

      {/* Paper airplane send icon */}
      <span className="p-0.5 rounded-md text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </span>
    </div>
  );
};

export default ScorePlusButton;
