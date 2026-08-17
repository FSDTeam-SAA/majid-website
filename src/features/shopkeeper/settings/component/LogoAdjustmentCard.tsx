"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Maximize2,
  Minimize2,
  Check,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  FileText,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  useMyProfile,
  useUpdateProfile,
} from "@/features/shopkeeper/settings/hooks/useSettings";
import {
  LogoSettings,
  DEFAULT_LOGO_SETTINGS,
} from "@/features/shopkeeper/settings/types";
import {
  normalizeLogoSettings,
  setLocalLogoSettings,
  getWebLogoPreviewStyle,
} from "@/lib/logoHelper";

interface LogoAdjustmentCardProps {
  onSaved?: () => void;
  showSaveButton?: boolean;
}

export default function LogoAdjustmentCard({
  onSaved,
  showSaveButton = true,
}: LogoAdjustmentCardProps) {
  const { data: profileData } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();

  const user = profileData?.data;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const previewUrl = selectedFileUrl || user?.image?.url || null;

  const [customSettings, setCustomSettings] = useState<LogoSettings | null>(
    null,
  );
  const logoSettings =
    customSettings ?? normalizeLogoSettings(user?.logoSettings);

  const [activePreviewTab, setActivePreviewTab] = useState<
    "invoice" | "square" | "thermal"
  >("invoice");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [initialOffsets, setInitialOffsets] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [isSaveSuccess, setIsSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, SVG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be under 5MB");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setSelectedFileUrl(objectUrl);
    toast.success("New logo selected! Adjust zoom and position below.");
  };

  // Zoom control
  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.max(0.2, Math.min(3.0, Number(newZoom.toFixed(2))));
    setCustomSettings((prev) => ({
      ...(prev ?? normalizeLogoSettings(user?.logoSettings)),
      zoom: clamped,
    }));
  };

  // Position control
  const handleXChange = (newX: number) => {
    const clamped = Math.max(-100, Math.min(100, Math.round(newX)));
    setCustomSettings((prev) => ({
      ...(prev ?? normalizeLogoSettings(user?.logoSettings)),
      x: clamped,
    }));
  };

  const handleYChange = (newY: number) => {
    const clamped = Math.max(-100, Math.min(100, Math.round(newY)));
    setCustomSettings((prev) => ({
      ...(prev ?? normalizeLogoSettings(user?.logoSettings)),
      y: clamped,
    }));
  };

  const nudge = (dx: number, dy: number) => {
    setCustomSettings((prev) => {
      const base = prev ?? normalizeLogoSettings(user?.logoSettings);
      return {
        ...base,
        x: Math.max(-100, Math.min(100, base.x + dx)),
        y: Math.max(-100, Math.min(100, base.y + dy)),
      };
    });
  };

  // Fit modes
  const handleFitMode = (mode: "contain" | "cover" | "fill") => {
    setCustomSettings((prev) => {
      const base = prev ?? normalizeLogoSettings(user?.logoSettings);
      return {
        ...base,
        fit: mode,
        zoom: mode === "contain" ? 1.0 : base.zoom,
        x: mode === "contain" ? 0 : base.x,
        y: mode === "contain" ? 0 : base.y,
      };
    });
    toast.info(`Fit mode set to "${mode}"`);
  };

  // Reset to default
  const handleReset = () => {
    setCustomSettings({ ...DEFAULT_LOGO_SETTINGS });
    toast.info("Logo adjustment reset to safe default.");
  };

  // Drag-to-pan in preview container
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewUrl) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffsets({ x: logoSettings.x, y: logoSettings.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      const newX = Math.max(
        -100,
        Math.min(100, Math.round(initialOffsets.x + deltaX)),
      );
      const newY = Math.max(
        -100,
        Math.min(100, Math.round(initialOffsets.y + deltaY)),
      );

      setCustomSettings((prev) => ({
        ...(prev ?? normalizeLogoSettings(user?.logoSettings)),
        x: newX,
        y: newY,
      }));
    },
    [isDragging, dragStart, initialOffsets, user?.logoSettings],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch drag for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!previewUrl || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setInitialOffsets({ x: logoSettings.x, y: logoSettings.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((touch.clientX - dragStart.x) / rect.width) * 100;
    const deltaY = ((touch.clientY - dragStart.y) / rect.height) * 100;

    const newX = Math.max(
      -100,
      Math.min(100, Math.round(initialOffsets.x + deltaX)),
    );
    const newY = Math.max(
      -100,
      Math.min(100, Math.round(initialOffsets.y + deltaY)),
    );

    setCustomSettings((prev) => ({
      ...(prev ?? normalizeLogoSettings(user?.logoSettings)),
      x: newX,
      y: newY,
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Save Settings
  const handleSave = async () => {
    const formData = new FormData();
    formData.append("logoSettings", JSON.stringify(logoSettings));

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      await updateProfileMutation.mutateAsync(formData);
      setLocalLogoSettings(logoSettings);
      setIsSaveSuccess(true);
      setTimeout(() => setIsSaveSuccess(false), 3000);
      toast.success("Logo settings successfully saved!");
      if (onSaved) onSaved();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast.error(
        errorObj?.response?.data?.message || "Failed to save logo settings",
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#84CC16]/10 text-[#4d8a06] flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-foreground tracking-tight">
              Invoice & Receipt Logo Settings
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 ml-11">
            Upload your shop logo, adjust zoom, pan position, and ensure it fits
            perfectly on all invoices and receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition cursor-pointer"
            title="Reset position and zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          {showSaveButton && (
            <button
              type="button"
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#84CC16] hover:bg-[#72b50f] text-white font-black text-sm rounded-xl transition shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isSaveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Save Logo Settings</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-8">
        {/* Upload + Quick Mode Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Upload Button Box */}
          <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-2xl border-2 border-dashed border-border bg-background/50 hover:border-[#84CC16]/60 transition group">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-wider text-foreground">
                Shop Logo Source
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                Upload a high-resolution transparent PNG, SVG, or JPG logo.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#84CC16]/10 hover:bg-[#84CC16]/20 text-[#4d8a06] font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{previewUrl ? "Change Logo Image" : "Upload Logo"}</span>
              </button>

              {previewUrl && (
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#84CC16]" />
                  <span>Logo loaded and ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Fit Preset Controls */}
          <div className="lg:col-span-8 p-5 rounded-2xl border border-border bg-background flex flex-col justify-between gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-foreground">
                  Quick Fit Modes
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Easily adapt how your logo scales within the container
                  boundary.
                </p>
              </div>

              {/* Background Color Mode */}
              <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl">
                <span className="text-[11px] font-bold text-muted-foreground px-2">
                  BG:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCustomSettings((prev) => ({
                      ...(prev ?? normalizeLogoSettings(user?.logoSettings)),
                      backgroundColor: "transparent",
                    }))
                  }
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    logoSettings.backgroundColor === "transparent"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Transparent
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCustomSettings((prev) => ({
                      ...(prev ?? normalizeLogoSettings(user?.logoSettings)),
                      backgroundColor: "#FFFFFF",
                    }))
                  }
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    logoSettings.backgroundColor === "#FFFFFF"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  White
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleFitMode("contain")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  logoSettings.fit === "contain"
                    ? "border-[#84CC16] bg-[#84CC16]/10 text-foreground"
                    : "border-border bg-card hover:border-[#84CC16]/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">Fit Entire Logo</span>
                  <Minimize2 className="w-3.5 h-3.5 text-[#84CC16]" />
                </div>
                <span className="text-[10px] font-medium opacity-80">
                  Guarantees no part of logo is cut off
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleFitMode("cover")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                  logoSettings.fit === "cover"
                    ? "border-[#84CC16] bg-[#84CC16]/10 text-foreground"
                    : "border-border bg-card hover:border-[#84CC16]/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">Fill Container</span>
                  <Maximize2 className="w-3.5 h-3.5 text-[#84CC16]" />
                </div>
                <span className="text-[10px] font-medium opacity-80">
                  Fills available box completely
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomSettings((prev) => ({
                    ...(prev ?? normalizeLogoSettings(user?.logoSettings)),
                    x: 0,
                    y: 0,
                  }));
                  toast.info("Logo centered.");
                }}
                className="p-3 rounded-xl border border-border bg-card hover:border-[#84CC16]/40 text-muted-foreground hover:text-foreground text-left transition cursor-pointer flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">Center Position</span>
                  <Move className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-[10px] font-medium opacity-80">
                  Sets horizontal & vertical offset to 0
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Canvas Viewport */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#84CC16]" />
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  Interactive Preview & Drag-to-Pan
                </span>
              </div>

              {/* Preview Target Switcher */}
              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("invoice")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activePreviewTab === "invoice"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Invoice PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("square")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activePreviewTab === "square"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Square</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("thermal")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activePreviewTab === "thermal"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Thermal</span>
                </button>
              </div>
            </div>

            {/* Viewport Box */}
            <div className="relative rounded-2xl border-2 border-border bg-slate-950/5 dark:bg-slate-900/60 p-6 overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
              {/* Checkerboard Pattern for Transparency Visibility */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#84CC16 1px, transparent 1px)`,
                  backgroundSize: "16px 16px",
                }}
              />

              {previewUrl ? (
                <div className="relative w-full flex flex-col items-center justify-center">
                  {/* Container Frame depending on active tab */}
                  {activePreviewTab === "invoice" && (
                    <div className="w-full max-w-[440px] bg-white dark:bg-slate-950 rounded-2xl p-4 shadow-xl border border-border space-y-3">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-3">
                          {/* THE ACTUAL LOGO CONTAINER */}
                          <div
                            ref={containerRef}
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            style={{
                              backgroundColor:
                                logoSettings.backgroundColor === "#FFFFFF"
                                  ? "#FFFFFF"
                                  : "transparent",
                            }}
                            className="relative w-36 h-12 rounded-lg border-2 border-dashed border-[#84CC16] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing group shadow-inner"
                            title="Click and drag to reposition logo"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewUrl}
                              alt="Logo preview"
                              className="pointer-events-none select-none max-w-full max-h-full"
                              style={getWebLogoPreviewStyle(logoSettings)}
                            />
                            <div className="absolute inset-0 bg-[#84CC16]/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                              <Move className="w-4 h-4 text-[#84CC16]" />
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                              {user?.shopName || "YOUR SHOP NAME"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {user?.shopAddress || "123 Market Street"}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-black tracking-widest text-[#155E63] uppercase">
                            INVOICE
                          </span>
                          <p className="text-[9px] text-slate-400 font-mono">
                            #INV-2026-001
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 py-1">
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                        <div className="h-2 w-4/5 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                  )}

                  {activePreviewTab === "square" && (
                    <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl shadow-xl border border-border flex flex-col items-center gap-3">
                      <div
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{
                          backgroundColor:
                            logoSettings.backgroundColor === "#FFFFFF"
                              ? "#FFFFFF"
                              : "transparent",
                        }}
                        className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-[#84CC16] overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing group shadow-inner"
                        title="Click and drag to reposition logo"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt="Logo preview"
                          className="pointer-events-none select-none max-w-full max-h-full"
                          style={getWebLogoPreviewStyle(logoSettings)}
                        />
                        <div className="absolute inset-0 bg-[#84CC16]/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                          <Move className="w-5 h-5 text-[#84CC16]" />
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-muted-foreground">
                        Square Logo Area (112×112px)
                      </p>
                    </div>
                  )}

                  {activePreviewTab === "thermal" && (
                    <div className="w-[280px] bg-white text-black p-5 rounded-xl shadow-2xl font-mono text-center space-y-2 border border-slate-300">
                      <div
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{
                          backgroundColor:
                            logoSettings.backgroundColor === "#FFFFFF"
                              ? "#FFFFFF"
                              : "transparent",
                        }}
                        className="relative w-44 h-14 mx-auto rounded border-2 border-dashed border-slate-400 overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing group"
                        title="Click and drag to reposition logo"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt="Logo preview"
                          className="pointer-events-none select-none max-w-full max-h-full"
                          style={getWebLogoPreviewStyle(logoSettings)}
                        />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                          <Move className="w-4 h-4 text-black" />
                        </div>
                      </div>
                      <p className="text-xs font-black">
                        {user?.shopName || "YOUR SHOP NAME"}
                      </p>
                      <p className="text-[9px] text-slate-600">
                        {user?.shopAddress || "Shop Address"} • Tel:{" "}
                        {user?.phone || "Phone"}
                      </p>
                      <div className="border-t border-dashed border-slate-400 my-2" />
                      <p className="text-[10px] text-slate-500 font-bold">
                        *** SALES RECEIPT ***
                      </p>
                    </div>
                  )}

                  <p className="mt-3 text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[#84CC16]" />
                    <span>Tip: Click and drag directly on the logo to pan</span>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">
                      No Shop Logo Uploaded Yet
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                      Upload your shop logo image above to adjust zoom and
                      positioning.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Fine-Tuning Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Zoom Slider */}
            <div className="p-5 rounded-2xl border border-border bg-background space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-[#84CC16]" />
                  <label className="text-xs font-black uppercase tracking-wider text-foreground">
                    Scale / Zoom Level
                  </label>
                </div>
                <span className="text-xs font-black font-mono text-[#4d8a06] bg-[#84CC16]/10 px-2 py-0.5 rounded-md">
                  {Math.round(logoSettings.zoom * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleZoomChange(logoSettings.zoom - 0.1)}
                  className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={logoSettings.zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="flex-1 accent-[#84CC16] h-2 bg-muted rounded-lg cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => handleZoomChange(logoSettings.zoom + 0.1)}
                  className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-foreground transition cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                <span>20% (Compact)</span>
                <span>100% (Standard)</span>
                <span>300% (Large)</span>
              </div>
            </div>

            {/* Horizontal & Vertical Positioning */}
            <div className="p-5 rounded-2xl border border-border bg-background space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-[#84CC16]" />
                  <label className="text-xs font-black uppercase tracking-wider text-foreground">
                    Manual Panning / Alignment
                  </label>
                </div>
              </div>

              {/* Horizontal Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>Horizontal (X):</span>
                  <span className="font-mono text-foreground font-black">
                    {logoSettings.x > 0
                      ? `+${logoSettings.x}%`
                      : `${logoSettings.x}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={logoSettings.x}
                  onChange={(e) => handleXChange(parseInt(e.target.value, 10))}
                  className="w-full accent-[#84CC16] h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              {/* Vertical Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>Vertical (Y):</span>
                  <span className="font-mono text-foreground font-black">
                    {logoSettings.y > 0
                      ? `+${logoSettings.y}%`
                      : `${logoSettings.y}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  step="1"
                  value={logoSettings.y}
                  onChange={(e) => handleYChange(parseInt(e.target.value, 10))}
                  className="w-full accent-[#84CC16] h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>

              {/* Directional Nudge Pad */}
              <div className="pt-2 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Precision Nudge
                </span>
                <div className="grid grid-cols-3 gap-1.5 w-32">
                  <div />
                  <button
                    type="button"
                    onClick={() => nudge(0, -5)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition cursor-pointer"
                    title="Nudge Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <div />

                  <button
                    type="button"
                    onClick={() => nudge(-5, 0)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition cursor-pointer"
                    title="Nudge Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCustomSettings((prev) => ({
                        ...(prev ?? normalizeLogoSettings(user?.logoSettings)),
                        x: 0,
                        y: 0,
                      }))
                    }
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-[#84CC16] font-bold text-[10px] flex items-center justify-center transition cursor-pointer"
                    title="Center"
                  >
                    •
                  </button>

                  <button
                    type="button"
                    onClick={() => nudge(5, 0)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition cursor-pointer"
                    title="Nudge Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div />
                  <button
                    type="button"
                    onClick={() => nudge(0, 5)}
                    className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground flex items-center justify-center transition cursor-pointer"
                    title="Nudge Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <div />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
