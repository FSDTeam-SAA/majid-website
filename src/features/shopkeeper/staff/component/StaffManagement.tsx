"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={10} className="h-40 text-center">
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
                      colSpan={10}
                      className="h-40 text-center text-sm font-bold text-destructive"
                    >
                      Failed to load staff members.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && !isError && staff.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
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
                              <p className="text-xs font-bold text-muted-foreground">
                                Staff Member
                              </p>
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
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Create a staff login with wage, working day, weekend, and ID
              verification setup.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
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
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
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

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+44..."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="shopId">Assigned store</Label>
                <Select
                  value={form.shopId}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      shopId: value,
                    }))
                  }
                >
                  <SelectTrigger id="shopId" className="w-full">
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

              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="wageType">Wage type</Label>
                <Select
                  value={form.wageType}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      wageType: value as StaffFormState["wageType"],
                    }))
                  }
                >
                  <SelectTrigger id="wageType" className="w-full">
                    <SelectValue placeholder="Select wage type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per-day">Per day</SelectItem>
                    <SelectItem value="per-hour">Per hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="wageAmount">Wage amount</Label>
                <Input
                  id="wageAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.wageAmount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      wageAmount: event.target.value,
                    }))
                  }
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#65A30D]" />
                  <h3 className="text-sm font-black text-foreground">
                    Working day setup
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {weekDays.map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-2 text-sm font-semibold text-foreground"
                    >
                      <Checkbox
                        checked={form.workingDays.includes(day)}
                        onCheckedChange={() =>
                          toggleSelection("workingDays", day)
                        }
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface/40 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[#65A30D]" />
                  <h3 className="text-sm font-black text-foreground">
                    Weekend options
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {weekDays.map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-2 text-sm font-semibold text-foreground"
                    >
                      <Checkbox
                        checked={form.weekendDays.includes(day)}
                        onCheckedChange={() =>
                          toggleSelection("weekendDays", day)
                        }
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#65A30D]" />
                <h3 className="text-sm font-black text-foreground">
                  Staff ID verification
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="idFront">ID front image</Label>
                  <Input
                    id="idFront"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setIdFrontFile(event.target.files?.[0] || null)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idBack">ID back image</Label>
                  <Input
                    id="idBack"
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setIdBackFile(event.target.files?.[0] || null)
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerifyIdCard}
                  disabled={isVerifyingId}
                >
                  {isVerifyingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Verify ID card
                </Button>
                <Badge variant="outline">
                  Status: {form.idVerificationStatus}
                </Badge>
                <Input
                  className="max-w-xs"
                  value={form.idNumber}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      idNumber: event.target.value,
                    }))
                  }
                  placeholder="Verified ID number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((value) => ({
                    ...value,
                    password: event.target.value,
                  }))
                }
                minLength={6}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createStaff.isPending}
                className="bg-[#84CC16] font-black text-white hover:bg-[#76B814]"
              >
                {createStaff.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Create Staff
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
