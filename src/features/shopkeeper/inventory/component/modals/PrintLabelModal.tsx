import React, { useRef, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useReactToPrint } from "react-to-print";
import type { InventoryItem } from "../../types";
import { useCurrency } from "@/hooks/useCurrency";
import { Printer, Loader2, Code2, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  BarcodeFormat,
  CommonLabelData,
  LabelFields,
  LabelTemplate,
  PrinterBrand,
  PRINTER_BRANDS,
  LABEL_TEMPLATES,
  getTemplatesForBrand,
  getDefaultTemplateForBrand,
  getPrinterAdapter,
  LabelPreview,
} from "../../labelPrinting";

interface PrintLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export function PrintLabelModal({
  isOpen,
  onClose,
  item,
}: PrintLabelModalProps) {
  const { currencySymbol } = useCurrency();

  // 1. Printer selection
  const [selectedBrand, setSelectedBrand] = useState<PrinterBrand>("DYMO");

  // 2. Label template selection (defaults to DYMO 1933085)
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>("dymo-1933085");

  // Custom dimensions (if custom size is selected)
  const [customWidth, setCustomWidth] = useState<number>(2.5);
  const [customHeight, setCustomHeight] = useState<number>(1.5);
  const [customUnit, setCustomUnit] = useState<"inch" | "mm">("inch");

  // 3. Location selection (preserving existing feature)
  const [location, setLocation] = useState("Mobile Kit Distribution");

  // 4. Barcode format selection
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>("CODE128");

  // 5. Label details checkboxes
  const [details, setDetails] = useState<LabelFields>({
    sku: true,
    gtin: false,
    variationName: true,
    price: true,
    itemName: true,
    unitAbbreviation: false,
  });

  // State for raw command inspection & printing loader
  const [showRawCommands, setShowRawCommands] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Available templates for selected brand
  const availableTemplates = useMemo(() => {
    return getTemplatesForBrand(selectedBrand);
  }, [selectedBrand]);

  // When brand changes, switch to its default template
  const handleBrandChange = (brand: PrinterBrand) => {
    setSelectedBrand(brand);
    const defaultTemplate = getDefaultTemplateForBrand(brand);
    setSelectedTemplateId(defaultTemplate.id);
  };

  // Active template object
  const activeTemplate: LabelTemplate = useMemo(() => {
    const found = LABEL_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (found) {
      if (found.isCustom) {
        return {
          ...found,
          width: customWidth > 0 ? customWidth : 2.5,
          height: customHeight > 0 ? customHeight : 1.5,
          unit: customUnit,
        };
      }
      return found;
    }
    return availableTemplates[0] || LABEL_TEMPLATES[0];
  }, [
    selectedTemplateId,
    availableTemplates,
    customWidth,
    customHeight,
    customUnit,
  ]);

  // Supported barcode formats for active template
  const availableBarcodeFormats = useMemo(() => {
    return (
      activeTemplate.barcode_format || [
        "CODE128",
        "EAN-13",
        "EAN-8",
        "UPC-A",
        "QR Code",
      ]
    );
  }, [activeTemplate]);

  // Derive valid barcode format without setState in effect
  const effectiveBarcodeFormat = useMemo(() => {
    return availableBarcodeFormats.includes(barcodeFormat)
      ? barcodeFormat
      : availableBarcodeFormats[0] || "CODE128";
  }, [availableBarcodeFormats, barcodeFormat]);

  // Active printer adapter
  const adapter = useMemo(() => {
    return getPrinterAdapter(selectedBrand);
  }, [selectedBrand]);

  // Physical page dimensions for CSS print styling
  const pageSize = useMemo(() => {
    const widthStr =
      activeTemplate.unit === "inch"
        ? `${activeTemplate.width}in`
        : `${activeTemplate.width}mm`;
    const heightStr =
      activeTemplate.unit === "inch"
        ? `${activeTemplate.height}in`
        : `${activeTemplate.height}mm`;
    return { width: widthStr, height: heightStr };
  }, [activeTemplate]);

  // Configure browser print engine
  const handleReactToPrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: `
      @page {
        size: ${pageSize.width} ${pageSize.height};
        margin: 0;
      }
      @media print {
        html, body {
          width: ${pageSize.width};
          height: ${pageSize.height};
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden;
        }
      }
    `,
  });

  if (!item) return null;

  const displayPrice = item.expectedPrice ?? item.salePrice ?? 0;
  const barcodeValue = item.imeiNumber || item.sku || item._id || "000000";
  const variationString = [item.storage, item.color, item.size]
    .filter(Boolean)
    .join(" ");

  const rawItem = item as InventoryItem & { gtin?: string; unit?: string };

  // Formulate common label data payload
  const commonLabelData: CommonLabelData = {
    itemName: item.itemName,
    sku: item.sku || item.imeiNumber || item._id || "",
    gtin: rawItem.gtin || item.modelNumber || undefined,
    variationName: variationString || undefined,
    price: displayPrice,
    unitAbbreviation: rawItem.unit || "pcs",
    barcode: barcodeValue,
    barcodeFormat: effectiveBarcodeFormat,
    labelWidth: activeTemplate.width,
    labelHeight: activeTemplate.height,
    unit: activeTemplate.unit,
    location,
    currencySymbol: currencySymbol || "£",
    fields: details,
    template: activeTemplate,
  };

  // Generate raw commands (ZPL / ePOS / ESC-POS / XML)
  const rawCommands = adapter.generateRawCommands(commonLabelData);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const result = await adapter.print(commonLabelData, {
        contentRef: printRef,
        triggerBrowserPrint: () => handleReactToPrint(),
      });

      if (result.success) {
        toast.success(result.message || "Print job sent to printer");
      } else {
        toast.error(result.message || "Failed to print label");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred while printing";
      toast.error(errorMessage);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCopyRaw = () => {
    if (rawCommands) {
      navigator.clipboard.writeText(rawCommands);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
      toast.success("Copied printer commands to clipboard");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card text-foreground rounded-xl p-0 shadow-lg font-poppins max-h-[92vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="p-6 border-b border-border flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Print labels
            </DialogTitle>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#84CC16]/10 text-[#65a30d] border border-[#84CC16]/20">
              {selectedBrand}
            </span>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure and print item label
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-5">
            {/* 1. PRINTER SELECTION */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center justify-between">
                <span>Printer</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Select your label printer hardware
                </span>
              </label>
              <Select
                value={selectedBrand}
                onValueChange={(val) => handleBrandChange(val as PrinterBrand)}
              >
                <SelectTrigger className="w-full h-12 rounded-xl border border-input bg-background font-medium">
                  <SelectValue placeholder="Select printer" />
                </SelectTrigger>
                <SelectContent>
                  {PRINTER_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      <span className="font-semibold">{brand}</span>
                      {brand === "DYMO" && " (LabelWriter 450/550/4XL)"}
                      {brand === "Zebra" && " (ZPL Thermal Series)"}
                      {brand === "Brother" && " (QL Series DK Labels)"}
                      {brand === "Rollo" && " (Thermal Label Printers)"}
                      {brand === "Epson" && " (TM Series ePOS & ColorWorks)"}
                      {brand === "Generic" &&
                        " (Standard OS / Desktop Printer)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. LABEL TYPE SELECTION */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center justify-between">
                <span>Label type</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {activeTemplate.width} x {activeTemplate.height}{" "}
                  {activeTemplate.unit}
                </span>
              </label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger className="w-full h-12 rounded-xl border border-input bg-background font-medium">
                  <SelectValue placeholder="Select label type" />
                </SelectTrigger>
                <SelectContent>
                  {availableTemplates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      <div className="flex flex-col text-left">
                        <span className="font-medium">{tpl.label_name}</span>
                        {tpl.description && (
                          <span className="text-[10px] text-muted-foreground">
                            {tpl.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Dimensions Form (if custom size selected) */}
            {activeTemplate.isCustom && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                <p className="text-xs font-bold text-foreground">
                  Custom Label Dimensions
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Width
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={customWidth}
                      onChange={(e) =>
                        setCustomWidth(parseFloat(e.target.value) || 2.5)
                      }
                      className="h-10 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Height
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={customHeight}
                      onChange={(e) =>
                        setCustomHeight(parseFloat(e.target.value) || 1.5)
                      }
                      className="h-10 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Unit
                    </label>
                    <Select
                      value={customUnit}
                      onValueChange={(u) => setCustomUnit(u as "inch" | "mm")}
                    >
                      <SelectTrigger className="h-10 rounded-lg text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inch">Inches (in)</SelectItem>
                        <SelectItem value="mm">Millimeters (mm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. LOCATION */}
            <div className="space-y-2">
              <label className="text-sm font-semibold">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full h-12 rounded-xl border border-input bg-background font-medium">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile Kit Distribution">
                    Mobile Kit Distribution
                  </SelectItem>
                  <SelectItem value="Main Store">Main Store</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 4. BARCODE FORMAT */}
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center justify-between">
                <span>Barcode format</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Symbology
                </span>
              </label>
              <Select
                value={barcodeFormat}
                onValueChange={(val) => setBarcodeFormat(val as BarcodeFormat)}
              >
                <SelectTrigger className="w-full h-12 rounded-xl border border-input bg-background font-medium">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {availableBarcodeFormats.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>
                      {fmt}
                      {fmt === "CODE128" && " (Alphanumeric - Most Versatile)"}
                      {fmt === "EAN-13" && " (13-Digit International)"}
                      {fmt === "EAN-8" && " (8-Digit Compact)"}
                      {fmt === "UPC-A" && " (12-Digit Retail)"}
                      {fmt === "QR Code" && " (2D Matrix Code)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 5. LABEL DETAILS */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Label details</label>
                <span className="text-[11px] text-muted-foreground">
                  Select fields to print
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <Checkbox
                    id="sku"
                    checked={details.sku}
                    onCheckedChange={(c) =>
                      setDetails((prev) => ({ ...prev, sku: c as boolean }))
                    }
                    className="h-5 w-5 rounded-md"
                  />
                  <label
                    htmlFor="sku"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    SKU
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <Checkbox
                    id="gtin"
                    checked={details.gtin}
                    onCheckedChange={(c) =>
                      setDetails((prev) => ({ ...prev, gtin: c as boolean }))
                    }
                    className="h-5 w-5 rounded-md"
                  />
                  <label
                    htmlFor="gtin"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    GTIN
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <Checkbox
                    id="variation"
                    checked={details.variationName}
                    onCheckedChange={(c) =>
                      setDetails((prev) => ({
                        ...prev,
                        variationName: c as boolean,
                      }))
                    }
                    className="h-5 w-5 rounded-md"
                  />
                  <label
                    htmlFor="variation"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Variation name
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <Checkbox
                    id="price"
                    checked={details.price}
                    onCheckedChange={(c) =>
                      setDetails((prev) => ({ ...prev, price: c as boolean }))
                    }
                    className="h-5 w-5 rounded-md"
                  />
                  <label
                    htmlFor="price"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Price
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <Checkbox
                    id="itemname"
                    checked={details.itemName}
                    onCheckedChange={(c) =>
                      setDetails((prev) => ({
                        ...prev,
                        itemName: c as boolean,
                      }))
                    }
                    className="h-5 w-5 rounded-md"
                  />
                  <label
                    htmlFor="itemname"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Item name
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <Checkbox
                    id="unit"
                    checked={details.unitAbbreviation}
                    onCheckedChange={(c) =>
                      setDetails((prev) => ({
                        ...prev,
                        unitAbbreviation: c as boolean,
                      }))
                    }
                    className="h-5 w-5 rounded-md"
                  />
                  <label
                    htmlFor="unit"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Unit abbreviation
                  </label>
                </div>
              </div>
            </div>

            {/* 6. LIVE VISUAL LABEL PREVIEW */}
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Live Label Preview
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  Target: {activeTemplate.width} {activeTemplate.unit} ×{" "}
                  {activeTemplate.height} {activeTemplate.unit}
                </span>
              </div>

              <div className="flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-dashed border-border overflow-x-auto min-h-[120px]">
                <div className="shadow-lg border border-slate-300 rounded overflow-hidden">
                  <LabelPreview data={commonLabelData} />
                </div>
              </div>
            </div>

            {/* OPTIONAL RAW COMMAND INSPECTION (ZPL / ePOS / ESC-POS / XML) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowRawCommands((prev) => !prev)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <Code2 size={14} />
                <span>
                  {showRawCommands ? "Hide" : "View"} Printer Commands (
                  {activeTemplate.printing_protocol.toUpperCase()})
                </span>
              </button>

              {showRawCommands && (
                <div className="relative rounded-xl bg-slate-950 p-4 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-48 custom-scrollbar border border-slate-800">
                  <button
                    type="button"
                    onClick={handleCopyRaw}
                    className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-[10px] font-bold transition-colors"
                  >
                    {copiedRaw ? (
                      <>
                        <Check size={12} className="text-green-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre-wrap">{rawCommands}</pre>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPrinting}
              className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-muted transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#84CC16] text-white font-bold rounded-xl hover:bg-[#76b813] transition shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isPrinting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Printing...</span>
                </>
              ) : (
                <>
                  <Printer size={18} strokeWidth={2.5} />
                  <span>Print Label</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>

      {/* Hidden Print Target used by react-to-print */}
      <div className="hidden">
        <div ref={printRef}>
          <LabelPreview data={commonLabelData} />
        </div>
      </div>
    </Dialog>
  );
}
