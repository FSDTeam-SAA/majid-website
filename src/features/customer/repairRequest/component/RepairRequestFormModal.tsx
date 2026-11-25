"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import {
  useCustomersByShopkeeper,
  useCreateCustomer,
} from "@/features/shopkeeper/inventory/hooks/useInventory";
import { Customer } from "@/features/shopkeeper/inventory/types";
import {
  Check,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  Search,
  Smartphone,
  Tablet,
  Laptop,
  Gamepad2,
  Unlock,
  Wrench,
  X,
  Trash2,
  Calendar,
  Info,
  Camera,
  CheckCircle2,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  ThumbsUp,
  Smile,
  AlertTriangle,
} from "lucide-react";
import { useCompatibleParts } from "@/features/shopkeeper/repairParts/hooks/useRepairParts";
import deviceCatalogData from "@/features/shopkeeper/repairParts/data/deviceCatalog.json";
import {
  REPAIR_DEFAULT_COLOURS,
  REPAIR_ISSUE_CATEGORIES,
  formatDeviceCatalogTitle,
  isIssuePriceOptional,
} from "../utils/repairConstants";
import {
  DevicePasscodeInputValue,
  RepairPasscodeField,
} from "./RepairPasscodeField";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useCreateRepairRequest,
  useRepairTechnicians,
} from "../hooks/useRepairRequest";
import { RepairRequest, Shopkeeper } from "../types/repair-request.types";

interface SelectedIssue {
  category: string;
  problems: string[];
  additionalInfo?: string;
  estimatedTime: string;
  estimatedPrice: number;
  selectedPart?: {
    variantId?: string;
    variantName: string;
    sku: string;
    price: number;
    quantity: number;
  };
}

interface RepairRequestFormModalProps {
  shopkeeper?: Shopkeeper | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "reassign";
  repairRequest?: RepairRequest;
  createCustomerOnSubmit?: boolean;
}

const CATEGORIES = [
  {
    id: "Mobile Phone",
    title: "Mobile Phone",
    subtitle: "Apple / Android",
    icon: Smartphone,
  },
  {
    id: "Tablet",
    title: "Tablet",
    subtitle: "Apple / Android",
    icon: Tablet,
  },
  {
    id: "Laptop",
    title: "Laptop",
    subtitle: "Apple / Windows",
    icon: Laptop,
  },
  {
    id: "Games Console",
    title: "Games Console",
    subtitle: "PlayStation / Xbox / Nintendo",
    icon: Gamepad2,
  },
  {
    id: "Unlocking",
    title: "Unlocking",
    subtitle: "Screen password, Network unlock, FRP",
    icon: Unlock,
  },
  {
    id: "Service",
    title: "Service",
    subtitle: "Speaker service, Charging port cleaning",
    icon: Wrench,
  },
];

const BRANDS = [
  "All",
  "Apple",
  "Samsung",
  "Google",
  "Xiaomi",
  "Sony",
  "Microsoft",
  "Nintendo",
  "OnePlus",
  "Oppo",
  "Vivo",
  "Other",
];

const CONDITIONS = [
  { id: "New", label: "New", icon: Sparkles, color: "text-blue-500 bg-blue-500/10" },
  { id: "Like New", label: "Like New", icon: ThumbsUp, color: "text-emerald-500 bg-emerald-500/10" },
  { id: "Good", label: "Good", icon: CheckCircle2, color: "text-[#10B981] bg-[#10B981]/10" },
  { id: "Fair", label: "Fair", icon: Smile, color: "text-amber-500 bg-amber-500/10" },
  { id: "Poor", label: "Poor", icon: AlertTriangle, color: "text-rose-500 bg-rose-500/10" },
];

const ISSUE_CATEGORIES = REPAIR_ISSUE_CATEGORIES;

const COMMON_PROBLEMS: Record<string, string[]> = Object.fromEntries(
  REPAIR_ISSUE_CATEGORIES.map((c) => [c.id, c.problems]),
);

export function RepairRequestFormModal({
  isOpen,
  onClose,
  mode = "create",
  repairRequest,
  createCustomerOnSubmit = false,
}: RepairRequestFormModalProps) {
  const { data: session } = useSession();
  const { data: profileData } = useMyProfile();
  const user = profileData?.data;

  const sessionUser = session?.user as
    | { id?: string; shopkeeperId?: string; role?: string }
    | undefined;
  const shopkeeperId =
    sessionUser?.shopkeeperId || sessionUser?.id || user?._id || "";

  const { data: customersData } = useCustomersByShopkeeper(shopkeeperId);
  const customers: Customer[] = useMemo(
    () => customersData?.data || [],
    [customersData?.data],
  );

  const createRepairRequest = useCreateRepairRequest();
  const createCustomer = useCreateCustomer();
  const { data: techniciansData } = useRepairTechnicians(isOpen);
  const technicians = techniciansData?.data || [];

  // Step state: 1 to 5
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Category
  const [category, setCategory] = useState("Mobile Phone");

  // Step 2: Device (blank until selected — never invent placeholder device/A-code)
  const [selectedBrand, setSelectedBrand] = useState("Apple");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<{
    brand: string;
    deviceType?: string;
    modelName: string;
    modelCode: string;
    releaseYear: string;
  } | null>(null);

  // Step 3: Details (empty defaults until staff selects/enters them)
  const [selectedColour, setSelectedColour] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("Good");
  const [imeiNumber, setImeiNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [devicePasscode, setDevicePasscode] = useState<DevicePasscodeInputValue>({
    type: "none",
    value: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Step 4: Issues
  const [selectedIssues, setSelectedIssues] = useState<SelectedIssue[]>([]);
  const [activeIssueCategory, setActiveIssueCategory] = useState<string | null>(null);
  const [activeProblems, setActiveProblems] = useState<string[]>([]);
  const [activeDetails, setActiveDetails] = useState("");
  const [activeTime, setActiveTime] = useState("1–2 Hours");
  const [activePrice, setActivePrice] = useState("");
  const [activePartQuantity, setActivePartQuantity] = useState(1);

  // Step 5: Customer Details
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustFirst, setNewCustFirst] = useState("");
  const [newCustLast, setNewCustLast] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [technician, setTechnician] = useState("");

  // Compatible parts for active issue
  const { data: compatiblePartsData } = useCompatibleParts(
    {
      modelName: selectedDevice?.modelName,
      issue: activeIssueCategory || undefined,
      shopId: shopkeeperId || undefined,
    },
    isOpen && Boolean(selectedDevice?.modelName && activeIssueCategory),
  );
  const recommendedParts: any[] = Array.isArray(compatiblePartsData)
    ? compatiblePartsData
    : [];

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const hay = `${c.firstName} ${c.lastName || ""} ${c.phone || ""} ${c.email || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [customers, customerSearch]);

  // Handle Photo selection
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setPhotos((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...previews]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Filter device catalog
  const filteredCatalog = useMemo(() => {
    let list = deviceCatalogData as Array<{
      brand: string;
      deviceType: string;
      modelName: string;
      releaseYear: string;
      modelCode: string;
    }>;

    const categoryDeviceMap: Record<string, string[]> = {
      "Mobile Phone": ["phone"],
      Tablet: ["tablet"],
      Laptop: ["laptop", "desktop"],
      "Games Console": ["console"],
    };
    const allowedTypes = categoryDeviceMap[category];
    if (allowedTypes && !deviceSearch.trim()) {
      list = list.filter((d) =>
        allowedTypes.includes(String(d.deviceType || "").toLowerCase()),
      );
    }

    if (selectedBrand !== "All") {
      list = list.filter(
        (d) => d.brand.toLowerCase() === selectedBrand.toLowerCase(),
      );
    }

    if (deviceSearch.trim()) {
      const q = deviceSearch.trim().toLowerCase();
      const cleanQ = q.replace(/^sm-/, "");
      list = list.filter((d) => {
        const displayTitle = formatDeviceCatalogTitle(d.brand, d.modelName).toLowerCase();
        const name = d.modelName.toLowerCase();
        const code = (d.modelCode || "").toLowerCase();
        const year = String(d.releaseYear || "").toLowerCase();
        return (
          displayTitle.includes(q) ||
          name.includes(q) ||
          code.includes(q) ||
          (cleanQ ? code.replace(/^sm-/, "").includes(cleanQ) : false) ||
          year.includes(q)
        );
      });
    }

    return list.slice(0, 60);
  }, [selectedBrand, deviceSearch, category]);

  // Calculate total
  const totalAmount = useMemo(() => {
    return selectedIssues.reduce((sum, item) => {
      let cost = Number(item.estimatedPrice || 0);
      if (item.selectedPart) {
        cost += item.selectedPart.price * item.selectedPart.quantity;
      }
      return sum + cost;
    }, 0);
  }, [selectedIssues]);

  const handleSaveInlineCustomer = async () => {
    if (!newCustFirst.trim()) {
      toast.error("Please enter customer first name");
      return;
    }
    if (!newCustPhone.trim()) {
      toast.error("Please enter customer phone number");
      return;
    }
    try {
      const createdRes: any = await createCustomer.mutateAsync({
        firstName: newCustFirst.trim(),
        lastName: newCustLast.trim(),
        email:
          newCustEmail.trim() ||
          `${newCustPhone.replace(/\D/g, "")}@customer.local`,
        phone: newCustPhone.trim(),
        address: "",
        shopkeeperId,
      });
      const createdCust: Customer | undefined = createdRes?.data || createdRes;
      if (createdCust && createdCust._id) {
        setSelectedCustomer(createdCust);
        setFullName(
          `${createdCust.firstName} ${createdCust.lastName || ""}`.trim(),
        );
        setPhone(createdCust.phone || newCustPhone.trim());
        setEmail(createdCust.email || newCustEmail.trim());
      } else {
        setFullName(`${newCustFirst.trim()} ${newCustLast.trim()}`.trim());
        setPhone(newCustPhone.trim());
        setEmail(newCustEmail.trim());
      }
      setShowNewCustomerForm(false);
      toast.success("Customer saved and linked");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save customer");
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!selectedDevice) {
      toast.error("Please select a device model");
      setCurrentStep(2);
      return;
    }
    if (selectedIssues.length === 0) {
      toast.error("Please select at least one issue or Dead Device / No Power");
      setCurrentStep(4);
      return;
    }
    if (!fullName.trim() && !selectedCustomer) {
      toast.error("Please select an existing customer or enter customer name");
      return;
    }
    if (!phone.trim() && !selectedCustomer?.phone) {
      toast.error("Please provide a customer phone number");
      return;
    }

    let resolvedCustomerId = selectedCustomer?._id;
    const primaryCustName = selectedCustomer
      ? `${selectedCustomer.firstName} ${selectedCustomer.lastName || ""}`.trim()
      : fullName.trim();
    const primaryPhone = selectedCustomer?.phone || phone.trim();
    const primaryEmail =
      selectedCustomer?.email ||
      email.trim() ||
      `${primaryPhone.replace(/\D/g, "")}@customer.local`;

    if (!resolvedCustomerId && fullName.trim()) {
      const [fName, ...lParts] = fullName.trim().split(/\s+/);
      try {
        const createdCustRes: any = await createCustomer.mutateAsync({
          firstName: fName || fullName.trim(),
          lastName: lParts.join(" "),
          email: primaryEmail,
          phone: primaryPhone,
          address: "",
          shopkeeperId,
        });
        resolvedCustomerId =
          createdCustRes?.data?._id || createdCustRes?._id || undefined;
      } catch {
        // Non-blocking fallback if customer already exists
      }
    }

    const description = selectedIssues
      .map(
        (iss) =>
          `${iss.category}: ${(iss.problems || []).join(", ")}${
            iss.additionalInfo ? ` (${iss.additionalInfo})` : ""
          }`,
      )
      .join("\n");

    const issuesPayload = selectedIssues.map((iss) => ({
      category: iss.category,
      problems: iss.problems || [],
      issueCategory: iss.category,
      commonProblems: iss.problems || [],
      additionalInfo: iss.additionalInfo || "",
      additionalDetails: iss.additionalInfo || "",
      estimatedTime: iss.estimatedTime,
      estimatedPrice: iss.estimatedPrice,
      selectedPart: iss.selectedPart,
    }));

    const cleanImei = imeiNumber.trim();
    const cleanSerial = serialNumber.trim();
    const serialMode =
      cleanImei && cleanSerial
        ? "both"
        : cleanSerial
          ? "serial"
          : cleanImei
            ? "imei"
            : undefined;

    try {
      await createRepairRequest.mutateAsync({
        firstName: primaryCustName,
        email: primaryEmail,
        phoneNumber: primaryPhone,
        customerId: resolvedCustomerId,
        price: totalAmount,
        deviceModel: formatDeviceCatalogTitle(
          selectedDevice.brand,
          selectedDevice.modelName,
        ),
        IMEINumber: cleanImei || undefined,
        serialNumber: cleanSerial || undefined,
        serialType: serialMode,
        description: description || "Repair diagnostic requested",
        technician: technician || undefined,
        category,
        brand: selectedDevice.brand,
        modelName: selectedDevice.modelName,
        modelCode: selectedDevice.modelCode,
        releaseYear: selectedDevice.releaseYear,
        colour: selectedColour || undefined,
        condition: selectedCondition,
        devicePasscode:
          devicePasscode.type !== "none" && devicePasscode.value.trim()
            ? devicePasscode
            : undefined,
        issues: issuesPayload,
        photoType: "booking",
        images: photos,
      });

      toast.success("Repair Request created successfully!");
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create repair request",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl lg:max-w-5xl w-[95vw] max-w-[95vw] h-[88vh] max-h-[88vh] flex flex-col gap-0 p-0 overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl"
      >
        {/* Header with Visual Stepper */}
        <div className="shrink-0 bg-card border-b border-border px-6 sm:px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                New Repair Request
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete the 5 steps to book and diagnose this device repair
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* 5-Step Stepper */}
          <div className="flex items-center justify-between relative px-2">
            {[
              { num: 1, label: "Category" },
              { num: 2, label: "Device" },
              { num: 3, label: "Details" },
              { num: 4, label: "Issues" },
              { num: 5, label: "Review" },
            ].map((step) => {
              const isPassed = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="flex flex-col items-center z-10">
                  <div
                    onClick={() => {
                      if (step.num < currentStep) setCurrentStep(step.num);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black cursor-pointer transition-all ${
                      isPassed
                        ? "bg-[#10B981] text-white shadow-sm"
                        : isCurrent
                          ? "bg-[#10B981] text-white ring-4 ring-[#10B981]/20 shadow-sm"
                          : "bg-surface border border-border text-muted-foreground"
                    }`}
                  >
                    {isPassed ? <Check size={14} /> : step.num}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-1.5 ${
                      isCurrent || isPassed
                        ? "text-foreground font-black"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
            <div className="absolute top-4.5 left-8 right-8 h-0.5 bg-border -z-0" />
          </div>
        </div>

        {/* Modal Body - Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 space-y-6">
          {/* STEP 1: CATEGORY */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Choose a category
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select the type of device or service
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => {
                  const IconComp = cat.icon;
                  const isSel = category === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between h-40 ${
                        isSel
                          ? "border-[#10B981] bg-[#10B981]/5 shadow-sm ring-1 ring-[#10B981]"
                          : "border-border bg-surface hover:border-[#10B981]/40"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isSel
                            ? "bg-[#10B981] text-white"
                            : "bg-card border border-border text-foreground"
                        }`}
                      >
                        <IconComp size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">
                          {cat.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cat.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DEVICE SELECTION */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Select phone brand
                </h3>
                <p className="text-xs text-muted-foreground">
                  Choose the brand and exact model for accurate repair options
                </p>
              </div>

              {/* Brand Pills */}
              <div className="flex flex-wrap gap-2 pb-1">
                {BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBrand(b)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      selectedBrand === b
                        ? "bg-[#10B981] text-white shadow-sm"
                        : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search device model (e.g. iPhone 15, S24, A3105)..."
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-[#10B981]"
                />
              </div>

              {/* Models List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredCatalog.map((item) => {
                  const isSel =
                    selectedDevice?.modelName === item.modelName &&
                    selectedDevice?.brand === item.brand;
                  return (
                    <div
                      key={`${item.brand}-${item.modelName}-${item.modelCode}`}
                      onClick={() =>
                        setSelectedDevice({
                          brand: item.brand,
                          modelName: item.modelName,
                          modelCode: item.modelCode,
                          releaseYear: item.releaseYear,
                        })
                      }
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSel
                          ? "border-[#10B981] bg-[#10B981]/5"
                          : "border-border bg-surface hover:border-[#10B981]/40"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                            isSel
                              ? "border-[#10B981] bg-[#10B981]"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSel && <Check size={12} className="text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground wrap-break-word whitespace-normal leading-snug">
                            {formatDeviceCatalogTitle(item.brand, item.modelName)}
                          </p>
                          {item.modelCode && (
                            <p className="text-xs text-muted-foreground font-mono wrap-break-word whitespace-normal mt-0.5">
                              {item.modelCode}
                            </p>
                          )}
                        </div>
                      </div>
                      {item.releaseYear && (
                        <span className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold bg-card border border-border text-muted-foreground max-w-[110px] truncate">
                          {item.releaseYear}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Selected Device Preview Card */}
              <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-foreground shrink-0">
                    <Smartphone size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-foreground wrap-break-word">
                      {selectedDevice
                        ? formatDeviceCatalogTitle(
                            selectedDevice.brand,
                            selectedDevice.modelName,
                          )
                        : "No device selected"}
                    </h4>
                    <p className="text-xs text-muted-foreground wrap-break-word">
                      {[selectedDevice?.modelCode, selectedDevice?.releaseYear]
                        .filter(Boolean)
                        .join(" • ") || "Select a model"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-[#10B981] hover:underline shrink-0 ml-2"
                >
                  Change
                </button>
              </div>

              {/* Colour Selection (Standardized 13 colours) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                    Colour {selectedColour ? `· ${selectedColour}` : "(Optional)"}
                  </label>
                  {selectedColour && (
                    <button
                      type="button"
                      onClick={() => setSelectedColour("")}
                      className="text-[11px] font-bold text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {REPAIR_DEFAULT_COLOURS.map((c) => {
                    const isSel = selectedColour === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() =>
                          setSelectedColour((prev) => (prev === c.name ? "" : c.name))
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 transition-all ${
                          isSel
                            ? "border-[#10B981] bg-[#10B981]/10 text-foreground"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: c.hex }}
                        />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Item Condition */}
              <div>
                <label className="text-xs font-black uppercase text-muted-foreground tracking-wider mb-2 block">
                  Item Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {CONDITIONS.map((cond) => {
                    const isSel = selectedCondition === cond.id;
                    const IconComp = cond.icon;
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setSelectedCondition(cond.id)}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                          isSel
                            ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981] shadow-xs"
                            : "border-border bg-surface text-muted-foreground hover:border-[#10B981]/40 hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                            isSel
                              ? "bg-[#10B981] text-white"
                              : cond.color
                          }`}
                        >
                          <IconComp size={18} strokeWidth={2.2} />
                        </div>
                        <span className="text-xs font-bold tracking-tight">
                          {cond.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Independent IMEI & Serial Number Fields (Blank until entered) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-wider mb-1.5 block">
                    IMEI Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Blank unless scanned or entered"
                    value={imeiNumber}
                    onChange={(e) => setImeiNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-wider mb-1.5 block">
                    Serial Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Blank unless entered"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              {/* Optional Masked Device Passcode */}
              <RepairPasscodeField
                value={devicePasscode}
                onChange={setDevicePasscode}
              />

              {/* Booking Intake Photos (Optional) with 30-Day Auto Delete Notice */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black uppercase text-muted-foreground tracking-wider block">
                    Booking Intake Photos (Optional — Included on Invoice)
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Add intake condition photos (damaged screen, back cover, liquid damage, etc.)
                  </p>
                </div>

                {/* 30-Day Notice Banner */}
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-2.5 items-start">
                  <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      These photos will be automatically deleted after 30 days.
                    </p>
                    <p className="text-[11px] text-blue-600/80 dark:text-blue-300/80 mt-0.5">
                      They are used only for repair diagnosis and will not be stored permanently.
                    </p>
                  </div>
                </div>

                {/* Photo Previews & Upload Box */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {photoPreviews.map((preview, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden border border-border group"
                    >
                      <img
                        src={preview}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-[#10B981] flex flex-col items-center justify-center gap-1 cursor-pointer bg-surface/50">
                    <Camera size={20} className="text-muted-foreground" />
                    <span className="text-[11px] font-bold text-muted-foreground">
                      Add Photo
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REPAIR ISSUES */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* If user is editing a specific issue sub-view */}
              {activeIssueCategory ? (
                <div className="space-y-5 border border-border p-5 rounded-2xl bg-surface">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-foreground flex items-center gap-2">
                      <Smartphone size={16} className="text-[#10B981]" />
                      {activeIssueCategory}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveIssueCategory(null)}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-2 block">
                      Common problems for {selectedDevice?.modelName || "this device"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(COMMON_PROBLEMS[activeIssueCategory] || ["General issue"]).map(
                        (p) => {
                          const isSel = activeProblems.includes(p);
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setActiveProblems((prev) =>
                                  prev.includes(p)
                                    ? prev.filter((x) => x !== p)
                                    : [...prev, p],
                                );
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                isSel
                                  ? "border-[#10B981] bg-[#10B981] text-white"
                                  : "border-border bg-card text-foreground"
                              }`}
                            >
                              {p}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </div>

                  {/* Additional details */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground mb-1 block">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add more details (e.g. error codes, when it happens)..."
                      value={activeDetails}
                      onChange={(e) => setActiveDetails(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-[#10B981]"
                    />
                  </div>

                  {/* Estimated time & price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">
                        Estimated Time
                      </label>
                      <select
                        value={activeTime}
                        onChange={(e) => setActiveTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-[#10B981]"
                      >
                        <option>30–60 Mins</option>
                        <option>1–2 Hours</option>
                        <option>2–4 Hours</option>
                        <option>1–2 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground mb-1 block">
                        {isIssuePriceOptional(activeIssueCategory)
                          ? "Estimated Price (£) — Optional (0 for Price TBC)"
                          : "Estimated Price (£)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={
                          isIssuePriceOptional(activeIssueCategory)
                            ? "Optional (leave blank / 0 for TBC)"
                            : "0.00"
                        }
                        value={activePrice}
                        onChange={(e) => setActivePrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  {/* Recommended Parts Section with Live Stock */}
                  {recommendedParts.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                          Recommended parts ({recommendedParts.length})
                        </label>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {recommendedParts.map((part: any) => (
                          <div
                            key={part._id}
                            className="p-3 rounded-xl bg-card border border-border flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {part.partName || part.category}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                SKU: {part.sku} • £{part.sellingPrice?.toFixed(2)}
                              </p>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black bg-[#10B981]/15 text-[#10B981]">
                                {part.available > 0
                                  ? `In Stock (${part.available})`
                                  : "Out of Stock"}
                              </span>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedIssues((prev) => [
                                  ...prev,
                                  {
                                    category: activeIssueCategory,
                                    problems: activeProblems.length
                                      ? activeProblems
                                      : ["Repair issue"],
                                    additionalInfo: activeDetails,
                                    estimatedTime: activeTime,
                                    estimatedPrice: parseFloat(activePrice) || 0,
                                    selectedPart: {
                                      variantId: part._id,
                                      variantName: part.partName || part.category,
                                      sku: part.sku,
                                      price: part.sellingPrice,
                                      quantity: activePartQuantity,
                                    },
                                  },
                                ]);
                                setActiveIssueCategory(null);
                                setActiveProblems([]);
                                setActiveDetails("");
                                toast.success("Issue and part added");
                              }}
                              className="h-8 text-xs font-bold"
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    type="button"
                    onClick={() => {
                      if (!activeProblems.length) {
                        toast.error("Please select at least one problem");
                        return;
                      }
                      setSelectedIssues((prev) => [
                        ...prev,
                        {
                          category: activeIssueCategory,
                          problems: activeProblems,
                          additionalInfo: activeDetails,
                          estimatedTime: activeTime,
                          estimatedPrice: parseFloat(activePrice) || 0,
                        },
                      ]);
                      setActiveIssueCategory(null);
                      setActiveProblems([]);
                      setActiveDetails("");
                    }}
                    className="w-full bg-[#10B981] text-white hover:bg-[#10B981]/90"
                  >
                    Add Issue
                  </Button>
                </div>
              ) : (
                <>
                  {/* Selected Issues Summary */}
                  {selectedIssues.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                          Selected issues ({selectedIssues.length})
                        </label>
                      </div>
                      <div className="space-y-2">
                        {selectedIssues.map((iss, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-surface border border-border flex items-start justify-between"
                          >
                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-foreground">
                                {iss.category}
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {iss.problems.map((p) => (
                                  <span
                                    key={p}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#10B981]/15 text-[#10B981]"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                              {iss.selectedPart && (
                                <p className="text-xs text-muted-foreground">
                                  Part: {iss.selectedPart.variantName} (£
                                  {iss.selectedPart.price.toFixed(2)})
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Est. {iss.estimatedTime} •{" "}
                                {iss.estimatedPrice > 0
                                  ? `£${iss.estimatedPrice.toFixed(2)}`
                                  : "Price TBC"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedIssues((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Another Issue Button / Categories Grid */}
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3 block">
                      Choose issue to add
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {ISSUE_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setActiveIssueCategory(cat.id);
                            setActiveProblems([]);
                            setActiveDetails("");
                            setActiveTime(cat.defaultTime);
                            setActivePrice(
                              cat.optionalPrice || cat.defaultPrice <= 0
                                ? ""
                                : cat.defaultPrice.toFixed(2),
                            );
                          }}
                          className="p-3 rounded-xl border border-border bg-surface hover:border-[#10B981] flex items-center justify-between text-left text-xs font-bold text-foreground transition-all"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="block">{cat.label}</span>
                            {cat.optionalPrice && (
                              <span className="text-[10px] font-normal text-muted-foreground">
                                No price required at intake
                              </span>
                            )}
                          </div>
                          <Plus size={14} className="text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 5: REVIEW & BOOK */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  Review &amp; book
                </h3>
                <p className="text-xs text-muted-foreground">
                  Check all details before creating the repair request
                </p>
              </div>

              {/* Device Summary Card */}
              <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-foreground">
                    <Smartphone size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">
                      {selectedDevice
                        ? formatDeviceCatalogTitle(
                            selectedDevice.brand,
                            selectedDevice.modelName,
                          )
                        : "Device not selected"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {[selectedDevice?.modelCode, selectedDevice?.releaseYear]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        selectedColour || "Colour not specified",
                        selectedCondition,
                        devicePasscode.type !== "none" && devicePasscode.value
                          ? `Passcode (${devicePasscode.type})`
                          : "No passcode",
                      ].join(" • ")}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-[#10B981] hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Repair Issues Summary */}
              <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                    Repair Issues ({selectedIssues.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="text-xs font-bold text-[#10B981] hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedIssues.map((iss, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-card border border-border flex justify-between items-center"
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {iss.category}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {iss.problems.join(", ")}
                        </p>
                        {iss.selectedPart && (
                          <p className="text-[11px] text-[#10B981] font-semibold">
                            Part: {iss.selectedPart.variantName}
                          </p>
                        )}
                      </div>
                      <p className="text-xs font-black text-foreground">
                        {iss.estimatedPrice > 0
                          ? `£${iss.estimatedPrice.toFixed(2)}`
                          : "Price TBC"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Details Form: Search Existing + Create New Inline */}
              <div className="p-4 rounded-2xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
                    Customer Selection &amp; Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerForm((v) => !v)}
                    className="text-xs font-bold text-[#10B981] hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} />{" "}
                    {showNewCustomerForm ? "Cancel New" : "New Customer"}
                  </button>
                </div>

                {showNewCustomerForm && (
                  <div className="p-3.5 rounded-xl bg-card border border-[#10B981]/40 space-y-3">
                    <p className="text-xs font-bold text-foreground">
                      Create &amp; Link Customer Record
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="text"
                        placeholder="First Name *"
                        value={newCustFirst}
                        onChange={(e) => setNewCustFirst(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-surface border border-border text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={newCustLast}
                        onChange={(e) => setNewCustLast(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-surface border border-border text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Phone Number *"
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-surface border border-border text-xs"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={newCustEmail}
                        onChange={(e) => setNewCustEmail(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-surface border border-border text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={createCustomer.isPending}
                      onClick={handleSaveInlineCustomer}
                      className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-full"
                    >
                      {createCustomer.isPending
                        ? "Saving..."
                        : "Save & Select Customer"}
                    </Button>
                  </div>
                )}

                {customers.length > 0 && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        placeholder="Search existing customer by name, phone, email..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                    <select
                      value={selectedCustomer?._id || ""}
                      onChange={(e) => {
                        const found = customers.find((c) => c._id === e.target.value);
                        if (found) {
                          setSelectedCustomer(found);
                          setFullName(
                            `${found.firstName} ${found.lastName || ""}`.trim(),
                          );
                          setPhone(found.phone || "");
                          setEmail(found.email || "");
                        } else {
                          setSelectedCustomer(null);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-[#10B981]"
                    >
                      <option value="">
                        -- Select Existing ({filteredCustomers.length}) or Manual Entry --
                      </option>
                      {filteredCustomers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.firstName} {c.lastName} ({c.phone || c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      placeholder="+44 7700 900123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-[#10B981]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted-foreground">
                    Estimated Total
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {totalAmount > 0
                      ? `£${totalAmount.toFixed(2)}`
                      : "Price TBC"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-bold">
                  <Calendar size={16} />
                  Ready to book
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls - ALWAYS PINNED AT BOTTOM */}
        <div className="shrink-0 bg-card border-t border-border px-6 sm:px-8 py-4 flex items-center justify-between z-10 shadow-sm">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((s) => s - 1)}
              className="rounded-full px-6 h-11 font-bold border-border hover:bg-surface"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={() => {
                if (currentStep === 2 && !selectedDevice) {
                  toast.error("Please select a device model to continue");
                  return;
                }
                setCurrentStep((s) => s + 1);
              }}
              className="rounded-full px-8 h-11 bg-[#10B981] hover:bg-[#059669] text-white font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              type="button"
              disabled={createRepairRequest.isPending}
              onClick={handleSubmit}
              className="rounded-full px-8 h-11 bg-[#10B981] hover:bg-[#059669] text-white font-black flex items-center gap-2 shadow-sm active:scale-[0.98] transition-all"
            >
              {createRepairRequest.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  <span>Create Repair Request</span>
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
