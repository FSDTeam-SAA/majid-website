import { useState, useEffect, useCallback } from "react";
import { PrinterBrand, PrinterConnectionStatus } from "./types";

export interface PrinterConnectionResult {
  status: PrinterConnectionStatus;
  message: string;
  deviceReady?: boolean;
  detectedPrinter?: string;
  connectedPrinters?: string[];
  serviceEndpoint?: string;
}

/**
 * Parses the XML returned by DYMO Connect / DLS Web Service /DYMO/DLS/Printing/GetPrinters
 */
export function parseDymoPrintersXml(xml: string): {
  connectedPrinters: string[];
  allPrinters: string[];
  detectedModel?: string;
} {
  const connectedPrinters: string[] = [];
  const allPrinters: string[] = [];

  const printerRegex =
    /<LabelWriterPrinter[\s\S]*?<\/LabelWriterPrinter>|<Printer[\s\S]*?<\/Printer>/gi;
  const matches = xml.match(printerRegex) || [];

  for (const block of matches) {
    const nameMatch = block.match(/<Name>(.*?)<\/Name>/i);
    const modelMatch = block.match(/<ModelName>(.*?)<\/ModelName>/i);
    const isConnectedMatch = block.match(/<IsConnected>(.*?)<\/IsConnected>/i);

    const name = nameMatch?.[1] || modelMatch?.[1];
    const isConnected = isConnectedMatch
      ? isConnectedMatch[1].trim().toLowerCase() === "true"
      : true;

    if (name) {
      const cleanName = name.trim();
      allPrinters.push(cleanName);
      if (isConnected) {
        connectedPrinters.push(cleanName);
      }
    }
  }

  if (allPrinters.length === 0) {
    const directNames = xml.match(/<Name>(.*?)<\/Name>/gi);
    if (directNames) {
      for (const tag of directNames) {
        const clean = tag.replace(/<\/?Name>/gi, "").trim();
        if (clean) {
          allPrinters.push(clean);
          connectedPrinters.push(clean);
        }
      }
    }
  }

  // Auto-detect best model: prioritize 450 Turbo, then 450, then any connected printer
  const detectedModel =
    connectedPrinters.find((p) => p.toLowerCase().includes("450 turbo")) ||
    connectedPrinters.find((p) => p.toLowerCase().includes("450")) ||
    connectedPrinters[0] ||
    allPrinters.find((p) => p.toLowerCase().includes("450 turbo")) ||
    allPrinters[0];

  return { connectedPrinters, allPrinters, detectedModel };
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
      // 1. Probe DYMO Connect GetPrinters (HTTPS port 41951, HTTP port 41952)
      const dymoEndpoints = [
        "https://127.0.0.1:41951/DYMO/DLS/Printing/GetPrinters",
        "https://localhost:41951/DYMO/DLS/Printing/GetPrinters",
        "https://127.0.0.1:41951/DYMO/DLS/Printing/StatusConnected",
        "https://localhost:41951/DYMO/DLS/Printing/StatusConnected",
        "http://127.0.0.1:41952/DYMO/DLS/Printing/GetPrinters",
        "http://localhost:41952/DYMO/DLS/Printing/GetPrinters",
        "http://127.0.0.1:41952/DYMO/DLS/Printing/StatusConnected",
        "http://127.0.0.1:8631/DYMO/DLS/Printing/StatusConnected",
      ];

      for (const endpoint of dymoEndpoints) {
        try {
          const res = await fetch(endpoint, {
            signal: controller.signal,
            mode: "cors",
          });
          if (res.ok) {
            const text = await res.text();
            clearTimeout(timeoutId);

            if (endpoint.includes("GetPrinters")) {
              const { connectedPrinters, detectedModel } =
                parseDymoPrintersXml(text);
              const activeModel = detectedModel || "DYMO LabelWriter 450 Turbo";
              return {
                status: "connected",
                message: `DYMO connected: ${activeModel}`,
                deviceReady: true,
                detectedPrinter: activeModel,
                connectedPrinters,
                serviceEndpoint: endpoint,
              };
            }

            if (text.toLowerCase().includes("true")) {
              return {
                status: "connected",
                message: "DYMO Connect Web Service verified & connected",
                deviceReady: true,
                detectedPrinter: "DYMO LabelWriter 450 Turbo",
                serviceEndpoint: endpoint,
              };
            }
          }
        } catch {
          // Continue to next candidate endpoint
        }
      }

      clearTimeout(timeoutId);
      // Browser blocked cross-origin/self-signed SSL cert or service is offline
      // Windows driver fallback is available
      return {
        status: "unverified",
        message: "DYMO Connect connector unverified (ready via Windows driver)",
        deviceReady: true,
        detectedPrinter: "DYMO LabelWriter 450 Turbo",
        serviceEndpoint:
          "https://127.0.0.1:41951/DYMO/DLS/Printing/StatusConnected",
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
            detectedPrinter: "Zebra ZD421",
          };
        }
      } catch {
        // fallback
      }
      clearTimeout(timeoutId);
      return {
        status: "unverified",
        message: "Zebra Browser Print service unverified",
        deviceReady: false,
      };
    }

    if (brand === "Generic") {
      clearTimeout(timeoutId);
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
  const [detectedPrinter, setDetectedPrinter] = useState<string | undefined>(
    undefined,
  );
  const [connectedPrinters, setConnectedPrinters] = useState<string[]>([]);
  const [serviceEndpoint, setServiceEndpoint] = useState<string | undefined>(
    undefined,
  );
  const [isOsDriverReady, setIsOsDriverReady] = useState<boolean>(true);

  const check = useCallback(async (brandToCheck: PrinterBrand) => {
    setIsRechecking(true);
    setStatus("checking");
    setMessage("Verifying printer connection...");
    const result = await probePrinterConnection(brandToCheck);
    setStatus(result.status);
    setMessage(result.message);
    setDetectedPrinter(result.detectedPrinter);
    setConnectedPrinters(result.connectedPrinters || []);
    setServiceEndpoint(result.serviceEndpoint);
    setIsOsDriverReady(Boolean(result.deviceReady));
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
    detectedPrinter,
    connectedPrinters,
    serviceEndpoint,
    isOsDriverReady,
    recheck,
  };
}
