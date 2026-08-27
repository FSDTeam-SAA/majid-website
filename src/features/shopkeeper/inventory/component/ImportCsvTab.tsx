"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  FileText,
  Info,
  HelpCircle,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  useImportCsvInventory,
  useCategories,
  useMyInventory,
} from "../hooks/useInventory";
import { Category, InventoryItem } from "../types";
import {
  CSV_COLUMNS_SPEC,
  downloadCsvTemplate,
  exportInventoryToCsv,
} from "../utils/csvUtils";

const ACCEPTED_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const ACCEPTED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

export function ImportCsvTab() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id ?? "";

  const { mutateAsync: importCsv, isPending } = useImportCsvInventory();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];
  const { data: myInventoryData } = useMyInventory();
  const allInventoryItems: InventoryItem[] = (
    myInventoryData?.data || []
  ).filter((item: InventoryItem) => item.type === "inventory");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showSpecDetails, setShowSpecDetails] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidFile = (f: File) =>
    ACCEPTED_TYPES.includes(f.type) ||
    ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext));

  const pickFile = (f: File) => {
    if (!isValidFile(f)) {
      toast.error("Only CSV, XLS, or XLSX files are accepted.");
      return;
    }
    setFile(f);
    setUploadStatus("idle");
    setErrorMsg("");
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) pickFile(picked);
    e.target.value = "";
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus("idle");
    setErrorMsg("");
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    if (!userId) {
      toast.error("Session not found. Please log in again.");
      return;
    }

    try {
      setUploadStatus("idle");
      await importCsv({
        file,
        userId,
        categoryId: selectedCategoryId || undefined,
      });
      setUploadStatus("success");
      setFile(null);
      toast.success("Inventory imported successfully!");
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      const msg =
        e.response?.data?.message ?? "Import failed. Please try again.";
      setErrorMsg(msg);
      setUploadStatus("error");
      toast.error(msg);
    }
  };

  const handleExportCurrent = () => {
    if (!allInventoryItems.length) {
      toast.error("No inventory items found to export");
      return;
    }
    exportInventoryToCsv(
      allInventoryItems,
      `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    toast.success(
      `Exported ${allInventoryItems.length} inventory items to CSV`,
    );
  };

  const fileSize = file
    ? file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : "";

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#84CC16]/10 flex items-center justify-center text-[#84CC16]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              CSV Import &amp; Export
            </h2>
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-10.5">
            Bulk-import or export devices with consistent column formats &amp;
            category structures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pl-10.5 md:pl-0">
          <button
            type="button"
            onClick={() => downloadCsvTemplate(categories)}
            className="flex items-center gap-2 px-4 h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-black rounded-xl transition cursor-pointer active:scale-95"
            title="Download formatted sample template CSV"
          >
            <Download size={14} className="text-[#84CC16]" />
            Download Sample CSV
          </button>
          {allInventoryItems.length > 0 && (
            <button
              type="button"
              onClick={handleExportCurrent}
              className="flex items-center gap-2 px-4 h-11 bg-[#84CC16]/10 hover:bg-[#84CC16]/20 text-[#84CC16] text-xs font-black rounded-xl transition cursor-pointer active:scale-95"
              title="Export current inventory list matching the CSV format"
            >
              <FileText size={14} />
              Export Current ({allInventoryItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Target Category Select */}
      {categories.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5 text-[#84CC16]" />
            Default Target Category (Optional)
          </label>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            If a row in your CSV does not specify a category in its{" "}
            <code>category</code> column, it will automatically be placed in
            this category.
          </p>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/20 focus:border-[#84CC16] transition"
          >
            <option value="">
              -- No default category (use row &ldquo;category&rdquo; column or
              uncategorized) --
            </option>
            {categories.map((cat: Category) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Drop Zone */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        animate={{
          borderColor: dragOver ? "#84CC16" : file ? "#84CC16" : "#E2E8F0",
          backgroundColor: dragOver
            ? "rgba(132,204,22,0.06)"
            : file
              ? "rgba(132,204,22,0.04)"
              : "#FFFFFF",
          scale: dragOver ? 1.01 : 1,
        }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col items-center justify-center gap-4 rounded-[28px] border-2 border-dashed p-10 cursor-pointer transition-all dark:bg-slate-900/60 dark:border-slate-800 shadow-sm"
        style={{ minHeight: 220 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={onFileChange}
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#84CC16]/10 text-[#84CC16]">
                <Upload size={28} strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-black text-[#0F172A] dark:text-white">
                  Drag &amp; drop your CSV or Excel file here
                </p>
                <p className="text-xs font-bold text-[#94A3B8] mt-1">
                  or{" "}
                  <span className="text-[#84CC16] underline underline-offset-2 cursor-pointer">
                    browse from device
                  </span>
                </p>
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Supports .CSV · .XLS · .XLSX
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-3 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#84CC16]/15 text-[#84CC16]">
                <FileSpreadsheet size={28} strokeWidth={2} />
              </span>
              <div className="text-center">
                <p className="text-sm font-black text-[#0F172A] dark:text-white break-all max-w-xs mx-auto">
                  {file.name}
                </p>
                <p className="text-xs font-bold text-[#94A3B8] mt-0.5">
                  {fileSize}
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
              >
                <X size={14} />
                Remove file
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Status messages */}
      <AnimatePresence>
        {uploadStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-800"
          >
            <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
            <p className="text-sm font-bold text-green-700 dark:text-green-400">
              Import successful! Your inventory has been updated.
            </p>
          </motion.div>
        )}
        {uploadStatus === "error" && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-800"
          >
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              {errorMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!file || isPending}
        className="flex items-center justify-center gap-2 w-full py-4 bg-[#84CC16] text-white font-black rounded-2xl text-sm uppercase tracking-wider hover:bg-[#76b813] transition shadow-lg shadow-lime-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing &amp; Importing Inventory...
          </>
        ) : (
          <>
            <Upload size={18} strokeWidth={2.5} />
            Submit &amp; Import Devices
          </>
        )}
      </button>

      {/* ── Documented CSV Column & Structure Guide ── */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-[#84CC16]" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Required CSV Column &amp; Category Structure Guide
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowSpecDetails(!showSpecDetails)}
            className="text-xs font-bold text-[#84CC16] hover:underline cursor-pointer flex items-center gap-1"
          >
            <HelpCircle size={14} />
            {showSpecDetails ? "Hide full table" : "Show full specifications"}
          </button>
        </div>

        {/* Quick Format Summary Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="text-[11px] font-black uppercase text-[#84CC16] tracking-wider">
              1. Mandatory Columns
            </p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              <code>itemName</code> and <code>imeiNumber</code> (or barcode ID).
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="text-[11px] font-black uppercase text-[#84CC16] tracking-wider">
              2. Category Matching
            </p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Provide category name (e.g. <code>Smartphones</code>) in the{" "}
              <code>category</code> column or select target above.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="text-[11px] font-black uppercase text-[#84CC16] tracking-wider">
              3. Condition Values
            </p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              <code>new</code>, <code>good condition</code>, <code>fair</code>,{" "}
              <code>refurbished</code>, <code>for parts</code>.
            </p>
          </div>
        </div>

        {/* Detailed Schema Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Column Name</th>
                <th className="px-3 py-3.5">Status</th>
                <th className="px-4 py-3.5">Example Value</th>
                <th className="px-5 py-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {(showSpecDetails
                ? CSV_COLUMNS_SPEC
                : CSV_COLUMNS_SPEC.slice(0, 7)
              ).map((col) => (
                <tr
                  key={col.name}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {col.name}
                  </td>
                  <td className="px-3 py-3">
                    {col.required ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                        Required
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {col.example}
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400 text-xs">
                    {col.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!showSpecDetails && (
          <div className="p-3 text-center bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowSpecDetails(true)}
              className="text-xs font-bold text-[#84CC16] hover:underline"
            >
              + View all {CSV_COLUMNS_SPEC.length} supported columns (Quantity,
              Pricing, Condition, Notes, etc.)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
