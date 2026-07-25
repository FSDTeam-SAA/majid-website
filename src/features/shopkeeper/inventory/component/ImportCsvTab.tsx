"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useImportCsvInventory, useCategories } from "../hooks/useInventory";
import { Category } from "../types";

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

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
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

  const fileSize = file
    ? file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : "";

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
          Import Inventory
        </h2>
        <p className="text-sm font-bold text-[#64748B] dark:text-slate-400">
          Upload a CSV or Excel file to bulk-import devices into your inventory.
        </p>
      </div>

      {/* Category Select */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
            Target Category (Optional)
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-12 px-4 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]"
          >
            <option value="">-- Select Category --</option>
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
              : "#F8FAFC",
          scale: dragOver ? 1.01 : 1,
        }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col items-center justify-center gap-4 rounded-[28px] border-2 border-dashed p-12 cursor-pointer transition-all dark:bg-slate-800/50 dark:border-slate-700"
        style={{ minHeight: 260 }}
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
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#84CC16]/10 text-[#84CC16]">
                <Upload size={32} strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-base font-black text-[#0F172A] dark:text-white">
                  Drag & drop your file here
                </p>
                <p className="text-sm font-bold text-[#94A3B8] mt-1">
                  or{" "}
                  <span className="text-[#84CC16] underline underline-offset-2 cursor-pointer">
                    browse
                  </span>{" "}
                  to choose
                </p>
              </div>
              <p className="text-xs font-bold text-[#CBD5E1] dark:text-slate-500">
                Supports .CSV, .XLS, .XLSX
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
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#84CC16]/15 text-[#84CC16]">
                <FileSpreadsheet size={32} strokeWidth={2} />
              </span>
              <div className="text-center">
                <p className="text-base font-black text-[#0F172A] dark:text-white break-all max-w-xs mx-auto">
                  {file.name}
                </p>
                <p className="text-xs font-bold text-[#94A3B8] mt-0.5">
                  {fileSize}
                </p>
              </div>
              <button
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

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!file || isPending}
        className="flex items-center justify-center gap-2 w-full py-4 bg-[#84CC16] text-white font-black rounded-2xl text-base hover:bg-[#76b813] transition shadow-lg shadow-lime-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload size={20} strokeWidth={2.5} />
            Submit &amp; Import
          </>
        )}
      </button>

      {/* Hint */}
      <p className="text-center text-xs font-bold text-[#CBD5E1] dark:text-slate-600">
        Make sure your file follows the required column format before uploading.
      </p>
    </div>
  );
}
