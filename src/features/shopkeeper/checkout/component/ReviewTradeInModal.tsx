/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Smartphone,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Pencil,
  QrCode,
  Tag,
  User,
} from "lucide-react";
import { TradeInDevice } from "./TradeInSearchSection";

export interface AssessedTradeIn {
  device: TradeInDevice;
  condition: string;
  batteryHealth: string;
  blacklistStatus: string;
  networkLock: string;
  imei: string;
  buyingPrice: number;
}

interface ReviewTradeInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: TradeInDevice | null;
  initialGradeKey?: "A" | "B" | "C";
  customerName?: string;
  todaySaleTotal: number;
  currencySymbol: string;
  onConfirmTradeIn: (assessment: AssessedTradeIn) => void;
}

export const ReviewTradeInModal: React.FC<ReviewTradeInModalProps> = ({
  open,
  onOpenChange,
  device,
  initialGradeKey = "B",
  customerName = "Mobilise",
  todaySaleTotal,
  currencySymbol,
  onConfirmTradeIn,
}) => {
  const [selectedCondition, setSelectedCondition] = useState<string>("B • Good");
  const [batteryHealth, setBatteryHealth] = useState<string>("87%");
  const [blacklistStatus, setBlacklistStatus] = useState<string>("Clean");
  const [networkLock, setNetworkLock] = useState<string>("Unlocked");
  const [imei, setImei] = useState<string>("");
  const [buyingPrice, setBuyingPrice] = useState<number>(220);
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);

  useEffect(() => {
    if (device) {
      const grade = device.grades[initialGradeKey] || device.grades.B;
      const conditionMap: Record<string, string> = {
        A: "A • Excellent",
        B: "B • Good",
        C: "C • Fair",
      };
      setSelectedCondition(conditionMap[initialGradeKey] || "B • Good");
      setBuyingPrice(grade.price > 0 ? grade.price : 200);
      setImei("");
    }
  }, [device, initialGradeKey]);

  if (!device) return null;

  const handleConditionChange = (cond: string) => {
    setSelectedCondition(cond);
    let gradePrice = device.grades.B.price;
    if (cond.startsWith("A")) gradePrice = device.grades.A.price;
    else if (cond.startsWith("C")) gradePrice = device.grades.C.price;
    if (gradePrice > 0) {
      setBuyingPrice(gradePrice);
    }
  };

  const customerPays = Math.max(0, todaySaleTotal - buyingPrice);

  const handleAdd = () => {
    onConfirmTradeIn({
      device,
      condition: selectedCondition,
      batteryHealth,
      blacklistStatus,
      networkLock,
      imei: imei.trim(),
      buyingPrice,
    });
    onOpenChange(false);
  };

  const cleanModel = device.modelNumber.replace(/^Model\s*/i, "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-6 max-h-[90vh] overflow-y-auto rounded-[28px]">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-xl font-black text-slate-900 flex items-center justify-between">
            <span>Review trade-in</span>
            {customerName && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#84CC16] bg-[#84CC16]/10 px-3 py-1 rounded-full">
                <User size={13} />
                Customer: {customerName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Device Card */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-200/60 overflow-hidden">
              {device.imageUrl ? (
                <Image
                  src={device.imageUrl}
                  alt={device.deviceName}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <Smartphone size={24} className="text-[#84CC16]" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-black text-slate-900">
                {device.deviceName}
              </h4>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {cleanModel && (
                  <span className="px-2 py-0.5 rounded-md bg-[#84CC16]/15 border border-[#84CC16]/30 text-[10px] font-black text-[#65A30D]">
                    {cleanModel}
                  </span>
                )}
                {device.storage && (
                  <span className="px-2 py-0.5 rounded-md bg-[#84CC16]/15 border border-[#84CC16]/30 text-[10px] font-black text-[#65A30D]">
                    {device.storage}
                  </span>
                )}
                {device.color && (
                  <span className="px-2 py-0.5 rounded-md bg-[#84CC16]/15 border border-[#84CC16]/30 text-[10px] font-black text-[#65A30D]">
                    {device.color}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Cash Trade-in Guidance */}
          <div className="bg-[#84CC16]/10 border border-[#84CC16]/30 rounded-2xl p-3.5 space-y-2">
            <p className="text-xs font-black text-[#65A30D] flex items-center gap-1.5">
              <Tag size={14} />
              Cash trade-in guidance
            </p>
            <div className="grid grid-cols-3 gap-2 text-center bg-white/70 p-2 rounded-xl border border-[#84CC16]/20">
              {(["A", "B", "C"] as const).map((key) => {
                const labelMap: Record<string, string> = {
                  A: "A • Excellent",
                  B: "B • Good",
                  C: "C • Fair",
                };
                const gr = device.grades[key];
                const isSelected = selectedCondition.startsWith(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleConditionChange(labelMap[key])}
                    className={`py-1 px-1.5 rounded-lg transition-all ${
                      isSelected
                        ? "bg-[#84CC16] text-white shadow-xs"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="text-[10px] font-extrabold block">
                      {labelMap[key]}
                    </span>
                    <span className="text-sm font-black block mt-0.5">
                      {currencySymbol}
                      {gr.price.toFixed(0)}
                    </span>
                    <span className="text-[9.5px] font-bold block mt-0.5 opacity-90">
                      {gr.trend === "up" && `↑ Up ${currencySymbol}${gr.weeklyChange.toFixed(0)}`}
                      {gr.trend === "down" && `↓ Down ${currencySymbol}${gr.weeklyChange.toFixed(0)}`}
                      {gr.trend === "none" && `→ No change`}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-center font-bold text-slate-500">
              Compared with 7 days ago • CeX UK benchmark (95%)
            </p>
          </div>

          {/* Form Assessment Fields */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 text-xs">
            {/* Condition */}
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-600">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => handleConditionChange(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 outline-none focus:border-[#84CC16]"
              >
                <option value="A • Excellent">A • Excellent</option>
                <option value="B • Good">B • Good</option>
                <option value="C • Fair">C • Fair</option>
              </select>
            </div>

            {/* Battery health */}
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-600">Battery health</label>
              <select
                value={batteryHealth}
                onChange={(e) => setBatteryHealth(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 outline-none focus:border-[#84CC16]"
              >
                <option value="100%">100%</option>
                <option value="95%">95%</option>
                <option value="90%">90%</option>
                <option value="87%">87%</option>
                <option value="85%">85%</option>
                <option value="80%">80%</option>
                <option value="<80%">&lt;80%</option>
              </select>
            </div>

            {/* Blacklist status */}
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-600">Blacklist status</label>
              <select
                value={blacklistStatus}
                onChange={(e) => setBlacklistStatus(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 outline-none focus:border-[#84CC16]"
              >
                <option value="Clean">Clean</option>
                <option value="Barred / Blocked">Barred / Blocked</option>
                <option value="Unchecked">Unchecked</option>
              </select>
            </div>

            {/* Network lock */}
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-600">Network lock</label>
              <select
                value={networkLock}
                onChange={(e) => setNetworkLock(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 outline-none focus:border-[#84CC16]"
              >
                <option value="Unlocked">Unlocked</option>
                <option value="Locked - EE">Locked - EE</option>
                <option value="Locked - Vodafone">Locked - Vodafone</option>
                <option value="Locked - O2">Locked - O2</option>
                <option value="Locked - Three">Locked - Three</option>
              </select>
            </div>

            {/* IMEI / Serial */}
            <div className="flex items-center justify-between gap-3">
              <label className="font-extrabold text-slate-600 shrink-0">IMEI / Serial</label>
              <div className="relative flex-1 max-w-[240px]">
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  placeholder="Scan or enter identifier"
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-[#84CC16]"
                />
              </div>
            </div>
          </div>

          {/* Your buying price card (Editable) */}
          <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-2xl bg-white shadow-xs">
            <div>
              <p className="text-sm font-black text-slate-900">Your buying price</p>
              <p className="text-[11px] font-bold text-slate-400">
                You can enter your own price
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                value={buyingPrice}
                onChange={(e) => setBuyingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 h-9 px-2 text-right text-base font-black border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#84CC16]"
              />
              <Pencil size={15} className="text-[#84CC16]" />
            </div>
          </div>

          {/* Recalculation Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-500 font-bold">
              <span>Today&apos;s sale</span>
              <span className="font-extrabold text-slate-800">
                {currencySymbol}
                {todaySaleTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold text-[#65A30D]">
              <span>Trade-in credit</span>
              <span className="font-black">
                -{currencySymbol}
                {buyingPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
              <span>Customer pays</span>
              <span className="text-base font-black text-[#65A30D]">
                {currencySymbol}
                {customerPays.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Add Trade-in CTA */}
          <button
            type="button"
            onClick={handleAdd}
            className="w-full h-12 rounded-2xl bg-[#84CC16] hover:bg-[#74b813] text-white font-black text-sm shadow-md shadow-lime-500/20 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            Add trade-in • {currencySymbol}
            {buyingPrice.toFixed(2)}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
