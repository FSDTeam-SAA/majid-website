import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  checkIMEIApi,
  checkFavouriteIMEIApi,
} from "../../scanDevice/api/scanDevice.api";
import {
  IMEIResult,
  BatchImeiResponse,
  BatchImeiItemResult,
  FavouriteIMEIData,
} from "../../scanDevice/types/scanDevice.types";
import {
  getGuestUsageCount,
  incrementGuestUsageCount,
} from "@/lib/guest-limit";

export const useScanDevice = () => {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [imei, setImei] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<IMEIResult | null>(null);
  const [favouriteResult, setFavouriteResult] =
    useState<FavouriteIMEIData | null>(null);
  const [batchResult, setBatchResult] = useState<BatchImeiResponse | null>(
    null,
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [singleReportMeta, setSingleReportMeta] = useState<{
    provider?: string;
    serviceId?: number;
  } | null>(null);

  const isValidIdentifier = useCallback((value: string): boolean => {
    const trimmedValue = value.trim();

    return (
      /^\d{15}$/.test(trimmedValue) || /^[a-zA-Z0-9]{8,20}$/.test(trimmedValue)
    );
  }, []);

  const parseIMEIInput = useCallback(
    (input: string): string[] => {
      if (!input || input.trim() === "") return [];
      const items = input
        .split(/[,\n\r\t;]+/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && isValidIdentifier(item));
      console.log("📝 Parsed IMEIs:", items);
      return items;
    },
    [isValidIdentifier],
  );

  // Check if selected service is favourite
  const isFavouriteService = useCallback((serviceId: number): boolean => {
    // Favourite service IDs: 1000, 1001, 1002 etc.
    return [1000, 1001, 1002].includes(serviceId);
  }, []);

  const finishGuestScan = useCallback(
    async (onComplete?: () => void) => {
      setIsScanning(false);
      if (!isAuthenticated) {
        await incrementGuestUsageCount();
      }
      onComplete?.();
    },
    [isAuthenticated],
  );

  const handleScan = useCallback(
    async (imeiInput: string, serviceId: number, onComplete?: () => void) => {
      if (!imeiInput || !serviceId) return;

      console.log("🔍 Raw input:", imeiInput);

      const imeiList = parseIMEIInput(imeiInput);
      console.log("📋 Parsed list:", imeiList);
      console.log("📊 Is bulk:", imeiList.length > 1);

      if (imeiList.length === 0) {
        setError(
          "No valid device identifier found. Please enter a valid IMEI or serial number.",
        );
        setIsScanning(false);
        return;
      }

      if (!isAuthenticated) {
        // Check guest usage limit (max 2 free reports per device)
        const usageCount = await getGuestUsageCount();
        if (usageCount >= 2) {
          setError(
            "You have used your 2 free reports. Please login to continue.",
          );
          setShowGuestLimitModal(true);
          setIsScanning(false);
          return;
        }
      }

      setIsScanning(true);
      setScanResult(null);
      setFavouriteResult(null);
      setBatchResult(null);
      setError(null);
      setCurrentStep(1);

      try {
        const isBulk = imeiList.length > 1;
        const isFav = !isBulk && isFavouriteService(serviceId);

        // Favourite service (single IMEI only)
        if (isFav) {
          console.log("⭐ Sending favourite service request:", {
            imei: imeiList[0],
            serviceId,
          });

          const response = await checkFavouriteIMEIApi(imeiList[0], serviceId);
          console.log("📦 Favourite response:", response);

          if (
            response.success &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            const firstItem = response.data[0];
            if (firstItem.ok && firstItem.data) {
              setCurrentStep(2);
              setFavouriteResult(firstItem.data);
              setSingleReportMeta({
                provider: firstItem.data.bundledServiceName,
                serviceId: firstItem.data.bundledServiceId,
              });
              await finishGuestScan(onComplete);
            } else {
              setError(firstItem.message || "No valid IMEI data received");
              setIsScanning(false);
            }
          } else {
            setError(response.message || "Failed to check IMEI");
            setIsScanning(false);
          }
        }
        // Bulk IMEI check
        else if (isBulk) {
          console.log("🚀 Sending bulk request:", {
            imei: imeiList,
            serviceId,
          });
          const response = await checkIMEIApi(imeiList, serviceId);
          console.log("📦 Bulk response:", response);

          if (response.success && Array.isArray(response.data)) {
            const bulkItems: BatchImeiItemResult[] = response.data.map(
              (item, index) => ({
                rowNumber: index + 1,
                imei: item.imei,
                ok: item.ok,
                message: item.message,
                data: item.data || undefined,
                serviceId: serviceId,
                provider: item.provider || "API",
              }),
            );

            const successCount = bulkItems.filter((item) => item.ok).length;
            const failedCount = bulkItems.filter((item) => !item.ok).length;

            const batchResponse: BatchImeiResponse = {
              success: true,
              message: response.message,
              summary: { total: imeiList.length, successCount, failedCount },
              data: bulkItems,
            };
            setCurrentStep(2);
            setBatchResult(batchResponse);
            await finishGuestScan(onComplete);
          } else {
            setError(response.message || "Failed to check IMEIs");
            setIsScanning(false);
          }
        }
        // Single IMEI check (non-favourite)
        else {
          console.log("🎯 Sending single request:", {
            imei: imeiList[0],
            serviceId,
          });
          const response = await checkIMEIApi(imeiList[0], serviceId);

          if (
            response.success &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            const firstItem = response.data[0];
            if (firstItem.ok && firstItem.data) {
              // 🔥 CRITICAL: Ensure IMEI is included in the result
              const resultWithIMEI = {
                ...firstItem.data,
                imei: firstItem.imei || firstItem.data.imei || imeiList[0],
              };
              setCurrentStep(2);
              setScanResult(resultWithIMEI);
              setSingleReportMeta({
                provider:
                  firstItem.provider ||
                  (firstItem.data as { provider?: string })?.provider,
                serviceId: firstItem.serviceId || serviceId,
              });
              await finishGuestScan(onComplete);
            } else {
              setError(firstItem.message || "No valid IMEI data received");
              setIsScanning(false);
            }
          } else {
            setError(response.message || "Failed to check IMEI");
            setIsScanning(false);
          }
        }
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        console.error("❌ Scan error:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong",
        );
        setIsScanning(false);
      }
    },
    [parseIMEIInput, isFavouriteService, finishGuestScan, isAuthenticated],
  );

  const handleRegenerateScan = useCallback(
    async (
      imeiInput: string,
      serviceId: number,
      generateNew: boolean = true,
      onComplete?: () => void,
    ) => {
      if (!imeiInput || !serviceId) {
        console.error("❌ Missing imei or serviceId for regenerate");
        return;
      }

      console.log("🔄 handleRegenerateScan called with:", {
        imeiInput,
        serviceId,
        generateNew,
      });

      setIsScanning(true);
      setCurrentStep(1);

      try {
        const isFav = isFavouriteService(serviceId);

        // Favourite service regeneration
        if (isFav) {
          console.log(
            "⭐ Regenerating favourite service with IMEI:",
            imeiInput,
          );
          const response = await checkFavouriteIMEIApi(
            imeiInput,
            serviceId,
            true,
          );
          console.log("📦 Favourite regenerate response:", response);

          if (
            response.success &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            const firstItem = response.data[0];
            if (firstItem.ok && firstItem.data) {
              const freshData = { ...firstItem.data, oldGenerated: false };
              setCurrentStep(2);
              setFavouriteResult(freshData);
              setSingleReportMeta({
                provider: firstItem.data.bundledServiceName,
                serviceId: firstItem.data.bundledServiceId,
              });
              await finishGuestScan(onComplete);
            } else {
              setError(firstItem.message || "No valid IMEI data received");
              setIsScanning(false);
            }
          } else {
            setError(response.message || "Failed to regenerate favourite IMEI");
            setIsScanning(false);
          }
        }
        // Regular service regeneration
        else {
          console.log("🎯 Regenerating regular service with IMEI:", imeiInput);
          const response = await checkIMEIApi(imeiInput, serviceId, true);
          console.log("📦 Regular regenerate response:", response);

          if (
            response.success &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            const firstItem = response.data[0];
            if (firstItem.ok && firstItem.data) {
              // 🔥 CRITICAL: Preserve IMEI in regenerated data
              const freshData = {
                ...firstItem.data,
                imei: firstItem.imei || firstItem.data.imei || imeiInput,
                oldGenerated: false,
              };
              setCurrentStep(2);
              setScanResult(freshData);
              setSingleReportMeta({
                provider: firstItem.provider,
                serviceId: firstItem.serviceId || serviceId,
              });
              await finishGuestScan(onComplete);
            } else {
              setError(firstItem.message || "No valid IMEI data received");
              setIsScanning(false);
            }
          } else {
            setError(response.message || "Failed to regenerate IMEI");
            setIsScanning(false);
          }
        }
      } catch (err: unknown) {
        const error = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        console.error("❌ Regenerate scan error:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong",
        );
        setIsScanning(false);
      }
    },
    [finishGuestScan, isFavouriteService],
  );

  const clearResults = () => {
    console.log("🧹 Clearing all results");
    setScanResult(null);
    setFavouriteResult(null);
    setBatchResult(null);
    setSingleReportMeta(null);
    setError(null);
    setCurrentStep(0);
    setImei("");
  };

  const restoreSavedReport = useCallback((report: IMEIResult) => {
    setImei(report.imei || "");
    setIsScanning(false);
    setScanResult(report);
    setFavouriteResult(null);
    setBatchResult(null);
    setError(null);
    setCurrentStep(2);
    setSingleReportMeta({
      serviceId: report.serviceId,
    });
  }, []);

  return {
    imei,
    setImei,
    isScanning,
    scanResult,
    favouriteResult,
    batchResult,
    setBatchResult,
    currentStep,
    error,
    singleReportMeta,
    handleScan,
    handleRegenerateScan,
    restoreSavedReport,
    clearResults,
    parseIMEIInput,
    showGuestLimitModal,
    setShowGuestLimitModal,
  };
};
