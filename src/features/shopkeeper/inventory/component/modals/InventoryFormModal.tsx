"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useForm,
  type Control,
  type FieldErrors,
  type FieldError,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  MoreVertical,
  X,
  Smartphone,
  Hash,
  DollarSign,
  Activity,
  Barcode,
  Camera,
  CheckCircle2,
  Search,
  FileUp,
  Tag,
  Package,
  Palette,
  HardDrive,
  Maximize2,
  Users,
  Store,
  Layers,
  AlertTriangle,
  FileText,
  Settings,
  Scan,
  Plus,
  FolderOpen,
  User,
  Mail,
  MapPin,
  CreditCard,
  ShoppingCart,
  Phone,
  Truck,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pdf } from "@react-pdf/renderer";
import SalesInvoicePDF, { SalesInvoicePDFProps } from "./SalesInvoicePDF";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";

import {
  CreateInventorySchema,
  type CreateInventoryInput,
  type InventoryItem,
  type ScanResultData,
  type BulkBarcodeItem,
} from "../../types";
import {
  useCreateInventory,
  useUpdateInventory,
  useCreateFromBarcode,
  useCreateFromBarcodeBulk,
  useCreateCustomer,
  useCustomersByShopkeeper,
  useCreateInvoice,
  useImportCsvInventory,
  useCategories,
  useBarcodeProductSearch,
} from "../../hooks/useInventory";
import { Category } from "../../types";
import {
  useSuppliers,
  useCreateSupplier,
} from "../../../supplier/hooks/useSuppliers";
import { SupplierFormModal } from "../../../supplier/component/modals/SupplierFormModal";
import { ScanResultModal } from "./ScanResultModal";
import { useCurrency } from "@/hooks/useCurrency";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { generateGoogleReviewQrCodeDataUrl } from "@/features/shopkeeper/settings/utils/googleReviewQr";

type BarcodeSearchItem = {
  name?: string;
  brand?: string;
  category?: string;
  description?: string;
  barcode?: string;
  image?: string;
  images?: string[];
  color?: string;
  size?: string;
  rawData?: Record<string, unknown>;
};

// ─── Import CSV sub-component (used as the 3rd tab inside the modal) ──────────
function ImportCsvModalContent({
  onClose,
  categoryId,
}: {
  onClose: () => void;
  categoryId?: string;
}) {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id ?? "";
  const { mutateAsync: importCsv, isPending } = useImportCsvInventory();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categoryId || "",
  );

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const csvInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_EXTS = [".csv", ".xls", ".xlsx"];
  const ACCEPTED_MIME = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const pickFile = (f: File) => {
    const valid =
      ACCEPTED_MIME.includes(f.type) ||
      ACCEPTED_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!valid) {
      toast.error("Only CSV, XLS, or XLSX files are accepted.");
      return;
    }
    setFile(f);
    setUploadStatus("idle");
    setErrorMsg("");
  };

  const onCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) pickFile(picked);
    e.target.value = "";
  };

  const handleCsvSubmit = async () => {
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
        categoryId: selectedCategoryId || categoryId || undefined,
      });
      setUploadStatus("success");
      setFile(null);
      toast.success("Inventory imported successfully!");
      setTimeout(() => onClose(), 1200);
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
    <div className="flex flex-col gap-6 py-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const dropped = e.dataTransfer.files[0];
          if (dropped) pickFile(dropped);
        }}
        onClick={() => !file && csvInputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-4 rounded-[28px] border-2 border-dashed p-10 cursor-pointer transition-all min-h-[220px]
          ${
            dragOver
              ? "border-[#84CC16] bg-[#84CC16]/6"
              : file
                ? "border-[#84CC16] bg-[#84CC16]/4"
                : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30"
          }`}
      >
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          className="hidden"
          onChange={onCsvFileChange}
        />

        {!file ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#84CC16]/10 text-[#84CC16]">
              <Upload className="w-7 h-7" strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                Drag & drop your file here
              </p>
              <p className="text-xs font-bold text-slate-400 mt-1">
                or{" "}
                <span className="text-[#84CC16] underline underline-offset-2">
                  browse
                </span>{" "}
                to choose
              </p>
            </div>
            <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
              Supports .CSV · .XLS · .XLSX
            </p>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#84CC16]/15 text-[#84CC16]">
              <FileText className="w-7 h-7" strokeWidth={2} />
            </span>
            <div className="text-center">
              <p className="text-sm font-black text-slate-900 dark:text-white break-all max-w-xs">
                {file.name}
              </p>
              <p className="text-xs font-bold text-slate-400 mt-0.5">
                {fileSize}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setUploadStatus("idle");
                setErrorMsg("");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Remove file
            </button>
          </div>
        )}
      </div>

      {/* Status banners */}
      {uploadStatus === "success" && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle2 className="text-green-500 flex-shrink-0 w-5 h-5" />
          <p className="text-sm font-bold text-green-700 dark:text-green-400">
            Import successful! Your inventory has been updated.
          </p>
        </div>
      )}
      {uploadStatus === "error" && errorMsg && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 border border-red-100 dark:bg-red-900/20 dark:border-red-800">
          <AlertTriangle className="text-red-500 flex-shrink-0 w-5 h-5" />
          <p className="text-sm font-bold text-red-600 dark:text-red-400">
            {errorMsg}
          </p>
        </div>
      )}

      {/* Submit button */}
      <Button
        type="button"
        onClick={handleCsvSubmit}
        disabled={!file || isPending}
        className="w-full h-14 rounded-2xl bg-[#84CC16] hover:bg-[#76b813] text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-lime-500/25 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" strokeWidth={2.5} />
            Submit &amp; Import
          </>
        )}
      </Button>

      <p className="mx-auto max-w-[800px] text-center text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600">
        Upload a CSV file with inventory rows. The file should use the same
        columns as the template endpoint. Each row is imported individually and
        the response includes per-row success or failure results.
      </p>
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

const BRANDS = [
  "Apple",
  "Samsung",
  "Google",
  "Huawei",
  "Xiaomi",
  "Oppo",
  "Vivo",
  "Sony",
  "LG",
  "Nokia",
  "OnePlus",
  "Other",
];

const STORAGE_OPTIONS = [
  "16GB",
  "32GB",
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
  "Other",
];

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Silver",
  "Gold",
  "Space Gray",
  "Blue",
  "Red",
  "Green",
  "Other",
];

const SALE_METHODS = [
  "In-store",
  "eBay",
  "Amazon",
  "own website",
  "WhatsApp",
  "Facebook",
  "Other",
];

const generateRandomInvoiceNumber = () =>
  `#INV-${Math.floor(Math.random() * 100000)}`;

const splitMultiValueField = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const joinMultiValueField = (values: string[]) =>
  values
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");

const normalizeItemName = (value?: string | null) => {
  if (!value) return "";
  return value.split("/")[0]?.trim() || value.trim();
};

const getPreferredBarcodeItemName = (
  primaryName?: string | null,
  barcodeResult?: Record<string, unknown>,
  aiInsight?: Record<string, unknown>,
) => {
  const normalizedPrimaryName = normalizeItemName(primaryName);
  const fallbackModel =
    typeof barcodeResult?.rawData === "object" &&
    barcodeResult.rawData !== null &&
    "model" in barcodeResult.rawData
      ? normalizeItemName(String(barcodeResult.rawData.model || ""))
      : "";
  const fallbackTitle = normalizeItemName(
    typeof barcodeResult?.title === "string"
      ? barcodeResult.title
      : typeof barcodeResult?.rawData === "object" &&
          barcodeResult.rawData !== null &&
          "title" in barcodeResult.rawData
        ? String(barcodeResult.rawData.title || "")
        : "",
  );
  const fallbackInsightTitle = normalizeItemName(
    typeof aiInsight?.title === "string" ? aiInsight.title : "",
  );
  const genericNamePattern = /\bunknown product\b/i;

  if (
    normalizedPrimaryName &&
    !genericNamePattern.test(normalizedPrimaryName)
  ) {
    return normalizedPrimaryName;
  }

  if (fallbackTitle) return fallbackTitle;
  if (fallbackModel) return fallbackModel;
  if (fallbackInsightTitle) return fallbackInsightTitle;
  return normalizedPrimaryName || "";
};

const getBarcodeMetadataValue = (
  barcodeResult: Record<string, unknown> | undefined,
  ...keys: string[]
) => {
  for (const key of keys) {
    const topLevelValue = barcodeResult?.[key];
    if (
      typeof topLevelValue === "string" &&
      topLevelValue.trim() &&
      topLevelValue.trim().toLowerCase() !== "n/a"
    ) {
      return topLevelValue.trim();
    }

    const rawData =
      typeof barcodeResult?.rawData === "object" &&
      barcodeResult.rawData !== null
        ? (barcodeResult.rawData as Record<string, unknown>)
        : undefined;
    const rawValue = rawData?.[key];
    if (
      typeof rawValue === "string" &&
      rawValue.trim() &&
      rawValue.trim().toLowerCase() !== "n/a"
    ) {
      return rawValue.trim();
    }
  }

  return "";
};

const getBarcodeImageUrl = (barcodeResult?: Record<string, unknown>) => {
  const topLevelImage =
    typeof barcodeResult?.image === "string" ? barcodeResult.image.trim() : "";
  if (topLevelImage) return topLevelImage;

  const rawData =
    typeof barcodeResult?.rawData === "object" && barcodeResult.rawData !== null
      ? (barcodeResult.rawData as Record<string, unknown>)
      : undefined;

  if (Array.isArray(rawData?.images)) {
    const firstImage = rawData.images.find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );
    if (firstImage) return firstImage.trim();
  }

  return "";
};

const getBarcodeImageUrls = (barcodeResult?: Record<string, unknown>) => {
  const urls = new Set<string>();

  const topLevelImage =
    typeof barcodeResult?.image === "string" ? barcodeResult.image.trim() : "";
  if (topLevelImage) urls.add(topLevelImage);

  if (Array.isArray(barcodeResult?.images)) {
    barcodeResult.images.forEach((value) => {
      if (typeof value === "string" && value.trim()) {
        urls.add(value.trim());
      }
    });
  }

  const rawData =
    typeof barcodeResult?.rawData === "object" && barcodeResult.rawData !== null
      ? (barcodeResult.rawData as Record<string, unknown>)
      : undefined;

  if (Array.isArray(rawData?.images)) {
    rawData.images.forEach((value) => {
      if (typeof value === "string" && value.trim()) {
        urls.add(value.trim());
      }
    });
  }

  return Array.from(urls);
};

const getSuggestionBarcode = (product?: BarcodeSearchItem) => {
  const directBarcode =
    typeof product?.barcode === "string" ? product.barcode.trim() : "";
  if (directBarcode && directBarcode.toUpperCase() !== "N/A") {
    return directBarcode;
  }

  const rawData =
    typeof product?.rawData === "object" && product.rawData !== null
      ? (product.rawData as Record<string, unknown>)
      : undefined;

  const rawCandidates = [
    rawData?.barcode_number,
    rawData?.barcode,
    rawData?.ean,
    rawData?.upc,
    rawData?.mpn,
  ];

  for (const candidate of rawCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  if (typeof rawData?.barcode_formats === "string") {
    const match = rawData.barcode_formats.match(/\b(\d{8,14})\b/);
    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
};

const getSuggestionTitle = (product?: BarcodeSearchItem) => {
  if (typeof product?.name === "string" && product.name.trim()) {
    const normalizedName = product.name.trim();
    if (normalizedName.toLowerCase() !== "unknown product") {
      return normalizedName;
    }
  }

  const rawData =
    typeof product?.rawData === "object" && product.rawData !== null
      ? (product.rawData as Record<string, unknown>)
      : undefined;

  const titleCandidates = [
    rawData?.title,
    rawData?.product_name,
    rawData?.name,
  ];
  for (const candidate of titleCandidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return product?.brand?.trim() || "Unnamed Product";
};

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  forceType?: "inventory" | "sold";
  categoryId?: string;
}

export function InventoryFormModal({
  isOpen,
  onClose,
  item,
  forceType,
  categoryId,
}: InventoryFormModalProps) {
  const { currency, currencySymbol, formatCurrency } = useCurrency();
  const { data: profileData } = useMyProfile();
  const isEditMode = !!item;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const barcodeImageInputRef = useRef<HTMLInputElement>(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const barcodeDeviceImageInputRef = useRef<HTMLInputElement>(null);
  const [barcodeImagePreview, setBarcodeImagePreview] = useState<string | null>(
    null,
  );
  const [manualBarcode, setManualBarcode] = useState("");
  const [barcodeImei, setBarcodeImei] = useState("");
  const [activeTab, setActiveTab] = useState("manual");
  const [barcodePurchasePrice, setBarcodePurchasePrice] = useState("");
  const [barcodeCondition, setBarcodeCondition] = useState("new");
  const [barcodeDeviceImage, setBarcodeDeviceImage] = useState<File | null>(
    null,
  );
  const [barcodeDeviceImagePreview, setBarcodeDeviceImagePreview] = useState<
    string | null
  >(null);
  const [productNameSearch, setProductNameSearch] = useState("");
  const [debouncedProductNameSearch, setDebouncedProductNameSearch] =
    useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [selectedSearchBarcode, setSelectedSearchBarcode] = useState("");
  const [suggestedExpectedPrice, setSuggestedExpectedPrice] = useState<
    number | null
  >(null);
  const productSuggestionRef = useRef<HTMLDivElement>(null);
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomCondition, setIsCustomCondition] = useState(false);
  const [isCustomStorage, setIsCustomStorage] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [isCustomSaleMethod, setIsCustomSaleMethod] = useState(false);
  const [colorValues, setColorValues] = useState<string[]>([""]);
  const [storageValues, setStorageValues] = useState<string[]>([""]);

  // Supplier search state
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const supplierDropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: suppliersResponse } = useSuppliers({
    search: supplierSearch.trim() || undefined,
    isActive: true,
    limit: 50,
  });
  const suppliers = suppliersResponse?.data || [];
  const createSupplierMutation = useCreateSupplier();
  const { data: categoriesData } = useCategories();
  const { data: barcodeSearchResponse, isFetching: isSearchingProducts } =
    useBarcodeProductSearch(debouncedProductNameSearch);
  const categories = categoriesData?.data || [];
  const barcodeSearchResults =
    ((barcodeSearchResponse?.data || []) as BarcodeSearchItem[]) || [];

  // Bulk Upload States
  const [bulkItems, setBulkItems] = useState<BulkBarcodeItem[]>([
    {
      code: "",
      purchasePrice: 0,
      expectedPrice: 0,
      supplierId: "",
      quantity: 1,
      currentState: "new",
      color: "",
      storage: "",
    },
  ]);

  const addBulkRow = () => {
    setBulkItems([
      ...bulkItems,
      {
        code: "",
        purchasePrice: 0,
        expectedPrice: 0,
        supplierId: "",
        quantity: 1,
        currentState: "new",
        color: "",
        storage: "",
      },
    ]);
  };

  const removeBulkRow = (index: number) => {
    if (bulkItems.length > 1) {
      setBulkItems(bulkItems.filter((_, i) => i !== index));
    }
  };

  const updateBulkItem = <K extends keyof BulkBarcodeItem>(
    index: number,
    field: K,
    value: BulkBarcodeItem[K],
  ) => {
    const updated = [...bulkItems];
    updated[index] = { ...updated[index], [field]: value };
    setBulkItems(updated);
  };

  const handleBulkSubmit = () => {
    const validItems = bulkItems.filter((i) => i.code.trim());
    if (validItems.length === 0) {
      toast.error("Please add at least one item with a code");
      return;
    }

    if (!session?.user?.id) {
      toast.error("User session not found");
      return;
    }

    const currentCategoryId = form.getValues("categoryId") || categoryId;

    handleCreateFromBarcodeBulk(
      {
        userId: session.user.id,
        barcodes: validItems,
        categoryId: currentCategoryId || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Bulk inventory added successfully");
          onClose();
        },
        onError: (error: unknown) => {
          const apiError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            apiError?.response?.data?.message || "Bulk upload failed",
          );
        },
      },
    );
  };

  const { mutate: createItem, isPending: isCreating } = useCreateInventory();
  const {
    mutate: handleCreateFromBarcodeBulk,
    isPending: isCreatingFromBarcodeBulk,
  } = useCreateFromBarcodeBulk();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateInventory();
  const { mutate: handleCreateFromBarcode, isPending: isCreatingFromBarcode } =
    useCreateFromBarcode();
  const { mutate: createCustomerMutate, isPending: isCreatingCustomer } =
    useCreateCustomer();
  const { mutate: createInvoiceMutate } = useCreateInvoice();
  const { data: session } = useSession();
  const { data: customersData } = useCustomersByShopkeeper(
    (session?.user as { id?: string })?.id || "",
  );
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedProductNameSearch(productNameSearch.trim());
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [productNameSearch]);

  useEffect(() => {
    function handleProductSuggestionClickOutside(event: MouseEvent) {
      if (
        productSuggestionRef.current &&
        !productSuggestionRef.current.contains(event.target as Node)
      ) {
        setShowProductSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleProductSuggestionClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleProductSuggestionClickOutside,
      );
  }, []);

  // Close supplier dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSupplierDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [scanResultModalData, setScanResultModalData] =
    useState<ScanResultData | null>(null);
  const isPending = isCreating || isUpdating || isCreatingFromBarcode;

  const syncMultiValueField = (
    field: "color" | "storage",
    values: string[],
    options?: { shouldValidate?: boolean; shouldDirty?: boolean },
  ) => {
    const normalizedValues = values.length ? values : [""];
    const joinedValue = joinMultiValueField(normalizedValues);

    if (field === "color") {
      setColorValues(normalizedValues);
      setIsCustomColor(
        normalizedValues.some(
          (value) => value && !COLOR_OPTIONS.includes(value),
        ),
      );
    } else {
      setStorageValues(normalizedValues);
      setIsCustomStorage(
        normalizedValues.some(
          (value) => value && !STORAGE_OPTIONS.includes(value),
        ),
      );
    }

    form.setValue(
      field,
      joinedValue as CreateInventoryInput[typeof field],
      options,
    );
  };

  const addMultiValueField = (field: "color" | "storage") => {
    const currentValues = field === "color" ? colorValues : storageValues;
    syncMultiValueField(field, [...currentValues, ""], { shouldDirty: true });
  };

  const updateMultiValueField = (
    field: "color" | "storage",
    index: number,
    value: string,
    options?: { shouldValidate?: boolean; shouldDirty?: boolean },
  ) => {
    const sourceValues = field === "color" ? colorValues : storageValues;
    const nextValues = [...sourceValues];
    nextValues[index] = value;
    syncMultiValueField(field, nextValues, options);
  };

  const removeMultiValueField = (field: "color" | "storage", index: number) => {
    const sourceValues = field === "color" ? colorValues : storageValues;
    const nextValues = sourceValues.filter(
      (_, currentIndex) => currentIndex !== index,
    );
    syncMultiValueField(field, nextValues, { shouldDirty: true });
  };

  const handleAddCustomer = async () => {
    const values = form.getValues();
    if (
      !values.customerName ||
      !values.customerEmail ||
      !values.customerPhone
    ) {
      toast.error("Please fill name, email and phone to add a customer.");
      return;
    }
    const [firstName, ...lastNameParts] = values.customerName.split(" ");
    const lastName = lastNameParts.join(" ") || " ";

    if (!session?.user) {
      toast.error("User session not found");
      return;
    }

    createCustomerMutate(
      {
        firstName,
        lastName,
        email: values.customerEmail,
        phone: values.customerPhone,
        address: values.customerAddress || "",
        shopkeeperId: (session.user as { id?: string })?.id || "",
        salesMethod: values.saleMethod,
        actualSalePrice: values.salePrice,
      },
      {
        onSuccess: () => {
          toast.success("Customer added successfully!");
        },
        onError: (error: unknown) => {
          const apiError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            apiError?.response?.data?.message || "Failed to add customer",
          );
        },
      },
    );
  };

  const form = useForm<CreateInventoryInput>({
    resolver: zodResolver(CreateInventorySchema),
    defaultValues: {
      userId: "",
      sourceImageUrl: "",
      sourceImageUrls: [],
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      salePrice: undefined,
      saleQuantity: 1,
      saleMethod: "In-store",
      image: undefined,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        sourceImageUrl: item.image?.url ?? "",
        sourceImageUrls:
          item.sourceImageUrls ?? (item.image?.url ? [item.image.url] : []),
        itemName: item.itemName,
        sku: item.sku ?? "",
        brand: item.brand ?? "",
        color: item.color ?? "",
        storage: item.storage ?? "",
        size: item.size ?? "",
        imeiNumber: item.imeiNumber ?? "",
        modelNumber: item.modelNumber ?? "",
        quantity: item.quantity ?? 1,
        purchasePrice: item.purchasePrice,
        expectedPrice: item.expectedPrice,
        productDetails: item.productDetails ?? "",
        aiDescription: item.aiDescription ?? "",
        supplierId:
          typeof item.supplierId === "object"
            ? (item.supplierId as unknown as { _id: string })?._id
            : (item.supplierId ?? ""),
        storeId:
          typeof item.storeId === "object"
            ? (item.storeId as unknown as { _id: string })?._id
            : (item.storeId ?? ""),
        groupKey: item.groupKey ?? "",
        minStockLevel: item.minStockLevel ?? 2,
        type: forceType ?? item.type ?? "inventory",
        status: forceType ?? item.status ?? "inventory",
        currentState: item.currentState,
        userId:
          typeof item.userId === "object"
            ? (item.userId as unknown as { _id: string })?._id
            : (item.userId ?? ""),
        customerName: item.customerName ?? "",
        customerEmail: item.customerEmail ?? "",
        customerPhone: item.customerPhone ?? "",
        customerAddress: item.customerAddress ?? "",
        salePrice: item.salePrice,
        saleQuantity: item.saleQuantity ?? 1,
        saleMethod: item.saleMethod ?? "In-store",
        image: undefined, // Reset image on edit
        categoryId: item.categoryId ?? categoryId ?? "",
      });

      setTimeout(() => {
        syncMultiValueField("color", splitMultiValueField(item.color), {
          shouldValidate: false,
          shouldDirty: false,
        });
        syncMultiValueField("storage", splitMultiValueField(item.storage), {
          shouldValidate: false,
          shouldDirty: false,
        });

        // Check if brand is custom
        if (item.brand && !BRANDS.includes(item.brand)) {
          setIsCustomBrand(true);
        } else {
          setIsCustomBrand(false);
        }

        // Check if condition is custom
        if (
          item.currentState &&
          item.currentState !== "new" &&
          item.currentState !== "good condition"
        ) {
          setIsCustomCondition(true);
        } else {
          setIsCustomCondition(false);
        }

        // Check if storage is custom
        setIsCustomStorage(
          splitMultiValueField(item.storage).some(
            (value) => value && !STORAGE_OPTIONS.includes(value),
          ),
        );

        // Check if color is custom
        setIsCustomColor(
          splitMultiValueField(item.color).some(
            (value) => value && !COLOR_OPTIONS.includes(value),
          ),
        );

        // Check if sale method is custom
        if (item.saleMethod && !SALE_METHODS.includes(item.saleMethod)) {
          setIsCustomSaleMethod(true);
        } else {
          setIsCustomSaleMethod(false);
        }
      }, 0);
    } else {
      form.reset({
        sourceImageUrl: "",
        sourceImageUrls: [],
        itemName: "",
        sku: "",
        brand: "",
        color: "",
        storage: "",
        size: "",
        imeiNumber: "",
        modelNumber: "",
        quantity: 1,
        purchasePrice: undefined,
        expectedPrice: 0,
        productDetails: "",
        aiDescription: "",
        supplierId: "",
        storeId: "",
        groupKey: "",
        minStockLevel: 2,
        type: forceType || "inventory",
        status: forceType || "inventory",
        currentState: "good condition",
        userId: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        salePrice: undefined,
        saleQuantity: 1,
        saleMethod: "In-store",
        image: undefined,
        categoryId: categoryId ?? "",
      });
      setTimeout(() => {
        syncMultiValueField("color", [""], {
          shouldValidate: false,
          shouldDirty: false,
        });
        syncMultiValueField("storage", [""], {
          shouldValidate: false,
          shouldDirty: false,
        });
        setIsCustomBrand(false);
        setIsCustomCondition(false);
        setIsCustomSaleMethod(false);
      }, 0);
    }
  }, [item, form, isOpen, forceType, categoryId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (item) {
        setImagePreview(item.image?.url ?? null);
        setImageGallery(
          item.sourceImageUrls ?? (item.image?.url ? [item.image.url] : []),
        );
        setProductNameSearch(item.itemName ?? "");
      } else {
        setImagePreview(null);
        setImageGallery([]);
        setProductNameSearch("");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [item, isOpen]);

  const filteredCustomers = (customersData?.data || []).filter(
    (customer: { firstName?: string; lastName?: string }) => {
      const fullName =
        `${customer.firstName || ""} ${customer.lastName || ""}`.toLowerCase();
      return fullName.includes((customerSearchQuery || "").toLowerCase());
    },
  );

  const handleCustomerSelect = (customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    form.setValue("customerName", `${customer.firstName} ${customer.lastName}`);
    form.setValue("customerEmail", customer.email || "");
    form.setValue("customerPhone", customer.phone || "");
    form.setValue("customerAddress", customer.address || "");
    setCustomerSearchQuery("");
    setShowCustomerDropdown(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    form.setValue("image", file);
    form.setValue("sourceImageUrl", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    form.setValue("sourceImageUrls", [], {
      shouldDirty: true,
      shouldValidate: false,
    });
    setImageGallery([]);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProductSuggestionSelect = (product: BarcodeSearchItem) => {
    const nextName = getSuggestionTitle(product);
    const resolvedBarcode = getSuggestionBarcode(product);
    setProductNameSearch(nextName);
    form.setValue("itemName", nextName, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSelectedSearchBarcode(resolvedBarcode);
    setShowProductSuggestions(false);

    if (resolvedBarcode) {
      handleManualBarcodeSubmit(resolvedBarcode);
      return;
    }

    const nextImages =
      Array.isArray(product.images) && product.images.length
        ? product.images.filter(
            (value) => typeof value === "string" && value.trim(),
          )
        : product.image?.trim()
          ? [product.image.trim()]
          : [];

    if (nextImages.length) {
      setImagePreview(nextImages[0]);
      form.setValue("sourceImageUrl", nextImages[0], {
        shouldDirty: true,
        shouldValidate: false,
      });
      setImageGallery(nextImages);
      form.setValue("sourceImageUrls", nextImages, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  };

  const handleDownloadInvoice = async (values: CreateInventoryInput) => {
    try {
      const invoiceNumber = generateRandomInvoiceNumber();
      const reviewQrCode = await generateGoogleReviewQrCodeDataUrl(
        profileData?.data?.googleReviewPageUrl,
      );
      const blob = await pdf(
        <SalesInvoicePDF
          data={
            {
              ...values,
              invoiceNumber,
              currency,
              reviewQrCodeDataUrl: reviewQrCode?.qrCodeDataUrl,
            } as SalesInvoicePDFProps["data"]
          }
        />,
      ).toBlob();

      const fileName = `Invoice-${values.customerName || "Customer"}-${new Date().getTime()}.pdf`;

      if ((session?.user as { id?: string })?.id) {
        const file = new File([blob], fileName, { type: "application/pdf" });
        createInvoiceMutate({
          shopkeeperId: (session?.user as { id: string }).id,
          type: "sell",
          invoice: file,
        });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate invoice PDF");
    }
  };

  const onSubmit = (values: CreateInventoryInput) => {
    const inventoryPayload = {
      ...values,
      salePrice: values.salePrice ?? values.expectedPrice,
      images:
        values.images && values.images.length ? values.images : imageGallery,
      sourceImageUrl:
        values.sourceImageUrl || imagePreview || imageGallery[0] || "",
      sourceImageUrls:
        values.sourceImageUrls && values.sourceImageUrls.length
          ? values.sourceImageUrls
          : imageGallery,
      categoryId: values.categoryId || categoryId,
    };

    if (forceType === "sold") {
      handleDownloadInvoice(values);
      onClose();
      return;
    }

    if (isEditMode && item) {
      updateItem(
        {
          id: item._id,
          input: inventoryPayload,
        },
        {
          onSuccess: () => {
            toast.success("Item updated successfully");
            onClose();
          },
          onError: () => toast.error("Update failed"),
        },
      );
    } else if (scannedItemId) {
      updateItem(
        {
          id: scannedItemId,
          input: inventoryPayload,
        },
        {
          onSuccess: () => {
            toast.success("Item updated successfully");
            onClose();
          },
          onError: (error: unknown) => {
            const apiError = error as {
              response?: { data?: { message?: string } };
            };
            toast.error(apiError?.response?.data?.message || "Update failed");
          },
        },
      );
    } else {
      createItem(
        {
          ...inventoryPayload,
          userId: (session?.user as { id: string })?.id ?? "",
        },
        {
          onSuccess: () => {
            toast.success("Item created successfully");
            onClose();
          },
          onError: () => toast.error("Addition failed"),
        },
      );
    }
  };

  const onError = (errors: FieldErrors<CreateInventoryInput>) => {
    console.log("Validation Errors:", errors);
    const errorMessages = Object.values(errors)
      .map((err) => (err as FieldError)?.message)
      .filter(Boolean);

    if (errorMessages.length > 0) {
      toast.error(`Please fix: ${errorMessages[0]}`);
    } else {
      toast.error("Form validation failed. Please check all fields.");
    }
  };

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("barcode-reader");
      html5QrCodeRef.current = html5QrCode;
      setIsCameraActive(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setManualBarcode(decodedText);
          toast.success("Barcode scanned successfully");
          stopScanning();
        },
        (errorMessage) => {
          // ignore scan errors
        },
      );
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Could not access camera");
      setIsCameraActive(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanning", err);
      }
    }
    setIsCameraActive(false);
  };

  const resetBarcodeFields = () => {
    setManualBarcode("");
    setBarcodeImei("");
    setBarcodePurchasePrice("");
    setBarcodeCondition("new");
    setBarcodeDeviceImage(null);
    setBarcodeDeviceImagePreview(null);
    setSuggestedExpectedPrice(null);
  };

  const handleManualBarcodeSubmit = (codeOverride?: string) => {
    const code = codeOverride || manualBarcode;
    if (!code.trim()) {
      toast.error("Please enter a barcode or IMEI");
      return;
    }

    const currentCategoryId = form.getValues("categoryId") || categoryId;
    const currentSourceImageUrl =
      form.getValues("sourceImageUrl") || imagePreview || "";
    const currentSourceImageUrls = form.getValues("sourceImageUrls")?.length
      ? form.getValues("sourceImageUrls")
      : imageGallery;

    if ((session?.user as { id: string })?.id) {
      handleCreateFromBarcode(
        {
          code: code.trim(),
          userId: (session?.user as { id: string }).id,
          imeiNumber: barcodeImei || undefined,
          purchasePrice: barcodePurchasePrice
            ? Number(barcodePurchasePrice)
            : undefined,
          currentState: barcodeCondition,
          image: barcodeDeviceImage || undefined,
          images: currentSourceImageUrls,
          categoryId: currentCategoryId || undefined,
          sourceImageUrl: currentSourceImageUrl || undefined,
          sourceImageUrls: currentSourceImageUrls,
        },
        {
          onSuccess: (data: {
            data: {
              result?: Record<string, unknown>;
              productDetails?: string;
              aiDescription?: string;
              barcodeResult?: Record<string, unknown>;
              aiInsight?: Record<string, unknown>;
            };
          }) => {
            // Auto-fill form fields from API response
            const responseData = (data?.data || data) as Record<
              string,
              unknown
            > & {
              result?: Record<string, unknown>;
              productDetails?: string;
              aiDescription?: string;
              barcodeResult?: Record<string, unknown>;
              aiInsight?: Record<string, unknown>;
            };
            const deviceData = (responseData?.result || responseData) as Record<
              string,
              unknown
            > & { _id?: string };
            const barcodeResult = responseData?.barcodeResult;
            const aiInsight = responseData?.aiInsight;
            if (!deviceData) return;

            if (deviceData._id) setScannedItemId(deviceData._id);

            // Map all available fields to the form with UI update flags
            const options = { shouldValidate: true, shouldDirty: true };

            // Helper to set value with aliases
            const setVal = (key: string, value: unknown) => {
              if (value === undefined || value === null || value === "") return;

              // Direct mapping - use a safer cast than 'any'
              const fieldName = key as keyof CreateInventoryInput;
              if (key in form.getValues()) {
                form.setValue(fieldName, value as never, options);

                // Handle custom brand state
                if (key === "brand") {
                  if (typeof value === "string" && !BRANDS.includes(value)) {
                    setIsCustomBrand(true);
                  } else {
                    setIsCustomBrand(false);
                  }
                }

                // Handle custom condition state
                if (key === "currentState") {
                  if (
                    typeof value === "string" &&
                    value !== "new" &&
                    value !== "good condition"
                  ) {
                    setIsCustomCondition(true);
                  } else {
                    setIsCustomCondition(false);
                  }
                }
              }

              // Aliases for common variations
              if (key === "name" || key === "itemName") {
                form.setValue(
                  "itemName",
                  getPreferredBarcodeItemName(
                    String(value),
                    barcodeResult,
                    aiInsight,
                  ),
                  options,
                );
              }
              if (key === "model" || key === "modelNumber") {
                form.setValue("modelNumber", value as string, options);
              }
              if (key === "price" || key === "expectedPrice") {
                const numericValue = Number(value);
                if (Number.isFinite(numericValue) && numericValue > 0) {
                  setSuggestedExpectedPrice(numericValue);
                }
              }
              if (key === "imei" || key === "imeiNumber") {
                form.setValue("imeiNumber", value as string, options);
              }
            };

            // Map result fields
            Object.entries(deviceData).forEach(([key, value]) => {
              if (key === "color" || key === "storage") return;
              setVal(key, value);
            });

            const fallbackItemName = getPreferredBarcodeItemName(
              typeof deviceData.itemName === "string"
                ? deviceData.itemName
                : "",
              barcodeResult,
              aiInsight,
            );
            if (fallbackItemName) {
              form.setValue("itemName", fallbackItemName, options);
            }

            const fallbackSuggestedPrice = Number(
              deviceData.expectedPrice ?? deviceData.price ?? 0,
            );
            if (
              Number.isFinite(fallbackSuggestedPrice) &&
              fallbackSuggestedPrice > 0
            ) {
              setSuggestedExpectedPrice(fallbackSuggestedPrice);
            }

            const fallbackImageUrl =
              typeof deviceData.image === "object" &&
              deviceData.image !== null &&
              "url" in deviceData.image &&
              typeof deviceData.image.url === "string"
                ? deviceData.image.url
                : getBarcodeImageUrl(barcodeResult);
            const fallbackImageUrls = getBarcodeImageUrls(barcodeResult);
            if (fallbackImageUrl) {
              setImagePreview(fallbackImageUrl);
              form.setValue("sourceImageUrl", fallbackImageUrl, options);
            }
            setImageGallery(
              fallbackImageUrls.length
                ? fallbackImageUrls
                : fallbackImageUrl
                  ? [fallbackImageUrl]
                  : [],
            );
            form.setValue(
              "images",
              fallbackImageUrls.length
                ? fallbackImageUrls
                : fallbackImageUrl
                  ? [fallbackImageUrl]
                  : [],
              options,
            );
            form.setValue(
              "sourceImageUrls",
              fallbackImageUrls.length
                ? fallbackImageUrls
                : fallbackImageUrl
                  ? [fallbackImageUrl]
                  : [],
              options,
            );

            const fallbackModelNumber = getBarcodeMetadataValue(
              barcodeResult,
              "model",
              "mpn",
            );
            if (
              fallbackModelNumber &&
              !String(form.getValues("modelNumber") || "").trim()
            ) {
              form.setValue("modelNumber", fallbackModelNumber, options);
            }

            const fallbackColor = getBarcodeMetadataValue(
              barcodeResult,
              "color",
            );
            const colorValuesFromApi = splitMultiValueField(
              Array.isArray(deviceData.color)
                ? (deviceData.color as string[])
                : ([
                    deviceData.color as string | undefined,
                    fallbackColor || undefined,
                  ].filter(Boolean) as string[]),
            );
            syncMultiValueField(
              "color",
              colorValuesFromApi.length ? colorValuesFromApi : [""],
              options,
            );

            const fallbackStorage = getBarcodeMetadataValue(
              barcodeResult,
              "storage",
              "size",
            );
            const storageValuesFromApi = splitMultiValueField(
              Array.isArray(deviceData.storage)
                ? (deviceData.storage as string[])
                : ([
                    deviceData.storage as string | undefined,
                    fallbackStorage || undefined,
                  ].filter(Boolean) as string[]),
            );
            syncMultiValueField(
              "storage",
              storageValuesFromApi.length ? storageValuesFromApi : [""],
              options,
            );

            const scannedQuantity =
              typeof deviceData.quantity === "number"
                ? deviceData.quantity
                : Number(deviceData.quantity);
            if (!Number.isFinite(scannedQuantity) || scannedQuantity < 1) {
              form.setValue("quantity", 1, options);
            }

            // Map top-level productDetails and aiDescription if result ones are missing
            if (
              responseData?.productDetails &&
              !form.getValues("productDetails")
            ) {
              form.setValue(
                "productDetails",
                responseData.productDetails,
                options,
              );
            }

            if (
              responseData?.aiDescription &&
              !form.getValues("aiDescription")
            ) {
              form.setValue(
                "aiDescription",
                responseData.aiDescription,
                options,
              );
            }

            const aiInsightMessage =
              typeof responseData?.aiInsight?.message === "string"
                ? responseData.aiInsight.message
                : "";
            if (aiInsightMessage && !form.getValues("aiDescription")) {
              form.setValue("aiDescription", aiInsightMessage, options);
            }

            toast.success("Device details auto-populated! Please review.");
            setManualBarcode("");
            setSelectedSearchBarcode(
              typeof barcodeResult?.barcode === "string"
                ? barcodeResult.barcode
                : "",
            );
            setProductNameSearch(
              String(form.getValues("itemName") || fallbackItemName || ""),
            );
          },
          onError: (error: unknown) => {
            const apiError = error as {
              response?: { data?: { message?: string } };
            };
            toast.error(
              apiError?.response?.data?.message || "Failed to process barcode",
            );
          },
        },
      );
    } else {
      toast.error("User not authenticated");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanning();
      setTimeout(() => {
        resetBarcodeFields();
        setScannedItemId(null);
      }, 0);
    }
  }, [isOpen]);

  const handleBarcodeImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setBarcodeImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Use a temporary scanner instance for file scanning
    const html5QrCode = new Html5Qrcode("barcode-reader-hidden");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      setManualBarcode(decodedText);
      toast.success("Barcode extracted successfully");
      handleManualBarcodeSubmit(decodedText);
      setTimeout(() => setBarcodeImagePreview(null), 2000);
    } catch (err) {
      console.error("Scan error", err);
      toast.error("No barcode found in image. Please try a clearer photo.");
      setBarcodeImagePreview(null);
    } finally {
      // Cleanup
      html5QrCode.clear();
    }
  };

  const renderFormContent = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10">
          {/* Left Column: Core Identity & Specs */}
          <div className="space-y-10">
            {/* Section: Device Identity */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 ">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white ">
                  <Smartphone className="w-3.5 h-3.5 text-[#84CC16]" />
                  Device Identity
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-white ">
                  Primary identification details
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item Name */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="itemName"
                  render={({ field }) => {
                    return (
                      <FormItem className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white block ml-1">
                            Product Name <span className="text-red-500">*</span>
                          </FormLabel>
                          {suggestedExpectedPrice ? (
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#84CC16] bg-[#84CC16]/10 px-3 py-1 rounded-full border border-[#84CC16]/20 flex items-center gap-1.5 shadow-sm">
                              <Tag className="w-3 h-3 text-[#84CC16]" />
                              Expected Price:{" "}
                              {formatCurrency(Number(suggestedExpectedPrice))}
                            </span>
                          ) : null}
                        </div>
                        <FormControl>
                          <div
                            className="relative group"
                            ref={productSuggestionRef}
                          >
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <Smartphone className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="Search product name, EAN or UPC"
                              className="pl-14 pr-32 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              value={field.value || productNameSearch}
                              onChange={(event) => {
                                field.onChange(event.target.value);
                                setProductNameSearch(event.target.value);
                                setShowProductSuggestions(true);
                                setSelectedSearchBarcode("");
                              }}
                              onFocus={() => {
                                if (
                                  debouncedProductNameSearch.length >= 2 &&
                                  barcodeSearchResults.length > 0
                                ) {
                                  setShowProductSuggestions(true);
                                }
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  handleManualBarcodeSubmit(
                                    selectedSearchBarcode || field.value,
                                  );
                                }
                              }}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  barcodeImageInputRef.current?.click()
                                }
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#84CC16] hover:bg-[#84CC16]/10 transition-all"
                                title="Upload Barcode"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleManualBarcodeSubmit(
                                    selectedSearchBarcode || field.value,
                                  )
                                }
                                disabled={isCreatingFromBarcode}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#84CC16] hover:bg-[#84CC16]/10 transition-all"
                                title="Scan/Fetch Device Info"
                              >
                                {isCreatingFromBarcode ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Scan className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <input
                              type="file"
                              ref={barcodeImageInputRef}
                              onChange={handleBarcodeImageUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <div
                              id="barcode-reader-hidden"
                              className="hidden"
                            ></div>
                            {showProductSuggestions &&
                            debouncedProductNameSearch.length >= 2 ? (
                              <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-40 rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden">
                                {isSearchingProducts ? (
                                  <div className="flex items-center gap-2 px-4 py-4 text-sm font-bold text-slate-500">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Searching products...
                                  </div>
                                ) : barcodeSearchResults.length ? (
                                  <div className="max-h-80 overflow-y-auto p-2">
                                    {barcodeSearchResults.map(
                                      (product, index) => (
                                        <button
                                          key={`${product.barcode || product.name || "product"}-${index}`}
                                          type="button"
                                          onClick={() =>
                                            handleProductSuggestionSelect(
                                              product,
                                            )
                                          }
                                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                        >
                                          <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shrink-0">
                                            {product.image ? (
                                              <NextImage
                                                src={product.image}
                                                alt={product.name || "Product"}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                              />
                                            ) : (
                                              <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                <Package className="w-5 h-5" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                                              {getSuggestionTitle(product)}
                                            </p>
                                            <p className="truncate text-xs font-bold text-slate-500">
                                              {[
                                                product.brand,
                                                product.color,
                                                product.size,
                                                product.barcode,
                                              ]
                                                .filter(Boolean)
                                                .join(" • ")}
                                            </p>
                                            {product.description ? (
                                              <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                                                {product.description}
                                              </p>
                                            ) : null}
                                          </div>
                                        </button>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <div className="px-4 py-4 text-sm font-bold text-slate-500">
                                    No matching products found.
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px] uppercase tracking-wider font-bold" />
                      </FormItem>
                    );
                  }}
                />

                {/* SKU */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        SKU
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Tag className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="IPX-001"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Selection */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Category
                      </FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(val)}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                <FolderOpen className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                              </div>
                              <SelectValue placeholder="Select Category" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 p-2 shadow-xl bg-white dark:bg-slate-900 z-50">
                          {categories.map((cat: Category) => (
                            <SelectItem
                              key={cat._id}
                              value={cat._id}
                              className="rounded-xl font-bold text-xs p-3 cursor-pointer"
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Brand */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Brand
                      </FormLabel>
                      <div className="space-y-3">
                        {!isCustomBrand ? (
                          <Select
                            onValueChange={(val) => {
                              if (val === "Other") {
                                setIsCustomBrand(true);
                                field.onChange("");
                              } else {
                                field.onChange(val);
                              }
                            }}
                            value={
                              field.value && BRANDS.includes(field.value)
                                ? field.value
                                : field.value
                                  ? "Other"
                                  : ""
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                <div className="flex items-center gap-3 w-full">
                                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                    <Package className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                  </div>
                                  <SelectValue placeholder="Select Brand" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                              {BRANDS.map((brand) => (
                                <SelectItem
                                  key={brand}
                                  value={brand}
                                  className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                                >
                                  {brand}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <Package className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="Enter custom brand..."
                              className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomBrand(false);
                                field.onChange("Apple");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Technical Specifications */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white ">
                  <Maximize2 className="w-3.5 h-3.5 text-[#84CC16]" />
                  Technical Specs
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-white ">
                  Hardware and configuration
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Color */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Color
                      </FormLabel>
                      <div className="space-y-3">
                        {colorValues.map((value, index) => {
                          const selectValue =
                            value && COLOR_OPTIONS.includes(value)
                              ? value
                              : value
                                ? "Other"
                                : "";

                          return (
                            <div
                              key={`color-${index}`}
                              className="flex items-center gap-2"
                            >
                              <div className="flex-1">
                                {!isCustomColor && selectValue !== "Other" ? (
                                  <Select
                                    onValueChange={(val) => {
                                      if (val === "Other") {
                                        setIsCustomColor(true);
                                        updateMultiValueField(
                                          "color",
                                          index,
                                          "",
                                          {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          },
                                        );
                                      } else {
                                        updateMultiValueField(
                                          "color",
                                          index,
                                          val,
                                          {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          },
                                        );
                                      }
                                    }}
                                    value={selectValue}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                        <div className="flex items-center gap-3 w-full">
                                          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                            <Palette className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                          </div>
                                          <SelectValue placeholder="Select Color" />
                                        </div>
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                                      {COLOR_OPTIONS.map((color) => (
                                        <SelectItem
                                          key={`${color}-${index}`}
                                          value={color}
                                          className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                                        >
                                          {color}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                                      <Palette className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                                    </div>
                                    <Input
                                      placeholder="Enter custom color..."
                                      className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                                      value={value}
                                      onChange={(event) =>
                                        updateMultiValueField(
                                          "color",
                                          index,
                                          event.target.value,
                                          {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          },
                                        )
                                      }
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsCustomColor(false);
                                        updateMultiValueField(
                                          "color",
                                          index,
                                          "Black",
                                          {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          },
                                        );
                                      }}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                                    >
                                      Reset
                                    </button>
                                  </div>
                                )}
                              </div>
                              {colorValues.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeMultiValueField("color", index)
                                  }
                                  className="h-11 w-11 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                        <div className="flex items-center justify-between">
                          <input
                            type="hidden"
                            {...field}
                            value={joinMultiValueField(colorValues)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addMultiValueField("color")}
                            className="rounded-2xl border-slate-200 px-4 h-10 font-black uppercase tracking-widest text-[10px] hover:border-[#84CC16] hover:text-[#84CC16]"
                          >
                            <Plus className="w-3.5 h-3.5 mr-2" />
                            Add Color
                          </Button>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Storage */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Storage
                      </FormLabel>
                      <div className="space-y-3">
                        {storageValues.map((value, index) => {
                          const selectValue =
                            value && STORAGE_OPTIONS.includes(value)
                              ? value
                              : value
                                ? "Other"
                                : "";

                          return (
                            <div
                              key={`storage-${index}`}
                              className="flex items-center gap-2"
                            >
                              <div className="flex-1">
                                {!isCustomStorage && selectValue !== "Other" ? (
                                  <Select
                                    onValueChange={(val) => {
                                      if (val === "Other") {
                                        setIsCustomStorage(true);
                                        updateMultiValueField(
                                          "storage",
                                          index,
                                          "",
                                          {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          },
                                        );
                                      } else {
                                        updateMultiValueField(
                                          "storage",
                                          index,
                                          val,
                                          {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          },
                                        );
                                      }
                                    }}
                                    value={selectValue}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                        <div className="flex items-center gap-3 w-full">
                                          <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                            <HardDrive className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                          </div>
                                          <SelectValue placeholder="Select Storage" />
                                        </div>
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                                      {STORAGE_OPTIONS.map((opt) => (
                                        <SelectItem
                                          key={`${opt}-${index}`}
                                          value={opt}
                                          className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                                        >
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                                      <HardDrive className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                                    </div>
                                    <Input
                                      placeholder="Enter custom storage..."
                                      className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                                      value={value}
                                      onChange={(event) =>
                                        updateMultiValueField(
                                          "storage",
                                          index,
                                          event.target.value,
                                          {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          },
                                        )
                                      }
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsCustomStorage(false);
                                        updateMultiValueField(
                                          "storage",
                                          index,
                                          "128GB",
                                          {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                          },
                                        );
                                      }}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                                    >
                                      Reset
                                    </button>
                                  </div>
                                )}
                              </div>
                              {storageValues.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeMultiValueField("storage", index)
                                  }
                                  className="h-11 w-11 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                        <div className="flex items-center justify-between">
                          <input
                            type="hidden"
                            {...field}
                            value={joinMultiValueField(storageValues)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addMultiValueField("storage")}
                            className="rounded-2xl border-slate-200 px-4 h-10 font-black uppercase tracking-widest text-[10px] hover:border-[#84CC16] hover:text-[#84CC16]"
                          >
                            <Plus className="w-3.5 h-3.5 mr-2" />
                            Add Storage
                          </Button>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Model Number */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="modelNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Model Number
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Hash className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="A1901"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* IMEI Number */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="imeiNumber"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        IMEI / Serial Number
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Barcode className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="123456789012345"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Inventory & Meta */}
          <div className="space-y-10">
            {/* Section: Pricing & Stock */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white ">
                  <span className="font-extrabold text-sm text-[#84CC16]">
                    {currencySymbol}
                  </span>
                  Pricing & Stock
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-white ">
                  Financials and quantity levels
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Cost Price */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1 ">
                        Cost Price ({currency})
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <span className="font-black text-sm text-slate-400 group-focus-within:text-[#84CC16] transition-colors">
                              {currencySymbol}
                            </span>
                          </div>
                          <Input
                            type="number"
                            placeholder="200"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Selling Price */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="expectedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Selling Price ({currency}){" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <span className="font-black text-sm text-slate-400 group-focus-within:text-[#84CC16] transition-colors">
                              {currencySymbol}
                            </span>
                          </div>
                          <Input
                            type="number"
                            placeholder="300"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Quantity */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Quantity
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Layers className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            type="number"
                            placeholder="1"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Min Stock Level */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="minStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1 ">
                        Min Stock Level
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <AlertTriangle className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            type="number"
                            placeholder="2"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Management Metadata */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white ">
                  <Settings className="w-3.5 h-3.5 text-[#84CC16]" />
                  Management & Status
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Organization and lifecycle
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Supplier */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Supplier
                      </FormLabel>
                      <div className="relative" ref={supplierDropdownRef}>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                          <Truck className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search supplier..."
                          autoComplete="off"
                          className="w-full pl-14 pr-10 bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                          value={
                            field.value
                              ? suppliers.find((s) => s._id === field.value)
                                  ?.name || supplierSearch
                              : supplierSearch
                          }
                          onChange={(e) => {
                            setSupplierSearch(e.target.value);
                            setShowSupplierDropdown(true);
                            if (field.value) {
                              field.onChange("");
                            }
                          }}
                          onFocus={() => setShowSupplierDropdown(true)}
                        />
                        {field.value && (
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange("");
                              setSupplierSearch("");
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {showSupplierDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-100 dark:border-slate-800 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                            <div className="p-2">
                              {suppliers.length > 0 ? (
                                suppliers.map((supplier) => (
                                  <div
                                    key={supplier._id}
                                    className={`flex items-center gap-3 p-3 cursor-pointer rounded-2xl transition-all ${
                                      field.value === supplier._id
                                        ? "bg-[#84CC16]/10"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                                    onClick={() => {
                                      field.onChange(supplier._id);
                                      setSupplierSearch("");
                                      setShowSupplierDropdown(false);
                                    }}
                                  >
                                    <div className="w-10 h-10 rounded-full bg-[#84CC16]/10 flex items-center justify-center shrink-0">
                                      <Truck className="w-4 h-4 text-[#84CC16]" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {supplier.name}
                                      </p>
                                      {(supplier.email || supplier.phone) && (
                                        <p className="text-[10px] text-slate-500 truncate">
                                          {supplier.email || supplier.phone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-center text-xs text-slate-400">
                                  No suppliers found
                                </div>
                              )}
                              <button
                                type="button"
                                className="flex w-full items-center gap-3 p-3 cursor-pointer hover:bg-[#84CC16]/5 rounded-2xl transition-all border-t border-slate-100 dark:border-slate-800 mt-1"
                                onClick={() => {
                                  setShowSupplierDropdown(false);
                                  setIsSupplierFormOpen(true);
                                }}
                              >
                                <div className="w-10 h-10 rounded-full bg-[#84CC16]/10 flex items-center justify-center shrink-0">
                                  <Plus className="w-4 h-4 text-[#84CC16]" />
                                </div>
                                <span className="text-sm font-bold text-[#84CC16]">
                                  Create New Supplier
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Group Key */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="groupKey"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Batch / Group Key
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Layers className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="e.g. iphone-x-batch-1"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Condition */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="currentState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Condition
                      </FormLabel>
                      <div className="space-y-3">
                        {!isCustomCondition ? (
                          <Select
                            onValueChange={(val) => {
                              if (val === "Other") {
                                setIsCustomCondition(true);
                                field.onChange("");
                              } else {
                                field.onChange(val);
                              }
                            }}
                            value={
                              field.value === "new" ||
                              field.value === "good condition"
                                ? field.value
                                : "Other"
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                <div className="flex items-center gap-3 w-full">
                                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                    <Activity className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                  </div>
                                  <SelectValue placeholder="Condition" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                              <SelectItem
                                value="new"
                                className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white "
                              >
                                Brand New
                              </SelectItem>
                              <SelectItem
                                value="good condition"
                                className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white "
                              >
                                Good Condition
                              </SelectItem>
                              <SelectItem
                                value="Other"
                                className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white "
                              >
                                Other (Custom)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <Activity className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="e.g. Excellent, Refurbished..."
                              className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomCondition(false);
                                field.onChange("new");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Type - Hidden if forced */}
                {!forceType && (
                  <FormField
                    control={
                      form.control as unknown as Control<CreateInventoryInput>
                    }
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Item Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-10 h-10   rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0 dark:text-white ">
                                  <Tag className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                </div>
                                <SelectValue
                                  placeholder="Type"
                                  className="dark:text-white "
                                />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                            <SelectItem
                              value="inventory"
                              className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                            >
                              Inventory
                            </SelectItem>
                            <SelectItem
                              value="sold"
                              className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                            >
                              Sold
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Section: Sales Information (Conditional) */}
            {forceType === "sold" && (
              <div className="space-y-6 pt-10 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white">
                    <ShoppingCart className="w-3.5 h-3.5 text-[#84CC16]" />
                    Sales Information
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-white mb-4">
                    Customer and transaction details
                  </p>

                  {/* Standalone Customer Search */}
                  <div className="relative group mb-6" ref={dropdownRef}>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm group-focus-within:bg-[#84CC16]/10 transition-all z-10">
                      <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search existing customer..."
                      autoComplete="off"
                      className="w-full pl-14 pr-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-[#84CC16]/50 rounded-2xl h-12 font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                      value={customerSearchQuery}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onChange={(e) => {
                        setCustomerSearchQuery(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                    />
                    {showCustomerDropdown &&
                      filteredCustomers.length > 0 &&
                      customerSearchQuery.trim() !== "" && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-100 dark:border-slate-800 z-50 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                          <div className="p-2">
                            {filteredCustomers.map(
                              (customer: {
                                _id?: string;
                                firstName?: string;
                                lastName?: string;
                                email?: string;
                                phone?: string;
                              }) => (
                                <div
                                  key={customer._id || Math.random().toString()}
                                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
                                  onClick={() => handleCustomerSelect(customer)}
                                >
                                  <div className="w-10 h-10 rounded-full bg-[#84CC16]/10 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-[#84CC16]" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                      {customer.firstName} {customer.lastName}
                                    </p>
                                    {(customer.email || customer.phone) && (
                                      <p className="text-[10px] text-slate-500 truncate">
                                        {customer.email || customer.phone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Customer Name */}
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2 lg:col-span-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Customer Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="John Doe"
                              className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Customer Email */}
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Customer Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Customer Phone */}
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Customer Phone
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              type="tel"
                              placeholder="+1234567890"
                              className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Customer Address */}
                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Customer Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="123 Street, City, Country"
                              className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Sale Method */}
                  <FormField
                    control={form.control}
                    name="saleMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Sales Method
                        </FormLabel>
                        <div className="space-y-3">
                          {!isCustomSaleMethod ? (
                            <Select
                              onValueChange={(val) => {
                                if (val === "Other") {
                                  setIsCustomSaleMethod(true);
                                  field.onChange("");
                                } else {
                                  field.onChange(val);
                                }
                              }}
                              value={
                                field.value &&
                                SALE_METHODS.includes(field.value)
                                  ? field.value
                                  : field.value
                                    ? "Other"
                                    : ""
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                  <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                      <CreditCard className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                    </div>
                                    <SelectValue placeholder="Method" />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                                {SALE_METHODS.map((method) => (
                                  <SelectItem
                                    key={method}
                                    value={method}
                                    className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                                  >
                                    {method}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                                <CreditCard className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                              </div>
                              <Input
                                placeholder="Enter custom method..."
                                className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomSaleMethod(false);
                                  field.onChange("In-store");
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                              >
                                Reset
                              </button>
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Sale Price */}
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Actual Sale Price ({currency})
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <span className="font-black text-sm text-[#84CC16] group-focus-within:text-[#84CC16] transition-colors">
                                {currencySymbol}
                              </span>
                            </div>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="pl-14 pr-4 bg-[#84CC16]/5 dark:bg-[#84CC16]/10 border-[#84CC16]/20 dark:border-[#84CC16]/30 hover:border-[#84CC16] rounded-[20px] h-[56px] font-black text-[#84CC16] placeholder:text-[#84CC16]/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Add Customer Button */}
                  <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                    <Button
                      type="button"
                      onClick={handleAddCustomer}
                      disabled={isCreatingCustomer}
                      className="bg-[#84CC16] hover:bg-[#65a30d] text-white rounded-2xl px-8 h-12 font-black uppercase tracking-widest shadow-lg shadow-[#84CC16]/20 active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                      {isCreatingCustomer ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      {isCreatingCustomer ? "Saving..." : "Add as New Customer"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Rich Details & Descriptions */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 dark:text-white  flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#84CC16]" />
              Descriptions & Details
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Additional notes and AI-generated content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="productDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                    Product Details
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="e.g. Used phone, good condition..."
                      className="w-full min-h-[120px] p-4 bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-[20px] font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm outline-none resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aiDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                    AI Description
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="AI-generated description will appear here..."
                      className="w-full min-h-[120px] p-4 bg-[#84CC16]/5 border border-[#84CC16]/20 hover:border-[#84CC16]/40 hover:bg-[#84CC16]/10 rounded-[20px] font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm outline-none resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Image Upload */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 dark:text-white  flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-[#84CC16]" />
              Product Media
            </h4>
          </div>

          <div
            className="relative border-2 border-dashed border-slate-200 rounded-[32px] p-8 cursor-pointer hover:border-[#84CC16] hover:bg-[#84CC16]/5 transition-all flex flex-col items-center justify-center gap-4 min-h-[200px] group overflow-hidden bg-slate-50/50"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="w-full max-w-2xl space-y-4">
                <div className="relative h-56 w-full overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-2xl shadow-slate-200/70">
                  <NextImage
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 shadow">
                    {imageGallery.length > 1
                      ? `${imageGallery.length} Product Images`
                      : "Product Image"}
                  </div>
                  <button
                    type="button"
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 rounded-full p-2 hover:bg-white hover:text-red-500 transition-all shadow-md transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setImageGallery([]);
                      form.setValue("image", undefined);
                      form.setValue("sourceImageUrl", "", {
                        shouldDirty: true,
                        shouldValidate: false,
                      });
                      form.setValue("sourceImageUrls", [], {
                        shouldDirty: true,
                        shouldValidate: false,
                      });
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {imageGallery.length > 1 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {imageGallery.map((imageUrl, index) => (
                      <button
                        key={`${imageUrl}-${index}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(imageUrl);
                        }}
                        className={`relative h-20 overflow-hidden rounded-[20px] border transition-all ${
                          imagePreview === imageUrl
                            ? "border-[#84CC16] ring-4 ring-[#84CC16]/15"
                            : "border-slate-200 hover:border-[#84CC16]/50"
                        }`}
                      >
                        <NextImage
                          src={imageUrl}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-[24px] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#84CC16] group-hover:scale-110 transition-all duration-300">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-1">
                    Click to Upload
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    PNG, JPG or WEBP up to 5MB
                  </span>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="flex items-center justify-between pt-10 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#84CC16]" />
            Required fields are marked with{" "}
            <span className="text-red-500">*</span>
          </p>
          <div className="flex justify-end gap-4 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 w-full sm:w-auto transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-12 h-14 font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all w-full sm:w-auto flex items-center gap-3"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
              {isPending
                ? "Saving..."
                : isEditMode
                  ? forceType === "sold"
                    ? "Download PDF"
                    : "Save Details"
                  : "Add to Inventory"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] lg:max-w-[1400px] bg-white dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl p-0 overflow-hidden max-h-[95vh] flex flex-col">
          <div className="relative bg-slate-900 p-8 text-white shrink-0 overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#84CC16] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 translate-y-1/2 -translate-x-1/2" />

            <DialogHeader className="relative z-10">
              <DialogTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {isEditMode ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <Smartphone className="w-5 h-5 text-[#84CC16]" />
                    </div>
                    {forceType === "sold" ? "Sell Device" : "Edit Device"}
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <Upload className="w-5 h-5 text-[#84CC16]" />
                    </div>
                    Add New Device
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-300 font-medium text-sm mt-2 ml-[52px]">
                {isEditMode
                  ? "Update your inventory record details below."
                  : "Enter device details to track it in your shop inventory."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 lg:p-12 bg-white dark:bg-slate-950 overflow-y-auto flex-1 custom-scrollbar">
            {!isEditMode ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl h-14">
                  <TabsTrigger
                    value="manual"
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                  >
                    Add Item
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                  >
                    Bulk Upload
                  </TabsTrigger>
                  <TabsTrigger
                    value="import-csv"
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                  >
                    Import CSV
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="manual"
                  className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                >
                  <div className="w-full">{renderFormContent()}</div>
                </TabsContent>

                {forceType !== "sold" && (
                  <TabsContent
                    value="upload"
                    className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                  >
                    <div className="flex flex-col py-6 px-4 sm:px-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50/50 dark:bg-slate-900/30 min-h-[400px]">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-[#84CC16]/10 flex items-center justify-center">
                              <FileUp className="w-4 h-4 text-[#84CC16]" />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                              Bulk Device Entry
                            </h3>
                          </div>
                          <p className="text-slate-500 text-sm font-bold dark:text-slate-400 ml-11">
                            Quickly add multiple items to your inventory.
                          </p>
                        </div>
                        <Button
                          onClick={addBulkRow}
                          type="button"
                          variant="outline"
                          className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 h-12 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-[#84CC16] hover:text-[#84CC16] transition-all flex items-center gap-2 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add New Row
                        </Button>
                      </div>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {bulkItems.map((item, index) => (
                          <div
                            key={index}
                            className="relative group animate-in fade-in slide-in-from-top-4 duration-500"
                          >
                            {/* Row Indicator */}
                            <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-black z-10 shadow-lg border-4 border-white dark:border-slate-950">
                              {index + 1}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#84CC16]/30 transition-all">
                              {/* Primary Section: ID & Specs */}
                              <div className="lg:col-span-5 p-6 grid grid-cols-2 gap-4 border-b lg:border-b-0 lg:border-r border-slate-50 dark:border-slate-800/50">
                                <div className="col-span-2 space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                    <Barcode className="w-3 h-3" />
                                    Barcode / Code{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Scan or type device ID..."
                                    className="w-full px-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[18px] h-[52px] font-bold text-sm outline-none focus:ring-4 focus:ring-[#84CC16]/10 focus:border-[#84CC16] transition-all dark:text-white"
                                    value={item.code}
                                    onChange={(e) =>
                                      updateBulkItem(
                                        index,
                                        "code",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Color
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Black"
                                    className="w-full px-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[18px] h-[52px] font-bold text-sm outline-none focus:ring-4 focus:ring-[#84CC16]/10 focus:border-[#84CC16] transition-all dark:text-white"
                                    value={item.color}
                                    onChange={(e) =>
                                      updateBulkItem(
                                        index,
                                        "color",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Storage/Size
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 128GB"
                                    className="w-full px-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[18px] h-[52px] font-bold text-sm outline-none focus:ring-4 focus:ring-[#84CC16]/10 focus:border-[#84CC16] transition-all dark:text-white"
                                    value={item.storage}
                                    onChange={(e) =>
                                      updateBulkItem(
                                        index,
                                        "storage",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              {/* Secondary Section: Source & Condition */}
                              <div className="lg:col-span-4 p-6 grid grid-cols-1 gap-4 bg-slate-50/30 dark:bg-slate-800/10 border-b lg:border-b-0 lg:border-r border-slate-50 dark:border-slate-800/50">
                                <div
                                  className="space-y-1.5 relative"
                                  ref={
                                    index === 0
                                      ? supplierDropdownRef
                                      : undefined
                                  }
                                >
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Supplier
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Search supplier..."
                                    className="w-full px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[18px] h-[52px] font-bold text-sm outline-none focus:ring-4 focus:ring-[#84CC16]/10 focus:border-[#84CC16] transition-all dark:text-white"
                                    value={
                                      item.supplierId
                                        ? suppliers.find(
                                            (s) => s._id === item.supplierId,
                                          )?.name || ""
                                        : ""
                                    }
                                    onFocus={() =>
                                      setShowSupplierDropdown(true)
                                    }
                                    onChange={(e) => {
                                      setSupplierSearch(e.target.value);
                                      setShowSupplierDropdown(true);
                                      if (item.supplierId) {
                                        updateBulkItem(index, "supplierId", "");
                                      }
                                    }}
                                  />
                                  {item.supplierId && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateBulkItem(index, "supplierId", "")
                                      }
                                      className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 transition"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {showSupplierDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 max-h-48 overflow-y-auto animate-in fade-in">
                                      <div className="p-1.5">
                                        {suppliers.length > 0 ? (
                                          suppliers.map((supplier) => (
                                            <div
                                              key={supplier._id}
                                              className={`flex items-center gap-2 p-2.5 cursor-pointer rounded-xl transition-all text-sm ${
                                                item.supplierId === supplier._id
                                                  ? "bg-[#84CC16]/10"
                                                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                              }`}
                                              onClick={() => {
                                                updateBulkItem(
                                                  index,
                                                  "supplierId",
                                                  supplier._id,
                                                );
                                                setSupplierSearch("");
                                                setShowSupplierDropdown(false);
                                              }}
                                            >
                                              <Truck className="w-3.5 h-3.5 text-[#84CC16] shrink-0" />
                                              <span className="font-bold text-slate-900 dark:text-white truncate">
                                                {supplier.name}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="p-2 text-center text-xs text-slate-400">
                                            No suppliers found
                                          </div>
                                        )}
                                        <button
                                          type="button"
                                          className="flex w-full items-center gap-2 p-2.5 cursor-pointer hover:bg-[#84CC16]/5 rounded-xl transition-all border-t border-slate-100 dark:border-slate-800 mt-1"
                                          onClick={() => {
                                            setShowSupplierDropdown(false);
                                            setIsSupplierFormOpen(true);
                                          }}
                                        >
                                          <Plus className="w-3.5 h-3.5 text-[#84CC16]" />
                                          <span className="text-xs font-bold text-[#84CC16]">
                                            New Supplier
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Current State
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Mint Condition"
                                    className="w-full px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[18px] h-[52px] font-bold text-sm outline-none focus:ring-4 focus:ring-[#84CC16]/10 focus:border-[#84CC16] transition-all dark:text-white"
                                    value={item.currentState}
                                    onChange={(e) =>
                                      updateBulkItem(
                                        index,
                                        "currentState",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Device Image
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[18px] h-[52px] font-bold text-sm outline-none focus:ring-4 focus:ring-[#84CC16]/10 focus:border-[#84CC16] transition-all dark:text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#84CC16]/10 file:text-[#84CC16] hover:file:bg-[#84CC16]/20"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      updateBulkItem(index, "image", file);
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Tertiary Section: Pricing & Qty */}
                              <div className="lg:col-span-3 p-6 grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Buy Price
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                                      {currencySymbol}
                                    </span>
                                    <input
                                      type="number"
                                      placeholder="0"
                                      className="w-full pl-9 pr-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[18px] h-[52px] font-bold text-sm outline-none focus:ring-4 focus:ring-[#84CC16]/10 focus:border-[#84CC16] transition-all dark:text-white"
                                      value={item.purchasePrice || ""}
                                      onChange={(e) =>
                                        updateBulkItem(
                                          index,
                                          "purchasePrice",
                                          Number(e.target.value),
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-[#84CC16]">
                                    Sell Price
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-xs text-[#84CC16]">
                                      {currencySymbol}
                                    </span>
                                    <input
                                      type="number"
                                      placeholder="0"
                                      className="w-full pl-9 pr-3 bg-[#84CC16]/5 dark:bg-[#84CC16]/10 border-[#84CC16]/20 dark:border-[#84CC16]/30 rounded-[18px] h-[52px] font-black text-sm text-[#84CC16] outline-none focus:ring-4 focus:ring-[#84CC16]/10 focus:border-[#84CC16] transition-all"
                                      value={item.expectedPrice || ""}
                                      onChange={(e) =>
                                        updateBulkItem(
                                          index,
                                          "expectedPrice",
                                          Number(e.target.value),
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    Qty
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="1"
                                    className="w-full px-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[18px] h-[52px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all dark:text-white"
                                    value={item.quantity || ""}
                                    onChange={(e) =>
                                      updateBulkItem(
                                        index,
                                        "quantity",
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                </div>
                                <div className="flex items-end pb-1 gap-2">
                                  {bulkItems.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => removeBulkRow(index)}
                                      className="w-1/2 h-[52px] rounded-[18px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center p-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={addBulkRow}
                                    className="w-1/2 h-[52px] rounded-[18px] text-[#84CC16] hover:bg-[#84CC16]/10 transition-all flex items-center justify-center p-0"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <span className="text-sm font-black text-slate-600 dark:text-slate-300">
                              {bulkItems.filter((i) => i.code.trim()).length}
                            </span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Ready to import
                          </span>
                        </div>

                        <Button
                          onClick={handleBulkSubmit}
                          disabled={
                            isCreatingFromBarcodeBulk ||
                            bulkItems.filter((i) => i.code.trim()).length === 0
                          }
                          type="button"
                          className="h-14 px-12 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white rounded-[20px] font-black text-[12px] uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center gap-3"
                        >
                          {isCreatingFromBarcodeBulk ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <FileUp className="w-5 h-5" />
                          )}
                          <span>
                            {isCreatingFromBarcodeBulk
                              ? "Importing..."
                              : `Import ${bulkItems.filter((i) => i.code.trim()).length} Devices`}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                )}

                <TabsContent
                  value="import-csv"
                  className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                >
                  <ImportCsvModalContent
                    onClose={onClose}
                    categoryId={categoryId}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              renderFormContent()
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ScanResultModal
        isOpen={!!scanResultModalData}
        onClose={() => {
          setScanResultModalData(null);
          onClose();
        }}
        data={scanResultModalData}
      />

      <SupplierFormModal
        isOpen={isSupplierFormOpen}
        onClose={() => setIsSupplierFormOpen(false)}
        onCreated={(newSupplier) => {
          form.setValue("supplierId", newSupplier._id);
          setSupplierSearch("");
          setIsSupplierFormOpen(false);
        }}
      />
    </>
  );
}
