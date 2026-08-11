/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Loader2,
  Receipt,
  Copy,
  RefreshCw,
  Clock,
} from "lucide-react";
import { FavouriteIMEIData } from "../../scanDevice/types/scanDevice.types";
import { useEffect, useRef, useState } from "react";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { CertificatePDF } from "./CertificatePDF";
import { SmartInvoicePDF } from "./SmartInvoicePDF";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { saveImeiReportPdfApi } from "../api/scanDevice.api";
import { useCreateInvoice } from "../../inventory/hooks/useInventory";

interface FavouriteResultViewProps {
  scanResult: FavouriteIMEIData;
  imei: string;
  singleReportMeta: { provider?: string; serviceId?: number } | null;
  selectedService?: { name?: string; serviceId?: number | null } | null;
  onBack: () => void;
  onDownload: () => void;
  isDownloading: boolean;
  onRegenerate?: () => void;
}

// Helper function to safely get risk score
const getRiskScoreValue = (riskMeter: any): number => {
  if (typeof riskMeter === "number") return riskMeter;
  if (
    riskMeter &&
    typeof riskMeter === "object" &&
    typeof riskMeter.score === "number"
  )
    return riskMeter.score;
  return 0;
};

export const FavouriteResultView = ({
  scanResult,
  imei,
  singleReportMeta,
  selectedService,
  onBack,
  onDownload,
  isDownloading,
  onRegenerate,
}: FavouriteResultViewProps) => {
  const { status, data: session } = useSession();
  const providerData = scanResult.providerResults;
  const riskScoreValue = getRiskScoreValue(scanResult.riskMeter);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] =
    useState<InvoiceFormData | null>(null);
  const [isInvoiceGenerating, setIsInvoiceGenerating] = useState(false);
  const { downloadCertificatePdf } = useCertificateDownload();
  const savedPdfReportId = useRef<string | null>(null);
  const { mutate: createInvoice } = useCreateInvoice();

  const isOldGenerated = (scanResult as any).oldGenerated === true;

  useEffect(() => {
    const reportId = scanResult.reportId;
    if (
      status !== "authenticated" ||
      !reportId ||
      savedPdfReportId.current === reportId
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void downloadCertificatePdf(
        ["saved-report-pdf-favourite"],
        `IMEI-Report-${imei}.pdf`,
        undefined,
        {
          download: false,
          onPdfReady: async (pdf) => {
            await saveImeiReportPdfApi(reportId, pdf);
            savedPdfReportId.current = reportId;
          },
        },
      ).catch((error) => {
        console.error("Failed to save the visual report PDF:", error);
      });
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [downloadCertificatePdf, imei, scanResult.reportId, status]);

  // Extract values from providerResults
  const deviceName =
    providerData.marketing_name || providerData.model_name || "iPhone";
  const deviceImage = providerData.image?.src || "";
  const deviceId = providerData.deviceid || "";
  const imeiValue =
    providerData.imei || providerData.imei1 || providerData.deviceid || imei;
  const imei2Value = providerData.imei2 || providerData.imei2_number || "";
  const serialNumber = providerData.serial_number || providerData.serial || "";
  const eidNumber = providerData.eid || "";
  const warrantyStatus = providerData.warranty_status || "";
  const purchaseDate = providerData.purchase_date || "";
  const estimatedPurchaseDate = providerData.estimated_purchase_date || "";
  const productionDate = providerData.production_date || "";
  const coverageEndDate =
    providerData.coverage_end_date || providerData.warranty_until || "";
  const coverageStartDate = providerData.coverage_start_date || "";
  const deviceActivation = providerData.device_activation || "";
  const replacedDevice = providerData.replaced_device || "";
  const simlockStatus =
    providerData.simlock || providerData.simlock_status || "";
  const icloudLock = providerData.icloud_lock || "";
  const icloudStatus = providerData.icloud_status || "";
  const manufacturer = providerData.manufacturer || "";
  const operatingSystem = providerData.operating_system || "";
  const deviceConfiguration = providerData.device_configuration || "";
  const modelName = providerData.model_name || "";
  const fullName = providerData.full_name || "";
  const modelNumber = providerData.model_number || "";
  const materialNumber = providerData.material_number || "";
  const basicMaterial = providerData.basic_material || "";
  const doNumber = providerData.do_number || "";
  const applecareDescription = providerData.applecare_description || "";
  const limitedWarranty = providerData.limited_warranty || "";
  const incidentsAvailable = providerData.incidents_available || "";
  const mdmLock = providerData.mdm_lock || "";
  const simpolicyUnlockStatus = providerData.simpolicy_unlock_status || "";
  const activationPolicy =
    providerData.initial_activation_policy_description || "";
  const lockedCarrier = providerData.locked_carrier || "";
  const description = providerData.description || "";
  const carrierName = providerData.carrier || "";
  const salesBuyerCode = providerData.sales_buyer_code || "";
  const salesBuyerName = providerData.sales_buyer_name || "";
  const soldByCountry = providerData.sold_by_country || "";
  const shipToCountry = providerData.ship_to_country || "";
  const soldDate = providerData.sold_date || "";
  const shipDate = providerData.ship_date || "";
  const knoxGuard = providerData.knox_guard || "";
  const blacklistStatus = providerData.blacklist_status || "";
  const attStatus = providerData.att_status || "";
  const marketValueAmount = (scanResult as any).marketValue?.amount;
  const marketValueCurrency =
    (scanResult as any).marketValue?.currency || "USD";
  const marketValue =
    typeof marketValueAmount === "number"
      ? `${marketValueCurrency} ${marketValueAmount}`
      : "";

  const isSimUnlocked = simlockStatus?.toLowerCase() === "unlocked";
  const isICloudUnlocked = icloudLock?.toLowerCase() === "off";
  const isBlacklistClean = icloudStatus?.toLowerCase() === "clean";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr;
  };

  const handleCopyToClipboard = () => {
    const textToCopy = `
Model: ${deviceName}
${deviceId ? `Device ID: ${deviceId}` : ""}
IMEI: ${imeiValue}
${imei2Value ? `IMEI2: ${imei2Value}` : ""}
${serialNumber ? `Serial Number: ${serialNumber}` : ""}
${eidNumber ? `EID: ${eidNumber}` : ""}
${manufacturer ? `Manufacturer: ${manufacturer}` : ""}
${operatingSystem ? `Operating System: ${operatingSystem}` : ""}
${deviceConfiguration ? `Device Configuration: ${deviceConfiguration}` : ""}
Model Name: ${modelName}
${fullName ? `Full Name: ${fullName}` : ""}
${modelNumber ? `Model Number: ${modelNumber}` : ""}
Material Number: ${materialNumber}
Basic Material: ${basicMaterial}
${doNumber ? `DO Number: ${doNumber}` : ""}
Description: ${description}
${warrantyStatus ? `Warranty Status: ${warrantyStatus}` : ""}
${limitedWarranty ? `Limited Warranty: ${limitedWarranty}` : ""}
${formatDate(purchaseDate) ? `Purchase Date: ${formatDate(purchaseDate)}` : ""}
${productionDate ? `Production Date: ${formatDate(productionDate)}` : ""}
${formatDate(coverageStartDate) ? `Coverage Start Date: ${formatDate(coverageStartDate)}` : ""}
${formatDate(coverageEndDate) ? `Coverage End Date: ${formatDate(coverageEndDate)}` : ""}
${deviceActivation ? `Device Activation: ${deviceActivation}` : ""}
AppleCare Description: ${applecareDescription}
${incidentsAvailable ? `Incidents Available: ${incidentsAvailable}` : ""}
${carrierName ? `Carrier: ${carrierName}` : ""}
${salesBuyerCode ? `Sales Buyer Code: ${salesBuyerCode}` : ""}
${salesBuyerName ? `Sales Buyer Name: ${salesBuyerName}` : ""}
${soldByCountry ? `Sold By Country: ${soldByCountry}` : ""}
${shipToCountry ? `Ship To Country: ${shipToCountry}` : ""}
${soldDate ? `Sold Date: ${formatDate(soldDate)}` : ""}
${shipDate ? `Ship Date: ${formatDate(shipDate)}` : ""}
${knoxGuard ? `Knox Guard: ${knoxGuard}` : ""}
${blacklistStatus ? `Blacklist Status: ${blacklistStatus}` : ""}
${attStatus ? `AT&T Status: ${attStatus}` : ""}
${marketValue ? `Price: ${marketValue}` : ""}
${icloudLock ? `Find My iPhone: ${isICloudUnlocked ? "OFF" : "ON"}` : ""}
${icloudStatus ? `iCloud Status: ${isBlacklistClean ? "CLEAN" : "FLAGGED"}` : ""}
${icloudLock ? `iCloud Lock: ${icloudLock}` : ""}
${simlockStatus ? `SIM Lock Status: ${simlockStatus}` : ""}
${mdmLock ? `MDM Lock: ${mdmLock}` : ""}
${simpolicyUnlockStatus ? `SIM Policy Unlock: ${simpolicyUnlockStatus}` : ""}
${activationPolicy ? `Activation Policy: ${activationPolicy}` : ""}
${lockedCarrier ? `Locked Carrier: ${lockedCarrier}` : ""}
${replacedDevice ? `Replaced Device: ${replacedDevice}` : ""}
Risk Score: ${riskScoreValue}/100
AI Insight: ${scanResult.aiInsight?.message || "N/A"}
    `.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (onRegenerate) {
      setIsRegenerating(true);
      try {
        await onRegenerate();
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  const handleGenerateInvoice = async (formData: InvoiceFormData) => {
    setIsInvoiceGenerating(true);
    setInvoiceFormData(formData);
    setIsInvoiceModalOpen(false);

    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      let invoiceBlob: Blob | undefined;
      await downloadCertificatePdf(
        ["smart-invoice-pdf-container-fav"],
        `Invoice_${imei}.pdf`,
        undefined,
        {
          download: true,
          onPdfReady: (pdf) => {
            invoiceBlob = pdf;
          },
        },
      );

      if (invoiceBlob && formData.customerId) {
        const file = new File([invoiceBlob], `invoice_${imei}.pdf`, {
          type: "application/pdf",
        });
        const shopkeeperId =
          (session?.user as any)?.shopkeeperId ||
          (session?.user as any)?.id ||
          "unknown";

        createInvoice({
          shopkeeperId,
          customerInfo: formData.customerId,
          type: "Smart invoice",
          invoice: file,
          totalAmount: formData.price,
          dueAmount: formData.paymentStatus === "paid" ? 0 : formData.price,
          amountPaid: formData.paymentStatus === "paid" ? formData.price : 0,
          paymentMethod: formData.paymentMethod,
          paymentStatus: formData.paymentStatus === "paid" ? "paid" : "due",
        });
      }
    } catch (error) {
      console.error("Invoice generation failed:", error);
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to favourites
        </button>

        {/* Regenerate Warning */}
        {isOldGenerated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-[32px] p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Cached Data Notice
                </p>
                <p className="text-xs text-amber-700">
                  From a previous report. Generate fresh for latest data.
                </p>
              </div>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 flex-shrink-0 transition"
            >
              {isRegenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {isRegenerating ? "Generating..." : "Generate New"}
            </button>
          </motion.div>
        )}

        {/* Main Card - Same design for mobile and desktop */}
        <div
          id="saved-report-pdf-favourite"
          className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-[32px] p-5 shadow-sm relative"
        >
          <div className="space-y-3 text-center text-[14px] text-[#5F6368] dark:text-muted-foreground leading-relaxed">
            <p>
              <span className="font-semibold">Service:</span>{" "}
              {scanResult.bundledServiceName}
            </p>

            <div className="border-t border-slate-100 dark:border-border pt-2 mt-1"></div>

            {deviceImage && (
              <div className="flex justify-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted">
                  <Image
                    src={deviceImage}
                    alt={deviceName}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            )}

            <p>
              <span className="font-semibold">Model:</span> {deviceName}
            </p>
            {marketValue && (
              <p>
                <span className="font-semibold">Price:</span> {marketValue}
              </p>
            )}
            <p>
              <span className="font-semibold">IMEI:</span> {imeiValue}
            </p>
            {imei2Value && (
              <p>
                <span className="font-semibold">IMEI2:</span> {imei2Value}
              </p>
            )}
            {deviceId && (
              <p>
                <span className="font-semibold">Device ID:</span> {deviceId}
              </p>
            )}
            {serialNumber && (
              <p>
                <span className="font-semibold">Serial Number:</span>{" "}
                {serialNumber}
              </p>
            )}
            {eidNumber && (
              <p className="break-all">
                <span className="font-semibold">EID:</span> {eidNumber}
              </p>
            )}

            {manufacturer && (
              <p>
                <span className="font-semibold">Manufacturer:</span>{" "}
                {manufacturer}
              </p>
            )}
            {operatingSystem && (
              <p>
                <span className="font-semibold">Operating System:</span>{" "}
                {operatingSystem}
              </p>
            )}
            {modelName && (
              <p>
                <span className="font-semibold">Model Name:</span> {modelName}
              </p>
            )}
            {deviceConfiguration && (
              <p>
                <span className="font-semibold">Device Configuration:</span>{" "}
                {deviceConfiguration}
              </p>
            )}
            {fullName && (
              <p>
                <span className="font-semibold">Full Name:</span> {fullName}
              </p>
            )}
            {modelNumber && (
              <p>
                <span className="font-semibold">Model Number:</span>{" "}
                {modelNumber}
              </p>
            )}
            {materialNumber && (
              <p>
                <span className="font-semibold">Material Number:</span>{" "}
                {materialNumber}
              </p>
            )}
            {basicMaterial && (
              <p>
                <span className="font-semibold">Basic Material:</span>{" "}
                {basicMaterial}
              </p>
            )}
            {doNumber && (
              <p>
                <span className="font-semibold">DO Number:</span> {doNumber}
              </p>
            )}
            {description && (
              <p>
                <span className="font-semibold">Description:</span>{" "}
                {description}
              </p>
            )}

            <div className="border-t border-slate-100 dark:border-border pt-2 mt-1"></div>

            {warrantyStatus && (
              <p>
                <span className="font-semibold">Warranty:</span>{" "}
                {warrantyStatus}
              </p>
            )}
            {limitedWarranty && (
              <p>
                <span className="font-semibold">Limited Warranty:</span>{" "}
                {limitedWarranty}
              </p>
            )}
            {(purchaseDate || estimatedPurchaseDate) && (
              <p>
                <span className="font-semibold">Purchase Date:</span>{" "}
                {formatDate(purchaseDate || estimatedPurchaseDate)}
              </p>
            )}
            {productionDate && (
              <p>
                <span className="font-semibold">Production Date:</span>{" "}
                {formatDate(productionDate)}
              </p>
            )}
            {coverageStartDate && (
              <p>
                <span className="font-semibold">Coverage Start:</span>{" "}
                {formatDate(coverageStartDate)}
              </p>
            )}
            {coverageEndDate && (
              <p>
                <span className="font-semibold">Coverage End:</span>{" "}
                {formatDate(coverageEndDate)}
              </p>
            )}
            {deviceActivation && (
              <p>
                <span className="font-semibold">Device Activation:</span>{" "}
                {deviceActivation === "No" ? "Not Activated" : deviceActivation}
              </p>
            )}
            {applecareDescription && (
              <p>
                <span className="font-semibold">AppleCare:</span>{" "}
                {applecareDescription}
              </p>
            )}
            {incidentsAvailable && (
              <p>
                <span className="font-semibold">Incidents Available:</span>{" "}
                {incidentsAvailable}
              </p>
            )}
            {carrierName && (
              <p>
                <span className="font-semibold">Carrier:</span> {carrierName}
              </p>
            )}
            {salesBuyerCode && (
              <p>
                <span className="font-semibold">Sales Buyer Code:</span>{" "}
                {salesBuyerCode}
              </p>
            )}
            {salesBuyerName && (
              <p>
                <span className="font-semibold">Sales Buyer Name:</span>{" "}
                {salesBuyerName}
              </p>
            )}
            {soldByCountry && (
              <p>
                <span className="font-semibold">Sold By Country:</span>{" "}
                {soldByCountry}
              </p>
            )}
            {shipToCountry && (
              <p>
                <span className="font-semibold">Ship To Country:</span>{" "}
                {shipToCountry}
              </p>
            )}
            {soldDate && (
              <p>
                <span className="font-semibold">Sold Date:</span>{" "}
                {formatDate(soldDate)}
              </p>
            )}
            {shipDate && (
              <p>
                <span className="font-semibold">Ship Date:</span>{" "}
                {formatDate(shipDate)}
              </p>
            )}

            <div className="border-t border-slate-100 dark:border-border pt-2 mt-1"></div>

            {icloudLock && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Find My iPhone:</span>
                <span
                  className={`${!isICloudUnlocked ? "bg-[#F44336]" : "bg-[#4CAF50]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold`}
                >
                  {!isICloudUnlocked ? "ON" : "OFF"}
                </span>
              </div>
            )}

            {icloudStatus && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">iCloud Status:</span>
                <span
                  className={`${isBlacklistClean ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
                >
                  {isBlacklistClean ? "CLEAN" : "FLAGGED"}
                </span>
              </div>
            )}

            {icloudLock && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">iCloud Lock:</span>
                <span
                  className={`${isICloudUnlocked ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
                >
                  {icloudLock}
                </span>
              </div>
            )}

            {simlockStatus && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">SIM-Lock:</span>
                <span
                  className={`${isSimUnlocked ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
                >
                  {simlockStatus}
                </span>
              </div>
            )}

            {mdmLock && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">MDM Lock:</span>
                <span
                  className={`${mdmLock === "OFF" ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
                >
                  {mdmLock}
                </span>
              </div>
            )}

            {simpolicyUnlockStatus && (
              <p>
                <span className="font-semibold">SIM Policy Unlock:</span>{" "}
                {simpolicyUnlockStatus}
              </p>
            )}
            {activationPolicy && (
              <p>
                <span className="font-semibold">Activation Policy:</span>{" "}
                {activationPolicy}
              </p>
            )}
            {lockedCarrier && (
              <p>
                <span className="font-semibold">Locked Carrier:</span>{" "}
                {lockedCarrier}
              </p>
            )}
            {knoxGuard && (
              <p>
                <span className="font-semibold">Knox Guard:</span> {knoxGuard}
              </p>
            )}
            {blacklistStatus && (
              <p>
                <span className="font-semibold">Blacklist Status:</span>{" "}
                {blacklistStatus}
              </p>
            )}
            {attStatus && (
              <p>
                <span className="font-semibold">AT&T Status:</span> {attStatus}
              </p>
            )}
            {replacedDevice && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="font-semibold">Replaced by Apple:</span>
                <span
                  className={`${replacedDevice === "No" ? "bg-[#4CAF50]" : "bg-[#F44336]"} text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase`}
                >
                  {replacedDevice === "No" ? "NO" : replacedDevice}
                </span>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-border pt-2 mt-1"></div>

            {/* Risk Meter Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Risk Level:</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${
                    riskScoreValue <= 25
                      ? "bg-emerald-500"
                      : riskScoreValue <= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                >
                  {riskScoreValue <= 25
                    ? "LOW"
                    : riskScoreValue <= 60
                      ? "MODERATE"
                      : "HIGH"}{" "}
                  RISK
                </span>
              </div>
              <div>
                <span className="font-semibold">Risk Score:</span>{" "}
                {riskScoreValue}/100
              </div>
              <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${riskScoreValue <= 25 ? "bg-emerald-500" : riskScoreValue <= 60 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${riskScoreValue}%` }}
                />
              </div>
            </div>

            {/* AI Insight Section */}
            {scanResult.aiInsight && (
              <div className="border-t border-slate-100 dark:border-border pt-3 mt-2">
                <p className="font-semibold mb-1">AI Insight:</p>
                <p className="text-sm italic text-slate-600 dark:text-slate-300">
                  {scanResult.aiInsight.message}
                </p>
              </div>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyToClipboard}
            className="absolute bottom-4 right-4 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <Copy size={22} />
          </button>

          {/* Copied Notification */}
          {copied && (
            <div className="absolute top-3 right-3 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
              Copied!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 flex-col sm:flex-row">
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            disabled={isInvoiceGenerating}
            className="flex-1 py-2.5 px-4 rounded-xl border-2 border-[#84CC16] text-[#84CC16] font-bold text-sm flex items-center justify-center gap-2 hover:bg-lime-50 dark:hover:bg-lime-950/30 transition disabled:opacity-50"
          >
            {isInvoiceGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Receipt size={14} />
            )}
            Create Smart Invoice
          </button>
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#84CC16] text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            {isDownloading ? "Generating..." : "Download PDF Certificate"}
          </button>
        </div>
      </div>

      {/* Hidden PDF Containers */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "-10000px",
          width: "1100px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <CertificatePDF
          data={
            {
              ...scanResult,
              imei: imeiValue,
              deviceName: deviceName,
              parsedProviderData: providerData,
              providerData: providerData,
              riskMeter: {
                score: riskScoreValue,
                label:
                  riskScoreValue <= 25
                    ? "LOW RISK"
                    : riskScoreValue <= 60
                      ? "MODERATE RISK"
                      : "HIGH RISK",
              },
            } as any
          }
          id="certificate-pdf-favourite"
          providerName={
            singleReportMeta?.provider ||
            selectedService?.name ||
            scanResult.bundledServiceName
          }
          serviceId={
            singleReportMeta?.serviceId ??
            selectedService?.serviceId ??
            scanResult.bundledServiceId
          }
        />
        {invoiceFormData && (
          <SmartInvoicePDF
            data={
              {
                ...scanResult,
                imei: imeiValue,
                deviceName: deviceName,
                parsedProviderData: providerData,
                providerData: providerData,
                riskMeter: {
                  score: riskScoreValue,
                  label:
                    riskScoreValue <= 25
                      ? "LOW RISK"
                      : riskScoreValue <= 60
                        ? "MODERATE RISK"
                        : "HIGH RISK",
                },
              } as any
            }
            id="smart-invoice-pdf-container-fav"
            invoiceData={invoiceFormData}
            shopkeeperDetails={(session?.user as any)?.shopkeeper}
          />
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onGenerate={handleGenerateInvoice}
        scanResult={scanResult as any}
        isGenerating={isInvoiceGenerating}
      />
    </div>
  );
};
