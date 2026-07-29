/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  User,
  Package,
  Loader2,
  Trash2,
  Plus,
  ScanLine,
  Camera,
  Upload,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  X,
  Calendar,
  Clock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// --- CLIENT LIBRARIES IMPORT ---
import { BrowserMultiFormatReader } from "@zxing/library";
import { createWorker } from "tesseract.js";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { useCurrency } from "@/hooks/useCurrency";
import {
  useCreateInvoice,
  useCreateInventory,
  useCategories,
} from "@/features/shopkeeper/inventory/hooks/useInventory";

interface OcrResponse {
  success: boolean;
  message: string;
  data: {
    nidNumber: string;
    isValid: boolean;
    message: string;
    processingTime: number;
  };
}

// --- Ultra-Modern PDF Styles ---
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontSize: 9,
    color: "#334155",
  },
  headerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 35,
    marginTop: 10,
  },
  logo: { width: 130, objectFit: "contain" },
  receiptMeta: { textAlign: "right" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateText: { fontSize: 9, color: "#64748b" },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 4,
  },
  infoRow: { flexDirection: "row", gap: 20 },
  infoBox: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  infoBoxTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 7.5,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    color: "#1e293b",
    fontSize: 9.5,
    fontWeight: "bold",
    marginBottom: 8,
  },
  storeValue: {
    color: "#334155",
    fontSize: 9.5,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  colProduct: { width: "40%" },
  colQty: {
    width: "10%",
    textAlign: "center",
    color: "#0f172a",
    fontWeight: "bold",
  },
  colSerials: { width: "30%" },
  colPrice: {
    width: "20%",
    textAlign: "right",
    fontWeight: "bold",
    color: "#0f172a",
  },
  productName: { fontSize: 9.5, fontWeight: "bold", color: "#0f172a" },
  modelText: { fontSize: 8, color: "#64748b", marginTop: 2 },
  serialText: {
    fontSize: 8,
    color: "#475569",
    backgroundColor: "#f1f5f9",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 2,
    alignSelf: "flex-start",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  totalBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    borderRadius: 8,
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
  },
  totalValue: { fontSize: 13, fontWeight: "bold", color: "#0f172a" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 7.5,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 15,
    lineHeight: 1.4,
  },
});

const PurchaseReceiptPDF = ({
  customer,
  items,
  shopkeeper,
  total,
  invoiceDate,
  currency = "USD",
}: any) => {
  const pdfFormatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (currency || "USD").toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.headerBar} />
        <View style={pdfStyles.header}>
          {shopkeeper?.image?.url ? (
            <Image src={shopkeeper.image.url} style={pdfStyles.logo} />
          ) : (
            <Text style={[pdfStyles.title, { fontSize: 18 }]}>
              {shopkeeper?.shopName || "STORE"}
            </Text>
          )}
          <View style={pdfStyles.receiptMeta}>
            <Text style={pdfStyles.title}>PURCHASE RECEIPT</Text>
            <Text style={pdfStyles.dateText}>
              Date:{" "}
              {(invoiceDate
                ? new Date(invoiceDate)
                : new Date()
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            <Text style={pdfStyles.dateText}>
              Time:{" "}
              {(invoiceDate
                ? new Date(invoiceDate)
                : new Date()
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Text>
          </View>
        </View>

        <View style={[pdfStyles.section, pdfStyles.infoRow]}>
          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.infoBoxTitle}>Customer Details</Text>
            <Text style={pdfStyles.label}>Name</Text>
            <Text style={pdfStyles.value}>
              {customer?.firstName} {customer?.lastName}
            </Text>
            <Text style={pdfStyles.label}>Phone</Text>
            <Text style={pdfStyles.value}>{customer?.phone}</Text>
            <Text style={pdfStyles.label}>Govt ID / NID</Text>
            <Text style={pdfStyles.value}>{customer?.idNumber}</Text>
          </View>
          <View style={pdfStyles.infoBox}>
            <Text style={pdfStyles.infoBoxTitle}>Shop Information</Text>
            <Text style={[pdfStyles.value, { fontSize: 11 }]}>
              {shopkeeper?.shopName}
            </Text>
            <Text style={pdfStyles.storeValue}>{shopkeeper?.shopAddress}</Text>
            <Text style={pdfStyles.storeValue}>{shopkeeper?.phone}</Text>
          </View>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Purchased Devices</Text>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.colProduct}>Product Specifications</Text>
            <Text style={pdfStyles.colQty}>Qty</Text>
            <Text style={pdfStyles.colSerials}>IMEI / Serials</Text>
            <Text style={pdfStyles.colPrice}>Price</Text>
          </View>
          {items?.map((item: any, index: number) => (
            <View key={index} style={pdfStyles.row}>
              <View style={pdfStyles.colProduct}>
                <Text style={pdfStyles.productName}>{item.name}</Text>
                <Text style={pdfStyles.modelText}>
                  {item.storage} • {item.color}
                </Text>
              </View>
              <Text style={pdfStyles.colQty}>{item.quantity}</Text>
              <View style={pdfStyles.colSerials}>
                {item.serials.map((serial: string, idx: number) => (
                  <Text key={idx} style={pdfStyles.serialText}>
                    • {serial}
                  </Text>
                ))}
              </View>
              <Text style={pdfStyles.colPrice}>
                {pdfFormatCurrency(
                  Number(item.expectedPrice || 0) * Number(item.quantity || 1),
                )}
              </Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totalSection}>
          <View style={pdfStyles.totalBox}>
            <View style={pdfStyles.totalRow}>
              <Text style={pdfStyles.totalLabel}>Total Value</Text>
              <Text style={pdfStyles.totalValue}>
                {pdfFormatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={pdfStyles.footer}>
          Verified IMEI and serial numbers are attached with customer
          identification proof.
        </Text>
      </Page>
    </Document>
  );
};

export default function CreatePurchaseReceipt() {
  const { data: profileData } = useMyProfile();
  const { currency, formatCurrency } = useCurrency();
  const { data: categoriesData } = useCategories();
  const session = useSession();
  const shopkeeperId = session?.data?.user?.id;
  const { mutateAsync: createInvoice, isPending: isCreatingInvoice } =
    useCreateInvoice();
  const { mutateAsync: createInventory, isPending: isCreatingInventory } =
    useCreateInventory();

  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const nidVideoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Customer ID State Management Configuration Block
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    idNumber: "",
  });

  // New state for NID camera capture
  const [showNidCamera, setShowNidCamera] = useState<boolean>(false);
  const [nidSide, setNidSide] = useState<"front" | "back">("front");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [nidStream, setNidStream] = useState<MediaStream | null>(null);

  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrStatus, setOcrStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [items, setItems] = useState<any[]>([
    {
      name: "",
      storage: "",
      color: "",
      condition: "",
      quantity: 1,
      expectedPrice: 0,
      serials: [],
    },
  ]);

  const [scanInputs, setScanInputs] = useState<{ [key: number]: string }>({});
  const [isParsingFile, setIsParsingFile] = useState<{
    [key: number]: boolean;
  }>({});
  const [activeCameraStream, setActiveCameraStream] = useState<{
    [key: number]: boolean;
  }>({});
  const [addToInventory, setAddToInventory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const handleQuickOption = (option: "now" | "today" | "yesterday") => {
    const now = new Date();
    if (option === "now") {
      setInvoiceDate(new Date());
    } else if (option === "today") {
      now.setHours(0, 0, 0, 0);
      setInvoiceDate(now);
    } else if (option === "yesterday") {
      now.setDate(now.getDate() - 1);
      now.setHours(0, 0, 0, 0);
      setInvoiceDate(now);
    }
  };

  const updateDatePart = (part: "day" | "month" | "year", value: number) => {
    const d = new Date(invoiceDate);
    if (part === "day") d.setDate(value);
    if (part === "month") d.setMonth(value);
    if (part === "year") d.setFullYear(value);
    setInvoiceDate(d);
  };

  const updateTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const d = new Date(invoiceDate);
    d.setHours(hours, minutes);
    setInvoiceDate(d);
  };

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      // Clean up NID camera stream on unmount
      if (nidStream) {
        nidStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [nidStream]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        name: "",
        storage: "",
        color: "",
        condition: "",
        quantity: 1,
        expectedPrice: 0,
        serials: [],
      },
    ]);
  };

  const removeItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
    if (activeCameraStream[index]) {
      stopCameraScanning(index);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // --- NID CAMERA CAPTURE LOGIC ---
  const startNidCamera = async (side: "front" | "back") => {
    setNidSide(side);
    setShowNidCamera(true);
    setCapturedImage(null);

    try {
      if (nidStream) {
        nidStream.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setNidStream(stream);
      if (nidVideoRef.current) {
        nidVideoRef.current.srcObject = stream;
      }
      toast.info(`Position ${side} side of NID in front of camera`);
    } catch (error) {
      toast.error("Could not access camera. Please check permissions.");
      setShowNidCamera(false);
    }
  };

  const captureNidImage = () => {
    if (nidVideoRef.current && nidStream) {
      const video = nidVideoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageDataUrl);
        // Stop the camera stream
        nidStream.getTracks().forEach((track) => track.stop());
        setNidStream(null);
        setShowNidCamera(false);

        // Convert dataURL to File and trigger OCR
        const file = dataURLtoFile(imageDataUrl, `nid_${nidSide}.jpg`);
        if (nidSide === "front") {
          // For front side, we can trigger OCR immediately if we have both sides?
          // According to new requirement, either side can be used alone.
          // We'll process this single side
          triggerOcrScan(file);
        } else {
          // For back side, process this single side
          triggerOcrScan(file);
        }
      }
    }
  };

  const cancelNidCamera = () => {
    if (nidStream) {
      nidStream.getTracks().forEach((track) => track.stop());
      setNidStream(null);
    }
    setShowNidCamera(false);
    setCapturedImage(null);
  };

  // Helper to convert dataURL to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // --- AUTOMATED CUSTOMER NID SCANNING (OCR API GATEWAY) - UPDATED FOR SINGLE SIDE ---
  const triggerOcrScan = async (imageFile: File) => {
    setOcrLoading(true);
    setOcrStatus(null);
    const toastId = toast.loading("Processing NID image...");

    const formData = new FormData();
    // Send the same image as both front and back, or just one?
    // The backend might expect both. We'll send the same image for both fields
    // to satisfy the API requirement, but the backend should ideally accept single side.
    // Alternatively, we can modify the API call. Assuming backend can handle single image,
    // but to be safe, we send the captured image for both fields.
    formData.append("nid_front", imageFile);
    formData.append("nid_back", imageFile);

    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/ocr/extract-nid",
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok)
        throw new Error(
          "Backend OCR pipeline stream error connection exception",
        );

      const result: OcrResponse = await response.json();

      if (result.success && result.data.isValid) {
        setCustomer((prev) => ({ ...prev, idNumber: result.data.nidNumber }));
        setOcrStatus({
          type: "success",
          message: `${result.message || "NID extracted successfully"} (${result.data.processingTime}ms)`,
        });
        toast.success("Identity profile parsed and populated!");
      } else {
        setOcrStatus({
          type: "error",
          message:
            result.data.message ||
            "Verification pipeline rejected structure validity bounds.",
        });
        toast.error("OCR server failed validating document parameters.");
      }
    } catch (error) {
      setOcrStatus({
        type: "error",
        message: "Unable to connect to dynamic validation server context.",
      });
      toast.error("OCR endpoint connection timeout flag.");
    } finally {
      setOcrLoading(false);
      toast.dismiss(toastId);
    }
  };

  // --- WORKFLOW 1: BARCODE KEY ENTER LOGIC ---
  const handleScanKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemIndex: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = scanInputs[itemIndex]?.trim();
      if (!code) return;

      appendBarcodeCode(itemIndex, code);
      setScanInputs((prev) => ({ ...prev, [itemIndex]: "" }));
    }
  };

  // --- WORKFLOW 2: LIVE HARDWARE WEBCAM SCANNERS ---
  const startCameraScanning = async (itemIndex: number) => {
    if (!codeReaderRef.current) return;

    setActiveCameraStream((prev) => ({ ...prev, [itemIndex]: true }));
    toast.loading("Accessing media devices hardware...", {
      id: `cam-${itemIndex}`,
    });

    setTimeout(async () => {
      try {
        const videoElement = videoRefs.current[itemIndex];
        if (!videoElement) throw new Error("Video node element missing");

        codeReaderRef.current?.decodeFromVideoDevice(
          null,
          videoElement,
          (result, error) => {
            if (result) {
              const matchedCodeText = result.getText()?.trim();
              if (matchedCodeText) {
                appendBarcodeCode(itemIndex, matchedCodeText);
                stopCameraScanning(itemIndex);
              }
            }
            if (error && !(error.name === "NotFoundException")) {
              console.debug("ZXing processing frame tick error:", error);
            }
          },
        );
        toast.dismiss(`cam-${itemIndex}`);
        toast.success("Camera viewfinder active.");
      } catch (err: any) {
        toast.dismiss(`cam-${itemIndex}`);
        toast.error("Failed to connect camera.");
        setActiveCameraStream((prev) => ({ ...prev, [itemIndex]: false }));
      }
    }, 300);
  };

  const stopCameraScanning = (itemIndex: number) => {
    if (codeReaderRef.current) codeReaderRef.current.reset();
    setActiveCameraStream((prev) => ({ ...prev, [itemIndex]: false }));
  };

  const toggleCameraScanner = (itemIndex: number) => {
    if (activeCameraStream[itemIndex]) {
      stopCameraScanning(itemIndex);
    } else {
      items.forEach((_, idx) => {
        if (activeCameraStream[idx]) stopCameraScanning(idx);
      });
      startCameraScanning(itemIndex);
    }
  };

  // --- WORKFLOW 3: ITEM ATTACHMENT PROCESSING ---
  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    itemIndex: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile((prev) => ({ ...prev, [itemIndex]: true }));
    const loadingToastId = toast.loading(
      `Reading item document asset "${file.name}"...`,
    );

    try {
      const imageUrl = URL.createObjectURL(file);

      try {
        const zxingResult =
          await codeReaderRef.current?.decodeFromImageUrl(imageUrl);
        const zxingText = zxingResult?.getText()?.trim();
        if (zxingText) {
          appendBarcodeCode(itemIndex, zxingText);
          toast.dismiss(loadingToastId);
          setIsParsingFile((prev) => ({ ...prev, [itemIndex]: false }));
          if (fileInputRefs.current[itemIndex])
            fileInputRefs.current[itemIndex]!.value = "";
          return;
        }
      } catch (e) {
        console.debug(
          "Fallback to Tesseract raw engine loop initialization blocks...",
          e,
        );
      }

      const worker = await createWorker("eng");
      const ret = await worker.recognize(imageUrl);
      const fullExtractedRawText = ret.data.text;
      await worker.terminate();

      URL.revokeObjectURL(imageUrl);
      const parsedMatchArray = fullExtractedRawText.match(/[A-Z0-9]{8,18}/g);

      if (parsedMatchArray && parsedMatchArray.length > 0) {
        appendBarcodeCode(itemIndex, parsedMatchArray[0]);
        toast.dismiss(loadingToastId);
      } else {
        toast.dismiss(loadingToastId);
        toast.error("Failed to extract legible codes.");
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Engine failed processing targets matrix layout.");
    } finally {
      setIsParsingFile((prev) => ({ ...prev, [itemIndex]: false }));
      if (fileInputRefs.current[itemIndex])
        fileInputRefs.current[itemIndex]!.value = "";
    }
  };

  const appendBarcodeCode = (itemIndex: number, code: string) => {
    const updatedItems = [...items];

    if (updatedItems[itemIndex].serials.includes(code)) {
      toast.error(`Code "${code}" already exists inside item list.`);
      return;
    }

    updatedItems[itemIndex].serials.push(code);

    if (
      updatedItems[itemIndex].serials.length > updatedItems[itemIndex].quantity
    ) {
      updatedItems[itemIndex].quantity = updatedItems[itemIndex].serials.length;
    }

    setItems(updatedItems);
    toast.success(`Code "${code}" appended smoothly to stack!`);
  };

  const removeSerial = (itemIndex: number, serialIndex: number) => {
    const updated = [...items];
    updated[itemIndex].serials.splice(serialIndex, 1);
    setItems(updated);
  };

  const isFormValid = useMemo(() => {
    return (
      customer.firstName &&
      customer.phone &&
      customer.idNumber &&
      items.length > 0 &&
      items.every((item) => item.name && item.serials.length > 0)
    );
  }, [customer, items]);

  const total = items.reduce(
    (acc, item) =>
      acc + Number(item.expectedPrice || 0) * Number(item.quantity || 1),
    0,
  );
  const isSubmitting = isCreatingInvoice || isCreatingInventory;

  const handleCreateReceipt = async () => {
    if (!isFormValid) {
      toast.error(
        "Please complete all required fields and ensure barcodes are populated",
      );
      return;
    }

    if (addToInventory && !selectedCategoryId) {
      toast.error("Please select a category name");
      return;
    }

    const doc = (
      <PurchaseReceiptPDF
        customer={customer}
        items={items}
        shopkeeper={profileData?.data}
        total={total}
        invoiceDate={invoiceDate}
        currency={currency}
      />
    );
    const blob = await pdf(doc).toBlob();
    const file = new File(
      [blob],
      `purchase_receipt_${customer.firstName}.pdf`,
      { type: "application/pdf" },
    );

    try {
      if (addToInventory) {
        await Promise.all(
          items.map((item) =>
            createInventory({
              itemName: item.name,
              color: item.color || undefined,
              storage: item.storage || undefined,
              imeiNumber: item.serials?.join(", ") || undefined,
              quantity: Number(item.quantity || 1),
              purchasePrice: Number(item.expectedPrice || 0),
              expectedPrice: Number(item.expectedPrice || 0),
              productDetails: item.serials?.length
                ? `Serials: ${item.serials.join(", ")}`
                : undefined,
              categoryId: selectedCategoryId,
              type: "inventory",
              status: "inventory",
              currentState:
                item.condition?.toLowerCase() === "good condition"
                  ? "good condition"
                  : "new",
              userId: shopkeeperId || "",
            }),
          ),
        );
      }

      await createInvoice({
        shopkeeperId: shopkeeperId || "",
        type: "Purchase Invoice",
        invoice: file,
      });

      toast.success(
        addToInventory
          ? "Purchase receipt created and items added to inventory"
          : "Purchase receipt created successfully",
      );
    } catch (error) {
      toast.error(
        addToInventory
          ? "Failed to create purchase receipt or add items to inventory"
          : "Failed to create purchase receipt",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Purchase Receipt Generator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Unified pipeline mapping identity verification parsing alongside
              barcode registry logs
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-orange-50 text-orange-600 px-5 py-3 rounded-2xl font-bold">
            <Package size={18} />
            {items.length} Items Configured
          </div>
        </div>

        {/* Invoice Date & Time Section */}
        <div className="bg-card border border-border rounded-[28px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Calendar size={20} />
            </div>
            <p className="text-xl font-black text-foreground">
              Invoice Date & Time
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Date
              </label>
              <div className="flex items-center gap-2 rounded-2xl h-12 border border-primary bg-background px-4 font-bold text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span>
                  {invoiceDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Time
              </label>
              <div className="flex items-center gap-2 rounded-2xl h-12 border border-primary bg-background px-4 font-bold text-sm">
                <Clock size={16} className="text-muted-foreground" />
                <span>
                  {invoiceDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Quick Options
              </label>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => handleQuickOption("now")}
                  className="px-5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold hover:bg-primary hover:text-white transition-all"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickOption("today")}
                  className="px-5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold hover:bg-primary hover:text-white transition-all"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickOption("yesterday")}
                  className="px-5 py-2.5 rounded-xl border border-border bg-background text-sm font-bold hover:bg-primary hover:text-white transition-all"
                >
                  Yesterday
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Or Select Manually
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <select
                  value={invoiceDate.getDate()}
                  onChange={(e) =>
                    updateDatePart("day", Number(e.target.value))
                  }
                  className="rounded-2xl h-12 border border-primary bg-background px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={invoiceDate.getMonth()}
                  onChange={(e) =>
                    updateDatePart("month", Number(e.target.value))
                  }
                  className="rounded-2xl h-12 border border-primary bg-background px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {monthNames.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={invoiceDate.getFullYear()}
                  onChange={(e) =>
                    updateDatePart("year", Number(e.target.value))
                  }
                  className="rounded-2xl h-12 border border-primary bg-background px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <input
                  type="time"
                  value={`${String(invoiceDate.getHours()).padStart(2, "0")}:${String(invoiceDate.getMinutes()).padStart(2, "0")}`}
                  onChange={(e) => updateTime(e.target.value)}
                  className="rounded-2xl h-12 border border-primary bg-background px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT CONTAINER */}
          <div className="xl:col-span-2 space-y-6">
            {/* CUSTOMER INFORMATION CONFIGURATION SUB-PANEL */}
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <User size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">
                      Customer Information
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Identity validation framework controls
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    placeholder="First Name"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={customer.firstName}
                    onChange={(e) =>
                      setCustomer({ ...customer, firstName: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Last Name"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={customer.lastName}
                    onChange={(e) =>
                      setCustomer({ ...customer, lastName: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Email"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={customer.email}
                    type="email"
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Phone"
                    className="rounded-2xl h-12 border-primary bg-background font-bold"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                  />
                  <div className="md:col-span-2">
                    <AddressAutocomplete
                      placeholder="Address"
                      className="rounded-2xl h-12 border-primary bg-background font-bold"
                      value={customer.address}
                      onChange={(e) =>
                        setCustomer({ ...customer, address: e.target.value })
                      }
                    />
                  </div>

                  {/* MANUAL OR AUTOMATIC IDENTITY SECTOR BLOCK - UPDATED WITH CAMERA BUTTONS */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-bold text-sm text-muted-foreground ml-1">
                      Customer ID Number / NID Field
                    </label>
                    <div className="relative flex gap-2">
                      <Input
                        placeholder="Type manually or capture NID via camera..."
                        className="rounded-2xl h-12 border-primary bg-background font-bold flex-1"
                        value={customer.idNumber}
                        onChange={(e) =>
                          setCustomer({ ...customer, idNumber: e.target.value })
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl h-12 px-4 gap-2"
                        onClick={() => startNidCamera("front")}
                        disabled={ocrLoading}
                      >
                        <Camera size={18} />
                        Capture NID
                      </Button>
                      {ocrLoading && (
                        <div className="absolute right-4 top-3.5 animate-spin text-primary">
                          <Loader2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground ml-1">
                      Capture either front or back side of NID (both sides not
                      required)
                    </p>
                  </div>
                </div>

                {/* NID CAMERA MODAL */}
                {showNidCamera && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-background rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                      <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-black text-lg">
                          Capture {nidSide === "front" ? "Front" : "Back"} Side
                          of NID
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelNidCamera}
                          className="rounded-full"
                        >
                          <X size={20} />
                        </Button>
                      </div>
                      <div className="relative bg-black aspect-video">
                        <video
                          ref={nidVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-4/5 h-4/5 border-2 border-dashed border-primary rounded-xl" />
                        </div>
                      </div>
                      <div className="p-4 flex justify-between gap-3">
                        <Button
                          variant="outline"
                          onClick={cancelNidCamera}
                          className="flex-1 rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={captureNidImage}
                          className="flex-1 rounded-xl gap-2"
                        >
                          <Camera size={18} />
                          Capture & Process
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ENGINE STATUS LOG VIEWBAR */}
                {ocrStatus && (
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 text-sm font-bold ${
                      ocrStatus.type === "success"
                        ? "bg-green-500/10 border-green-500/20 text-green-600"
                        : "bg-red-500/10 border-red-500/20 text-red-600"
                    }`}
                  >
                    {ocrStatus.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                    )}
                    <div>
                      <p>
                        {ocrStatus.type === "success"
                          ? "OCR Mapping Stream Verified"
                          : "OCR Pipeline Rejected Document"}
                      </p>
                      <p className="opacity-80 text-xs mt-0.5 font-normal">
                        {ocrStatus.message}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PRODUCT ENTRIES STREAM PANEL */}
            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">Purchase Items</h2>
                    <p className="text-sm text-muted-foreground">
                      Configure specifications and accumulate tracking logs
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-2xl border bg-background px-4 py-2">
                      <Checkbox
                        id="add-to-inventory"
                        checked={addToInventory}
                        onCheckedChange={(checked) =>
                          setAddToInventory(checked === true)
                        }
                      />
                      <Label
                        htmlFor="add-to-inventory"
                        className="cursor-pointer font-semibold"
                      >
                        Add to inventory
                      </Label>
                    </div>
                    <Button onClick={addItem} className="rounded-2xl">
                      <Plus size={16} className="mr-2" /> Add Item
                    </Button>
                  </div>
                </div>

                {addToInventory && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="inventory-category"
                      className="ml-1 text-sm font-bold text-muted-foreground"
                    >
                      Category Name
                    </Label>
                    <Select
                      value={selectedCategoryId}
                      onValueChange={setSelectedCategoryId}
                    >
                      <SelectTrigger
                        id="inventory-category"
                        className="h-12 w-full rounded-2xl border-primary bg-background font-bold"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesData?.data?.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-5">
                  {items.map((item, itemIndex) => {
                    const isScannerAvailable = item.name;
                    const currentItemRowTotal =
                      Number(item.expectedPrice || 0) *
                      Number(item.quantity || 1);

                    return (
                      <div
                        key={itemIndex}
                        className="border rounded-3xl p-6 bg-muted/20 space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-black">
                              Device #{itemIndex + 1}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Specification logging state control
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="rounded-2xl"
                            onClick={() => removeItem(itemIndex)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Input
                            placeholder="Item Name (Required)"
                            className="rounded-2xl h-12 border-primary bg-background font-bold"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(itemIndex, "name", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Storage / Memory (e.g., 256GB)"
                            className="rounded-2xl h-12 border-primary bg-background font-bold"
                            value={item.storage || ""}
                            onChange={(e) =>
                              updateItem(itemIndex, "storage", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Color"
                            className="rounded-2xl h-12 border-primary bg-background font-bold"
                            value={item.color || ""}
                            onChange={(e) =>
                              updateItem(itemIndex, "color", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Condition"
                            className="rounded-2xl h-12 border-primary bg-background font-bold"
                            value={item.condition || ""}
                            onChange={(e) =>
                              updateItem(itemIndex, "condition", e.target.value)
                            }
                          />
                          <div>
                            <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                              Quantity
                            </label>
                            <Input
                              type="number"
                              min={1}
                              className="rounded-2xl h-12 border-primary bg-background font-bold"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  itemIndex,
                                  "quantity",
                                  Math.max(1, Number(e.target.value)),
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                              Price Per Unit
                            </label>
                            <Input
                              type="number"
                              className="rounded-2xl h-12 border-primary bg-background font-bold"
                              value={item.expectedPrice}
                              onChange={(e) =>
                                updateItem(
                                  itemIndex,
                                  "expectedPrice",
                                  Number(e.target.value),
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-primary" />{" "}
                            Item Calculation Subtotal:
                          </span>
                          <span className="text-lg font-black text-primary font-mono">
                            {formatCurrency(currentItemRowTotal)}
                          </span>
                        </div>

                        {isScannerAvailable ? (
                          <div className="border-t pt-5 border-dashed border-muted-foreground/40 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <div>
                                <h4 className="font-black text-foreground flex items-center gap-2">
                                  <ScanLine className="w-5 h-5 text-primary" />
                                  Universal Processing Scanner Hub
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Type + Enter, engage active web camera
                                  tracking, or drop attachment image.
                                </p>
                              </div>

                              <div className="flex items-center gap-2 self-start md:self-auto">
                                <Button
                                  type="button"
                                  variant={
                                    activeCameraStream[itemIndex]
                                      ? "default"
                                      : "outline"
                                  }
                                  className="rounded-xl h-9 text-xs font-bold gap-1.5"
                                  onClick={() => toggleCameraScanner(itemIndex)}
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  {activeCameraStream[itemIndex]
                                    ? "Close Camera"
                                    : "Open Camera Stream"}
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  className="rounded-xl h-9 text-xs font-bold gap-1.5"
                                  disabled={isParsingFile[itemIndex]}
                                  onClick={() =>
                                    fileInputRefs.current[itemIndex]?.click()
                                  }
                                >
                                  {isParsingFile[itemIndex] ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Upload className="w-3.5 h-3.5" />
                                  )}
                                  Attach Receipt/Image
                                </Button>
                                <input
                                  type="file"
                                  ref={(el) => {
                                    fileInputRefs.current[itemIndex] = el;
                                  }}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleAttachmentUpload(e, itemIndex)
                                  }
                                />
                              </div>
                            </div>

                            {activeCameraStream[itemIndex] && (
                              <div className="relative w-full h-56 rounded-2xl bg-black border border-primary overflow-hidden flex flex-col items-center justify-center">
                                <video
                                  ref={(el) => {
                                    videoRefs.current[itemIndex] = el;
                                  }}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                />
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                  <div className="w-64 h-36 border-2 border-dashed border-primary rounded-xl relative flex items-center justify-center bg-black/10">
                                    <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] absolute top-1/2 left-0 animate-bounce" />
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="relative">
                              <Input
                                className="rounded-2xl h-12 pl-11 border-primary bg-background font-bold focus-visible:ring-primary"
                                placeholder="Scan/Type code here and press Enter to append seamlessly..."
                                value={scanInputs[itemIndex] || ""}
                                onChange={(e) =>
                                  setScanInputs((prev) => ({
                                    ...prev,
                                    [itemIndex]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) =>
                                  handleScanKeyDown(e, itemIndex)
                                }
                              />
                              <div className="absolute left-4 top-3.5 text-muted-foreground">
                                <ScanLine className="w-5 h-5" />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />{" "}
                                  Active Registers Log:
                                </span>
                                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md font-mono">
                                  {item.serials.length} Stored Ledger Nodes
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border rounded-2xl bg-background/50">
                                {item.serials.length === 0 && (
                                  <p className="text-xs text-muted-foreground/60 italic p-1">
                                    No identifiers cached inside streaming log
                                    grid yet.
                                  </p>
                                )}
                                {item.serials.map(
                                  (serial: string, serialIndex: number) => (
                                    <div
                                      key={serialIndex}
                                      className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-900 border px-3 py-1.5 rounded-xl group transition-all"
                                    >
                                      <span className="text-muted-foreground">
                                        #{serialIndex + 1}:
                                      </span>
                                      <span className="text-foreground tracking-tight">
                                        {serial}
                                      </span>
                                      <button
                                        type="button"
                                        className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                                        onClick={() =>
                                          removeSerial(itemIndex, serialIndex)
                                        }
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-4 border border-dashed rounded-2xl bg-zinc-50/50">
                            <p className="text-xs text-muted-foreground/80 font-bold">
                              Please define the baseline Item Name first to
                              unlock advanced tools.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANELS SYSTEM */}
          <div className="space-y-6">
            <Card className="rounded-[28px] overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-black">
                    {profileData?.data?.shopName || "N/A"}
                  </h2>
                  <p className="text-slate-300 mt-2">
                    {profileData?.data?.email || "N/A"}
                  </p>
                  <p className="text-slate-300">
                    {profileData?.data?.phone || "N/A"}
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-300 font-black mb-1">
                    Store Address
                  </p>
                  <p className="text-sm">
                    {profileData?.data?.shopAddress || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-0 shadow-sm">
              <CardContent className="p-8 space-y-5">
                <div>
                  <h2 className="text-2xl font-black">Receipt Summary</h2>
                  <p className="text-sm text-muted-foreground">
                    Purchase overview parameter logging
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                      Total Unique Devices
                    </p>
                    <p className="text-3xl font-black">{items.length}</p>
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">
                      Aggregated Scanned Identifiers
                    </p>
                    <p className="text-3xl font-black">
                      {items.reduce(
                        (acc, item) => acc + item.serials.length,
                        0,
                      )}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="text-base font-black uppercase tracking-tight">
                    Grand Total:
                  </span>
                  <span className="text-2xl font-black text-primary font-mono">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  disabled={!isFormValid || isSubmitting || ocrLoading}
                  onClick={handleCreateReceipt}
                  className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-wider"
                >
                  Create Purchase Receipt
                  {isSubmitting && <Loader2 className="ml-2 animate-spin" />}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
