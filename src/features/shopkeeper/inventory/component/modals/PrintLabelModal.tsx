import React, { useRef, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReactToPrint } from "react-to-print";
import type { InventoryItem } from "../../types";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Printer,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Settings,
  Search,
  Plus,
  Minus,
  Download,
  MonitorCheck,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarcodeFormat,
  CommonLabelData,
  LabelFields,
  LabelOrientation,
  LabelTemplate,
  PrinterBrand,
  LABEL_TEMPLATES,
  INSTALLED_PRINTER_DEVICES,
  getDefaultTemplateForBrand,
  getPrinterAdapter,
  getPrintLayoutDimensions,
  LabelPreview,
  LabelShapeThumbnail,
  ChooseLabelSizeModal,
  PrinterSetupModal,
  usePrinterConnection,
} from "../../labelPrinting";

const STORAGE_KEY_PREFS = "imoscan_label_printer_pref";

function getInitialPreferences() {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFS);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

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

  // Saved preferences in localStorage
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(
    () => getInitialPreferences()?.printerId || INSTALLED_PRINTER_DEVICES[0].id,
  );
  const [selectedBrand, setSelectedBrand] = useState<PrinterBrand>(
    () => getInitialPreferences()?.brand || "DYMO",
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    () => getInitialPreferences()?.templateId || "dymo-s0722540",
  );
  const [orientation, setOrientation] = useState<LabelOrientation>(
    () => getInitialPreferences()?.orientation || "landscape",
  );
  const [quantity, setQuantity] = useState<number>(
    () => getInitialPreferences()?.quantity || 1,
  );
  const [location, setLocation] = useState<string>(
    () => getInitialPreferences()?.location || "Main Store",
  );

  // Barcode format & details fields
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>(
    () => getInitialPreferences()?.barcodeFormat || "CODE128",
  );
  const [details, setDetails] = useState<LabelFields>(
    () =>
      getInitialPreferences()?.details || {
        sku: true,
        gtin: false,
        variationName: true,
        price: true,
        itemName: true,
        unitAbbreviation: false,
      },
  );

  // Dialog sub-states
  const [isChooseSizeOpen, setIsChooseSizeOpen] = useState(false);
  const [isSetupGuideOpen, setIsSetupGuideOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Save preferences whenever they change
  const savePreferences = (
    updated: Partial<{
      printerId: string;
      brand: PrinterBrand;
      templateId: string;
      orientation: LabelOrientation;
      location: string;
      quantity: number;
      details: LabelFields;
      barcodeFormat: BarcodeFormat;
    }>,
  ) => {
    try {
      const current = {
        printerId: updated.printerId ?? selectedPrinterId,
        brand: updated.brand ?? selectedBrand,
        templateId: updated.templateId ?? selectedTemplateId,
        orientation: updated.orientation ?? orientation,
        location: updated.location ?? location,
        quantity: updated.quantity ?? quantity,
        details: updated.details ?? details,
        barcodeFormat: updated.barcodeFormat ?? barcodeFormat,
      };
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(current));
    } catch {
      // Ignore local storage error
    }
  };

  // Real-time printer connection probe (Developer Note 4)
  const {
    status: connectionStatus,
    isRechecking,
    recheck: recheckConnection,
  } = usePrinterConnection(selectedBrand, isOpen);

  // Active template object
  const activeTemplate: LabelTemplate = useMemo(() => {
    const found = LABEL_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (found) return found;
    return getDefaultTemplateForBrand(selectedBrand);
  }, [selectedTemplateId, selectedBrand]);

  // Dimensions keeping stock size separate from rotation (Developer Note 3)
  const stockWidth =
    activeTemplate.stock_width_mm ||
    (activeTemplate.unit === "inch"
      ? Math.round(activeTemplate.width * 25.4)
      : activeTemplate.width);
  const stockHeight =
    activeTemplate.stock_height_mm ||
    (activeTemplate.unit === "inch"
      ? Math.round(activeTemplate.height * 25.4)
      : activeTemplate.height);

  const layoutDims = useMemo(() => {
    return getPrintLayoutDimensions(activeTemplate, orientation);
  }, [activeTemplate, orientation]);

  // Physical page dimensions for CSS print styling
  const pageSize = useMemo(() => {
    const widthStr =
      layoutDims.unit === "inch"
        ? `${layoutDims.width}in`
        : `${layoutDims.width}mm`;
    const heightStr =
      layoutDims.unit === "inch"
        ? `${layoutDims.height}in`
        : `${layoutDims.height}mm`;
    return { width: widthStr, height: heightStr };
  }, [layoutDims]);

  // Active printer adapter
  const adapter = useMemo(() => {
    return getPrinterAdapter(selectedBrand);
  }, [selectedBrand]);

  // Switch installed printer device
  const handleDeviceChange = (deviceId: string) => {
    setSelectedPrinterId(deviceId);
    const dev = INSTALLED_PRINTER_DEVICES.find((d) => d.id === deviceId);
    if (dev) {
      setSelectedBrand(dev.brand);
      if (dev.location) setLocation(dev.location);
      const defaultTpl = getDefaultTemplateForBrand(dev.brand);
      setSelectedTemplateId(defaultTpl.id);
      savePreferences({
        printerId: deviceId,
        brand: dev.brand,
        location: dev.location || location,
        templateId: defaultTpl.id,
      });
    }
  };

  // Toggle orientation
  const handleToggleOrientation = () => {
    const next: LabelOrientation =
      orientation === "landscape" ? "portrait" : "landscape";
    setOrientation(next);
    savePreferences({ orientation: next });
  };

  // Configure browser print engine via react-to-print
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

  // Common label data payload
  const commonLabelData: CommonLabelData = {
    itemName: item.itemName,
    sku: item.sku || item.imeiNumber || item._id || "",
    gtin: rawItem.gtin || item.modelNumber || undefined,
    variationName: variationString || undefined,
    price: displayPrice,
    unitAbbreviation: rawItem.unit || "pcs",
    barcode: barcodeValue,
    barcodeFormat,
    labelWidth: layoutDims.width,
    labelHeight: layoutDims.height,
    unit: layoutDims.unit,
    orientation,
    quantity,
    location,
    currencySymbol: currencySymbol || "£",
    fields: details,
    template: activeTemplate,
  };

  // One-click print action
  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // 1. Refresh connection probe before printing as instructed in Note 4
      await recheckConnection();

      // 2. Dispatch print job
      const result = await adapter.print(commonLabelData, {
        contentRef: printRef,
        copies: quantity,
        triggerBrowserPrint: () => handleReactToPrint(),
      });

      if (result.success) {
        toast.success(
          result.message ||
            `Sent ${quantity} label${quantity > 1 ? "s" : ""} to ${selectedBrand} printer`,
        );
        onClose();
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg bg-card text-foreground rounded-2xl p-0 shadow-2xl font-poppins max-h-[94vh] flex flex-col overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-5 pb-3 border-b border-border flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-bold tracking-tight">
                Print label
              </DialogTitle>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#84CC16]/10 text-[#65a30d] border border-[#84CC16]/20">
              {selectedBrand}
            </span>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {/* 1. PRINTER CONNECTION STATUS BANNER (Developer Note 4) */}
            <div className="space-y-1.5">
              {connectionStatus === "connected" && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#dcfce7] text-[#15803d] border border-[#86efac] text-xs font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#16a34a]" />
                    <span>Printer connected</span>
                  </div>
                  <span className="text-[11px] font-semibold opacity-80">
                    Verified
                  </span>
                </div>
              )}

              {connectionStatus === "unverified" && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-xs font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#d97706]" />
                    <span>Connection unverified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => recheckConnection()}
                      disabled={isRechecking}
                      className="px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-[#92400e] text-[11px] font-bold transition flex items-center gap-1 shadow-xs"
                      title="Re-check printer connection"
                    >
                      <RotateCcw
                        size={12}
                        className={isRechecking ? "animate-spin" : ""}
                      />
                      <span>Recheck</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSetupGuideOpen(true)}
                      className="px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-[#92400e] text-[11px] font-bold transition shadow-xs"
                    >
                      Printer setup
                    </button>
                  </div>
                </div>
              )}

              {connectionStatus === "offline" && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5] text-xs font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-[#dc2626]" />
                    <span>Printer offline</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => recheckConnection()}
                      disabled={isRechecking}
                      className="px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-[#991b1b] text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <RotateCcw
                        size={12}
                        className={isRechecking ? "animate-spin" : ""}
                      />
                      <span>Recheck</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSetupGuideOpen(true)}
                      className="px-2 py-1 rounded-lg bg-white/70 hover:bg-white text-[#991b1b] text-[11px] font-bold transition"
                    >
                      Printer setup
                    </button>
                  </div>
                </div>
              )}

              {connectionStatus === "checking" && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-muted/60 text-muted-foreground border border-border text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Loader2
                      size={15}
                      className="animate-spin text-muted-foreground"
                    />
                    <span>Checking printer connection...</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. PRINTER HARDWARE SELECTOR */}
            <div className="space-y-1.5">
              <Select
                value={selectedPrinterId}
                onValueChange={handleDeviceChange}
              >
                <SelectTrigger className="w-full h-12 rounded-xl border border-border bg-background font-semibold text-xs shadow-xs focus:ring-1 focus:ring-[#84CC16]">
                  <div className="flex items-center gap-2.5 truncate">
                    <Printer size={16} className="text-[#65a30d] shrink-0" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {INSTALLED_PRINTER_DEVICES.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      <span className="font-semibold text-xs">
                        {device.name}
                      </span>
                      {device.location && (
                        <span className="text-muted-foreground text-xs">
                          {" "}
                          • {device.location}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. SELECTED LABEL SUMMARY CARD */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsChooseSizeOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setIsChooseSizeOpen(true);
              }}
              className="group p-3.5 rounded-xl bg-card border border-border hover:border-[#84CC16]/60 transition-all cursor-pointer flex items-center justify-between shadow-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-sm text-foreground group-hover:text-[#65a30d] transition-colors">
                  {activeTemplate.label_name}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {activeTemplate.product_code || activeTemplate.id} |{" "}
                  {stockWidth} × {stockHeight} mm
                </div>
              </div>

              {/* Shape Thumbnail */}
              <div className="p-1.5 rounded-lg bg-muted border border-border shrink-0">
                <LabelShapeThumbnail
                  shape={activeTemplate.shape}
                  widthMm={stockWidth}
                  heightMm={stockHeight}
                  className="w-10 h-7 text-foreground"
                />
              </div>
            </div>

            {/* 4. QUICK SEARCH TRIGGER */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsChooseSizeOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setIsChooseSizeOpen(true);
              }}
              className="flex items-center justify-between w-full h-11 px-3.5 rounded-xl bg-background border border-border hover:border-[#84CC16]/60 text-xs font-medium text-muted-foreground transition-colors cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Search size={15} className="text-muted-foreground" />
                <span>Search name, code or size</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                Browse
              </span>
            </div>

            {/* 5. ORIENTATION TOGGLE (Landscape layout • 57 x 32 mm) */}
            <div className="flex items-center justify-between py-1">
              <label
                onClick={handleToggleOrientation}
                className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    orientation === "landscape"
                      ? "bg-[#84CC16] border-[#84CC16] text-white"
                      : "border-input bg-background"
                  }`}
                >
                  {orientation === "landscape" && (
                    <Check size={12} strokeWidth={3} />
                  )}
                </div>
                <span>
                  Landscape layout • {layoutDims.width} × {layoutDims.height} mm
                </span>
              </label>

              <button
                type="button"
                onClick={handleToggleOrientation}
                className="text-[11px] font-bold text-[#65a30d] hover:underline"
              >
                Switch to{" "}
                {orientation === "landscape" ? "Portrait" : "Landscape"}
              </button>
            </div>

            {/* 6. LIVE LABEL PREVIEW CARD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Preview
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Target: {layoutDims.width} × {layoutDims.height} mm
                </span>
              </div>

              <div className="flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto min-h-[110px]">
                <div className="shadow-md border border-slate-300 dark:border-slate-700 rounded overflow-hidden bg-white">
                  <LabelPreview data={commonLabelData} />
                </div>
              </div>
            </div>

            {/* 7. QUANTITY STEPPER & CHANGE SETTINGS */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-foreground">
                  Quantity
                </span>
                <div className="flex items-center border border-border rounded-xl bg-background shadow-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(1, quantity - 1);
                      setQuantity(next);
                      savePreferences({ quantity: next });
                    }}
                    className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-xs font-bold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = quantity + 1;
                      setQuantity(next);
                      savePreferences({ quantity: next });
                    }}
                    className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChooseSizeOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#65a30d] hover:text-[#52840a] transition-colors"
              >
                <Settings size={14} />
                <span>Change settings</span>
              </button>
            </div>

            {/* 8. PRIMARY PRINT ACTION BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full py-3.5 px-6 bg-[#84CC16] hover:bg-[#76b813] text-white font-bold text-sm rounded-xl transition shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2.5"
              >
                {isPrinting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>
                      Printing {quantity} label{quantity > 1 ? "s" : ""}...
                    </span>
                  </>
                ) : (
                  <>
                    <Printer size={18} strokeWidth={2.5} />
                    <span>Print label</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-muted-foreground mt-1.5 font-medium">
                One click sends to the saved printer
              </p>
            </div>

            {/* 9. PROCESS STEPS BANNER (Image 1 Bottom) */}
            <div className="pt-3 border-t border-border">
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground font-semibold">
                <div className="p-2 rounded-lg bg-muted/40 flex flex-col items-center gap-1">
                  <Download size={14} className="text-[#65a30d]" />
                  <span>1. Install driver + connector</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 flex flex-col items-center gap-1">
                  <MonitorCheck size={14} className="text-[#65a30d]" />
                  <span>2. Select & test once</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/40 flex flex-col items-center gap-1">
                  <Printer size={14} className="text-[#65a30d]" />
                  <span>3. Print directly</span>
                </div>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2 italic">
                Concept: verify printer, media and connection before enabling
                Print.
              </p>
            </div>
          </div>
        </DialogContent>

        {/* Hidden Print Target used by react-to-print */}
        <div className="hidden">
          <div ref={printRef}>
            {Array.from({ length: quantity }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  pageBreakAfter: idx === quantity - 1 ? "auto" : "always",
                  breakAfter: idx === quantity - 1 ? "auto" : "page",
                }}
              >
                <LabelPreview data={commonLabelData} />
              </div>
            ))}
          </div>
        </div>
      </Dialog>

      {/* Tier 2 Modal: Choose label sizes easily (Image 2) */}
      <ChooseLabelSizeModal
        isOpen={isChooseSizeOpen}
        onClose={() => setIsChooseSizeOpen(false)}
        brand={selectedBrand}
        activeTemplate={activeTemplate}
        orientation={orientation}
        fields={details}
        barcodeFormat={barcodeFormat}
        sampleItem={{
          itemName: item.itemName,
          price: displayPrice,
          barcode: barcodeValue,
          sku: item.sku,
          gtin: rawItem.gtin,
          variationName: variationString,
          unitAbbreviation: rawItem.unit,
          location,
          currencySymbol: currencySymbol || "£",
        }}
        onSave={({
          template,
          orientation: nextOrient,
          fields: nextFields,
          barcodeFormat: nextFormat,
        }) => {
          setSelectedTemplateId(template.id);
          setOrientation(nextOrient);
          setDetails(nextFields);
          setBarcodeFormat(nextFormat);
          savePreferences({
            templateId: template.id,
            orientation: nextOrient,
            details: nextFields,
            barcodeFormat: nextFormat,
          });
          toast.success(`Saved label size: ${template.label_name}`);
        }}
      />

      {/* Printer Setup & Driver Guide Dialog */}
      <PrinterSetupModal
        isOpen={isSetupGuideOpen}
        onClose={() => setIsSetupGuideOpen(false)}
      />
    </>
  );
}
