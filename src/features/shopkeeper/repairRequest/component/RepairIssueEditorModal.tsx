"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompatibleParts } from "@/features/shopkeeper/repairParts/hooks/useRepairParts";
import {
  REPAIR_ISSUE_CATEGORIES,
  isIssuePriceOptional,
  issueCategoryFromRaw,
  issuePriceFromRaw,
  issueProblemsFromRaw,
} from "@/features/customer/repairRequest/utils/repairConstants";

export function RepairIssueEditorModal({
  isOpen,
  onClose,
  title = "Diagnostic Assessment — Confirmed Faults",
  subtitle = "Select confirmed faults, update prices (leave 0 for TBC) and pick spare parts",
  deviceModelName,
  deviceModelCode,
  shopId,
  initialIssues,
  currencySymbol = "£",
  isSaving = false,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  deviceModelName?: string;
  deviceModelCode?: string;
  shopId?: string;
  initialIssues: Array<Record<string, any>>;
  currencySymbol?: string;
  isSaving?: boolean;
  onSave: (
    issues: Array<Record<string, any>>,
    totalPrice: number,
    summaryDescription: string,
  ) => Promise<void> | void;
}) {
  const [issues, setIssues] = useState<Array<Record<string, any>>>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [infoText, setInfoText] = useState("");
  const [priceText, setPriceText] = useState("0");
  const [estTime, setEstTime] = useState("1–2 Hours");
  const [selectedPart, setSelectedPart] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIssues(
        initialIssues.map((raw) => ({
          ...raw,
          category: issueCategoryFromRaw(raw),
          problems: issueProblemsFromRaw(raw),
          estimatedPrice: issuePriceFromRaw(raw),
          estimatedTime: raw?.estimatedTime || "1–2 Hours",
        })),
      );
      setActiveCategory(null);
      setEditingIdx(null);
    }
  }, [isOpen, initialIssues]);

  const { data: compatiblePartsData, isLoading: loadingParts } =
    useCompatibleParts(
      {
        modelName: deviceModelName || deviceModelCode,
        issue: activeCategory || undefined,
        shopId,
      },
      isOpen && Boolean(activeCategory && (deviceModelName || deviceModelCode)),
    );
  const recommendedParts: any[] = Array.isArray(compatiblePartsData)
    ? compatiblePartsData
    : [];

  if (!isOpen) return null;

  const openCategory = (catName: string, editIndex?: number, existing?: any) => {
    const cfg = REPAIR_ISSUE_CATEGORIES.find((c) => c.id === catName);
    setActiveCategory(catName);
    setEditingIdx(editIndex ?? null);
    setSelectedProblems(
      existing ? issueProblemsFromRaw(existing) : [],
    );
    setInfoText(
      existing
        ? String(existing.additionalInfo || existing.additionalDetails || "")
        : "",
    );
    const defaultP = cfg ? cfg.defaultPrice : 0;
    const p = existing ? issuePriceFromRaw(existing) : defaultP;
    setPriceText(p > 0 ? p.toString() : "");
    setEstTime(existing?.estimatedTime || cfg?.defaultTime || "1–2 Hours");
    setSelectedPart(existing?.selectedPart || null);
  };

  const confirmEditingIssue = () => {
    if (!activeCategory) return;
    const numericPrice = Math.max(0, Number.parseFloat(priceText || "0") || 0);
    const probs =
      selectedProblems.length > 0
        ? selectedProblems
        : ["Confirmed diagnostic fault"];
    const entry: Record<string, any> = {
      category: activeCategory,
      issueCategory: activeCategory,
      problems: probs,
      commonProblems: probs,
      additionalInfo: infoText.trim(),
      additionalDetails: infoText.trim(),
      estimatedTime: estTime,
      estimatedPrice: numericPrice,
      ...(selectedPart ? { selectedPart } : {}),
    };

    setIssues((prev) => {
      if (editingIdx !== null && editingIdx >= 0 && editingIdx < prev.length) {
        const next = [...prev];
        next[editingIdx] = entry;
        return next;
      }
      return [...prev, entry];
    });
    setActiveCategory(null);
    setEditingIdx(null);
  };

  const totalPrice = issues.reduce(
    (sum, iss) => sum + issuePriceFromRaw(iss),
    0,
  );

  const handleSaveAll = () => {
    const summaryDesc = issues
      .map((iss) => {
        const c = issueCategoryFromRaw(iss);
        const probs = issueProblemsFromRaw(iss).join(", ");
        return probs ? `${c} (${probs})` : c;
      })
      .join("; ");
    onSave(issues, totalPrice, summaryDesc);
  };

  const activeCfg = REPAIR_ISSUE_CATEGORIES.find(
    (c) => c.id === activeCategory,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0">
              <Wrench size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground">
                {activeCategory || title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {activeCategory
                  ? "Confirm faults, adjust price (optional / TBC), or link a stock part"
                  : subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (activeCategory ? setActiveCategory(null) : onClose())}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeCategory ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-2">
                  Confirmed Faults / Symptoms
                </label>
                <div className="flex flex-wrap gap-2">
                  {(activeCfg?.problems || ["Diagnostic fault"]).map((p) => {
                    const isSel = selectedProblems.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          setSelectedProblems((prev) =>
                            prev.includes(p)
                              ? prev.filter((x) => x !== p)
                              : [...prev, p],
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSel
                            ? "border-[#10B981] bg-[#10B981] text-white"
                            : "border-border bg-surface text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    Estimated Price ({currencySymbol}) — blank/0 for TBC
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={
                      isIssuePriceOptional(activeCategory)
                        ? "Optional (Price TBC)"
                        : "0.00"
                    }
                    value={priceText}
                    onChange={(e) => setPriceText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">
                    Estimated Time
                  </label>
                  <select
                    value={estTime}
                    onChange={(e) => setEstTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground"
                  >
                    <option>30–60 Mins</option>
                    <option>1 Hour</option>
                    <option>1–2 Hours</option>
                    <option>2–4 Hours</option>
                    <option>1–2 Days</option>
                    <option>2–5 Days</option>
                    <option>Diagnostic Needed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  Diagnostic / Technician Notes
                </label>
                <textarea
                  rows={2}
                  value={infoText}
                  onChange={(e) => setInfoText(e.target.value)}
                  placeholder="Optional details about fault or testing..."
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-xs text-foreground"
                />
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-muted-foreground">
                    Compatible Stock Parts (Optional)
                  </span>
                  {selectedPart && (
                    <button
                      type="button"
                      onClick={() => setSelectedPart(null)}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Clear part
                    </button>
                  )}
                </div>

                {loadingParts ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 size={14} className="animate-spin" /> Loading compatible parts...
                  </div>
                ) : recommendedParts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No matching stock parts found for {deviceModelName || "this model"}.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {recommendedParts.map((part) => {
                      const isSel = selectedPart?.variantId === part._id;
                      return (
                        <button
                          key={part._id}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setSelectedPart(null);
                            } else {
                              setSelectedPart({
                                variantId: part._id,
                                variantName: part.partName || part.category,
                                partName: part.partName || part.category,
                                quality: part.quality,
                                sku: part.sku,
                                price: Number(part.sellingPrice || 0),
                                quantity: 1,
                              });
                              if (
                                (!priceText || Number.parseFloat(priceText) <= 0) &&
                                part.sellingPrice
                              ) {
                                setPriceText(String(part.sellingPrice));
                              }
                            }
                          }}
                          className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                            isSel
                              ? "border-[#10B981] bg-[#10B981]/10"
                              : "border-border bg-surface hover:border-[#10B981]/40"
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {part.partName || part.category} ({part.quality})
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              SKU: {part.sku} · Stock: {part.available ?? part.stock?.available ?? 0}
                            </p>
                          </div>
                          <span className="text-xs font-black text-[#10B981]">
                            {currencySymbol}
                            {Number(part.sellingPrice || 0).toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {issues.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                    Current Issues ({issues.length})
                  </span>
                  {issues.map((iss, idx) => {
                    const cat = issueCategoryFromRaw(iss);
                    const probs = issueProblemsFromRaw(iss);
                    const price = issuePriceFromRaw(iss);
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-surface border border-border flex items-start justify-between gap-3"
                      >
                        <div
                          onClick={() => openCategory(cat, idx, iss)}
                          className="cursor-pointer flex-1 space-y-1"
                        >
                          <p className="text-xs font-black text-foreground">{cat}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {probs.join(", ") || "Inspection needed"}
                          </p>
                          {iss.selectedPart && (
                            <p className="text-[11px] text-[#10B981] font-semibold">
                              Part: {iss.selectedPart.variantName || iss.selectedPart.partName} ({iss.selectedPart.sku})
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-foreground">
                            {price > 0
                              ? `${currencySymbol}${price.toFixed(2)}`
                              : "Price TBC"}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setIssues((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground block mb-2.5">
                  Add / Select Confirmed Issue Category
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {REPAIR_ISSUE_CATEGORIES.map((cfg) => (
                    <button
                      key={cfg.id}
                      type="button"
                      onClick={() => openCategory(cfg.id)}
                      className="p-3 rounded-xl border border-border bg-surface hover:border-[#10B981] flex items-center justify-between text-left transition-all"
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground">{cfg.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {cfg.optionalPrice || cfg.defaultPrice <= 0
                            ? `${cfg.defaultTime} · Optional price (TBC)`
                            : `${cfg.defaultTime} · from ${currencySymbol}${cfg.defaultPrice}`}
                        </p>
                      </div>
                      <Plus size={15} className="text-[#10B981] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-border flex items-center justify-between gap-4 bg-card">
          {!activeCategory ? (
            <div>
              <span className="text-[11px] text-muted-foreground block">
                {issues.length} fault(s) selected
              </span>
              <span className="text-base font-black text-[#10B981]">
                {totalPrice > 0
                  ? `${currencySymbol}${totalPrice.toFixed(2)}`
                  : "Price TBC"}
              </span>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveCategory(null)}
              className="rounded-full"
            >
              Back to List
            </Button>
          )}

          {activeCategory ? (
            <Button
              type="button"
              onClick={confirmEditingIssue}
              className="rounded-full px-6 bg-[#10B981] hover:bg-[#059669] text-white font-bold"
            >
              Confirm Fault &amp; Price
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSaving || issues.length === 0}
              onClick={handleSaveAll}
              className="rounded-full px-6 bg-[#10B981] hover:bg-[#059669] text-white font-bold"
            >
              {isSaving ? "Saving..." : "Save Confirmed Faults"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
