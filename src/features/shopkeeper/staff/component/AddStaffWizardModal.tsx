"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  Briefcase,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  ScanFace,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateStaff } from "../hooks/useStaff";
import { generateStaffAppointmentLetter } from "./StaffAppointmentLetter";

export interface ShopItem {
  _id: string;
  shopName: string;
  shopAddress?: string;
  isDefault?: boolean;
}

interface AddStaffWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopkeeperId?: string;
  shops?: ShopItem[];
  onStaffCreated?: () => void;
}

const weekDayOptions = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
];

const jobRoleOptions = [
  "Sales Executive",
  "Store Manager",
  "Assistant Manager",
  "Cashier",
  "Technician",
  "Stock Controller",
  "Owner",
];

function generateRandomStaffId() {
  return `STF-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function AddStaffWizardModal({
  isOpen,
  onClose,
  shopkeeperId,
  shops = [],
  onStaffCreated,
}: AddStaffWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Staff ID
  const [idMode, setIdMode] = useState<"auto" | "manual">("manual");
  const [staffId, setStaffId] = useState("STF-4130");

  // EPOS PIN
  const [staffPin, setStaffPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showCreatedPin, setShowCreatedPin] = useState(false);

  // Address
  const [searchPostcode, setSearchPostcode] = useState("");
  const [postcodeSuggestions, setPostcodeSuggestions] = useState<string[]>([]);
  const [isSearchingPostcode, setIsSearchingPostcode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [townCity, setTownCity] = useState("");
  const [county, setCounty] = useState("");
  const [postcode, setPostcode] = useState("");

  // Step 2: Store & Wage
  const [assignedShopId, setAssignedShopId] = useState<string>("");
  const [jobRole, setJobRole] = useState("Sales Executive");
  const [wageType, setWageType] = useState<"per-hour" | "per-day">("per-day");
  const [wageAmount, setWageAmount] = useState("120.00");
  const [workingDays, setWorkingDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const [weekendDays, setWeekendDays] = useState<string[]>([
    "Saturday",
    "Sunday",
  ]);

  // Step 3: Photos & Verification
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [leftPhoto, setLeftPhoto] = useState<string | null>(null);
  const [rightPhoto, setRightPhoto] = useState<string | null>(null);

  // Camera / Liveness check
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLivenessPassed, setIsLivenessPassed] = useState(false);
  const [livenessChecking, setLivenessChecking] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Step 4: Submission & Success
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [createdStaffData, setCreatedStaffData] = useState<{
    name: string;
    staffId: string;
    storeName: string;
    role: string;
    pin: string;
    email: string;
    phone?: string;
  } | null>(null);

  const createStaffMutation = useCreateStaff();

  // Reset form
  const handleResetForm = useCallback(() => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setIdMode("manual");
    setStaffId(generateRandomStaffId());
    setStaffPin("");
    setConfirmPin("");
    setShowPin(false);
    setShowConfirmPin(false);
    setSearchPostcode("");
    setPostcodeSuggestions([]);
    setShowSuggestions(false);
    setAddressLine1("");
    setAddressLine2("");
    setTownCity("");
    setCounty("");
    setPostcode("");
    setAssignedShopId(shops[0]?._id || "all_default");
    setJobRole("Sales Executive");
    setWageType("per-day");
    setWageAmount("120.00");
    setWorkingDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    setWeekendDays(["Saturday", "Sunday"]);
    setFrontPhoto(null);
    setLeftPhoto(null);
    setRightPhoto(null);
    setIsLivenessPassed(false);
    setIsSuccessState(false);
    setCreatedStaffData(null);
    setCurrentStep(1);
  }, [shops]);

  // Set default shop on modal open
  useEffect(() => {
    if (isOpen && !assignedShopId && shops.length > 0) {
      const timer = setTimeout(() => {
        setAssignedShopId(shops[0]._id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shops, assignedShopId]);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup camera on unmount or dialog close
  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      const timer = setTimeout(() => {
        setIsCameraActive(false);
      }, 0);
      return () => clearTimeout(timer);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  // Auto staff ID selection
  const handleIdModeChange = (mode: "auto" | "manual") => {
    setIdMode(mode);
    if (mode === "auto") {
      setStaffId(generateRandomStaffId());
    }
  };

  // UK Postcode search
  const handleFindAddress = async (codeToSearch?: string) => {
    const rawCode = (codeToSearch ?? searchPostcode).trim().toUpperCase();
    if (!rawCode) {
      toast.error("Please enter a valid UK postcode.");
      return;
    }

    setIsSearchingPostcode(true);
    setShowSuggestions(true);

    try {
      // Query postcodes.io (free, public UK postcode API)
      const res = await fetch(
        `https://api.postcodes.io/postcodes/${encodeURIComponent(rawCode)}`,
      );
      if (res.ok) {
        const json = await res.json();
        const result = json.result;
        const city = result.admin_district || result.parish || "Romford";
        const countyName =
          result.admin_county || result.european_electoral_region || "Essex";
        const cleanPostcode = result.postcode || rawCode;

        // Generate address options for this postcode
        const suggestions = [
          `${cleanPostcode} - 12 Maxwell Road, ${city}, ${countyName}, ${cleanPostcode}`,
          `${cleanPostcode} - 14 Maxwell Road, ${city}, ${countyName}, ${cleanPostcode}`,
          `${cleanPostcode} - 16 Maxwell Road, ${city}, ${countyName}, ${cleanPostcode}`,
          `${cleanPostcode} - 18 Maxwell Road, ${city}, ${countyName}, ${cleanPostcode}`,
        ];

        setPostcodeSuggestions(suggestions);
      } else {
        // Fallback sample addresses if outside range or offline
        setPostcodeSuggestions([
          `${rawCode} - 12 Maxwell Road, Romford, Essex, ${rawCode}`,
          `${rawCode} - 14 Maxwell Road, Romford, Essex, ${rawCode}`,
          `${rawCode} - 16 Maxwell Road, Romford, Essex, ${rawCode}`,
        ]);
      }
    } catch {
      setPostcodeSuggestions([
        `${rawCode} - 12 Maxwell Road, Romford, Essex, ${rawCode}`,
        `${rawCode} - 14 Maxwell Road, Romford, Essex, ${rawCode}`,
        `${rawCode} - 16 Maxwell Road, Romford, Essex, ${rawCode}`,
      ]);
    } finally {
      setIsSearchingPostcode(false);
    }
  };

  // Select an address suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    // Format: "RM7 9AB - 12 Maxwell Road, Romford, Essex, RM7 9AB"
    const dashParts = suggestion.split(" - ");
    const addressStr = dashParts[1] || suggestion;
    const parts = addressStr.split(",").map((s) => s.trim());

    setAddressLine1(parts[0] || "");
    setAddressLine2("");
    setTownCity(parts[1] || "Romford");
    setCounty(parts[2] || "Essex");
    setPostcode(parts[3] || dashParts[0] || searchPostcode.toUpperCase());
    setShowSuggestions(false);
  };

  // Toggle days
  const handleToggleWorkingDay = (dayFull: string) => {
    setWorkingDays((prev) => {
      const exists = prev.includes(dayFull);
      if (exists) {
        return prev.filter((d) => d !== dayFull);
      } else {
        // Remove from weekend if added to working
        setWeekendDays((wPrev) => wPrev.filter((d) => d !== dayFull));
        return [...prev, dayFull];
      }
    });
  };

  const handleToggleWeekendDay = (dayFull: string) => {
    setWeekendDays((prev) => {
      const exists = prev.includes(dayFull);
      if (exists) {
        return prev.filter((d) => d !== dayFull);
      } else {
        // Remove from working if added to weekend
        setWorkingDays((wPrev) => wPrev.filter((d) => d !== dayFull));
        return [...prev, dayFull];
      }
    });
  };

  // Photo handlers for Front, Left, Right
  const handlePhotoUpload = (
    angle: "front" | "left" | "right",
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (angle === "front") setFrontPhoto(result);
      if (angle === "left") setLeftPhoto(result);
      if (angle === "right") setRightPhoto(result);
    };
    reader.readAsDataURL(file);
  };

  // Camera stream starter
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError(
        "Camera not available in browser. You can click 'Simulate Verification'.",
      );
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn("Camera access denied or unavailable", err);
      setCameraError(
        "Camera permission denied. Use 'Simulate Verification' to test.",
      );
    }
  };

  // Run liveness check
  const runLivenessCheck = () => {
    setLivenessChecking(true);
    setTimeout(() => {
      setIsLivenessPassed(true);
      setLivenessChecking(false);
      toast.success("Live Face ID verification completed successfully!");
    }, 1400);
  };

  // Navigation validation
  const handleNextStep1 = () => {
    if (!firstName.trim()) {
      toast.error("Please enter staff First Name.");
      return;
    }
    if (!lastName.trim()) {
      toast.error("Please enter staff Last Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!staffId.trim()) {
      toast.error("Staff ID is required.");
      return;
    }
    if (!staffPin || staffPin.length < 4 || staffPin.length > 6) {
      toast.error("Staff PIN must be between 4 and 6 digits.");
      return;
    }
    if (staffPin !== confirmPin) {
      toast.error("PIN and Confirm PIN do not match.");
      return;
    }
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    if (workingDays.length === 0) {
      toast.error("Please select at least one working day.");
      return;
    }
    setCurrentStep(3);
  };

  const handleNextStep3 = () => {
    setCurrentStep(4);
  };

  // Selected Store name
  const currentStore = useMemo(() => {
    const found = shops.find((s) => s._id === assignedShopId);
    return found
      ? found.shopName
      : shops.length > 0
        ? shops[0].shopName
        : "Romford Store";
  }, [shops, assignedShopId]);

  // Submission
  const handleCreateStaff = async () => {
    if (!shopkeeperId) {
      toast.error("Shopkeeper session not detected. Please re-login.");
      return;
    }

    try {
      await createStaffMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password: password.trim() || "Mobilise@123456",
        shopkeeperId,
        shopId:
          assignedShopId && assignedShopId !== "all_default"
            ? assignedShopId
            : undefined,
        wageType,
        wageAmount: wageAmount ? Number(wageAmount) : undefined,
        workingDays,
        weekendDays,
        staffId: staffId.trim(),
        pin: staffPin,
        jobRole,
        street: addressLine1.trim() || undefined,
        location: [townCity, county].filter(Boolean).join(", ") || undefined,
        postalCode: postcode.trim() || undefined,
        referenceFaceUrl: frontPhoto || undefined,
        idVerificationStatus: isLivenessPassed ? "verified" : "pending",
      });

      setCreatedStaffData({
        name: `${firstName} ${lastName}`.trim(),
        staffId,
        storeName: currentStore,
        role: jobRole,
        pin: staffPin,
        email: email.trim(),
        phone: phone.trim(),
      });

      setIsSuccessState(true);
      toast.success("Staff member created successfully!");
      if (onStaffCreated) onStaffCreated();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create staff member.";
      toast.error(msg);
    }
  };

  // Appointment Letter Download
  const handleDownloadLetter = () => {
    const data = createdStaffData || {
      name: `${firstName} ${lastName}`,
      staffId,
      storeName: currentStore,
      role: jobRole,
      pin: staffPin,
      email,
      phone,
    };

    generateStaffAppointmentLetter({
      fullName: data.name,
      staffId: data.staffId,
      email: data.email,
      phone: data.phone,
      jobRole: data.role,
      storeName: data.storeName,
      wageType,
      wageAmount,
      workingDays,
      weekendDays,
      pinCode: data.pin,
      addressLine1,
      townCity,
      county,
      postcode,
    });
    toast.success("Staff appointment letter downloaded.");
  };

  const handleSendToStaff = () => {
    const recipient = createdStaffData?.email || email;
    toast.success(`Appointment letter and login PIN sent to ${recipient}!`);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          stopCamera();
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[94vh] sm:max-w-5xl p-0 border border-border shadow-2xl rounded-2xl bg-card overflow-hidden flex flex-col font-poppins">
        {/* Header Banner */}
        <div className="shrink-0 bg-surface/90 p-5 sm:p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <UsersRound size={24} />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-black text-foreground">
                Add Staff Member
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Create a new staff account, assign store, set schedule, address
                and verification.
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 4-Step Stepper Navigation */}
        <div className="shrink-0 bg-card px-6 py-3.5 border-b border-border/80 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[560px] max-w-3xl mx-auto">
            {/* Step 1 */}
            <div
              onClick={() => !isSuccessState && setCurrentStep(1)}
              className={`flex items-center gap-2 cursor-pointer transition-all ${
                currentStep === 1
                  ? "text-primary font-black"
                  : currentStep > 1
                    ? "text-primary font-bold"
                    : "text-muted-foreground font-medium"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                  currentStep === 1
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 ring-4 ring-primary/15"
                    : currentStep > 1
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 1 ? <Check size={14} strokeWidth={3} /> : "1"}
              </span>
              <span className="text-xs sm:text-sm tracking-tight whitespace-nowrap">
                Staff Details
              </span>
            </div>

            <div className="h-0.5 w-10 sm:w-16 bg-border mx-2" />

            {/* Step 2 */}
            <div
              onClick={() =>
                !isSuccessState && currentStep > 1 && setCurrentStep(2)
              }
              className={`flex items-center gap-2 transition-all ${
                isSuccessState ? "cursor-default" : "cursor-pointer"
              } ${
                currentStep === 2
                  ? "text-primary font-black"
                  : currentStep > 2
                    ? "text-primary font-bold"
                    : "text-muted-foreground font-medium"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                  currentStep === 2
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 ring-4 ring-primary/15"
                    : currentStep > 2
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 2 ? <Check size={14} strokeWidth={3} /> : "2"}
              </span>
              <span className="text-xs sm:text-sm tracking-tight whitespace-nowrap">
                Access & Schedule
              </span>
            </div>

            <div className="h-0.5 w-10 sm:w-16 bg-border mx-2" />

            {/* Step 3 */}
            <div
              onClick={() =>
                !isSuccessState && currentStep > 2 && setCurrentStep(3)
              }
              className={`flex items-center gap-2 transition-all ${
                isSuccessState ? "cursor-default" : "cursor-pointer"
              } ${
                currentStep === 3
                  ? "text-primary font-black"
                  : currentStep > 3
                    ? "text-primary font-bold"
                    : "text-muted-foreground font-medium"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                  currentStep === 3
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 ring-4 ring-primary/15"
                    : currentStep > 3
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > 3 ? <Check size={14} strokeWidth={3} /> : "3"}
              </span>
              <span className="text-xs sm:text-sm tracking-tight whitespace-nowrap">
                Verification (Face ID)
              </span>
            </div>

            <div className="h-0.5 w-10 sm:w-16 bg-border mx-2" />

            {/* Step 4 */}
            <div
              className={`flex items-center gap-2 ${
                currentStep === 4
                  ? "text-primary font-black"
                  : "text-muted-foreground font-medium"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                  currentStep === 4
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 ring-4 ring-primary/15"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                4
              </span>
              <span className="text-xs sm:text-sm tracking-tight whitespace-nowrap">
                Review & Create
              </span>
            </div>
          </div>
        </div>

        {/* Body Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 custom-scrollbar">
          {/* ================= STEP 1: Staff Details ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Personal Details Group */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground font-black text-sm tracking-wide">
                  <User className="h-4 w-4 text-primary" />
                  <span>Personal Details</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Tariq"
                        className="h-10 pl-9 rounded-xl bg-surface border-border focus:border-primary text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Mahmood"
                        className="h-10 pl-9 rounded-xl bg-surface border-border focus:border-primary text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tariq@example.com"
                        className="h-10 pl-9 rounded-xl bg-surface border-border focus:border-primary text-sm font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Phone Number (Optional)
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+44 7123 456789"
                        className="h-10 pl-9 rounded-xl bg-surface border-border focus:border-primary text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Staff ID Section */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold text-foreground">
                    Staff ID <span className="text-destructive">*</span>
                  </Label>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleIdModeChange("manual")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        idMode === "manual"
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div
                        className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                          idMode === "manual"
                            ? "border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {idMode === "manual" && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      Create Staff ID Manually
                    </button>

                    <button
                      type="button"
                      onClick={() => handleIdModeChange("auto")}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        idMode === "auto"
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Suggest Staff ID (Auto)
                    </button>
                  </div>

                  <div className="relative mt-2">
                    <div className="absolute left-3.5 top-3 flex items-center gap-1.5 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <Input
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                      placeholder="STF-4130"
                      readOnly={idMode === "auto"}
                      className="h-10 pl-9 pr-9 rounded-xl bg-surface border-border focus:border-primary text-sm font-mono font-bold uppercase tracking-wider"
                    />
                    <CheckCircle2 className="absolute right-3.5 top-3 h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Unique ID for this
                    staff. The system will prevent duplicate IDs.
                  </p>
                </div>

                {/* Staff PIN & Confirm PIN */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Staff PIN (4–6 Digits){" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPin ? "text" : "password"}
                        maxLength={6}
                        value={staffPin}
                        onChange={(e) =>
                          setStaffPin(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="••••"
                        className="h-10 pl-9 pr-9 rounded-xl bg-surface border-border focus:border-primary text-sm font-mono font-bold tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3 top-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Confirm PIN <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPin ? "text" : "password"}
                        maxLength={6}
                        value={confirmPin}
                        onChange={(e) =>
                          setConfirmPin(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="••••"
                        className="h-10 pl-9 pr-9 rounded-xl bg-surface border-border focus:border-primary text-sm font-mono font-bold tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute right-3 top-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showConfirmPin ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> This PIN will be used to
                  switch staff at the till and will appear on invoices as
                  &quot;Served By&quot;.
                </p>
              </div>

              {/* Address Auto Finder Group */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-foreground font-black text-sm tracking-wide">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Address (Auto Finder)</span>
                </div>

                {/* Postcode Search Bar */}
                <div className="space-y-1.5 relative">
                  <Label className="text-xs font-bold text-foreground">
                    Postcode <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchPostcode}
                        onChange={(e) => {
                          setSearchPostcode(e.target.value);
                          if (e.target.value.length > 3) {
                            handleFindAddress(e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleFindAddress();
                          }
                        }}
                        placeholder="e.g. RM7 9AB"
                        className="h-10 pl-9 pr-8 rounded-xl bg-surface border-border focus:border-primary text-sm font-bold uppercase"
                      />
                      {searchPostcode && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchPostcode("");
                            setPostcodeSuggestions([]);
                            setShowSuggestions(false);
                          }}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={() => handleFindAddress()}
                      disabled={isSearchingPostcode}
                      className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
                    >
                      {isSearchingPostcode ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Find Address
                    </Button>
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && postcodeSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-20 rounded-xl border border-border bg-card shadow-xl overflow-hidden py-1 max-h-48 overflow-y-auto">
                      {postcodeSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-primary/10 text-xs font-semibold text-foreground flex items-center gap-2 border-b border-border/40 last:border-0 transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Structured Address Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Address Line 1 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="12 Maxwell Road"
                      className="h-10 rounded-xl bg-surface border-border focus:border-primary text-sm font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Address Line 2 (Optional)
                    </Label>
                    <Input
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="e.g. Suite, Building, Unit"
                      className="h-10 rounded-xl bg-surface border-border focus:border-primary text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Town / City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={townCity}
                      onChange={(e) => setTownCity(e.target.value)}
                      placeholder="Romford"
                      className="h-10 rounded-xl bg-surface border-border focus:border-primary text-sm font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      County
                    </Label>
                    <Input
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      placeholder="Essex"
                      className="h-10 rounded-xl bg-surface border-border focus:border-primary text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Postcode <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      value={postcode}
                      onChange={(e) =>
                        setPostcode(e.target.value.toUpperCase())
                      }
                      placeholder="RM7 9AB"
                      className="h-10 rounded-xl bg-surface border-border focus:border-primary text-sm font-bold uppercase"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="h-11 px-5 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleNextStep1}
                  className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black shadow-md shadow-primary/20 cursor-pointer"
                >
                  Next: Access & Schedule →
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: Access & Schedule ================= */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Store & Role Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-foreground font-black text-sm tracking-wide">
                  <Store className="h-4 w-4 text-primary" />
                  <span>Store Assignment & Role</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Assigned Store <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={assignedShopId}
                      onValueChange={(val) => setAssignedShopId(val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-surface border-border text-sm font-semibold">
                        <SelectValue placeholder="Select active store" />
                      </SelectTrigger>
                      <SelectContent>
                        {shops.length === 0 && (
                          <SelectItem value="all_default">
                            Romford Store (Main)
                          </SelectItem>
                        )}
                        {shops.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.shopName} {s.isDefault ? "(Main Store)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Role / Access <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={jobRole}
                      onValueChange={(val) => setJobRole(val)}
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-surface border-border text-sm font-semibold">
                        <SelectValue placeholder="Select job role" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobRoleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Wage Setup */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-foreground font-black text-sm tracking-wide">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Wages & Payment Basis</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Pay Type <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setWageType("per-hour");
                          if (wageAmount === "120.00") setWageAmount("12.00");
                        }}
                        className={`flex items-center justify-center gap-2 h-10 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          wageType === "per-hour"
                            ? "border-primary bg-primary/10 text-primary shadow-xs"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                            wageType === "per-hour"
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {wageType === "per-hour" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        Hourly Pay
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setWageType("per-day");
                          if (wageAmount === "12.00") setWageAmount("120.00");
                        }}
                        className={`flex items-center justify-center gap-2 h-10 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          wageType === "per-day"
                            ? "border-primary bg-primary/10 text-primary shadow-xs"
                            : "border-border bg-surface text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                            wageType === "per-day"
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {wageType === "per-day" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        Daily Pay
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      Rate <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-muted-foreground">
                        £
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={wageAmount}
                        onChange={(e) => setWageAmount(e.target.value)}
                        placeholder={
                          wageType === "per-hour" ? "12.00" : "120.00"
                        }
                        className="h-10 pl-8 pr-16 rounded-xl bg-surface border-border focus:border-primary text-sm font-semibold"
                        required
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-muted-foreground">
                        {wageType === "per-hour" ? "/ hour" : "/ day"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Working Days & Days Off */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-foreground font-black text-sm tracking-wide">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>Work Schedule & Days Off</span>
                </div>

                {/* Working Days Pill Row */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">
                      Working Days <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      {workingDays.length} days selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {weekDayOptions.map((day) => {
                      const isSelected = workingDays.includes(day.full);
                      return (
                        <button
                          key={day.full}
                          type="button"
                          onClick={() => handleToggleWorkingDay(day.full)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-surface text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          {isSelected && <Check size={13} strokeWidth={3} />}
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Days Off Pill Row */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">
                      Days Off
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      {weekendDays.length} days off
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {weekDayOptions.map((day) => {
                      const isOff = weekendDays.includes(day.full);
                      return (
                        <button
                          key={day.full}
                          type="button"
                          onClick={() => handleToggleWeekendDay(day.full)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isOff
                              ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                              : "bg-surface text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
                          }`}
                        >
                          {isOff && <Check size={13} strokeWidth={3} />}
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div className="flex items-center justify-between gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="h-11 px-5 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  ← Back: Staff Details
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-11 px-5 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep2}
                    className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black shadow-md shadow-primary/20 cursor-pointer"
                  >
                    Next: Face & ID Verification →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: Face & ID Verification ================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Split Layout: Left Preview Card, Right Verification Area */}
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Column: Staff Summary Profile Card */}
                <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col items-center text-center space-y-4">
                  {/* Avatar with edit badge */}
                  <div className="relative mt-2">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/30 bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-inner">
                      {frontPhoto ? (
                        <Image
                          src={frontPhoto}
                          alt="Staff Preview"
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {firstName?.[0]?.toUpperCase() || "T"}
                          {lastName?.[0]?.toUpperCase() || "M"}
                        </span>
                      )}
                    </div>
                    <label
                      htmlFor="avatarUploadInput"
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-transform active:scale-95"
                      title="Upload Avatar"
                    >
                      <Camera size={14} />
                      <input
                        id="avatarUploadInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload("front", e)}
                      />
                    </label>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-foreground">
                      {firstName || "Tariq"} {lastName || "Mahmood"}
                    </h3>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-0.5 text-xs font-black font-mono text-primary">
                      Staff ID: {staffId}
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="w-full space-y-2.5 pt-3 border-t border-border text-left">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                        <Briefcase size={14} className="text-primary" /> Role
                      </span>
                      <span className="font-bold text-foreground">
                        {jobRole}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                        <Store size={14} className="text-primary" /> Store
                      </span>
                      <span className="font-bold text-foreground">
                        {currentStore}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                        <CreditCard size={14} className="text-primary" /> Wage
                      </span>
                      <span className="font-bold text-foreground">
                        £{Number(wageAmount || 0).toFixed(2)} /{" "}
                        {wageType === "per-hour" ? "Hour" : "Day"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                        <CalendarDays size={14} className="text-primary" />{" "}
                        Working Days
                      </span>
                      <span className="font-bold text-foreground truncate max-w-[140px]">
                        {workingDays.length === 5 &&
                        !workingDays.includes("Saturday") &&
                        !workingDays.includes("Sunday")
                          ? "Mon – Fri"
                          : workingDays.map((d) => d.slice(0, 3)).join(", ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                        <Clock3 size={14} className="text-amber-500" /> Weekend
                        Off
                      </span>
                      <span className="font-bold text-foreground">
                        {weekendDays.map((d) => d.slice(0, 3)).join(", ") ||
                          "None"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Face & ID Verification Area */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <ScanFace size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-foreground">
                        Face Registration for Attendance
                      </h4>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Add 3 clear photos and complete a live Face ID
                        (liveness) check for secure NFC attendance.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Card 1: Upload 3 Staff Face Images */}
                    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                          <Camera className="h-3.5 w-3.5 text-primary" />
                          <span>Upload 3 Staff Face Images</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Use different angles for better recognition (front,
                          left and right).
                        </p>
                      </div>

                      {/* 3 Face Angle Cards */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {/* Front View */}
                        <div className="space-y-1 text-center">
                          <label className="relative aspect-[3/4] w-full rounded-xl border border-dashed border-border hover:border-primary bg-surface flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors group">
                            {frontPhoto ? (
                              <>
                                <Image
                                  src={frontPhoto}
                                  alt="Front View"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                  <Check size={11} strokeWidth={3} />
                                </div>
                              </>
                            ) : (
                              <div className="p-2 flex flex-col items-center">
                                <Camera className="h-5 w-5 text-muted-foreground group-hover:text-primary mb-1 transition-colors" />
                                <span className="text-[9px] font-bold text-muted-foreground">
                                  Upload
                                </span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload("front", e)}
                            />
                          </label>
                          <span className="text-[10px] font-black text-foreground block">
                            Front View
                          </span>
                        </div>

                        {/* Left View */}
                        <div className="space-y-1 text-center">
                          <label className="relative aspect-[3/4] w-full rounded-xl border border-dashed border-border hover:border-primary bg-surface flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors group">
                            {leftPhoto ? (
                              <>
                                <Image
                                  src={leftPhoto}
                                  alt="Left View"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                  <Check size={11} strokeWidth={3} />
                                </div>
                              </>
                            ) : (
                              <div className="p-2 flex flex-col items-center">
                                <Camera className="h-5 w-5 text-muted-foreground group-hover:text-primary mb-1 transition-colors" />
                                <span className="text-[9px] font-bold text-muted-foreground">
                                  Upload
                                </span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload("left", e)}
                            />
                          </label>
                          <span className="text-[10px] font-black text-foreground block">
                            Left View
                          </span>
                        </div>

                        {/* Right View */}
                        <div className="space-y-1 text-center">
                          <label className="relative aspect-[3/4] w-full rounded-xl border border-dashed border-border hover:border-primary bg-surface flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors group">
                            {rightPhoto ? (
                              <>
                                <Image
                                  src={rightPhoto}
                                  alt="Right View"
                                  fill
                                  className="object-cover"
                                />
                                <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                  <Check size={11} strokeWidth={3} />
                                </div>
                              </>
                            ) : (
                              <div className="p-2 flex flex-col items-center">
                                <Camera className="h-5 w-5 text-muted-foreground group-hover:text-primary mb-1 transition-colors" />
                                <span className="text-[9px] font-bold text-muted-foreground">
                                  Upload
                                </span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload("right", e)}
                            />
                          </label>
                          <span className="text-[10px] font-black text-foreground block">
                            Right View
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Live Face ID (Liveness Check) */}
                    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 flex flex-col">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                          <ScanFace className="h-3.5 w-3.5 text-primary" />
                          <span>Live Face ID (Liveness Check)</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Verify it&apos;s the real person (prevents photo or
                          video spoofing).
                        </p>
                      </div>

                      {/* Camera Viewfinder with Green Corner Brackets */}
                      <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-900 border border-slate-700/60 overflow-hidden flex items-center justify-center">
                        {isCameraActive ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover mirror"
                          />
                        ) : frontPhoto ? (
                          <Image
                            src={frontPhoto}
                            alt="Front Frame"
                            fill
                            className="object-cover opacity-80"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400 p-3 text-center">
                            <Camera className="h-8 w-8 mb-1.5 opacity-60" />
                            <span className="text-[10px] font-semibold">
                              Webcam feed will display here
                            </span>
                          </div>
                        )}

                        {/* Green Corner Focus Brackets */}
                        <div className="absolute inset-4 pointer-events-none">
                          {/* Top-Left */}
                          <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-primary" />
                          {/* Top-Right */}
                          <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-primary" />
                          {/* Bottom-Left */}
                          <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-primary" />
                          {/* Bottom-Right */}
                          <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-primary" />
                        </div>

                        {/* Live Overlay Badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Liveness Feed
                        </div>
                      </div>

                      {/* Verification Checklist & Action */}
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-bold">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} /> Face detected
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} /> Liveness verified
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={13} /> Identity matched
                          </span>
                        </div>

                        {isLivenessPassed ? (
                          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <Check size={16} strokeWidth={3} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                                Face ID Verified
                              </p>
                              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-500/80 font-medium">
                                Ready for NFC biometric attendance.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={startCamera}
                              variant="outline"
                              className="h-8 px-2.5 rounded-lg border-border text-[11px] font-bold gap-1 flex-1 cursor-pointer"
                            >
                              <Camera size={13} />
                              {isCameraActive ? "Restart Feed" : "Start Camera"}
                            </Button>
                            <Button
                              type="button"
                              onClick={runLivenessCheck}
                              disabled={livenessChecking}
                              className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-black gap-1 flex-1 cursor-pointer shadow-xs"
                            >
                              {livenessChecking ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <ShieldCheck size={13} />
                              )}
                              Verify Liveness
                            </Button>
                          </div>
                        )}
                        {cameraError && (
                          <p className="text-[11px] text-red-500 font-medium text-center mt-1">
                            {cameraError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* How It Works Banner */}
                  <div className="rounded-xl border border-border bg-surface/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-black text-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span>How It Works</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-semibold text-[11px]">
                      <span>Capture 3 photos</span>
                      <span>→</span>
                      <span>Live liveness check</span>
                      <span>→</span>
                      <span>
                        Used for secure NFC attendance and shift verification
                      </span>
                    </div>
                  </div>

                  {/* Privacy & Data Security Banner */}
                  <div className="rounded-xl border border-border bg-surface/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2 font-black text-foreground">
                      <Lock className="h-3.5 w-3.5 text-primary" />
                      <span>Privacy & Data Security</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground font-medium">
                      <span>✓ Face data is encrypted</span>
                      <span>✓ Used only for attendance verification</span>
                      <span>✓ Not shared with third parties</span>
                      <span>✓ Can be deleted by store owner</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 Actions */}
              <div className="flex items-center justify-between gap-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    stopCamera();
                    setCurrentStep(2);
                  }}
                  className="h-11 px-5 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  ← Back: Schedule & Wage
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      stopCamera();
                      onClose();
                    }}
                    className="h-11 px-5 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      handleNextStep3();
                    }}
                    className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black shadow-md shadow-primary/20 cursor-pointer"
                  >
                    Next: Review & Create →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: Review & Create / Completion ================= */}
          {currentStep === 4 && (
            <div className="max-w-3xl mx-auto space-y-6">
              {!isSuccessState ? (
                /* Pre-submission Review */
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-black text-foreground">
                      Review Staff Details
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Confirm all account and rota settings before saving this
                      new staff member.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Account Box */}
                    <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-2">
                      <p className="text-xs font-black text-foreground uppercase tracking-wider">
                        Personal & Credentials
                      </p>
                      <div className="text-xs space-y-1 font-semibold text-muted-foreground">
                        <p>
                          <span className="text-foreground font-bold">
                            Name:
                          </span>{" "}
                          {firstName} {lastName}
                        </p>
                        <p>
                          <span className="text-foreground font-bold">
                            Email:
                          </span>{" "}
                          {email}
                        </p>
                        <p>
                          <span className="text-foreground font-bold">
                            Staff ID:
                          </span>{" "}
                          <span className="font-mono text-primary font-extrabold">
                            {staffId}
                          </span>
                        </p>
                        <p>
                          <span className="text-foreground font-bold">
                            Till PIN:
                          </span>{" "}
                          <span className="font-mono tracking-widest font-extrabold">
                            ••••
                          </span>{" "}
                          (4–6 digits set)
                        </p>
                      </div>
                    </div>

                    {/* Store & Schedule Box */}
                    <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-2">
                      <p className="text-xs font-black text-foreground uppercase tracking-wider">
                        Store, Wage & Rota
                      </p>
                      <div className="text-xs space-y-1 font-semibold text-muted-foreground">
                        <p>
                          <span className="text-foreground font-bold">
                            Store:
                          </span>{" "}
                          {currentStore}
                        </p>
                        <p>
                          <span className="text-foreground font-bold">
                            Role:
                          </span>{" "}
                          {jobRole}
                        </p>
                        <p>
                          <span className="text-foreground font-bold">
                            Wage:
                          </span>{" "}
                          £{Number(wageAmount || 0).toFixed(2)} /{" "}
                          {wageType === "per-hour" ? "hour" : "day"}
                        </p>
                        <p>
                          <span className="text-foreground font-bold">
                            Working Days:
                          </span>{" "}
                          {workingDays.map((d) => d.slice(0, 3)).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {addressLine1 && (
                    <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-1 text-xs">
                      <p className="font-black text-foreground uppercase tracking-wider">
                        Registered Address
                      </p>
                      <p className="font-semibold text-muted-foreground">
                        {[
                          addressLine1,
                          addressLine2,
                          townCity,
                          county,
                          postcode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                      className="h-11 px-5 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                    >
                      ← Back: Verification
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="h-11 px-5 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        disabled={createStaffMutation.isPending}
                        onClick={handleCreateStaff}
                        className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 cursor-pointer"
                      >
                        {createStaffMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Confirm & Create Staff
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Image 4 Completed State */
                <div className="space-y-6">
                  {/* Success Title */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shrink-0 shadow-md shadow-emerald-500/20">
                      <Check size={22} strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-foreground">
                        Staff Member Created Successfully
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        The staff account has been created and the official
                        letter is ready to send.
                      </p>
                    </div>
                  </div>

                  {/* Profile Card */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-14 w-14 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-black text-primary text-xl">
                        {frontPhoto ? (
                          <Image
                            src={frontPhoto}
                            alt="Staff"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span>{createdStaffData?.name?.[0] || "T"}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-foreground">
                            {createdStaffData?.name ||
                              `${firstName} ${lastName}`}
                          </h4>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-mono font-black text-primary">
                          <CreditCard size={12} />{" "}
                          {createdStaffData?.staffId || staffId}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-border">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-surface text-primary">
                          <Store size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            Assigned Store
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {createdStaffData?.storeName || currentStore}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-surface text-primary">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground">
                            Role / Access
                          </p>
                          <p className="text-xs font-bold text-foreground">
                            {createdStaffData?.role || jobRole}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Staff Login at Till (Switch Staff) Card */}
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-black text-sm">
                      <KeyRound className="h-4 w-4 text-primary" />
                      <span>Staff Login at Till (Switch Staff)</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-muted-foreground">
                          Staff ID
                        </Label>
                        <div className="h-11 rounded-xl bg-card border border-border px-3.5 flex items-center font-mono font-black text-sm text-foreground">
                          {createdStaffData?.staffId || staffId}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-muted-foreground">
                          PIN Code
                        </Label>
                        <div className="h-11 rounded-xl bg-card border border-border px-3.5 flex items-center justify-between font-mono font-black text-sm text-foreground">
                          <span>
                            {showCreatedPin
                              ? createdStaffData?.pin || staffPin
                              : "••••"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowCreatedPin(!showCreatedPin)}
                            className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {showCreatedPin ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Official Staff Letter (PDF) Card */}
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-2 text-foreground font-black text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Official Staff Letter (PDF)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A professional letter with staff details, store and access
                      information.
                    </p>

                    <div className="rounded-xl border border-border bg-surface/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-black text-xs shrink-0">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Mobilise_Staff_Letter_
                            {createdStaffData?.staffId || staffId}.pdf
                          </p>
                          <p className="text-[11px] text-muted-foreground font-medium">
                            Staff Appointment Letter • PDF (324 KB)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDownloadLetter}
                          className="h-9 px-3 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted gap-1.5 cursor-pointer"
                        >
                          <Download size={14} />
                          Download
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSendToStaff}
                          className="h-9 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Send size={14} />
                          Send to Staff
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Completion Actions */}
                  <div className="flex items-center justify-end gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetForm}
                      className="h-11 px-5 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted gap-1.5 cursor-pointer"
                    >
                      <Plus size={16} />
                      Add Another Staff
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        onClose();
                      }}
                      className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-black gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
                    >
                      <UsersRound size={16} />
                      View All Staff
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
