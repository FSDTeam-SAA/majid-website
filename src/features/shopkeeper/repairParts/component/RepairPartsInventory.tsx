"use client";

import React, { useState } from "react";
import {
  Battery,
  Smartphone,
  Layers,
  Zap,
  Square,
  Spline,
  Box,
  Camera,
  Volume2,
  Radio,
  ToggleLeft,
  Cpu,
  Search,
  Plus,
  Minus,
  SlidersHorizontal,
  History,
  Store,
  AlertCircle,
  Truck,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AddRepairPartModal } from "./AddRepairPartModal";
import {
  useAdjustPartStock,
  useRepairPartMovements,
  useRepairParts,
} from "../hooks/useRepairParts";
import { RepairPartCategory, RepairPartVariant } from "../types";
import { useShop } from "../../shop/store/shop.store";

const CATEGORIES: Array<{
  id: RepairPartCategory | "ALL";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "ALL", label: "All Parts", icon: SlidersHorizontal },
  { id: "Battery", label: "Battery", icon: Battery },
  { id: "Screen", label: "Screen", icon: Smartphone },
  { id: "Touch / Digitiser", label: "Touch / Digitiser", icon: Layers },
  { id: "Charging port", label: "Charging port", icon: Zap },
  { id: "Back cover", label: "Back cover", icon: Square },
  { id: "Flex cable", label: "Flex cable", icon: Spline },
  { id: "Housing", label: "Housing", icon: Box },
  { id: "Camera", label: "Camera", icon: Camera },
  { id: "Speaker", label: "Speaker", icon: Volume2 },
  { id: "Vibration motor", label: "Vibration motor", icon: Radio },
  { id: "Buttons", label: "Buttons", icon: ToggleLeft },
  { id: "Other parts", label: "Other parts", icon: Cpu },
];

export function RepairPartsInventory() {
  const { activeShop } = useShop();
  const currentShopId = activeShop?._id;

  const [selectedCategory, setSelectedCategory] = useState<RepairPartCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementsOpen, setIsMovementsOpen] = useState(false);

  // Quick Adjustment Modal State
  const [adjustingPart, setAdjustingPart] = useState<RepairPartVariant | null>(null);
  const [adjustedQty, setAdjustedQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const { data: parts, isLoading, refetch } = useRepairParts({
    shopId: currentShopId,
    category: selectedCategory === "ALL" ? undefined : selectedCategory,
    search: search.trim() || undefined,
  });

  const { data: movements, isLoading: loadingMovements } = useRepairPartMovements({
    shopId: currentShopId,
  });

  const adjustStockMutation = useAdjustPartStock();

  const handleOpenAdjust = (part: RepairPartVariant) => {
    setAdjustingPart(part);
    setAdjustedQty(part.stock?.onHand ?? 0);
    setAdjustmentReason("");
  };

  const handleCommitAdjust = async () => {
    if (!adjustingPart) return;
    if (!adjustmentReason.trim()) {
      toast.error("Please provide a reason for this stock adjustment");
      return;
    }
    if (adjustedQty < 0) {
      toast.error("Stock count cannot be negative");
      return;
    }
    const reserved = adjustingPart.stock?.reserved ?? 0;
    if (adjustedQty < reserved) {
      toast.error(`Cannot adjust on-hand below reserved count (${reserved} reserved)`);
      return;
    }

    try {
      await adjustStockMutation.mutateAsync({
        variantId: adjustingPart._id,
        shopId: currentShopId,
        newQuantity: adjustedQty,
        reason: adjustmentReason.trim(),
      });
      setAdjustingPart(null);
      await refetch();
    } catch {
      // Handled in hook
    }
  };

  const getCategoryIcon = (cat: RepairPartCategory) => {
    const found = CATEGORIES.find((c) => c.id === cat);
    const Icon = found ? found.icon : Cpu;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Repair Parts Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-lime-400 text-slate-950 uppercase tracking-wider">
              Spare Parts
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Manage compatible replacement parts, staged deliveries, and repair allocations for{" "}
            <span className="text-lime-300 font-semibold">{activeShop?.shopName || "Active Store"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsMovementsOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-semibold cursor-pointer"
          >
            <History className="w-4 h-4 mr-1.5" /> Stock Movements
          </Button>

          <Button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-lime-400 hover:bg-lime-500 text-slate-950 font-black text-xs shadow-lg shadow-lime-400/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Repair Part
          </Button>
        </div>
      </div>

      {/* Category Pills (Icons Only) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isSel = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                isSel
                  ? "bg-slate-900 text-lime-400 border-lime-400/80 shadow-md ring-1 ring-lime-400/30"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search by model, SKU, or part code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-card border-border rounded-xl"
          />
        </div>

        <div className="text-xs text-muted-foreground font-medium self-end sm:self-auto">
          Showing <strong>{parts?.length ?? 0}</strong> parts in catalogue
        </div>
      </div>

      {/* Parts Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Loading repair parts inventory...
          </div>
        ) : !parts || parts.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No repair parts found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start by recording deliveries for batteries, screens, ports, and other replacement components.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add First Part
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Component</th>
                  <th className="py-3.5 px-4">Compatible Model</th>
                  <th className="py-3.5 px-4">Quality</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4 text-right">Cost</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4 text-center">On Hand</th>
                  <th className="py-3.5 px-4 text-center">Reserved</th>
                  <th className="py-3.5 px-4 text-center">Available</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {parts.map((p) => {
                  const onHand = p.stock?.onHand ?? 0;
                  const reserved = p.stock?.reserved ?? 0;
                  const available = p.stock?.available ?? 0;
                  const isLow = available <= (p.minStockLevel ?? 0);

                  return (
                    <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 text-lime-400 flex items-center justify-center shrink-0">
                            {getCategoryIcon(p.category)}
                          </div>
                          <div>
                            <div>{p.category}</div>
                            {p.partName && (
                              <div className="text-[10px] text-muted-foreground font-normal">
                                {p.partName}
                              </div>
                            )}
                            {p.color && (
                              <div className="text-[10px] text-muted-foreground font-normal">
                                {p.color}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        <div className="font-medium">
                          {p.brand} {p.modelName}
                        </div>
                        <div className="text-[10.5px] font-mono text-muted-foreground">
                          {p.modelCode} {p.releaseYear ? `(${p.releaseYear})` : ""}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                            p.quality === "Original"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : p.quality === "OLED"
                              ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          }`}
                        >
                          {p.quality}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {p.sku}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-muted-foreground">
                        £{(p.costPrice ?? 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        £{p.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-foreground">
                        {onHand}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-amber-600">
                        {reserved}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            isLow ? "text-red-500" : "text-emerald-600"
                          }`}
                        >
                          {available}
                          {isLow && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAdjust(p)}
                          className="h-7 px-2.5 text-[11px] font-semibold border-border hover:bg-muted cursor-pointer"
                        >
                          Adjust Count
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Stock Delivery Modal */}
      <AddRepairPartModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />

      {/* Quick Adjust Dialog */}
      <Dialog
        open={Boolean(adjustingPart)}
        onOpenChange={(open) => !open && setAdjustingPart(null)}
      >
        <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-lime-400" /> Adjust Existing Stock Count
            </DialogTitle>
          </DialogHeader>

          {adjustingPart && (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="font-bold text-sm text-white">
                  {adjustingPart.category} ({adjustingPart.quality})
                </div>
                <div className="text-slate-400">
                  {adjustingPart.brand} {adjustingPart.modelName} — {adjustingPart.modelCode}
                </div>
                <div className="text-[11px] font-mono text-lime-400">{adjustingPart.sku}</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="text-slate-400 text-[11px]">Current On Hand</div>
                  <div className="text-xl font-bold text-white">
                    {adjustingPart.stock?.onHand ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {adjustingPart.stock?.reserved ?? 0} units reserved for active repair jobs
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustedQty((q) => Math.max(0, q - 1))}
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <Input
                    type="number"
                    min="0"
                    value={adjustedQty}
                    onChange={(e) => setAdjustedQty(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 h-9 bg-slate-900 border-slate-700 text-white font-mono font-bold text-center text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustedQty((q) => q + 1)}
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Reason for Adjustment <span className="text-red-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Broken in storage, Count correction, Audit mismatch"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs h-9"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAdjustingPart(null)}
                  className="flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCommitAdjust}
                  disabled={adjustStockMutation.isPending}
                  className="flex-1 bg-lime-400 hover:bg-lime-500 text-slate-950 font-black cursor-pointer"
                >
                  {adjustStockMutation.isPending ? "Saving..." : "Commit Adjustment"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Movements History Dialog */}
      <Dialog open={isMovementsOpen} onOpenChange={setIsMovementsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-lime-400" /> Stock Movement History
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-3">
            {loadingMovements ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading movements...</div>
            ) : !movements || movements.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No stock movements recorded yet.</div>
            ) : (
              movements.map((m) => (
                <div
                  key={m._id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          m.type === "delivery"
                            ? "bg-lime-500/10 text-lime-400 border border-lime-500/20"
                            : m.type === "used"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : m.type === "reservation"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {m.type}
                      </span>
                      <span className="font-semibold text-white">
                        {m.variantId?.category} — {m.variantId?.modelName} ({m.variantId?.quality})
                      </span>
                    </div>
                    {m.reason && (
                      <div className="text-[11px] text-slate-400">Reason: {m.reason}</div>
                    )}
                    {m.supplierName && (
                      <div className="text-[11px] text-slate-400">
                        Supplier: {m.supplierName} {m.supplierStamp ? `(${m.supplierStamp})` : ""}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm text-white">
                      {m.type === "delivery" || m.type === "return" ? `+${m.quantity}` : `-${m.quantity}`}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Balance: {m.onHandAfter} on hand
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
