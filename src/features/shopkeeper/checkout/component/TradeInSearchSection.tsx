/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, X, Plus, TrendingUp, TrendingDown, Minus, RefreshCw, Smartphone } from "lucide-react";
import tradeInCatalogRaw from "../../inventory/data/tradeInCatalog.json";

export interface TradeInGrade {
  name: string;
  price: number;
  weeklyChange: number;
  trend: "up" | "down" | "none";
}

export interface TradeInDevice {
  id: string;
  brand: string;
  category: string;
  deviceName: string;
  modelNumber: string;
  storage: string;
  color: string;
  imageUrl?: string;
  upc?: string;
  ean?: string;
  grades: {
    A: TradeInGrade;
    B: TradeInGrade;
    C: TradeInGrade;
  };
  lastUpdated: string;
  source: string;
}

interface TradeInSearchSectionProps {
  currencySymbol: string;
  onSelectDevice: (device: TradeInDevice, gradeKey?: "A" | "B" | "C") => void;
  onCreateCustomDevice: () => void;
}

export const TradeInSearchSection: React.FC<TradeInSearchSectionProps> = ({
  currencySymbol,
  onSelectDevice,
  onCreateCustomDevice,
}) => {
  const [searchQuery, setSearchQuery] = useState("iPhone 15 Pro");

  const catalogItems: TradeInDevice[] = useMemo(() => {
    const raw = (tradeInCatalogRaw as any).items || tradeInCatalogRaw;
    return Array.isArray(raw) ? raw : [];
  }, []);

  const filteredDevices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return catalogItems.slice(0, 5);
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    return catalogItems
      .filter((device) => {
        const searchStr = `${device.deviceName} ${device.modelNumber} ${device.storage} ${device.color} ${device.upc || ""} ${device.ean || ""}`.toLowerCase();
        return tokens.every((token) => searchStr.includes(token));
      })
      .slice(0, 10);
  }, [catalogItems, searchQuery]);

  const cleanModelNumber = (modelNum: string) =>
    modelNum.replace(/^Model\s*/i, "");

  return (
    <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm space-y-5">
      {/* Search Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-black text-lg">
          <RefreshCw size={20} className="text-[#84CC16]" />
          <h2>Trade-in search • Prices and weekly trends</h2>
        </div>

        {/* Search input with lime focus */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search device name, model number (e.g. A3102), storage or colour..."
            className="w-full h-12 pl-11 pr-10 rounded-2xl border-2 border-red-200 focus:border-[#84CC16] bg-slate-50/50 text-sm font-bold text-slate-900 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Device Recommendations Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#84CC16]/10 flex items-center justify-center text-[#84CC16]">
              <RefreshCw size={14} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Device recommendations
              </h3>
              <p className="text-[11px] font-bold text-slate-400">
                Illustrative prices and trends • demo data
              </p>
            </div>
          </div>
        </div>

        {/* Table of device recommendations */}
        <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-xs">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-slate-50/80 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-150">
            <div className="col-span-6">Device info</div>
            <div className="col-span-6 grid grid-cols-3 text-center">
              <span className="text-[#84CC16]">A • Excellent</span>
              <span className="text-amber-600">B • Good</span>
              <span className="text-slate-600">C • Fair</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device) => {
                const modelNum = cleanModelNumber(device.modelNumber);
                return (
                  <div
                    key={device.id}
                    className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Device Column */}
                    <div className="col-span-6 flex items-center gap-3 pr-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/50">
                        {device.imageUrl ? (
                          <Image
                            src={device.imageUrl}
                            alt={device.deviceName}
                            width={44}
                            height={44}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <Smartphone size={22} className="text-[#84CC16]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">
                          {device.deviceName}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          {modelNum && (
                            <span className="px-2 py-0.5 rounded-md bg-[#84CC16]/15 border border-[#84CC16]/30 text-[10px] font-black text-[#65A30D]">
                              Model {modelNum}
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

                    {/* Grade Columns */}
                    <div className="col-span-6 grid grid-cols-3 gap-2 text-center">
                      {(["A", "B", "C"] as const).map((gradeKey) => {
                        const grade = device.grades[gradeKey];
                        return (
                          <button
                            key={gradeKey}
                            type="button"
                            onClick={() => onSelectDevice(device, gradeKey)}
                            className="p-2 rounded-xl hover:bg-[#84CC16]/10 border border-transparent hover:border-[#84CC16]/30 transition-all text-center group cursor-pointer"
                          >
                            <p className="text-sm font-black text-slate-900 group-hover:text-[#65A30D]">
                              {currencySymbol}
                              {grade.price.toFixed(0)}
                            </p>
                            <div className="flex items-center justify-center gap-0.5 text-[10px] font-bold mt-0.5">
                              {grade.trend === "up" && (
                                <span className="text-emerald-600 flex items-center">
                                  <TrendingUp size={11} className="mr-0.5" />
                                  Up {currencySymbol}
                                  {grade.weeklyChange.toFixed(0)}
                                </span>
                              )}
                              {grade.trend === "down" && (
                                <span className="text-rose-500 flex items-center">
                                  <TrendingDown size={11} className="mr-0.5" />
                                  Down {currencySymbol}
                                  {grade.weeklyChange.toFixed(0)}
                                </span>
                              )}
                              {grade.trend === "none" && (
                                <span className="text-slate-400 flex items-center">
                                  <Minus size={11} className="mr-0.5" />
                                  No change
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400">
                <p className="text-xs font-bold">No catalog devices matched</p>
                <p className="text-[11px] mt-1 text-slate-500">
                  Try another model, storage, or create a custom item.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Meta & Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] font-bold text-slate-400">
          <div className="flex items-center gap-2">
            <span>Source: demo price guide • Last updated: today</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md border border-red-300 text-red-500 font-extrabold bg-red-50/50">
              Compared with 7 days ago
            </span>
          </div>
          <button
            type="button"
            onClick={onCreateCustomDevice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black transition-colors shrink-0"
          >
            <Plus size={14} className="text-[#84CC16]" />
            Create new item name
          </button>
        </div>
      </div>
    </div>
  );
};
