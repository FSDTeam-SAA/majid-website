/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useSyncExternalStore,
} from "react";
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
  ShieldAlert,
  X,
  Search,
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
import { StructuredAddressFields } from "@/components/ui/structured-address-fields";
import { Label } from "@/components/ui/label";
import { formatCurrency as baseFormatCurrency } from "@/lib/currency";
import { getPdfLogoStyles } from "@/lib/logoHelper";
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
  useMyInventory,
} from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useMyInvoiceGet } from "@/features/shopkeeper/inventory/hooks/useInvoiceGenaretor";
import { InvoiceDateTimeSection } from "../../_components/InvoiceDateTimeSection";
import { CollectPaymentModal } from "../../_components/CollectPaymentModal";
import {
  createCheckoutPaymentForm,
  validateCheckoutPayment,
  CheckoutPaymentForm,
  CheckoutPaymentResult,
} from "@/features/shopkeeper/checkout/component/checkoutPayment";

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

// --- Purchase Receipt PDF Styles ---
const colors = {
  teal: "#155E63",
  tealDark: "#164E55",
  lime: "#84CC16",
  mint: "#BFE3DD",
  mintLight: "#EAF5F3",
  slate900: "#0F172A",
  slate700: "#334155",
  slate500: "#64748B",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  white: "#FFFFFF",
};

const pdfStyles = StyleSheet.create({
  page: {
    padding: 34,
    backgroundColor: "#F8FAFC",
    fontSize: 9,
    color: colors.slate700,
  },
  paper: {
    backgroundColor: colors.white,
    padding: 26,
    minHeight: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.slate200,
    paddingBottom: 18,
  },
  brandWrap: {
    flexShrink: 1,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoImage: {
    width: 130,
    height: 42,
    objectFit: "contain",
  },
  logoFallback: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.lime,
  },
  checkDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.lime,
    color: colors.white,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
  },
  shopAddress: {
    marginTop: 4,
    color: colors.slate500,
    fontSize: 8,
  },
  invoiceTitle: {
    fontSize: 24,
    color: colors.teal,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  metaGrid: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 14,
  },
  metaBlock: {
    flex: 1,
    gap: 4,
  },
  metaDivider: {
    width: 1,
    backgroundColor: colors.slate200,
    marginHorizontal: 18,
  },
  metaLabel: {
    color: colors.slate500,
    fontWeight: "bold",
  },
  metaText: {
    color: colors.slate900,
    fontWeight: "bold",
  },
  pillRow: {
    flexDirection: "row",
    marginBottom: 14,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  customerPill: {
    width: "50%",
    backgroundColor: colors.slate100,
    color: colors.slate900,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  shopPill: {
    flex: 1,
    backgroundColor: colors.white,
    color: colors.slate700,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderLeftColor: colors.slate200,
  },
  customerTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.slate500,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.slate900,
  },
  customerDetail: {
    fontSize: 8,
    color: colors.slate500,
    marginTop: 2,
  },
  muted: {
    fontSize: 7.5,
    color: colors.slate500,
    marginTop: 2,
    lineHeight: 1.4,
  },
  shopTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: colors.slate500,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  shopName: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.lime,
    textTransform: "uppercase",
  },
  shopDetail: {
    fontSize: 8,
    color: colors.slate500,
    marginTop: 3,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.teal,
    color: colors.white,
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
    alignItems: "center",
  },
  rowAlt: {
    backgroundColor: "#F8FAFC",
  },
  colProduct: {
    width: "45%",
    paddingRight: 6,
  },
  colQty: {
    width: "15%",
    textAlign: "center",
  },
  colSerials: {
    width: "20%",
    paddingHorizontal: 4,
  },
  colPrice: {
    width: "20%",
    textAlign: "right",
    fontWeight: "bold",
    color: colors.slate900,
  },
  productName: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.slate900,
  },
  modelText: {
    fontSize: 8,
    color: colors.slate500,
    marginTop: 2,
  },
  serialText: {
    fontSize: 8,
    color: colors.slate700,
    backgroundColor: colors.slate100,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 2,
    alignSelf: "flex-start",
  },
  totals: {
    marginLeft: "50%",
    marginTop: 15,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  amountDue: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.lime,
    color: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    marginTop: 24,
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    paddingTop: 14,
  },
  terms: {
    flex: 1,
  },
  termsTitle: {
    color: colors.teal,
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 9,
  },
  contactBar: {
    marginTop: 16,
    backgroundColor: colors.slate100,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    color: colors.slate500,
    fontSize: 8,
    borderRadius: 6,
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
    return baseFormatCurrency(value, currency || "GBP");
  };

  const receiptDate = invoiceDate ? new Date(invoiceDate) : new Date();
  const shopName = shopkeeper?.shopName || "STORE";
  const contactEmail = shopkeeper?.email || "info@store.com";
  const contactPhone = shopkeeper?.phone || "N/A";
  const shopAddress = shopkeeper?.shopAddress || "N/A";
  const preparedBy =
    [shopkeeper?.firstName, shopkeeper?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || shopName;
  const customerName =
    [customer?.firstName, customer?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Walk-In Customer";
  const customerPhone = customer?.phone || "N/A";
  const customerEmail = customer?.email || "N/A";
  const customerAddress = customer?.address || "";
  const customerId = customer?.idNumber || "N/A";
  const itemCount = items?.length || 0;
  const serialCount =
    items?.reduce(
      (count: number, item: any) => count + Number(item?.serials?.length || 0),
      0,
    ) || 0;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View style={pdfStyles.brandWrap}>
            <View style={pdfStyles.brandRow}>
              {shopkeeper?.image?.url ? (
                (() => {
                  const logoStyles = getPdfLogoStyles(
                    shopkeeper.logoSettings,
                    34,
                    34,
                  );
                  return (
                    <View style={logoStyles.container}>
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <Image
                        src={shopkeeper.image.url}
                        style={logoStyles.image}
                      />
                    </View>
                  );
                })()
              ) : (
                <Text style={pdfStyles.logoFallback}>{shopName}</Text>
              )}
              <Text style={pdfStyles.checkDot}>✓</Text>
            </View>
            <Text style={pdfStyles.shopAddress}>
              {shopAddress} • {contactPhone}
            </Text>
          </View>
          <Text style={pdfStyles.invoiceTitle}>PURCHASE RECEIPT</Text>
        </View>

        <View style={pdfStyles.metaGrid}>
          <View style={pdfStyles.metaBlock}>
            <Text>
              <Text style={pdfStyles.metaLabel}>Date </Text>
              <Text style={pdfStyles.metaText}>
                {receiptDate.toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </Text>
            <Text>
              <Text style={pdfStyles.metaLabel}>Time </Text>
              <Text style={pdfStyles.metaText}>
                {receiptDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </Text>
          </View>
          <View style={pdfStyles.metaDivider} />
          <View style={pdfStyles.metaBlock}>
            <Text>
              <Text style={pdfStyles.metaLabel}>Prepared By </Text>
              <Text style={pdfStyles.metaText}>{preparedBy}</Text>
            </Text>
            <Text>
              <Text style={pdfStyles.metaLabel}>Items </Text>
              <Text style={pdfStyles.metaText}>{itemCount}</Text>
            </Text>
          </View>
          <View style={pdfStyles.metaDivider} />
          <View style={pdfStyles.metaBlock}>
            <Text>
              <Text style={pdfStyles.metaLabel}>Serials </Text>
              <Text style={pdfStyles.metaText}>{serialCount}</Text>
            </Text>
            <Text>
              <Text style={pdfStyles.metaLabel}>Currency </Text>
              <Text style={pdfStyles.metaText}>
                {(currency || "USD").toUpperCase()}
              </Text>
            </Text>
          </View>
        </View>

        <View style={pdfStyles.pillRow}>
          <View style={pdfStyles.customerPill}>
            <Text style={pdfStyles.customerTitle}>Customer Details</Text>
            <Text style={pdfStyles.customerName}>{customerName}</Text>
            <Text style={pdfStyles.customerDetail}>Phone: {customerPhone}</Text>
            <Text style={pdfStyles.customerDetail}>Email: {customerEmail}</Text>
            {customerAddress ? (
              <Text style={pdfStyles.customerDetail}>
                Address: {customerAddress}
              </Text>
            ) : null}
            <Text style={pdfStyles.customerDetail}>NID: {customerId}</Text>
          </View>
          <View style={pdfStyles.shopPill}>
            <Text style={pdfStyles.shopTitle}>Shop Information</Text>
            <Text style={pdfStyles.shopName}>{shopName}</Text>
            <Text style={pdfStyles.shopDetail}>{shopAddress}</Text>
            <Text style={pdfStyles.shopDetail}>{contactPhone}</Text>
            <Text style={pdfStyles.shopDetail}>{contactEmail}</Text>
          </View>
        </View>

        <View>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.colProduct}>Product Specifications</Text>
            <Text style={pdfStyles.colQty}>Qty</Text>
            <Text style={pdfStyles.colSerials}>IMEI / Serials</Text>
            <Text style={pdfStyles.colPrice}>Price</Text>
          </View>
          {items?.map((item: any, index: number) => (
            <View
              key={index}
              style={
                index % 2 === 1
                  ? [pdfStyles.row, pdfStyles.rowAlt]
                  : pdfStyles.row
              }
            >
              <View style={pdfStyles.colProduct}>
                <Text style={pdfStyles.productName}>{item.name}</Text>
                <Text style={pdfStyles.modelText}>
                  {item.storage} • {item.color}
                </Text>
              </View>
              <Text style={pdfStyles.colQty}>{item.quantity}</Text>
              <View style={pdfStyles.colSerials}>
                {item.serials?.length ? (
                  item.serials.map((serial: string, idx: number) => (
                    <Text key={idx} style={pdfStyles.serialText}>
                      • {serial}
                    </Text>
                  ))
                ) : (
                  <Text style={pdfStyles.modelText}>N/A</Text>
                )}
              </View>
              <Text style={pdfStyles.colPrice}>
                {pdfFormatCurrency(
                  Number(item.expectedPrice || 0) * Number(item.quantity || 1),
                )}
              </Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.totals}>
          <View style={pdfStyles.amountDue}>
            <Text>Total Value:</Text>
            <Text>{pdfFormatCurrency(total)}</Text>
          </View>
        </View>

        <View style={pdfStyles.footer}>
          <View style={pdfStyles.terms}>
            <Text style={pdfStyles.termsTitle}>
              Thank you for your purchase!
            </Text>
            <Text style={pdfStyles.muted}>
              Please keep this receipt for warranty and records. All item
              conditions were verified at the counter by both customer and store
              technician.
            </Text>
          </View>
        </View>

        <View style={pdfStyles.contactBar}>
          <Text>{contactPhone}</Text>
          <Text>{contactEmail}</Text>
          <Text>Purchase Receipt</Text>
        </View>
      </Page>
    </Document>
  );
};

export default function CreatePurchaseReceipt() {
  const { data: profileData } = useMyProfile();
  const { currency, formatCurrency } = useCurrency();
  const { mutateAsync: createInvoice } = useCreateInvoice();
  const { data: categoriesData } = useCategories();
  const { mutateAsync: createInventory } = useCreateInventory();
  const { data: inventoryData } = useMyInventory();
  const session = useSession();
  const shopkeeperId = session?.data?.user?.id;

  const uniqueInventoryData = useMemo(() => {
    const invItems = inventoryData?.data || [];
    return {
      names: Array.from(
        new Set(invItems.map((i) => i.itemName).filter(Boolean) as string[]),
      ),
      storages: Array.from(
        new Set(invItems.map((i) => i.storage).filter(Boolean) as string[]),
      ),
      colors: Array.from(
        new Set(invItems.map((i) => i.color).filter(Boolean) as string[]),
      ),
      conditions: Array.from(
        new Set(
          invItems
            .map((i: any) => i.condition || i.currentState)
            .filter(Boolean) as string[],
        ),
      ),
    };
  }, [inventoryData]);

  const emptyInventoryItem = {
    name: "",
    storage: "",
    color: "",
    condition: "",
    quantity: 1,
    expectedPrice: 0,
    serials: [],
  };

  const { isPending: isCreatingInvoice } = useCreateInvoice();
  const { isPending: isCreatingInventory } = useCreateInventory();

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
  const [, setCapturedImage] = useState<string | null>(null);
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
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [validationAttempted, setValidationAttempted] = useState(false);
  const getInvoiceUser = useMyInvoiceGet(shopkeeperId || "223423423");
  const customers = useMemo(
    () => getInvoiceUser?.data?.data || [],
    [getInvoiceUser?.data?.data],
  );
  const filteredCustomers = useMemo(() => {
    const query = customerSearchQuery.trim().toLowerCase();
    if (!query) return customers;

    return customers.filter((existingCustomer: any) =>
      [
        existingCustomer.firstName,
        existingCustomer.lastName,
        existingCustomer.email,
        existingCustomer.phone,
        existingCustomer.customerId,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [customers, customerSearchQuery]);
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
        expectedPrice: "",
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
    } catch {
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
    } catch {
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
      } catch {
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
    } catch {
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
      Boolean(customer.firstName.trim()) &&
      Boolean(customer.phone.trim()) &&
      items.length > 0 &&
      items.every(
        (item) =>
          Boolean(String(item.name || "").trim()) && item.serials.length > 0,
      )
    );
  }, [customer, items]);

  const hasInventoryCategoryError =
    validationAttempted && addToInventory && !selectedCategoryId;
  const hasCustomerFirstNameError =
    validationAttempted && !customer.firstName.trim();
  const hasCustomerPhoneError = validationAttempted && !customer.phone.trim();

  const getItemNameError = (item: any) =>
    validationAttempted && !String(item.name || "").trim();

  const getItemSerialError = (item: any) =>
    validationAttempted && (!item.serials || item.serials.length === 0);

  const total = items.reduce(
    (acc, item) =>
      acc + Number(item.expectedPrice || 0) * Number(item.quantity || 1),
    0,
  );
  const isSubmitting = isCreatingInvoice || isCreatingInventory;

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<CheckoutPaymentForm>(() =>
    createCheckoutPaymentForm(0),
  );

  const handleInitiateReceipt = () => {
    setValidationAttempted(true);

    if (!isFormValid) {
      toast.error(
        "Please complete all required fields and ensure barcodes are populated",
      );
      return;
    }

    if (hasInventoryCategoryError) {
      toast.error("Please select a category name");
      return;
    }

    setPaymentForm((prev) => ({
      ...createCheckoutPaymentForm(total),
      method: prev.method || "cash",
    }));
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      paymentForm.method === "due" &&
      !customer.firstName &&
      !customer.phone
    ) {
      toast.error(
        "Customer information is required before recording an amount due",
      );
      return;
    }

    const { error, payment } = validateCheckoutPayment(paymentForm, total);

    if (error || !payment) {
      toast.error(error || "Payment details are incomplete");
      return;
    }

    await handleCreateReceipt(payment);
  };

  const handleCreateReceipt = async (payment?: CheckoutPaymentResult) => {
    const doc = (
      <PurchaseReceiptPDF
        customer={customer}
        items={items}
        shopkeeper={profileData?.data}
        total={total}
        invoiceDate={invoiceDate}
        currency={currency}
        payment={payment}
      />
    );
    const blob = await pdf(doc).toBlob();
    const file = new File(
      [blob],
      `purchase_receipt_${customer.firstName || "customer"}.pdf`,
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

      setIsPaymentModalOpen(false);

      toast.success(
        addToInventory
          ? "Purchase receipt created and items added to inventory"
          : "Purchase receipt created successfully",
      );
    } catch {
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">
                Purchase Receipt Generator
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-600 px-3 py-1 rounded-xl text-xs font-bold">
                <Package size={14} />
                {items.length} Items Configured
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unified pipeline mapping identity verification parsing alongside
              barcode registry logs
            </p>
          </div>

          <InvoiceDateTimeSection
            value={invoiceDate}
            onChange={setInvoiceDate}
          />
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

                <div className="space-y-3">
                  <label className="font-bold text-sm text-muted-foreground ml-1">
                    Select Existing Customer
                  </label>
                  <Select
                    value={selectedCustomerId}
                    onValueChange={(value) => {
                      setSelectedCustomerId(value);
                      setCustomerSearchQuery("");

                      const selectedCustomer = customers.find(
                        (customer: any) => customer._id === value,
                      ) as any;

                      if (selectedCustomer) {
                        setCustomer({
                          firstName: selectedCustomer.firstName || "",
                          lastName: selectedCustomer.lastName || "",
                          email: selectedCustomer.email || "",
                          phone: selectedCustomer.phone || "",
                          address: selectedCustomer.address || "",
                          idNumber:
                            selectedCustomer.customerId ||
                            selectedCustomer.idNumber ||
                            "",
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-2xl h-12 border-primary bg-background font-bold">
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-primary">
                      <div className="sticky top-0 z-10 bg-background p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={customerSearchQuery}
                            onChange={(event) =>
                              setCustomerSearchQuery(event.target.value)
                            }
                            onKeyDown={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                            placeholder="Search customers..."
                            className="h-11 rounded-xl border-primary pl-9 font-medium"
                          />
                        </div>
                      </div>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer: any) => (
                          <SelectItem
                            key={customer._id}
                            value={customer._id}
                            className="py-3"
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {customer.firstName} {customer.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {customer.phone}
                                {customer.customerId
                                  ? ` · ${customer.customerId}`
                                  : ""}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-sm text-muted-foreground">
                          No customers found.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    placeholder="First Name"
                    className={`rounded-2xl h-12 border-primary bg-background font-bold ${
                      hasCustomerFirstNameError
                        ? "border-red-500 ring-2 ring-red-500/20"
                        : ""
                    }`}
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
                    className={`rounded-2xl h-12 border-primary bg-background font-bold ${
                      hasCustomerPhoneError
                        ? "border-red-500 ring-2 ring-red-500/20"
                        : ""
                    }`}
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                  />
                  <div className="md:col-span-2">
                    <StructuredAddressFields
                      required
                      value={customer.address}
                      onChange={(address) =>
                        setCustomer({ ...customer, address })
                      }
                    />
                  </div>

                  {/* MANUAL OR AUTOMATIC IDENTITY SECTOR BLOCK - UPDATED WITH CAMERA BUTTONS */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="font-bold text-sm text-muted-foreground ml-1">
                      Customer ID Number / NID Field (Optional)
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
                      <div
                        onClick={() => setAddToInventory(!addToInventory)}
                        className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                          addToInventory ? "bg-[#84CC16]" : "bg-red-500"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            addToInventory ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </div>
                      <Label
                        className="cursor-pointer font-semibold"
                        onClick={() => setAddToInventory(!addToInventory)}
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
                        className={`h-12 w-full rounded-2xl border-primary bg-background font-bold ${
                          hasInventoryCategoryError
                            ? "border-red-500 ring-2 ring-red-500/20"
                            : ""
                        }`}
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

                {/* Datalists for Inventory Autocomplete */}
                <datalist id="inventory-names">
                  {uniqueInventoryData.names.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <datalist id="inventory-storages">
                  {uniqueInventoryData.storages.map((storage) => (
                    <option key={storage} value={storage} />
                  ))}
                </datalist>
                <datalist id="inventory-colors">
                  {uniqueInventoryData.colors.map((color) => (
                    <option key={color} value={color} />
                  ))}
                </datalist>
                <datalist id="inventory-conditions">
                  {uniqueInventoryData.conditions.map((condition) => (
                    <option key={condition} value={condition} />
                  ))}
                </datalist>

                <div className="space-y-5">
                  {items.map((item, itemIndex) => {
                    const isScannerAvailable = item.name;
                    const currentItemRowTotal =
                      Number(item.expectedPrice || 0) *
                      Number(item.quantity || 1);
                    const itemNameError = getItemNameError(item);
                    const itemSerialError = getItemSerialError(item);

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
                          <div>
                            <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                              Item Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                              list="inventory-names"
                              placeholder="Select or Type Item Name"
                              className={`rounded-2xl h-12 border-primary bg-background font-bold ${
                                itemNameError
                                  ? "border-red-500 ring-2 ring-red-500/20"
                                  : ""
                              }`}
                              value={item.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                const allInv = inventoryData?.data || [];
                                const found = allInv.find(
                                  (d: any) => d.itemName === val,
                                );
                                if (found) {
                                  const updated = [...items];
                                  updated[itemIndex] = {
                                    ...updated[itemIndex],
                                    name: found.itemName,
                                    storage: found.storage || "",
                                    color: found.color || "",
                                    condition:
                                      (found as any).condition ||
                                      found.currentState ||
                                      "",
                                    expectedPrice:
                                      found.expectedPrice ||
                                      updated[itemIndex].expectedPrice,
                                  };
                                  setItems(updated);
                                } else {
                                  updateItem(itemIndex, "name", val);
                                }
                              }}
                            />
                          </div>

                          <div>
                            <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                              Storage / Memory
                            </label>
                            <Input
                              list="inventory-storages"
                              placeholder="Select or Type Storage"
                              className="rounded-2xl h-12 border-primary bg-background font-bold"
                              value={item.storage || ""}
                              onChange={(e) =>
                                updateItem(itemIndex, "storage", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                              Color
                            </label>
                            <Input
                              list="inventory-colors"
                              placeholder="Select or Type Color"
                              className="rounded-2xl h-12 border-primary bg-background font-bold"
                              value={item.color || ""}
                              onChange={(e) =>
                                updateItem(itemIndex, "color", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <label className="font-bold text-sm text-muted-foreground ml-1 mb-1 block">
                              Condition
                            </label>
                            <Input
                              list="inventory-conditions"
                              placeholder="Select or Type Condition"
                              className="rounded-2xl h-12 border-primary bg-background font-bold"
                              value={item.condition || ""}
                              onChange={(e) =>
                                updateItem(
                                  itemIndex,
                                  "condition",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
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
                              min={0}
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
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Item Calculation Subtotal:
                          </span>
                          <span className="text-lg font-black text-primary font-mono">
                            {formatCurrency(currentItemRowTotal, currency)}
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
                                className={`rounded-2xl h-12 pl-11 border-primary bg-background font-bold focus-visible:ring-primary ${
                                  itemSerialError
                                    ? "border-red-500 ring-2 ring-red-500/20"
                                    : ""
                                }`}
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

                              <div
                                className={`flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1.5 border rounded-2xl bg-background/50 ${
                                  itemSerialError
                                    ? "border-red-500 ring-2 ring-red-500/20"
                                    : ""
                                }`}
                              >
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
                              {itemSerialError && (
                                <p className="text-xs font-semibold text-red-600">
                                  Add at least one barcode or serial number for
                                  this item.
                                </p>
                              )}
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
                    {formatCurrency(total, currency)}
                  </span>
                </div>

                <Button
                  disabled={isSubmitting || ocrLoading}
                  onClick={handleInitiateReceipt}
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

      <CollectPaymentModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        totalAmount={total}
        currency={currency}
        formatCurrency={formatCurrency}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        onConfirm={handleConfirmPayment}
        isPending={isSubmitting}
        isDueDisabled={!customer.firstName && !customer.phone}
        confirmButtonText="Confirm & Print Receipt"
      />
    </div>
  );
}
