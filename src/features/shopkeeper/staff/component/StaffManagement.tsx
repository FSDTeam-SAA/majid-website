"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Plus,
  ScanFace,
  Shield,
  Store,
  UsersRound,
  Wallet,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnrollReferenceFaceModal } from "./EnrollReferenceFaceModal";
import { AddStaffWizardModal } from "./AddStaffWizardModal";
import { StaffUser } from "../api/staff.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStaffList } from "../hooks/useStaff";
import { getMyShops } from "../../shop/api/shop.api";
import { useCurrency } from "@/hooks/useCurrency";

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

  return days.map((d) => d.slice(0, 3)).join(", ");
}

export default function StaffManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [enrollingStaff, setEnrollingStaff] = useState<StaffUser | null>(null);
  const { data: session } = useSession();
  const { data: staff = [], isLoading, isError } = useStaffList();
  const { data: shops = [] } = useQuery({
    queryKey: ["my-shops"],
    queryFn: getMyShops,
  });
  const { formatCurrency } = useCurrency();
  const shopkeeperId = (session?.user as { id?: string })?.id;

  const activeCount = useMemo(
    () => staff.filter((member) => member.isVerified).length,
    [staff],
  );

  return (
    <section className="min-h-full font-poppins space-y-6">
      {/* Top Module Header & Navigation (Matching Image 4) */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <UsersRound size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                Staff & Attendance
              </h1>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-muted-foreground">
                Manage your team, IDs, attendance, rota, wages and access.
              </p>
            </div>
          </div>
        </div>

        {/* Header Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-border pt-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs shadow-xs"
          >
            <UsersRound size={15} />
            Staff Members
          </button>
          <Link
            href="/shopkeeper/settings/nfc"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground font-bold text-xs hover:bg-muted transition-colors"
          >
            <Clock size={15} />
            Attendance (Live)
          </Link>
          <Link
            href="/shopkeeper/settings/staff/rota"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground font-bold text-xs hover:bg-muted transition-colors"
          >
            <CalendarDays size={15} />
            Rota / Shifts
          </Link>
          <Link
            href="/shopkeeper/settings/staff/wages"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground font-bold text-xs hover:bg-muted transition-colors"
          >
            <Wallet size={15} />
            Wages & Payroll
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground font-semibold text-xs opacity-70">
            <Shield size={15} />
            Access & Roles
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Action Header Banner */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-foreground">
              Staff Members
            </h2>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              Active staff credentials, store assignments, and biometrics.
            </p>
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 cursor-pointer"
          >
            <Plus size={18} />
            Add Staff Member
          </Button>
        </div>

        {/* Metric Cards */}
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
            <p className="mt-3 text-3xl font-black text-primary">
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

        {/* Staff Table */}
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
                    Attendance & Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={10} className="h-40 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
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
                    const imageUrl =
                      member.image?.url || member.referenceFaceUrl;
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
                            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-black text-primary border border-primary/20">
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
                                  <span className="font-mono text-primary font-extrabold bg-primary/15 px-1.5 py-0.5 rounded">
                                    {member.staffId}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {member.referenceFaceUrl ||
                                member.image?.url ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
                                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />{" "}
                                    Face Enrolled
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                                    No Face
                                  </span>
                                )}
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
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1 text-xs font-bold text-foreground">
                            <Store className="h-3.5 w-3.5 text-primary" />
                            {assignedShopName}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-black text-primary">
                            {member.jobRole || member.role || "Sales Executive"}
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
                                : "Wage not set"}
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
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
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
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {member.isVerified ? "Active" : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEnrollingStaff(member)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-black text-primary hover:bg-primary/20 transition-colors shadow-xs cursor-pointer"
                              title="Register or update biometric reference face"
                            >
                              <ScanFace className="h-3.5 w-3.5" />
                              Face ID
                            </button>
                            <Link
                              href={`/shopkeeper/staff/${member._id || member.id || "STF-4130"}`}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                            >
                              View Record →
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Enroll Reference Face Modal */}
      <EnrollReferenceFaceModal
        staff={enrollingStaff}
        isOpen={Boolean(enrollingStaff)}
        onClose={() => setEnrollingStaff(null)}
      />

      {/* Complete Multi-Step Add Staff Wizard Modal */}
      <AddStaffWizardModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        shopkeeperId={shopkeeperId}
        shops={shops}
      />
    </section>
  );
}
