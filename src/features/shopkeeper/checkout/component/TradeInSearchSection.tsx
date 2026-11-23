/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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

const QUICK_SEARCH_CHIPS = [
  "iPhone 15 Pro",
  "iPhone 15",
  "iPhone 14 Pro",
  "Samsung S24",
  "iPad Pro",
];

export const TradeInSearchSection: React.FC<TradeInSearchSectionProps> = ({
  currencySymbol,
  onSelectDevice,
  onCreateCustomDevice,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const catalogItems: TradeInDevice[] = useMemo(() => {
    const raw = (tradeInCatalogRaw as any).items || tradeInCatalogRaw;
    return Array.isArray(raw) ? raw : [];
  }, []);

  const filteredDevices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return [];
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    return catalogItems
      .filter((device) => {
        const searchStr = `${device.deviceName} ${device.modelNumber} ${device.storage} ${device.color} ${device.upc || ""} ${device.ean || ""}`.toLowerCase();
        return tokens.every((token) => searchStr.includes(token));
      })
      .slice(0, 5);
  }, [catalogItems, searchQuery]);

  const cleanModelNumber = (modelNum: string) =>
    modelNum.replace(/^Model\s*/i, "");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleQuickChipClick = (term: string) => {
    setSearchQuery(term);
    setIsExpanded(true);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[24px] p-4 sm:p-5 shadow-sm space-y-3 transition-all duration-300">
      {/* Header bar: Compact & Collapsible */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#84CC16]/10 flex items-center justify-center text-[#84CC16] shrink-0">
            <RefreshCw size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Trade-in search • Prices and weekly trends
              </h2>
              <span className="text-[10px] font-black text-[#65A30D] bg-lime-50 border border-lime-200 px-2 py-0.5 rounded-full hidden sm:inline-flex">
                2,600+ models
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              Check live market trade-in values against today&apos;s sale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onCreateCustomDevice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-black transition-colors shrink-0 shadow-2xs"
          >
            <Plus size={14} className="text-[#84CC16]" />
            Create new item name
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition-colors"
            title={isExpanded ? "Collapse trade-in section" : "Expand trade-in section"}
          >
            <span className="text-[11px]">{isExpanded ? "Hide" : "Show"}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={searchQuery}
          onFocus={() => {
            if (!isExpanded) setIsExpanded(true);
          }}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search device name, model (e.g. A3102), storage or colour..."
          className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 focus:border-[#84CC16] bg-slate-50/60 text-xs font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">
              Quick:
            </span>
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleQuickChipClick(chip)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors shrink-0 ${
                  searchQuery.toLowerCase() === chip.toLowerCase()
                    ? "bg-[#84CC16] text-white border-[#84CC16]"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Results Table (bounded scrollable height to not push Browse Inventory down) */}
          {searchQuery.trim().length > 0 ? (
            <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-xs">
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-slate-50/80 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-150">
                <div className="col-span-6">Device info</div>
                <div className="col-span-6 grid grid-cols-3 text-center">
                  <span className="text-[#65A30D]">A • Excellent</span>
                  <span className="text-amber-600">B • Good</span>
                  <span className="text-slate-600">C • Fair</span>
                </div>
              </div>

              {/* Scrollable Rows Container (max 280px) */}
              <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                {filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => {
                    const modelNum = cleanModelNumber(device.modelNumber);
                    return (
                      <div
                        key={device.id}
                        className="grid grid-cols-12 px-3.5 py-2.5 items-center hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Device Column */}
                        <div className="col-span-6 flex items-center gap-2.5 pr-2">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/50">
                            {device.imageUrl ? (
                              <Image
                                src={device.imageUrl}
                                alt={device.deviceName}
                                width={36}
                                height={36}
                                className="object-contain w-full h-full"
                              />
                            ) : (
                              <Smartphone
                                size={18}
                                className="text-[#84CC16]"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">
                              {device.deviceName}
                            </p>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              {modelNum && (
                                <span className="px-1.5 py-0.2 rounded bg-[#84CC16]/15 border border-[#84CC16]/30 text-[9px] font-black text-[#65A30D]">
                                  {modelNum}
                                </span>
                              )}
                              {device.storage && (
                                <span className="px-1.5 py-0.2 rounded bg-[#84CC16]/15 border border-[#84CC16]/30 text-[9px] font-black text-[#65A30D]">
                                  {device.storage}
                                </span>
                              )}
                              {device.color && (
                                <span className="px-1.5 py-0.2 rounded bg-[#84CC16]/15 border border-[#84CC16]/30 text-[9px] font-black text-[#65A30D] truncate max-w-[90px]">
                                  {device.color}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Grade Columns */}
                        <div className="col-span-6 grid grid-cols-3 gap-1.5 text-center">
                          {(["A", "B", "C"] as const).map((gradeKey) => {
                            const grade = device.grades[gradeKey];
                            return (
                              <button
                                key={gradeKey}
                                type="button"
                                onClick={() => onSelectDevice(device, gradeKey)}
                                className="p-1.5 rounded-xl hover:bg-[#84CC16]/10 border border-transparent hover:border-[#84CC16]/30 transition-all text-center group cursor-pointer"
                              >
                                <p className="text-xs font-black text-slate-900 group-hover:text-[#65A30D]">
                                  {currencySymbol}
                                  {grade.price.toFixed(0)}
                                </p>
                                <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold mt-0.5">
                                  {grade.trend === "up" && (
                                    <span className="text-emerald-600 flex items-center">
                                      <TrendingUp
                                        size={10}
                                        className="mr-0.5"
                                      />
                                      Up {currencySymbol}
                                      {grade.weeklyChange.toFixed(0)}
                                    </span>
                                  )}
                                  {grade.trend === "down" && (
                                    <span className="text-rose-500 flex items-center">
                                      <TrendingDown
                                        size={10}
                                        className="mr-0.5"
                                      />
                                      Down {currencySymbol}
                                      {grade.weeklyChange.toFixed(0)}
                                    </span>
                                  )}
                                  {grade.trend === "none" && (
                                    <span className="text-slate-400 flex items-center">
                                      <Minus size={10} className="mr-0.5" />
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
                  <div className="py-6 text-center text-slate-400">
                    <p className="text-xs font-bold">No catalog devices match</p>
                    <p className="text-[10px] mt-0.5 text-slate-500">
                      Try another keyword or click &quot;Create new item name&quot;
                      above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-150 text-center text-slate-500 text-xs font-medium">
              Type a device model above or pick a quick search chip to check A /
              B / C trade-in market values.
            </div>
          )}

          {/* Footer Note */}
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1 pt-1">
            <span>Source: demo price guide • Last updated: today</span>
            <span className="px-1.5 py-0.5 rounded border border-red-200 text-red-500 bg-red-50/50 font-black">
              Compared with 7 days ago
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
