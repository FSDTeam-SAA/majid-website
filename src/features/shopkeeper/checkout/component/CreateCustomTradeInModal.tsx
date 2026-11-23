/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Tag, Smartphone, Check, Sparkles } from "lucide-react";
import { TradeInDevice } from "./TradeInSearchSection";
import { AssessedTradeIn } from "./ReviewTradeInModal";

interface CreateCustomTradeInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currencySymbol: string;
  onConfirm: (assessment: AssessedTradeIn) => void;
}

export const CreateCustomTradeInModal: React.FC<CreateCustomTradeInModalProps> = ({
  open,
  onOpenChange,
  currencySymbol,
  onConfirm,
}) => {
  const [deviceName, setDeviceName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [storage, setStorage] = useState("128GB");
  const [color, setColor] = useState("Standard");
  const [condition, setCondition] = useState("B • Good");
  const [buyingPrice, setBuyingPrice] = useState("150.00");
  const [imei, setImei] = useState("");
  const [batteryHealth, setBatteryHealth] = useState("85%");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = deviceName.trim() || "Custom Trade-in Device";
    const numericPrice = Math.max(0, parseFloat(buyingPrice) || 0);

    const customDevice: TradeInDevice = {
      id: `custom_${Date.now()}`,
      brand: "Custom",
      category: "phone",
      deviceName: cleanName,
      modelNumber: modelNumber.trim() || "Custom",
      storage: storage.trim() || "N/A",
      color: color.trim() || "N/A",
      grades: {
        A: { name: "A • Excellent", price: numericPrice, weeklyChange: 0, trend: "none" },
        B: { name: "B • Good", price: numericPrice, weeklyChange: 0, trend: "none" },
        C: { name: "C • Fair", price: numericPrice, weeklyChange: 0, trend: "none" },
      },
      lastUpdated: "today",
      source: "custom",
    };

    const assessment: AssessedTradeIn = {
      device: customDevice,
      condition,
      batteryHealth: batteryHealth.trim() || "85%",
      blacklistStatus: "Clean",
      networkLock: "Unlocked",
      imei: imei.trim(),
      buyingPrice: numericPrice,
    };

    onConfirm(assessment);
    onOpenChange(false);

    // Reset form
    setDeviceName("");
    setModelNumber("");
    setStorage("128GB");
    setColor("Standard");
    setCondition("B • Good");
    setBuyingPrice("150.00");
    setImei("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-[28px] border-slate-100 bg-white font-poppins shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-lime-50 to-emerald-50/50 p-5 border-b border-lime-100/70">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#84CC16] text-white shadow-md shadow-lime-500/20">
                <Plus size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-slate-900 tracking-tight">
                  Add Custom Trade-In Item
                </DialogTitle>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                  Enter device specifications and agreed trade-in credit
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Device Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Smartphone size={12} className="text-[#84CC16]" />
              Item / Device Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Apple iPhone 13 mini, Samsung S22..."
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#84CC16] focus:ring-1 focus:ring-[#84CC16] outline-none transition-all"
            />
          </div>

          {/* Model Number, Storage & Color */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Model No.
              </label>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="e.g. A2628"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-[#84CC16]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Storage
              </label>
              <input
                type="text"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="128GB"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-[#84CC16]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Colour
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Midnight"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-[#84CC16]"
              />
            </div>
          </div>

          {/* Condition Pills */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Condition Grade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["A • Excellent", "B • Good", "C • Fair"] as const).map((g) => {
                const isSelected = condition === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setCondition(g)}
                    className={`py-2 px-2 rounded-xl text-center text-[11px] font-black border transition-all ${
                      isSelected
                        ? "bg-[#84CC16] border-[#84CC16] text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buying Price & Battery Health */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-900 flex items-center gap-1">
                <Tag size={12} className="text-[#84CC16]" />
                Agreed Trade-In Credit *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={buyingPrice}
                  onChange={(e) => setBuyingPrice(e.target.value)}
                  className="w-full h-11 pl-8 pr-3 rounded-xl border-2 border-lime-300 bg-lime-50/50 text-base font-black text-slate-950 focus:border-[#84CC16] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Battery Health
              </label>
              <input
                type="text"
                value={batteryHealth}
                onChange={(e) => setBatteryHealth(e.target.value)}
                placeholder="e.g. 88%"
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-[#84CC16]"
              />
            </div>
          </div>

          {/* IMEI / Serial Number */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              IMEI / Serial Number (Optional)
            </label>
            <input
              type="text"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              placeholder="Scan or enter 15-digit IMEI or serial number"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-[#84CC16]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#84CC16] hover:bg-[#65A30D] text-white text-xs font-black shadow-md shadow-lime-500/20 transition-all cursor-pointer"
            >
              <Check size={16} className="stroke-[3]" />
              Add Trade-In • {currencySymbol}
              {parseFloat(buyingPrice || "0").toFixed(2)}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
