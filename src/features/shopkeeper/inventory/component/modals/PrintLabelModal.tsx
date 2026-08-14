import React, { useRef, useState } from "react";
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
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import type { InventoryItem } from "../../types";
import { useCurrency } from "@/hooks/useCurrency";
import { Printer } from "lucide-react";

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
  const { formatCurrency } = useCurrency();
  const [labelType, setLabelType] = useState(
    "DYMO 1933085 - LW Durable 19 mm x 64 mm",
  );
  const [location, setLocation] = useState("Mobile Kit Distribution");
  const [barcodeFormat, setBarcodeFormat] = useState("SKU");

  const [details, setDetails] = useState({
    sku: true,
    gtin: false,
    variationName: true,
    price: true,
    itemName: true,
    unitAbbreviation: false,
  });

  const printRef = useRef<HTMLDivElement>(null);

  const getPageSize = () => {
    if (labelType.includes("30336")) return { width: "54mm", height: "25.4mm" };
    return { width: "64mm", height: "19mm" };
  };

  const pageSize = getPageSize();

  const handlePrint = useReactToPrint({
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card text-foreground rounded-xl p-0 shadow-lg">
        <DialogHeader className="p-6 border-b border-border flex flex-col gap-1">
          <DialogTitle className="text-xl font-bold">Print labels</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure and print item label
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Label type</label>
              <Select value={labelType} onValueChange={setLabelType}>
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="Select label type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DYMO 1933085 - LW Durable 19 mm x 64 mm">
                    DYMO 1933085 - LW Durable 19 mm x 64 mm
                  </SelectItem>
                  <SelectItem value="DYMO 30336 - 1 x 2-1/8 in">
                    DYMO 30336 - 1 x 2-1/8 in
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full h-12 rounded-xl">
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

            <div className="space-y-2">
              <label className="text-sm font-semibold">Barcode format</label>
              <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SKU">SKU</SelectItem>
                  <SelectItem value="IMEI">IMEI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <label className="text-sm font-semibold">Label details</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
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
                <div className="flex items-center space-x-3">
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
                <div className="flex items-center space-x-3">
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
                <div className="flex items-center space-x-3">
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
                <div className="flex items-center space-x-3">
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
                <div className="flex items-center space-x-3">
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
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-surface transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#84CC16] text-white font-bold rounded-xl hover:bg-[#76b813] transition shadow-md active:scale-95"
            >
              <Printer size={18} strokeWidth={2.5} />
              Print Label
            </button>
          </div>
        </div>
      </DialogContent>

      {/* Hidden Print Content */}
      <div className="hidden">
        <div
          ref={printRef}
          className="bg-white text-black"
          style={{
            width: pageSize.width,
            height: pageSize.height,
            padding: "2mm",
            boxSizing: "border-box",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {details.price && (
            <div
              className="font-bold mb-0.5"
              style={{ fontSize: "12px", lineHeight: 1 }}
            >
              {formatCurrency(displayPrice)}
            </div>
          )}
          <div
            className="leading-tight text-gray-800 mb-0.5"
            style={{ fontSize: "9px", maxHeight: "20px", overflow: "hidden" }}
          >
            {details.itemName && item.itemName}
            {details.variationName && (item.storage || item.color)
              ? ` ${item.storage || ""} ${item.color || ""}`
              : ""}
            {details.sku && barcodeValue ? ` / ${barcodeValue}` : ""}
          </div>
          <div
            className="text-gray-600 mb-0.5"
            style={{ fontSize: "8px", lineHeight: 1 }}
          >
            Regular
          </div>
          <div className="flex justify-start">
            <Barcode
              value={barcodeValue}
              width={1}
              height={18}
              fontSize={9}
              margin={0}
              displayValue={true}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
