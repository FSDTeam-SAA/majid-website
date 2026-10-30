"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Plus,
  Store,
  UsersRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { verifyStaffIdCardApi } from "../api/staff.api";
import { useCreateStaff, useStaffList } from "../hooks/useStaff";
import { getMyShops } from "../../shop/api/shop.api";
import { useCurrency } from "@/hooks/useCurrency";

type StaffFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  shopId: string;
  wageType: "per-day" | "per-hour";
  wageAmount: string;
  workingDays: string[];
  weekendDays: string[];
  idNumber: string;
  idVerificationStatus: "pending" | "verified" | "rejected";
};

const initialForm: StaffFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  shopId: "",
  wageType: "per-day",
  wageAmount: "",
  workingDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
  weekendDays: ["Friday", "Saturday"],
  idNumber: "",
  idVerificationStatus: "pending",
};

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getStaffName(staff: {
  firstName?: string;
  lastName?: string;
  name?: string;
}) {
  const name = [staff.firstName, staff.lastName].filter(Boolean).join(" ");
  return name || staff.name || "Unnamed Staff";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDays(days?: string[]) {
  if (!days || days.length === 0) {
    return "Not set";
  }

  return days.join(", ");
}

export default function StaffManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<StaffFormState>(initialForm);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  const { data: session } = useSession();
  const { data: staff = [], isLoading, isError } = useStaffList();
  const { data: shops = [] } = useQuery({
    queryKey: ["my-shops"],
    queryFn: getMyShops,
  });
  const { formatCurrency } = useCurrency();
  const createStaff = useCreateStaff();
  const shopkeeperId = (session?.user as { id?: string })?.id;

  const activeCount = useMemo(
    () => staff.filter((member) => member.isVerified).length,
    [staff],
  );

  const toggleSelection = (
    key: "workingDays" | "weekendDays",
    value: string,
  ) => {
    setForm((current) => {
      const exists = current[key].includes(value);

      return {
        ...current,
        [key]: exists
          ? current[key].filter((entry) => entry !== value)
          : [...current[key], value],
      };
    });
  };

  const handleVerifyIdCard = async () => {
    if (!idFrontFile) {
      toast.error("Please upload the front side of the ID card first.");
      return;
    }

    setIsVerifyingId(true);
    try {
      const response = await verifyStaffIdCardApi({
        frontFile: idFrontFile,
        backFile: idBackFile,
      });

      if (response.success && response.data?.isValid) {
        setForm((current) => ({
          ...current,
          idNumber: response.data?.nidNumber || "",
          idVerificationStatus: "verified",
        }));
        toast.success(response.message || "ID card verified successfully");
      } else {
        setForm((current) => ({
          ...current,
          idVerificationStatus: "rejected",
        }));
        toast.error(response.message || "ID card verification failed");
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Failed to verify ID card";
      toast.error(message);
    } finally {
      setIsVerifyingId(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!shopkeeperId) {
      toast.error(
        "Unable to determine shopkeeper ID. Please re-login and try again.",
      );
      return;
    }

    await createStaff.mutateAsync({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      shopkeeperId,
      shopId:
        form.shopId && form.shopId !== "all_default" ? form.shopId : undefined,
      wageType: form.wageType,
      wageAmount: form.wageAmount ? Number(form.wageAmount) : undefined,
      workingDays: form.workingDays,
      weekendDays: form.weekendDays,
      idVerificationStatus: form.idVerificationStatus,
      idNumber: form.idNumber.trim() || undefined,
    });

    setForm(initialForm);
    setIdFrontFile(null);
    setIdBackFile(null);
    setIsOpen(false);
  };

  return (
    <section className="min-h-full font-poppins">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#84CC16]/10 text-[#65A30D]">
                <UsersRound size={22} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                  Staff Management
                </h1>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  Add and manage staff members for your shop account.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            className="h-11 rounded-xl bg-[#84CC16] px-5 text-sm font-black text-white shadow-lg shadow-lime-500/20 hover:bg-[#76B814]"
          >
            <Plus size={18} />
            Add Staff Member
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Total Staff
            </p>
            <p className="mt-3 text-3xl font-black text-foreground">
              {staff.length}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Verified
            </p>
            <p className="mt-3 text-3xl font-black text-[#65A30D]">
              {activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Pending
            </p>
            <p className="mt-3 text-3xl font-black text-amber-600">
              {staff.length - activeCount}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface/80">
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Staff Name
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Email
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Assigned Store
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Job Role
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Wage Setup
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Working Days
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Weekend
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    ID Verification
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">
                    Attendance & Wages
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={11} className="h-40 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading staff...
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {isError && (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="h-40 text-center text-sm font-bold text-destructive"
                    >
                      Failed to load staff members.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && !isError && staff.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="h-44 text-center text-sm font-bold text-muted-foreground"
                    >
                      No staff members found.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  staff.map((member) => {
                    const name = getStaffName(member);
                    const imageUrl = member.image?.url;
                    const assignedShopName =
                      typeof member.shopId === "object" &&
                      member.shopId?.shopName
                        ? member.shopId.shopName
                        : typeof member.shop === "object" &&
                            member.shop?.shopName
                          ? member.shop.shopName
                          : shops.find((s) => s._id === member.shopId)
                              ?.shopName ||
                            (shops.length > 0 && member.shopId
                              ? "Custom Store"
                              : "Main Store");

                    return (
                      <TableRow
                        key={member._id || member.id || member.email}
                        className="hover:bg-surface/60"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#84CC16]/10 text-sm font-black text-[#65A30D]">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                getInitials(name)
                              )}
                            </div>
                            <div>
                              <p className="font-black text-foreground">
                                {name}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                {member.staffId && (
                                  <span className="font-mono text-[#65A30D] font-extrabold bg-[#84CC16]/15 px-1.5 py-0.5 rounded">
                                    {member.staffId}
                                  </span>
                                )}
                                <span>Staff Member</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <Mail size={15} />
                            {member.email}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <Phone size={15} />
                            {member.phone || "Not added"}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
                            <Store className="h-3.5 w-3.5 text-[#84CC16]" />
                            {assignedShopName}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                            Staff
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1 text-sm font-bold text-foreground">
                            <p className="capitalize">
                              {member.wageType
                                ? member.wageType.replace("-", " ")
                                : "Not set"}
                            </p>
                            <p className="text-xs text-muted-foreground font-semibold">
                              {member.wageAmount !== undefined &&
                              member.wageAmount !== null
                                ? `${formatCurrency(Number(member.wageAmount))} / ${
                                    member.wageType === "per-hour"
                                      ? "hour"
                                      : "day"
                                  }`
                                : "Wage amount not set"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <p className="text-sm font-bold text-muted-foreground">
                            {formatDays(member.workingDays)}
                          </p>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <p className="text-sm font-bold text-muted-foreground">
                            {formatDays(member.weekendDays)}
                          </p>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className={
                                member.idVerificationStatus === "verified"
                                  ? "border-[#84CC16]/30 bg-[#84CC16]/10 text-[#65A30D]"
                                  : member.idVerificationStatus === "rejected"
                                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                                    : "border-amber-300 bg-amber-50 text-amber-700"
                              }
                            >
                              {member.idVerificationStatus || "pending"}
                            </Badge>
                            <p className="text-xs font-semibold text-muted-foreground">
                              {member.idNumber || "No ID saved"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              member.isVerified
                                ? "bg-[#84CC16]/10 text-[#65A30D]"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {member.isVerified ? "Active" : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <Link
                            href={`/shopkeeper/staff/${member._id || member.id || "STF-4130"}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground hover:bg-[#84CC16]/10 hover:text-[#65A30D] transition-colors"
                          >
                            View Record →
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] sm:max-w-4xl p-0 border border-border/80 shadow-2xl rounded-2xl bg-card overflow-hidden flex flex-col">
          {/* Header banner */}
          <div className="shrink-0 bg-gradient-to-r from-surface via-surface to-[#84CC16]/10 p-6 border-b border-border">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#84CC16]/15 text-[#65A30D] border border-[#84CC16]/30 shadow-xs">
                <UsersRound size={24} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-foreground">
                  Add Staff Member
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Configure account credentials, wage rate, rota shifts, and
                  automated ID verification.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar"
          >
            {/* SECTION 1: Personal & Account Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#84CC16]/20 text-[#65A30D] text-xs font-black">
                  1
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Personal & Login Credentials
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="firstName"
                    className="text-xs font-bold text-foreground"
                  >
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    className="h-10 rounded-xl bg-surface border-border focus:border-[#84CC16] text-sm"
                    placeholder="e.g. Tariq"
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        firstName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="lastName"
                    className="text-xs font-bold text-foreground"
                  >
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    className="h-10 rounded-xl bg-surface border-border focus:border-[#84CC16] text-sm"
                    placeholder="e.g. Mahmood"
                    value={form.lastName}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        lastName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label
                    htmlFor="email"
                    className="text-xs font-bold text-foreground"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="h-10 pl-9 rounded-xl bg-surface border-border focus:border-[#84CC16] text-sm"
                      placeholder="tariq@example.com"
                      value={form.email}
                      onChange={(event) =>
                        setForm((value) => ({
                          ...value,
                          email: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-bold text-foreground"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="h-10 pl-9 rounded-xl bg-surface border-border focus:border-[#84CC16] text-sm"
                      value={form.phone}
                      onChange={(event) =>
                        setForm((value) => ({
                          ...value,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="+44 7123 456789"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold text-foreground"
                  >
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="h-10 rounded-xl bg-surface border-border focus:border-[#84CC16] text-sm"
                    value={form.password}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Min 6 characters"
                    minLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Store & Wage Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#84CC16]/20 text-[#65A30D] text-xs font-black">
                  2
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Store Assignment & Wage Rate
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label
                    htmlFor="shopId"
                    className="text-xs font-bold text-foreground"
                  >
                    Assigned Store
                  </Label>
                  <Select
                    value={form.shopId}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        shopId: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      id="shopId"
                      className="h-10 w-full rounded-xl bg-surface border-border text-sm"
                    >
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_default">
                        Main / Default Store
                      </SelectItem>
                      {shops.map((shop) => (
                        <SelectItem key={shop._id} value={shop._id}>
                          {shop.shopName} {shop.isDefault ? "(Main)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label
                    htmlFor="wageType"
                    className="text-xs font-bold text-foreground"
                  >
                    Wage Frequency
                  </Label>
                  <Select
                    value={form.wageType}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        wageType: value as StaffFormState["wageType"],
                      }))
                    }
                  >
                    <SelectTrigger
                      id="wageType"
                      className="h-10 w-full rounded-xl bg-surface border-border text-sm"
                    >
                      <SelectValue placeholder="Select wage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per-hour">Per Hour (£/hr)</SelectItem>
                      <SelectItem value="per-day">Per Day (£/day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label
                    htmlFor="wageAmount"
                    className="text-xs font-bold text-foreground"
                  >
                    Wage Amount (
                    {form.wageType === "per-hour" ? "£/hr" : "£/day"})
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-muted-foreground">
                      £
                    </span>
                    <Input
                      id="wageAmount"
                      type="number"
                      min={0}
                      step="0.01"
                      className="h-10 pl-8 rounded-xl bg-surface border-border focus:border-[#84CC16] text-sm font-semibold"
                      value={form.wageAmount}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          wageAmount: event.target.value,
                        }))
                      }
                      placeholder="e.g. 12.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Working Days & Weekends */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#84CC16]/20 text-[#65A30D] text-xs font-black">
                  3
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Weekly Schedule & Weekends
                </h3>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {/* Working Days Card */}
                <div className="rounded-2xl border border-border bg-surface/50 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#84CC16]/15 text-[#65A30D]">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                        Working Days ({form.workingDays.length})
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Click to toggle
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {weekDays.map((day) => {
                      const isSelected = form.workingDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleSelection("workingDays", day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? "bg-[#84CC16] text-white border-[#84CC16] shadow-xs"
                              : "bg-card text-muted-foreground border-border hover:border-[#84CC16]/40 hover:text-foreground"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Weekend Days Card */}
                <div className="rounded-2xl border border-border bg-surface/50 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                        Weekend Off-Days ({form.weekendDays.length})
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Click to toggle
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {weekDays.map((day) => {
                      const isSelected = form.weekendDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleSelection("weekendDays", day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                              : "bg-card text-muted-foreground border-border hover:border-amber-500/40 hover:text-foreground"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Staff ID Verification */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#84CC16]/20 text-[#65A30D] text-xs font-black">
                  4
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  ID Card Verification & Document Capture
                </h3>
              </div>

              <div className="rounded-2xl border border-border bg-surface/40 p-5 shadow-xs space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Front Upload Dropzone */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      ID Front Document (Driving Licence / Passport)
                    </Label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border hover:border-[#84CC16] rounded-xl bg-card cursor-pointer transition-colors text-center group">
                      <CreditCard className="h-6 w-6 text-muted-foreground group-hover:text-[#65A30D] mb-1.5 transition-colors" />
                      <span className="text-xs font-bold text-foreground truncate max-w-[220px]">
                        {idFrontFile
                          ? idFrontFile.name
                          : "Choose or drag front side"}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        PNG, JPG up to 10MB
                      </span>
                      <input
                        id="idFront"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          setIdFrontFile(event.target.files?.[0] || null)
                        }
                      />
                    </label>
                  </div>

                  {/* Back Upload Dropzone */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground">
                      ID Back Document (Optional)
                    </Label>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border hover:border-[#84CC16] rounded-xl bg-card cursor-pointer transition-colors text-center group">
                      <CreditCard className="h-6 w-6 text-muted-foreground group-hover:text-[#65A30D] mb-1.5 transition-colors" />
                      <span className="text-xs font-bold text-foreground truncate max-w-[220px]">
                        {idBackFile
                          ? idBackFile.name
                          : "Choose or drag back side"}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        PNG, JPG up to 10MB
                      </span>
                      <input
                        id="idBack"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          setIdBackFile(event.target.files?.[0] || null)
                        }
                      />
                    </label>
                  </div>
                </div>

                {/* ID Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyIdCard}
                      disabled={isVerifyingId}
                      className="h-10 rounded-xl border-border bg-card hover:bg-muted text-xs font-bold gap-2 text-foreground"
                    >
                      {isVerifyingId ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#65A30D]" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-[#65A30D]" />
                      )}
                      Verify with AI OCR
                    </Button>

                    <Badge
                      variant="outline"
                      className={`text-xs font-bold py-1 px-2.5 rounded-lg ${
                        form.idVerificationStatus === "verified"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : form.idVerificationStatus === "rejected"
                            ? "bg-red-500/10 text-red-600 border-red-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                      }`}
                    >
                      Status: {form.idVerificationStatus}
                    </Badge>
                  </div>

                  <div className="w-full sm:w-64">
                    <Input
                      className="h-10 rounded-xl bg-card border-border text-xs font-mono font-bold"
                      value={form.idNumber}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          idNumber: event.target.value,
                        }))
                      }
                      placeholder="Verified / Document ID"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="sticky bottom-0 bg-card/95 backdrop-blur-md -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:p-6 flex items-center justify-end gap-3 border-t border-border z-10">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-5 rounded-xl border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createStaff.isPending}
                className="h-11 px-6 rounded-xl bg-[#84CC16] hover:bg-[#74b513] text-white text-xs font-black shadow-md shadow-lime-500/20 cursor-pointer"
              >
                {createStaff.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Create Staff Member
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
