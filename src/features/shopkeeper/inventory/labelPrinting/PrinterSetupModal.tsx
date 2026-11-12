import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, MonitorCheck, Printer, AlertTriangle } from "lucide-react";

interface PrinterSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrinterSetupModal: React.FC<PrinterSetupModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-card text-foreground rounded-2xl p-0 shadow-2xl font-poppins max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader className="p-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#84CC16]/10 text-[#65a30d]">
              <Printer size={22} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Label Printer Setup & Connection Guide
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Quick 3-step setup for verified direct label printing in IMOSCAN
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* 3 Process Steps */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#84CC16] text-white font-bold text-sm shadow-sm">
                1
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Download size={15} className="text-[#65a30d]" />
                  <h4 className="text-sm font-semibold">
                    Install driver + print connector once
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  For <strong>DYMO</strong>, install{" "}
                  <em>DYMO Connect for Desktop</em> (enables the local web
                  service on 127.0.0.1:41951). For <strong>Zebra</strong>,
                  install <em>Zebra Browser Print</em>. Standard thermal drivers
                  also work with OS browser printing.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#84CC16] text-white font-bold text-sm shadow-sm">
                2
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MonitorCheck size={15} className="text-[#65a30d]" />
                  <h4 className="text-sm font-semibold">
                    Select printer, label and test once
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Choose your installed printer model, pick your label stock
                  (e.g. Multipurpose 32 x 57 mm), and test a sample print.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#84CC16] text-white font-bold text-sm shadow-sm">
                3
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Printer size={15} className="text-[#65a30d]" />
                  <h4 className="text-sm font-semibold">
                    Print directly from IMOSCAN
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Once saved, IMOSCAN remembers your hardware and label
                  orientation for instant 1-click printing on any inventory
                  item.
                </p>
              </div>
            </div>
          </div>

          {/* Note on Connection Unverified status */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs">
              <AlertTriangle size={15} />
              <span>Why does it say &ldquo;Connection unverified&rdquo;?</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Modern browsers restrict web applications from querying hardware
              USB cables directly without an active local connector service
              (such as DYMO Connect or Zebra Browser Print).
              <br />
              <strong className="font-semibold">Good news:</strong> You can
              still click <strong>&ldquo;Print label&rdquo;</strong> at any
              time! IMOSCAN automatically routes the job to your computer&apos;s
              system print engine with exact millimeter dimensions.
            </p>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[#84CC16] text-white font-bold text-xs rounded-xl hover:bg-[#76b813] transition shadow-sm active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
