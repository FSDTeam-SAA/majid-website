"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useMyProfile,
  useRepairProblem,
} from "@/features/shopkeeper/settings/hooks/useSettings";
import {
  useCustomersByShopkeeper,
  useCreateCustomer,
} from "@/features/shopkeeper/inventory/hooks/useInventory";
import { Customer } from "@/features/shopkeeper/inventory/types";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Loader2,
  Plus,
  Search,
  Smartphone,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  useCreateRepairRequest,
  useRepairTechnicians,
  useCustomerRepairHistory,
} from "../hooks/useRepairRequest";
import { RepairRequest, Shopkeeper } from "../types/repair-request.types";

const ADD_NEW_TECHNICIAN = "__add_new_technician__";

const STANDARD_PROBLEMS = [
  "Charging port",
  "Screen damage",
  "Battery issue",
  "Camera issue",
  "Software issue",
  "Motherboard",
  "Other",
];

interface RepairRequestFormModalProps {
  shopkeeper: Shopkeeper | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "reassign";
  repairRequest?: RepairRequest;
  createCustomerOnSubmit?: boolean;
}

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
  const isReassignMode = mode === "reassign";

  const sessionUser = session?.user as
    { id?: string; shopkeeperId?: string; role?: string } | undefined;
  const shopkeeperId =
    sessionUser?.shopkeeperId || sessionUser?.id || user?._id || "";

  // Shopkeeper's customer list
  const { data: customersData } = useCustomersByShopkeeper(shopkeeperId);
  const customers: Customer[] = useMemo(
    () => customersData?.data || [],
    [customersData?.data],
  );

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCreateNewCustomer, setIsCreateNewCustomer] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Section 3: Device Selection
  const [deviceTab, setDeviceTab] = useState<"previous" | "different">(
    "previous",
  );
  const [deviceModel, setDeviceModel] = useState("");
  const [isDeviceRecognised, setIsDeviceRecognised] = useState(false);
  const [isDeviceDropdownOpen, setIsDeviceDropdownOpen] = useState(false);

  // Section 4: Issue Selection
  const [issueTab, setIssueTab] = useState<"previous" | "new">("previous");
  const [selectedProblem, setSelectedProblem] = useState("");
  const [problemSearch, setProblemSearch] = useState("");
  const [isProblemDropdownOpen, setIsProblemDropdownOpen] = useState(false);

  // Bottom row fields
  const [price, setPrice] = useState("");
  const [imeiNumber, setImeiNumber] = useState("");
  const [technicianSelection, setTechnicianSelection] = useState("");
  const [newTechnician, setNewTechnician] = useState("");
  const [problemDescription, setProblemDescription] = useState("");

  // Section 5: Auto-fill banner
  const [showAutoFillBanner, setShowAutoFillBanner] = useState(false);

  // Dropdown refs
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const deviceDropdownRef = useRef<HTMLDivElement>(null);
  const problemDropdownRef = useRef<HTMLDivElement>(null);

  // Settings & mutation hooks
  const { data: repairProblemData } = useRepairProblem(user?._id || "");
  const createRepairRequest = useCreateRepairRequest();
  const createCustomer = useCreateCustomer();
  const { data: techniciansData, isLoading: isTechniciansLoading } =
    useRepairTechnicians(isOpen);
  const technicians = techniciansData?.data || [];

  // Customer Repair History Hook
  const queryPhone = selectedCustomer?.phone || phone;
  const queryEmail = selectedCustomer?.email || email;
  const { data: customerHistoryResponse } = useCustomerRepairHistory(
    {
      phone: queryPhone,
      email: queryEmail,
    },
    isOpen && Boolean(queryPhone || queryEmail),
  );

  const customerHistory = customerHistoryResponse?.data;
  const previousRepairs = customerHistory?.repairs || [];
  const recognizedDevices = customerHistory?.devices || [];
  const recognizedIssues = customerHistory?.issues || [];
  const recognizedDevicesCount =
    customerHistory?.recognizedDevicesCount ?? recognizedDevices.length;

  // Handle click outside for all popovers
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(target)
      ) {
        setIsCustomerDropdownOpen(false);
      }
      if (
        deviceDropdownRef.current &&
        !deviceDropdownRef.current.contains(target)
      ) {
        setIsDeviceDropdownOpen(false);
      }
      if (
        problemDropdownRef.current &&
        !problemDropdownRef.current.contains(target)
      ) {
        setIsProblemDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered customer list for searchable dropdown
  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((c) => {
      const name = `${c.firstName} ${c.lastName || ""}`.toLowerCase();
      const phoneVal = (c.phone || "").toLowerCase();
      const emailVal = (c.email || "").toLowerCase();
      return (
        name.includes(term) ||
        phoneVal.includes(term) ||
        emailVal.includes(term)
      );
    });
  }, [customers, customerSearch]);

  // Duplicate customer warning check
  const duplicateCustomer = useMemo(() => {
    if (!isCreateNewCustomer || !customers.length) return null;
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanPhone && !cleanEmail) return null;

    return customers.find((c) => {
      const matchPhone = cleanPhone && c.phone && c.phone.trim() === cleanPhone;
      const matchEmail =
        cleanEmail && c.email && c.email.trim().toLowerCase() === cleanEmail;
      return matchPhone || matchEmail;
    });
  }, [isCreateNewCustomer, customers, phone, email]);

  // Handle selecting an existing customer
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCreateNewCustomer(false);
    setIsCustomerDropdownOpen(false);
    const full = `${customer.firstName} ${customer.lastName || ""}`.trim();
    setFullName(full);
    setEmail(customer.email || "");
    setPhone(customer.phone || "");
  };

  // When customer history loads, trigger smart auto-fill
  useEffect(() => {
    if (!isOpen || isReassignMode) return;

    if (customerHistory && customerHistory.repairs?.length > 0) {
      const mostRecent = customerHistory.mostRecentRepair;
      if (mostRecent) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowAutoFillBanner(true);
        setDeviceTab("previous");
        setDeviceModel(mostRecent.deviceModel || "");
        setIsDeviceRecognised(true);

        setIssueTab("previous");
        setSelectedProblem(mostRecent.description || "");
        setProblemSearch(mostRecent.description || "");
        setProblemDescription(mostRecent.description || "");
      }
    }
  }, [customerHistory, isOpen, isReassignMode]);

  // Clear auto-fill handler
  const handleClearAutoFill = () => {
    setShowAutoFillBanner(false);
    setDeviceTab("different");
    setDeviceModel("");
    setIsDeviceRecognised(false);
    setIssueTab("new");
    setSelectedProblem("");
    setProblemSearch("");
    setProblemDescription("");
    toast.info(
      "Auto-filled details cleared. You can now enter new device and problem details.",
    );
  };

  // Reset form on close or submit
  const resetForm = () => {
    setSelectedCustomer(null);
    setIsCreateNewCustomer(false);
    setCustomerSearch("");
    setFullName("");
    setEmail("");
    setPhone("");
    setDeviceTab("previous");
    setDeviceModel("");
    setIsDeviceRecognised(false);
    setIsDeviceDropdownOpen(false);
    setIssueTab("previous");
    setSelectedProblem("");
    setProblemSearch("");
    setIsProblemDropdownOpen(false);
    setProblemDescription("");
    setPrice("");
    setImeiNumber("");
    setTechnicianSelection("");
    setNewTechnician("");
    setShowAutoFillBanner(false);
  };

  // Available problem choices
  const problemSuggestions = useMemo(() => {
    const backendProblems = (repairProblemData?.data || [])
      .map((p) => p.description?.trim())
      .filter((d): d is string => Boolean(d));

    const list = [...STANDARD_PROBLEMS];
    backendProblems.forEach((bp) => {
      if (!list.includes(bp)) list.push(bp);
    });
    return list;
  }, [repairProblemData?.data]);

  const filteredProblemSuggestions = useMemo(() => {
    const searchVal = problemSearch.trim().toLowerCase();
    if (!searchVal) return problemSuggestions;
    return problemSuggestions.filter((p) =>
      p.toLowerCase().includes(searchVal),
    );
  }, [problemSearch, problemSuggestions]);

  // Submit Handler
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextDescription =
      problemDescription || selectedProblem || problemSearch;
    const isShopkeeperCreate = createCustomerOnSubmit && !isReassignMode;
    const technician =
      technicianSelection === ADD_NEW_TECHNICIAN
        ? newTechnician.trim()
        : technicianSelection;

    if (isShopkeeperCreate && !shopkeeperId) {
      toast.error("Shopkeeper session not found");
      return;
    }

    if (!deviceModel.trim()) {
      toast.error("Please provide or select a device model");
      return;
    }

    if (!nextDescription.trim()) {
      toast.error("Please provide a problem description");
      return;
    }

    try {
      await createRepairRequest.mutateAsync({
        firstName: isReassignMode ? repairRequest?.firstName || "" : fullName,
        email: isReassignMode ? repairRequest?.email || "" : email,
        phoneNumber: isReassignMode ? repairRequest?.phoneNumber || "" : phone,
        price: isReassignMode
          ? Number(repairRequest?.price || 0)
          : Number(price || 0),
        deviceModel: isReassignMode
          ? repairRequest?.deviceModel || ""
          : deviceModel,
        IMEINumber: isReassignMode ? repairRequest?.IMEINumber : imeiNumber,
        description: nextDescription,
        technician,
        status: isReassignMode ? "reassigned" : undefined,
      });
    } catch {
      return;
    }

    // Save new customer if entered manually
    if (isShopkeeperCreate && !selectedCustomer && isCreateNewCustomer) {
      const [fName, ...lastNameParts] = fullName.trim().split(/\s+/);
      try {
        await createCustomer.mutateAsync({
          firstName: fName || fullName,
          lastName: lastNameParts.join(" "),
          email,
          phone,
          address: "",
          shopkeeperId,
        });
      } catch (error) {
        const requestError = error as {
          response?: { data?: { message?: string } };
        };
        if (!requestError.response?.data?.message?.includes("already exists")) {
          toast.error(
            requestError.response?.data?.message ||
              "Repair request created, but customer profile could not be auto-saved",
          );
        }
      }
    }

    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="!max-w-[1000px] sm:!max-w-[1000px] w-[95vw] p-0 gap-0 overflow-hidden flex flex-col sm:rounded-[28px] border-border bg-card shadow-2xl max-h-[92vh]"
        showCloseButton={true}
      >
        {/* Header */}
        <div className="px-6 md:px-8 py-5 border-b border-border/70 bg-card shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {isReassignMode ? "Reassigned Repair Request" : "Repair Request"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium text-sm mt-0.5">
              {isReassignMode
                ? "Please provide the new repair issue and technician assignment."
                : "Please provide details about your device and the issue you're facing."}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1"
        >
          {isReassignMode ? (
            /* REASSIGN MODE */
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Select Problem
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={problemSearch}
                    onChange={(e) => {
                      setProblemSearch(e.target.value);
                      setIsProblemDropdownOpen(true);
                    }}
                    onFocus={() => setIsProblemDropdownOpen(true)}
                    className="w-full h-12 rounded-xl border border-border bg-background pl-11 pr-11 text-foreground font-medium outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10"
                    placeholder="Search or select a problem"
                  />
                  <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  {isProblemDropdownOpen && (
                    <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl">
                      {filteredProblemSuggestions.map((description) => (
                        <button
                          key={description}
                          type="button"
                          onClick={() => {
                            setSelectedProblem(description);
                            setProblemSearch(description);
                            setProblemDescription(description);
                            setIsProblemDropdownOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-[#16A34A]/10"
                        >
                          <Check
                            className={`h-4 w-4 text-[#16A34A] ${
                              description === problemDescription
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          <span>{description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Technician
                </label>
                <select
                  value={technicianSelection}
                  onChange={(e) => {
                    setTechnicianSelection(e.target.value);
                    if (e.target.value !== ADD_NEW_TECHNICIAN)
                      setNewTechnician("");
                  }}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none focus:border-[#16A34A]"
                >
                  <option value="">
                    {isTechniciansLoading
                      ? "Loading technicians..."
                      : "Select technician"}
                  </option>
                  {technicians.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                  <option value={ADD_NEW_TECHNICIAN}>
                    + Add new technician
                  </option>
                </select>
                {technicianSelection === ADD_NEW_TECHNICIAN && (
                  <input
                    value={newTechnician}
                    onChange={(e) => setNewTechnician(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none focus:border-[#16A34A] mt-2"
                    placeholder="Enter technician name"
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Problem Description
                </label>
                <input
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none focus:border-[#16A34A]"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full px-8 h-12 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRepairRequest.isPending}
                  className="rounded-full px-10 h-12 font-bold bg-[#16A34A] hover:bg-[#15803d] text-white shadow-lg shadow-[#16A34A]/25"
                >
                  {createRepairRequest.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Reassigned"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* CREATE REPAIR REQUEST MODE (Matches Client Mockup Exactly) */
            <>
              {/* TOP ROW: SECTION 1 (CUSTOMER) & SECTION 2 (CUSTOMER HISTORY FOUND) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                {/* SECTION 1: CUSTOMER */}
                <div className="flex flex-col justify-start">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-foreground uppercase tracking-wider">
                      Customer
                    </label>
                    {isCreateNewCustomer && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateNewCustomer(false);
                          setSelectedCustomer(null);
                          setFullName("");
                          setEmail("");
                          setPhone("");
                        }}
                        className="text-xs font-bold text-[#16A34A] hover:underline"
                      >
                        Search existing customer
                      </button>
                    )}
                  </div>

                  {!isCreateNewCustomer ? (
                    <div className="relative" ref={customerDropdownRef}>
                      {/* Searchable Dropdown Trigger */}
                      <button
                        type="button"
                        onClick={() =>
                          setIsCustomerDropdownOpen((prev) => !prev)
                        }
                        className={`w-full h-12 px-4 rounded-xl border text-left flex items-center justify-between transition-all bg-background ${
                          isCustomerDropdownOpen
                            ? "border-[#16A34A] ring-4 ring-[#16A34A]/10"
                            : "border-border hover:border-foreground/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                          {selectedCustomer ? (
                            <span className="font-bold text-foreground">
                              {selectedCustomer.firstName}{" "}
                              {selectedCustomer.lastName || ""}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-medium text-sm">
                              Search name, phone or email
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${
                            isCustomerDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Dropdown Popover */}
                      {isCustomerDropdownOpen && (
                        <div className="absolute z-[60] left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl p-2 max-h-80 overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95">
                          {/* Search Input */}
                          <div className="p-2 border-b border-border">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <input
                                autoFocus
                                value={customerSearch}
                                onChange={(e) =>
                                  setCustomerSearch(e.target.value)
                                }
                                placeholder="Search name, phone or email"
                                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground font-medium outline-none focus:border-[#16A34A]"
                              />
                            </div>
                          </div>

                          {/* Customer Results List */}
                          <div className="overflow-y-auto flex-1 py-1 divide-y divide-border/40">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map((c) => {
                                const isSelected =
                                  selectedCustomer?._id === c._id;
                                const repairsCount = c.repairCount || 0;
                                return (
                                  <button
                                    key={c._id}
                                    type="button"
                                    onClick={() => handleSelectCustomer(c)}
                                    className={`w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-[#16A34A]/10 transition-colors rounded-lg ${
                                      isSelected
                                        ? "bg-[#16A34A]/15 font-bold"
                                        : ""
                                    }`}
                                  >
                                    <div>
                                      <p className="font-bold text-sm text-foreground leading-tight">
                                        {c.firstName} {c.lastName || ""}
                                      </p>
                                      <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                        {c.phone ||
                                          c.email ||
                                          "No phone provided"}
                                      </p>
                                    </div>
                                    <span className="text-xs font-semibold text-muted-foreground shrink-0 ml-2">
                                      {repairsCount > 0
                                        ? `${repairsCount} previous ${
                                            repairsCount === 1
                                              ? "repair"
                                              : "repairs"
                                          }`
                                        : "New customer"}
                                    </span>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="py-6 text-center text-xs font-medium text-muted-foreground">
                                No customer found matching &ldquo;
                                {customerSearch}&rdquo;
                              </div>
                            )}
                          </div>

                          {/* Bottom Action: Create New Customer */}
                          <div className="pt-2 border-t border-border mt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreateNewCustomer(true);
                                setSelectedCustomer(null);
                                setIsCustomerDropdownOpen(false);
                                setFullName(customerSearch);
                              }}
                              className="w-full py-2.5 px-3 rounded-lg text-xs font-black tracking-wider uppercase text-[#16A34A] hover:bg-[#16A34A]/10 flex items-center justify-center gap-2 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              Create New Customer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual Entry: New Customer Inputs */
                    <div className="space-y-3 bg-muted/20 border border-border p-4 rounded-2xl">
                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground uppercase">
                          Full Name *
                        </label>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          placeholder="e.g. Kenny"
                          className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm text-foreground font-medium outline-none focus:border-[#16A34A]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-muted-foreground uppercase">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="kenny@example.com"
                            className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm text-foreground font-medium outline-none focus:border-[#16A34A]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-muted-foreground uppercase">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="07777 787771"
                            className="w-full h-11 px-3 rounded-xl border border-border bg-background text-sm text-foreground font-medium outline-none focus:border-[#16A34A]"
                          />
                        </div>
                      </div>

                      {/* Duplicate Warning */}
                      {duplicateCustomer && (
                        <div className="flex items-center justify-between gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400 mt-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>
                              Customer already exists:{" "}
                              <strong>
                                {duplicateCustomer.firstName}{" "}
                                {duplicateCustomer.lastName || ""}
                              </strong>{" "}
                              (
                              {duplicateCustomer.phone ||
                                duplicateCustomer.email}
                              )
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectCustomer(duplicateCustomer)
                            }
                            className="underline font-bold hover:text-foreground shrink-0"
                          >
                            Select Existing
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SECTION 2: CUSTOMER HISTORY FOUND */}
                <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] dark:bg-emerald-950/20 dark:border-emerald-800/40 p-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#DCFCE7] dark:bg-emerald-900/50 flex items-center justify-center text-[#16A34A] shrink-0">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black tracking-wider uppercase text-foreground">
                          Customer History Found
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {selectedCustomer
                            ? recognizedDevicesCount > 0
                              ? `imoscan recognised ${recognizedDevicesCount} previous ${
                                  recognizedDevicesCount === 1
                                    ? "device"
                                    : "devices"
                                }`
                              : "No previous device records found for this customer"
                            : "Select a customer to view their previous devices & repairs"}
                        </p>
                      </div>
                    </div>

                    {/* Customer Info Grid */}
                    {selectedCustomer ? (
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#BBF7D0]/60 dark:border-emerald-800/30 text-xs">
                        <div>
                          <span className="text-muted-foreground font-semibold block text-[10px] uppercase">
                            Name
                          </span>
                          <span className="font-bold text-foreground truncate block">
                            {fullName || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-semibold block text-[10px] uppercase">
                            Email
                          </span>
                          <span className="font-bold text-foreground truncate block">
                            {email || "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-semibold block text-[10px] uppercase">
                            Phone
                          </span>
                          <span className="font-bold text-foreground truncate block">
                            {phone || "—"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-xs text-muted-foreground italic border-y border-[#BBF7D0]/40">
                        Search and select an existing customer from the dropdown
                        on the left.
                      </div>
                    )}

                    {/* Previous Repairs List */}
                    {previousRepairs.length > 0 && (
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Previous Repairs
                        </p>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                          {previousRepairs.slice(0, 3).map((repair) => (
                            <div
                              key={repair._id}
                              className="bg-card border border-border/80 rounded-xl p-2.5 flex items-center gap-3"
                            >
                              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0">
                                <Smartphone className="h-4 w-4 text-[#16A34A]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-foreground truncate">
                                  {repair.deviceModel} — {repair.description}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  Last repaired:{" "}
                                  {repair.createdAt
                                    ? format(
                                        new Date(repair.createdAt),
                                        "dd MMM yyyy",
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestion note at bottom */}
                  {previousRepairs.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] pt-2 mt-2 border-t border-[#BBF7D0]/50">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Suggested from previous repair records</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: SMART AUTO-FILL BANNER */}
              {showAutoFillBanner && (
                <div className="bg-[#F0FDF4] dark:bg-emerald-950/30 border border-[#86EFAC] dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in-50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#DCFCE7] dark:bg-emerald-900/50 flex items-center justify-center text-[#16A34A] shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black tracking-wider uppercase text-emerald-900 dark:text-emerald-200">
                        Smart Auto-Fill
                      </h4>
                      <p className="text-xs text-muted-foreground font-medium">
                        Customer, contact details, previous device and issue
                        have been filled from repair history. Review before
                        submitting.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowAutoFillBanner(false)}
                      className="h-9 px-4 rounded-xl font-bold bg-[#16A34A] hover:bg-[#15803d] text-white text-xs shadow-sm"
                    >
                      Use These Details
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearAutoFill}
                      className="h-9 px-4 rounded-xl font-semibold text-xs border-border bg-card"
                    >
                      Clear &amp; Enter New
                    </Button>
                  </div>
                </div>
              )}

              {/* MIDDLE ROW: SECTION 3 (DEVICE SELECTION) & SECTION 4 (ISSUE SELECTION) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* SECTION 3: DEVICE SELECTION */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground uppercase tracking-wider">
                      Device Selection
                    </span>
                    {/* Tabs */}
                    <div className="inline-flex rounded-full bg-muted/60 p-1 border border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setDeviceTab("previous");
                          if (recognizedDevices.length > 0) {
                            setDeviceModel(recognizedDevices[0]);
                            setIsDeviceRecognised(true);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                          deviceTab === "previous"
                            ? "bg-[#DCFCE7] text-[#16A34A] shadow-sm border border-[#86EFAC]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Previous Device
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeviceTab("different");
                          setIsDeviceRecognised(false);
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                          deviceTab === "different"
                            ? "bg-[#DCFCE7] text-[#16A34A] shadow-sm border border-[#86EFAC]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Different Device
                      </button>
                    </div>
                  </div>

                  {/* Device Input / Select */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Device Model
                      </label>
                      {isDeviceRecognised && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
                          Recognised from history
                        </span>
                      )}
                    </div>

                    {deviceTab === "previous" &&
                    recognizedDevices.length > 0 ? (
                      /* Custom Select for Recognized Devices */
                      <div className="relative" ref={deviceDropdownRef}>
                        <button
                          type="button"
                          onClick={() =>
                            setIsDeviceDropdownOpen((prev) => !prev)
                          }
                          className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-semibold flex items-center justify-between text-left outline-none focus:border-[#16A34A]"
                        >
                          <span className="truncate">
                            {deviceModel || "Select saved device"}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              isDeviceDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isDeviceDropdownOpen && (
                          <div className="absolute z-50 left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl p-1.5 space-y-1">
                            {recognizedDevices.map((dev) => (
                              <button
                                key={dev}
                                type="button"
                                onClick={() => {
                                  setDeviceModel(dev);
                                  setIsDeviceRecognised(true);
                                  setIsDeviceDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors flex items-center justify-between ${
                                  deviceModel === dev
                                    ? "bg-[#DCFCE7] text-[#16A34A]"
                                    : "hover:bg-muted text-foreground"
                                }`}
                              >
                                <span>{dev} — previous</span>
                                {deviceModel === dev && (
                                  <Check className="h-4 w-4 text-[#16A34A]" />
                                )}
                              </button>
                            ))}
                            <div className="border-t border-border pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setDeviceTab("different");
                                  setDeviceModel("");
                                  setIsDeviceRecognised(false);
                                  setIsDeviceDropdownOpen(false);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-muted-foreground hover:bg-muted"
                              >
                                Choose a different device
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeviceTab("different");
                                  setDeviceModel("");
                                  setIsDeviceRecognised(false);
                                  setIsDeviceDropdownOpen(false);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-left text-xs font-black text-[#16A34A] hover:bg-[#16A34A]/10 flex items-center gap-1.5"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add new device
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Text input for different or new device */
                      <input
                        value={deviceModel}
                        onChange={(e) => {
                          setDeviceModel(e.target.value);
                          setIsDeviceRecognised(false);
                        }}
                        required
                        placeholder="e.g. Samsung A06"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-semibold outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10"
                      />
                    )}
                  </div>
                </div>

                {/* SECTION 4: ISSUE SELECTION */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground uppercase tracking-wider">
                      Issue Selection
                    </span>
                    {/* Tabs */}
                    <div className="inline-flex rounded-full bg-muted/60 p-1 border border-border">
                      <button
                        type="button"
                        onClick={() => {
                          setIssueTab("previous");
                          if (recognizedIssues.length > 0) {
                            setSelectedProblem(recognizedIssues[0]);
                            setProblemDescription(recognizedIssues[0]);
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                          issueTab === "previous"
                            ? "bg-[#DCFCE7] text-[#16A34A] shadow-sm border border-[#86EFAC]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Previous Issue
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIssueTab("new");
                          setIsProblemDropdownOpen(true);
                        }}
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                          issueTab === "new"
                            ? "bg-[#DCFCE7] text-[#16A34A] shadow-sm border border-[#86EFAC]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        New Problem
                      </button>
                    </div>
                  </div>

                  {/* Issue Input / Select */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Select Problem
                    </label>

                    {issueTab === "previous" && recognizedIssues.length > 0 ? (
                      /* Custom Select for Recognized / Common Issues */
                      <div className="relative" ref={problemDropdownRef}>
                        <button
                          type="button"
                          onClick={() =>
                            setIsProblemDropdownOpen((prev) => !prev)
                          }
                          className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-semibold flex items-center justify-between text-left outline-none focus:border-[#16A34A]"
                        >
                          <span className="truncate">
                            {selectedProblem || "Select problem"}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform ${
                              isProblemDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isProblemDropdownOpen && (
                          <div className="absolute z-50 left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-xl p-1.5 max-h-64 overflow-y-auto space-y-1">
                            {recognizedIssues.map((issue) => (
                              <button
                                key={issue}
                                type="button"
                                onClick={() => {
                                  setSelectedProblem(issue);
                                  setProblemDescription(issue);
                                  setIsProblemDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors flex items-center justify-between ${
                                  selectedProblem === issue
                                    ? "bg-[#DCFCE7] text-[#16A34A]"
                                    : "hover:bg-muted text-foreground"
                                }`}
                              >
                                <span>{issue} — previous</span>
                                {selectedProblem === issue && (
                                  <Check className="h-4 w-4 text-[#16A34A]" />
                                )}
                              </button>
                            ))}
                            <div className="border-t border-border pt-1">
                              {STANDARD_PROBLEMS.filter(
                                (sp) => !recognizedIssues.includes(sp),
                              ).map((sp) => (
                                <button
                                  key={sp}
                                  type="button"
                                  onClick={() => {
                                    setSelectedProblem(sp);
                                    setProblemDescription(sp);
                                    setIsProblemDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors ${
                                    selectedProblem === sp
                                      ? "bg-muted font-bold text-foreground"
                                      : "hover:bg-muted text-foreground"
                                  }`}
                                >
                                  {sp}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Searchable problem combobox for new problems */
                      <div className="relative" ref={problemDropdownRef}>
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={problemSearch}
                          onChange={(e) => {
                            setProblemSearch(e.target.value);
                            setProblemDescription(e.target.value);
                            setSelectedProblem(e.target.value);
                            setIsProblemDropdownOpen(true);
                          }}
                          onFocus={() => setIsProblemDropdownOpen(true)}
                          className="w-full h-12 rounded-xl border border-border bg-background pl-11 pr-11 text-foreground font-semibold outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10"
                          placeholder="Search or select a problem"
                        />
                        <ChevronDown
                          className={`absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform ${
                            isProblemDropdownOpen ? "rotate-180" : ""
                          }`}
                        />

                        {isProblemDropdownOpen && (
                          <div className="absolute z-50 left-0 right-0 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-border bg-card p-1 shadow-xl">
                            {filteredProblemSuggestions.length > 0 ? (
                              filteredProblemSuggestions.map((description) => {
                                const isSelected =
                                  description === selectedProblem ||
                                  description === problemDescription;
                                return (
                                  <button
                                    key={description}
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => {
                                      setSelectedProblem(description);
                                      setProblemSearch(description);
                                      setProblemDescription(description);
                                      setIsProblemDropdownOpen(false);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted"
                                  >
                                    <Check
                                      className={`h-4 w-4 text-[#16A34A] shrink-0 ${
                                        isSelected ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    <span>{description}</span>
                                  </button>
                                );
                              })
                            ) : (
                              <div className="p-3 text-xs text-muted-foreground">
                                Press enter or click elsewhere to use this
                                custom problem.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: PRICE, IMEI, TECHNICIAN, PROBLEM DESCRIPTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-border/80">
                {/* PRICE */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="e.g. 150.00"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-semibold outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10"
                  />
                </div>

                {/* IMEI NUMBER */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    IMEI Number (Optional)
                  </label>
                  <input
                    value={imeiNumber}
                    onChange={(e) => setImeiNumber(e.target.value)}
                    placeholder="Enter IMEI"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-semibold outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10"
                  />
                </div>

                {/* TECHNICIAN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Technician
                  </label>
                  <select
                    value={technicianSelection}
                    onChange={(e) => {
                      setTechnicianSelection(e.target.value);
                      if (e.target.value !== ADD_NEW_TECHNICIAN) {
                        setNewTechnician("");
                      }
                    }}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-semibold outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10"
                  >
                    <option value="">
                      {isTechniciansLoading
                        ? "Loading..."
                        : "Select technician"}
                    </option>
                    {technicians.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value={ADD_NEW_TECHNICIAN}>
                      + Add new technician
                    </option>
                  </select>
                  {technicianSelection === ADD_NEW_TECHNICIAN && (
                    <input
                      value={newTechnician}
                      onChange={(e) => setNewTechnician(e.target.value)}
                      required
                      placeholder="Technician name"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs text-foreground font-medium outline-none focus:border-[#16A34A] mt-1"
                    />
                  )}
                </div>

                {/* PROBLEM DESCRIPTION */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Problem Description
                  </label>
                  <input
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    required
                    placeholder="Describe the issue in detail..."
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#16A34A]/10"
                  />
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full px-8 h-12 font-bold border-border"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createRepairRequest.isPending || createCustomer.isPending
                  }
                  className="rounded-full px-10 h-12 font-bold bg-[#16A34A] hover:bg-[#15803d] text-white shadow-lg shadow-[#16A34A]/25 hover:scale-[1.02] transition-all"
                >
                  {createRepairRequest.isPending || createCustomer.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
