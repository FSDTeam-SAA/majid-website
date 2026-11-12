import { useState, useEffect, useCallback } from "react";
import { PrinterBrand, PrinterConnectionStatus } from "./types";

export interface PrinterConnectionResult {
  status: PrinterConnectionStatus;
  message: string;
  deviceReady?: boolean;
}

/**
 * Actively probes the local print connector / daemon.
 * DEVELOPER NOTE 4:
 * "Show green only when the connection is verified; never hard-code this status.
 * If device status is unavailable, show 'Connection unverified' instead.
 * Refresh status before printing. If unavailable, show 'Recheck' and 'Printer setup'.
 * Connector online does not always mean the physical printer is ready."
 */
export async function probePrinterConnection(
  brand: PrinterBrand,
  timeoutMs = 1500,
): Promise<PrinterConnectionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (brand === "DYMO") {
      // Probe DYMO Connect Web Service on standard ports (41951 / 41952)
      try {
        const res = await fetch(
          "https://127.0.0.1:41951/DYMO/DLS/Printing/StatusConnected",
          {
            signal: controller.signal,
            mode: "cors",
          },
        );
        clearTimeout(timeoutId);
        if (res.ok) {
          const text = await res.text();
          if (text.includes("true")) {
            return {
              status: "connected",
              message: "DYMO Connect Web Service verified & connected",
              deviceReady: true,
            };
          }
        }
      } catch {
        // Fallback to HTTP if HTTPS had cert/mixed content limitation
        try {
          const resHttp = await fetch(
            "http://127.0.0.1:41951/DYMO/DLS/Printing/StatusConnected",
            {
              signal: controller.signal,
              mode: "cors",
            },
          );
          clearTimeout(timeoutId);
          if (resHttp.ok) {
            const text = await resHttp.text();
            if (text.includes("true")) {
              return {
                status: "connected",
                message: "DYMO Connect Service verified",
                deviceReady: true,
              };
            }
          }
        } catch {
          // Both failed
        }
      }
      return {
        status: "unverified",
        message: "DYMO Connect connector not responding or unverified",
        deviceReady: false,
      };
    }

    if (brand === "Zebra") {
      try {
        const res = await fetch("http://localhost:9100/default", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          return {
            status: "connected",
            message: "Zebra Browser Print verified",
            deviceReady: true,
          };
        }
      } catch {
        // fallback
      }
      return {
        status: "unverified",
        message: "Zebra Browser Print service unverified",
        deviceReady: false,
      };
    }

    if (brand === "Generic") {
      clearTimeout(timeoutId);
      // Standard OS Print Driver - Browser print is available, but hardware status is unverified
      return {
        status: "unverified",
        message: "Connection unverified (OS printer spooler)",
        deviceReady: true,
      };
    }

    clearTimeout(timeoutId);
    return {
      status: "unverified",
      message: `${brand} hardware connector unverified`,
      deviceReady: false,
    };
  } catch {
    clearTimeout(timeoutId);
    return {
      status: "unverified",
      message: "Connection unverified",
      deviceReady: false,
    };
  }
}

export function usePrinterConnection(brand: PrinterBrand, autoProbe = true) {
  const [status, setStatus] = useState<PrinterConnectionStatus>("checking");
  const [message, setMessage] = useState<string>("Checking connection...");
  const [isRechecking, setIsRechecking] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const check = useCallback(async (brandToCheck: PrinterBrand) => {
    setIsRechecking(true);
    setStatus("checking");
    setMessage("Verifying printer connection...");
    const result = await probePrinterConnection(brandToCheck);
    setStatus(result.status);
    setMessage(result.message);
    setLastChecked(new Date());
    setIsRechecking(false);
    return result;
  }, []);

  useEffect(() => {
    let mounted = true;
    if (autoProbe) {
      const timer = setTimeout(() => {
        if (mounted) {
          check(brand);
        }
      }, 0);
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
  }, [brand, autoProbe, check]);

  const recheck = useCallback(() => {
    return check(brand);
  }, [brand, check]);

  return {
    status,
    message,
    isRechecking,
    lastChecked,
    recheck,
  };
}
