/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import {
  ChevronDown,
  Download,
  Loader2,
  Receipt,
  Copy,
  RefreshCw,
  Clock,
  Shield,
  Gauge,
  Tag,
  ArrowLeft,
  XCircle,
} from "lucide-react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CertificatePDF } from "./CertificatePDF";
import { SmartInvoicePDF } from "./SmartInvoicePDF";
import { InvoiceModal, InvoiceFormData } from "./InvoiceModal";
import { useCertificateDownload } from "../hooks/useCertificateDownload";
import { useCreateInvoice } from "../../inventory/hooks/useInventory";
import {
  BatchImeiResponse,
  BatchImeiItemResult,
} from "../../scanDevice/types/scanDevice.types";
import { toast } from "sonner";

interface BulkResultViewProps {
  batchResult: BatchImeiResponse | null;
  onClear: () => void;
  onBack: () => void;
  onDownloadCertificate: (
    elementIds: string[],
    filename: string,
  ) => Promise<void>;
  isDownloading: boolean;
  onRegenerateItem?: (imei: string, serviceId: number) => Promise<void>;
}

// Constants
const DEFAULT_SERVICE_ID = 6;
const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 60,
};

// Helper functions
const formatDate = (dateStr: string | undefined | null): string => {
  if (!dateStr || dateStr === "N/A") return "N/A";

  try {
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{2}$/)) {
      const [day, month, year] = dateStr.split("/");
      const date = new Date(
        2000 + parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
      );
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (dateStr.match(/^[A-Za-z]+ \d{1,2}, \d{4}$/)) {
      return dateStr;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

const getRiskColor = (score: number): string => {
  if (score <= RISK_THRESHOLDS.LOW) return "bg-emerald-500";
  if (score <= RISK_THRESHOLDS.MEDIUM) return "bg-amber-500";
  return "bg-red-500";
};

const getRiskBadgeColor = (score: number): string => {
  if (score <= RISK_THRESHOLDS.LOW) return "bg-emerald-100 text-emerald-700";
  if (score <= RISK_THRESHOLDS.MEDIUM) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

const getRiskLabel = (score: number): string => {
  if (score <= RISK_THRESHOLDS.LOW) return "Low Risk";
  if (score <= RISK_THRESHOLDS.MEDIUM) return "Moderate Risk";
  return "High Risk";
};

// Extract device data from a single batch item - UPDATED with all missing fields
const extractBatchDeviceData = (item: BatchImeiItemResult | null) => {
  if (!item || !item.ok || !item.data) {
    return {
      hasError: true,
      errorMessage: item?.message || "No data available",
      isEmpty: true,
      deviceName: "Unknown",
      deviceId: "",
      imeiValue: item?.imei || "",
      imei2Value: "",
      meidValue: "",
      serialNumber: "N/A",
      eidNumber: "N/A",
      warrantyStatus: "N/A",
      coverageStatus: "",
      purchaseDate: "N/A",
      productionDate: "",
      coverageEndDate: "N/A",
      coverageStartDate: "",
      notice: "",
      replacedDevice: "No",
      activationStatus: "N/A",
      coverageBenefits: "",
      registrationStatus: "",
      tempCoverage: "",
      openRepair: "",
      serialKey: "",
      iCloudLock: "N/A",
      iCloudStatus: "N/A",
      mdmLock: "N/A",
      unlockStatus: "N/A",
      simlockStatus: "N/A",
      simlock: "",
      carrierName: "N/A",
      sim1Carrier: "",
      manufacturer: "",
      fullName: "",
      productDescription: "",
      modelNumber: "N/A",
      partNumber: "N/A",
      doNumber: "",
      partCountry: "",
      capacity: "",
      color: "",
      limitedWarranty: "",
      incidentsAvailable: "",
      initialUnbrick: "",
      productVersion: "",
      soldToName: "",
      salesBuyerCode: "",
      salesBuyerName: "",
      soldByCountry: "",
      shipToCountry: "",
      purchaseCountry: "",
      purchaseCountryCode: "",
      soldDate: "",
      shipDate: "",
      gsxReplacementHistory: "",
      initialActivationPolicyDescription: "",
      lastActivationPolicyDescription: "",
      nextActivationPolicyDescription: "",
      nextTetherPolicy: "",
      knoxGuard: "",
      blacklistStatus: "",
      attStatus: "",
      errorR01: "",
      riskScore: 0,
      riskLevel: "N/A",
      marketValue: "",
      image: null,
      aiInsight: null,
      provider: null,
      oldGenerated: false,
      parsedProviderData: {},
    };
  }

  const mainData = item.data;
  const parsedProviderData = (mainData as any)?.parsedProviderData || {};
  const riskMeterData = (mainData as any)?.riskMeter || {};

  // Handle different riskMeter formats
  let riskScore = 0;
  let riskLevel = "N/A";

  if (typeof riskMeterData === "number") {
    riskScore = riskMeterData;
    riskLevel =
      riskScore <= RISK_THRESHOLDS.LOW
        ? "low"
        : riskScore <= RISK_THRESHOLDS.MEDIUM
          ? "medium"
          : "high";
  } else if (typeof riskMeterData === "object" && riskMeterData !== null) {
    riskScore = riskMeterData.score || riskMeterData.riskMeter || 0;
    riskLevel =
      riskMeterData.riskLevel ||
      (riskScore <= RISK_THRESHOLDS.LOW
        ? "low"
        : riskScore <= RISK_THRESHOLDS.MEDIUM
          ? "medium"
          : "high");
  }

  const provider = (mainData as any)?.provider || null;
  const oldGenerated = (mainData as any)?.oldGenerated === true;

  // Basic device info
  const deviceName =
    parsedProviderData.device ||
    parsedProviderData.model_name ||
    parsedProviderData.model ||
    parsedProviderData.marketing_name ||
    parsedProviderData.product_description?.split(",")[0] ||
    parsedProviderData.device_configuration?.split(" ")[0] ||
    "iPhone";

  const deviceId =
    parsedProviderData.deviceid || parsedProviderData.device_id || "";
  const manufacturer = parsedProviderData.manufacturer || "";
  const fullName = parsedProviderData.full_name || "";
  const deviceConfiguration = parsedProviderData.device_configuration || "";
  const marketValueAmount = (mainData as any)?.marketValue?.amount;
  const marketValueCurrency = (mainData as any)?.marketValue?.currency || "USD";
  const marketValue =
    typeof marketValueAmount === "number"
      ? `${marketValueCurrency} ${marketValueAmount}`
      : parsedProviderData.price || "";

  // Identifiers
  const imeiValue =
    parsedProviderData.imei_number ||
    parsedProviderData.imei1 ||
    parsedProviderData.imei ||
    parsedProviderData.deviceid ||
    item.imei ||
    "";
  const imei2Value =
    parsedProviderData.imei2_number ||
    parsedProviderData.imei2 ||
    parsedProviderData.imei_2 ||
    "";
  const meidValue =
    parsedProviderData.meid_number || parsedProviderData.meid || "";
  const serialNumber =
    parsedProviderData.serial_number ||
    parsedProviderData.serial ||
    parsedProviderData.sn ||
    "N/A";
  const serialKey = parsedProviderData.serial_key || "";
  const eidNumber =
    parsedProviderData.eid || parsedProviderData.csncsn2eid || "N/A";

  // Warranty & Coverage
  let warrantyStatus =
    parsedProviderData.warranty_type ||
    parsedProviderData.warranty_status ||
    "N/A";
  const coverageStatus = parsedProviderData.coverage_status || "";
  const limitedWarranty = parsedProviderData.limited_warranty || "";
  const incidentsAvailable = parsedProviderData.incidents_available || "";

  if (parsedProviderData.warranty_status_code === "LP")
    warrantyStatus = "Limited Warranty";
  if (parsedProviderData.applecare_covered === "Yes")
    warrantyStatus = "AppleCare+";

  const purchaseDate =
    parsedProviderData.estimated_purchase_date ||
    parsedProviderData.purchase_date ||
    "N/A";
  const productionDate = parsedProviderData.production_date || "";
  let coverageEndDate =
    parsedProviderData.warranty_expires ||
    parsedProviderData.warranty_until ||
    parsedProviderData.coverage_end_date ||
    "N/A";
  if (parsedProviderData.repairs_and_service_expiration_date)
    coverageEndDate = parsedProviderData.repairs_and_service_expiration_date;

  const coverageStartDate = parsedProviderData.coverage_start_date || "";
  const applecareDescription = parsedProviderData.applecare_description || "";
  const initialUnbrick = parsedProviderData.initial_unbrick || "";
  const productVersion = parsedProviderData.product_version || "";

  // Notice
  const notice = parsedProviderData.notice || "";

  // Status Flags
  const replacedDevice =
    parsedProviderData.replaced_device === "Yes" ? "Yes" : "No";
  const activationStatus =
    parsedProviderData.activation_status ||
    (parsedProviderData.device_activation === "No"
      ? "Not Activated"
      : "Activated") ||
    "Activated";
  const deviceActivation = parsedProviderData.device_activation || "";
  const coverageBenefits =
    parsedProviderData.coverage_benefits ||
    parsedProviderData.applecare_description ||
    "";

  let registrationStatus = parsedProviderData.registration_status || "";
  if (registrationStatus === "Yes") registrationStatus = "Registered";
  if (parsedProviderData.icloud_status === "CLEAN")
    registrationStatus = "Clean";

  const tempCoverage =
    parsedProviderData.temp_coverage === "Yes" ? "Yes" : "No";
  const openRepair = parsedProviderData.open_repair === "Yes" ? "Yes" : "No";

  // Lock Status
  let iCloudLock = "N/A";
  if (parsedProviderData.icloud_lock === "ON") iCloudLock = "Locked";
  if (parsedProviderData.icloud_lock === "OFF") iCloudLock = "Unlocked";

  const iCloudStatus = parsedProviderData.icloud_status || "N/A";

  let mdmLock = "N/A";
  if (parsedProviderData.mdm_lock === "ON") mdmLock = "Locked";
  if (parsedProviderData.mdm_lock === "OFF") mdmLock = "Unlocked";

  const simlockStatus = parsedProviderData.simlock_status || "N/A";
  const simlock =
    parsedProviderData.simlock || parsedProviderData.sim_lock || "";

  // Unlock Status
  let unlockStatus = "N/A";
  if (parsedProviderData.simpolicy_unlock_status) {
    unlockStatus = parsedProviderData.simpolicy_unlock_status;
  } else if (
    parsedProviderData.initial_activation_policy_description?.includes("UNLOCK")
  ) {
    unlockStatus = "UNLOCKED";
  } else if (
    parsedProviderData.last_activation_policy_description?.includes("UNLOCK")
  ) {
    unlockStatus = "UNLOCKED";
  } else if (parsedProviderData.simlock_status === "Unlocked") {
    unlockStatus = "UNLOCKED";
  } else if (parsedProviderData.locked_carrier === "10 - Unlock") {
    unlockStatus = "UNLOCKED";
  }

  // Carrier & Network
  const carrierName =
    parsedProviderData.carrier_name || parsedProviderData.carrier || "N/A";
  const sim1Carrier =
    parsedProviderData.sim1_carrier || parsedProviderData.carrier || "";

  // Product Info
  const productDescription =
    parsedProviderData.product_description ||
    parsedProviderData.config_description ||
    "";
  const materialNumber = parsedProviderData.material_number || "";
  const basicMaterial = parsedProviderData.basic_material || "";
  const modelNumber =
    parsedProviderData.model_number ||
    parsedProviderData.basic_material ||
    "N/A";
  const partNumber =
    parsedProviderData.part_number ||
    parsedProviderData.do_number ||
    parsedProviderData.material_number ||
    "N/A";
  const doNumber = parsedProviderData.do_number || "";
  const partCountry = parsedProviderData.part_country || "";

  // Capacity & Color
  let capacity = parsedProviderData.capacity || "";
  if (productDescription.includes("256GB")) capacity = "256GB";
  if (productDescription.includes("128GB")) capacity = "128GB";
  if (productDescription.includes("512GB")) capacity = "512GB";

  let color = "";
  if (productDescription.includes("DBLUE")) color = "Deep Blue";
  if (productDescription.includes("BLU")) color = "Blue";

  // Purchase Info
  const soldToName =
    parsedProviderData.sold_to_name ||
    parsedProviderData.sales_buyer_name ||
    "";
  const salesBuyerCode = parsedProviderData.sales_buyer_code || "";
  const salesBuyerName = parsedProviderData.sales_buyer_name || "";
  const soldByCountry = parsedProviderData.sold_by_country || "";
  const shipToCountry = parsedProviderData.ship_to_country || "";
  const purchaseCountry =
    parsedProviderData.purchase_country_desc ||
    parsedProviderData.sold_by_country ||
    "";
  const purchaseCountryCode = parsedProviderData.purchase_country_code || "";
  const soldDate = parsedProviderData.sold_date || "";
  const shipDate = parsedProviderData.ship_date || "";

  // GSX Replacement History
  const gsxReplacementHistory =
    parsedProviderData.gsx_replacement_history || "";

  // Activation Policies
  const initialActivationPolicyDescription =
    parsedProviderData.initial_activation_policy_description || "";
  const lastActivationPolicyDescription =
    parsedProviderData.last_activation_policy_description || "";
  const nextActivationPolicyDescription =
    parsedProviderData.next_activation_policy_description || "";
  const nextTetherPolicy =
    parsedProviderData.next_tether_policy_details ||
    parsedProviderData.next_tether_policy_id ||
    "";

  // Image
  const image = parsedProviderData.image?.src || null;
  const knoxGuard = parsedProviderData.knox_guard || "";
  const blacklistStatus = parsedProviderData.blacklist_status || "";
  const attStatus = parsedProviderData.att_status || "";
  const errorR01 = parsedProviderData.error_r01 || "";

  // AI Insight
  const aiInsight = (mainData as any)?.aiInsight || null;

  return {
    hasError: false,
    errorMessage: "",
    isEmpty: false,
    deviceName,
    deviceId,
    deviceConfiguration,
    imeiValue,
    imei2Value,
    meidValue,
    serialNumber,
    eidNumber,
    warrantyStatus,
    coverageStatus,
    purchaseDate,
    productionDate,
    coverageEndDate,
    coverageStartDate,
    applecareDescription,
    notice,
    replacedDevice,
    activationStatus,
    deviceActivation,
    coverageBenefits,
    registrationStatus,
    tempCoverage,
    openRepair,
    serialKey,
    iCloudLock,
    iCloudStatus,
    mdmLock,
    unlockStatus,
    simlockStatus,
    simlock,
    carrierName,
    sim1Carrier,
    manufacturer,
    fullName,
    productDescription,
    materialNumber,
    basicMaterial,
    modelNumber,
    partNumber,
    doNumber,
    partCountry,
    capacity,
    color,
    limitedWarranty,
    incidentsAvailable,
    initialUnbrick,
    productVersion,
    soldToName,
    salesBuyerCode,
    salesBuyerName,
    soldByCountry,
    shipToCountry,
    purchaseCountry,
    purchaseCountryCode,
    soldDate,
    shipDate,
    gsxReplacementHistory,
    initialActivationPolicyDescription,
    lastActivationPolicyDescription,
    nextActivationPolicyDescription,
    nextTetherPolicy,
    knoxGuard,
    blacklistStatus,
    attStatus,
    errorR01,
    riskScore,
    riskLevel,
    marketValue,
    image,
    aiInsight,
    provider,
    oldGenerated,
    parsedProviderData,
  };
};

export const BulkResultView = ({
  batchResult,
  onClear,
  onDownloadCertificate,
  isDownloading,
  onBack,
  onRegenerateItem,
}: BulkResultViewProps) => {
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceFormData, setInvoiceFormData] =
    useState<InvoiceFormData | null>(null);
  const [isInvoiceGenerating, setIsInvoiceGenerating] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const { status, data: session } = useSession();
  const isGuest = status === "unauthenticated";
  const { downloadCertificatePdf } = useCertificateDownload();
  const { mutate: createInvoice } = useCreateInvoice();

  const batchRows = useMemo(() => batchResult?.data ?? [], [batchResult]);

  const selectedBatchRow = useMemo(
    () => batchRows[selectedBatchIndex] ?? null,
    [batchRows, selectedBatchIndex],
  );

  // Extract data from selected row
  const extractedData = useMemo(
    () => extractBatchDeviceData(selectedBatchRow),
    [selectedBatchRow],
  );

  const {
    deviceName,
    deviceId,
    deviceConfiguration,
    imeiValue,
    imei2Value,
    meidValue,
    serialNumber,
    eidNumber,
    warrantyStatus,
    coverageStatus,
    purchaseDate,
    productionDate,
    coverageEndDate,
    coverageStartDate,
    applecareDescription,
    notice,
    replacedDevice,
    activationStatus,
    deviceActivation,
    coverageBenefits,
    registrationStatus,
    tempCoverage,
    openRepair,
    serialKey,
    iCloudLock,
    iCloudStatus,
    mdmLock,
    unlockStatus,
    simlockStatus,
    simlock,
    carrierName,
    sim1Carrier,
    manufacturer,
    fullName,
    productDescription,
    materialNumber,
    basicMaterial,
    modelNumber,
    partNumber,
    doNumber,
    partCountry,
    capacity,
    color,
    limitedWarranty,
    incidentsAvailable,
    initialUnbrick,
    productVersion,
    soldToName,
    salesBuyerCode,
    salesBuyerName,
    soldByCountry,
    shipToCountry,
    purchaseCountry,
    purchaseCountryCode,
    soldDate,
    shipDate,
    gsxReplacementHistory,
    initialActivationPolicyDescription,
    lastActivationPolicyDescription,
    nextActivationPolicyDescription,
    nextTetherPolicy,
    knoxGuard,
    blacklistStatus,
    attStatus,
    errorR01,
    riskScore,
    riskLevel,
    marketValue,
    image,
    aiInsight,
    provider,
    oldGenerated,
    hasError,
    errorMessage,
  } = extractedData;

  // Collect all non-empty fields for display
  const allFields = useMemo(() => {
    const fields: { label: string; value: any; condition?: boolean }[] = [
      // Basic Info
      { label: "Device Name", value: deviceName },
      { label: "Device ID", value: deviceId, condition: !!deviceId },
      {
        label: "Device Configuration",
        value: deviceConfiguration,
        condition: !!deviceConfiguration,
      },
      { label: "Full Name", value: fullName, condition: !!fullName },
      { label: "Manufacturer", value: manufacturer, condition: !!manufacturer },

      // Identifiers
      { label: "IMEI", value: imeiValue },
      { label: "IMEI2", value: imei2Value, condition: !!imei2Value },
      { label: "MEID", value: meidValue, condition: !!meidValue },
      { label: "Serial Number", value: serialNumber },
      { label: "Serial Key", value: serialKey, condition: !!serialKey },
      {
        label: "EID",
        value: eidNumber,
        condition: eidNumber !== "N/A" && !!eidNumber,
      },

      // Product Info
      {
        label: "Product Description",
        value: productDescription,
        condition: !!productDescription,
      },
      {
        label: "Material Number",
        value: materialNumber,
        condition: !!materialNumber,
      },
      {
        label: "Basic Material",
        value: basicMaterial,
        condition: !!basicMaterial,
      },
      {
        label: "Model Number",
        value: modelNumber,
        condition: modelNumber !== "N/A",
      },
      {
        label: "Part Number",
        value: partNumber,
        condition: partNumber !== "N/A",
      },
      { label: "DO Number", value: doNumber, condition: !!doNumber },
      { label: "Part Country", value: partCountry, condition: !!partCountry },
      { label: "Capacity", value: capacity, condition: !!capacity },
      { label: "Color", value: color, condition: !!color },
      {
        label: "Product Version",
        value: productVersion,
        condition: !!productVersion,
      },

      // Warranty & Coverage
      { label: "Warranty Status", value: warrantyStatus },
      {
        label: "Coverage Status",
        value: coverageStatus,
        condition: !!coverageStatus,
      },
      {
        label: "Coverage Start Date",
        value: coverageStartDate ? formatDate(coverageStartDate) : null,
        condition: !!coverageStartDate,
      },
      {
        label: "Coverage End Date",
        value: coverageEndDate !== "N/A" ? formatDate(coverageEndDate) : null,
      },
      {
        label: "Purchase Date",
        value: purchaseDate !== "N/A" ? formatDate(purchaseDate) : null,
      },
      {
        label: "Production Date",
        value: productionDate ? formatDate(productionDate) : null,
        condition: !!productionDate,
      },
      {
        label: "Coverage Benefits",
        value: coverageBenefits,
        condition: !!coverageBenefits,
      },
      {
        label: "AppleCare Description",
        value: applecareDescription,
        condition: !!applecareDescription,
      },
      {
        label: "Limited Warranty",
        value:
          limitedWarranty === "Yes"
            ? "Yes"
            : limitedWarranty === "No"
              ? "No"
              : null,
        condition: !!limitedWarranty,
      },
      {
        label: "Incidents Available",
        value: incidentsAvailable,
        condition: !!incidentsAvailable,
      },
      {
        label: "Initial Unbrick",
        value: initialUnbrick ? formatDate(initialUnbrick) : null,
        condition: !!initialUnbrick,
      },

      // Status
      { label: "Activation Status", value: activationStatus },
      {
        label: "Device Activation",
        value:
          deviceActivation === "No"
            ? "Not Activated"
            : deviceActivation === "Yes"
              ? "Activated"
              : deviceActivation,
        condition: !!deviceActivation,
      },
      {
        label: "Registration Status",
        value: registrationStatus,
        condition: !!registrationStatus,
      },
      {
        label: "Replaced Device",
        value: replacedDevice === "Yes" ? "Yes" : "No",
      },
      { label: "Temp Coverage", value: tempCoverage === "Yes" ? "Yes" : null },
      { label: "Open Repair", value: openRepair === "Yes" ? "Yes" : null },

      // Lock Status
      { label: "iCloud Lock", value: iCloudLock !== "N/A" ? iCloudLock : null },
      {
        label: "iCloud Status",
        value: iCloudStatus !== "N/A" ? iCloudStatus : null,
      },
      { label: "MDM Lock", value: mdmLock !== "N/A" ? mdmLock : null },
      {
        label: "SIM Lock Status",
        value: simlockStatus !== "N/A" ? simlockStatus : null,
      },
      { label: "SIM Lock", value: simlock, condition: !!simlock },
      {
        label: "Unlock Status",
        value: unlockStatus !== "N/A" ? unlockStatus : null,
      },

      // Carrier & Network
      {
        label: "Carrier Name",
        value: carrierName !== "N/A" ? carrierName : null,
      },
      { label: "SIM1 Carrier", value: sim1Carrier, condition: !!sim1Carrier },

      // Purchase Info
      { label: "Sold To", value: soldToName, condition: !!soldToName },
      {
        label: "Sales Buyer Code",
        value: salesBuyerCode,
        condition: !!salesBuyerCode,
      },
      {
        label: "Sales Buyer Name",
        value: salesBuyerName,
        condition: !!salesBuyerName,
      },
      {
        label: "Sold By Country",
        value: soldByCountry,
        condition: !!soldByCountry,
      },
      {
        label: "Ship To Country",
        value: shipToCountry,
        condition: !!shipToCountry,
      },
      {
        label: "Purchase Country",
        value: purchaseCountry || purchaseCountryCode,
        condition: !!(purchaseCountry || purchaseCountryCode),
      },
      {
        label: "Sold Date",
        value: soldDate ? formatDate(soldDate) : null,
        condition: !!soldDate,
      },
      {
        label: "Ship Date",
        value: shipDate ? formatDate(shipDate) : null,
        condition: !!shipDate,
      },

      // GSX History
      {
        label: "GSX Replacement History",
        value: gsxReplacementHistory,
        condition: !!gsxReplacementHistory,
      },

      // Activation Policies
      {
        label: "Initial Activation Policy",
        value: initialActivationPolicyDescription,
        condition: !!initialActivationPolicyDescription,
      },
      {
        label: "Last Activation Policy",
        value: lastActivationPolicyDescription,
        condition: !!lastActivationPolicyDescription,
      },
      {
        label: "Next Activation Policy",
        value: nextActivationPolicyDescription,
        condition: !!nextActivationPolicyDescription,
      },
      {
        label: "Next Tether Policy",
        value: nextTetherPolicy,
        condition: !!nextTetherPolicy,
      },

      // Notice
      { label: "Notice", value: notice, condition: !!notice },
      { label: "Knox Guard", value: knoxGuard, condition: !!knoxGuard },
      {
        label: "Blacklist Status",
        value: blacklistStatus,
        condition: !!blacklistStatus,
      },
      { label: "AT&T Status", value: attStatus, condition: !!attStatus },
      { label: "Error R01", value: errorR01, condition: !!errorR01 },
    ];

    return fields.filter((field) => {
      const hasValue =
        field.value !== null && field.value !== undefined && field.value !== "";
      const conditionMet =
        field.condition !== undefined ? field.condition : true;
      return hasValue && conditionMet;
    });
  }, [extractedData]);

  const visibleFields = showAllFields ? allFields : allFields.slice(0, 15);

  // Generate copy text
  const generateCopyText = useCallback(() => {
    return allFields
      .map((field) => `${field.label}: ${field.value}`)
      .join("\n");
  }, [allFields]);

  const handleCopyToClipboard = useCallback(() => {
    const text = generateCopyText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [generateCopyText]);

  const handleRegenerate = async () => {
    if (onRegenerateItem && selectedBatchRow) {
      setIsRegenerating(true);
      try {
        await onRegenerateItem(
          selectedBatchRow.imei,
          selectedBatchRow.serviceId || DEFAULT_SERVICE_ID,
        );
        toast.success("Report regenerated successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to regenerate report");
      } finally {
        setIsRegenerating(false);
      }
    } else {
      toast.error("Regenerate function not available");
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
        [`smart-invoice-pdf-bulk-${selectedBatchIndex}`],
        `Invoice_${imeiValue}.pdf`,
        undefined,
        {
          download: true,
          onPdfReady: (pdf) => {
            invoiceBlob = pdf;
          },
        },
      );

      if (invoiceBlob && formData.customerId) {
        const file = new File([invoiceBlob], `invoice_${imeiValue}.pdf`, {
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

      toast.success("Invoice generated successfully!");
    } catch (error) {
      console.error("Invoice generation failed:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsInvoiceGenerating(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!selectedBatchRow?.ok || !selectedBatchRow.data) return;
    onDownloadCertificate(
      [`certificate-pdf-bulk-${selectedBatchIndex}`],
      `Certificate_${selectedBatchRow.imei}.pdf`,
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectedBatchIndexChange = useCallback((value: number) => {
    setSelectedBatchIndex(value);
    setIsSelectOpen(false);
  }, []);

  const handlePrevClick = useCallback(() => {
    setSelectedBatchIndex((current) => Math.max(current - 1, 0));
  }, []);

  const handleNextClick = useCallback(() => {
    setSelectedBatchIndex((current) =>
      Math.min(current + 1, batchRows.length - 1),
    );
  }, [batchRows.length]);

  if (!batchResult) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium mb-4 transition"
        >
          <ArrowLeft size={18} />
          Back to scan
        </button>

        {/* Summary Stats */}
        <div className="bg-white dark:bg-card rounded-[32px] p-4 mb-4 shadow-sm border border-slate-200 dark:border-border">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-[10px] text-slate-400">Total</p>
              <p className="text-xl font-bold text-slate-900 dark:text-foreground">
                {batchResult.summary.total}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] text-slate-400">Success</p>
              <p className="text-xl font-bold text-emerald-600">
                {batchResult.summary.successCount}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] text-slate-400">Failed</p>
              <p className="text-xl font-bold text-red-600">
                {batchResult.summary.failedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Dropdown */}
        <div className="mb-4">
          <div className="relative" ref={selectRef}>
            <button
              onClick={() => setIsSelectOpen(!isSelectOpen)}
              className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-4 py-3 text-sm font-medium text-slate-700 dark:text-foreground hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              <span className="truncate">
                {selectedBatchRow
                  ? `Device ${selectedBatchRow.rowNumber} - ${selectedBatchRow.imei} ${!selectedBatchRow.ok ? "(Failed)" : ""}`
                  : "Select a result"}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${isSelectOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isSelectOpen && (
              <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-popover shadow-lg">
                {batchRows.map((row, index) => (
                  <button
                    key={`${row.rowNumber}-${row.imei}-${index}`}
                    onClick={() => handleSelectedBatchIndexChange(index)}
                    className={`w-full px-4 py-2 text-left text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-muted ${
                      selectedBatchIndex === index
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "text-slate-700 dark:text-foreground"
                    }`}
                  >
                    {`Device ${row.rowNumber} - ${row.imei} ${!row.ok ? "(Failed)" : ""}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center gap-3 mt-3">
            <button
              onClick={handlePrevClick}
              disabled={selectedBatchIndex === 0}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-sm font-medium text-slate-700 dark:text-foreground transition hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              onClick={handleNextClick}
              disabled={selectedBatchIndex === batchRows.length - 1}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-sm font-medium text-slate-700 dark:text-foreground transition hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Selected Result Details */}
        {selectedBatchRow?.ok && selectedBatchRow.data ? (
          <>
            {/* Provider Badge */}
            {provider && (
              <div className="mb-3 flex justify-end">
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                  Provider: {provider === "sickw" ? "Sickw" : "Apple Official"}
                </span>
              </div>
            )}

            {/* Regenerate Warning */}
            {oldGenerated && (
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

            {/* Main Card */}
            <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-[32px] p-5 shadow-sm relative">
              <div className="space-y-3 text-center text-[14px] text-[#5F6368] dark:text-muted-foreground leading-relaxed">
                {/* Report summary */}
                <div className="grid gap-3 rounded-2xl border border-slate-200 dark:border-border bg-slate-50 dark:bg-muted p-4 text-left sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-muted-foreground">
                        <Gauge size={16} className="text-[#84CC16]" />
                        <span className="text-[11px] font-bold uppercase tracking-wide">
                          Risk meter
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getRiskBadgeColor(riskScore)}`}
                      >
                        {riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <p className="text-2xl font-bold text-slate-900 dark:text-foreground">
                        {riskScore}
                        <span className="text-sm font-medium text-slate-400 dark:text-muted-foreground">
                          /100
                        </span>
                      </p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">
                        Risk score
                      </p>
                    </div>
                    <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getRiskColor(riskScore)}`}
                        style={{
                          width: `${Math.max(0, Math.min(riskScore, 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card p-3">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-muted-foreground">
                      <Tag size={16} className="text-[#84CC16]" />
                      <span className="text-[11px] font-bold uppercase tracking-wide">
                        Market price
                      </span>
                    </div>
                    <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-foreground break-words">
                      {marketValue || "Not available"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500 dark:text-muted-foreground">
                      Estimated market value
                    </p>
                  </div>
                </div>

                {/* Device Image */}
                {image && (
                  <div className="flex justify-center mb-2">
                    <img
                      src={image}
                      alt="Device"
                      className="h-20 w-auto object-contain"
                    />
                  </div>
                )}

                {/* Display all fields */}
                {visibleFields.map((field, idx) => (
                  <p key={idx}>
                    <span className="font-semibold">{field.label}:</span>{" "}
                    {String(field.value)}
                  </p>
                ))}

                {/* Show More / Show Less Button */}
                {allFields.length > 15 && (
                  <button
                    onClick={() => setShowAllFields(!showAllFields)}
                    className="text-primary text-sm font-semibold hover:underline mt-2"
                  >
                    {showAllFields
                      ? "Show Less"
                      : `Show More (${allFields.length - 15} more)`}
                  </button>
                )}

                {/* AI Insight Section */}
                {aiInsight && aiInsight.message && (
                  <div className="border-t border-slate-100 dark:border-border pt-3 mt-2">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Shield size={14} className="text-indigo-500" />
                      <p className="font-semibold text-indigo-600">
                        {aiInsight.title || "AI INSIGHT"}
                      </p>
                    </div>
                    <p className="text-sm italic text-slate-600 dark:text-slate-300">
                      {aiInsight.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyToClipboard}
                className="absolute bottom-4 right-4 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-300 transition"
                title="Copy to clipboard"
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
            {!isGuest && (
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
                  onClick={handleDownloadCertificate}
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
            )}
          </>
        ) : selectedBatchRow ? (
          <div className="bg-white dark:bg-card border border-red-200 dark:border-red-900 rounded-[32px] p-5 shadow-sm">
            <div className="text-center">
              <XCircle size={48} className="mx-auto text-red-500 mb-3" />
              <p className="text-lg font-bold text-red-700">Failed Result</p>
              <p className="text-sm text-red-600 mt-2">
                {selectedBatchRow.message ||
                  errorMessage ||
                  "Unable to retrieve data"}
              </p>
              <p className="text-xs text-slate-500 mt-4">
                IMEI: {selectedBatchRow.imei}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Hidden PDF Containers */}
      <div className="fixed top-0 left-[-10000px] w-[1100px] pointer-events-none z-0">
        {selectedBatchRow?.ok && selectedBatchRow.data && (
          <>
            <CertificatePDF
              data={selectedBatchRow.data}
              id={`certificate-pdf-bulk-${selectedBatchIndex}`}
              providerName={selectedBatchRow.provider}
              serviceId={selectedBatchRow.serviceId}
            />
            {invoiceFormData && (
              <SmartInvoicePDF
                data={selectedBatchRow.data}
                id={`smart-invoice-pdf-bulk-${selectedBatchIndex}`}
                invoiceData={invoiceFormData}
              />
            )}
          </>
        )}
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onGenerate={handleGenerateInvoice}
        scanResult={selectedBatchRow?.data || null}
        isGenerating={isInvoiceGenerating}
      />
    </div>
  );
};
