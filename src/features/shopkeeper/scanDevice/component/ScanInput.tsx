"use client";

import { QrCode } from "lucide-react";
import { useRef, useEffect } from "react";

interface ScanInputProps {
  imei: string;
  setImei: (value: string) => void;
  onScanClick: () => void;
  disabled?: boolean;
}

export const ScanInput = ({
  imei,
  setImei,
  onScanClick,
  disabled,
}: ScanInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [imei]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative group">
      <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 sm:mb-3 block ml-3 sm:ml-4">
        Device Identifier
      </span>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Enter IMEI / Serial Number&#10;You can enter multiple IMEIs (one per line)"
          rows={1}
          className="w-full px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-input bg-muted/50 focus:border-[#84CC16] focus:bg-card focus:ring-4 focus:ring-[#84CC16]/5 outline-none transition-all text-sm sm:text-base font-semibold text-foreground placeholder:text-muted-foreground disabled:opacity-50 resize-none overflow-y-auto custom-scrollbar leading-5 sm:leading-6 min-h-[48px] sm:min-h-[56px] max-h-[200px]"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#84CC16 #e2e8f0",
          }}
        />

        <button
          onClick={onScanClick}
          disabled={disabled}
          title="Scan Barcode/QR"
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#84CC16] hover:bg-[#84CC16]/5 rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95 sm:active:scale-100"
        >
          <QrCode size={20} className="sm:w-[22px] sm:h-[22px]" />
        </button>
      </div>

      {/* Helper text for multiple IMEIs */}
      <div className="mt-2 ml-3 sm:ml-4 flex items-center gap-2">
        <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground">
          💡 Tip: Enter one IMEI per line for multiple checks
        </span>
      </div>
    </div>
  );
};
