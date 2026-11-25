"use client";

import React, { useMemo, useState } from "react";
import Barcode from "react-barcode";
import { format } from "date-fns";
import { Printer, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepairRequest } from "@/features/customer/repairRequest/types/repair-request.types";
import {
  formatDeviceCatalogTitle,
  resolveCanonicalBarcode,
} from "@/features/customer/repairRequest/utils/repairConstants";

export type RepairLabelStage = "booked" | "ready-for-collection" | "rejected";

const STAGE_META: Record<
  RepairLabelStage,
  { badge: string; heading: string; accent: string }
> = {
  booked: {
    badge: "BOOKED",
    heading: "BOOKED IN",
    accent: "#2563EB",
  },
  "ready-for-collection": {
    badge: "READY TO COLLECT",
    heading: "READY TO COLLECT",
    accent: "#16A34A",
  },
  rejected: {
    badge: "REJECTED",
    heading: "REJECTED / RETURN",
    accent: "#DC2626",
  },
};

export function inferDefaultLabelStage(status?: string): RepairLabelStage {
  const s = (status || "").toLowerCase().trim();
  if (s === "ready-for-collection" || s === "completed" || s === "approved") {
    return "ready-for-collection";
  }
  if (s === "rejected" || s === "unable-to-repair") {
    return "rejected";
  }
  return "booked";
}

export function RepairJobLabelModal({
  isOpen,
  onClose,
  request,
  initialStage,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: RepairRequest;
  initialStage?: RepairLabelStage;
}) {
  const [stage, setStage] = useState<RepairLabelStage>(
    initialStage || inferDefaultLabelStage(request.status),
  );

  const canonicalBarcode = useMemo(
    () => resolveCanonicalBarcode(request as unknown as Record<string, any>),
    [request],
  );
  const jobRef = `#${canonicalBarcode}`;
  const stageMeta = STAGE_META[stage];

  const deviceTitle = formatDeviceCatalogTitle(
    request.brand || "",
    request.modelName || request.deviceModel || "Repair Device",
  );
  const modelCode = (request.modelCode || "").trim();
  const colour = (request.colour || "").trim();
  const imeiOrSerial =
    (request.IMEINumber || "").trim() || (request.serialNumber || "").trim();
  const customerName = request.firstName || "Walk-in Customer";
  const stageDate = request.createdAt
    ? format(new Date(request.createdAt), "dd MMM yyyy")
    : format(new Date(), "dd MMM yyyy");

  if (!isOpen) return null;

  const handlePrint = () => {
    const printEl = document.getElementById("repair-label-58x35-print");
    if (!printEl) return;

    const win = window.open("", "_blank", "width=420,height=320");
    if (!win) {
      window.print();
      return;
    }
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Repair Job Label ${jobRef}</title>
          <style>
            @page { size: 58mm 35mm; margin: 0; }
            html, body {
              width: 58mm;
              height: 35mm;
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
              background: #ffffff;
              color: #0f172a;
            }
            .label-wrap {
              box-sizing: border-box;
              width: 58mm;
              height: 35mm;
              padding: 2mm 2.5mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              overflow: hidden;
            }
            .top-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 0.4px solid #cbd5e1;
              padding-bottom: 1mm;
            }
            .ref { font-size: 9pt; font-weight: 800; letter-spacing: 0.3px; }
            .stage {
              font-size: 6.5pt;
              font-weight: 800;
              padding: 0.5mm 1.5mm;
              border: 0.7px solid ${stageMeta.accent};
              color: ${stageMeta.accent};
              border-radius: 2px;
            }
            .meta { font-size: 6.5pt; line-height: 1.25; }
            .device { font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .sub { color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .barcode-box { display: flex; flex-direction: column; align-items: center; }
            .barcode-box svg { max-width: 52mm; height: 9mm; }
          </style>
        </head>
        <body>
          <div class="label-wrap">${printEl.innerHTML}</div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[#10B981]" />
            <div>
              <h3 className="text-base font-black text-foreground">
                Repair Job Label (58 × 35 mm)
              </h3>
              <p className="text-xs text-muted-foreground">
                Same job reference {jobRef} &amp; barcode at every stage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stage switcher */}
        <div className="grid grid-cols-3 gap-2">
          {(["booked", "ready-for-collection", "rejected"] as RepairLabelStage[]).map(
            (s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  stage === s
                    ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {STAGE_META[s].badge}
              </button>
            ),
          )}
        </div>

        {/* 58x35mm Visual Preview */}
        <div className="flex justify-center bg-surface border border-border rounded-2xl p-4">
          <div
            className="bg-white text-slate-900 border border-slate-300 shadow-sm rounded-md overflow-hidden"
            style={{ width: "260px", minHeight: "156px", padding: "10px 12px" }}
          >
            <div id="repair-label-58x35-print" className="space-y-1.5">
              <div className="top-row flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="ref text-xs font-black tracking-wide text-slate-900">
                  {jobRef}
                </span>
                <span
                  className="stage text-[10px] font-black px-1.5 py-0.5 rounded border"
                  style={{
                    color: stageMeta.accent,
                    borderColor: stageMeta.accent,
                  }}
                >
                  {stageMeta.heading}
                </span>
              </div>

              <div className="meta text-[11px] leading-tight space-y-0.5">
                <div className="device font-bold text-slate-900 truncate">
                  {deviceTitle}
                </div>
                <div className="sub text-slate-600 truncate">
                  {[modelCode, colour, customerName].filter(Boolean).join(" · ")}
                </div>
                <div className="sub text-slate-500 text-[10px] truncate">
                  {[imeiOrSerial ? `ID: ${imeiOrSerial}` : "", `Date: ${stageDate}`]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>

              <div className="barcode-box flex flex-col items-center pt-0.5">
                <Barcode
                  value={canonicalBarcode}
                  format="CODE128"
                  width={1.35}
                  height={34}
                  fontSize={10}
                  margin={0}
                  background="#ffffff"
                  lineColor="#0f172a"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full font-bold"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="flex-1 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-bold flex items-center justify-center gap-2"
          >
            <Printer size={15} /> Print 58 × 35 mm Label
          </Button>
        </div>
      </div>
    </div>
  );
}
