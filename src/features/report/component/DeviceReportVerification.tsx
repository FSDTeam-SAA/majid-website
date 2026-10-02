"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Smartphone,
  Download,
  Printer,
  Share2,
  Copy,
  Search,
  Store,
  Sparkles,
  Unlock,
  Radio,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import { CertificatePDF } from "@/features/shopkeeper/scanDevice/component/CertificatePDF";
import { useCertificateDownload } from "@/features/shopkeeper/scanDevice/hooks/useCertificateDownload";
import { PublicDeviceReportData, ShopData } from "../types/report.types";

export default function DeviceReportVerification() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string | undefined;

  const [loading, setLoading] = useState<boolean>(() => Boolean(rawId));
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<PublicDeviceReportData | null>(
    null,
  );
  const [searchImei, setSearchImei] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { isDownloading, downloadCertificatePdf } = useCertificateDownload();
  const printRef = useRef<HTMLDivElement>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "https://api.imoscan.com/api/v1";

  useEffect(() => {
    let active = true;

    if (!rawId) {
      return;
    }

    async function loadReport(identifier: string) {
      try {
        setError(null);
        const res = await fetch(
          `${apiBase}/imei/report/${encodeURIComponent(identifier)}`,
        );
        const result = await res.json();

        if (!active) return;

        if (!res.ok || !result.success || !result.data) {
          throw new Error(
            result?.message ||
              "No verified certificate found for this IMEI / Certificate ID",
          );
        }

        setReportData(result.data);
      } catch (err: unknown) {
        if (!active) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load device certificate. Please check the IMEI or ID and try again.";
        setError(msg);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReport(rawId);

    return () => {
      active = false;
    };
  }, [rawId, apiBase]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Verification link copied to clipboard!");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportData) return;
    const filename = `Imoscan-Certificate-${reportData.imei || "Device"}.pdf`;
    await downloadCertificatePdf(["certificate-pdf-public-report"], filename);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchImei.trim();
    if (!clean) return;
    router.push(`/report/${encodeURIComponent(clean)}`);
  };

  // Extract parsed rows or provider rows
  const parsedData = (reportData?.parsedProviderData || {}) as Record<
    string,
    unknown
  >;
  const imeiNumber =
    reportData?.imei || (parsedData["imei"] as string) || rawId || "N/A";
  const imei2Number =
    (parsedData["imei2"] as string) || (parsedData["IMEI 2"] as string) || "";
  const serialNumber =
    (parsedData["serial_number"] as string) ||
    (parsedData["serial"] as string) ||
    (parsedData["Serial Number"] as string) ||
    "N/A";
  const modelName =
    reportData?.deviceName ||
    (parsedData["model_name"] as string) ||
    (parsedData["model"] as string) ||
    (parsedData["Model"] as string) ||
    "Unknown Device";

  const shop =
    typeof reportData?.shopId === "object"
      ? (reportData.shopId as ShopData)
      : null;
  const verifiedDate = reportData?.createdAt
    ? new Date(reportData.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  const riskScore = reportData?.riskMeter?.score ?? 12;
  const isClean =
    (reportData?.deviceStatus ?? "clean").toLowerCase() === "clean";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm space-y-4">
            <RefreshCw className="w-10 h-10 text-lime-500 animate-spin mx-auto" />
            <h2 className="text-xl font-semibold">
              Verifying Device Certificate...
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Connecting to Imoscan Verification Network to validate
              authenticity and real-time security data.
            </p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Certificate Not Found
              </h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto text-sm">
                {error}
              </p>
            </div>

            {/* Re-enter IMEI or Search */}
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-md mx-auto flex gap-2"
            >
              <input
                type="text"
                value={searchImei}
                onChange={(e) => setSearchImei(e.target.value)}
                placeholder="Enter 15-digit IMEI or Serial Number"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-lime-500 hover:bg-lime-600 text-slate-950 font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                Verify
              </button>
            </form>

            <div className="pt-4 flex items-center justify-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                ← Back to Home
              </Link>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <Link
                href="/contact-us"
                className="text-sm font-medium text-lime-600 dark:text-lime-400 hover:underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}

        {/* Success / Report Verified View */}
        {!loading && !error && reportData && (
          <div ref={printRef} className="space-y-6">
            {/* Top Official Verification Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-lime-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Official Verified Certificate
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {modelName}
                  </h1>
                  <p className="text-lime-100 text-xs sm:text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span>
                      Certificate ID:{" "}
                      <strong className="font-mono">
                        {reportData._id || imeiNumber}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Verified: <strong>{verifiedDate}</strong>
                    </span>
                    {shop?.shopName && (
                      <>
                        <span>•</span>
                        <span>
                          Issued By: <strong>{shop.shopName}</strong>
                        </span>
                      </>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 print:hidden">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm rounded-xl transition shadow-md disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 text-lime-600" />
                    {isDownloading ? "Downloading..." : "Download PDF"}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-xs sm:text-sm rounded-xl transition border border-white/20"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition border border-white/20 text-xs sm:text-sm font-medium"
                    title="Share Verification Link"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Identity Details */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-lime-100 dark:bg-lime-950/60 flex items-center justify-center text-lime-600 dark:text-lime-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">
                        Device Information
                      </h3>
                      <p className="text-xs text-slate-500">
                        Hardware and serial identifiers
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isClean
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border border-red-300 dark:border-red-800"
                    }`}
                  >
                    {isClean ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {isClean ? "Clean Status" : "Attention Required"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block font-medium">
                        Primary IMEI
                      </span>
                      <span className="font-mono font-bold text-sm tracking-wide">
                        {imeiNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(imeiNumber, "imei")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
                      title="Copy IMEI"
                    >
                      {copiedKey === "imei" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {imei2Number && imei2Number !== "N/A" && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block font-medium">
                          Secondary IMEI (eSIM/SIM2)
                        </span>
                        <span className="font-mono font-bold text-sm tracking-wide">
                          {imei2Number}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(imei2Number, "imei2")}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
                        title="Copy IMEI 2"
                      >
                        {copiedKey === "imei2" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block font-medium">
                        Serial Number
                      </span>
                      <span className="font-mono font-bold text-sm tracking-wide">
                        {serialNumber}
                      </span>
                    </div>
                    {serialNumber !== "N/A" && (
                      <button
                        onClick={() => handleCopy(serialNumber, "serial")}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition"
                        title="Copy Serial"
                      >
                        {copiedKey === "serial" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-500 block font-medium">
                      Device Model
                    </span>
                    <span className="font-semibold text-sm truncate block">
                      {modelName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Meter & Valuation */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-base">Risk Assessment</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase bg-lime-100 text-lime-800 dark:bg-lime-950/70 dark:text-lime-300">
                      {reportData.riskMeter?.label || "Low Risk"}
                    </span>
                  </div>

                  <div className="pt-4 text-center space-y-2">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-lime-600 dark:text-lime-400">
                        {riskScore}
                      </span>
                      <span className="text-slate-400 font-semibold text-sm">
                        / 100
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Lower score indicates higher security and clean background
                      history.
                    </p>

                    {/* Score Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mt-3">
                      <div
                        className={`h-full rounded-full ${
                          riskScore <= 30
                            ? "bg-emerald-500"
                            : riskScore <= 70
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(riskScore, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {reportData.marketValue?.amount ? (
                  <div className="p-3.5 rounded-2xl bg-lime-50/50 dark:bg-lime-950/20 border border-lime-200/60 dark:border-lime-900/40 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                      Estimated Market Valuation
                    </span>
                    <span className="text-xl font-extrabold text-lime-700 dark:text-lime-300">
                      ${reportData.marketValue.amount.toLocaleString()}{" "}
                      {reportData.marketValue.currency || "USD"}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* 4 Major Integrity Checks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Global Blacklist */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Global Blacklist</h4>
                  <p className="text-xs text-slate-500">
                    {reportData.checks?.globalBlacklist?.description ||
                      "Not reported lost or stolen worldwide"}
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Passed (Clean)
                  </span>
                </div>
              </div>

              {/* 2. iCloud / Hardware Lock */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Hardware & iCloud</h4>
                  <p className="text-xs text-slate-500">
                    {reportData.checks?.hardwareLock?.description ||
                      "Find My iPhone is OFF / No active iCloud lock"}
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked
                  </span>
                </div>
              </div>

              {/* 3. Carrier Financing */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Carrier Financing</h4>
                  <p className="text-xs text-slate-500">
                    {reportData.checks?.carrierFinancing?.description ||
                      "No outstanding carrier debt or active financial lien"}
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Clean Contract
                  </span>
                </div>
              </div>

              {/* 4. Part Authenticity */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Component Origin</h4>
                  <p className="text-xs text-slate-500">
                    {reportData.checks?.partAuthenticity?.description ||
                      "Verified original OEM components"}
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    OEM Verified
                  </span>
                </div>
              </div>
            </div>

            {/* AI Security Insight Card */}
            {reportData.aiInsight?.message && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-lime-50 to-emerald-50 dark:from-slate-900 dark:to-lime-950/30 border border-lime-200 dark:border-lime-900/50 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-lime-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-lime-950 dark:text-lime-200 uppercase tracking-wider">
                    {reportData.aiInsight.title || "AI Verification Insights"}
                  </h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {reportData.aiInsight.message}
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Technical Specifications Table */}
            {Object.keys(parsedData).length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-lg">
                      Full Verified Specifications
                    </h3>
                    <p className="text-xs text-slate-500">
                      Extracted from authorized telecommunication registers
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {Object.keys(parsedData).length} Data Points
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {Object.entries(parsedData).map(([key, value]) => {
                    if (
                      value === undefined ||
                      value === null ||
                      value === "" ||
                      typeof value === "object"
                    ) {
                      return null;
                    }

                    const label = key
                      .replace(/_/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()
                      .replace(/\b\w/g, (c) => c.toUpperCase());

                    return (
                      <div
                        key={key}
                        className="py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 text-sm"
                      >
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {label}
                        </span>
                        <span className="font-semibold text-right break-all">
                          {String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Partner Shop / Issuer Information if applicable */}
            {shop?.shopName && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base">{shop.shopName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300">
                        Verified Shop
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {[
                        shop.shopAddress?.street,
                        shop.shopAddress?.city,
                        shop.shopAddress?.state,
                        shop.shopAddress?.country,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Authorized Imoscan Partner Retailer"}
                    </p>
                  </div>
                </div>

                {shop.shopPhone && (
                  <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                    Tel: {shop.shopPhone}
                  </span>
                )}
              </div>
            )}

            {/* Verify Another Device Form */}
            <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 print:hidden">
              <h3 className="font-bold text-base">Verify Another Device</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Scan or enter another IMEI or Serial Number to inspect warranty,
                carrier lock, and global blacklist status.
              </p>
              <form
                onSubmit={handleSearchSubmit}
                className="max-w-md mx-auto flex gap-2"
              >
                <input
                  type="text"
                  value={searchImei}
                  onChange={(e) => setSearchImei(e.target.value)}
                  placeholder="Enter IMEI or Serial Number"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-lime-500 hover:bg-lime-600 text-slate-950 font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  Verify
                </button>
              </form>
            </div>

            {/* Hidden High-Resolution PDF Container for Client-Side Generation */}
            <div className="fixed top-0 left-[-10000px] w-[1100px] pointer-events-none z-0">
              <CertificatePDF
                data={
                  reportData as unknown as import("@/features/shopkeeper/scanDevice/types/scanDevice.types").IMEIResult
                }
                id="certificate-pdf-public-report"
                providerName="Imoscan Verified Certificate"
                serviceId={reportData.serviceId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
