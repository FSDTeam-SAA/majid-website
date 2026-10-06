"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

interface ScoreReviewStatusBadgeProps {
  status?: "none" | "recorded";
  reviewUrl?: string;
  onClickBadge?: (e: React.MouseEvent) => void;
  className?: string;
  showViewReviewLink?: boolean;
}

export const ScoreReviewStatusBadge: React.FC<ScoreReviewStatusBadgeProps> = ({
  status = "none",
  reviewUrl,
  onClickBadge,
  className = "",
  showViewReviewLink = true,
}) => {
  const isRecorded = status === "recorded";

  return (
    <div className={`flex flex-col items-start gap-0.5 ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onClickBadge) onClickBadge(e);
        }}
        title="Click to view review status details"
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
          isRecorded
            ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
            : "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isRecorded ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span>{isRecorded ? "Review recorded" : "No review recorded"}</span>
      </button>

      {isRecorded && showViewReviewLink && reviewUrl && (
        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline inline-flex items-center gap-1 mt-0.5 pl-0.5 cursor-pointer"
        >
          View review
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      )}
    </div>
  );
};

export default ScoreReviewStatusBadge;
