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
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateCustomer } from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useCreateRepairRequest } from "../hooks/useRepairRequest";
import { RepairRequest, Shopkeeper } from "../types/repair-request.types";

const dummyStaffOptions = [
  "Alex Morgan",
  "Jamie Carter",
  "Taylor Smith",
  "Riley Johnson",
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
  const [fullName, setFullName] = useState("");
  const [isFullNameEdited, setIsFullNameEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isPhoneEdited, setIsPhoneEdited] = useState(false);
  const [isEmailEdited, setIsEmailEdited] = useState(false);
  const [price, setPrice] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problemSearch, setProblemSearch] = useState("");
  const [isProblemSelectOpen, setIsProblemSelectOpen] = useState(false);
  const [imeiNumber, setImeiNumber] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [staff, setStaff] = useState("");
  const { data: session } = useSession();
  const { data: profileData } = useMyProfile();
  const user = profileData?.data;
  const isReassignMode = mode === "reassign";
  const shopkeeperId = (session?.user as { id?: string })?.id || "";

  const { data: repairProblemData } = useRepairProblem(user?._id || "");
  const createRepairRequest = useCreateRepairRequest();
  const createCustomer = useCreateCustomer();

  const profileFullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  useEffect(() => {
    if (!isOpen || !user) return;

    const timer = setTimeout(() => {
      if (!isFullNameEdited && fullName !== profileFullName) {
        setFullName(profileFullName);
      }
      if (!isEmailEdited && email !== (user.email || "")) {
        setEmail(user.email || "");
      }
      if (!isPhoneEdited && phone !== (user.phone || "")) {
        setPhone(user.phone || "");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    user,
    profileFullName,
    isFullNameEdited,
    isEmailEdited,
    isPhoneEdited,
    fullName,
    email,
    phone,
  ]);

  const problemSuggestions = useMemo(() => {
    const descriptions = repairProblemData?.data || [];

    return Array.from(
      new Set(
        descriptions
          .map((problem) => problem.description?.trim())
          .filter((description): description is string => Boolean(description)),
      ),
    );
  }, [repairProblemData?.data]);

  const filteredProblemSuggestions = useMemo(() => {
    const searchValue = problemSearch.trim().toLowerCase();

    if (!searchValue) return problemSuggestions;

    return problemSuggestions.filter((description) =>
      description.toLowerCase().includes(searchValue),
    );
  }, [problemSearch, problemSuggestions]);

  const handleProblemSelect = (description: string) => {
    setProblemSearch(description);
    setProblemDescription(description);
    setIsProblemSelectOpen(false);
  };

  const resetForm = () => {
    setDeviceModel("");
    setImeiNumber("");
    setPrice("");
    setProblemDescription("");
    setProblemSearch("");
    setStaff("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextDescription = problemDescription || problemSearch;
    const shouldCreateCustomer = createCustomerOnSubmit && !isReassignMode;

    if (shouldCreateCustomer && !shopkeeperId) {
      toast.error("Shopkeeper session not found");
      return;
    }

    try {
      await createRepairRequest.mutateAsync({
        firstName: isReassignMode ? repairRequest?.firstName || "" : fullName,
        email: isReassignMode ? repairRequest?.email || "" : email,
        phoneNumber: isReassignMode ? repairRequest?.phoneNumber || "" : phone,
        price: isReassignMode
          ? Number(repairRequest?.price || 0)
          : Number(price),
        deviceModel: isReassignMode
          ? repairRequest?.deviceModel || ""
          : deviceModel,
        IMEINumber: isReassignMode ? repairRequest?.IMEINumber : imeiNumber,
        description: nextDescription,
        staff,
        status: isReassignMode ? "reassigned" : undefined,
      });
    } catch {
      return;
    }

    if (shouldCreateCustomer) {
      const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/);

      try {
        await createCustomer.mutateAsync({
          firstName,
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
        toast.error(
          requestError.response?.data?.message ||
            "Repair request created, but the customer could not be saved",
        );
      }
    }

    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border sm:rounded-[32px] h-[80vh] overflow-y-scroll p-0 ">
        <div className="bg-primary/5 p-8 border-b border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground">
              {isReassignMode ? "Reassigned Repair Request" : "Repair Request"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              {isReassignMode
                ? "Please provide the new repair issue and staff assignment."
                : "Please provide details about your device and the issue you're facing."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!isReassignMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setIsFullNameEdited(true);
                  }}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setIsEmailEdited(true);
                  }}
                  required
                  type="email"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setIsPhoneEdited(true);
                  }}
                  required
                  type="tel"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="your phone number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Device Model
                </label>
                <input
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="e.g. iPhone 15 Pro"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Price
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="e.g. 150.00"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground uppercase tracking-wider">
                  IMEI Number (Optional)
                </label>
                <input
                  value={imeiNumber}
                  onChange={(e) => setImeiNumber(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Enter IMEI"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground uppercase tracking-wider">
              Select Problem
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={problemSearch}
                onChange={(e) => {
                  setProblemSearch(e.target.value);
                  setIsProblemSelectOpen(true);
                }}
                onFocus={() => setIsProblemSelectOpen(true)}
                onBlur={() => {
                  setTimeout(() => setIsProblemSelectOpen(false), 120);
                }}
                className="w-full h-12 rounded-xl border border-border bg-background pl-11 pr-11 text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Search or select a previous problem"
              />
              <ChevronDown
                className={`absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform ${
                  isProblemSelectOpen ? "rotate-180" : ""
                }`}
              />

              {isProblemSelectOpen && (
                <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl">
                  {filteredProblemSuggestions.length > 0 ? (
                    filteredProblemSuggestions.map((description) => {
                      const isSelected = description === problemDescription;

                      return (
                        <button
                          key={description}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleProblemSelect(description)}
                          className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-primary/10 focus:bg-primary/10 focus:outline-none"
                        >
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 text-primary ${
                              isSelected ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <span className="line-clamp-2">{description}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-3 text-sm font-medium text-muted-foreground">
                      No matching problem found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground uppercase tracking-wider">
              Technician
            </label>
            <select
              value={staff}
              onChange={(e) => setStaff(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Select staff</option>
              {dummyStaffOptions.map((staffName) => (
                <option key={staffName} value={staffName}>
                  {staffName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground uppercase tracking-wider">
              Problem Description
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              required
              rows={4}
              className="w-full p-4 rounded-xl border border-border bg-background text-foreground font-medium outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
              placeholder="Describe the issue in detail..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              disabled={
                createRepairRequest.isPending || createCustomer.isPending
              }
              className="rounded-full px-10 h-12 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all"
            >
              {createRepairRequest.isPending || createCustomer.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isReassignMode ? (
                "Reassigned"
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
