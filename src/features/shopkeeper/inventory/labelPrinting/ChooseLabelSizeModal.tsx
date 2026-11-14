import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarcodeFormat,
  CommonLabelData,
  LabelFields,
  LabelOrientation,
  LabelTemplate,
  PrinterBrand,
} from "./types";
import {
  getTemplatesForBrand,
  getPrintLayoutDimensions,
  searchTemplates,
} from "./templates";
import { LabelShapeThumbnail } from "./LabelShapeThumbnail";
import { DimensionGuidePreview } from "./DimensionGuidePreview";
import {
  Search,
  Check,
  Smartphone,
  Monitor,
  ChevronDown,
  Settings2,
  Info,
} from "lucide-react";

interface ChooseLabelSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: PrinterBrand;
  activeTemplate: LabelTemplate;
  orientation: LabelOrientation;
  fields: LabelFields;
  barcodeFormat: BarcodeFormat;
  sampleItem: {
    itemName: string;
    price: number;
    barcode: string;
    sku?: string;
    gtin?: string;
    variationName?: string;
    unitAbbreviation?: string;
    location?: string;
    currencySymbol?: string;
  };
  onSave: (selected: {
    template: LabelTemplate;
    orientation: LabelOrientation;
    fields: LabelFields;
    barcodeFormat: BarcodeFormat;
  }) => void;
}

export const ChooseLabelSizeModal: React.FC<ChooseLabelSizeModalProps> = ({
  isOpen,
  onClose,
  brand,
  activeTemplate,
  orientation: initialOrientation,
  fields: initialFields,
  barcodeFormat: initialBarcodeFormat,
  sampleItem,
  onSave,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    activeTemplate.id,
  );
  const [orientation, setOrientation] =
    useState<LabelOrientation>(initialOrientation);
  const [fields, setFields] = useState<LabelFields>(initialFields);
  const [barcodeFormat, setBarcodeFormat] =
    useState<BarcodeFormat>(initialBarcodeFormat);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter templates for current printer hardware
  const brandTemplates = useMemo(() => {
    return getTemplatesForBrand(brand);
  }, [brand]);

  // Search filtered results
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return brandTemplates;
    return searchTemplates(searchQuery, brand);
  }, [searchQuery, brandTemplates, brand]);

  // Selected template object
  const selectedTemplate = useMemo(() => {
    return (
      brandTemplates.find((t) => t.id === selectedTemplateId) ||
      brandTemplates[0] ||
      activeTemplate
    );
  }, [selectedTemplateId, brandTemplates, activeTemplate]);

  // Compute stock vs layout dimensions
  const stockWidth =
    selectedTemplate.stock_width_mm ||
    (selectedTemplate.unit === "inch"
      ? Math.round(selectedTemplate.width * 25.4)
      : selectedTemplate.width);
  const stockHeight =
    selectedTemplate.stock_height_mm ||
    (selectedTemplate.unit === "inch"
      ? Math.round(selectedTemplate.height * 25.4)
      : selectedTemplate.height);

  const layoutDims = useMemo(() => {
    return getPrintLayoutDimensions(selectedTemplate, orientation);
  }, [selectedTemplate, orientation]);

  // Construct label data for live dimension preview
  const previewLabelData: CommonLabelData = useMemo(() => {
    return {
      itemName: sampleItem.itemName,
      sku: sampleItem.sku || sampleItem.barcode,
      gtin: sampleItem.gtin,
      variationName: sampleItem.variationName,
      price: sampleItem.price,
      unitAbbreviation: sampleItem.unitAbbreviation,
      barcode: sampleItem.barcode,
      barcodeFormat,
      labelWidth: layoutDims.width,
      labelHeight: layoutDims.height,
      unit: layoutDims.unit,
      orientation,
      location: sampleItem.location,
      currencySymbol: sampleItem.currencySymbol || "£",
      fields,
      template: selectedTemplate,
    };
  }, [
    sampleItem,
    barcodeFormat,
    layoutDims,
    orientation,
    fields,
    selectedTemplate,
  ]);

  const handleSave = () => {
    onSave({
      template: selectedTemplate,
      orientation,
      fields,
      barcodeFormat,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-4xl bg-card text-foreground rounded-2xl p-0 shadow-2xl font-poppins max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border flex flex-row items-center justify-between shrink-0">
          <div className="min-w-0 flex-1 pr-3">
            <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight truncate">
              Choose label sizes easily
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              Select supported label roll stock, configure orientation, and
              preview print layout
            </DialogDescription>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#84CC16]/10 text-[#65a30d] border border-[#84CC16]/20 shrink-0">
            {brand} Hardware
          </span>
        </DialogHeader>

        {/* Modal Body - 2 Columns (Image 2) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full min-w-0">
            {/* LEFT COLUMN: Label size (Image 2 - Left) */}
            <div className="lg:col-span-6 flex flex-col space-y-4 min-w-0 w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Label size
                </h3>
                <span className="text-xs text-muted-foreground">
                  {filteredTemplates.length} sizes available
                </span>
              </div>

              {/* 1. Search Bar */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="text"
                  placeholder="Search name, product code or size"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-xl bg-background border-border text-xs font-medium focus-visible:ring-1 focus-visible:ring-[#84CC16]"
                />
              </div>

              {/* 2. Label sizes list */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
                {filteredTemplates.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-muted/30 border border-dashed border-border text-muted-foreground text-xs">
                    No label sizes found matching &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  filteredTemplates.map((tpl) => {
                    const isSelected = tpl.id === selectedTemplateId;
                    const mmW =
                      tpl.stock_width_mm ||
                      (tpl.unit === "inch"
                        ? Math.round(tpl.width * 25.4)
                        : tpl.width);
                    const mmH =
                      tpl.stock_height_mm ||
                      (tpl.unit === "inch"
                        ? Math.round(tpl.height * 25.4)
                        : tpl.height);

                    return (
                      <div
                        key={tpl.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedTemplateId(tpl.id);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                          isSelected
                            ? "bg-[#ecfccb] border-[#84CC16] text-black shadow-sm ring-1 ring-[#84CC16]"
                            : "bg-card border-border hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Shape Thumbnail */}
                          <div className="shrink-0 p-1 rounded-lg bg-background/80 border border-border/60">
                            <LabelShapeThumbnail
                              shape={tpl.shape}
                              widthMm={mmW}
                              heightMm={mmH}
                              className="w-9 h-6 text-foreground"
                            />
                          </div>
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="font-bold text-xs leading-snug truncate">
                              {tpl.label_name}
                            </div>
                            <div
                              className={`text-[11px] font-medium mt-0.5 truncate ${
                                isSelected
                                  ? "text-slate-800"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {tpl.product_code || tpl.id} | {mmW} × {mmH} mm
                            </div>
                          </div>
                        </div>

                        {/* Selected Indicator Badge */}
                        {isSelected && (
                          <div className="flex items-center gap-1.5 shrink-0 pl-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#84CC16] text-white whitespace-nowrap">
                              Saved
                            </span>
                            <Check
                              size={15}
                              className="text-[#65a30d]"
                              strokeWidth={3}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Save label size CTA button (Desktop / Left column placement) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full py-3 px-5 bg-[#84CC16] hover:bg-[#76b813] text-white font-bold text-sm rounded-xl transition shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check size={17} strokeWidth={2.5} />
                  <span>Save label size</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Selected label (Image 2 - Right) */}
            <div className="lg:col-span-6 flex flex-col space-y-4 min-w-0 w-full">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Selected label
              </h3>

              {/* Selected Label Header Summary Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-border flex items-center gap-3.5 shadow-sm min-w-0 w-full overflow-hidden">
                <div className="p-2 rounded-xl bg-muted border border-border shrink-0">
                  <LabelShapeThumbnail
                    shape={selectedTemplate.shape}
                    widthMm={stockWidth}
                    heightMm={stockHeight}
                    className="w-11 h-7 text-foreground"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">
                    {selectedTemplate.label_name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-semibold">
                      {selectedTemplate.product_code || selectedTemplate.id}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-foreground whitespace-nowrap">
                      Stock size: {stockWidth} × {stockHeight} mm
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Orientation Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Orientation
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setOrientation("portrait")}
                    className={`flex items-center justify-center gap-2.5 py-2.5 px-3 sm:px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      orientation === "portrait"
                        ? "bg-[#ecfccb] border-[#84CC16] text-black shadow-sm ring-1 ring-[#84CC16]"
                        : "bg-card border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Smartphone size={16} />
                    <span>Portrait</span>
                    {orientation === "portrait" && (
                      <Check size={14} className="text-[#65a30d]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrientation("landscape")}
                    className={`flex items-center justify-center gap-2.5 py-2.5 px-3 sm:px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      orientation === "landscape"
                        ? "bg-[#ecfccb] border-[#84CC16] text-black shadow-sm ring-1 ring-[#84CC16]"
                        : "bg-card border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Monitor size={16} />
                    <span>Landscape</span>
                    {orientation === "landscape" && (
                      <Check size={14} className="text-[#65a30d]" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium pt-0.5">
                  Print layout:{" "}
                  <strong className="text-foreground font-semibold">
                    {layoutDims.width} mm wide × {layoutDims.height} mm high
                  </strong>
                </p>
              </div>

              {/* Live Dimensioned Preview Card with Arrows */}
              <div className="space-y-1 w-full min-w-0 overflow-hidden">
                <DimensionGuidePreview
                  data={previewLabelData}
                  layoutWidthMm={layoutDims.width}
                  layoutHeightMm={layoutDims.height}
                />
              </div>

              {/* Advanced Settings: Field toggles and barcode format */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full p-2.5 rounded-xl bg-muted/40 hover:bg-muted border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Settings2 size={14} />
                    <span>Advanced: Barcode & Fields</span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                  />
                </button>

                {showAdvanced && (
                  <div className="p-4 mt-2 rounded-xl bg-muted/20 border border-border space-y-4">
                    {/* Barcode format */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Barcode Symbology
                      </label>
                      <Select
                        value={barcodeFormat}
                        onValueChange={(v) =>
                          setBarcodeFormat(v as BarcodeFormat)
                        }
                      >
                        <SelectTrigger className="h-9 rounded-lg text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CODE128">
                            CODE128 (Standard)
                          </SelectItem>
                          <SelectItem value="EAN-13">
                            EAN-13 (13 Digits)
                          </SelectItem>
                          <SelectItem value="EAN-8">
                            EAN-8 (8 Digits)
                          </SelectItem>
                          <SelectItem value="UPC-A">UPC-A (Retail)</SelectItem>
                          <SelectItem value="QR Code">QR Code (2D)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fields Checklist */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Printable Fields
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs min-w-0">
                        {[
                          { key: "itemName", label: "Item name" },
                          { key: "price", label: "Price" },
                          { key: "sku", label: "SKU" },
                          { key: "variationName", label: "Variation" },
                          { key: "gtin", label: "GTIN" },
                          { key: "unitAbbreviation", label: "Unit abbr." },
                        ].map(({ key, label }) => (
                          <div
                            key={key}
                            className="flex items-center space-x-2 min-w-0"
                          >
                            <Checkbox
                              id={`choose-${key}`}
                              checked={fields[key as keyof LabelFields]}
                              onCheckedChange={(c) =>
                                setFields((prev) => ({
                                  ...prev,
                                  [key]: c as boolean,
                                }))
                              }
                              className="h-4 w-4 rounded"
                            />
                            <label
                              htmlFor={`choose-${key}`}
                              className="text-xs font-medium cursor-pointer truncate"
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notice matching Image 2 */}
        <div className="p-3.5 sm:p-4 border-t border-border bg-muted/20 flex items-center gap-2 text-xs text-muted-foreground shrink-0 overflow-hidden">
          <Info size={14} className="text-[#65a30d] shrink-0" />
          <span className="truncate sm:whitespace-normal">
            Show only sizes supported by the selected printer. Verify stock
            compatibility before release.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
