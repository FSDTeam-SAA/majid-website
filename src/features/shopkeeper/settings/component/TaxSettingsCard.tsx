/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Percent,
  Save,
  Loader2,
  Info,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { useShop } from "@/features/shopkeeper/shop/store/shop.store";
import {
  getMyShops,
  updateShop,
} from "@/features/shopkeeper/shop/api/shop.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function TaxSettingsCard() {
  const queryClient = useQueryClient();
  const {
    activeShop: storeActiveShop,
    refresh: storeRefresh,
    isLoading: isStoreLoading,
  } = useShop();

  const {
    data: myShops,
    isLoading: isMyShopsLoading,
    refetch: refetchMyShops,
  } = useQuery({
    queryKey: ["my-shops-tax-settings"],
    queryFn: getMyShops,
  });

  const activeShop = storeActiveShop || myShops?.[0];
  const isLoading = (isStoreLoading || isMyShopsLoading) && !activeShop;

  const [isSaving, setIsSaving] = useState(false);
  const [customSettings, setCustomSettings] = useState<{
    taxEnabled?: boolean;
    taxName?: string;
    taxPercentage?: number | "";
    taxIncludedInPrice?: boolean;
  } | null>(null);

  const taxEnabled =
    customSettings?.taxEnabled !== undefined
      ? customSettings.taxEnabled
      : Boolean(activeShop?.taxEnabled);
  const taxName =
    customSettings?.taxName !== undefined
      ? customSettings.taxName
      : activeShop?.taxName || "Tax";
  const taxPercentage =
    customSettings?.taxPercentage !== undefined
      ? customSettings.taxPercentage
      : (activeShop?.taxPercentage ?? 0);
  const taxIncludedInPrice =
    customSettings?.taxIncludedInPrice !== undefined
      ? customSettings.taxIncludedInPrice
      : Boolean(activeShop?.taxIncludedInPrice);

  const hasChanged = customSettings !== null;

  const updateSetting = (
    fields: Partial<{
      taxEnabled: boolean;
      taxName: string;
      taxPercentage: number | "";
      taxIncludedInPrice: boolean;
    }>,
  ) => {
    setCustomSettings((prev) => ({
      taxEnabled,
      taxName,
      taxPercentage,
      taxIncludedInPrice,
      ...prev,
      ...fields,
    }));
  };

  // Auto-scroll if navigated with #tax-settings hash
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.hash === "#tax-settings"
    ) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, []);

  const handleSave = async () => {
    const targetShopId = activeShop?._id || myShops?.[0]?._id;
    if (!targetShopId) {
      toast.error("No active shop found to update");
      return;
    }

    try {
      setIsSaving(true);

      const parsedPercentage =
        typeof taxPercentage === "number"
          ? taxPercentage
          : parseFloat(String(taxPercentage)) || 0;

      const payload = {
        taxEnabled: Boolean(taxEnabled),
        taxName: taxName.trim() || "Tax",
        taxPercentage: Math.max(0, parsedPercentage),
        taxIncludedInPrice: Boolean(taxIncludedInPrice),
      };

      await updateShop(targetShopId, payload);

      toast.success("Tax settings updated successfully!");
      setCustomSettings(null);

      // Refresh stores and query caches
      storeRefresh();
      refetchMyShops();
      queryClient.invalidateQueries({ queryKey: ["shop"] });
      queryClient.invalidateQueries({ queryKey: ["my-inventory"] });
    } catch (error: any) {
      console.error("Failed to update tax settings:", error);
      toast.error(error?.message || "Failed to update tax settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div
        id="tax-settings"
        className="bg-card rounded-[32px] border border-border shadow-sm p-8 flex items-center justify-center min-h-[220px]"
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#84CC16]" />
          <p className="text-sm font-semibold text-muted-foreground">
            Loading tax settings...
          </p>
        </div>
      </div>
    );
  }

  if (!activeShop) {
    return (
      <div
        id="tax-settings"
        className="bg-card rounded-[32px] border border-border shadow-sm p-8"
      >
        <div className="flex items-center gap-3 text-amber-600">
          <Info className="w-5 h-5" />
          <p className="text-sm font-bold">
            No shop profile found. Please create or select a shop first to
            configure tax settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      id="tax-settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`bg-card rounded-[32px] border shadow-sm overflow-hidden transition-all duration-300 ${
        hasChanged
          ? "border-[#84CC16] ring-2 ring-[#84CC16]/20"
          : "border-border"
      }`}
    >
      {/* Header */}
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 bg-surface/50">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#84CC16]/10 flex items-center justify-center text-[#84CC16]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                Tax & VAT Settings
                {taxEnabled && Number(taxPercentage) > 0 && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#84CC16]/15 text-[#84CC16] border border-[#84CC16]/30">
                    Active: {taxPercentage}% {taxName}
                  </span>
                )}
              </h2>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                Configure tax percentage and calculation rules for{" "}
                <strong className="text-foreground">
                  {activeShop.shopName}
                </strong>
                .
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-6 bg-[#84CC16] hover:bg-[#84CC16]/90 text-white font-black text-sm rounded-xl transition shadow-lg shadow-lime-500/20 active:scale-95 disabled:opacity-50 shrink-0"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {hasChanged ? "Save Changes" : "Save Tax Settings"}
        </Button>
      </div>

      <div className="p-6 sm:p-8 space-y-8 font-poppins">
        {/* Step 1: Enable Tax Switch */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#84CC16] text-white text-xs font-black flex items-center justify-center">
                1
              </span>
              <h3 className="font-bold text-foreground text-sm sm:text-base">
                Enable Sales Tax Calculation
              </h3>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  taxEnabled
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {taxEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pl-8">
              When enabled, your selling transactions and Tax Season dashboard
              will apply this tax rate.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={taxEnabled}
            onClick={() => {
              const next = !taxEnabled;
              updateSetting({
                taxEnabled: next,
                ...(next && (!taxPercentage || Number(taxPercentage) === 0)
                  ? { taxPercentage: 10 }
                  : {}),
              });
            }}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:ring-offset-2 self-start sm:self-center ${
              taxEnabled ? "bg-[#84CC16]" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                taxEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Step 2: Tax Details Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#84CC16] text-white text-xs font-black flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-foreground text-sm sm:text-base">
              Set Tax Percentage & Name
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 sm:pl-8">
            {/* Tax Percentage */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Percent size={14} className="text-[#84CC16]" />
                Tax Rate Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={taxPercentage}
                  onChange={(e) => {
                    const val = e.target.value;
                    const nextVal = val === "" ? "" : Number(val);
                    updateSetting({
                      taxPercentage: nextVal,
                      ...(Number(val) > 0 && !taxEnabled
                        ? { taxEnabled: true }
                        : {}),
                    });
                  }}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 10.00"
                  className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/10 transition-all text-base font-bold text-foreground placeholder:text-muted-foreground/50 shadow-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-sm">
                  %
                </span>
              </div>
              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Quick Presets:
                </span>
                {[5, 10, 15, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      updateSetting({
                        taxPercentage: preset,
                        taxEnabled: true,
                      });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      Number(taxPercentage) === preset
                        ? "bg-[#84CC16] text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-[#84CC16]/10 hover:text-[#84CC16]"
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tax Label / Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <HelpCircle size={14} className="text-[#84CC16]" />
                Tax Label / Name
              </label>
              <input
                type="text"
                value={taxName}
                onChange={(e) => {
                  updateSetting({ taxName: e.target.value });
                }}
                placeholder="e.g. VAT, GST, Sales Tax"
                className="w-full px-5 py-3.5 bg-background border border-border rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/10 transition-all text-base font-bold text-foreground placeholder:text-muted-foreground/50 shadow-sm"
              />
              <p className="text-[11px] font-medium text-muted-foreground pt-1">
                This name will appear on tax receipts and the Tax Season
                breakdown.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Pricing Strategy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#84CC16] text-white text-xs font-black flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-foreground text-sm sm:text-base">
              Choose Pricing Model
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-8">
            {/* Tax Excluded Card */}
            <div
              onClick={() => {
                updateSetting({ taxIncludedInPrice: false });
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                !taxIncludedInPrice
                  ? "border-[#84CC16] bg-[#84CC16]/5 shadow-sm"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-sm">
                    Tax Excluded (Added on Top)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Tax is calculated and added on top of your item prices.
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    !taxIncludedInPrice
                      ? "border-[#84CC16] bg-[#84CC16] text-white"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {!taxIncludedInPrice && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div className="mt-3 p-2.5 rounded-xl bg-background/80 border border-border text-[11px] font-medium text-muted-foreground">
                Example: $100 item + {taxPercentage || 10}% tax ={" "}
                <strong>
                  ${100 + (100 * (Number(taxPercentage) || 10)) / 100} Total
                </strong>
              </div>
            </div>

            {/* Tax Included Card */}
            <div
              onClick={() => {
                updateSetting({ taxIncludedInPrice: true });
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                taxIncludedInPrice
                  ? "border-[#84CC16] bg-[#84CC16]/5 shadow-sm"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-sm">
                    Tax Included (In the Price)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Tax is already included inside your item retail price.
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    taxIncludedInPrice
                      ? "border-[#84CC16] bg-[#84CC16] text-white"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {taxIncludedInPrice && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <div className="mt-3 p-2.5 rounded-xl bg-background/80 border border-border text-[11px] font-medium text-muted-foreground">
                Example: $100 price includes{" "}
                <strong>
                  $
                  {(
                    100 -
                    100 / (1 + (Number(taxPercentage) || 10) / 100)
                  ).toFixed(2)}{" "}
                  tax
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Bottom Save Action Bar */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Sparkles className="w-4 h-4 text-[#84CC16]" />
            <span>
              Saving will immediately update your sales calculations and Tax
              Season reporting.
            </span>
          </div>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 px-8 bg-[#84CC16] hover:bg-[#84CC16]/90 text-white font-black text-sm rounded-xl transition shadow-lg shadow-lime-500/20 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Tax Settings
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
