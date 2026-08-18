"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Percent, Save, Loader2, Info } from "lucide-react";
import { useShop } from "@/features/shopkeeper/shop/store/shop.store";
import { updateShop } from "@/features/shopkeeper/shop/api/shop.api";
import { toast } from "sonner";

export default function TaxSettingsCard() {
  const { activeShop, refresh } = useShop();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxName, setTaxName] = useState("Tax");
  const [taxPercentage, setTaxPercentage] = useState<number | "">(0);
  const [taxIncludedInPrice, setTaxIncludedInPrice] = useState(false);

  const handleEdit = () => {
    if (activeShop) {
      setTaxEnabled(activeShop.taxEnabled ?? false);
      setTaxName(activeShop.taxName ?? "Tax");
      setTaxPercentage(activeShop.taxPercentage ?? 0);
      setTaxIncludedInPrice(activeShop.taxIncludedInPrice ?? false);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!activeShop?._id) return;

    try {
      setIsSaving(true);

      const payload = {
        taxEnabled,
        taxName: taxName.trim() || "Tax",
        taxPercentage: typeof taxPercentage === "number" ? taxPercentage : 0,
        taxIncludedInPrice,
      };

      await updateShop(activeShop._id, payload);

      toast.success("Tax settings updated successfully");
      refresh();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update tax settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeShop) return null;

  const currentTaxEnabled = isEditing
    ? taxEnabled
    : (activeShop.taxEnabled ?? false);
  const currentTaxName = isEditing ? taxName : (activeShop.taxName ?? "Tax");
  const currentTaxPercentage = isEditing
    ? taxPercentage
    : (activeShop.taxPercentage ?? 0);
  const currentTaxIncludedInPrice = isEditing
    ? taxIncludedInPrice
    : (activeShop.taxIncludedInPrice ?? false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden mt-8"
    >
      <div className="p-8 flex justify-between items-center border-b border-border/50">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#84CC16]" />
            Tax Settings
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Configure how tax is calculated and displayed for{" "}
            {activeShop.shopName}.
          </p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={handleEdit}
            className="px-6 py-2 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 bg-muted text-muted-foreground font-black text-sm rounded-xl hover:opacity-90 transition active:scale-95 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        )}
      </div>

      <div className="p-8 space-y-8">
        {/* Enable Tax Toggle */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-foreground">
              Enable Tax Calculation
            </h3>
            <p className="text-sm text-muted-foreground">
              Automatically compute tax during checkout and display on invoices.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={currentTaxEnabled}
            disabled={!isEditing}
            onClick={() => setTaxEnabled(!currentTaxEnabled)}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#84CC16] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              currentTaxEnabled
                ? "bg-[#84CC16]"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                currentTaxEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Settings Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${!currentTaxEnabled ? "opacity-40 pointer-events-none" : "opacity-100"}`}
        >
          {/* Tax Name */}
          <div className="space-y-2">
            <label className="text-[13px] font-black text-foreground ml-1">
              Tax Name
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={currentTaxName}
              onChange={(e) => setTaxName(e.target.value)}
              placeholder="e.g. VAT, GST, Sales Tax"
              className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
            />
          </div>

          {/* Tax Percentage */}
          <div className="space-y-2">
            <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
              <Percent size={14} /> Tax Percentage
            </label>
            <input
              type="number"
              disabled={!isEditing}
              value={currentTaxPercentage}
              onChange={(e) => {
                const val = e.target.value;
                setTaxPercentage(val === "" ? "" : Number(val));
              }}
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
            />
          </div>

          {/* Tax Inclusion Toggle */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[13px] font-black text-foreground ml-1">
              Pricing Model
            </label>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <label
                className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${!currentTaxIncludedInPrice ? "border-primary bg-primary/5" : "border-border bg-background"}`}
              >
                <input
                  type="radio"
                  name="taxModel"
                  className="mt-1 accent-primary"
                  checked={!currentTaxIncludedInPrice}
                  onChange={() => isEditing && setTaxIncludedInPrice(false)}
                  disabled={!isEditing}
                />
                <div>
                  <p className="font-bold text-foreground">
                    Tax Excluded (Added on top)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Tax is added to the subtotal during checkout. If an item
                    costs $100 and tax is 10%, the total will be $110.
                  </p>
                </div>
              </label>

              <label
                className={`flex-1 flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${currentTaxIncludedInPrice ? "border-primary bg-primary/5" : "border-border bg-background"}`}
              >
                <input
                  type="radio"
                  name="taxModel"
                  className="mt-1 accent-primary"
                  checked={currentTaxIncludedInPrice}
                  onChange={() => isEditing && setTaxIncludedInPrice(true)}
                  disabled={!isEditing}
                />
                <div>
                  <p className="font-bold text-foreground">
                    Tax Included (In the price)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Tax is already included in your item prices. If an item
                    costs $110 and tax is 10%, the receipt will show $10 tax
                    included.
                  </p>
                </div>
              </label>
            </div>
            {currentTaxIncludedInPrice && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs font-medium">
                  Your storefront prices will remain the same. The tax amount
                  will simply be extracted from the total to display on the
                  receipt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
