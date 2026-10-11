"use client";

import React, { useRef, useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { createWorker } from "tesseract.js";
import {
  Camera,
  CheckCircle2,
  Loader2,
  ScanLine,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface UniversalProcessingScannerHubProps {
  serials: string[];
  onAddSerial: (code: string) => void;
  onRemoveSerial: (index: number) => void;
  error?: string;
}

export function UniversalProcessingScannerHub({
  serials = [],
  onAddSerial,
  onRemoveSerial,
  error,
}: UniversalProcessingScannerHubProps) {
  const [scanInput, setScanInput] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize ZXing reader
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, []);

  const handleAdd = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    if (serials.includes(trimmed)) {
      toast.error(`Code "${trimmed}" already exists inside item list.`);
      return;
    }
    onAddSerial(trimmed);
    toast.success(`Scanned code "${trimmed}" registered successfully.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!scanInput.trim()) return;
      handleAdd(scanInput);
      setScanInput("");
    }
  };

  const startCamera = async () => {
    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }
    setIsCameraActive(true);
    const toastId = toast.loading("Accessing media devices hardware...");

    setTimeout(async () => {
      try {
        const videoElement = videoRef.current;
        if (!videoElement) throw new Error("Video element not found");

        codeReaderRef.current?.decodeFromVideoDevice(
          null,
          videoElement,
          (result, err) => {
            if (result) {
              const matchedCodeText = result.getText()?.trim();
              if (matchedCodeText) {
                handleAdd(matchedCodeText);
                stopCamera();
              }
            }
            if (err && !(err.name === "NotFoundException")) {
              console.debug("ZXing scan frame tick:", err);
            }
          },
        );
        toast.dismiss(toastId);
        toast.success("Camera viewfinder active.");
      } catch {
        toast.dismiss(toastId);
        toast.error("Failed to connect camera.");
        setIsCameraActive(false);
      }
    }, 300);
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsCameraActive(false);
  };

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    const loadingToastId = toast.loading(
      `Reading item document asset "${file.name}"...`,
    );

    try {
      const imageUrl = URL.createObjectURL(file);

      try {
        const reader = codeReaderRef.current || new BrowserMultiFormatReader();
        const zxingResult = await reader.decodeFromImageUrl(imageUrl);
        const zxingText = zxingResult?.getText()?.trim();
        if (zxingText) {
          handleAdd(zxingText);
          toast.dismiss(loadingToastId);
          setIsParsingFile(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      } catch (err) {
        console.debug("Fallback to Tesseract raw OCR engine...", err);
      }

      const worker = await createWorker("eng");
      const ret = await worker.recognize(imageUrl);
      const fullExtractedRawText = ret.data.text;
      await worker.terminate();

      URL.revokeObjectURL(imageUrl);
      const parsedMatchArray = fullExtractedRawText.match(/[A-Z0-9]{8,18}/g);

      if (parsedMatchArray && parsedMatchArray.length > 0) {
        handleAdd(parsedMatchArray[0]);
        toast.dismiss(loadingToastId);
      } else {
        toast.dismiss(loadingToastId);
        toast.error("Failed to extract legible codes.");
      }
    } catch {
      toast.dismiss(loadingToastId);
      toast.error("Engine failed processing targets matrix layout.");
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t pt-5 border-dashed border-muted-foreground/40 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h4 className="font-black text-foreground flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary" />
            Universal Processing Scanner Hub
          </h4>
          <p className="text-xs text-muted-foreground">
            Type + Enter, engage active web camera tracking, or drop attachment
            image.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            type="button"
            variant={isCameraActive ? "default" : "outline"}
            className="rounded-xl h-9 text-xs font-bold gap-1.5 cursor-pointer"
            onClick={toggleCamera}
          >
            <Camera className="w-3.5 h-3.5" />
            {isCameraActive ? "Close Camera" : "Open Camera Stream"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-9 text-xs font-bold gap-1.5 cursor-pointer"
            disabled={isParsingFile}
            onClick={() => fileInputRef.current?.click()}
          >
            {isParsingFile ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            Attach Receipt/Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAttachmentUpload}
          />
        </div>
      </div>

      {isCameraActive && (
        <div className="relative w-full h-56 rounded-2xl bg-black border border-primary overflow-hidden flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-36 border-2 border-dashed border-primary rounded-xl relative flex items-center justify-center bg-black/10">
              <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] absolute top-1/2 left-0 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Input
          className="rounded-2xl h-12 pl-11 border-primary bg-background font-bold focus-visible:ring-primary"
          placeholder="Scan/Type code here and press Enter to append seamlessly..."
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute left-4 top-3.5 text-muted-foreground">
          <ScanLine className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Active
            Registers Log:
          </span>
          <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">
            {serials.length} Stored Ledger Nodes
          </span>
        </div>

        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border rounded-2xl bg-background/50">
          {serials.length === 0 && (
            <p className="text-xs text-muted-foreground/60 italic p-1">
              No identifiers cached inside streaming log grid yet.
            </p>
          )}
          {serials.map((serial, serialIndex) => (
            <div
              key={serialIndex}
              className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 border px-3 py-1.5 rounded-xl group transition-all"
            >
              <span className="text-muted-foreground">#{serialIndex + 1}:</span>
              <span className="text-foreground tracking-tight">{serial}</span>
              <button
                type="button"
                className="text-muted-foreground hover:text-destructive transition-colors ml-1 cursor-pointer"
                onClick={() => onRemoveSerial(serialIndex)}
                aria-label={`Remove code ${serial}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      </div>
    </div>
  );
}
