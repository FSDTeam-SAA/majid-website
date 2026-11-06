"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Check,
  ArrowLeft,
  ArrowRight,
  Store,
  Truck,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  RepairPartCategory,
  DeviceType,
  PartQuality,
  DeviceCatalogItem,
} from "../types";
import {
  useAddStockDelivery,
  useAdjustPartStock,
  useDeviceCatalogue,
  useRepairParts,
} from "../hooks/useRepairParts";
import { useShop } from "../../shop/store/shop.store";
import deviceCatalogFallback from "../data/deviceCatalog.json";

interface AddRepairPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: RepairPartCategory;
}

const CATEGORIES: Array<{
  id: RepairPartCategory;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { id: "Battery", name: "Battery", icon: Battery, description: "Internal power cells" },
  { id: "Screen", name: "Screen", icon: Smartphone, description: "Displays & panels" },
  { id: "Touch / Digitiser", name: "Touch / Digitiser", icon: Layers, description: "Glass digitiser layer" },
  { id: "Charging port", name: "Charging port", icon: Zap, description: "Power connectors" },
  { id: "Back cover", name: "Back cover", icon: Square, description: "Rear housing & glass" },
  { id: "Flex cable", name: "Flex cable", icon: Spline, description: "Interconnect ribbons" },
  { id: "Housing", name: "Housing", icon: Box, description: "Chassis & frames" },
  { id: "Camera", name: "Camera", icon: Camera, description: "Front & rear modules" },
  { id: "Speaker", name: "Speaker", icon: Volume2, description: "Ear & loud speakers" },
  { id: "Vibration motor", name: "Vibration motor", icon: Radio, description: "Taptic & haptic engines" },
  { id: "Buttons", name: "Buttons", icon: ToggleLeft, description: "Volume, power & switch keys" },
  { id: "Other parts", name: "Other parts", icon: Cpu, description: "Antennas, trays & brackets" },
];

const DEVICE_TYPES: DeviceType[] = ["Phone", "Tablet", "Laptop", "Other"];

const DEFAULT_BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Huawei",
  "Oppo",
  "Sony",
  "OnePlus",
  "Motorola",
];

export function AddRepairPartModal({
  isOpen,
  onClose,
  initialCategory,
}: AddRepairPartModalProps) {
  const { activeShop, shops } = useShop();
  const currentShopId = activeShop?._id;

  // Step Tracker (1 to 5)
  // 1: Category -> 2: Compatibility -> 3: Model -> 4: Quality & Adjust -> 5: Stock Details
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form selections
  const [category, setCategory] = useState<RepairPartCategory>(
    initialCategory || "Screen"
  );
  const [deviceType, setDeviceType] = useState<DeviceType>("Phone");
  const [brand, setBrand] = useState<string>("Apple");
  const [customBrand, setCustomBrand] = useState("");
  const [isAddingBrand, setIsAddingBrand] = useState(false);

  // Model Selection
  const [modelSearch, setModelSearch] = useState("");
  const [selectedModel, setSelectedModel] = useState<DeviceCatalogItem | null>(null);
  const [manualModelName, setManualModelName] = useState("");
  const [manualModelCode, setManualModelCode] = useState("");
  const [manualYear, setManualYear] = useState("");
  const [isManualModel, setIsManualModel] = useState(false);
  const [screenPlacement, setScreenPlacement] = useState<"Inner screen" | "Cover screen">("Inner screen");

  // Step 4: Quality & Quick Adjustment
  const [selectedQuality, setSelectedQuality] = useState<PartQuality>("Original");
  const [stagedAdjustments, setStagedAdjustments] = useState<Record<string, number>>({});
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isSavingAdjustment, setIsSavingAdjustment] = useState(false);

  // Step 5: Stock Details (Delivery)
  const [sku, setSku] = useState("");
  const [deliveryQty, setDeliveryQty] = useState<number>(1);
  const [costPrice, setCostPrice] = useState<string>("25.00");
  const [sellingPrice, setSellingPrice] = useState<string>("55.00");
  const [supplierName, setSupplierName] = useState("");
  const [supplierStamp, setSupplierStamp] = useState("");
  const [minStockReminder, setMinStockReminder] = useState<number>(2);

  // Category specific fields
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [position, setPosition] = useState<"Front" | "Rear" | "Top" | "Bottom">("Rear");
  const [buttonType, setButtonType] = useState<"Volume up" | "Volume down" | "Power" | "Other">("Volume up");
  const [flexSubtype, setFlexSubtype] = useState("Power flex");
  const [chargingPortType, setChargingPortType] = useState("USB-C");
  const [housingSubtype, setHousingSubtype] = useState("");
  const [partName, setPartName] = useState("");

  // Store allocation
  const [allocations, setAllocations] = useState<Array<{ shopId: string; quantity: number }>>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const addDeliveryMutation = useAddStockDelivery();
  const adjustStockMutation = useAdjustPartStock();

  // Load existing parts for this model & category to display existing counts
  const { data: existingParts, refetch: refetchExisting } = useRepairParts({
    category,
    brand,
    modelCode: selectedModel ? selectedModel.modelCode : manualModelCode,
    shopId: currentShopId,
  });

  // Catalogue search
  const { data: remoteCatalogue } = useDeviceCatalogue({
    query: modelSearch,
    brand,
    deviceType,
  });

  const catalogueList = useMemo(() => {
    if (remoteCatalogue && remoteCatalogue.length > 0) return remoteCatalogue;
    const q = modelSearch.trim().toLowerCase();
    const cleanQ = q.replace(/^sm-/, "");
    return (deviceCatalogFallback as DeviceCatalogItem[]).filter((d) => {
      const matchBrand = !brand || d.brand.toLowerCase() === brand.toLowerCase();
      const matchType = !deviceType || d.deviceType.toLowerCase() === deviceType.toLowerCase();
      if (!matchBrand || !matchType) return false;
      if (!q) return true;
      return (
        d.modelName.toLowerCase().includes(q) ||
        d.modelCode.toLowerCase().includes(q) ||
        d.modelCode.toLowerCase().replace(/^sm-/, "").includes(cleanQ) ||
        String(d.releaseYear).includes(q)
      );
    }).slice(0, 30);
  }, [remoteCatalogue, modelSearch, brand, deviceType]);

  // Is current model a Samsung Fold or Flip?
  const isFoldOrFlip = useMemo(() => {
    const name = (selectedModel?.modelName || manualModelName).toLowerCase();
    return name.includes("flip") || name.includes("fold");
  }, [selectedModel, manualModelName]);

  // Quality options for current category
  const availableQualities: PartQuality[] = useMemo(() => {
    if (category === "Screen") {
      return ["TFT", "OLED", "Original"];
    }
    return ["Compatible", "Original"];
  }, [category]);

  // Set default quality when category changes
  useEffect(() => {
    if (category === "Screen") {
      if (!["TFT", "OLED", "Original"].includes(selectedQuality)) {
        setSelectedQuality("Original");
      }
    } else {
      if (!["Compatible", "Original"].includes(selectedQuality)) {
        setSelectedQuality("Compatible");
      }
    }
  }, [category, selectedQuality]);

  // Initialize store allocation
  useEffect(() => {
    if (currentShopId) {
      setAllocations([{ shopId: currentShopId, quantity: deliveryQty }]);
    }
  }, [currentShopId, deliveryQty]);

  // Auto-generate suggested SKU
  useEffect(() => {
    const code = selectedModel ? selectedModel.modelCode : manualModelCode || "GEN";
    const cleanCat = category.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase();
    const cleanCode = code.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const cleanQ = selectedQuality.substring(0, 3).toUpperCase();
    setSku(`RP-${cleanCat}-${cleanCode}-${cleanQ}`);
  }, [category, selectedModel, manualModelCode, selectedQuality]);

  // Helper: Get existing count for a quality
  const getQualityCounts = (q: PartQuality) => {
    const match = existingParts?.find((p) => {
      if (p.quality !== q) return false;
      if (category === "Camera" && p.position !== position) return false;
      if (category === "Speaker" && p.position !== position) return false;
      if (category === "Buttons" && p.buttonType !== buttonType) return false;
      if (isFoldOrFlip && p.screenPlacement !== screenPlacement) return false;
      return true;
    });
    return {
      variantId: match?._id,
      onHand: match?.stock?.onHand ?? 0,
      available: match?.stock?.available ?? 0,
      reserved: match?.stock?.reserved ?? 0,
      sellingPrice: match?.sellingPrice,
      costPrice: match?.costPrice,
    };
  };

  const handleStageAdjustment = (q: PartQuality, delta: number) => {
    const current = getQualityCounts(q).onHand;
    const staged = stagedAdjustments[q] !== undefined ? stagedAdjustments[q] : current;
    const next = staged + delta;
    if (next < 0) {
      toast.error("Stock count cannot be negative");
      return;
    }
    setStagedAdjustments((prev) => ({ ...prev, [q]: next }));
  };

  const handleSaveAdjustments = async () => {
    if (!adjustmentReason.trim()) {
      toast.error("Please provide a reason when saving an adjustment");
      return;
    }

    const pendingQualities = Object.keys(stagedAdjustments) as PartQuality[];
    if (pendingQualities.length === 0) {
      toast.info("No adjustments staged");
      return;
    }

    setIsSavingAdjustment(true);
    try {
      for (const q of pendingQualities) {
        const counts = getQualityCounts(q);
        if (!counts.variantId) {
          toast.error(`No existing record found for ${q}. Add initial stock first.`);
          continue;
        }
        await adjustStockMutation.mutateAsync({
          variantId: counts.variantId,
          shopId: currentShopId,
          newQuantity: stagedAdjustments[q],
          reason: adjustmentReason.trim(),
        });
      }
      setStagedAdjustments({});
      setAdjustmentReason("");
      await refetchExisting();
    } catch {
      // Handled in mutation
    } finally {
      setIsSavingAdjustment(false);
    }
  };

  const activeModelTitle = isManualModel
    ? `${manualModelName} (${manualYear || "N/A"}) — ${manualModelCode}`
    : selectedModel
    ? `${selectedModel.brand} ${selectedModel.modelName} (${selectedModel.releaseYear}) — ${selectedModel.modelCode}`
    : "No model selected";

  const handleConfirmAddStock = async () => {
    if (!currentShopId) {
      toast.error("Please select an active store");
      return;
    }

    const modelName = isManualModel ? manualModelName.trim() : selectedModel?.modelName || "";
    const modelCode = isManualModel ? manualModelCode.trim() : selectedModel?.modelCode || "";
    const releaseYear = isManualModel ? manualYear.trim() : selectedModel?.releaseYear || "";

    if (!modelName || !modelCode) {
      toast.error("Valid model name and model number are required");
      return;
    }

    const numCost = parseFloat(costPrice) || 0;
    const numSell = parseFloat(sellingPrice) || 0;

    if (deliveryQty <= 0) {
      toast.error("Delivery quantity must be a positive whole number");
      return;
    }

    const payload = {
      variant: {
        category,
        deviceType,
        brand,
        modelName,
        modelCode,
        releaseYear,
        quality: selectedQuality,
        sku: sku.trim(),
        partName: category === "Other parts" ? partName.trim() : undefined,
        color: ["Screen", "Back cover", "Housing", "Touch / Digitiser"].includes(category) ? color.trim() : undefined,
        size: ["Screen", "Touch / Digitiser"].includes(category) ? size.trim() : undefined,
        position: ["Camera", "Speaker"].includes(category) ? position : undefined,
        buttonType: category === "Buttons" ? buttonType : undefined,
        flexSubtype: category === "Flex cable" ? flexSubtype.trim() : undefined,
        screenPlacement: isFoldOrFlip ? screenPlacement : undefined,
        sellingPrice: numSell,
        costPrice: numCost,
        minStockLevel: minStockReminder,
      },
      deliveryQuantity: deliveryQty,
      costPrice: numCost,
      sellingPrice: numSell,
      supplierName: supplierName.trim() || undefined,
      supplierStamp: supplierStamp.trim() || undefined,
      minStockReminder,
      allocations,
    };

    try {
      await addDeliveryMutation.mutateAsync(payload);
      setShowReviewDialog(false);
      onClose();
    } catch {
      // Handled in mutation
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                  Repair Parts Stock Intake
                </DialogTitle>
                <p className="text-xs text-slate-400 font-medium">
                  Add deliveries and quick-adjust replacement stock
                </p>
              </div>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? "w-7 bg-lime-400"
                      : s < step
                      ? "w-2 bg-slate-600"
                      : "w-2 bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Context pill banner */}
          {step > 1 && (
            <div className="bg-slate-950/60 px-6 py-2 border-b border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold">Active Selection:</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                {category}
              </span>
              <span className="text-slate-600">/</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                {deviceType} • {brand}
              </span>
              {selectedModel && (
                <>
                  <span className="text-slate-600">/</span>
                  <span className="px-2 py-0.5 rounded-md bg-lime-500/10 text-lime-300 border border-lime-500/20 truncate max-w-[240px]">
                    {selectedModel.modelName} ({selectedModel.modelCode})
                  </span>
                </>
              )}
            </div>
          )}

          {/* Body Steps */}
          <div className="p-6">
            {/* STEP 1: CHOOSE CATEGORY */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">1. Choose a Category</h3>
                  <p className="text-xs text-slate-400">
                    Select the repair component type (icons only, no photo uploads)
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const isSelected = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between gap-3 group cursor-pointer ${
                          isSelected
                            ? "bg-slate-800 border-lime-400/80 shadow-md ring-1 ring-lime-400/40"
                            : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-lime-400 text-slate-950"
                              : "bg-slate-800 text-slate-300 group-hover:text-white"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-100 leading-tight">
                            {c.name}
                          </div>
                          <div className="text-[10.5px] text-slate-400 mt-0.5 truncate">
                            {c.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE COMPATIBILITY */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">2. Choose Device Compatibility</h3>
                  <p className="text-xs text-slate-400">
                    Specify the device type and compatible brand the replacement fits
                  </p>
                </div>

                {/* Device Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-300">Device Type</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {DEVICE_TYPES.map((t) => {
                      const isSel = deviceType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setDeviceType(t)}
                          className={`py-3 px-4 rounded-xl border text-center font-semibold text-xs transition-all cursor-pointer ${
                            isSel
                              ? "bg-slate-800 border-lime-400 text-lime-400 ring-1 ring-lime-400/40"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Compatible Brand */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-300">
                      Compatible Brand (Device Brand)
                    </Label>
                    {!isAddingBrand && (
                      <button
                        type="button"
                        onClick={() => setIsAddingBrand(true)}
                        className="text-[11px] font-medium text-lime-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add missing brand
                      </button>
                    )}
                  </div>

                  {isAddingBrand ? (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="e.g. Motorola or Nothing"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white text-xs h-9"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (customBrand.trim()) {
                            setBrand(customBrand.trim());
                            setIsAddingBrand(false);
                            setCustomBrand("");
                          }
                        }}
                        className="bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-bold"
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingBrand(false)}
                        className="text-slate-400 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {DEFAULT_BRANDS.map((b) => {
                        const isSel = brand.toLowerCase() === b.toLowerCase();
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBrand(b)}
                            className={`py-2 px-3 rounded-lg border text-center font-medium text-xs transition-all cursor-pointer ${
                              isSel
                                ? "bg-slate-800 border-lime-400 text-lime-400 ring-1 ring-lime-400/40"
                                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            {b}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: SEARCH AND SELECT THE MODEL */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">3. Search & Select Exact Model</h3>
                    <p className="text-xs text-slate-400">
                      Matches product name, release year, or exact UK/EU model code
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualModel(!isManualModel);
                      setSelectedModel(null);
                    }}
                    className="text-xs text-lime-400 hover:underline font-semibold cursor-pointer"
                  >
                    {isManualModel ? "Search Catalogue" : "Enter Manually"}
                  </button>
                </div>

                {!isManualModel ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <Input
                        placeholder={`Search ${brand} model by name, year or code (e.g. A2643, SM-S928B)...`}
                        value={modelSearch}
                        onChange={(e) => setModelSearch(e.target.value)}
                        className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 text-xs h-9 rounded-xl"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 border border-slate-800 rounded-xl p-2 bg-slate-950/70">
                      {catalogueList.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No matching {brand} models found. Try another search or{" "}
                          <button
                            type="button"
                            onClick={() => setIsManualModel(true)}
                            className="text-lime-400 underline font-semibold"
                          >
                            enter manually
                          </button>
                          .
                        </div>
                      ) : (
                        catalogueList.map((m) => {
                          const isSel =
                            selectedModel?.modelCode === m.modelCode &&
                            selectedModel?.modelName === m.modelName;
                          return (
                            <button
                              key={`${m.modelCode}-${m.modelName}`}
                              type="button"
                              onClick={() => setSelectedModel(m)}
                              className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                                isSel
                                  ? "bg-slate-800 border-lime-400 text-lime-300 ring-1 ring-lime-400/30"
                                  : "bg-slate-900 border-slate-800/80 text-slate-200 hover:border-slate-700 hover:bg-slate-850"
                              }`}
                            >
                              <div>
                                <span className="font-semibold text-xs">
                                  {m.brand} {m.modelName} ({m.releaseYear})
                                </span>
                                <span className="ml-2 font-mono text-[11px] text-slate-400">
                                  — {m.modelCode}
                                </span>
                              </div>
                              {isSel && <Check className="w-4 h-4 text-lime-400 shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-300">Model Name</Label>
                        <Input
                          placeholder="e.g. Galaxy S24 Ultra or iPhone 15 Pro"
                          value={manualModelName}
                          onChange={(e) => setManualModelName(e.target.value)}
                          className="bg-slate-900 border-slate-800 text-white text-xs h-9 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-300">Model Number / Code</Label>
                        <Input
                          placeholder="e.g. SM-S928B or A3106"
                          value={manualModelCode}
                          onChange={(e) => setManualModelCode(e.target.value)}
                          className="bg-slate-900 border-slate-800 text-white text-xs h-9 mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-300">Release Year (Optional)</Label>
                      <Input
                        placeholder="e.g. 2024"
                        value={manualYear}
                        onChange={(e) => setManualYear(e.target.value)}
                        className="bg-slate-900 border-slate-800 text-white text-xs h-9 mt-1 max-w-[140px]"
                      />
                    </div>
                  </div>
                )}

                {/* Flip / Fold Screen Placement Requirement */}
                {isFoldOrFlip && category === "Screen" && (
                  <div className="p-3.5 rounded-xl bg-lime-500/10 border border-lime-500/30 space-y-2">
                    <div className="text-xs font-semibold text-lime-300 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Foldable Screen Placement Required
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["Inner screen", "Cover screen"] as const).map((pl) => (
                        <button
                          key={pl}
                          type="button"
                          onClick={() => setScreenPlacement(pl)}
                          className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                            screenPlacement === pl
                              ? "bg-lime-400 text-slate-950 border-lime-400"
                              : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          {pl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: QUALITY CARDS & QUICK ADJUSTMENTS */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">
                    4. Choose Quality & Adjust Existing Stock
                  </h3>
                  <p className="text-xs text-slate-400">
                    View on-hand counts for {activeShop?.shopName || "current store"} and stage corrections
                  </p>
                </div>

                {/* Quality Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {availableQualities.map((q) => {
                    const counts = getQualityCounts(q);
                    const isSelected = selectedQuality === q;
                    const staged = stagedAdjustments[q];
                    const displayCount = staged !== undefined ? staged : counts.onHand;
                    const isStaged = staged !== undefined && staged !== counts.onHand;

                    return (
                      <div
                        key={q}
                        onClick={() => setSelectedQuality(q)}
                        className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isSelected
                            ? "bg-slate-850 border-lime-400 ring-1 ring-lime-400/40"
                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{q}</span>
                          {isSelected && (
                            <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-lime-400 text-slate-950 uppercase tracking-wider">
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <div className="text-[11px] text-slate-400 font-medium">On Hand</div>
                            <div className="text-2xl font-black text-white flex items-baseline gap-1.5">
                              {displayCount}
                              {isStaged && (
                                <span className="text-xs text-lime-400 font-bold">
                                  ({staged > counts.onHand ? `+${staged - counts.onHand}` : staged - counts.onHand})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {counts.reserved} reserved • {counts.available} available
                            </div>
                          </div>

                          {/* Quick adjustment stepper */}
                          <div
                            className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleStageAdjustment(q, -1)}
                              className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Decrease count"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStageAdjustment(q, 1)}
                              className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                              title="Increase count"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Staged Adjustments Commit Section */}
                {Object.keys(stagedAdjustments).length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-lime-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-lime-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-lime-400" />
                        Pending Stock Corrections (Must Commit Reason)
                      </span>
                      <button
                        type="button"
                        onClick={() => setStagedAdjustments({})}
                        className="text-[11px] text-slate-400 hover:text-white"
                      >
                        Reset changes
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300">
                      {Object.entries(stagedAdjustments).map(([q, val]) => {
                        const old = getQualityCounts(q as PartQuality).onHand;
                        const diff = val - old;
                        return (
                          <div key={q} className="flex justify-between font-mono">
                            <span>{q}:</span>
                            <span>
                              {old} units → <strong>{val} units</strong> ({diff >= 0 ? `+${diff}` : diff})
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        placeholder="Reason for adjustment (e.g. Audit correction, Damaged stock)..."
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white text-xs h-9 flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleSaveAdjustments}
                        disabled={isSavingAdjustment}
                        className="bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold text-xs h-9 cursor-pointer"
                      >
                        {isSavingAdjustment ? "Saving..." : "Save Adjustments"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: ADD STOCK DETAILS (DELIVERY) */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">5. Add Stock Delivery Details</h3>
                  <p className="text-xs text-slate-400">
                    Record new intake delivery units, cost, selling price and store allocation
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SKU */}
                  <div>
                    <Label className="text-xs text-slate-300 font-semibold">SKU Identifier</Label>
                    <Input
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-9 font-mono mt-1"
                    />
                  </div>

                  {/* Quantity to add */}
                  <div>
                    <Label className="text-xs text-slate-300 font-semibold">
                      New Delivery Quantity (Adds new units)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={deliveryQty}
                      onChange={(e) => setDeliveryQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1 font-bold"
                    />
                  </div>

                  {/* Cost Price */}
                  <div>
                    <Label className="text-xs text-slate-300 font-semibold">
                      Cost Price per Unit (£ GBP)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1"
                    />
                  </div>

                  {/* Selling Price */}
                  <div>
                    <Label className="text-xs text-slate-300 font-semibold">
                      Selling Price per Unit (£ GBP)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1"
                    />
                  </div>

                  {/* Supplier Name */}
                  <div>
                    <Label className="text-xs text-slate-300 font-semibold">Supplier Name</Label>
                    <Input
                      placeholder="e.g. ReplaceBase, Mengtor, MobileSentrix"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1"
                    />
                  </div>

                  {/* Supplier Stamp / Reference */}
                  <div>
                    <Label className="text-xs text-slate-300 font-semibold">
                      Supplier Stamp / Invoice Reference (Text ID)
                    </Label>
                    <Input
                      placeholder="e.g. RB-INV-99214"
                      value={supplierStamp}
                      onChange={(e) => setSupplierStamp(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1"
                    />
                  </div>

                  {/* Min Stock Alert */}
                  <div>
                    <Label className="text-xs text-slate-300 font-semibold">
                      Minimum Stock Reminder Level
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={minStockReminder}
                      onChange={(e) => setMinStockReminder(parseInt(e.target.value) || 0)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1"
                    />
                  </div>

                  {/* Category Specific extra field */}
                  {["Screen", "Back cover", "Housing", "Touch / Digitiser"].includes(category) && (
                    <div>
                      <Label className="text-xs text-slate-300 font-semibold">Colour</Label>
                      <Input
                        placeholder="e.g. Black, Silver, Titanium Natural"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1"
                      />
                    </div>
                  )}

                  {["Camera", "Speaker"].includes(category) && (
                    <div>
                      <Label className="text-xs text-slate-300 font-semibold">Position</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {(category === "Camera" ? ["Front", "Rear"] : ["Top", "Bottom"]).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setPosition(pos as any)}
                            className={`py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                              position === pos
                                ? "bg-lime-400 text-slate-950 border-lime-400"
                                : "bg-slate-950 text-slate-300 border-slate-800"
                            }`}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {category === "Buttons" && (
                    <div>
                      <Label className="text-xs text-slate-300 font-semibold">Button Type</Label>
                      <select
                        value={buttonType}
                        onChange={(e) => setButtonType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg text-white text-xs h-9 px-2 mt-1"
                      >
                        <option value="Volume up">Volume up</option>
                        <option value="Volume down">Volume down</option>
                        <option value="Power">Power</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}

                  {category === "Flex cable" && (
                    <div>
                      <Label className="text-xs text-slate-300 font-semibold">Flex Subtype</Label>
                      <Input
                        placeholder="e.g. Power flex, Volume flex, Sensor flex"
                        value={flexSubtype}
                        onChange={(e) => setFlexSubtype(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1"
                      />
                    </div>
                  )}

                  {category === "Charging port" && (
                    <div>
                      <Label className="text-xs text-slate-300 font-semibold">Port Connector Type</Label>
                      <Input
                        placeholder="e.g. USB-C, Lightning, Micro-USB"
                        value={chargingPortType}
                        onChange={(e) => setChargingPortType(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1"
                      />
                    </div>
                  )}

                  {category === "Other parts" && (
                    <div>
                      <Label className="text-xs text-slate-300 font-semibold">Part Description Name</Label>
                      <Input
                        placeholder="e.g. SIM Tray, NFC Antenna Coil, Ear Mesh"
                        value={partName}
                        onChange={(e) => setPartName(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white text-xs h-9 mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* Multi-store allocation if user has multiple stores */}
                {shops && shops.length > 1 && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-lime-400" /> Multi-Store Allocation
                      </Label>
                      <span className="text-[11px] text-slate-400">
                        Allocated:{" "}
                        {allocations.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0)} /{" "}
                        {deliveryQty}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {shops.map((shop: any) => {
                        const existingAlloc = allocations.find((a) => a.shopId === shop._id);
                        const qty = existingAlloc ? existingAlloc.quantity : 0;
                        return (
                          <div
                            key={shop._id}
                            className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-900 rounded-lg border border-slate-800"
                          >
                            <span className="font-semibold text-slate-200">
                              {shop.shopName} ({shop.storeCode || "Store"})
                            </span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={qty}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setAllocations((prev) => {
                                    const filtered = prev.filter((a) => a.shopId !== shop._id);
                                    if (val > 0) {
                                      return [...filtered, { shopId: shop._id, quantity: val }];
                                    }
                                    return filtered;
                                  });
                                }}
                                className="w-20 bg-slate-950 border-slate-700 text-white text-xs h-8 text-right font-mono"
                              />
                              <span className="text-slate-400">units</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-t border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </Button>
            )}

            {step < 5 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (step === 3 && !selectedModel && !isManualModel) {
                    toast.error("Please search and select a device model to continue");
                    return;
                  }
                  if (step === 3 && isManualModel && (!manualModelName.trim() || !manualModelCode.trim())) {
                    toast.error("Please provide both model name and model code");
                    return;
                  }
                  setStep((s) => (s + 1) as any);
                }}
                className="bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold px-5 cursor-pointer"
              >
                Continue <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setShowReviewDialog(true)}
                disabled={addDeliveryMutation.isPending}
                className="bg-lime-400 hover:bg-lime-500 text-slate-950 font-black px-6 shadow-lg shadow-lime-400/20 cursor-pointer"
              >
                Review & Add Stock
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-lime-400" /> Confirm Stock Delivery Intake
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5 my-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Component:</span>
              <span className="font-semibold text-white">
                {category} ({selectedQuality})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Compatible Model:</span>
              <span className="font-semibold text-white truncate max-w-[220px]">
                {activeModelTitle}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">SKU:</span>
              <span className="font-mono text-lime-300 font-semibold">{sku}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">New Units Added:</span>
              <span className="font-black text-white text-sm">+{deliveryQty} units</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Cost per unit:</span>
              <span className="font-semibold text-white">£{parseFloat(costPrice || "0").toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Total Purchase Value:</span>
              <span className="font-bold text-lime-400">
                £{(deliveryQty * (parseFloat(costPrice) || 0)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Part Selling Price:</span>
              <span className="font-semibold text-white">
                £{parseFloat(sellingPrice || "0").toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Receiving Store:</span>
              <span className="font-semibold text-white">
                {activeShop?.shopName || "Active Store"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
              className="flex-1 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Back to Edit
            </Button>
            <Button
              type="button"
              onClick={handleConfirmAddStock}
              disabled={addDeliveryMutation.isPending}
              className="flex-1 bg-lime-400 hover:bg-lime-500 text-slate-950 font-black cursor-pointer"
            >
              {addDeliveryMutation.isPending ? "Adding..." : "Confirm & Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
