"use client";

import React, { useState } from "react";
import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Clock,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useCompatibleParts,
  useConfirmUseRepairPart,
  useReleaseRepairPart,
  useRepairPartMovements,
  useReserveRepairPart,
  useReturnRepairPart,
} from "../hooks/useRepairParts";
import { CompatiblePartResponse } from "../types";
import { useShop } from "../../shop/store/shop.store";

interface RepairJobPartsSectionProps {
  repairRequestId: string;
  deviceModel: string;
  description: string;
  repairStatus: string;
  shopId?: string;
  onStockUpdated?: () => void;
}

export function RepairJobPartsSection({
  repairRequestId,
  deviceModel,
  description,
  repairStatus,
  shopId,
  onStockUpdated,
}: RepairJobPartsSectionProps) {
  const { activeShop } = useShop();
  const effectiveShopId = shopId || activeShop?._id;

  const [selectedPart, setSelectedPart] = useState<CompatiblePartResponse | null>(null);

  const { data: compatibleParts, isLoading, refetch: refetchCompatible } = useCompatibleParts({
    modelName: deviceModel,
    issue: description,
    shopId: effectiveShopId,
  });

  const { data: jobMovements, refetch: refetchMovements } = useRepairPartMovements({
    repairRequestId,
    shopId: effectiveShopId,
  });

  const reserveMutation = useReserveRepairPart();
  const confirmUseMutation = useConfirmUseRepairPart();
  const releaseMutation = useReleaseRepairPart();
  const returnMutation = useReturnRepairPart();

  const handleReserve = async (part: CompatiblePartResponse) => {
    if (part.available <= 0) {
      toast.error("No available stock in this store to reserve");
      return;
    }
    try {
      await reserveMutation.mutateAsync({
        variantId: part.variant._id,
        repairRequestId,
        shopId: effectiveShopId,
        quantity: 1,
      });
      await Promise.all([refetchCompatible(), refetchMovements()]);
      onStockUpdated?.();
    } catch {
      // Handled in mutation
    }
  };

  const handleConfirmUse = async (part: CompatiblePartResponse) => {
    if (part.onHand <= 0) {
      toast.error("No on-hand units to confirm fitting");
      return;
    }
    try {
      await confirmUseMutation.mutateAsync({
        variantId: part.variant._id,
        repairRequestId,
        shopId: effectiveShopId,
        quantity: 1,
      });
      await Promise.all([refetchCompatible(), refetchMovements()]);
      onStockUpdated?.();
    } catch {
      // Handled in mutation
    }
  };

  const handleRelease = async (variantId: string) => {
    try {
      await releaseMutation.mutateAsync({
        variantId,
        repairRequestId,
        shopId: effectiveShopId,
        quantity: 1,
      });
      await Promise.all([refetchCompatible(), refetchMovements()]);
      onStockUpdated?.();
    } catch {
      // Handled in mutation
    }
  };

  const handleReturn = async (variantId: string) => {
    try {
      await returnMutation.mutateAsync({
        variantId,
        repairRequestId,
        shopId: effectiveShopId,
        quantity: 1,
        reason: "Unused part return to stock",
      });
      await Promise.all([refetchCompatible(), refetchMovements()]);
      onStockUpdated?.();
    } catch {
      // Handled in mutation
    }
  };

  // Find active reservations or usages for this job
  const activeReservations = jobMovements?.filter((m) => m.type === "reservation") || [];
  const activeUsages = jobMovements?.filter((m) => m.type === "used") || [];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-lime-500" />
            <h3 className="text-base font-bold text-foreground">
              Repair Stock & Spare Parts
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-600 border border-lime-500/20 uppercase tracking-wider">
              Handoff v1.1
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Preview, reserve, and deduct compatible inventory for {deviceModel}
          </p>
        </div>
      </div>

      {/* Linked Parts History on this Repair */}
      {jobMovements && jobMovements.length > 0 && (
        <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
          <div className="text-xs font-bold text-foreground">Parts Applied to This Job:</div>
          <div className="space-y-1.5">
            {jobMovements.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between text-xs py-1.5 px-3 bg-background rounded-lg border border-border"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                      m.type === "reservation"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : m.type === "used"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                    }`}
                  >
                    {m.type}
                  </span>
                  <span className="font-semibold text-foreground">
                    {m.variantId?.category} ({m.variantId?.quality}) — {m.variantId?.sku}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {m.type === "used" ? `-${m.quantity} used` : `${m.quantity} reserved`}
                  </span>

                  {m.type === "reservation" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleRelease(m.variantId?._id)}
                      className="h-6 text-[10.5px] px-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Release
                    </Button>
                  )}

                  {m.type === "used" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleReturn(m.variantId?._id)}
                      className="h-6 text-[10.5px] px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Return
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compatible Parts List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-foreground">Compatible Stock for this Model:</div>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Checking compatible inventory...
          </div>
        ) : !compatibleParts || compatibleParts.length === 0 ? (
          <div className="p-5 text-center text-xs text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl">
            No compatible parts recorded for this model yet. Add parts in{" "}
            <strong>Inventory → Repair Parts</strong>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {compatibleParts.map((p) => {
              const isAvailable = p.available > 0;
              return (
                <div
                  key={p.variant._id}
                  className={`p-3.5 rounded-xl border text-xs transition-all space-y-2.5 ${
                    isAvailable
                      ? "bg-card border-border hover:border-lime-500/50"
                      : "bg-muted/20 border-border/80"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        {p.variant.category}
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-lime-400 font-bold">
                          {p.variant.quality}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        {p.variant.sku}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm text-foreground">
                        £{p.sellingPrice.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Selling Price</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <div className="text-[11px]">
                      {isAvailable ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {p.available} available ({p.onHand} on hand)
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Out of stock (0 available)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isAvailable && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleReserve(p)}
                            disabled={reserveMutation.isPending}
                            className="h-7 px-2.5 text-[11px] font-semibold cursor-pointer"
                          >
                            Reserve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleConfirmUse(p)}
                            disabled={confirmUseMutation.isPending}
                            className="h-7 px-2.5 text-[11px] font-bold bg-lime-400 hover:bg-lime-500 text-slate-950 cursor-pointer"
                          >
                            Confirm Fitted
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Out of Stock Supplier Price Comparison */}
                  {!isAvailable && p.supplierComparison?.cheapestSupplier && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> Cheapest Past Purchase Source:
                      </div>
                      <div className="flex justify-between">
                        <span>Supplier: <strong>{p.supplierComparison.cheapestSupplier.supplierName}</strong></span>
                        <span className="font-bold">£{p.supplierComparison.cheapestSupplier.costPrice?.toFixed(2)}</span>
                      </div>
                      {p.supplierComparison.cheapestSupplier.stamp && (
                        <div className="text-[10px] text-muted-foreground">
                          Ref: {p.supplierComparison.cheapestSupplier.stamp}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
