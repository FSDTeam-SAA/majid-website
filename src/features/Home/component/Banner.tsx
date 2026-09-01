"use client";
import {
  Search,
  ChevronDown,
  QrCode,
  Info,
  Check,
  Star,
  SatelliteDish,
  ShieldHalf,
  Globe,
  Cloudy,
  LockKeyhole,
  CheckCircle2,
  ArrowRight,
  SearchCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useId,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Archivo_Black } from "next/font/google";
import { getServicesApi } from "@/features/shopkeeper/scanDevice/api/scanDevice.api";
import {
  IMEIService,
  ServiceCategory,
} from "@/features/shopkeeper/scanDevice/types/scanDevice.types";
import { ScannerModal } from "@/components/shared/website/ScannerModal";
import { GuestLoginModal } from "@/components/shared/website/GuestLoginModal";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
});

/**
 * ACCESSIBILITY / WCAG CHANGES MADE IN THIS FILE
 * ------------------------------------------------
 * (Previous accessibility notes preserved — see top of original file.)
 *
 * UX CHANGES IN THIS REVISION
 * ---------------------------
 * 1. "Free Check" / submit button moved *inside* the search bar, to the
 *    right of the service dropdown — eliminates the disconnected CTA below
 *    the bar and creates a single, cohesive action row:
 *    [IMEI input] → [Service selector] → [Check]
 *
 * 2. Visual hierarchy: service dropdown restyled as a subtle outlined chip
 *    so the primary-coloured Check button is clearly the main CTA.
 *
 * 3. Disabled state on the Check button when IMEI is empty — prevents
 *    no-op clicks and gives a clear affordance that input is required.
 *
 * 4. Contextual glow on the Check button when IMEI is entered — subtle
 *    `shadow-primary/40` ring signals "ready to go".
 *
 * 5. Mobile layout: input row on top, then [Dropdown | Check] side-by-side
 *    below, separated by a thin divider for visual clarity.
 *
 * 6. Focus-within ring on the entire search bar — the outer bar lights up
 *    subtly when any child is focused, reinforcing the grouped component.
 *
 * 7. ArrowRight icon inside the Check button reinforces "proceed / go"
 *    affordance alongside the text label.
 */

export default function Banner() {
  const [imei, setImei] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [services, setServices] = useState<IMEIService[]>([]);
  const [selectedService, setSelectedService] = useState<IMEIService | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  const dropdownId = useId();
  const imeiLabelId = useId();
  const dropdownSearchId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServicesApi();
        if (response.success && response.data) {
          setServiceCategories(response.data);
          const allServices = response.data.flatMap((cat) => cat.services);
          setServices(allServices);

          if (status !== "authenticated") {
            const firstFree = allServices.find((svc) => svc.isFree);
            if (firstFree) {
              setSelectedService(firstFree);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, [status]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen]);

  const orderedCategories = useMemo(() => {
    let categories = serviceCategories;
    if (status !== "authenticated") {
      categories = serviceCategories
        .map((cat) => ({
          ...cat,
          services: cat.services.filter((svc) => svc.isFree),
        }))
        .filter((cat) => cat.services.length > 0);
    }

    const favouriteCategory = categories.find(
      (cat) => cat.category.toLowerCase() === "fevourite",
    );
    const otherCategories = categories.filter(
      (cat) => cat.category.toLowerCase() !== "fevourite",
    );

    const sortedOtherCategories = [...otherCategories].sort((a, b) =>
      a.category.localeCompare(b.category),
    );

    return favouriteCategory
      ? [favouriteCategory, ...sortedOtherCategories]
      : sortedOtherCategories;
  }, [serviceCategories, status]);

  const filteredCategories = useMemo(
    () =>
      orderedCategories
        .map((cat) => ({
          ...cat,
          services: cat.services.filter((svc) =>
            svc.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        }))
        .filter((cat) => cat.services.length > 0),
    [orderedCategories, searchTerm],
  );

  const totalFilteredCount = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.services.length, 0),
    [filteredCategories],
  );

  const handleScanClick = () => {
    setIsScannerOpen(true);
  };

  const normalizedIdentifiers = useMemo(
    () =>
      Array.from(
        new Set(
          imei
            .split(/[\n,;]+/)
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ),
    [imei],
  );

  const handleSearch = () => {
    if (normalizedIdentifiers.length === 0) return;

    // Keep one query parameter for backwards compatibility. The destination
    // page can split this value by new lines to process the identifiers in bulk.
    const bulkValue = normalizedIdentifiers.join("\n");

    if (status === "authenticated") {
      const serviceId = selectedService?.serviceId || 6;
      router.push(
        `/shopkeeper/scan-device?imei=${encodeURIComponent(bulkValue)}&serviceId=${serviceId}`,
      );
      return;
    }

    if (selectedService?.isFree) {
      router.push(
        `/shopkeeper/scan-device?imei=${encodeURIComponent(bulkValue)}&serviceId=${selectedService.serviceId}`,
      );
    } else {
      setShowLoginModal(true);
    }
  };

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen((prev) => !prev);
  }, []);

  const quickChecks = [
    { label: "FMI", keyword: "fmi", type: "specialized", icon: LockKeyhole },
    {
      label: "Carrier",
      keyword: "carrier",
      type: "specialized",
      icon: SatelliteDish,
    },
    { label: "MDM", keyword: "mdm", type: "specialized", icon: ShieldHalf },
    { label: "GSX", keyword: "gsx", type: "specialized", icon: Globe },
    {
      label: "Sold By Check",
      keyword: "sold by",
      type: "specialized",
      icon: Search,
    },
    {
      label: "iCloud On/Off",
      keyword: "icloud",
      type: "specialized",
      icon: Cloudy,
    },
  ];

  const heroBackgroundColumns = Array.from({ length: 20 });

  // Derive the CTA label once
  const ctaLabel =
    status !== "authenticated"
      ? "Free Check"
      : selectedService
        ? "Check Now"
        : "Free Checks";

  const isImeiEntered = normalizedIdentifiers.length > 0;
  const identifierCount = normalizedIdentifiers.length;

  return (
    <section
      id="banner"
      className="relative flex min-h-[720px] overflow-hidden lg:h-[1060px] lg:min-h-0"
    >
      {/* Background — purely decorative, hidden from assistive tech */}
      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute left-1/2 top-[42%] h-[320px] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[1] bg-[linear-gradient(90deg,rgba(183,255,72,0.96)_10%,rgba(138,226,116,0.82)_24%,rgba(102,200,194,0.56)_50%,rgba(62,146,255,0.84)_68%,rgba(31,105,235,0.96)_100%)] blur-[58px] md:h-[560px] md:w-[1120px] md:blur-[88px] lg:h-[720px] lg:w-[1280px] lg:blur-[108px]" />
        <div className="absolute left-1/2 top-[42%] h-[300px] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.05] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,rgba(231,255,236,0.44)_28%,rgba(199,234,255,0.2)_52%,rgba(255,255,255,0)_78%)] blur-[22px] dark:hidden md:h-[480px] md:w-[920px] md:blur-[34px] lg:h-[560px] lg:w-[1060px] lg:blur-[42px]" />
        <div className="absolute left-1/2 top-[42%] hidden h-[300px] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[.05] bg-[radial-gradient(ellipse_at_center,rgba(148,163,184,0.18)_0%,rgba(103,232,249,0.14)_26%,rgba(59,130,246,0.12)_48%,rgba(255,255,255,0)_78%)] blur-[24px] dark:block md:h-[480px] md:w-[920px] md:blur-[36px] lg:h-[560px] lg:w-[1060px] lg:blur-[44px]" />

        {/* Fixed Light Mode Glass Panel: Removed opacity, used bg-alpha, added webkit-mask */}
        <div className="absolute left-1/2 top-[42%] h-[340px] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.06] [mask-image:radial-gradient(ellipse_68%_60%_at_50%_50%,black_0%,black_58%,rgba(0,0,0,0.68)_74%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_68%_60%_at_50%_50%,black_0%,black_58%,rgba(0,0,0,0.68)_74%,transparent_100%)] backdrop-blur-[18px] dark:hidden md:h-[520px] md:w-[980px] lg:h-[610px] lg:w-[1160px]" />

        {/* Fixed Dark Mode Glass Panel: Replaced /0 with /[0.05], removed opacity, added webkit-mask */}
        <div className="absolute left-1/2 top-[42%] hidden h-[340px] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900/[0.5] [mask-image:radial-gradient(ellipse_68%_60%_at_50%_50%,black_0%,black_58%,rgba(0,0,0,0.68)_74%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_68%_60%_at_50%_50%,black_0%,black_58%,rgba(0,0,0,0.68)_74%,transparent_100%)] backdrop-blur-[18px] dark:block md:h-[520px] md:w-[980px] lg:h-[610px] lg:w-[1160px]" />

        <div className="absolute left-1/2 top-[42%] hidden h-[760px] w-[1540px] -translate-x-1/2 -translate-y-1/2 items-start opacity-[.5] [mask-image:radial-gradient(ellipse_63%_38%_at_50%_42%,black_0%,black_58%,rgba(0,0,0,0.65)_72%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_63%_38%_at_50%_42%,black_0%,black_58%,rgba(0,0,0,0.65)_72%,transparent_100%)] lg:flex">
          {heroBackgroundColumns.map((_, index) => (
            <div key={index} className="relative h-[1200px] w-24 shrink-0">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.14)_42%,rgba(255,255,255,0.04)_100%)] dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0%,rgba(148,163,184,0.08)_42%,rgba(255,255,255,0.02)_100%)]" />
              <div className="absolute inset-y-0 left-[1px] w-[94px] bg-white/10 blur-[0.5px] dark:bg-slate-200/5" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 opacity-[0.7] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.34),rgba(255,255,255,0)_32%)] dark:opacity-[0.22] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.16),rgba(255,255,255,0)_32%)]" />
        <div className="absolute inset-0 opacity-[0.7] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0)_22%,rgba(255,255,255,0.18)_54%,rgba(255,255,255,0.58)_76%,rgba(255,255,255,0.96)_100%)] dark:opacity-[0.18] dark:bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0)_22%,rgba(15,23,42,0.08)_54%,rgba(15,23,42,0.28)_76%,rgba(15,23,42,0.56)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[220px] bg-gradient-to-b from-background/0 via-background/75 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center px-4 pb-16 pt-24 text-center sm:px-6 md:pb-24 md:pt-44 lg:px-[200px] lg:pb-[120px] lg:pt-[180px]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`${archivoBlack.className} w-full max-w-[1100px] text-[32px] leading-[1.15] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl lg:text-[72px] lg:leading-[1.2]`}
        >
          <span className="hidden whitespace-nowrap lg:block">
            Verify Global <span className="text-[#BEFB6D]">IMEI</span>
          </span>
          <span className="hidden whitespace-nowrap lg:block">
            <span className="text-[#BEFB6D]">Intelligence</span>{" "}
            <span>in Real-Time</span>
          </span>
          <span className="block lg:hidden">
            Verify Global <span className="text-[#BEFB6D]">IMEI</span>
          </span>
          <span className="block text-[#BEFB6D] lg:hidden">Intelligence</span>
          <span className="block lg:hidden">in Real-Time</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 max-w-[760px] text-sm leading-6 text-black/50 dark:text-white/50 drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)] sm:text-lg lg:text-xl"
        >
          Advanced AI-powered diagnostics and blacklisting checks for secure{" "}
          <br className="hidden md:block" />
          device transactions and inventory management.
        </motion.p>

        {/* ───────────────────────────────────────────────────────────────
            SEARCH BAR — now includes the CTA inline
            ─────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mt-10 w-full max-w-[780px] pt-4 md:pt-6"
        >
          {/* Decorative Rings */}
          <div
            className="pointer-events-none absolute inset-x-[-8px] md:inset-x-[-16px] bottom-[-8px] md:bottom-[-16px] top-2 rounded-[32px] md:rounded-[200px] border border-white/30 md:border-2"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-[-16px] md:inset-x-[-32px] bottom-[-16px] md:bottom-[-32px] top-[-4px] md:top-[-8px] rounded-[40px] md:rounded-[216px] border border-white/10 md:border-2 hidden sm:block"
            aria-hidden="true"
          />

          {/* Main Search Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="
              relative z-10 flex min-h-[64px] md:min-h-[68px] items-center gap-2 md:gap-3
              rounded-[24px] md:rounded-full bg-background
              py-2 pl-4 pr-3 md:pl-6 md:pr-4
              shadow-[0_20px_40px_rgba(0,0,0,0.4)]
              max-md:flex-col max-md:p-3
              border border-border
              transition-all duration-300
              focus-within:border-primary/40
              focus-within:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_24px_rgba(132,204,22,0.12)]
            "
          >
            {/* ── Input Row ── */}
            <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3 w-full">
              <Search
                className="h-5 w-5 md:h-6 md:w-6 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />

              <label htmlFor={imeiLabelId} className="sr-only">
                Enter IMEI or Serial Number...
              </label>
              <textarea
                id={imeiLabelId}
                required
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                onKeyDown={(e) => {
                  // Enter creates a new line for another IMEI/serial.
                  // Ctrl/Cmd + Enter remains available as a keyboard shortcut
                  // for submitting the complete bulk list.
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder={`Enter IMEI or Serial Number...`}
                rows={2}
                className="min-w-0 flex-1 bg-transparent py-1.5 text-sm md:text-base font-medium text-foreground outline-none placeholder:text-muted-foreground resize-none overflow-y-auto custom-scrollbar leading-normal min-h-[44px] max-h-[120px] rounded-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              />

              {identifierCount > 0 && (
                <span
                  className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary"
                  aria-live="polite"
                >
                  {identifierCount}{" "}
                  {identifierCount === 1 ? "device" : "devices"}
                </span>
              )}

              <button
                type="button"
                onClick={handleScanClick}
                aria-label="Scan IMEI"
                title="Scan IMEI"
                className="flex h-10 w-10 md:h-11 md:w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all hover:bg-primary/10 hover:text-primary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <QrCode
                  className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:text-primary transition-colors"
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* ── Mobile divider ── */}
            <div
              className="w-full h-px bg-border/60 md:hidden"
              aria-hidden="true"
            />

            {/* ── Actions Row: Service Dropdown + CTA Button ── */}
            <div className="flex items-center gap-2 md:gap-2.5 shrink-0 w-full md:w-auto">
              {/* Service Dropdown */}
              <div className="relative flex-1 md:flex-initial">
                <button
                  ref={triggerRef}
                  type="button"
                  id={`${dropdownId}-trigger`}
                  onClick={toggleDropdown}
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-controls={`${dropdownId}-panel`}
                  className="
                    flex h-[46px] md:h-[50px] cursor-pointer items-center justify-center gap-1.5 md:gap-2
                    rounded-xl md:rounded-full
                    border border-border bg-muted/40
                    px-3 md:px-5
                    text-foreground shadow-sm
                    transition-all hover:bg-muted hover:border-primary/30
                    w-full md:w-auto
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  "
                >
                  <span className="whitespace-nowrap text-xs md:text-sm font-bold truncate max-w-[140px] md:max-w-[180px]">
                    {selectedService ? selectedService.name : "Choose Service"}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      ref={dropdownRef}
                      id={`${dropdownId}-panel`}
                      role="listbox"
                      aria-label="Available services"
                      aria-labelledby={`${dropdownId}-trigger`}
                      initial={{ opacity: 0, y: 12, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="
                        absolute left-0 md:left-auto md:right-0 top-full z-[100] mt-2
                        w-[min(450px,calc(100vw-32px))]
                        overflow-hidden rounded-[24px] md:rounded-[32px]
                        border border-border bg-card
                        shadow-[0_30px_70px_rgba(0,0,0,0.2)]
                        backdrop-blur-xl
                      "
                    >
                      {/* Search inside Dropdown */}
                      <div className="p-3 md:p-4 border-b border-border bg-muted/50">
                        <div className="relative">
                          <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <label htmlFor={dropdownSearchId} className="sr-only">
                            Search for a service
                          </label>
                          <input
                            id={dropdownSearchId}
                            type="search"
                            placeholder="Search for a service..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-xl md:rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition-all text-xs md:text-sm font-bold text-foreground"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Dropdown Items List */}
                      <div
                        className="max-h-[320px] md:max-h-[450px] overflow-y-auto custom-scrollbar p-2 md:p-3"
                        aria-live="polite"
                      >
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((cat) => {
                            const isFavourite =
                              cat.category.toLowerCase() === "fevourite";

                            return (
                              <div
                                key={cat.category}
                                className={`mb-4 last:mb-1 ${isFavourite ? "bg-amber-500/10 dark:bg-amber-400/10 rounded-2xl" : ""}`}
                              >
                                <h3 className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-2">
                                  <div
                                    className="h-px flex-1 bg-border"
                                    aria-hidden="true"
                                  />
                                  {isFavourite && (
                                    <Star
                                      size={12}
                                      className="text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400"
                                      aria-hidden="true"
                                    />
                                  )}
                                  <span
                                    className={
                                      isFavourite
                                        ? "text-amber-700 dark:text-amber-400"
                                        : ""
                                    }
                                  >
                                    {cat.category}
                                  </span>
                                  {isFavourite && (
                                    <span className="text-[8px] font-bold text-amber-900 dark:text-amber-100 bg-amber-300/70 dark:bg-amber-500/40 px-1.5 py-0.5 rounded-full">
                                      Featured
                                    </span>
                                  )}
                                  <div
                                    className="h-px flex-1 bg-border"
                                    aria-hidden="true"
                                  />
                                </h3>
                                <div className="space-y-1">
                                  {cat.services.map((svc) => {
                                    const isApple =
                                      cat.category
                                        .toLowerCase()
                                        .includes("apple") ||
                                      svc.name
                                        .toLowerCase()
                                        .includes("apple") ||
                                      svc.name.toLowerCase().includes("iphone");
                                    const isSamsung =
                                      cat.category
                                        .toLowerCase()
                                        .includes("samsung") ||
                                      svc.name
                                        .toLowerCase()
                                        .includes("samsung");
                                    const isSelected =
                                      selectedService?._id === svc._id;
                                    const isFavouriteService = isFavourite;

                                    return (
                                      <button
                                        type="button"
                                        key={svc._id}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => {
                                          setSelectedService(svc);
                                          setIsDropdownOpen(false);
                                          setSearchTerm("");
                                          triggerRef.current?.focus();
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-[16px] md:rounded-[20px] transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                          isSelected
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-lime-500/30"
                                            : isFavouriteService
                                              ? "hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30"
                                              : "hover:bg-muted border border-transparent hover:border-border"
                                        }`}
                                      >
                                        <div
                                          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                            isSelected
                                              ? "bg-white/20"
                                              : isFavouriteService
                                                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                                : isApple
                                                  ? "bg-muted text-muted-foreground"
                                                  : isSamsung
                                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                    : "bg-green-500/10 text-green-600 dark:text-green-400"
                                          }`}
                                          aria-hidden="true"
                                        >
                                          {isFavouriteService ? (
                                            <Star
                                              size={18}
                                              className="fill-amber-600 dark:fill-amber-400 md:w-[22px] md:h-[22px]"
                                            />
                                          ) : (
                                            <Info
                                              size={18}
                                              className="md:w-[22px] md:h-[22px]"
                                            />
                                          )}
                                        </div>
                                        <div className="flex flex-col items-start flex-1 min-w-0">
                                          <span
                                            className={`text-xs md:text-[14px] font-black truncate w-full text-left ${
                                              isSelected
                                                ? "text-white"
                                                : "text-foreground"
                                            }`}
                                          >
                                            {svc.name}
                                          </span>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span
                                              className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-white/80" : "text-muted-foreground"}`}
                                            >
                                              ID: {svc.serviceId || "N/A"}
                                            </span>
                                            <div
                                              className="w-1 h-1 rounded-full bg-current opacity-50"
                                              aria-hidden="true"
                                            />
                                            <span
                                              className={`text-xs font-black ${isSelected ? "text-white" : "text-primary"}`}
                                            >
                                              {svc.priceLabel}
                                            </span>
                                          </div>
                                        </div>
                                        {isSelected && (
                                          <motion.div
                                            layoutId="selected-check"
                                            className="shrink-0"
                                            aria-hidden="true"
                                          >
                                            <Check size={18} strokeWidth={4} />
                                          </motion.div>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center space-y-2">
                            <div
                              className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground"
                              aria-hidden="true"
                            >
                              <Search size={24} />
                            </div>
                            <p className="text-muted-foreground font-bold text-xs md:text-sm">
                              No services found for &quot;{searchTerm}&quot;
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-3 md:p-4 bg-muted border-t border-border flex items-center justify-between">
                        <span
                          className="text-[10px] md:text-[11px] font-bold text-muted-foreground uppercase tracking-widest"
                          aria-live="polite"
                        >
                          {searchTerm ? totalFilteredCount : services.length}{" "}
                          Services available
                        </span>
                        <button
                          type="button"
                          className="text-[10px] md:text-[11px] font-black text-primary uppercase tracking-widest hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                        >
                          View All
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── CTA / Check Button ── */}
              <button
                type="submit"
                disabled={!isImeiEntered}
                className={`
                  flex h-[46px] md:h-[50px] cursor-pointer items-center justify-center gap-1.5 md:gap-2 group 
                  rounded-xl md:rounded-full
                  bg-primary
                  px-4 md:px-6
                  text-primary-foreground
                  shadow-md
                  transition-all duration-200
                  hover:bg-primary/90
                  hover:shadow-lg
                  active:scale-[0.97]
                  disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background
                  ${isImeiEntered ? "shadow-[0_0_18px_rgba(132,204,22,0.35)]" : ""}
                `}
              >
                <span className="whitespace-nowrap text-xs md:text-sm font-extrabold">
                  {ctaLabel}
                </span>
                <ArrowRight
                  className="h-4 w-4 md:h-[18px] md:w-[18px] hidden group-hover:block shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </form>
        </motion.div>

        {/* ✨ MINIMALIST QUICK CHECKS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 w-full max-w-4xl flex flex-col items-center gap-3 sm:gap-4"
        >
          <span className="text-base  font-bold text-foreground/50">
            QUICK CHECKS:
          </span>
          <div className="flex w-full flex-wrap items-center justify-center gap-3 px-4">
            {quickChecks.map((tag, i) => {
              const Icon = tag.icon;

              return (
                <motion.button
                  key={i}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSearchTerm(tag.keyword);
                    setIsDropdownOpen(true);
                  }}
                  className="group flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card/20 hover:bg-card/80 px-4 py-2.5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-200" />

                  <span className="text-xs font-bold text-foreground/80 transition-colors duration-200">
                    {tag.label}
                  </span>

                  <SearchCheck
                    className="
                            h-4
                            w-0
                            overflow-hidden
                            opacity-0
                            scale-75
                            text-primary
                            transition-all
                            duration-200
                            ease-out
                            group-hover:w-4
                            group-hover:opacity-100
                            group-hover:scale-100
                          "
                  />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Guest info badge */}
        {status !== "authenticated" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            role="status"
            aria-live="polite"
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-white/10 border border-white/30 backdrop-blur-sm"
          >
            <CheckCircle2
              className="h-3.5 w-3.5 text-primary shrink-0"
              aria-hidden="true"
            />
            <span className="text-[11px] font-bold dark:text-white text-black/50">
              2 free reports available — no account needed
            </span>
          </motion.div>
        )}
      </div>

      {/* Login Modal */}
      <GuestLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={(imei) => setImei(imei)}
      />
    </section>
  );
}
