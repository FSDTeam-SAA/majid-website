"use client";

import type { ChangeEvent } from "react";
import { useRef } from "react";
import { Loader2, Upload } from "lucide-react";

interface ScanButtonsProps {
  onScan: () => void;
  onImageUpload: (file: File) => void | Promise<void>;
  isScanning: boolean;
  isDisabled: boolean;
  isUploadingImage?: boolean;
  imeiCount?: number;
}

export const ScanButtons = ({
  onScan,
  onImageUpload,
  isScanning,
  isDisabled,
  isUploadingImage = false,
  imeiCount = 0,
}: ScanButtonsProps) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const isBulk = imeiCount > 1;
  const buttonText = isScanning
    ? "Scanning..."
    : isBulk
      ? `Check ${imeiCount} Devices`
      : "Scan Device";

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void onImageUpload(file);
    }
    event.target.value = "";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={onScan}
        disabled={isDisabled}
        className="w-full bg-[#84CC16] hover:bg-[#76b813] text-white font-black py-4 rounded-full shadow-lg shadow-lime-500/20 transition-all text-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
      >
        {isScanning ? (
          <>
            <Loader2 size={24} className="animate-spin" />
            {buttonText}
          </>
        ) : (
          buttonText
        )}
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        disabled={isScanning || isUploadingImage}
        className="w-full bg-card border-2 border-border text-foreground hover:border-[#84CC16]/30 hover:bg-muted font-black py-4 rounded-full transition-all text-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
      >
        {isUploadingImage ? (
          <Loader2 size={24} className="animate-spin" />
        ) : (
          <Upload size={24} />
        )}
        {isUploadingImage ? "Extracting..." : "Upload Image"}
      </button>
    </div>
  );
};
