import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Fetching Data" },
  { id: 2, label: "Generating Report" },
];

interface ScanProgressProps {
  isScanning: boolean;
  currentStep: number;
}

export const ScanProgress = ({
  isScanning,
  currentStep,
}: ScanProgressProps) => {
  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
              <span className="text-[13px] font-black text-[#84CC16] tracking-widest uppercase">
                AI Analyzing...
              </span>
            </div>
            <span className="text-[13px] font-bold text-muted-foreground tracking-wider">
              Session ID: IMS-482-901
            </span>
          </div>

          <div className="space-y-8 pt-6">
            {STEPS.map((step, index) => {
              const status =
                index + 1 < currentStep
                  ? "COMPLETED"
                  : index + 1 === currentStep
                    ? "IN PROGRESS"
                    : "PENDING";
              return (
                <div key={step.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          status === "COMPLETED"
                            ? "border-[#84CC16] bg-[#84CC16]/5"
                            : status === "IN PROGRESS"
                              ? "border-[#84CC16] bg-card"
                              : "border-border bg-card"
                        }`}
                      >
                        {status === "COMPLETED" ? (
                          <Check size={18} className="text-[#84CC16]" />
                        ) : status === "IN PROGRESS" ? (
                          <div className="w-2 h-2 rounded-full bg-[#84CC16]" />
                        ) : (
                          <span className="text-muted-foreground text-sm font-bold">
                            {step.id}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[17px] font-bold transition-colors ${
                          status === "PENDING"
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {step.id}. {step.label}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-black tracking-widest uppercase transition-colors ${
                        status === "COMPLETED"
                          ? "text-[#84CC16]"
                          : status === "IN PROGRESS"
                            ? "text-[#84CC16] animate-pulse"
                            : "text-muted-foreground/60"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden ml-14">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          status === "COMPLETED"
                            ? "100%"
                            : status === "IN PROGRESS"
                              ? "65%"
                              : "0%",
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        status === "PENDING"
                          ? "bg-muted-foreground/20"
                          : "bg-[#84CC16]"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
